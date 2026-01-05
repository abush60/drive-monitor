import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Header from './Header';
import LoginScreen from './LoginScreen';

export default function Layout({ children, currentSection, onSectionChange }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    // ローディング中
    if (status === 'loading') {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>読み込み中...</p>
                <style jsx>{`
          .loading-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-md);
          }
          .loading-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid var(--color-purple-200);
            border-top-color: var(--color-purple-600);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
            </div>
        );
    }

    // 未ログイン
    if (!session) {
        return <LoginScreen />;
    }

    // ログイン済み
    return (
        <div className="layout">
            <Header currentSection={currentSection} onSectionChange={onSectionChange} />
            <main className="main-content">{children}</main>

            <style jsx>{`
        .layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .main-content {
          flex: 1;
          padding: var(--spacing-xl);
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
        }
      `}</style>
        </div>
    );
}
