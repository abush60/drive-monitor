/**
 * Google Drive Webhook受信エンドポイント
 * Googleからの変更通知を受信します
 */
export default async function handler(req, res) {
    // Google Drive APIはPOSTリクエストで通知を送信
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Webhookヘッダーから情報を取得
        const channelId = req.headers['x-goog-channel-id'];
        const resourceState = req.headers['x-goog-resource-state'];
        const resourceId = req.headers['x-goog-resource-id'];

        console.log('Webhook受信:', {
            channelId,
            resourceState,
            resourceId,
            timestamp: new Date().toISOString(),
        });

        // 'sync'は初期同期（無視してOK）
        if (resourceState === 'sync') {
            return res.status(200).json({ received: true, type: 'sync' });
        }

        // 変更通知の場合
        if (resourceState === 'change') {
            // クライアント側で変更を取得するためのイベントを発火
            // 実際のアプリケーションでは、WebSocketやServer-Sent Events等を使用
            // ここでは、クライアント側が定期的にポーリングして変更を取得する想定

            console.log('変更を検知:', { channelId, resourceId });
        }

        return res.status(200).json({ received: true, type: resourceState });
    } catch (error) {
        console.error('Webhook処理エラー:', error);
        return res.status(500).json({ error: error.message });
    }
}
