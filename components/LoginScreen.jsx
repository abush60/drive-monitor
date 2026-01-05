import { signIn } from 'next-auth/react';
import styles from '../styles/LoginScreen.module.css';

export default function LoginScreen() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.logoSection}>
                    <h1 className={styles.title}>
                        <span className="gradient-text">Drive Monitor</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Google Driveフォルダをリアルタイムで監視
                    </p>
                </div>

                <div className={styles.loginCard}>
                    <h2 className={styles.loginTitle}>ログイン</h2>
                    <p className={styles.loginDescription}>
                        Googleアカウントでログインして、Driveフォルダの監視を開始しましょう
                    </p>

                    <button
                        onClick={() => signIn('google')}
                        className={styles.googleButton}
                    >
                        <svg
                            className={styles.googleIcon}
                            viewBox="0 0 24 24"
                            width="20"
                            height="20"
                        >
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                            <path fill="none" d="M1 1h22v22H1z" />
                        </svg>
                        Googleでログイン
                    </button>
                </div>

                <div className={styles.features}>
                    <div className={styles.feature}>
                        <div className={styles.featureIcon}>📁</div>
                        <h3>フォルダ監視</h3>
                        <p>Google Driveのフォルダをリアルタイムで監視</p>
                    </div>
                    <div className={styles.feature}>
                        <div className={styles.featureIcon}>🔔</div>
                        <h3>変更通知</h3>
                        <p>ファイルの追加・変更・削除を即座に検知</p>
                    </div>
                    <div className={styles.feature}>
                        <div className={styles.featureIcon}>📊</div>
                        <h3>プロジェクト管理</h3>
                        <p>複数のフォルダをプロジェクト単位で管理</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
