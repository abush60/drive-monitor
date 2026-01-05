import { getAllProjects } from '../lib/projectManager';
import styles from '../styles/ProjectCardView.module.css';

export default function ProjectCardView({ onProjectClick, userId }) {
    const projects = getAllProjects(userId);

    if (projects.length === 0) {
        return (
            <div className={styles.emptyState}>
                <svg
                    className={styles.emptyIcon}
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
                <p>プロジェクトがありません</p>
                <p className={styles.emptyHint}>
                    「Googleドライブ」タブからURLを指定してプロジェクトを作成してください
                </p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>プロジェクト一覧</h2>

            <div className={styles.grid}>
                {projects.map((project) => (
                    <div
                        key={project.id}
                        className={styles.card}
                        onClick={() => onProjectClick(project)}
                    >
                        <div className={styles.cardIcon}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                            </svg>
                        </div>

                        <div className={styles.cardContent}>
                            <h3 className={styles.cardTitle}>{project.name}</h3>
                            <p className={styles.cardUrl}>{project.driveUrl}</p>
                            <div className={styles.cardFooter}>
                                <span className={styles.cardDate}>
                                    作成日: {new Date(project.createdAt).toLocaleDateString()}
                                </span>
                                {project.channelId && (
                                    <span className="badge badge-upload">監視中</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
