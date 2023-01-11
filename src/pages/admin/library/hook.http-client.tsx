import { message } from 'antd';
import axios, { AxiosRequestConfig } from 'axios';
import { makeUseAxios, Options } from 'axios-hooks';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { jwtAtom } from '../atoms/admin.atoms';

export const useHttpClient = <Resp = any, Body = any, Err = any>(
  config: AxiosRequestConfig | string,
  options?: Options,
) => {
  const jwt = useRecoilValue(jwtAtom);
  const resetJwt = useResetRecoilState(jwtAtom);
  const client = axios.create({
    headers: {
      'Content-Type': 'application/json',
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
        message.warning('Authentication token expired...');
      }

      return Promise.reject(error);
    },
  );

  const useAxios = makeUseAxios({ ...options, axios: client, cache: null });

  return useAxios<Resp, Body, Err>(config, options);
};
