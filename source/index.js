import 'babel-polyfill';

import {join} from 'path';

import {readFileSync, outputFile, existsSync, statSync, readdirSync} from 'fs-extra';

import Commander from 'commander';

import {watch} from 'chokidar';

import Component from './Component';

import * as PuppeteerBrowser from 'puppeteer-browser';


const manifest = JSON.parse(readFileSync('package.json') + '');

const folder = manifest.directories || '';


async function build(path) {

    const component = new Component( path );

    await component.parse();

    await outputFile(`dist/${component.name}.html`,  component + '');
}

async function bundle(path) {

    if (existsSync( join(path, 'index.html') ))  await build( path );

    if (statSync( path ).isDirectory())
        await Promise.all(
            readdirSync( path ).map(file  =>  build( join(path, file) ))
        );
}

const command_bundle = bundle.bind(null, folder.lib);


Commander
    .command('bundle',  'Bundle a component')
    .on('command:bundle',  command_bundle)
    .command('preview',  'Real-time preview during development')
    .on('command:preview',  async () => {

        await command_bundle();

        const page = await PuppeteerBrowser.getPage('.',  folder.test || 'test/');

        watch( folder.lib ).on('all',  async () => {

            await command_bundle();

            await page.reload();
        });
    })
    .parse( process.argv );
