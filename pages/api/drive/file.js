import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getDriveClient } from '../../../lib/driveClient';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session || !session.accessToken) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: '認証が必要です'
            });
        }

        const { fileId } = req.query;

        if (!fileId) {
            return res.status(400).json({
                success: false,
                error: 'fileId is required',
                message: 'ファイルIDが指定されていません'
            });
        }

        const drive = getDriveClient(session.accessToken);

        // ファイルのメタデータを取得
        const fileMetadata = await drive.files.get({
            fileId: fileId,
            fields: 'id, name, mimeType, webContentLink, webViewLink, trashed',
        });

        // ファイルが削除されている場合
        if (fileMetadata.data.trashed) {
            return res.status(404).json({
                success: false,
                error: 'File is trashed',
                message: 'このファイルは削除されています'
            });
        }

        return res.status(200).json({
            success: true,
            file: fileMetadata.data,
        });
    } catch (error) {
        console.error('ファイル情報取得エラー:', error);

        // Google Drive APIのエラーを詳細に返す
        if (error.code === 404) {
            return res.status(404).json({
                success: false,
                error: 'File not found',
                message: 'ファイルが見つかりません'
            });
        }

        if (error.code === 403) {
            return res.status(403).json({
                success: false,
                error: 'Permission denied',
                message: 'ファイルへのアクセス権限がありません'
            });
        }

        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'ファイル情報の取得に失敗しました'
        });
    }
}
