import { getDriveClient, getChanges } from './driveClient';

/**
 * 変更の種類を判定
 * @param {object} change - 変更オブジェクト
 * @returns {string} - 変更種別（upload, change, delete）
 */
function determineChangeType(change) {
    if (change.removed || (change.file && change.file.trashed)) {
        return 'delete';
    }

    // 新規作成か更新かを判定するには、以前の状態と比較する必要がある
    // ここでは簡略化して、すべて 'upload' として扱う
    // 実際のアプリケーションでは、LocalStorageに保存された状態と比較する
    return 'upload';
}

/**
 * 変更を処理してログを作成
 * @param {object} change - 変更オブジェクト
 * @param {string} owner - オーナー名
 * @returns {object} - 変更ログ
 */
function processChange(change, owner) {
    const changeType = determineChangeType(change);

    return {
        id: `${change.fileId}-${Date.now()}`,
        fileId: change.fileId,
        fileName: change.file ? change.file.name : '不明',
        changeType: changeType,
        modifiedTime: change.file ? change.file.modifiedTime : new Date().toISOString(),
        owner: owner,
        timestamp: Date.now(),
    };
}

/**
 * ファイルが指定フォルダの配下にあるかチェック
 * @param {object} file - ファイルオブジェクト
 * @param {string} targetFolderId - 監視対象フォルダID
 * @param {object} drive - Driveクライアント
 * @returns {Promise<boolean>} - フォルダ配下にあるか
 */
async function isFileInFolder(file, targetFolderId, drive) {
    if (!file || !file.parents) return false;

    // 親フォルダIDのリストをチェック
    for (const parentId of file.parents) {
        if (parentId === targetFolderId) {
            return true;
        }

        // 親フォルダを再帰的にチェック（最大5階層まで）
        try {
            const parent = await drive.files.get({
                fileId: parentId,
                fields: 'id, parents',
            });

            if (parent.data.parents) {
                for (const grandParentId of parent.data.parents) {
                    if (grandParentId === targetFolderId) {
                        return true;
                    }
                }
            }
        } catch (error) {
            // 親フォルダの取得に失敗した場合は無視
            console.error('親フォルダの取得に失敗:', error);
        }
    }

    return false;
}

/**
 * Webhookからの変更通知を処理
 * @param {string} accessToken - アクセストークン
 * @param {string} pageToken - ページトークン
 * @param {string} projectId - プロジェクトID
 * @param {string} folderId - 監視対象フォルダID
 * @returns {Promise<object>} - 処理結果
 */
export async function processWebhookNotification(accessToken, pageToken, projectId, folderId) {
    const drive = getDriveClient(accessToken);

    try {
        const changesData = await getChanges(drive, pageToken);
        const changes = changesData.changes || [];

        // 変更をログに変換（指定フォルダ配下のファイルのみ）
        const logs = [];

        for (const change of changes) {
            // 削除されたファイルまたはファイル情報がない場合はスキップ
            if (change.removed || !change.file) continue;

            // フォルダは除外（ファイルのみ）
            if (change.file.mimeType === 'application/vnd.google-apps.folder') continue;

            // 指定フォルダ配下のファイルかチェック
            const isInFolder = await isFileInFolder(change.file, folderId, drive);
            if (!isInFolder) continue;

            const owner = change.file.owners ? change.file.owners[0].displayName : 'Unknown';
            logs.push(processChange(change, owner));
        }

        return {
            logs,
            newPageToken: changesData.newStartPageToken || changesData.nextPageToken,
            hasMore: !!changesData.nextPageToken,
        };
    } catch (error) {
        console.error('変更の処理に失敗:', error);
        throw error;
    }
}

/**
 * 変更ログをLocalStorageに保存する
 * （クライアント側で実行される関数）
 * @param {string} projectId - プロジェクトID
 * @param {Array} logs - 変更ログの配列
 */
export function saveChangeLogs(projectId, logs) {
    if (typeof window === 'undefined') return;

    try {
        const key = `drive-monitor-logs-${projectId}`;
        const existingLogs = JSON.parse(localStorage.getItem(key) || '[]');

        // 新しいログを追加（最新が先頭）
        const updatedLogs = [...logs, ...existingLogs];

        // 最大1000件まで保存
        const trimmedLogs = updatedLogs.slice(0, 1000);

        localStorage.setItem(key, JSON.stringify(trimmedLogs));
    } catch (error) {
        console.error('ログの保存に失敗:', error);
    }
}

/**
 * 変更ログをLocalStorageから読み込む
 * （クライアント側で実行される関数）
 * @param {string} projectId - プロジェクトID
 * @returns {Array} - 変更ログの配列
 */
export function loadChangeLogs(projectId) {
    if (typeof window === 'undefined') return [];

    try {
        const key = `drive-monitor-logs-${projectId}`;
        return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (error) {
        console.error('ログの読み込みに失敗:', error);
        return [];
    }
}

/**
 * 変更ログをフィルタリング
 * @param {Array} logs - 変更ログの配列
 * @param {string} filter - フィルター（'all', 'upload', 'change', 'delete'）
 * @returns {Array} - フィルタリングされたログ
 */
export function filterChangeLogs(logs, filter) {
    if (filter === 'all') {
        return logs;
    }

    return logs.filter(log => log.changeType === filter);
}

/**
 * 変更ログを検索
 * @param {Array} logs - 変更ログの配列
 * @param {string} query - 検索クエリ
 * @returns {Array} - 検索結果
 */
export function searchChangeLogs(logs, query) {
    if (!query) {
        return logs;
    }

    const lowerQuery = query.toLowerCase();

    return logs.filter(log => {
        return (
            log.fileName.toLowerCase().includes(lowerQuery) ||
            log.owner.toLowerCase().includes(lowerQuery)
        );
    });
}
