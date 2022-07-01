import React from "react";
import { Socket } from "socket.io-client";

import { getSpider, saveSpider } from './socket/spider';
import { Spider } from "./interfaces/spider";


export interface ISpiderProvider {
    get: (socket: Socket, name: string, callback: (data: Spider | undefined, error: Error | undefined) => void) => void;
    upsert: (socket: Socket, spider: Spider, callback: (b: boolean, error: Error | undefined) => void) => void;
    remove: (socket: Socket, spider: Spider, callback: (b: boolean, error: Error | undefined) => void) => void;
    create: (socket: Socket, name: string) => Spider;
}


// TODO: read and write config from backend 
// not from localStorage
function useSpider(): ISpiderProvider {

    const get = (socket: Socket, name: string, callback: (data: Spider | undefined, error: Error | undefined) => void) => {

        if (name === '') {
            throw new Error('cannot get a spider with a blank name');
        }
        getSpider(socket, {}, name, (data: Spider | undefined, error: Error | undefined) => {
            callback(data, error);
        });
    };


    /**
     * TODO 
     * @param socket 
     * @param _name 
     * @returns 
     */
    const create = (socket: Socket, _name: string): Spider => {
        return {
            name: _name
        }
    };

    /**
     * inserts or updates a spider
     * 
     * @param _name
     * @returns 
     */
    const upsert = (socket: Socket, spider: Spider, callback: (b: boolean, error: Error | undefined) => void) => {
        if (spider.name === '' || spider.name === undefined) {
            throw new Error('cannot save a spider with a blank name');
        }
        saveSpider(socket, {}, spider, (b: boolean, error: Error | undefined) => {
            callback(b, error);
        });
    };

    /**
     * TODO
     * 
     * @param socket 
     * @param spider 
     * @param callback 
     */
    const remove = (socket: Socket, spider: Spider, callback: (b: boolean, error: Error | undefined) => void): void => {
        if (spider.name === '') {
            throw new Error('cannot remove a spider with a blank name');
        }
        // todo
    };

    return { get, upsert, remove, create };
}

export const SpiderProvider: ISpiderProvider = useSpider();

/**
 * the scraping context will convey
 * the spider accross all elements
 */
export const ScrapingContext = React.createContext<ISpiderProvider>(SpiderProvider);
