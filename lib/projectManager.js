/**
 * プロジェクトデータの構造
 * {
 *   id: string,
 *   name: string,
 *   driveUrl: string,
 *   folderId: string,
 *   createdAt: number,
 *   pageToken: string,
 *   channelId: string,
 *   channelResourceId: string,
 *   channelExpiration: string,
 *   userId: string, // ユーザーID
 * }
 */

const STORAGE_KEY_PREFIX = 'drive-monitor-projects';

/**
 * ユーザー別のストレージキーを取得
 * @param {string} userId - ユーザーID
 * @returns {string} - ストレージキー
 */
function getStorageKey(userId) {
    if (!userId) return STORAGE_KEY_PREFIX; // フォールバック
    return `${STORAGE_KEY_PREFIX}-${userId}`;
}

/**
 * すべてのプロジェクトを取得
 * @param {string} userId - ユーザーID
 * @returns {Array} - プロジェクトの配列
 */
export function getAllProjects(userId) {
    if (typeof window === 'undefined') return [];

    try {
        const key = getStorageKey(userId);
        return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (error) {
        console.error('プロジェクトの読み込みに失敗:', error);
        return [];
    }
}

/**
 * プロジェクトを取得
 * @param {string} projectId - プロジェクトID
 * @param {string} userId - ユーザーID
 * @returns {object|null} - プロジェクト
 */
export function getProject(projectId, userId) {
    const projects = getAllProjects(userId);
    return projects.find(p => p.id === projectId) || null;
}

/**
 * プロジェクトを作成
 * @param {string} name - プロジェクト名
 * @param {string} driveUrl - Google DriveのURL
 * @param {string} folderId - フォルダID
 * @param {string} userId - ユーザーID
 * @returns {object} - 作成されたプロジェクト
 */
export function createProject(name, driveUrl, folderId, userId) {
    if (typeof window === 'undefined') return null;

    const project = {
        id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: name || `プロジェクト ${new Date().toLocaleDateString()}`,
        driveUrl,
        folderId,
        userId,
        createdAt: Date.now(),
        pageToken: null,
        channelId: null,
        channelResourceId: null,
        channelExpiration: null,
    };

    const projects = getAllProjects(userId);
    projects.push(project);

    try {
        const key = getStorageKey(userId);
        localStorage.setItem(key, JSON.stringify(projects));
        return project;
    } catch (error) {
        console.error('プロジェクトの作成に失敗:', error);
        return null;
    }
}

/**
 * プロジェクトを更新
 * @param {string} projectId - プロジェクトID
 * @param {object} updates - 更新内容
 * @param {string} userId - ユーザーID
 * @returns {object|null} - 更新されたプロジェクト
 */
export function updateProject(projectId, updates, userId) {
    if (typeof window === 'undefined') return null;

    const projects = getAllProjects(userId);
    const index = projects.findIndex(p => p.id === projectId);

    if (index === -1) {
        return null;
    }

    projects[index] = { ...projects[index], ...updates };

    try {
        const key = getStorageKey(userId);
        localStorage.setItem(key, JSON.stringify(projects));
        return projects[index];
    } catch (error) {
        console.error('プロジェクトの更新に失敗:', error);
        return null;
    }
}

/**
 * プロジェクトを削除
 * @param {string} projectId - プロジェクトID
 * @param {string} userId - ユーザーID
 * @returns {boolean} - 成功したかどうか
 */
export function deleteProject(projectId, userId) {
    if (typeof window === 'undefined') return false;

    const projects = getAllProjects(userId);
    const filtered = projects.filter(p => p.id !== projectId);

    try {
        const key = getStorageKey(userId);
        localStorage.setItem(key, JSON.stringify(filtered));

        // プロジェクトに紐づくログも削除
        const logsKey = `drive-monitor-logs-${projectId}`;
        localStorage.removeItem(logsKey);

        return true;
    } catch (error) {
        console.error('プロジェクトの削除に失敗:', error);
        return false;
    }
}

/**
 * プロジェクト名でフィルタリング
 * @param {string} query - 検索クエリ
 * @param {string} userId - ユーザーID
 * @returns {Array} - フィルタリングされたプロジェクト
 */
export function searchProjects(query, userId) {
    const projects = getAllProjects(userId);

    if (!query) {
        return projects;
    }

    const lowerQuery = query.toLowerCase();

    return projects.filter(project => {
        return project.name.toLowerCase().includes(lowerQuery);
    });
}
