import React, { useEffect, useState } from 'react';
import { Button } from '@/components/elements/button/index';
import Can from '@/components/elements/Can';
import { ServerContext } from '@/state/server';
import { PowerAction } from '@/components/server/console/ServerConsoleContainer';
import { Dialog } from '@/components/elements/dialog';
import isEqual from 'react-fast-compare';
import getServerStartup from '@/api/swr/getServerStartup';

interface PowerButtonProps {
    className?: string;
}

export default ({ className }: PowerButtonProps) => {
    const [open, setOpen] = useState(false);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const variables = ServerContext.useStoreState(
        ({ server }) => ({
            variables: server.data!.variables,
            invocation: server.data!.invocation,
            dockerImage: server.data!.dockerImage,
        }),
        isEqual,
    );
    const { data } = getServerStartup(uuid, {
        ...variables,
        dockerImages: { [variables.dockerImage]: variables.dockerImage },
    });
    const primaryAllocation = ServerContext.useStoreState((state) =>
        state.server
            .data!.allocations.filter((alloc) => alloc.isDefault)
            .map((allocation) => allocation.alias || allocation.ip),
    ).toString();
    const txAdminVariable = data?.variables.find((v) => v.envVariable === 'TXADMIN_ENABLE');
    const txAdminPort = data?.variables.find((v) => v.envVariable === 'TXADMIN_PORT');
    let url = '';
    let txadmin = true;
    if (txAdminVariable && txAdminPort) {
        if (txAdminVariable.serverValue === '1') {
            url = 'http://' + primaryAllocation + ':' + txAdminPort.serverValue;
        } else {
            txadmin = false;
        }
    } else {
        txadmin = false;
    }
    const killable = status === 'stopping';
    const onButtonClick = (
        action: PowerAction | 'kill-confirmed',
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ): void => {
        e.preventDefault();
        if (action === 'kill') {
            return setOpen(true);
        }

        if (instance) {
            setOpen(false);
            instance.send('set state', action === 'kill-confirmed' ? 'kill' : action);
        }
    };

    useEffect(() => {
        if (status === 'offline') {
            setOpen(false);
        }
    }, [status]);

    return (
        <div className={className}>
            <Dialog.Confirm
                open={open}
                hideCloseIcon
                onClose={() => setOpen(false)}
                title={'Forcibly Stop Process'}
                confirm={'Continue'}
                onConfirmed={onButtonClick.bind(this, 'kill-confirmed')}
            >
                Forcibly stopping a server can lead to data corruption.
            </Dialog.Confirm>
            <Can action={'control.start'}>
                <Button.Success
                    className={'flex-1'}
                    disabled={status !== 'offline'}
                    onClick={onButtonClick.bind(this, 'start')}
                >
                    Start
                </Button.Success>
            </Can>
            <Can action={'control.restart'}>
                <Button.Text className={'flex-1'} disabled={!status} onClick={onButtonClick.bind(this, 'restart')}>
                    Restart
                </Button.Text>
            </Can>
            <Can action={'control.stop'}>
                <Button.Danger
                    className={'flex-1'}
                    disabled={status === 'offline'}
                    onClick={onButtonClick.bind(this, killable ? 'kill' : 'stop')}
                >
                    {killable ? 'Kill' : 'Stop'}
                </Button.Danger>
            </Can>
            {txadmin && (
                <Can action={'control.start'}>
                    <Button.Text
                        className={'flex-1'}
                        disabled={!status}
                        onClick={(e) => {
                            e.preventDefault();
                            window.open(url, '_blank', 'noopener,noreferrer');
                        }}
                    >
                        TxAdmin
                    </Button.Text>
                </Can>
            )}
        </div>
    );
};
