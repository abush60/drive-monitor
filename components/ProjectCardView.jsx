import { useState } from 'react';
import { getAllProjects, deleteProject, updateProject } from '../lib/projectManager';
import styles from '../styles/ProjectCardView.module.css';

export default function ProjectCardView({ onProjectClick, userId }) {
    const projects = getAllProjects(userId);
    const [editingProject, setEditingProject] = useState(null);
    const [newName, setNewName] = useState('');

    const handleDelete = (projectId, e) => {
        e.stopPropagation();
        if (confirm('このプロジェクトを削除しますか？')) {
            deleteProject(projectId, userId);
            window.location.reload();
        }
    };

    const handleStartEdit = (project, e) => {
        e.stopPropagation();
        setEditingProject(project.id);
        setNewName(project.name);
    };

    const handleSaveEdit = (projectId, e) => {
        e.stopPropagation();
        if (newName.trim()) {
            updateProject(projectId, { name: newName.trim() }, userId);
            setEditingProject(null);
            setNewName('');
            window.location.reload();
        }
    };

    const handleCancelEdit = (e) => {
        e.stopPropagation();
        setEditingProject(null);
        setNewName('');
    };

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
                        onClick={() => !editingProject && onProjectClick(project)}
                    >
                        <div className={styles.cardIcon}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                            </svg>
                        </div>

                        <div className={styles.cardContent}>
                            {editingProject === project.id ? (
                                <div className={styles.editForm} onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="text"
                                        className="input"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSaveEdit(project.id, e);
                                            if (e.key === 'Escape') handleCancelEdit(e);
                                        }}
                                    />
                                    <div className={styles.editActions}>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={handleCancelEdit}
                                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                        >
                                            キャンセル
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            onClick={(e) => handleSaveEdit(project.id, e)}
                                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                        >
                                            保存
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
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
                                    <div className={styles.cardActions}>
                                        <button
                                            className={styles.actionButton}
                                            onClick={(e) => handleStartEdit(project, e)}
                                            title="名前を変更"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                            </svg>
                                        </button>
                                        <button
                                            className={styles.actionButton}
                                            onClick={(e) => handleDelete(project.id, e)}
                                            title="削除"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                            </svg>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
