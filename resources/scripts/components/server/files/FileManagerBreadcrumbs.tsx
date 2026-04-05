import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import { NavLink, useLocation } from 'react-router-dom';
import { encodePathSegments, hashToPath } from '@/helpers';
import styles from './style.module.css';

interface Props {
    renderLeft?: JSX.Element;
    withinFileEditor?: boolean;
    isNewFile?: boolean;
}

export default ({ renderLeft, withinFileEditor, isNewFile }: Props) => {
    const [file, setFile] = useState<string | null>(null);
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const { hash } = useLocation();

    useEffect(() => {
        const path = hashToPath(hash);
        if (withinFileEditor && !isNewFile) {
            const name = path.split('/').pop() || null;
            setFile(name);
        }
    }, [withinFileEditor, isNewFile, hash]);

    const breadcrumbs = (): { name: string; path?: string }[] =>
        directory
            .split('/')
            .filter((directory) => !!directory)
            .map((directory, index, dirs) => {
                if (!withinFileEditor && index === dirs.length - 1) {
                    return { name: directory };
                }
                return { name: directory, path: `/${dirs.slice(0, index + 1).join('/')}` };
            });

    return (
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, gap: '0.5rem' }}>
            {renderLeft}
            <div className={styles.breadcrumb_bar}>
                <span className={styles.breadcrumb_root}>/home/container</span>
                <span className={styles.breadcrumb_separator}>/</span>
                {breadcrumbs().length === 0 && (
                    <NavLink
                        to={`/server/${id}/files`}
                        className={styles.breadcrumb_current}
                    >
                        .
                    </NavLink>
                )}
                {breadcrumbs().map((crumb, index) =>
                    crumb.path ? (
                        <React.Fragment key={index}>
                            <NavLink
                                to={`/server/${id}/files#${encodePathSegments(crumb.path)}`}
                                className={styles.breadcrumb_segment}
                            >
                                {crumb.name}
                            </NavLink>
                            <span className={styles.breadcrumb_separator}>/</span>
                        </React.Fragment>
                    ) : (
                        <span key={index} className={styles.breadcrumb_current}>
                            {crumb.name}
                        </span>
                    )
                )}
                {file && (
                    <span className={styles.breadcrumb_current}>{file}</span>
                )}
            </div>
        </div>
    );
};
