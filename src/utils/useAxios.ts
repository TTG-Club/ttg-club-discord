import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import axios from 'axios';

import { useConfig } from './useConfig';

export type RequestConfig = {
  url: AxiosRequestConfig['url'],
  payload?: AxiosRequestConfig['params'] | AxiosRequestConfig['data'],
  signal?: AbortSignal
}


const { API_URL } = useConfig();

class HTTPService {
  protected instance: AxiosInstance;

  protected instanceRaw: AxiosInstance;

  constructor() {
    axios.defaults.withCredentials = true;

    this.instance = axios.create({
      baseURL: `${ API_URL || 'http://localhost:8080' }/api/v1`,
      withCredentials: true,
      headers: {}
    });

    this.instanceRaw = axios.create({
      baseURL: '',
      withCredentials: true
    });
  }

  get(config: RequestConfig) {
    // @ts-ignore
    return this.instance({
      method: 'get',
      url: config.url,
      params: config.payload,
      signal: config.signal
    });
  }

  post(config: RequestConfig) {
    // @ts-ignore
    return this.instance({
      method: 'post',
      url: config.url,
      data: config.payload,
      signal: config.signal
    });
  }

  put(config: RequestConfig) {
    // @ts-ignore
    return this.instance({
      method: 'put',
      url: config.url,
      data: config.payload,
      signal: config.signal
    });
  }

  patch(config: RequestConfig) {
    // @ts-ignore
    return this.instance({
      method: 'patch',
      url: config.url,
      data: config.payload,
      signal: config.signal
    });
  }

  delete(config: RequestConfig) {
    // @ts-ignore
    return this.instance({
      method: 'delete',
      url: config.url,
      data: config.payload,
      signal: config.signal
    });
  }

  rawGet(config: RequestConfig) {
    // @ts-ignore
    return this.instanceRaw({
      method: 'get',
      url: config.url,
      params: config.payload,
      signal: config.signal
    });
  }
}

export const useAxios = () => {
  return new HTTPService();
};
