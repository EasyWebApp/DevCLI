import 'regenerator-runtime/runtime';

import Git from 'simple-git/promise';

import { join, basename } from 'path';

import { currentModulePath } from '@tech_query/node-toolkit';

import {outputFile, readFile, existsSync, statSync, readdir} from 'fs-extra';

import { copyFrom, upgradeHTML } from './utility';

import Component from './Component';

import 'web-cell/dist/polyfill';

import { stringifyDOM } from 'web-cell';

import spawn from 'cross-spawn';


/**
 * Boot current directory as a WebCell project
 */
export  async function boot() {

    console.time('Boot project');

    const git = Git();

    if (!(await git.checkIsRepo()))  await git.init();

    spawn('npm',  ['init', '-y'],  {stdio: 'inherit'});

    await copyFrom(join(currentModulePath(), '../../template'));

    await outputFile(
        'index.html',  stringifyDOM( upgradeHTML(await readFile('index.html')) )
    );

    console.info('--------------------');

    console.timeEnd('Boot project');

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
