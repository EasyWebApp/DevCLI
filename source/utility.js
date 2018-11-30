import 'regenerator-runtime/runtime';

import '@babel/polyfill';

import { cache, packageOf, patch } from '@tech_query/node-toolkit';

import 'web-cell/dist/polyfill';

import { $ } from 'web-cell';

import Stylus from 'stylus';

import {readdir, existsSync, copy, outputJSON, readJSON} from 'fs-extra';

import { join, extname } from 'path';


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


/**
 * @private
 *
 * @param {String} folder
 */
export  async function copyFrom(folder) {

    for (let file  of  await readdir( folder )) {

        let path = join(folder, file), type = 'Skip';

        if (! existsSync( file )) {

            await copy(path, file);  type = 'Create';

        } else if (extname( file ) === '.json')
            await outputJSON(
                file,
                patch(await readJSON( file ),  await readJSON( path )),
                {spaces: 4}
            ),
            type = 'Update';

        console.info(`${type.padEnd(6)} --> ${file}`);
    }
}


const tagAttribute = {
        script:  {
            key:   'src',
            kind:  'js'
        },
        link:    {
            key:   'href',
            kind:  'css'
        }
    },
    library = [
        {
            name:  '@babel/polyfill',
            file:  'polyfill',
            path:  'dist/',
            type:  'script'
        },
        {
            name:  'whatwg-fetch',
            file:  'fetch.umd',
            path:  'dist/',
            type:  'script'
        },
        {
            name:  '@webcomponents/webcomponentsjs',
            file:  'webcomponents-bundle',
            type:  'script'
        },
        {
            name:  '@webcomponents/webcomponentsjs',
            file:  'custom-elements-es5-adapter',
            type:  'script'
        },
        {
            name:  'web-cell',
            path:  'dist/',
            type:  'script'
        }
    ];

function equalLibrary(element, type, key, name, file) {

    const URI = element[ key ];

    return  (element.tagName.toLowerCase() === type)  &&
        URI.includes( name )  &&  URI.includes( file );
}

/**
 * @private
 *
 * @param {String} code - HTML source
 *
 * @return {Document}
 */
export function upgradeHTML(code) {

    const page = (new DOMParser()).parseFromString(code, 'text/html');

    const list = $(Object.keys( tagAttribute ), page);

    for (let {type, name, file, path}  of  library) {

        file = file || name;

        var { key, kind } = tagAttribute[ type ], element;

        if (! (element = list.find(
            item  =>  equalLibrary(item, type, key, name, file)
        ))) {
            element = page.createElement( type );

            element[key] = `node_modules/${name}/${path || ''}${file}${
                /\.[^/]+$/.test( file )  ?  ''  :  '.min'
            }.${kind}`;

            if (type === 'link')  element.rel = 'stylesheet';
        }

        page.head.append('    ',  element,  '\n');
    }

    return page;
}
