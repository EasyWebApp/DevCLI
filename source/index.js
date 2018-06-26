import 'babel-polyfill';

import {readFileSync} from 'fs';

import {pack} from './command';

import Commander from 'commander';

import PuppeteerBrowser from 'puppeteer-browser';



const manifest = JSON.parse(readFileSync('package.json') + '');

const folder = manifest.directories || '';


Commander
    .command(
        'pack',  'Bundle components to a package within JS modules (or HTML files)'
    )
    .on('command:pack',  () => pack(folder.lib, Commander.HTML))
    .command('preview',  'Real-time preview during development')
    .on('command:preview',  async () => {

        const command = () => pack(folder.lib, Commander.HTML);

        await command();

        await PuppeteerBrowser.getPage('.',  folder.test || 'test/',  command);
    })
    .option('-H, --HTML',  'Bundle as HTML')
    .parse( process.argv );
