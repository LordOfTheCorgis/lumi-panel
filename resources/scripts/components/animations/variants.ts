import { Variants, Transition } from 'framer-motion';

// Shared spring configs
const snappy: Transition = { type: 'spring', stiffness: 400, damping: 30 };
const gentle: Transition = { type: 'spring', stiffness: 260, damping: 26 };

/* ─── Card entrance (stagger children via parent) ─── */
export const staggerContainer: Variants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.06,
        },
    },
};

export const cardEntrance: Variants = {
    hidden: { opacity: 0, y: 18, scale: 0.97 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: gentle,
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

/* ─── Card hover lift ─── */
export const cardHover = {
    rest: { scale: 1, boxShadow: '0 0 0 rgba(255,76,76,0)' },
    hover: {
        scale: 1.018,
        boxShadow: '0 4px 20px rgba(255,76,76,0.08)',
        transition: snappy,
    },
    tap: { scale: 0.995, transition: { duration: 0.1 } },
};

/* ─── Fade-slide for page transitions ─── */
export const pageTransition: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeIn' } },
};

/* ─── Sidebar link highlight ─── */
export const sidebarItem: Variants = {
    rest: { x: 0 },
    hover: { x: 4, transition: snappy },
};

/* ─── Button micro-interactions ─── */
export const buttonPop = {
    whileHover: { scale: 1.06, transition: snappy },
    whileTap: { scale: 0.92, transition: { duration: 0.08 } },
};

/* ─── Toast entrance / exit ─── */
export const toastVariants: Variants = {
    initial: { opacity: 0, x: 80, scale: 0.9 },
    animate: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 340, damping: 28 },
    },
    exit: {
        opacity: 0,
        x: 100,
        scale: 0.9,
        transition: { duration: 0.2, ease: 'easeIn' },
    },
};

/* ─── Fade in (generic) ─── */
export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
};

/* ─── Scale in (auth glass card) ─── */
export const glassCardEntrance: Variants = {
    hidden: { opacity: 0, scale: 0.94, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 200, damping: 24, delay: 0.1 },
    },
};

/* ─── Skeleton shimmer ─── */
export const shimmer: Variants = {
    initial: { backgroundPosition: '-200% 0' },
    animate: {
        backgroundPosition: '200% 0',
        transition: { duration: 1.5, ease: 'linear', repeat: Infinity },
    },
};

/* ─── Status dot pulse ─── */
export const statusPulse: Variants = {
    idle: { scale: 1 },
    pulse: {
        scale: [1, 1.5, 1],
        transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
    },
};
