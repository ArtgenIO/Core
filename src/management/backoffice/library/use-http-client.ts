import axios, { AxiosRequestConfig } from 'axios';
import { makeUseAxios, Options } from 'axios-hooks';
import LRU from 'lru-cache';
import { useRecoilValue } from 'recoil';
import { jwtAtom } from '../backoffice.atoms';

const cache = new LRU({ max: 50 });

export const useHttpClient = <Resp = any, Body = any, Err = any>(
  config: AxiosRequestConfig | string,
  options?: Options,
) => {
  const jwt = useRecoilValue(jwtAtom);
  const client = axios.create({
    headers: {
      'content-type': 'application/json',
    },
  });

  client.interceptors.request.use((config: AxiosRequestConfig) => {
    if (jwt) {
      config.headers['authorization'] = `Bearer ${jwt}`;

      return config;
    }

    return Promise.reject('Does not have a JWT');
  });

  const useAxios = makeUseAxios({ ...options, axios: client, cache });

  return useAxios<Resp, Body, Err>(config, options);
};
