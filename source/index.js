import 'babel-polyfill';

import {join} from 'path';

import {
    readFileSync, outputFile, existsSync, statSync, readdirSync, appendFile
} from 'fs-extra';

import Commander from 'commander';

import Component from './Component';

import PuppeteerBrowser from 'puppeteer-browser';



const manifest = JSON.parse(readFileSync('package.json') + '');

const folder = manifest.directories || '';


async function build(path) {

    const component = new Component( path );

    await component.parse();

    await outputFile(`dist/${component.name}.html`,  component + '');
}

async function bundle(path) {

    if (existsSync( join(path, 'index.html') ))  await build( path );

    if (statSync( path ).isDirectory())
        for (let file  of  readdirSync( path ))
            await build( join(path, file) );
}

const command_bundle = bundle.bind(null, folder.lib);


async function pack(path) {

    const index = join(path, 'index.html');

    await outputFile(index, '');

    for (let HTML  of  readdirSync( path ))  if (HTML !== 'index.html') {

        await appendFile(index,  `<!-- ${HTML} -->\n${
            readFileSync( join(path, HTML) )
        }`);

        console.info(`√ Component "${HTML}" is packed in`);
    }
}


Commander
    .command('bundle',  'Bundle a component')
    .on('command:bundle',  command_bundle)
    .command('preview',  'Real-time preview during development')
    .on('command:preview',  async () => {

        await command_bundle();

        await PuppeteerBrowser.getPage(
            '.',  folder.test || 'test/',  command_bundle
        );
    })
    .command('pack',  'Compress all the components into one HTML file')
    .on('command:pack',  async () => {

        await command_bundle(),  await pack('dist/');
    })
    .parse( process.argv );
