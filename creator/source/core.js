import {
    currentModulePath, spawn, step, ensureCommand
} from '@tech_query/node-toolkit';

import { JSDOM } from 'jsdom';

import { tagAttribute, library } from './library';

import { join } from 'path';

import {
    readJSONSync, writeJSONSync, copy, outputFile, readFile, removeSync
} from 'fs-extra';

import { boot as bootES } from 'create-es-pack/dist/command';


function equalLibrary(element, type, key, name, file) {

    const URI = element[ key ];

    return  (element.tagName.toLowerCase() === type)  &&
        URI.includes( name )  &&  URI.includes( file );
}

const { filter } = [ ],
    this_module = currentModulePath(),
    preTag = ['META', 'TITLE', 'BASE', 'LINK'];

/**
 * @param {String} code - HTML source
 *
 * @return {JSDOM}
 */
export function upgradeHTML(code) {

    const page = new JSDOM( code );

    const { window: { document } } = page;

    const list = Array.from(
            document.querySelectorAll( Object.keys( tagAttribute ) )
        ),
        point = filter.call(
            document.head.childNodes,
            node  =>  (preTag.includes( node.tagName ) || (node.nodeType === 8))
        ).slice(-1)[0];

    const script = library.map(({type, name, file, path})  =>  {

        file = file || name;

        var { key, kind } = tagAttribute[ type ], element;

        if (! (element = list.find(
            item  =>  equalLibrary(item, type, key, name, file)
        ))) {
            element = document.createElement( type );

            element[key] = `node_modules/${name}/${path || ''}${file}${
                /\.\w+$/.test( file )  ?  ''  :  `.min.${kind}`
            }`;

            if (type === 'link')  element.rel = 'stylesheet';
        }

        return element;
    });

    if ( point )
        point.after(... script);
    else
        document.head.append(... script);

    return page;
}


export  async function setRoot(cwd) {

    ['package', '.eslintrc'].forEach(name => {

        var file = join(cwd,  name + '.json');

        writeJSONSync(
            file,
            Object.assign(
                readJSONSync( file ),
                readJSONSync( join(this_module, `../../template/${name}.json`) )
            )
        );
    });

    await copy(join(this_module, '../../template/'),  cwd,  {overwrite: false});

    const file = join(cwd, 'index.html');

    await outputFile(file,  upgradeHTML(await readFile( file )).serialize());
}


/**
 * Boot a directory as a WebCell project
 *
 * @param {String}     cwd      - Project path
 * @param {String|URL} [remote] - URL of Git repository
 * @param {?Boolean}   app      - Add extensions for WebSite or WebApp
 */
export  async function boot(cwd = '.',  remote,  app) {

    console.time('Boot project');

    await bootES(cwd, remote);

    await step('Enhance root files',  setRoot.bind(null, cwd));

    const child_option = {stdio: 'inherit', cwd};

    await step('WebCell dependency',  async () => {

        removeSync( join(cwd, 'package-lock.json') );

        await spawn('npm',  ['install'],  child_option);

        if ( app )
            await spawn(
                'npm',  ['install', 'cell-router', 'data-scheme'],  child_option
            );

        await ensureCommand('web-cell');
    });

    await step('Git commit',  async () => {

        await spawn(
            'web-cell', ['new', 'cell-hello', 'name,value'],  child_option
        );

        await spawn('git',  ['add', '.'],  child_option);

        await spawn(
            'git',  ['commit', '-m', '[Add] WebCell framework'],  child_option
        );
    });

    console.info('--------------------');
    console.timeEnd('Boot project');
    console.info('');
}
