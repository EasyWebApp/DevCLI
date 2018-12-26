import { basename, resolve, join, extname } from 'path';

import { packageOf, currentModulePath, patch, findFile } from '@tech_query/node-toolkit';

import {
    ensureDirSync, copy, readdirSync, readJSON, outputJSON, existsSync,
    removeSync, moveSync, outputFile
} from 'fs-extra';

import Git from 'simple-git/promise';

import spawn from 'cross-spawn';

import { JSDOM } from 'jsdom';

import { tagAttribute, library } from './library';


/**
 * @type {Object}
 */
export  const meta = packageOf( currentModulePath() );


/**
 * @param {String} path
 *
 * @return {String}
 */
export  function packageNameOf(path) {

    return  basename( resolve( path ) ).toLowerCase().replace(/[^@\w]+/g, '-');
}


/**
 * @param {String} path
 *
 * @return {SimpleGit}
 */
export  async function bootGit(path) {

    ensureDirSync( path );

    const git = Git( path );

    if (!(await git.checkIsRepo()))  await git.init();

    if ( (await git.getRemotes())[0] )  return;

    const package_name = packageNameOf( path ),
        userID = await git.raw(['config', '--get', 'user.name']);

    await git.addRemote(
        'origin', `https://github.com/${userID.trim()}/${package_name}.git`
    );

    return git;
}


/**
 * @param {String}   template - Path relative from this package
 * @param {String}   dist     - Path relative from `process.cwd()`
 * @param {Function} [filter]
 */
export  async function copyFrom(template, dist, filter) {

    template = join(meta.path, template);

    await copy(template,  dist,  {overwrite: false, filter});

    const setting = readdirSync( template )
        .filter(file  =>  extname(file) === '.json');

    for (let file of setting) {

        const source = join(template, file), target = join(dist, file);

        await outputJSON(
            target,  patch(await readJSON( target ),  await readJSON( source ))
        );
    }
}


/**
 * @param {String}    path - Project root
 * @param {SimpleGit} git  - Git repository instance of `path`
 */
export  async function setRoot(path, git) {

    await copyFrom('./template', path);

    const ignore_0 = join(path, '.gitignore'),
        ignore_1 = join(path, 'gitignore');

    if (existsSync( ignore_0 ))
        removeSync( ignore_1 );
    else
        moveSync(ignore_1, ignore_0);

    if (! findFile(/ReadMe(\.(md|markdown))?/i, path))
        await outputFile(
            join(path, 'ReadMe.md'),
            `# ${packageNameOf( path )}

WebCell project generated by [create-web-cell](https://web-cell.tk/create-web-cell/)`
        );

    const config = join(path, 'package.json');

    const meta = await readJSON( config );

    meta.author = (await git.raw(['config', '--get', 'user.email'])).trim();

    await outputJSON(config, meta);

    spawn.sync('npm',  ['init', '-y'],  {stdio: 'inherit', cwd: path});

    ensureDirSync( join(path, meta.directories.lib) );
}


function equalLibrary(element, type, key, name, file) {

    const URI = element[ key ];

    return  (element.tagName.toLowerCase() === type)  &&
        URI.includes( name )  &&  URI.includes( file );
}

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
    );

    for (let {type, name, file, path}  of  library) {

        file = file || name;

        var { key, kind } = tagAttribute[ type ], element;

        if (! (element = list.find(
            item  =>  equalLibrary(item, type, key, name, file)
        ))) {
            element = document.createElement( type );

            element[key] = `node_modules/${name}/${path || ''}${file}${
                /\.[^/]+$/.test( file )  ?  ''  :  '.min'
            }.${kind}`;

            if (type === 'link')  element.rel = 'stylesheet';
        }

        document.head.append('    ',  element,  '\n');
    }

    return page;
}
