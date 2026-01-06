import { useState, useEffect } from 'react';
import styles from '../styles/UrlInput.module.css';

export default function UrlInput({ onUrlSubmit }) {
    const [showPopup, setShowPopup] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
    const [url, setUrl] = useState('');
    const [projectName, setProjectName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingFolderName, setIsFetchingFolderName] = useState(false);

    // URLが変更されたらフォルダ名を自動取得
    useEffect(() => {
        const fetchFolderName = async () => {
            if (!url || !url.includes('drive.google.com')) return;

            setIsFetchingFolderName(true);
            try {
                const response = await fetch(`/api/drive/folders?url=${encodeURIComponent(url)}`);
                const data = await response.json();

                if (data.success && data.hierarchy?.name) {
                    // プロジェクト名が空の場合のみ、フォルダ名を設定
                    if (!projectName) {
                        setProjectName(data.hierarchy.name);
                    }
                }
            } catch (error) {
                console.error('フォルダ名の取得エラー:', error);
            } finally {
                setIsFetchingFolderName(false);
            }
        };

        // デバウンス処理（500ms待ってから実行）
        const timeoutId = setTimeout(fetchFolderName, 500);
        return () => clearTimeout(timeoutId);
    }, [url]);

    const handleClick = (e) => {
        const rect = e.target.getBoundingClientRect();
        setPopupPosition({
            x: rect.left,
            y: rect.bottom + window.scrollY,
        });
        setShowPopup(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await onUrlSubmit(url, projectName);
            setUrl('');
            setProjectName('');
            setShowPopup(false);
        } catch (error) {
            console.error('URL送信エラー:', error);
            alert('エラーが発生しました。URLを確認してください。');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.inputDisplay} onClick={handleClick}>
                <span className={styles.label}>URL指定欄</span>
                <span className={styles.placeholder}>
                    {url || 'URLを指定する'}
                </span>
            </div>

            {showPopup && (
                <>
                    <div
                        className={styles.overlay}
                        onClick={() => setShowPopup(false)}
                    />
                    <div
                        className={styles.popup}
                        style={{
                            top: `${popupPosition.y + 8}px`,
                            left: `${popupPosition.x}px`,
                        }}
                    >
                        <h3 className={styles.popupTitle}>Google Drive URL を指定</h3>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Google Drive URL</label>
                                <input
                                    type="url"
                                    className="input"
                                    placeholder="https://drive.google.com/drive/folders/..."
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    required
                                />
                                {isFetchingFolderName && (
                                    <small style={{ color: 'var(--color-gray-500)', fontSize: '0.75rem' }}>
                                        フォルダ名を取得中...
                                    </small>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>
                                    プロジェクト名
                                    <small style={{ marginLeft: '0.5rem', color: 'var(--color-gray-500)' }}>
                                        （変更可能）
                                    </small>
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="プロジェクト名"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                />
                            </div>

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowPopup(false)}
                                    disabled={isLoading}
                                >
                                    キャンセル
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isLoading || isFetchingFolderName}
                                >
                                    {isLoading ? '処理中...' : '追加'}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}
