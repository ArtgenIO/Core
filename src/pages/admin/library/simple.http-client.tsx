import { message } from 'antd';
import axios, { AxiosRequestConfig } from 'axios';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { jwtAtom } from '../atoms/admin.atoms';

export const useHttpClientSimple = () => {
  const jwt = useRecoilValue(jwtAtom);
  const resetJwt = useResetRecoilState(jwtAtom);

  const httpClient = axios.create({
    headers: {
      'Content-Type': 'application/json',
    },
  });

  httpClient.interceptors.request.use((config: AxiosRequestConfig) => {
    if (jwt) {
      config.headers['authorization'] = `Bearer ${jwt}`;

      return config;
    }

    return Promise.reject('Does not have a JWT');
  });

  httpClient.interceptors.response.use(
    response => response,
    error => {
      if (error?.response?.status === 401) {
        resetJwt();
        message.warn('Authentication token expired...');
      }

      return Promise.reject(error);
    },
  );

  return httpClient;
};
