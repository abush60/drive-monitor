import { signIn } from 'next-auth/react';
import styles from '../styles/LoginScreen.module.css';

export default function LoginScreen() {
    return (
        <div className={styles.container}>
            {/* 背景のアニメーション要素 */}
            <div className={styles.backgroundShapes}>
                <div className={styles.shape1}></div>
                <div className={styles.shape2}></div>
                <div className={styles.shape3}></div>
                <div className={styles.shape4}></div>
            </div>

            <div className={styles.content}>
                {/* ロゴとヘッダー */}
                <div className={styles.header}>
                    <div className={styles.logoContainer}>
                        <svg className={styles.logo} width="80" height="80" viewBox="0 0 24 24" fill="none">
                            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" fill="url(#gradient1)" />
                            <defs>
                                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#8B5CF6" />
                                    <stop offset="100%" stopColor="#EC4899" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <h1 className={styles.title}>Drive Monitor</h1>
                    <p className={styles.subtitle}>Google Driveフォルダをリアルタイムで監視</p>
                </div>

                {/* ログインカード */}
                <div className={styles.loginCard}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>ログイン</h2>
                        <p className={styles.cardDescription}>
                            Googleアカウントでログインして、Driveフォルダの監視を開始しましょう
                        </p>
                    </div>

                    <button
                        className={styles.googleButton}
                        onClick={() => signIn('google')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>Googleでログイン</span>
                    </button>
                </div>

                {/* 機能紹介 */}
                <div className={styles.features}>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                            </svg>
                        </div>
                        <h3 className={styles.featureTitle}>フォルダ監視</h3>
                        <p className={styles.featureDescription}>Google Driveのフォルダをリアルタイムで監視</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                            </svg>
                        </div>
                        <h3 className={styles.featureTitle}>変更通知</h3>
                        <p className={styles.featureDescription}>ファイルの追加・更新・削除を即座に検知</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                            </svg>
                        </div>
                        <h3 className={styles.featureTitle}>プロジェクト管理</h3>
                        <p className={styles.featureDescription}>複数のフォルダをプロジェクト単位で管理</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
