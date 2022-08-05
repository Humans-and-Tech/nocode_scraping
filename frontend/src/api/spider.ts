import { Spider } from '../interfaces/spider';
import {IAPIResponse, GenericResponseStatus} from '../interfaces/index';
import axios from 'axios';

axios.defaults.baseURL = process.env.backend_base_url || 'http://localhost:3001';
axios.defaults.headers.common['gus'] = 'token';
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
axios.defaults.headers.common['Access-Control-Allow-Headers'] = '*';
axios.defaults.headers.common['Content-Type'] = 'application/json';

export interface CreateUrlsCollectionDto {
  name: string;
  urlsList: Array<URL>;
}

export const createUrlsCollection = async (spider: Spider, data: CreateUrlsCollectionDto) => {
  return await axios.post(`spider/${spider.name}/urls-collection`, data);
};

export const deleteUrlsCollection = async (spider: Spider, collectionName: string) => {
  return await axios.delete(`spider/${spider.name}/urls-collections/${collectionName}`);
};

export const getSpider = async (name: string): Promise<Spider> => {
  const result = await axios.get<IAPIResponse>(`spider/${name}`);
  if (result.data?.status===GenericResponseStatus.SUCCESS) {
    return result.data.data as Spider;
  }
  throw new Error(`Error fetching the spider ${name}: (${result.status})`);
};
