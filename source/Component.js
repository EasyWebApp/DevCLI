import 'regenerator-runtime/runtime';

import {readFile, readdir, statSync, outputFile, remove} from 'fs-extra';

import {join, basename, dirname, extname} from 'path';

import Package from 'amd-bundle';

import LESS from 'less';

import * as SASS from 'sass';

import { parseStylus, folderOf, metaOf } from './utility';

import 'web-cell/dist/polyfill';

import { $, stringifyDOM } from 'web-cell';

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

        const paths = [dirname( base )];

        switch ( type ) {
            case 'css':       style = source;  break;
            case 'sass':
            case 'scss':
                style = SASS.renderSync({
                    data:          source,
                    includePaths:  paths
                }).css;
                break;
            case 'less':
                style = (await LESS.render(source,  { paths })).css;
                break;
            case 'stylus':
                style = await parseStylus(source,  { paths });
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

        return  $('link[rel="stylesheet"]', fragment).concat(
            [ ].concat(
                ... $('template', fragment).map(
                    template  =>  $('style', template.content)
                )
            )
        );
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
            name  ||  this.identifierOf( basename( dirname( path ) ) )
        );
    }

    /**
     * @param {string} path
     *
     * @return {Element}
     */
    static parseJS(path) {

        return  Object.assign(document.createElement('script'), {
            text:  `\n${this.packJS( path )}\n`
        });
    }

    /**
     * @return {DocumentFragment} HTML version bundle of this component
     */
    async toHTML() {

        const fragment = await Component.parseHTML(this.entry + '.html'),
            CSS = [ ];

        for (let sheet  of  Component.findStyle( fragment )) {

            let style = await Component.parseCSS(
                sheet.textContent  ||  join(this.path, sheet.getAttribute('href')),
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
            script.replaceWith(
                Component.parseJS( join(this.path, script.getAttribute('src')) )
            );

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
