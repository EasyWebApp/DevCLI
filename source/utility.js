import { packageOf } from '@tech_query/node-toolkit';

import { JSDOM } from 'jsdom';

import Stylus from 'stylus';


/**
 * `package.json` data of `process.cwd()`
 *
 * @type {Object}
 */
export const meta = (packageOf('./test') || '').meta;


/**
 * @type {Document}
 */
export const document = (new JSDOM()).window.document;


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
