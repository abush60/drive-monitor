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
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { fileId } = req.query;

        if (!fileId) {
            return res.status(400).json({ error: 'fileId is required' });
        }

        const drive = getDriveClient(session.accessToken);

        // ファイルのメタデータを取得
        const fileMetadata = await drive.files.get({
            fileId: fileId,
            fields: 'id, name, mimeType, webContentLink, webViewLink',
        });

        return res.status(200).json({
            success: true,
            file: fileMetadata.data,
        });
    } catch (error) {
        console.error('ファイル情報取得エラー:', error);
        return res.status(500).json({ error: error.message });
    }
}
