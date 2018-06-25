import {join} from 'path';

import {
    readFile, outputFile, existsSync, statSync, readdir, appendFile
} from 'fs-extra';

import Component from './Component';


/**
 * Bundle components to JS modules (or HTML files)
 *
 * @param {string} path  - Source directory
 * @param {boolean} HTML - Whether bundle as HTML
 */
export  async function bundle(path, HTML) {

    const type = HTML ? 'HTML' : 'JS';

    const _type_ = type.toLowerCase();

    if (existsSync( join(path, `index.${_type_}`) )) {

        const component = new Component( path );

        await outputFile(
            `dist/${component.name}.${_type_}`,  await component[`to${type}`]()
        );
    }

    if (statSync( path ).isDirectory())
        for (let file  of  await readdir( path ))
            await bundle(join(path, file),  HTML);
}


/**
 * Pack all components into one HTML file
 *
 * @param {string} path - Output directory
 */
export  async function pack(path) {

    const index = join(path, 'index.html');

    await outputFile(index, '');

    for (let HTML  of  await readdir( path ))
        if ((HTML !== 'index.html')  &&  (HTML.slice(-5) === '.html')) {

            await appendFile(index,  `<!-- ${HTML} -->\n${
                await readFile( join(path, HTML) )
            }`);

            console.info(`√ Component "${HTML}" is packed in`);
        }
}
