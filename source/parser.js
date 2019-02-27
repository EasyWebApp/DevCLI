import LESS from 'less';

import * as SASS from 'sass';

import Stylus from 'stylus';

import YAML from 'yaml';


/**
 * @private
 *
 * @param {String} raw
 *
 * @return {String}
 */
export function css(raw) {  return raw;  }


/**
 * @private
 *
 * @param {String} raw
 * @param {String} path
 * @param {Object} [option] - http://lesscss.org/usage/#less-options
 *
 * @return {String}
 */
export async function less(raw, path, option) {

    return  (await LESS.render(raw,  { paths: [path], ...option })).css;
}


/**
 * @private
 *
 * @param {String} raw
 * @param {String} path
 * @param {Object} [option] - https://github.com/sass/node-sass#options
 *
 * @return {String}
 */
export function sass(raw, path, option) {

    return  SASS.renderSync({ data: raw,  includePaths: [path],  ... option }).css;
}

/**
 * @private
 *
 * @type {Function}
 */
export const scss = sass;


/**
 * @private
 *
 * @param {string} raw
 * @param {String} path
 * @param {Object} [option] - https://github.com/stylus/stylus/blob/HEAD/docs/js.md
 *
 * @return {Promise<string>} CSS source code
 */
export function stylus(raw,  path,  option = { }) {

    return  new Promise((resolve, reject) => Stylus.render(
        raw,
        { paths: [path], ...option },
        (error, CSS)  =>  error ? reject( error ) : resolve( CSS )
    ));
}


/**
 * @private
 *
 * @param {String} raw
 * @param {Object} [option] - https://eemeli.org/yaml/#options
 *
 * @return {String}
 */
export function yaml(raw, option) {  return  YAML.parse(raw, option);  }
