import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { processWebhookNotification } from '../../../lib/changeProcessor';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session || !session.accessToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { pageToken, projectId, folderId } = req.query;

        if (!pageToken || !projectId || !folderId) {
            return res.status(400).json({ error: 'pageToken, projectId, and folderId are required' });
        }

        const result = await processWebhookNotification(
            session.accessToken,
            pageToken,
            projectId,
            folderId
        );

        return res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error('変更取得エラー:', error);
        return res.status(500).json({ error: error.message });
    }
}
