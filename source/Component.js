import {readFile, readdir, statSync, outputFile, remove} from 'fs-extra';

import {join, basename, dirname} from 'path';

import { JSDOM } from 'jsdom';

import Package from 'amd-bundle';

import * as SASS from 'sass';

import * as LESS from 'less';

import Stylus from 'stylus';

import promisify from 'promisify-node';

const renderSASS = promisify( SASS.render ),
    renderStylus = promisify( Stylus.render ),
    document = (new JSDOM()).window.document;



export default  class Component {
    /**
     * @param {string} path - Component directory
     */
    constructor(path) {

        this.path = path;

        this.name = basename( path );

        this.entry = join(path, 'index');
    }

    /**
     * @param {string} path - File path
     *
     * @return {string} File content
     */
    static async loadFile(path) {

        return  path.includes('\n')  ?  path  :  ((await readFile( path )) + '');
    }

    static async parseHTML(path) {

        return  JSDOM.fragment(await Component.loadFile( path ));
    }

    static async parseSASS(path) {

        return  renderSASS({data:  await Component.loadFile( path )});
    }

    static async parseLESS(path) {

        return  await LESS.render(await Component.loadFile( path ));
    }

    static async parseStylus(path) {

        return  await renderStylus(await Component.loadFile( path ));
    }

    /**
     * @param {string} type - MIME type
     * @param {string} path - File path
     *
     * @return {?Element} Style element
     */
    static async parseCSS(type, path) {

        var style;

        switch ( type.split('/')[1] ) {
            case 'css':       style = await Component.loadFile( path );     break;
            case 'sass':
            case 'scss':      style = await Component.parseSASS( path );    break;
            case 'less':      style = await Component.parseLESS( path );    break;
            case 'stylus':    style = await Component.parseStylus( path );
        }

        return  style && Object.assign(
            document.createElement('style'),  {textContent: style}
        );
    }

    /**
     * @param {DocumentFragment} fragment
     *
     * @return {Element[]}
     */
    static findStyle(fragment) {

        return [
            ... fragment.querySelectorAll('link[rel="stylesheet"]'),
            ... [ ].concat(... Array.from(
                fragment.querySelectorAll('template'),
                template  =>  [... template.content.querySelectorAll('style')]
            ))
        ];
    }

    /**
     * @param {string} tagName
     *
     * @return {string}
     */
    static identifierOf(tagName) {

        return  tagName[0].toUpperCase() +
            tagName.replace(/-(\w)/g,  (_, char) => char.toUpperCase()).slice(1);
    }

    /**
     * @param {string} path
     *
     * @return {Element}
     */
    static parseJS(path) {

        path = path.split('.').slice(0, -1).join('.');

        return  Object.assign(document.createElement('script'), {
            text:  `\n${
                (new Package( path )).bundle(
                    this.identifierOf( basename( dirname( path ) ) )
                )}\n`
        });
    }

    /**
     * @param {DocumentFragment} fragment
     *
     * @return {string}
     */
    static stringOf(fragment) {

        return Array.from(
            fragment.childNodes,
            node  =>  node[(node.nodeType === 1) ? 'outerHTML' : 'nodeValue']
        ).join('');
    }

    /**
     * @return {string} HTML version bundle of this component
     */
    async toHTML() {

        const fragment = await Component.parseHTML(this.entry + '.html');

        for (let sheet  of  Component.findStyle( fragment )) {

            let style = await Component.parseCSS(
                sheet.type,
                sheet.textContent  ||  join(this.path, sheet.getAttribute('href'))
            );

            if ( style )  sheet.replaceWith( style );
        }

        const script = fragment.querySelector('script');

        if ( script )
            script.replaceWith(
                Component.parseJS( join(this.path, script.getAttribute('src')) )
            );

        return  Component.stringOf( fragment );
    }

    /**
     * @return {string} JS version bundle of this component
     */
    async toJS() {

        const temp_file = [ ];

        for (let file  of  await readdir( this.path )) {

            file = join(this.path, file);

            if (! statSync( file ).isFile())  continue;

            let type = file.split('.').slice(-1)[0], temp = `${file}.js`;

            switch ( type ) {
                case 'html':    file = await this.toHTML();    break;
                case 'js':      continue;
                default:
                    file = await Component.parseCSS(type, file).textContent;
            }

            temp_file.push( temp );

            await outputFile(temp,  `export default ${JSON.stringify( file )}`);
        }

        const source = (new Package( this.entry )).bundle();

        await Promise.all( temp_file.map(file => remove( file )) );

        return source;
    }
}
