import useSWR from 'swr';
import http, { PaginatedResult } from '@/api/http';
import { createContext, useContext } from 'react';
import { ServerContext } from '@/state/server';

interface ctx {
  page: number;
  setPage: (value: number | ((s: number) => number)) => void;
}

export const Context = createContext<ctx>({ page: 1, setPage: () => 1 });

export default (modId: string, type: string) => {
  const { page } = useContext(Context);
  const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);

  return useSWR<PaginatedResult<any>>([modId, page, type], async () => {
    const { data } = await http.get(`/api/client/servers/${uuid}/mods/versions`, {
      params: { page, modId, type },
      timeout: 60000,
    });

    const items = data || [];
    const perPage = 20;
    const total = items.length < perPage ? (page - 1) * perPage + items.length : page * perPage + perPage;

    return {
      items,
      pagination: { total, count: items.length, perPage, currentPage: page, totalPages: Math.ceil(total / perPage) },
    };
  });
};
