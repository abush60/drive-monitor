import { getDriveClient, watchFolder, stopWatch } from './driveClient';

/**
 * Webhook管理クラス
 */
class WebhookManager {
    constructor() {
        this.activeChannels = new Map(); // channelId -> { resourceId, expiration, folderId }
    }

    /**
     * フォルダの監視を開始
     * @param {string} accessToken - アクセストークン
     * @param {string} projectId - プロジェクトID
     * @param {string} folderId - フォルダID
     * @param {string} webhookUrl - Webhook URL
     * @returns {Promise<object>} - チャンネル情報
     */
    async startWatch(accessToken, projectId, folderId, webhookUrl) {
        const channelId = `${projectId}-${Date.now()}`;
        const drive = getDriveClient(accessToken);

        try {
            const channelInfo = await watchFolder(drive, folderId, channelId, webhookUrl);

            // チャンネル情報を保存
            this.activeChannels.set(channelId, {
                resourceId: channelInfo.resourceId,
                expiration: channelInfo.expiration,
                folderId: folderId,
                projectId: projectId,
            });

            // LocalStorageに保存（クライアント側で処理）
            return {
                channelId,
                resourceId: channelInfo.resourceId,
                expiration: channelInfo.expiration,
            };
        } catch (error) {
            console.error('監視の開始に失敗:', error);
            throw error;
        }
    }

    /**
     * フォルダの監視を停止
     * @param {string} accessToken - アクセストークン
     * @param {string} channelId - チャンネルID
     * @returns {Promise<void>}
     */
    async stopWatch(accessToken, channelId) {
        const channelInfo = this.activeChannels.get(channelId);

        if (!channelInfo) {
            throw new Error('チャンネルが見つかりません');
        }

        const drive = getDriveClient(accessToken);

        try {
            await stopWatch(drive, channelId, channelInfo.resourceId);
            this.activeChannels.delete(channelId);
        } catch (error) {
            console.error('監視の停止に失敗:', error);
            throw error;
        }
    }

    /**
     * チャンネルの有効期限をチェックして更新
     * @param {string} accessToken - アクセストークン
     * @param {string} webhookUrl - Webhook URL
     * @returns {Promise<void>}
     */
    async checkAndRenewChannels(accessToken, webhookUrl) {
        const now = Date.now();
        const renewalThreshold = 24 * 60 * 60 * 1000; // 24時間前に更新

        for (const [channelId, channelInfo] of this.activeChannels.entries()) {
            const timeUntilExpiration = parseInt(channelInfo.expiration) - now;

            // 有効期限が24時間以内の場合は更新
            if (timeUntilExpiration < renewalThreshold) {
                try {
                    // 古いチャンネルを停止
                    await this.stopWatch(accessToken, channelId);

                    // 新しいチャンネルを作成
                    await this.startWatch(
                        accessToken,
                        channelInfo.projectId,
                        channelInfo.folderId,
                        webhookUrl
                    );
                } catch (error) {
                    console.error('チャンネルの更新に失敗:', channelId, error);
                }
            }
        }
    }

    /**
     * プロジェクトに紐づくチャンネルを取得
     * @param {string} projectId - プロジェクトID
     * @returns {Array} - チャンネル情報の配列
     */
    getChannelsByProject(projectId) {
        const channels = [];

        for (const [channelId, channelInfo] of this.activeChannels.entries()) {
            if (channelInfo.projectId === projectId) {
                channels.push({
                    channelId,
                    ...channelInfo,
                });
            }
        }

        return channels;
    }

    /**
     * すべてのチャンネルを取得
     * @returns {Array} - チャンネル情報の配列
     */
    getAllChannels() {
        const channels = [];

        for (const [channelId, channelInfo] of this.activeChannels.entries()) {
            channels.push({
                channelId,
                ...channelInfo,
            });
        }

        return channels;
    }
}

// シングルトンインスタンス
let webhookManagerInstance = null;

export function getWebhookManager() {
    if (!webhookManagerInstance) {
        webhookManagerInstance = new WebhookManager();
    }
    return webhookManagerInstance;
}
