import axios, { AxiosRequestConfig } from 'axios';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { jwtAtom } from '../backoffice.atoms';

export const useHttpClientOld = () => {
  const jwt = useRecoilValue(jwtAtom);
  const resetJwt = useResetRecoilState(jwtAtom);

  const httpClient = axios.create({
    headers: {
      'content-type': 'application/json',
    },
  });

  httpClient.interceptors.request.use((config: AxiosRequestConfig) => {
    if (jwt) {
      config.headers['authorization'] = `Bearer ${jwt}`;

      return config;
    }

    return Promise.reject('Does not have a JWT');
  });

  return httpClient;
};
