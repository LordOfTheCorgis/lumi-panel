import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEthernet, faServer, faStar, faPlay, faStop, faSync } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerPowerState, ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import tw from 'twin.macro';
import Spinner from '@/components/elements/Spinner';
import styled from 'styled-components/macro';
import sendPowerAction, { PowerSignal } from '@/api/server/sendPowerAction';
import { motion } from 'framer-motion';
import { cardEntrance, cardHover, statusPulse } from '@/components/animations/variants';

const isAlarmState = (current: number, limit: number): boolean => limit > 0 && current / (limit * 1024 * 1024) >= 0.9;

const statusColor = (status: ServerPowerState | undefined): string => {
    if (!status || status === 'offline') return '#525252';
    if (status === 'running') return '#4ade80';
    return '#e6a23c';
};

const statusLabel = (status: ServerPowerState | undefined): string => {
    if (!status || status === 'offline') return 'Offline';
    if (status === 'running') return 'Online';
    if (status === 'stopping') return 'Stopping';
    return 'Starting';
};

const CardWrapper = styled(motion.div)`
    display: flex;
    flex-direction: column;
    background-color: #1a1a1a;
    border: 1px solid #222222;
    border-radius: 3px;
    padding: 1.25rem;
    text-decoration: none;
    color: inherit;
    position: relative;
    will-change: transform;
    height: 100%;
`;

const CardLink = styled(Link)`
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    flex: 1;
`;

const QuickActionsRow = styled.div`
    display: flex;
    gap: 0.375rem;
    justify-content: flex-end;
    margin-bottom: 0.5rem;
    opacity: 0;
    transition: opacity 0.15s ease;
    min-height: 1.625rem;

    ${CardWrapper}:hover & {
        opacity: 1;
    }
`;

const ActionBtn = styled(motion.button)<{ $color?: string; $disabled?: boolean }>`
    width: 1.625rem;
    height: 1.625rem;
    border-radius: 50%;
    border: 1px solid #333333;
    background-color: #1a1a1a;
    color: ${(p) => (p.$disabled ? '#3a3a3a' : '#a3a3a3')};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: ${(p) => (p.$disabled ? 'not-allowed' : 'pointer')};
    transition: background-color 0.12s ease, color 0.12s ease, border-color 0.12s ease;
    font-size: 0.6rem;
    padding: 0;

    &:hover:not(:disabled) {
        background-color: ${(p) => (p.$disabled ? '#1a1a1a' : p.$color || '#FF4C4C')};
        color: ${(p) => (p.$disabled ? '#3a3a3a' : '#fff')};
        border-color: ${(p) => (p.$disabled ? '#333333' : p.$color || '#FF4C4C')};
    }
`;

const PinButton = styled.button<{ $active: boolean }>`
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: ${(p) => (p.$active ? '#FF4C4C' : '#3a3a3a')};
    font-size: 0.75rem;
    transition: color 0.12s ease, transform 0.12s ease;
    display: flex;
    align-items: center;

    &:hover {
        color: #FF4C4C;
        transform: scale(1.15);
    }
`;

const UsageBar = styled.div<{ $percent: number; $alarm?: boolean }>`
    height: 3px;
    border-radius: 2px;
    background-color: #222222;
    overflow: hidden;
    flex: 1;

    &::after {
        content: '';
        display: block;
        height: 100%;
        width: ${(p) => Math.min(p.$percent, 100)}%;
        background-color: ${(p) => (p.$alarm ? '#FF4C4C' : '#FF4C4C')};
        opacity: ${(p) => (p.$alarm ? 1 : 0.6)};
        border-radius: 2px;
        transition: width 0.3s ease;
        box-shadow: ${(p) => (p.$alarm ? '0 0 6px rgba(255, 76, 76, 0.4)' : '0 0 4px rgba(255, 76, 76, 0.15)')};
    }
`;

const UsageRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.65rem;
    color: #737373;
