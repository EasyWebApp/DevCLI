#! /usr/bin/env node

import '@babel/polyfill';

import { creator_meta, boot } from './core';

import Commander from 'commander';


const { meta } = creator_meta;


Commander
    .name( meta.name ).version( meta.version ).description( meta.description )
    .usage('[path] [options]')
    .option(
        '-r, --remote <URL>',
        'Git URL of a Remote repository',
        /^(git|https?).+/
    )
    .parse( process.argv );


boot(process.argv[2] || process.cwd(),  Commander.remote);
