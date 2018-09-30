#! /usr/bin/env node

import { packageOf, currentModulePath } from '@tech_query/node-toolkit';

import Commander from 'commander';

import { pack } from './command';

import PuppeteerBrowser from 'puppeteer-browser';



const meta = packageOf( currentModulePath() ).meta,
    manifest = packageOf('./test').meta;

const folder = manifest.directories || '';

async function safePack(exit) {
    try {
        await pack(folder.lib, Commander.HTML);

    } catch (error) {

        console.error( error );

        if (exit === true)  process.exit( 1 );
    }
}

Commander
    .version( meta.version ).description( meta.description )
    .command(
        'pack',
        'Bundle components to a package with JS modules (or HTML files) in it'
    )
    .on('command:pack',  safePack.bind(null, true))
    .command('preview',  'Real-time preview during development')
    .on('command:preview',  async () => {

        await safePack( true );

        await PuppeteerBrowser.getPage(
            '.',  folder.test || 'test/',  safePack
        );
    })
    .option('-H, --HTML',  'Bundle as HTML')
    .parse( process.argv );
