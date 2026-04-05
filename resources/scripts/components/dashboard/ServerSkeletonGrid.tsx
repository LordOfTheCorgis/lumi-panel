import React from 'react';
import styled, { keyframes } from 'styled-components/macro';
import { motion } from 'framer-motion';
import { cardEntrance } from '@/components/animations/variants';

const shimmer = keyframes`
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
`;

const Card = styled(motion.div)`
    display: flex;
    flex-direction: column;
    background-color: #1a1a1a;
    border: 1px solid #222222;
    border-radius: 3px;
    padding: 1.25rem;
`;

const Bone = styled.div<{ $w?: string; $h?: string; $mb?: string; $radius?: string }>`
    width: ${(p) => p.$w || '100%'};
    height: ${(p) => p.$h || '0.75rem'};
    margin-bottom: ${(p) => p.$mb || '0'};
    border-radius: ${(p) => p.$radius || '3px'};
    background: linear-gradient(90deg, #222222 25%, #2a2a2a 50%, #222222 75%);
    background-size: 200% 100%;
    animation: ${shimmer} 1.5s ease-in-out infinite;
`;

const Row = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const ServerCardSkeleton = () => (
    <Card variants={cardEntrance}>
        {/* Header row: icon + name */}
        <Row style={{ marginBottom: '0.75rem' }}>
            <Bone $w={'2rem'} $h={'2rem'} $radius={'3px'} />
            <div style={{ flex: 1 }}>
                <Bone $w={'60%'} $h={'0.75rem'} $mb={'0.375rem'} />
                <Bone $w={'40%'} $h={'0.5rem'} />
            </div>
            <Bone $w={'0.5rem'} $h={'0.5rem'} $radius={'50%'} />
        </Row>

        {/* Description placeholder */}
        <Bone $w={'100%'} $h={'0.5rem'} $mb={'0.375rem'} />
        <Bone $w={'75%'} $h={'0.5rem'} $mb={'0.75rem'} />

        {/* Usage bars placeholder */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '0.75rem' }}>
            <Row>
                <Bone $w={'2rem'} $h={'0.5rem'} />
                <Bone $h={'3px'} />
                <Bone $w={'2.5rem'} $h={'0.5rem'} />
            </Row>
            <Row>
                <Bone $w={'2rem'} $h={'0.5rem'} />
                <Bone $h={'3px'} />
                <Bone $w={'2.5rem'} $h={'0.5rem'} />
            </Row>
        </div>

        {/* Stats row */}
        <div style={{ borderTop: '1px solid #222222', paddingTop: '0.75rem', display: 'flex', gap: '0.75rem' }}>
            <Bone $w={'3rem'} $h={'0.5rem'} />
            <Bone $w={'3rem'} $h={'0.5rem'} />
            <Bone $w={'3rem'} $h={'0.5rem'} />
        </div>
    </Card>
);

interface Props {
    count?: number;
}

const ServerSkeletonGrid = ({ count = 6 }: Props) => (
    <motion.div
        className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'}
        initial={'hidden'}
        animate={'show'}
        variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
        }}
    >
        {Array.from({ length: count }).map((_, i) => (
            <ServerCardSkeleton key={i} />
        ))}
    </motion.div>
);

export default ServerSkeletonGrid;
