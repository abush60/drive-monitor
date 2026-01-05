import { useState } from 'react';
import styles from '../styles/UpdateLog.module.css';

export default function UpdateLog({ logs }) {
    const [filter, setFilter] = useState('all');

    // フィルタリングとソート機能
    const filterAndSortLogs = (logs, filter) => {
        let filtered = logs;
        if (filter !== 'all') {
            filtered = logs.filter(log => log.changeType === filter);
        }

        // 日付順にソート（新しい順）
        return filtered.sort((a, b) => {
            const dateA = new Date(a.modifiedTime || a.timestamp);
            const dateB = new Date(b.modifiedTime || b.timestamp);
            return dateB - dateA;
        });
    };

    const filteredLogs = filterAndSortLogs(logs, filter);

    const getChangeTypeLabel = (type) => {
        switch (type) {
            case 'upload':
                return 'アップロード';
            case 'change':
                return '変更';
            case 'delete':
                return '削除';
            default:
                return type;
        }
    };

    const getChangeTypeBadgeClass = (type) => {
        switch (type) {
            case 'upload':
                return 'badge-upload';
            case 'change':
                return 'badge-change';
            case 'delete':
                return 'badge-delete';
            default:
                return 'badge-upload';
        }
    };

    // ファイルを開く
    const handleFileClick = async (fileId, fileName) => {
        if (!fileId) return;

        try {
            const response = await fetch(`/api/drive/file?fileId=${fileId}`);
            const data = await response.json();

            if (data.success && data.file) {
                if (data.file.webViewLink) {
                    window.open(data.file.webViewLink, '_blank');
                } else if (data.file.webContentLink) {
                    window.open(data.file.webContentLink, '_blank');
                } else {
                    alert(`ファイル「${fileName}」は開けません`);
                }
            } else {
                // APIからのエラーメッセージを表示
                alert(data.message || 'ファイル情報の取得に失敗しました');
            }
        } catch (error) {
            console.error('ファイルを開くエラー:', error);
            alert(`ファイル「${fileName}」を開けませんでした`);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.filterBar}>
                <button
                    className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
                    onClick={() => setFilter('all')}
                >
                    すべて表示
                </button>
                <button
                    className={`${styles.filterButton} ${filter === 'upload' ? styles.active : ''}`}
                    onClick={() => setFilter('upload')}
                >
                    アップロード
                </button>
                <button
                    className={`${styles.filterButton} ${filter === 'change' ? styles.active : ''}`}
                    onClick={() => setFilter('change')}
                >
                    変更
                </button>
                <button
                    className={`${styles.filterButton} ${filter === 'delete' ? styles.active : ''}`}
                    onClick={() => setFilter('delete')}
                >
                    削除
                </button>
            </div>

            <div className={styles.logList}>
                {filteredLogs.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>更新ログがありません</p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', marginTop: 'var(--spacing-sm)' }}>
                            フォルダ内でファイルを追加・変更・削除すると、ここに表示されます
                        </p>
                    </div>
                ) : (
                    filteredLogs.map((log) => (
                        <div
                            key={log.id}
                            className={styles.logItem}
                            onClick={() => handleFileClick(log.fileId, log.fileName)}
                            style={{ cursor: log.fileId ? 'pointer' : 'default' }}
                        >
                            <div className={styles.logIcon}>
                                <svg width="40" height="40" viewBox="0 0 40 40">
                                    <circle
                                        cx="20"
                                        cy="20"
                                        r="18"
                                        fill="var(--color-purple-100)"
                                        stroke="var(--color-purple-400)"
                                        strokeWidth="2"
                                    />
                                    <text
                                        x="20"
                                        y="25"
                                        fontSize="16"
                                        textAnchor="middle"
                                        fill="var(--color-purple-700)"
                                    >
                                        {log.owner ? log.owner.charAt(0).toUpperCase() : '?'}
                                    </text>
                                </svg>
                            </div>

                            <div className={styles.logContent}>
                                <div className={styles.logHeader}>
                                    <span className={styles.logUser}>{log.owner}</span>
                                    <span className={`badge ${getChangeTypeBadgeClass(log.changeType)}`}>
                                        {getChangeTypeLabel(log.changeType)}
                                    </span>
                                </div>

                                <div className={styles.logBody}>
                                    <span className={styles.logFileName}>{log.fileName}</span>
                                </div>

                                <div className={styles.logFooter}>
                                    <span className={styles.logTime}>
                                        {new Date(log.modifiedTime).toLocaleString('ja-JP')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
