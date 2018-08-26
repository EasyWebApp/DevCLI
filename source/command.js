import {join, basename} from 'path';

import {outputFile, existsSync, statSync, readdir} from 'fs-extra';

import Component from './Component';


/**
 * Bundle components to JS modules (or HTML files)
 *
 * @param {string}  path   - Source directory
 * @param {boolean} [HTML] - Whether bundle as HTML
 *
 * @return {string[]} Component paths
 */
export  async function bundle(path, HTML) {

    const type = HTML ? 'HTML' : 'JS';

    var _type_ = type.toLowerCase(), result = [ ];

    if (existsSync( join(path, `index.${_type_}`) )) {

        const component = new Component( path );

        result[0] = `dist/${component.name}.${_type_}`;

        await outputFile(result[0],  await component[`to${type}`]());
    }

    if (statSync( path ).isDirectory())
        result = result.concat(... await Promise.all(
            (await readdir( path )).map(file  =>  bundle(join(path, file), HTML))
        ));

    return result;
}


/**
 * Bundle components into a JS or HTML package
 *
 * @param {string}  path   - Source directory
 * @param {boolean} [HTML] - Whether bundle as HTML
 *
 * @return {string[]} Component paths
 */
export  async function pack(path, HTML) {
    try {
        var file = await bundle(path, HTML);

    } catch (error) {  console.error( error );  }

    await outputFile(
        `dist/index.${HTML ? 'html' : 'js'}`,
        file.map(item => {

            item = basename( item );

            console.info(`√ Component "${item}" is packed in`);

            return  HTML ?
                `<link rel="import" href="${item}">`  :
                `export * from './${item}';`;
        }).join('\n')
    );

    return file;
}
