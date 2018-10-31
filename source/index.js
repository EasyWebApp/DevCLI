#! /usr/bin/env node

import { packageOf, currentModulePath } from '@tech_query/node-toolkit';

import { meta } from './utility';

import Commander from 'commander';

import { pack, boot } from './command';

import PuppeteerBrowser from 'puppeteer-browser';



const currentPackage = packageOf( currentModulePath() ).meta;

const folder = meta ? meta.directories : '';

async function safePack(exit) {
    try {
        await pack( folder.lib );

    } catch (error) {

        console.error( error );

        if (exit === true)  process.exit( 1 );
    }
}

Commander
    .version( currentPackage.version ).description( currentPackage.description )
    .command('boot',  'Boot current directory as a WebCell project')
    .on('command:boot',  boot)
    .command('pack',  'Bundle components to a package with JS modules in it')
    .on('command:pack',  safePack.bind(null, true))
    .command('preview',  'Real-time preview during development')
    .on('command:preview',  async () => {

        await safePack( true );

        await PuppeteerBrowser.getPage(
            '.',  folder.test || 'test/',  safePack
        );
    })
    .parse( process.argv );
