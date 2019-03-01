#! /usr/bin/env node

import '@babel/polyfill';

import { boot } from './core';

import Commander from 'commander';

import config from '../package.json';


const meta = JSON.parse( config );


Commander
    .name( meta.name ).version( meta.version ).description( meta.description )
    .usage('[path] [options]')
    .option(
        '-r, --remote <URL>',
        'Git URL of a Remote repository',
        /^(git|https?).+/
    )
    .option('-A, --app',  'Add extensions for WebSite or WebApp')
    .parse( process.argv );


boot(process.argv[2] || process.cwd(),  Commander.remote,  Commander.app);
