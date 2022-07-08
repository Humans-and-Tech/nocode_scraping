


export interface ISavePageContent {
  (key: string, content: string): Promise<boolean | undefined>;
}

export interface IGetPageContent {
  (key: string): Promise<ICachedContent | undefined> ;
}

export interface ICachedContent {
  content: string;
  updateTime?: Date;
}


