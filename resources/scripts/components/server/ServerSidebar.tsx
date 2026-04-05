import React from 'react';
import { NavLink, useRouteMatch } from 'react-router-dom';
import { ServerContext } from '@/state/server';
import Can from '@/components/elements/Can';
import routes from '@/routers/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { faEthernet } from '@fortawesome/free-solid-svg-icons';
import { ip } from '@/lib/formatters';
import styled from 'styled-components/macro';
import tw from 'twin.macro';

const SidebarContainer = styled.div`
    width: 220px;
    min-width: 220px;
    background-color: #141414;
    border-right: 1px solid #1e1e1e;
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 3.5rem);

    @media (max-width: 768px) {
        display: none;
    }
`;

const ServerInfo = styled.div`
    padding: 1.25rem 1rem;
    border-bottom: 1px solid #1e1e1e;
`;

const CategoryLabel = styled.p`
    font-size: 0.625rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #525252;
    padding: 1rem 1rem 0.375rem;
    font-weight: 600;
`;

const NavItem = styled(NavLink)`
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    font-size: 0.8125rem;
    color: #a3a3a3;
    text-decoration: none;
    transition: all 0.1s;
    border-right: 2px solid transparent;

    &:hover {
        color: #f0f0f0;
        background-color: rgba(255, 255, 255, 0.03);
    }

    &.active {
        color: #f0f0f0;
        background-color: rgba(255, 76, 76, 0.08);
        border-right-color: #FF4C4C;
    }
`;

const AdminLink = styled.a`
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    font-size: 0.8125rem;
    color: #525252;
    text-decoration: none;
    transition: color 0.1s;
    margin-top: auto;
    border-top: 1px solid #1e1e1e;

    &:hover {
        color: #a3a3a3;
    }

    & svg {
        margin-left: 0.375rem;
        font-size: 0.625rem;
    }
`;

const ServerSidebar = () => {
    const match = useRouteMatch<{ id: string }>();
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const name = ServerContext.useStoreState((state) => state.server.data?.name);
    const serverId = ServerContext.useStoreState((state) => state.server.data?.internalId);
    const allocations = ServerContext.useStoreState((state) => state.server.data?.allocations);
    const nestId = ServerContext.useStoreState((state) => state.server.data?.nestId);
    const eggId = ServerContext.useStoreState((state) => state.server.data?.eggId);

    const to = (value: string) => {
        if (value === '/') return match.url;
        return `${match.url.replace(/\/*$/, '')}/${value.replace(/^\/+/, '')}`;
    };

    const defaultAllocation = allocations?.find((a) => a.isDefault);

    // Group routes by category
    const categories: Record<string, typeof routes.server> = {};
    routes.server
        .filter((route) => !!route.name && !!route.category)
        .filter((route) => {
            if (route.nestId && route.nestId !== nestId) return false;
            if (route.eggId && route.eggId !== eggId) return false;
            if (route.nestIds && !route.nestIds.includes(nestId ?? 0)) return false;
            if (route.eggIds && !route.eggIds.includes(eggId ?? 0)) return false;
            return true;
        })
        .forEach((route) => {
            const cat = route.category!;
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(route);
        });

    const categoryOrder = ['General', 'Management', 'Configuration'];

    return (
        <SidebarContainer>
            <ServerInfo>
                <p css={tw`text-sm font-medium truncate`} style={{ color: '#f0f0f0' }}>
                    {name}
                </p>
                {defaultAllocation && (
                    <p css={tw`text-xs mt-1 truncate`} style={{ color: '#525252' }}>
                        <FontAwesomeIcon icon={faEthernet} css={tw`mr-1`} />
                        {defaultAllocation.alias || ip(defaultAllocation.ip)}:{defaultAllocation.port}
                    </p>
                )}
            </ServerInfo>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                {categoryOrder.map(
                    (cat) =>
                        categories[cat] && (
                            <div key={cat}>
                                <CategoryLabel>{cat}</CategoryLabel>
                                {categories[cat].map((route) =>
                                    route.permission ? (
                                        <Can key={route.path} action={route.permission} matchAny>
                                            <NavItem to={to(route.path)} exact={route.exact}>
                                                {route.name}
                                            </NavItem>
                                        </Can>
                                    ) : (
                                        <NavItem key={route.path} to={to(route.path)} exact={route.exact}>
                                            {route.name}
                                        </NavItem>
                                    )
                                )}
                            </div>
                        )
                )}
            </div>

            {rootAdmin && (
                <AdminLink href={`/admin/servers/view/${serverId}`} target={'_blank'} rel={'noreferrer'}>
                    Admin View
                    <FontAwesomeIcon icon={faExternalLinkAlt} />
                </AdminLink>
            )}
        </SidebarContainer>
    );
};

export default ServerSidebar;
