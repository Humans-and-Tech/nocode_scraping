import { Spider, URLsCollection } from '../interfaces/spider';
import { IAPIResponse, GenericResponseStatus } from '../interfaces/index';
import axios from 'axios';

axios.defaults.baseURL = process.env.backend_base_url || 'http://localhost:3001';
axios.defaults.headers.common['gus'] = 'token';
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
axios.defaults.headers.common['Access-Control-Allow-Headers'] = '*';
axios.defaults.headers.common['Content-Type'] = 'application/json';

export interface CreateUrlsCollectionDto {
  name: string;
  spiderName: string;
  urlsList: Array<URL>;
}

export const createUrlsCollection = async (data: CreateUrlsCollectionDto) => {
  return await axios.post(`urls-collections`, data);
};

export const deleteUrlsCollection = async (key: string) => {
  return await axios.delete(`urls-collections/${key}`);
};

export const getCollection = async (key: string): Promise<URLsCollection> => {
  const result = await axios.get<IAPIResponse>(`urls-collections/${key}`);
  if (result.data?.status === GenericResponseStatus.SUCCESS) {
    return result.data.data as URLsCollection;
  }
  throw new Error(`Error fetching the Urls Collection ${key}: (${result.status})`);
};
