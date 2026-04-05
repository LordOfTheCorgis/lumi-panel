import http from '@/api/http';

export default (uuid: string, modId: string, type: string): Promise<string> => {
  return http
    .get(`/api/client/servers/${uuid}/mods/description`, {
      params: {
        modId,
        type,
      },
    })
    .then(({ data }) => data.description || '');
};
