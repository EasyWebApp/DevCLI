import {readFile} from 'fs-extra';

import {join, basename, dirname} from 'path';

import { JSDOM } from 'jsdom';

import Package from 'amd-bundle';

import * as SASS from 'sass';

import * as LESS from 'less';

import Stylus from 'stylus';


function promisify(func) {

    return  function (... parameter) {

        return  new Promise(
            (resolve, reject)  =>  func.apply(this, parameter.concat(
                (error, result)  =>
                    error  ?  reject( error )  :  resolve( result )
            ))
        );
    };
}

const renderSASS = promisify( SASS.render ),
    renderStylus = promisify( Stylus.render ),
    document = (new JSDOM()).window.document;


export default  class Component {

    constructor(path) {

        this.path = path;

        this.name = basename( path );

        this.entry = join(path, 'index.html');

        this.fragment = null;
    }

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

    static async parseCSS(type, path) {

        var style;

        switch ( type.split('/')[1] ) {
            case 'sass':
            case 'scss':    style = await Component.parseSASS( path );  break;
            case 'less':    style = await Component.parseLESS( path );  break;
            case 'stylus':    style = await Component.parseStylus( path );
        }

        return  style && Object.assign(
            document.createElement('style'),  {textContent: style}
        );
    }

    static findStyle(fragment) {

        return [
            ... fragment.querySelectorAll('link[rel="stylesheet"]'),
            ... [ ].concat(... Array.from(
                fragment.querySelectorAll('template'),
                template  =>  [... template.content.querySelectorAll('style')]
            ))
        ];
    }

    static identifierOf(tagName) {

        return  tagName[0].toUpperCase() +
            tagName.replace(/-(\w)/g,  (_, char) => char.toUpperCase()).slice(1);
    }

    static parseJS(path) {

        path = path.split('.').slice(0, -1).join('.');

        return  Object.assign(document.createElement('script'), {
            text:  `\n${
                (new Package( path )).bundle(
                    Component.identifierOf( basename( dirname( path ) ) )
                )}\n`
        });
    }

    async parse() {

        this.fragment = await Component.parseHTML( this.entry );

        for (let sheet  of  Component.findStyle( this.fragment )) {

            let style = await Component.parseCSS(
                sheet.type,
                sheet.textContent  ||  join(this.path, sheet.getAttribute('href'))
            );

            if ( style )  sheet.replaceWith( style );
        }

        const script = this.fragment.querySelector('script');

        script.replaceWith(
            Component.parseJS( join(this.path, script.getAttribute('src')) )
        );
    }

    toString() {

        return Array.from(
            this.fragment.childNodes,
            node  =>  node[(node.nodeType === 1) ? 'outerHTML' : 'nodeValue']
        ).join('');
    }
}
