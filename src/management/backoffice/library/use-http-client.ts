import axios, { AxiosRequestConfig } from 'axios';
import { makeUseAxios, Options } from 'axios-hooks';
import { useRecoilValue } from 'recoil';
import { jwtAtom } from '../backoffice.atoms';

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
      config.headers['authorization'] = `Bearer: ${jwt}`;

      return config;
    }

    return Promise.reject('Does not have a JWT');
  });

  const useAxios = makeUseAxios({ axios: client, cache: null });

  return useAxios<Resp, Body, Err>(config, options);
};
