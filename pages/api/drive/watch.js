import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getWebhookManager } from '../../../lib/webhookManager';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session || !session.accessToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { projectId, folderId } = req.body;

        if (!projectId || !folderId) {
            return res.status(400).json({ error: 'projectId and folderId are required' });
        }

        const webhookUrl = process.env.WEBHOOK_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/drive/webhook`;
        const webhookManager = getWebhookManager();

        const channelInfo = await webhookManager.startWatch(
            session.accessToken,
            projectId,
            folderId,
            webhookUrl
        );

        return res.status(200).json({
            success: true,
            channelInfo,
        });
    } catch (error) {
        console.error('Watch登録エラー:', error);
        return res.status(500).json({ error: error.message });
    }
}
