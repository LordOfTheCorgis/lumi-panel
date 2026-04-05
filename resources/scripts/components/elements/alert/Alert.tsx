import { ExclamationIcon, ShieldExclamationIcon } from '@heroicons/react/outline';
import React from 'react';
import classNames from 'classnames';

interface AlertProps {
    type: 'warning' | 'danger';
    className?: string;
    children: React.ReactNode;
}

export default ({ type, className, children }: AlertProps) => {
    return (
        <div
            className={classNames(
                'flex items-center border-l-4 rounded-none shadow px-4 py-3',
                {
                    ['border-red-400 text-gray-200']: type === 'danger',
                    ['text-gray-200']: type === 'warning',
                },
                className
            )}
            style={{
                backgroundColor: type === 'danger' ? 'rgba(255, 76, 76, 0.08)' : 'rgba(230, 162, 60, 0.08)',
                borderLeftColor: type === 'danger' ? '#FF4C4C' : '#e6a23c',
                borderRadius: '3px',
            }}
        >
            {type === 'danger' ? (
                <ShieldExclamationIcon className={'w-6 h-6 mr-2'} style={{ color: '#FF4C4C' }} />
            ) : (
                <ExclamationIcon className={'w-6 h-6 mr-2'} style={{ color: '#e6a23c' }} />
            )}
            {children}
        </div>
    );
};
