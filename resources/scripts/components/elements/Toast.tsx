import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components/macro';
import { faCheckCircle, faExclamationCircle, faExclamationTriangle, faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion, AnimatePresence } from 'framer-motion';
import { toastVariants } from '@/components/animations/variants';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    title?: string;
    message: string;
}

interface ToastContextType {
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>({
    addToast: () => {},
    removeToast: () => {},
});

export const useToast = () => useContext(ToastContext);

const ToastContainer = styled.div`
    position: fixed;
    bottom: 1.25rem;
    right: 1.25rem;
    z-index: 9999;
    display: flex;
    flex-direction: column-reverse;
    gap: 0.625rem;
    max-width: 380px;
    width: calc(100vw - 2.5rem);
    pointer-events: none;
`;

const typeConfig: Record<ToastType, { color: string; bg: string; borderColor: string; icon: typeof faCheckCircle }> = {
    success: {
        color: '#4ade80',
        bg: 'rgba(74, 222, 128, 0.08)',
        borderColor: 'rgba(74, 222, 128, 0.2)',
        icon: faCheckCircle,
    },
    error: {
        color: '#FF4C4C',
        bg: 'rgba(255, 76, 76, 0.08)',
        borderColor: 'rgba(255, 76, 76, 0.2)',
        icon: faExclamationCircle,
    },
    warning: {
        color: '#e6a23c',
        bg: 'rgba(230, 162, 60, 0.08)',
        borderColor: 'rgba(230, 162, 60, 0.2)',
        icon: faExclamationTriangle,
    },
    info: {
        color: '#82aaff',
        bg: 'rgba(130, 170, 255, 0.08)',
        borderColor: 'rgba(130, 170, 255, 0.2)',
        icon: faInfoCircle,
    },
};

const ToastItem = styled(motion.div)<{ $type: ToastType }>`
    pointer-events: all;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border-radius: 8px;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    background: ${(p) => typeConfig[p.$type].bg};
    background-color: rgba(26, 26, 26, 0.85);
    border: 1px solid ${(p) => typeConfig[p.$type].borderColor};
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 0 1px rgba(255, 255, 255, 0.05);
    cursor: default;
`;

const IconWrapper = styled.div<{ $type: ToastType }>`
    color: ${(p) => typeConfig[p.$type].color};
    font-size: 1rem;
    flex-shrink: 0;
    margin-top: 1px;
`;

const Content = styled.div`
    flex: 1;
    min-width: 0;
`;

const Title = styled.p`
    font-size: 0.8125rem;
    font-weight: 600;
    color: #f0f0f0;
    margin: 0;
    line-height: 1.3;
`;

const Message = styled.p`
    font-size: 0.75rem;
    color: #a3a3a3;
    margin: 0.125rem 0 0;
    line-height: 1.4;
    word-break: break-word;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    color: #525252;
    cursor: pointer;
    padding: 0;
    font-size: 0.7rem;
    flex-shrink: 0;
    transition: color 0.1s ease;
    margin-top: 1px;

    &:hover {
        color: #a3a3a3;
    }
`;

const ProgressBar = styled.div<{ $type: ToastType; $duration: number }>`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${(p) => typeConfig[p.$type].color};
    opacity: 0.4;
    border-radius: 0 0 8px 8px;
    animation: shrink ${(p) => p.$duration}ms linear forwards;

    @keyframes shrink {
        from { width: 100%; }
        to { width: 0%; }
    }
`;

const TOAST_DURATION = 5000;
let toastCounter = 0;

export const ToastProvider: React.FC = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        if (timers.current[id]) {
            clearTimeout(timers.current[id]);
            delete timers.current[id];
        }
    }, []);

    const addToast = useCallback(
        (toast: Omit<Toast, 'id'>) => {
            const id = `toast-${++toastCounter}-${Date.now()}`;
            setToasts((prev) => [...prev, { ...toast, id }]);

            timers.current[id] = setTimeout(() => {
                removeToast(id);
            }, TOAST_DURATION);
        },
        [removeToast]
    );

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <ToastContainer>
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <ToastItem
                            key={toast.id}
                            $type={toast.type}
                            variants={toastVariants}
                            initial={'initial'}
                            animate={'animate'}
                            exit={'exit'}
                            layout
                            style={{ position: 'relative' }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <IconWrapper $type={toast.type}>
                                <FontAwesomeIcon icon={typeConfig[toast.type].icon} />
                            </IconWrapper>
                            <Content>
                                {toast.title && <Title>{toast.title}</Title>}
                                <Message>{toast.message}</Message>
                            </Content>
                            <CloseButton onClick={() => removeToast(toast.id)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </CloseButton>
                            <ProgressBar $type={toast.type} $duration={TOAST_DURATION} />
                        </ToastItem>
                    ))}
                </AnimatePresence>
            </ToastContainer>
        </ToastContext.Provider>
    );
};
