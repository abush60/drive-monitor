import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import styles from '../styles/Header.module.css';

export default function Header({ currentSection, onSectionChange }) {
    const router = useRouter();
    const { data: session } = useSession();

    const sections = [
        { id: 'projects', label: 'プロジェクト' },
        { id: 'drive', label: 'Googleドライブ' },
        { id: 'account', label: 'アカウント' },
    ];

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.logo}>
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{ marginRight: '8px' }}
                    >
                        <path
                            d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
                            fill="url(#folderGradient)"
                        />
                        <circle cx="14" cy="13" r="3" fill="white" opacity="0.8" />
                        <path
                            d="M13 13l2 2"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                        <defs>
                            <linearGradient id="folderGradient" x1="0" y1="0" x2="24" y2="24">
                                <stop offset="0%" stopColor="#8B5CF6" />
                                <stop offset="100%" stopColor="#6D28D9" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <span className="gradient-text">Drive Monitor</span>
                </div>

                <nav className={styles.nav}>
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            className={`${styles.navItem} ${currentSection === section.id ? styles.navItemActive : ''
                                }`}
                            onClick={() => onSectionChange(section.id)}
                        >
                            {section.label}
                        </button>
                    ))}
                </nav>

                {session && (
                    <div className={styles.userSection}>
                        <div className={styles.userInfo}>
                            {session.user?.image && (
                                <img
                                    src={session.user.image}
                                    alt={session.user.name}
                                    className={styles.avatar}
                                />
                            )}
                            <span className={styles.userName}>{session.user?.name}</span>
                        </div>
                        <button
                            className={`btn btn-secondary ${styles.logoutButton}`}
                            onClick={() => signOut()}
                        >
                            ログアウト
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
