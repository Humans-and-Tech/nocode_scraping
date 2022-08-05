import { Spider } from '../interfaces/spider';
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
