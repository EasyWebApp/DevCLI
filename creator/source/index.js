#! /usr/bin/env node

import '@babel/polyfill';

import { ensureDirSync } from 'fs-extra';

import { boot } from './core';


const cwd = process.argv[2];

if ( cwd )  ensureDirSync( cwd );

boot( cwd );
