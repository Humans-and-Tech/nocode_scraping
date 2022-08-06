import { Spider } from '../interfaces/spider';
import { IAPIResponse, GenericResponseStatus } from '../interfaces/index';
import axios from 'axios';

axios.defaults.baseURL = process.env.backend_base_url || 'http://localhost:3001';
axios.defaults.headers.common['gus'] = 'token';
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
axios.defaults.headers.common['Access-Control-Allow-Headers'] = '*';
axios.defaults.headers.common['Content-Type'] = 'application/json';

export const getSpider = async (name: string): Promise<Spider> => {
  const result = await axios.get<IAPIResponse>(`spider/${name}`);
  if (result.data?.status === GenericResponseStatus.SUCCESS) {
    return result.data.data as Spider;
  }
  throw new Error(`Error fetching the spider ${name}: (${result.status})`);
};
