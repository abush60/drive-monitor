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

        const { pageToken, projectId } = req.query;

        if (!pageToken || !projectId) {
            return res.status(400).json({ error: 'pageToken and projectId are required' });
        }

        const result = await processWebhookNotification(
            session.accessToken,
            pageToken,
            projectId
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
