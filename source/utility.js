import { cache, packageOf } from '@tech_query/node-toolkit';


/**
 * Get `package.json` data of `path` or `process.cwd()`
 *
 * @type {function(path: ?String): Object}
 */
export const metaOf = cache(
    path  =>  (packageOf(path || './test') || '').meta || { }
);


/**
 * Get `directories` field of `package.json` in `path` or `process.cwd()`
 *
 * @type {function(path: ?String): Object}
 */
export const folderOf = cache(path  =>  (metaOf(path) || '').directories || { });
