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
    .option(
        '-A, --app [pages]',
        'Router/Page names for Web-site/app (Pages should be separated by commas)'
    )
    .parse( process.argv );


boot(
    Commander.args[0] || process.cwd(),
    Commander.remote,
    ((typeof Commander.app === 'string') ? Commander.app : 'index').split(',')
);
