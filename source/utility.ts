import { FindOptionsWhere, ILike } from 'typeorm';

import { Base } from './model';

export const {
    NODE_ENV,
    HTTP_PROXY,
    PORT = 8080,
    DATABASE_URL,
    APP_SECRET
} = process.env;

export const isProduct = NODE_ENV === 'production';

export const searchConditionOf = <T extends Base>(
    keys: (keyof T)[],
    keywords = '',
    filter?: FindOptionsWhere<T>
) =>
    keywords
        ? keys.map(key => ({ [key]: ILike(`%${keywords}%`), ...filter }))
        : filter;
