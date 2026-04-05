import React, { useContext } from 'react';
import { DialogContext } from './';
import { useDeepCompareEffect } from '@/plugins/useDeepCompareEffect';

export default ({ children }: { children: React.ReactNode }) => {
    const { setFooter } = useContext(DialogContext);

    useDeepCompareEffect(() => {
        setFooter(
            <div className={'px-6 py-3 flex items-center justify-end space-x-3'} style={{ backgroundColor: '#141414', borderTop: '1px solid #222222', borderRadius: '0 0 4px 4px' }}>{children}</div>
        );
    }, [children]);

    return null;
};
