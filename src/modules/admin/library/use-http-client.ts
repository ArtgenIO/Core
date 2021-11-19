import { message } from 'antd';
import axios, { AxiosRequestConfig } from 'axios';
import { makeUseAxios, Options } from 'axios-hooks';
import LRU from 'lru-cache';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { jwtAtom } from '../admin.atoms';

const cache = new LRU({ max: 50 });

export const useHttpClient = <Resp = any, Body = any, Err = any>(
  config: AxiosRequestConfig | string,
  options?: Options,
) => {
  const jwt = useRecoilValue(jwtAtom);
  const resetJwt = useResetRecoilState(jwtAtom);
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

  client.interceptors.response.use(
    response => response,
    error => {
      if (error?.response?.status === 401) {
        resetJwt();
        message.warn('Authentication token expired...');
      }

      return Promise.reject(error);
    },
  );

  const useAxios = makeUseAxios({ ...options, axios: client, cache });

  return useAxios<Resp, Body, Err>(config, options);
};
