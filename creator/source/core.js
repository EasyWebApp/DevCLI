import {
    readdir, existsSync, copy, outputJSON, readJSON, outputFile, readFile
} from 'fs-extra';

import { join, extname } from 'path';

import { patch, currentModulePath } from '@tech_query/node-toolkit';

import 'regenerator-runtime/runtime';

import 'web-cell/dist/polyfill';

import { $, stringifyDOM } from 'web-cell';

import Git from 'simple-git/promise';

import spawn from 'cross-spawn';


/**
 * @param {String} folder
 * @param {String} [cwd='.']
 */
export  async function copyFrom(folder, cwd = '.') {

    for (let file  of  await readdir( folder )) {

        let source = join(folder, file),
            target = join(cwd, file),
            type = 'Skip';

        if (! existsSync( target )) {

            await copy(source, target);  type = 'Create';

        } else if (extname( file ) === '.json')
            await outputJSON(
                target,
                patch(await readJSON( target ),  await readJSON( source )),
                {spaces: 4}
            ),
            type = 'Update';

        console.info(`${type.padEnd(6)} --> ${target}`);
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


const Git_ignore =
`# Node.JS
node_modules/

# IDE
.vscode/
.idea/

# Online platform
.github/

# OS
.DS_Store`;

/**
 * Boot a directory as a WebCell project
 *
 * @param {String} [cwd='.'] - Current working directory
 */
export  async function boot(cwd = '.') {

    console.time('Boot project');

    const git = Git( cwd );

    if (!(await git.checkIsRepo()))  await git.init();

    spawn('npm',  ['init', '-y'],  {stdio: 'inherit', cwd});

    await copyFrom(join(currentModulePath(), '../../template'), cwd);

    const entry = join(cwd, 'index.html');

    await outputFile(
        entry,  stringifyDOM( upgradeHTML(await readFile( entry )) )
    );

    console.info('--------------------');

    console.timeEnd('Boot project');

    console.info('');

    await outputFile(join(cwd, '.gitignore'),  Git_ignore);

    spawn('npm',  ['install'],  {stdio: 'inherit', cwd});
}
