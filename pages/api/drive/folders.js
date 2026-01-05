import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getDriveClient, getFolderHierarchy, extractFolderIdFromUrl } from '../../../lib/driveClient';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session || !session.accessToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // URLからフォルダIDを抽出
        const folderId = extractFolderIdFromUrl(url);

        if (!folderId) {
            return res.status(400).json({ error: 'Invalid Google Drive URL' });
        }

        const drive = getDriveClient(session.accessToken);
        const hierarchy = await getFolderHierarchy(drive, folderId);

        return res.status(200).json({
            success: true,
            folderId,
            hierarchy,
        });
    } catch (error) {
        console.error('フォルダ階層の取得エラー:', error);
        return res.status(500).json({ error: error.message });
    }
}
