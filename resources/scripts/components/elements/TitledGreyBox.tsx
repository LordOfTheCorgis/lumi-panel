import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import tw from 'twin.macro';
import isEqual from 'react-fast-compare';

interface Props {
    icon?: IconProp;
    title: string | React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

const TitledGreyBox = ({ icon, title, children, className }: Props) => (
    <div className={className} style={{ backgroundColor: '#1a1a1a', border: '1px solid #222222', borderRadius: '3px' }}>
        <div style={{ backgroundColor: '#141414', borderBottom: '1px solid #222222', padding: '0.75rem 1rem', borderRadius: '3px 3px 0 0' }}>
            {typeof title === 'string' ? (
                <p className={'text-sm uppercase'} style={{ color: '#a3a3a3', letterSpacing: '0.05em' }}>
                    {icon && <FontAwesomeIcon icon={icon} className={'mr-2'} style={{ color: '#737373' }} />}
                    {title}
                </p>
            ) : (
                title
            )}
        </div>
        <div css={tw`p-3`}>{children}</div>
    </div>
);

export default memo(TitledGreyBox, isEqual);
