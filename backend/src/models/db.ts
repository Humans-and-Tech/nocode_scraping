/**
 * a object which can be stored into the DB
 */
export interface Storable {
  key: string;
}

export interface ICachedContent extends Storable {
  key: string;
  content: string;
  updateTime?: Date;
}

export class CachedContent implements ICachedContent {
  key: string;
  content: string;
  updateTime?: Date;

  constructor(key: string, content: string, updateTime?: Date) {
    this.key = key;
    this.content = content;
    this.updateTime = updateTime;
  }
}

export interface ISavePageContent extends ICachedContent {
  (key: string, content: string): Promise<boolean | undefined>;
}

export interface IGetPageContent extends ICachedContent {
  (key: string): Promise<ICachedContent | undefined>;
}


