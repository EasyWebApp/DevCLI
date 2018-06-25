import 'babel-polyfill';

import {readFileSync} from 'fs';

import {bundle, pack} from './command';

import Commander from 'commander';

import PuppeteerBrowser from 'puppeteer-browser';



const manifest = JSON.parse(readFileSync('package.json') + '');

const folder = manifest.directories || '';


Commander
    .command('bundle',  'Bundle components to JS modules (or HTML files)')
    .on('command:bundle',  () => bundle(folder.lib, Commander.HTML))
    .command('preview',  'Real-time preview during development')
    .on('command:preview',  async () => {

        const command = () => bundle(folder.lib, Commander.HTML);

        await command();

        await PuppeteerBrowser.getPage('.',  folder.test || 'test/',  command);
    })
    .command('pack',  'Pack all components into one HTML file')
    .on('command:pack',  async () => {

        await bundle(folder.lib, true),  await pack('dist/');
    })
    .option('-H, --HTML',  'Bundle as HTML')
    .parse( process.argv );
