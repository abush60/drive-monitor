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
 * }
 */

const STORAGE_KEY = 'drive-monitor-projects';

/**
 * すべてのプロジェクトを取得
 * @returns {Array} - プロジェクトの配列
 */
export function getAllProjects() {
    if (typeof window === 'undefined') return [];

    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (error) {
        console.error('プロジェクトの読み込みに失敗:', error);
        return [];
    }
}

/**
 * プロジェクトを取得
 * @param {string} projectId - プロジェクトID
 * @returns {object|null} - プロジェクト
 */
export function getProject(projectId) {
    const projects = getAllProjects();
    return projects.find(p => p.id === projectId) || null;
}

/**
 * プロジェクトを作成
 * @param {string} name - プロジェクト名
 * @param {string} driveUrl - Google DriveのURL
 * @param {string} folderId - フォルダID
 * @returns {object} - 作成されたプロジェクト
 */
export function createProject(name, driveUrl, folderId) {
    if (typeof window === 'undefined') return null;

    const project = {
        id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: name || `プロジェクト ${new Date().toLocaleDateString()}`,
        driveUrl,
        folderId,
        createdAt: Date.now(),
        pageToken: null,
        channelId: null,
        channelResourceId: null,
        channelExpiration: null,
    };

    const projects = getAllProjects();
    projects.push(project);

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
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
 * @returns {object|null} - 更新されたプロジェクト
 */
export function updateProject(projectId, updates) {
    if (typeof window === 'undefined') return null;

    const projects = getAllProjects();
    const index = projects.findIndex(p => p.id === projectId);

    if (index === -1) {
        return null;
    }

    projects[index] = { ...projects[index], ...updates };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        return projects[index];
    } catch (error) {
        console.error('プロジェクトの更新に失敗:', error);
        return null;
    }
}

/**
 * プロジェクトを削除
 * @param {string} projectId - プロジェクトID
 * @returns {boolean} - 成功したかどうか
 */
export function deleteProject(projectId) {
    if (typeof window === 'undefined') return false;

    const projects = getAllProjects();
    const filtered = projects.filter(p => p.id !== projectId);

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

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
 * @returns {Array} - フィルタリングされたプロジェクト
 */
export function searchProjects(query) {
    const projects = getAllProjects();

    if (!query) {
        return projects;
    }

    const lowerQuery = query.toLowerCase();

    return projects.filter(project => {
        return project.name.toLowerCase().includes(lowerQuery);
    });
}
