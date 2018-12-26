#! /usr/bin/env node

import '@babel/polyfill';

import { bootGit, setRoot, upgradeHTML } from './core';

import { join } from 'path';

import { outputFile, readFile } from 'fs-extra';

import spawn from 'cross-spawn';


/**
 * Boot a directory as a WebCell project
 *
 * @param {String} [cwd='.'] - Current working directory
 */
async function boot(cwd = '.') {

    console.time('Boot project');

    await setRoot(cwd,  await bootGit( cwd ));

    const entry = join(cwd, 'index.html');

    await outputFile(entry,  upgradeHTML(await readFile( entry )).serialize());

    console.info('--------------------');

    console.timeEnd('Boot project');

    console.info('');

    spawn.sync('npm',  ['install'],  {stdio: 'inherit', cwd});

    spawn.sync('npm',  ['run', 'format'],  {stdio: 'inherit', cwd});
}


boot(process.argv[2] || process.cwd());
