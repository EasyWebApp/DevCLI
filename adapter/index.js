'use strict';

const { ensureDirSync } = require('fs-extra'),
    { join } = require('path'),
    spawn = require('cross-spawn');


const cwd = process.argv[2];

if ( cwd )  ensureDirSync( cwd );

spawn(
    'node',
    [
        join(process.argv[1], '../node_modules/web-cell-cli/dist/web-cell'),
        'boot'
    ],
    {stdio: 'inherit',  cwd}
);
