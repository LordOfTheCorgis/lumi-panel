import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import ServerRow from '@/components/dashboard/ServerRow';
import Spinner from '@/components/elements/Spinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { usePersistedState } from '@/plugins/usePersistedState';
import Switch from '@/components/elements/Switch';
import tw from 'twin.macro';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { useLocation } from 'react-router-dom';
import ServerFilterBar, { StatusFilter, SortOption } from '@/components/dashboard/ServerFilterBar';
import { ServerPowerState } from '@/api/server/getServerResourceUsage';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, cardEntrance } from '@/components/animations/variants';
import ServerSkeletonGrid from '@/components/dashboard/ServerSkeletonGrid';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignal, faDollarSign } from '@fortawesome/free-solid-svg-icons';

const ServerGrid = styled(motion.div)<{ $count: number }>`
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    max-width: ${(p) => (p.$count < 3 ? `${p.$count * 350}px` : '100%')};
    margin: ${(p) => (p.$count < 3 ? '0 auto' : undefined)};

    @media (min-width: 640px) {
        grid-template-columns: ${(p) => (p.$count === 1 ? '1fr' : 'repeat(2, minmax(0, 1fr))')};
    }

    @media (min-width: 1024px) {
        grid-template-columns: ${(p) =>
            p.$count === 1 ? '1fr' : p.$count === 2 ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))'};
    }
`;

