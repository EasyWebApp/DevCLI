#! /usr/bin/env node

import { packageOf, currentModulePath } from '@tech_query/node-toolkit';

import Commander from 'commander';

import { pack } from './command';

import PuppeteerBrowser from 'puppeteer-browser';



const meta = packageOf( currentModulePath() ).meta,
    manifest = packageOf('./test').meta;

const folder = manifest.directories || '';


Commander
    .version( meta.version ).description( meta.description )
    .command(
        'pack',
        'Bundle components to a package with JS modules (or HTML files) in it'
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
