import http from '@/api/http';

export default (uuid: string): Promise<any> => {
  return http.get(`/api/client/servers/${uuid}/mods/mcversions`).then(({ data }) => data);
};
