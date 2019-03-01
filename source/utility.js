import { cache, packageOf } from '@tech_query/node-toolkit';


/**
 * @param {String}   raw
 * @param {?Boolean} big - Big-camel style
 *
 * @return {String}
 */
export function identifierOf(raw, big) {

    raw = raw.replace(/\W+(\w)/g,  (_, char) => char.toUpperCase())
        .replace(/^\d/,  char => '_' + char);

    return  big  ?  (raw[0].toUpperCase() + raw.slice(1))  :  raw;
}


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
