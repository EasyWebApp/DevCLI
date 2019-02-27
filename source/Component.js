import 'dom-renderer/dist/polyfill';

import { stringifyDOM } from 'dom-renderer';

import {readFile, readdir, statSync, outputFile, remove} from 'fs-extra';

import {join, basename, dirname, extname} from 'path';

import Package from 'amd-bundle';

import * as Parser from './parser';

import { folderOf, metaOf } from './utility';

import { toDataURI } from '@tech_query/node-toolkit';


/**
 * Component packer
 */
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
     * @param {string} path
     *
     * @return {DocumentFragment}
     */
    static async parseHTML(path) {

        const box = document.createElement('div'),
            fragment = document.createDocumentFragment();

        box.innerHTML = (await readFile( path ))  +  '';

        fragment.append(... box.childNodes);

        return fragment;
    }

    /**
     * @param {string}  source - File path or Style source code
     * @param {?string} type   - MIME type
     * @param {string}  [base] - Path of the file which `@import` located in
     *
     * @return {?Element} Style element
     */
    static async parseCSS(source, type, base) {

        var style;

        type = type  ?  type.split('/')[1]  :  extname( source ).slice(1);

        if (! source.includes('\n'))
            source = await readFile(base = source) + '';

        style = Parser[type]  &&  await Parser[type](source, dirname( base ));

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

        return  [ ].concat.apply([ ],  Array.from(
            fragment.querySelectorAll('link[rel="stylesheet"], template'),
            tag  =>  tag.content ?
                Array.from( tag.content.querySelectorAll('style') )  :  tag
        ));
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
     * @param {String} path - Full name of a JS file
     *
     * @return {String} Packed JS source code
     */
    static packJS(path) {

        const single_entry = join(folderOf().lib || '',  'index.js');

        const name = (path === single_entry)  &&  metaOf().name;

        path = path.split('.').slice(0, -1).join('.');

        return  (new Package( path )).bundle(
            name  ||  basename( dirname( path ) )
        );
    }

    /**
     * @return {DocumentFragment} HTML version bundle of this component
     */
    async toHTML() {

        const fragment = await Component.parseHTML(this.entry + '.html'),
            CSS = [ ];

        for (let sheet  of  Component.findStyle( fragment )) {

            let style = await Component.parseCSS(
                (sheet.tagName === 'STYLE')  ?
                    sheet.textContent  :  join(this.path, sheet.getAttribute('href')),
                sheet.type,
                this.entry + '.css'
            );

            if (! style)  continue;

            sheet.replaceWith( style );

            if (style.parentNode === fragment)  CSS.push( style );
        }

        fragment.querySelector('template').content.prepend(... CSS);

        const script = fragment.querySelector('script');

        if ( script )
            script.replaceWith(Object.assign(document.createElement('script'), {
                text:  `\n${
                    Component.packJS( join(this.path, script.getAttribute('src')) )
                }\n`
            }));

        return fragment;
    }

    /**
     * @protected
     *
     * @param {String} file - File path
     *
     * @return {String} Legal ECMAScript source code
     */
    async assetOf(file) {

        switch ( extname( file ).slice(1) ) {
            case 'html':
            case 'htm':
                file = stringifyDOM(await this.toHTML());  break;
            case 'css':
            case 'less':
            case 'sass':
            case 'scss':
            case 'stylus':
                file = (await Component.parseCSS( file )).textContent;  break;
            case 'js':
                return;
            case 'json':
                return  (await readFile( file )) + '';
            case 'yaml':
            case 'yml':
                return  Parser.yaml((await readFile( file )) + '');
            default:
                file = toDataURI( file );
        }

        return  JSON.stringify( file );
    }

    /**
     * @return {string} JS version bundle of this component
     */
    async toJS() {

        const temp_file = [ ];

        for (let file  of  await readdir( this.path )) {

            file = join(this.path, file);

            if (! statSync( file ).isFile())  continue;

            let temp = `${file}.js`;

            file = await this.assetOf( file );

            if (!(file != null))  continue;

            temp_file.push( temp );

            await outputFile(temp,  `export default ${file}`);
        }

        const source = Component.packJS(this.entry + '.js');

        await Promise.all( temp_file.map(file => remove( file )) );

        return source;
    }
}
