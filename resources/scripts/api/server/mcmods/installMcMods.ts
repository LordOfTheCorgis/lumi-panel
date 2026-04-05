import http from '@/api/http';

export default (uuid: string, modId: string, url: string) => {
  return http.post(`/api/client/servers/${uuid}/mods/install`, {
    url,
    modId,
  });
};
