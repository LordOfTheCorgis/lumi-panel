import useSWR from 'swr';
import http, { PaginatedResult } from '@/api/http';
import { createContext, useContext } from 'react';
import { ServerContext } from '@/state/server';

interface ctx {
  page: number;
  setPage: (value: number | ((s: number) => number)) => void;
  searchFilter: string;
  type: string;
  setType: (value: string | ((s: string) => string)) => void;
  version: string;
  setVersion: (value: string | ((s: string) => string)) => void;
  loader: string;
  setLoader: (value: string | ((s: string) => string)) => void;
  setSearchFilter: (value: string | ((s: string) => string)) => void;
}

export const Context = createContext<ctx>({
  page: 1,
  setPage: () => 1,
  searchFilter: '',
  setSearchFilter: () => '',
  type: 'modrinth',
  setType: () => 'modrinth',
  version: '',
  setVersion: () => '',
  loader: '',
  setLoader: () => '',
});

export default () => {
  const { page, searchFilter, type, version, loader } = useContext(Context);
  const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);

  return useSWR<PaginatedResult<any>>(['server:minecraftMods', page, searchFilter, type, version, loader], async () => {
    const { data } = await http.get(`/api/client/servers/${uuid}/mods/curse`, {
      params: { page, search: searchFilter, type, version, loader },
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