export default () => {
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');

    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = useStoreState((state) => state.user.data!.uuid);
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);

    // Filter & sort state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [sortBy, setSortBy] = useState<SortOption>('name');

    // Per-card power states (populated by ServerRow callbacks)
    const [serverStatuses, setServerStatuses] = useState<Record<string, ServerPowerState | undefined>>({});

    // Pinned / favorite servers
    const [pinnedIds, setPinnedIds] = usePersistedState<string[]>(`${uuid}:pinned_servers`, []);

    const togglePin = useCallback(
        (serverId: string) => {
            setPinnedIds((prev) => {
                const list = prev ?? [];
                return list.includes(serverId) ? list.filter((id) => id !== serverId) : [...list, serverId];
            });
        },
        [setPinnedIds]
    );

    const handleStatusUpdate = useCallback((serverId: string, status: ServerPowerState | undefined) => {
        setServerStatuses((prev) => {
            if (prev[serverId] === status) return prev;
            return { ...prev, [serverId]: status };
        });
    }, []);

    const { data: servers, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers', showOnlyAdmin && rootAdmin, page],
        () => getServers({ page, type: showOnlyAdmin && rootAdmin ? 'admin' : undefined })
    );

    useEffect(() => {
        setPage(1);
    }, [showOnlyAdmin]);

    useEffect(() => {
        if (!servers) return;
        if (servers.pagination.currentPage > 1 && !servers.items.length) {
            setPage(1);
        }
    }, [servers?.pagination.currentPage]);

    useEffect(() => {
        window.history.replaceState(null, document.title, `/${page <= 1 ? '' : `?page=${page}`}`);
    }, [page]);

    useEffect(() => {
        if (error) clearAndAddHttpError({ key: 'dashboard', error });
        if (!error) clearFlashes('dashboard');
    }, [error]);

    const filterAndSort = useMemo(() => {
        return (items: Server[]): Server[] => {
            let filtered = items;

            // Search by name or identifier
            if (searchTerm.trim()) {
                const q = searchTerm.toLowerCase();
                filtered = filtered.filter(
                    (s) =>
                        s.name.toLowerCase().includes(q) ||
                        s.identifier.toLowerCase().includes(q) ||
                        s.uuid.toLowerCase().includes(q)
                );
            }

            // Status filter
            if (statusFilter !== 'all') {
                filtered = filtered.filter((s) => {
                    const st = serverStatuses[s.uuid];
                    if (statusFilter === 'online') return st === 'running';
                    return !st || st === 'offline';
                });
            }

            // Sort
            filtered = [...filtered].sort((a, b) => {
                if (sortBy === 'status') {
                    const statusA = serverStatuses[a.uuid] || 'offline';
                    const statusB = serverStatuses[b.uuid] || 'offline';
                    if (statusA === statusB) return a.name.localeCompare(b.name);
                    if (statusA === 'running') return -1;
                    if (statusB === 'running') return 1;
                    return 0;
                }
                return a.name.localeCompare(b.name);
            });

            // Pinned servers first
            const pins = pinnedIds ?? [];
            if (pins.length > 0) {
                const pinned = filtered.filter((s) => pins.includes(s.uuid));
                const unpinned = filtered.filter((s) => !pins.includes(s.uuid));
                filtered = [...pinned, ...unpinned];
            }

            return filtered;
        };
    }, [searchTerm, statusFilter, sortBy, serverStatuses, pinnedIds]);

    return (
        <PageContentBlock title={'Dashboard'} showFlashKey={'dashboard'}>
            <div css={tw`mb-4 flex items-center justify-between`}>
                <a
                    href={'https://discord.gg/uaNYBJQtvn'}
                    target={'_blank'}
                    rel={'noopener noreferrer'}
                    css={tw`inline-flex items-center px-4 py-2 rounded text-sm font-medium text-white transition-colors duration-150`}
                    style={{ backgroundColor: '#5865F2' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4752C4')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#5865F2')}
                >
                    <svg css={tw`w-4 h-4 mr-2`} fill={'currentColor'} viewBox={'0 0 24 24'}>
                        <path d={'M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9460 2.4189-2.1568 2.4189z'} />
                    </svg>
                    Discord
                </a>
                <div css={tw`flex items-center gap-2`}>
                    <a
                        href={'https://status.lumixsolutions.org'}
                        target={'_blank'}
                        rel={'noopener noreferrer'}
                        css={tw`inline-flex items-center px-4 py-2 rounded text-sm font-medium text-white transition-colors duration-150`}
                        style={{ backgroundColor: '#2d3748' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4a5568')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2d3748')}
                    >
                        <FontAwesomeIcon icon={faSignal} css={tw`mr-2`} />
                        Status
                    </a>
                    <a
                        href={'https://billing.lumixsolutions.org'}
                        target={'_blank'}
                        rel={'noopener noreferrer'}
                        css={tw`inline-flex items-center px-4 py-2 rounded text-sm font-medium text-white transition-colors duration-150`}
                        style={{ backgroundColor: '#2d3748' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4a5568')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2d3748')}
                    >
                        <FontAwesomeIcon icon={faDollarSign} css={tw`mr-2`} />
                        Billing
                    </a>
                </div>
            </div>
            {rootAdmin && (
                <div css={tw`mb-2 flex justify-end items-center`}>
                    <p css={tw`uppercase text-xs text-neutral-400 mr-2`}>
                        {showOnlyAdmin ? "Showing others' servers" : 'Showing your servers'}
                    </p>
                    <Switch
                        name={'show_all_servers'}
                        defaultChecked={showOnlyAdmin}
                        onChange={() => setShowOnlyAdmin((s) => !s)}
                    />
                </div>
            )}
            {!servers ? (
                <ServerSkeletonGrid count={6} />
            ) : (
                <Pagination data={servers} onPageSelect={setPage}>
                    {({ items }) => {
                        const filtered = filterAndSort(items);
                        return (
                            <>
                                <ServerFilterBar
                                    searchTerm={searchTerm}
                                    onSearchChange={setSearchTerm}
                                    statusFilter={statusFilter}
                                    onStatusFilterChange={setStatusFilter}
                                    sortBy={sortBy}
                                    onSortChange={setSortBy}
                                />
                                {filtered.length > 0 ? (
                                    <ServerGrid
                                        $count={filtered.length}
                                        variants={staggerContainer}
                                        initial={'hidden'}
                                        animate={'show'}
                                        key={`${statusFilter}-${sortBy}`}
                                    >
                                        <AnimatePresence>
                                            {filtered.map((server) => (
                                                <ServerRow
                                                    key={server.uuid}
                                                    server={server}
                                                    isPinned={(pinnedIds ?? []).includes(server.uuid)}
                                                    onTogglePin={() => togglePin(server.uuid)}
                                                    onStatusUpdate={handleStatusUpdate}
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </ServerGrid>
                                ) : (
                                    <p css={tw`text-center text-sm text-neutral-400`}>
                                        {searchTerm || statusFilter !== 'all'
                                            ? 'No servers match your filters.'
                                            : showOnlyAdmin
                                            ? 'There are no other servers to display.'
                                            : 'There are no servers associated with your account.'}
                                    </p>
                                )}
                            </>
                        );
                    }}
                </Pagination>
            )}
        </PageContentBlock>
    );
};
