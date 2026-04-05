import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faKey, faTerminal, faHistory } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import styled from 'styled-components/macro';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarItem {
    path: string;
    name: string;
    icon: IconDefinition;
    exact?: boolean;
}

const sidebarItems: SidebarItem[] = [
    { path: '/', name: 'Profile', icon: faUser, exact: true },
    { path: '/api', name: 'API Keys', icon: faKey },
    { path: '/ssh', name: 'SSH Keys', icon: faTerminal },
    { path: '/activity', name: 'Activity', icon: faHistory },
];

const SidebarContainer = styled(motion.nav)`
    width: 220px;
    flex-shrink: 0;
    background-color: #141414;
    border-right: 1px solid #1e1e1e;
    padding: 1rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;

    @media (max-width: 768px) {
        width: 100%;
        flex-direction: row;
        overflow-x: auto;
        padding: 0;
        border-right: none;
        border-bottom: 1px solid #1e1e1e;
        gap: 0;
    }
`;

const SidebarLinkStyled = styled(NavLink)`
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.625rem 1.25rem;
    font-size: 0.8125rem;
    color: #a3a3a3;
    text-decoration: none;
    border-left: 2px solid transparent;
    white-space: nowrap;
    position: relative;

    &:hover {
        color: #f0f0f0;
        background-color: rgba(255, 255, 255, 0.03);
    }

    &.active {
        color: #f0f0f0;
        background-color: rgba(255, 76, 76, 0.06);
    }

    svg {
        width: 0.875rem;
        font-size: 0.8rem;
        color: inherit;
        opacity: 0.7;
    }

    &.active svg {
        opacity: 1;
        color: #FF4C4C;
    }

    @media (max-width: 768px) {
        border-left: none;
        border-bottom: 2px solid transparent;
        padding: 0.75rem 1rem;
    }
`;

const ActiveIndicator = styled(motion.div)`
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: #FF4C4C;

    @media (max-width: 768px) {
        top: auto;
        left: 0;
        right: 0;
        bottom: 0;
        width: auto;
        height: 2px;
    }
`;

const SidebarLink = ({ item, basePath }: { item: SidebarItem; basePath: string }) => {
    const location = useLocation();
    const to = `${basePath}${item.path}`.replace('//', '/');
    const isActive = item.exact ? location.pathname === to : location.pathname.startsWith(to);

    return (
        <motion.div
            style={{ position: 'relative' }}
            whileHover={{ x: 3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
            <SidebarLinkStyled to={to} exact={item.exact}>
                <AnimatePresence>
                    {isActive && (
                        <ActiveIndicator
                            layoutId={'sidebar-indicator'}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                    )}
                </AnimatePresence>
                <FontAwesomeIcon icon={item.icon} fixedWidth />
                <span>{item.name}</span>
            </SidebarLinkStyled>
        </motion.div>
    );
};

const SidebarHeader = styled.div`
    padding: 0.5rem 1.25rem 0.75rem;
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #525252;

    @media (max-width: 768px) {
        display: none;
    }
`;

const AccountSidebar = () => {
    const basePath = '/account';

    return (
        <SidebarContainer
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            <SidebarHeader>Account</SidebarHeader>
            {sidebarItems.map((item) => (
                <SidebarLink key={item.path} item={item} basePath={basePath} />
            ))}
        </SidebarContainer>
    );
};

export default AccountSidebar;
