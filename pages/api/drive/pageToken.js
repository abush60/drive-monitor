import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getDriveClient, getStartPageToken } from '../../../lib/driveClient';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session || !session.accessToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const drive = getDriveClient(session.accessToken);
        const pageToken = await getStartPageToken(drive);

        return res.status(200).json({
            success: true,
            pageToken,
        });
    } catch (error) {
        console.error('ページトークン取得エラー:', error);
        return res.status(500).json({ error: error.message });
    }
}
