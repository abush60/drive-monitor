import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../components/Layout';
import ProjectCardView from '../components/ProjectCardView';
import UrlInput from '../components/UrlInput';
import DriveSheet from '../components/DriveSheet';
import UpdateLog from '../components/UpdateLog';
import { createProject, updateProject, getProject, getAllProjects } from '../lib/projectManager';

// セッション状態を保存
const saveSessionState = (state) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('drive-monitor-session', JSON.stringify(state));
    } catch (error) {
        console.error('セッション状態の保存に失敗:', error);
    }
};

// セッション状態を読み込み
const loadSessionState = () => {
    if (typeof window === 'undefined') return null;
    try {
        const saved = localStorage.getItem('drive-monitor-session');
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error('セッション状態の読み込みに失敗:', error);
        return null;
    }
};

// 変更ログを保存
const saveChangeLogs = (projectId, logs) => {
    if (typeof window === 'undefined' || !projectId) return;
    try {
        const key = `drive-monitor-logs-${projectId}`;
        localStorage.setItem(key, JSON.stringify(logs));
    } catch (error) {
        console.error('ログの保存に失敗:', error);
    }
};

// 変更ログを読み込み
const loadChangeLogs = (projectId) => {
    if (typeof window === 'undefined' || !projectId) return [];
    try {
        const key = `drive-monitor-logs-${projectId}`;
        return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (error) {
        console.error('ログの読み込みに失敗:', error);
        return [];
    }
};

// 階層を保存
const saveHierarchy = (projectId, hierarchy) => {
    if (typeof window === 'undefined' || !projectId) return;
    try {
        const key = `drive-monitor-hierarchy-${projectId}`;
        localStorage.setItem(key, JSON.stringify(hierarchy));
    } catch (error) {
        console.error('階層の保存に失敗:', error);
    }
};

// 階層を読み込み
const loadHierarchy = (projectId) => {
    if (typeof window === 'undefined' || !projectId) return null;
    try {
        const key = `drive-monitor-hierarchy-${projectId}`;
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error('階層の読み込みに失敗:', error);
        return null;
    }
};

export default function Home() {
    const { data: session, status } = useSession();
    const [currentSection, setCurrentSection] = useState('drive');
    const [currentProject, setCurrentProject] = useState(null);
    const [hierarchy, setHierarchy] = useState(null);
    const [isLoadingHierarchy, setIsLoadingHierarchy] = useState(false);
    const [viewMode, setViewMode] = useState('sheet');
    const [searchQuery, setSearchQuery] = useState('');
    const [changeLogs, setChangeLogs] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // ユーザーIDを取得（セッションが読み込まれるまで待つ）
    const userId = session?.user?.email;

    // 階層からすべてのファイルを抽出
    const extractAllFiles = useCallback((node) => {
        let files = [];

        if (node.files && node.files.length > 0) {
            files = [...node.files];
        }

        if (node.children && node.children.length > 0) {
            for (const child of node.children) {
                files = [...files, ...extractAllFiles(child)];
            }
        }

        return files;
    }, []);

    // ページ読み込み時にセッション状態を復元
    useEffect(() => {
        if (status !== 'authenticated' || isInitialized) return;

        const savedState = loadSessionState();
        if (savedState && savedState.projectId) {
            // プロジェクトを取得
            const project = getProject(savedState.projectId, userId);
            if (project) {
                setCurrentProject(project);
                setCurrentSection(savedState.section || 'drive');
                setViewMode(savedState.viewMode || 'sheet');

                // 保存された階層を読み込み
                const savedHierarchy = loadHierarchy(project.id);
                if (savedHierarchy) {
                    setHierarchy(savedHierarchy);
                    // バックグラウンドで更新（ローディング表示なし）
                    refreshHierarchy(project, false);
                } else {
                    // 保存された階層がない場合はローディング表示
                    refreshHierarchy(project, true);
                }

                // ログを読み込み
                const logs = loadChangeLogs(project.id);
                setChangeLogs(logs);
            }
        }
        setIsInitialized(true);
    }, [status, isInitialized, userId]);

    // 状態が変わったらセッションを保存
    useEffect(() => {
        if (!isInitialized) return;

        saveSessionState({
            projectId: currentProject?.id,
            section: currentSection,
            viewMode: viewMode,
        });
    }, [currentProject, currentSection, viewMode, isInitialized]);

    // 階層が変わったら保存
    useEffect(() => {
        if (currentProject && hierarchy) {
            saveHierarchy(currentProject.id, hierarchy);
        }
    }, [currentProject, hierarchy]);

    // ドライブ階層を更新
    const refreshHierarchy = async (project, showLoading = true) => {
        if (!project) return;

        // showLoadingがtrueの場合のみローディング表示
        if (showLoading) {
            setIsLoadingHierarchy(true);
        }
        try {
            const response = await fetch(`/api/drive/folders?url=${encodeURIComponent(project.driveUrl)}`);
            const data = await response.json();

            if (data.success) {
                setHierarchy(data.hierarchy);

                // 既存のログがない場合、既存ファイルを追加
                const existingLogs = loadChangeLogs(project.id);
                if (existingLogs.length === 0) {
                    const files = extractAllFiles(data.hierarchy);
                    const initialLogs = files.map((file) => ({
                        id: `initial-${file.id}-${Date.now()}`,
                        fileName: file.name,
                        fileId: file.id,
                        changeType: 'upload',
                        modifiedTime: file.modifiedTime,
                        owner: file.owner,
                        timestamp: new Date(file.modifiedTime).getTime(),
                    }));

                    if (initialLogs.length > 0) {
                        saveChangeLogs(project.id, initialLogs);
                        setChangeLogs(initialLogs);
                    }
                }
            }
        } catch (error) {
            console.error('階層取得エラー:', error);
        } finally {
            setIsLoadingHierarchy(false);
        }
    };

    // URLを送信してプロジェクトを作成
    const handleUrlSubmit = async (url, projectName) => {
        try {
            // フォルダ階層を取得
            const response = await fetch(`/api/drive/folders?url=${encodeURIComponent(url)}`);
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error);
            }

            // プロジェクト名が指定されていない場合、フォルダ名を使用
            const finalProjectName = projectName || data.hierarchy?.name || 'プロジェクト';

            // プロジェクトを作成
            const project = createProject(finalProjectName, url, data.folderId, userId);

            // ページトークンを取得
            const tokenResponse = await fetch('/api/drive/pageToken');
            const tokenData = await tokenResponse.json();

            if (tokenData.success) {
                updateProject(project.id, { pageToken: tokenData.pageToken }, userId);
            }

            // Push通知を登録
            const watchResponse = await fetch('/api/drive/watch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: project.id,
                    folderId: data.folderId,
                }),
            });

            const watchData = await watchResponse.json();

            if (watchData.success) {
                updateProject(project.id, {
                    channelId: watchData.channelInfo.channelId,
                    channelResourceId: watchData.channelInfo.resourceId,
                    channelExpiration: watchData.channelInfo.expiration,
                }, userId);
            }

            // 既存ファイルを更新ログに追加
            const existingFiles = extractAllFiles(data.hierarchy);
            const initialLogs = existingFiles.map((file) => ({
                id: `initial-${file.id}-${Date.now()}`,
                fileName: file.name,
                fileId: file.id,
                changeType: 'upload',
                modifiedTime: file.modifiedTime,
                owner: file.owner,
                timestamp: new Date(file.modifiedTime).getTime(),
            }));

            // ログを保存
            saveChangeLogs(project.id, initialLogs);
            setChangeLogs(initialLogs);

            // 階層を設定
            setHierarchy(data.hierarchy);
            setCurrentProject(project);
        } catch (error) {
            console.error('URL送信エラー:', error);
            throw error;
        }
    };

    // プロジェクトカードをクリック
    const handleProjectClick = async (project) => {
        setCurrentProject(project);
        setCurrentSection('drive');

        // ログを読み込み
        const logs = loadChangeLogs(project.id);
        setChangeLogs(logs);

        // 保存された階層を読み込み
        const savedHierarchy = loadHierarchy(project.id);
        if (savedHierarchy) {
            setHierarchy(savedHierarchy);
        }

        // フォルダ階層を更新
        refreshHierarchy(project);
    };

    // 定期的に変更をチェック
    useEffect(() => {
        if (!currentProject || !currentProject.pageToken) return;

        const interval = setInterval(async () => {
            try {
                const response = await fetch(
                    `/api/drive/changes?pageToken=${currentProject.pageToken}&projectId=${currentProject.id}`
                );
                const data = await response.json();

                if (data.success && data.logs && data.logs.length > 0) {
                    // 新しいログを追加
                    setChangeLogs((prev) => {
                        const newLogs = [...data.logs, ...prev];
                        saveChangeLogs(currentProject.id, newLogs);
                        return newLogs;
                    });

                    // ページトークンを更新
                    updateProject(currentProject.id, { pageToken: data.newPageToken }, userId);
                }
            } catch (error) {
                console.error('変更チェックエラー:', error);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [currentProject]);

    const renderContent = () => {
        switch (currentSection) {
            case 'projects':
                return <ProjectCardView onProjectClick={handleProjectClick} userId={userId} />;

            case 'drive':
                return (
                    <div>
                        <UrlInput onUrlSubmit={handleUrlSubmit} />

                        {currentProject && (
                            <>
                                <div style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                                        {currentProject.name}
                                    </h2>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--color-gray-700)', width: '100px', textAlign: 'right' }}>
                                            {viewMode === 'sheet' ? 'ドライブシート' : '更新ログ'}
                                        </span>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={viewMode === 'log'}
                                                onChange={(e) => setViewMode(e.target.checked ? 'log' : 'sheet')}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>

                                {viewMode === 'sheet' ? (
                                    <>
                                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                            <input
                                                type="text"
                                                className="input"
                                                placeholder="フォルダを検索..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <DriveSheet
                                            hierarchy={hierarchy}
                                            isLoading={isLoadingHierarchy}
                                            searchQuery={searchQuery}
                                            projectId={currentProject?.id}
                                        />
                                    </>
                                ) : (
                                    <UpdateLog logs={changeLogs} />
                                )}
                            </>
                        )}
                    </div>
                );

            case 'account':
                return (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
                            アカウント設定
                        </h2>
                        {session && (
                            <div>
                                <p style={{ color: 'var(--color-gray-600)' }}>
                                    ログイン中: {session.user?.email}
                                </p>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Layout currentSection={currentSection} onSectionChange={setCurrentSection}>
            {renderContent()}
        </Layout>
    );
}
