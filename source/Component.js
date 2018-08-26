import {readFile, readdir, statSync, outputFile, remove} from 'fs-extra';

import {join, basename, dirname, extname} from 'path';

import { JSDOM } from 'jsdom';

import Package from 'amd-bundle';

import LESS from 'less';

import * as SASS from 'sass';

import { parseStylus } from './utility';

const document = (new JSDOM()).window.document;


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

        return  JSDOM.fragment((await readFile( path )) + '');
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
     * @return {string} JS version bundle of this component
     */
    async toJS() {

        const temp_file = [ ];

        for (let file  of  await readdir( this.path )) {

            file = join(this.path, file);

            if (! statSync( file ).isFile())  continue;

            let type = file.split('.').slice(-1)[0], temp = `${file}.js`;

            switch ( type ) {
                case 'html':
                    file = JSON.stringify(
                        Component.stringOf(await this.toHTML())
                    );
                    break;
                case 'js':
                    continue;
                case 'json':
                    file = (await readFile( file )) + '';    break;
                default:
                    file = JSON.stringify(
                        (await Component.parseCSS( file )).textContent
                    );
            }

            temp_file.push( temp );

            await outputFile(temp,  `export default ${file}`);
        }

        const source = (new Package( this.entry )).bundle(
            Component.identifierOf( this.name )
        );

        await Promise.all( temp_file.map(file => remove( file )) );

        return source;
    }
}
