import { cache, packageOf } from '@tech_query/node-toolkit';

import Stylus from 'stylus';


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


/**
 * @param {string} source
 * @param {Object} [option] - https://github.com/stylus/stylus/blob/HEAD/docs/js.md
 *
 * @return {Promise<string>} CSS source code
 */
export function parseStylus(source,  option = { }) {

    return  new Promise((resolve, reject) => Stylus.render(
        source,
        option,
        (error, CSS)  =>  error ? reject( error ) : resolve( CSS )
    ));
}

