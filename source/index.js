#! /usr/bin/env node

import '@babel/polyfill';

import Commander from 'commander';

import { spawn } from '@tech_query/node-toolkit';

import { folderOf } from './utility';

import { createCell, createRouter, pack } from './command';

import PuppeteerBrowser from 'puppeteer-browser';

import config from '../package.json';


const meta = JSON.parse( config ), folder = folderOf();


async function safePack(exit) {
    try {
        await pack( folder.lib );

    } catch (error) {

        console.error( error );

        if (exit === true)  process.exit( 1 );
    }
}

Commander
    .name('web-cell')
    .version( meta.version )
    .description( meta.description )
    .command('boot [path] [options]',  'Boot a directory as a WebCell project')
    .on(
        'command:boot',
        parameter => spawn(
            'npm',  ['init', 'web-cell'].concat( parameter ),  {stdio: 'inherit'}
        )
    )
    .command(
        'new <name> [attributes]',
        `Create a Component from Code template
                           (Attributes should be separated by commas)`
    )
    .on('command:new',  ([name, keys]) =>
        createCell(name,  folder.lib,  (keys || '').split(','),  true)
    )
    .command(
        'new-router <name> [pages]',
        `Create a Router from Code template
                           (Pages should be separated by commas)`
    )
    .on(
        'command:new-router',
        ([name, page])  =>  createRouter(name, folder.lib, (page || '').split(','))
    )
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
