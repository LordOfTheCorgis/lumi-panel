import React, { useState } from 'react';
import tw from 'twin.macro';
import { Form, Formik, FormikHelpers } from 'formik';
import { number, object, string } from 'yup';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import Field from '@/components/elements/Field';
import Label from '@/components/elements/Label';
import Select from '@/components/elements/Select';
import { Button } from '@/components/elements/button/index';
import FlashMessageRender from '@/components/FlashMessageRender';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { useFlashKey } from '@/plugins/useFlash';
import { httpErrorToHuman } from '@/api/http';
import { ServerContext } from '@/state/server';
import startSftpImport, { SftpImportResponse } from '@/api/server/importer/startSftpImport';

interface Values {
    protocol: 'sftp';
    host: string;
    port: number;
    username: string;
    password: string;
    sourcePath: string;
    destinationPath: string;
}

const bytesToHuman = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;

    const units = ['KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unit = units[0];

    for (let i = 0; i < units.length; i++) {
        value /= 1024;
        unit = units[i];
        if (value < 1024 || i === units.length - 1) {
            break;
        }
    }

    return `${value.toFixed(2)} ${unit}`;
};

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const [result, setResult] = useState<SftpImportResponse | null>(null);
    const { clearFlashes, addError } = useFlashKey('server:importer');

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        setResult(null);
        clearFlashes();

        startSftpImport(uuid, values)
            .then((response) => setResult(response))
            .catch((error) => {
                addError(httpErrorToHuman(error));
            })
            .then(() => setSubmitting(false));
    };

    return (
        <ServerContentBlock title={'Server Importer'}>
            <FlashMessageRender byKey={'server:importer'} css={tw`mb-4`} />
            <Formik<Values>
                onSubmit={submit}
                initialValues={{
                    protocol: 'sftp',
                    host: '',
                    port: 22,
                    username: '',
                    password: '',
                    sourcePath: '/',
                    destinationPath: '/',
                }}
                validationSchema={object().shape({
                    protocol: string().oneOf(['sftp']).required(),
                    host: string().required('Host is required.').max(255),
                    port: number().required('Port is required.').min(1).max(65535),
                    username: string().required('Username is required.').max(255),
                    password: string().required('Password is required.').max(1024),
                    sourcePath: string().required('Source path is required.').max(2048),
                    destinationPath: string().required('Destination path is required.').max(2048),
                })}
            >
                {({ isSubmitting }) => (
                    <TitledGreyBox title={'Remote SFTP Import'} css={tw`relative`}>
                        <SpinnerOverlay visible={isSubmitting} />
                        <Form css={tw`mb-0`}>
                            <div css={tw`grid grid-cols-1 md:grid-cols-2 gap-4`}>
                                <Field id={'host'} name={'host'} label={'Host'} />
                                <Field id={'port'} name={'port'} label={'Port'} type={'number'} />
                                <Field id={'username'} name={'username'} label={'Username'} />
                                <Field id={'password'} name={'password'} label={'Password'} type={'password'} />
                                <Field id={'sourcePath'} name={'sourcePath'} label={'Source Path'} />
                                <Field id={'destinationPath'} name={'destinationPath'} label={'Destination Path'} />
                                <div>
                                    <Label>Protocol</Label>
                                    <Select id={'protocol'} name={'protocol'}>
                                        <option value={'sftp'}>SFTP</option>
                                    </Select>
                                </div>
                            </div>

                            <p css={tw`text-xs text-neutral-400 mt-4`}>
                                Files are copied recursively from the remote source path into the destination path on
                                this server.
                            </p>

                            <div css={tw`mt-6 text-right`}>
                                <Button type={'submit'} disabled={isSubmitting}>
                                    Start Import
                                </Button>
                            </div>

                            {result && (
                                <div css={tw`mt-6 border border-neutral-700 rounded p-4 text-sm`}>
                                    <p css={tw`text-neutral-100`}>Import completed successfully.</p>
                                    <p css={tw`text-neutral-300 mt-2`}>
                                        Files imported: <strong>{result.imported_files}</strong>
                                    </p>
                                    <p css={tw`text-neutral-300`}>
                                        Directories created: <strong>{result.created_directories}</strong>
                                    </p>
                                    <p css={tw`text-neutral-300`}>
                                        Total transferred: <strong>{bytesToHuman(result.imported_bytes)}</strong>
                                    </p>
                                    <p css={tw`text-neutral-300`}>
                                        Elapsed time: <strong>{(result.elapsed_ms / 1000).toFixed(2)}s</strong>
                                    </p>
                                </div>
                            )}
                        </Form>
                    </TitledGreyBox>
                )}
            </Formik>
        </ServerContentBlock>
    );
};
