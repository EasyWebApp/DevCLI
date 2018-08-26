import { execSync } from 'child_process';

import Stylus from 'stylus';


/**
 * @param {string} key
 *
 * @return {?*}
 */
export function getNPMConfig(key) {

    const value = (execSync(`npm get ${key}`) + '').trim();

    if (value !== 'undefined')
        try {
            return  JSON.parse( value );

        } catch (error) {  return value;  }
}


/**
 * @param {string} key
 * @param {*}      value
 */
export function setNPMConfig(key, value) {

    execSync(`npm set ${key} ${value}`);

    console.info(`${key} = ${value}`);
}


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
