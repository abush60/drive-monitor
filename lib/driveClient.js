import { google } from 'googleapis';

/**
 * Google Drive APIクライアントを初期化
 * @param {string} accessToken - OAuth2アクセストークン
 * @returns {object} - Drive APIクライアント
 */
export function getDriveClient(accessToken) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    return google.drive({ version: 'v3', auth: oauth2Client });
}

/**
 * Google DriveのURLからフォルダIDを抽出
 * @param {string} url - Google DriveのURL
 * @returns {string|null} - フォルダID
 */
export function extractFolderIdFromUrl(url) {
    const patterns = [
        /\/folders\/([a-zA-Z0-9_-]+)/,
        /id=([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }

    return null;
}

/**
 * フォルダの階層構造を取得
 * @param {object} drive - Drive APIクライアント
 * @param {string} folderId - フォルダID
 * @returns {Promise<object>} - フォルダ階層
 */
export async function getFolderHierarchy(drive, folderId) {
    try {
        // フォルダ情報を取得
        const folderResponse = await drive.files.get({
            fileId: folderId,
            fields: 'id, name, mimeType, modifiedTime, owners',
        });

        const folder = folderResponse.data;

        // フォルダでない場合はエラー
        if (folder.mimeType !== 'application/vnd.google-apps.folder') {
            throw new Error('指定されたIDはフォルダではありません');
        }

        // 子フォルダとファイルを取得
        const childrenResponse = await drive.files.list({
            q: `'${folderId}' in parents and trashed=false`,
            fields: 'files(id, name, mimeType, modifiedTime, owners, size)',
            orderBy: 'folder,name',
        });

        const children = [];
        const files = [];

        // フォルダとファイルを分離
        for (const child of childrenResponse.data.files) {
            if (child.mimeType === 'application/vnd.google-apps.folder') {
                // 再帰的に子フォルダの階層を取得
                const childHierarchy = await getFolderHierarchy(drive, child.id);
                children.push(childHierarchy);
            } else {
                // ファイル情報を追加
                files.push({
                    id: child.id,
                    name: child.name,
                    mimeType: child.mimeType,
                    modifiedTime: child.modifiedTime,
                    owner: child.owners ? child.owners[0].displayName : 'Unknown',
                    size: child.size || 0,
                });
            }
        }

        return {
            id: folder.id,
            name: folder.name,
            modifiedTime: folder.modifiedTime,
            owner: folder.owners ? folder.owners[0].displayName : 'Unknown',
            children,
            files,
        };
    } catch (error) {
        console.error('フォルダ階層の取得に失敗:', error);
        throw error;
    }
}

/**
 * フォルダの変更を監視（Push通知を登録）
 * @param {object} drive - Drive APIクライアント
 * @param {string} folderId - 監視するフォルダID
 * @param {string} channelId - チャンネルID（ユニーク）
 * @param {string} webhookUrl - Webhook URL
 * @returns {Promise<object>} - チャンネル情報
 */
export async function watchFolder(drive, folderId, channelId, webhookUrl) {
    try {
        const response = await drive.files.watch({
            fileId: folderId,
            requestBody: {
                id: channelId,
                type: 'web_hook',
                address: webhookUrl,
                expiration: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7日間
            },
        });

        return response.data;
    } catch (error) {
        console.error('Push通知の登録に失敗:', error);
        throw error;
    }
}

/**
 * Push通知を停止
 * @param {object} drive - Drive APIクライアント
 * @param {string} channelId - チャンネルID
 * @param {string} resourceId - リソースID
 * @returns {Promise<void>}
 */
export async function stopWatch(drive, channelId, resourceId) {
    try {
        await drive.channels.stop({
            requestBody: {
                id: channelId,
                resourceId: resourceId,
            },
        });
    } catch (error) {
        console.error('Push通知の停止に失敗:', error);
        throw error;
    }
}

/**
 * 変更リストを取得
 * @param {object} drive - Drive APIクライアント
 * @param {string} pageToken - ページトークン
 * @returns {Promise<object>} - 変更リスト
 */
export async function getChanges(drive, pageToken) {
    try {
        const response = await drive.changes.list({
            pageToken: pageToken,
            fields: 'changes(fileId, file(id, name, mimeType, modifiedTime, trashed, parents), removed), newStartPageToken, nextPageToken',
        });

        return response.data;
    } catch (error) {
        console.error('変更リストの取得に失敗:', error);
        throw error;
    }
}

/**
 * スタートページトークンを取得
 * @param {object} drive - Drive APIクライアント
 * @returns {Promise<string>} - スタートページトークン
 */
export async function getStartPageToken(drive) {
    try {
        const response = await drive.changes.getStartPageToken();
        return response.data.startPageToken;
    } catch (error) {
        console.error('スタートページトークンの取得に失敗:', error);
        throw error;
    }
}
