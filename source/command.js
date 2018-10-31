import { join, basename, extname } from 'path';

import { currentModulePath, patch, findFile } from '@tech_query/node-toolkit';

import {
    readdirSync, existsSync, copy, outputFile, readFile, statSync
} from 'fs-extra';

import Git from 'simple-git/promise';

import spawn from 'cross-spawn';

import Component from './Component';


async function setTemplate() {

    const template = join(currentModulePath(), '../../template');

    for (let file  of  readdirSync( template )) {

        let path = join(template, file), type = 'Skip';

        if (! existsSync( file )) {

            await copy(path, file);  type = 'Create';

        } else if (extname( file ) === '.json')
            await outputFile(
                file,
                JSON.stringify(
                    patch(
                        JSON.parse(await readFile( file )),
                        JSON.parse(await readFile( path ))
                    ),
                    null,
                    4
                )
            ),
            type = 'Update';

        console.info(`${type.padEnd(6)} --> ${file}`);
    }
}

async function setMeta() {

    const meta = JSON.parse(await readFile('package.json')),
        git = Git(),
        config = { };

    if (!(await git.checkIsRepo()))  await git.init();

    try {
        var url = (await git.listRemote(['--get-url'])).trim();

    } catch (error) {  url = '';  }

    if (! meta.name)
        config.name = (
            url ?
                /([^/]+)\.git$/.exec( url )[1]  :
                basename( process.cwd() ).replace(/[^a-zA-Z0-9-]/g, '-')
        ).toLowerCase();

    if (! meta.description) {

        const ReadMe = findFile( /^ReadMe\.?/i );

        if ( ReadMe ) {

            const text = /^[^#].+/m.exec(await readFile( ReadMe ));

            if ( text )  config.description = text[0].trim();
        }
    }

    if (!meta.repository || !meta.bugs) {

        config.repository = meta.repository  ||  {type: 'git',  url};

        config.bugs = meta.bugs  ||  {url: url.replace(/\.git$/, '/issues/')};

        config.homepage = meta.homepage  ||  url.replace(/\.git$/, '/');
    }

    return  {...config, ...meta};
}

/**
 * Boot current directory as a WebCell project
 */
export async function boot() {

    console.time('Write configuration');

    await setTemplate();

    await outputFile('package.json',  JSON.stringify(await setMeta(), null, 4));

    console.info('--------------------');

    console.timeEnd('Write configuration');

    spawn('npm',  ['install'],  {stdio: 'inherit'});
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
        result.push(... readdirSync( path ).map(
            file  =>  bundle( join(path, file) )
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
