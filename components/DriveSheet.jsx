import { useState, useEffect, useRef } from 'react';
import styles from '../styles/DriveSheet.module.css';

// コンテキストメニューコンポーネント
const ContextMenu = ({ x, y, onClose, onUpload }) => {
    return (
        <div
            className={styles.contextMenu}
            style={{ top: y, left: x }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className={styles.contextMenuItem} onClick={onUpload}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                ファイルをアップロード
            </div>
            <div className={styles.contextMenuItem} onClick={onClose}>
                キャンセル
            </div>
        </div>
    );
};

function FolderItem({ folder, depth = 0, expandedFolders, onToggle, onUploadClick, onDropFile }) {
    const isExpanded = expandedFolders.has(folder.id);
    const hasChildren = folder.children && folder.children.length > 0;
    const hasFiles = folder.files && folder.files.length > 0;
    const [isDragOver, setIsDragOver] = useState(false);

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '';
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        const mb = kb / 1024;
        return `${mb.toFixed(1)} MB`;
    };

    const handleFileClick = async (fileId, fileName, e) => {
        e.stopPropagation();
        try {
            const response = await fetch(`/api/drive/file?fileId=${fileId}`);
            const data = await response.json();

            if (data.success && data.file) {
                if (data.file.webViewLink) {
                    window.open(data.file.webViewLink, '_blank');
                } else if (data.file.webContentLink) {
                    window.open(data.file.webContentLink, '_blank');
                } else {
                    alert('このファイルは開けません');
                }
            }
        } catch (error) {
            console.error('ファイルを開くエラー:', error);
            alert('ファイルを開けませんでした');
        }
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onUploadClick(folder.id, e.clientX, e.clientY);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onDropFile(folder.id, e.dataTransfer.files[0]);
        }
    };

    return (
        <div className={styles.folderItem}>
            <div
                className={`${styles.folderHeader} ${isDragOver ? styles.dragOver : ''}`}
                style={{ paddingLeft: `${depth * 1.5}rem` }}
                onClick={() => (hasChildren || hasFiles) && onToggle(folder.id)}
                onContextMenu={handleContextMenu}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {(hasChildren || hasFiles) && (
                    <svg
                        className={`${styles.toggleIcon} ${isExpanded ? styles.expanded : ''}`}
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggle(folder.id);
                        }}
                    >
                        <path d="M6 4l4 4-4 4V4z" />
                    </svg>
                )}
                {!(hasChildren || hasFiles) && <div className={styles.spacer} />}

                <svg
                    className={styles.folderIcon}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                </svg>

                <span className={styles.folderName}>{folder.name}</span>

                <span className={styles.folderMeta}>
                    {new Date(folder.modifiedTime).toLocaleDateString()}
                </span>
            </div>

            {isExpanded && (
                <div className={styles.folderChildren}>
                    {/* ファイルを表示 */}
                    {hasFiles && folder.files.map((file) => (
                        <div
                            key={file.id}
                            className={styles.fileItem}
                            style={{ paddingLeft: `${(depth + 1) * 1.5}rem` }}
                            onClick={(e) => handleFileClick(file.id, file.name, e)}
                        >
                            <div className={styles.spacer} />
                            <svg
                                className={styles.fileIcon}
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                            </svg>
                            <span className={styles.fileName}>{file.name}</span>
                            <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
                            <span className={styles.fileMeta}>
                                {new Date(file.modifiedTime).toLocaleDateString()}
                            </span>
                        </div>
                    ))}

                    {/* 子フォルダを表示 */}
                    {hasChildren && folder.children.map((child) => (
                        <FolderItem
                            key={child.id}
                            folder={child}
                            depth={depth + 1}
                            expandedFolders={expandedFolders}
                            onToggle={onToggle}
                            onUploadClick={onUploadClick}
                            onDropFile={onDropFile}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function DriveSheet({ hierarchy, isLoading, searchQuery, projectId }) {
    const [expandedFolders, setExpandedFolders] = useState(new Set());
    const [contextMenu, setContextMenu] = useState(null); // { x, y, folderId }
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    // LocalStorageからトグル状態を読み込む
    useEffect(() => {
        if (projectId && typeof window !== 'undefined') {
            const key = `drive-monitor-expanded-${projectId}`;
            const saved = localStorage.getItem(key);
            if (saved) {
                try {
                    setExpandedFolders(new Set(JSON.parse(saved)));
                } catch (error) {
                    console.error('トグル状態の読み込みに失敗:', error);
                }
            }
        }
    }, [projectId]);

    // クリックでコンテキストメニューを閉じる
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    // トグル状態をLocalStorageに保存
    const saveExpandedState = (newExpandedFolders) => {
        if (projectId && typeof window !== 'undefined') {
            const key = `drive-monitor-expanded-${projectId}`;
            localStorage.setItem(key, JSON.stringify(Array.from(newExpandedFolders)));
        }
    };

    const handleToggle = (folderId) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(folderId)) {
                newSet.delete(folderId);
            } else {
                newSet.add(folderId);
            }
            saveExpandedState(newSet);
            return newSet;
        });
    };

    const handleUploadClick = (folderId, x, y) => {
        setContextMenu({ x, y, folderId });
    };

    const handleContextMenuUpload = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
        setContextMenu(null);
    };

    const handleFileChange = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            await uploadFile(contextMenu.folderId, e.target.files[0]);
        }
        // Reset input
        e.target.value = '';
    };

    const uploadFile = async (folderId, file) => {
        if (!folderId || !file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folderId', folderId);

        try {
            const response = await fetch('/api/drive/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.success) {
                alert('アップロード成功！ (反映には少し時間がかかります)');
            } else {
                alert('アップロード失敗: ' + data.error);
            }
        } catch (error) {
            console.error('アップロードエラー:', error);
            alert('アップロード中にエラーが発生しました');
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.loading}>
                <div className="loading-spinner"></div>
                <p>フォルダ階層を読み込み中...</p>
            </div>
        );
    }

    if (!hierarchy) {
        return (
            <div className={styles.empty}>
                <svg
                    className={styles.emptyIcon}
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                </svg>
                <p>URLを指定してフォルダを表示</p>
            </div>
        );
    }

    // 検索フィルタリング（簡略版）
    const filterHierarchy = (node, query) => {
        if (!query) return node;

        const lowerQuery = query.toLowerCase();
        const matches = node.name.toLowerCase().includes(lowerQuery);

        const filteredFiles = node.files ? node.files.filter(file =>
            file.name.toLowerCase().includes(lowerQuery)
        ) : [];

        if (node.children) {
            const filteredChildren = node.children
                .map(child => filterHierarchy(child, query))
                .filter(child => child !== null);

            if (matches || filteredChildren.length > 0 || filteredFiles.length > 0) {
                return { ...node, children: filteredChildren, files: filteredFiles };
            }
        }

        return (matches || filteredFiles.length > 0) ? { ...node, files: filteredFiles } : null;
    };

    const filteredHierarchy = filterHierarchy(hierarchy, searchQuery);

    if (!filteredHierarchy) {
        return (
            <div className={styles.empty}>
                <p>検索結果が見つかりません</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {isUploading && (
                <div className={styles.uploadOverlay}>
                    <div className="loading-spinner"></div>
                    <p>アップロード中...</p>
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            <FolderItem
                folder={filteredHierarchy}
                expandedFolders={expandedFolders}
                onToggle={handleToggle}
                onUploadClick={handleUploadClick}
                onDropFile={uploadFile}
            />

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    onUpload={handleContextMenuUpload}
                />
            )}
        </div>
    );
}
