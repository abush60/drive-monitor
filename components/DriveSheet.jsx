import { useState, useEffect, useRef } from 'react';
import styles from '../styles/DriveSheet.module.css';

// ファイルタイプ別のアイコンを返す関数
const getFileIcon = (fileName, mimeType) => {
    const extension = fileName.split('.').pop().toLowerCase();

    // 動画ファイル
    if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv'].includes(extension) || mimeType?.startsWith('video/')) {
        return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
            </svg>
        );
    }

    // 画像ファイル
    if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp'].includes(extension) || mimeType?.startsWith('image/')) {
        return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
        );
    }

    // デザインファイル (Photoshop, Illustrator, Clip Studio)
    if (['psd', 'ai', 'clip', 'xd', 'sketch', 'fig'].includes(extension)) {
        return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
            </svg>
        );
    }

    // 文書ファイル
    if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension) || mimeType?.includes('document')) {
        return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
            </svg>
        );
    }

    // PDF
    if (extension === 'pdf' || mimeType === 'application/pdf') {
        return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z" />
            </svg>
        );
    }

    // 表計算ファイル
    if (['xls', 'xlsx', 'csv', 'ods'].includes(extension) || mimeType?.includes('spreadsheet')) {
        return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
            </svg>
        );
    }

    // 圧縮ファイル
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
        return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-2 6h-3v3h-2v-3h-3v-2h3V7h2v3h3v2z" />
            </svg>
        );
    }

    // デフォルトのファイルアイコン
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
        </svg>
    );
};

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

    const handleDownload = async (fileId, fileName, e) => {
        e.stopPropagation();
        try {
            const response = await fetch(`/api/drive/file?fileId=${fileId}`);
            const data = await response.json();

            if (data.success && data.file && data.file.webContentLink) {
                // ダウンロードリンクを開く
                const link = document.createElement('a');
                link.href = data.file.webContentLink;
                link.download = fileName;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                alert('このファイルはダウンロードできません');
            }
        } catch (error) {
            console.error('ダウンロードエラー:', error);
            alert('ダウンロードに失敗しました');
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
        // 子要素へのドラッグでもleaveが発火するのを防ぐ
        if (e.currentTarget.contains(e.relatedTarget)) return;
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
                        >
                            <div className={styles.spacer} />
                            <div className={styles.fileIcon}>
                                {getFileIcon(file.name, file.mimeType)}
                            </div>
                            <span
                                className={styles.fileName}
                                onClick={(e) => handleFileClick(file.id, file.name, e)}
                            >
                                {file.name}
                            </span>
                            <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
                            <span className={styles.fileMeta}>
                                {new Date(file.modifiedTime).toLocaleDateString()}
                            </span>
                            <button
                                className={styles.downloadButton}
                                onClick={(e) => handleDownload(file.id, file.name, e)}
                                title="ダウンロード"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                            </button>
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

    // トグル状態が変わったらLocalStorageに保存
    useEffect(() => {
        if (projectId && typeof window !== 'undefined') {
            const key = `drive-monitor-expanded-${projectId}`;
            localStorage.setItem(key, JSON.stringify([...expandedFolders]));
        }
    }, [expandedFolders, projectId]);

    // コンテキストメニューを閉じる
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    const handleToggle = (folderId) => {
        setExpandedFolders((prev) => {
            const next = new Set(prev);
            if (next.has(folderId)) {
                next.delete(folderId);
            } else {
                next.add(folderId);
            }
            return next;
        });
    };

    const handleUploadClick = (folderId, x, y) => {
        setContextMenu({ x, y, folderId });
    };

    const handleUploadFromMenu = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
        setContextMenu(null);
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !contextMenu) return;

        await uploadFile(contextMenu.folderId, file);
        e.target.value = ''; // リセット
    };

    const handleDropFile = async (folderId, file) => {
        await uploadFile(folderId, file);
    };

    const uploadFile = async (folderId, file) => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folderId', folderId);

            const response = await fetch('/api/drive/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                alert('アップロードが完了しました');
                window.location.reload();
            } else {
                throw new Error(data.error || 'アップロードに失敗しました');
            }
        } catch (error) {
            console.error('アップロードエラー:', error);
            alert(`アップロードに失敗しました: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>読み込み中...</p>
            </div>
        );
    }

    if (!hierarchy) {
        return (
            <div className={styles.empty}>
                <p>フォルダが選択されていません</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
            />

            {isUploading && (
                <div className={styles.uploadOverlay}>
                    <div className={styles.uploadSpinner}></div>
                    <p>アップロード中...</p>
                </div>
            )}

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    onUpload={handleUploadFromMenu}
                />
            )}

            <div className={styles.header}>
                <div className={styles.headerItem} style={{ flex: 2 }}>名前</div>
                <div className={styles.headerItem} style={{ width: '100px' }}>サイズ</div>
                <div className={styles.headerItem} style={{ width: '120px' }}>更新日</div>
                <div className={styles.headerItem} style={{ width: '60px' }}></div>
            </div>

            <FolderItem
                folder={hierarchy}
                depth={0}
                expandedFolders={expandedFolders}
                onToggle={handleToggle}
                onUploadClick={handleUploadClick}
                onDropFile={handleDropFile}
            />
        </div>
    );
}