`;

interface Props {
    server: Server;
    className?: string;
    isPinned?: boolean;
    onTogglePin?: () => void;
    onStatusUpdate?: (serverId: string, status: ServerPowerState | undefined) => void;
}

type Timer = ReturnType<typeof setInterval>;

export default ({ server, className, isPinned = false, onTogglePin, onStatusUpdate }: Props) => {
    const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const [isSuspended, setIsSuspended] = useState(server.status === 'suspended');
    const [stats, setStats] = useState<ServerStats | null>(null);
    const [actionLoading, setActionLoading] = useState<PowerSignal | null>(null);

    const getStats = () =>
        getServerResourceUsage(server.uuid)
            .then((data) => setStats(data))
            .catch((error) => console.error(error));

    useEffect(() => {
        setIsSuspended(stats?.isSuspended || server.status === 'suspended');
    }, [stats?.isSuspended, server.status]);

    useEffect(() => {
        if (stats && onStatusUpdate) {
            onStatusUpdate(server.uuid, stats.status);
        }
    }, [stats?.status]);

    useEffect(() => {
        if (isSuspended) return;

        getStats().then(() => {
            interval.current = setInterval(() => getStats(), 30000);
        });

        return () => {
            interval.current && clearInterval(interval.current);
        };
    }, [isSuspended]);

    const alarms = { cpu: false, memory: false, disk: false };
    if (stats) {
        alarms.cpu = server.limits.cpu === 0 ? false : stats.cpuUsagePercent >= server.limits.cpu * 0.9;
        alarms.memory = isAlarmState(stats.memoryUsageInBytes, server.limits.memory);
        alarms.disk = server.limits.disk === 0 ? false : isAlarmState(stats.diskUsageInBytes, server.limits.disk);
    }

    const cpuPercent = stats ? (server.limits.cpu > 0 ? (stats.cpuUsagePercent / server.limits.cpu) * 100 : stats.cpuUsagePercent) : 0;
    const memPercent = stats && server.limits.memory > 0 ? (stats.memoryUsageInBytes / mbToBytes(server.limits.memory)) * 100 : 0;
    const diskPercent = stats && server.limits.disk > 0 ? (stats.diskUsageInBytes / mbToBytes(server.limits.disk)) * 100 : 0;

    const allocation = server.allocations
        .filter((alloc) => alloc.isDefault)
        .map((a) => `${a.alias || ip(a.ip)}:${a.port}`)
        .join(', ');

    const handlePowerAction = (signal: PowerSignal, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (actionLoading) return;

        setActionLoading(signal);
        sendPowerAction(server.uuid, signal)
            .then(() => {
                setTimeout(() => getStats(), 2000);
            })
            .catch((err) => console.error(err))
            .then(() => setActionLoading(null));
    };

    const canStart = !stats || stats.status === 'offline';
    const canStop = stats?.status === 'running' || stats?.status === 'starting';
    const canRestart = stats?.status === 'running';

    return (
        <CardWrapper
            className={className}
            variants={cardEntrance}
            initial={'hidden'}
            animate={'show'}
            exit={'exit'}
            whileHover={cardHover.hover}
            whileTap={cardHover.tap}
            layout
        >
            {/* Quick action buttons */}
            {!isSuspended && !server.isTransferring && stats && (
                <QuickActionsRow>
                    <ActionBtn
                        $color={'#4ade80'}
                        $disabled={!canStart}
                        disabled={!canStart || !!actionLoading}
                        onClick={(e) => handlePowerAction('start', e)}
                        title={'Start'}
                        whileHover={canStart ? { scale: 1.15 } : {}}
                        whileTap={canStart ? { scale: 0.9 } : {}}
                    >
                        {actionLoading === 'start' ? <span className={'animate-spin'} style={{ width: 8, height: 8, border: '1.5px solid #555', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} /> : <FontAwesomeIcon icon={faPlay} />}
                    </ActionBtn>
                    <ActionBtn
                        $color={'#e6a23c'}
                        $disabled={!canRestart}
                        disabled={!canRestart || !!actionLoading}
                        onClick={(e) => handlePowerAction('restart', e)}
                        title={'Restart'}
                        whileHover={canRestart ? { scale: 1.15 } : {}}
                        whileTap={canRestart ? { scale: 0.9 } : {}}
                    >
                        {actionLoading === 'restart' ? <span className={'animate-spin'} style={{ width: 8, height: 8, border: '1.5px solid #555', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} /> : <FontAwesomeIcon icon={faSync} />}
                    </ActionBtn>
                    <ActionBtn
                        $color={'#FF4C4C'}
                        $disabled={!canStop}
                        disabled={!canStop || !!actionLoading}
                        onClick={(e) => handlePowerAction('stop', e)}
                        title={'Stop'}
                        whileHover={canStop ? { scale: 1.15 } : {}}
                        whileTap={canStop ? { scale: 0.9 } : {}}
                    >
                        {actionLoading === 'stop' ? <span className={'animate-spin'} style={{ width: 8, height: 8, border: '1.5px solid #555', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} /> : <FontAwesomeIcon icon={faStop} />}
                    </ActionBtn>
                </QuickActionsRow>
            )}

            <CardLink to={`/server/${server.id}`}>
                {/* Header: pin + name + status */}
                <div css={tw`flex items-start justify-between mb-3`}>
                    <div css={tw`flex items-center min-w-0`}>
                        {onTogglePin && (
                            <PinButton
                                $active={isPinned}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onTogglePin();
                                }}
                                title={isPinned ? 'Unpin server' : 'Pin server'}
                                style={{ marginRight: '0.5rem' }}
                            >
                                <FontAwesomeIcon icon={faStar} />
                            </PinButton>
                        )}
                        <div
                            style={{
                                width: '2rem',
                                height: '2rem',
                                backgroundColor: '#222222',
                                borderRadius: '3px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                marginRight: '0.75rem',
                            }}
                        >
                            <FontAwesomeIcon icon={faServer} style={{ color: '#737373', fontSize: '0.875rem' }} />
                        </div>
                        <div css={tw`min-w-0`}>
                            <p css={tw`text-sm font-medium truncate`} style={{ color: '#f0f0f0' }}>
                                {server.name}
                            </p>
                            {allocation && (
                                <p css={tw`text-xs truncate mt-0.5`} style={{ color: '#737373' }}>
                                    <FontAwesomeIcon icon={faEthernet} css={tw`mr-1`} />
                                    {allocation}
                                </p>
                            )}
                        </div>
                    </div>
                    <div css={tw`flex items-center flex-shrink-0 ml-2`}>
                        <motion.span
                            variants={statusPulse}
                            animate={stats?.status === 'starting' || stats?.status === 'stopping' ? 'pulse' : 'idle'}
                            style={{
                                width: '0.5rem',
                                height: '0.5rem',
                                borderRadius: '50%',
                                backgroundColor: isSuspended ? '#FF4C4C' : statusColor(stats?.status),
                                display: 'inline-block',
                                marginRight: '0.375rem',
                            }}
                        />
                        <span css={tw`text-xs`} style={{ color: '#a3a3a3' }}>
                            {isSuspended
                                ? server.status === 'suspended'
                                    ? 'Suspended'
                                    : 'Error'
                                : server.isTransferring
                                ? 'Transferring'
                                : server.status === 'installing'
                                ? 'Installing'
                                : server.status === 'restoring_backup'
                                ? 'Restoring'
                                : stats
                                ? statusLabel(stats.status)
                                : '...'}
                        </span>
                    </div>
                </div>

                {/* Description */}
                <p css={tw`text-xs mb-3 line-clamp-2`} style={{ color: '#737373', minHeight: '2rem' }}>
                    {server.description || '\u00A0'}
                </p>

                {/* Resource usage bars */}
                {stats && !isSuspended && stats.status !== 'offline' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '0.75rem' }}>
                        <UsageRow>
                            <span style={{ width: '2rem', textAlign: 'right' }}>CPU</span>
                            <UsageBar $percent={cpuPercent} $alarm={alarms.cpu} />
                            <span style={{ width: '2.5rem', textAlign: 'right' }}>
                                {stats.cpuUsagePercent.toFixed(0)}%
                            </span>
                        </UsageRow>
                        <UsageRow>
                            <span style={{ width: '2rem', textAlign: 'right' }}>RAM</span>
                            <UsageBar $percent={memPercent} $alarm={alarms.memory} />
                            <span style={{ width: '2.5rem', textAlign: 'right' }}>
                                {memPercent.toFixed(0)}%
                            </span>
                        </UsageRow>
                        <UsageRow>
                            <span style={{ width: '2rem', textAlign: 'right' }}>DISK</span>
                            <UsageBar $percent={diskPercent} $alarm={alarms.disk} />
                            <span style={{ width: '2.5rem', textAlign: 'right' }}>
                                {diskPercent.toFixed(0)}%
                            </span>
                        </UsageRow>
                    </div>
                )}

                {/* Stats row */}
                <div
                    style={{
                        borderTop: '1px solid #222222',
                        paddingTop: '0.75rem',
                        marginTop: 'auto',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '0.5rem',
                    }}
                >
                    {!stats || isSuspended ? (
                        !isSuspended && !server.isTransferring && !server.status ? (
                            <div style={{ gridColumn: 'span 3', textAlign: 'center' }}>
                                <Spinner size={'small'} />
                            </div>
                        ) : (
                            <div style={{ gridColumn: 'span 3', textAlign: 'center' }}>
                                <span css={tw`text-xs`} style={{ color: '#525252' }}>
                                    —
                                </span>
                            </div>
                        )
                    ) : (
                        <>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.375rem',
                                    fontSize: '0.75rem',
                                    color: alarms.cpu ? '#FF4C4C' : '#a3a3a3',
                                }}
                            >
                                <span>CPU</span>
                                <span>{stats.cpuUsagePercent.toFixed(1)}%</span>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.375rem',
                                    fontSize: '0.75rem',
                                    color: alarms.memory ? '#FF4C4C' : '#a3a3a3',
                                }}
                            >
                                <span>MEM</span>
                                <span>{bytesToString(stats.memoryUsageInBytes)}</span>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.375rem',
                                    fontSize: '0.75rem',
                                    color: alarms.disk ? '#FF4C4C' : '#a3a3a3',
                                }}
                            >
                                <span>DISK</span>
                                <span>{bytesToString(stats.diskUsageInBytes)}</span>
                            </div>
                        </>
                    )}
                </div>
            </CardLink>
        </CardWrapper>
    );
};
