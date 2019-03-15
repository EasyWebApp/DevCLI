import { cache, packageOf } from '@tech_query/node-toolkit';

import { JSDOM } from 'jsdom';

import { join } from 'path';

import { outputFile } from 'fs-extra';


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


/**
 * @param {String} entry          - Path of HTML file
 * @param {String} name           - Tag name
 * @param {String} [base='dist/'] - Base path of JS files
 */
export async function addComponent(entry, name, base) {

    const page = await JSDOM.fromFile( entry );

    const { document } = page.window;

    const script = document.createElement('script');

    script.setAttribute('src',  join(base || 'dist', `${name}.js`));

    document.head.append( script );

    document.body.append( document.createElement( name ) );

    await outputFile(entry, page.serialize());
}
