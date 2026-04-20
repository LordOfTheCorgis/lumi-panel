import http from '@/api/http';

interface SftpImportPayload {
    protocol: 'sftp';
    host: string;
    port: number;
    username: string;
    password: string;
    sourcePath: string;
    destinationPath: string;
}

export interface SftpImportResponse {
    imported_files: number;
    imported_bytes: number;
    created_directories: number;
    elapsed_ms: number;
}

export default async (uuid: string, payload: SftpImportPayload): Promise<SftpImportResponse> => {
    const { data } = await http.post(
        `/api/client/servers/${uuid}/importer/sftp`,
        {
            protocol: payload.protocol,
            host: payload.host,
            port: payload.port,
            username: payload.username,
            password: payload.password,
            source_path: payload.sourcePath,
            destination_path: payload.destinationPath,
        },
        {
            // Imports can take longer than normal API requests.
            timeout: 0,
        }
    );

    return data.attributes as SftpImportResponse;
};
