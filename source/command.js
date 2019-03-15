import { join, basename } from 'path';

import {outputFile, existsSync, statSync, readdir} from 'fs-extra';

import Component from './Component';

import { index_html, index_js, router_js } from './template';

import { addComponent } from './utility';


/**
 * @param {String}   name      - Tag name
 * @param {String}   path      - Root of Source codes
 * @param {String[]} [keys=[]] - Defined HTML attributes
 * @param {?Boolean} preload   - Insert Component tag to Entry HTML
 */
export  async function createCell(name, path, keys, preload) {

    await outputFile(join(path, name, 'index.html'),  index_html());

    console.info(`√ Generated ${name}/index.html`);

    await outputFile(join(path, name, 'index.js'),  index_js(name, keys));

    console.info(`√ Generated ${name}/index.js`);

    if ( preload )  await addComponent(join(path, '../index.html'),  name);
}


/**
 * @param {String}   name      - Prefix of Tag name
 * @param {String}   path      - Root of Source codes
 * @param {String[]} [page=[]] - Router/Page names of Web-site/app
 */
export  async function createRouter(name, path, page) {

    const tag = `${name}-router`;

    await outputFile(join(path, tag, 'index.js'),  router_js(name, page));

    console.info(`√ Generated ${tag}/index.js`);

    await addComponent(join(path, '../index.html'),  tag);

    for (let name of page)  await createCell(`page-${name}`, path);
}


/**
 * Bundle components to JS modules
 *
 * @param {string} path - Source directory
 *
 * @return {string[]} Component paths
 */
export  async function bundle(path) {

    var result = [ ];

    if (existsSync( join(path, 'index.js') )) {

        const component = new Component( path );

        result[0] = `dist/${component.name}.js`;

        await outputFile(result[0],  await component.toJS());
    }

    if (statSync( path ).isDirectory())
        result = result.concat(... await Promise.all(
            (await readdir( path )).map(file  =>  bundle( join(path, file) ))
        ));

    return result;
}


/**
 * Bundle components into a JS package
 *
 * @param {string} path - Source directory
 *
 * @return {string[]} Component paths
 */
export  async function pack(path) {

    const file = await bundle( path );

    await outputFile(
        'dist/index.js',
        file.map(item => {

            item = basename( item );

            console.info(`√ Component "${item}" is packed in`);

            return  `export * from './${item}';`;

        }).join('\n')
    );

    return file;
}
