import Component from '../source/Component';

import { stringifyDOM } from 'dom-renderer';

import { readFile } from 'fs-extra';

import { join } from 'path';

import { toDataURI } from '@tech_query/node-toolkit';


/**
 * @test {Component}
 */
describe('Core class',  () => {

    var style, template, fragment;

    /**
     * @test {Component.parseCSS}
     */
    it('Parse CSS files',  async () => {

        const file = 'test/example-js/index.css';

        style = await Component.parseCSS( file );

        style.tagName.should.be.equal('STYLE');

        style.textContent.should.be.equal((await readFile( file )) + '');
    });

    /**
     * @test {Component.parseHTML}
     */
    it('Parse pure HTML',  async () => {

        const file = 'test/example-js/index.html';

        template = await Component.parseHTML( file );

        template.nodeType.should.be.equal( 11 );

        stringifyDOM( template ).should.be.equal(
            (await readFile( file )) + ''
        );
    });

    describe('Parse mixed HTML',  () => {

        before(async () =>
            fragment = await Component.parseHTML('test/example-html/index.html')
        );

        /**
         * @test {Component.findStyle}
         * @test {Component.parseCSS}
         */
        it('Find & Parse styles',  async () => {

            const styles = Component.findStyle( fragment );

            styles.map(element => element.tagName).should.be.eql([
                'LINK', 'STYLE'
            ]);

            const element = await Component.parseCSS(
                styles[1].textContent,
                styles[1].type,
                'test/example-html/index.css'
            );

            element.textContent.trim().should.be.equal(`
textarea {
  outline: none;
}
textarea {
  display: block;
}`.trim()
            );
        });

        /**
         * @test {Component.packJS}
         */
        it('Parse script',  () => {

            const code = Component.packJS(join(
                'test/example-html/', fragment.lastElementChild.getAttribute('src')
            ));

            (() => eval( code )).should.not.throw( SyntaxError );

            code.should.containEql('\'example-html\'');
        });
    });

    /**
     * @test {Component#toHTML}
     */
    it('Bundle to HTML',  async () => {

        const fragment = await (new Component('test/example-html')).toHTML(),
            tagName = element => element.tagName;

        Array.from(fragment.children, tagName).should.be.eql(
            ['TEMPLATE', 'SCRIPT']
        );

        Array.from(fragment.firstElementChild.content.children, tagName)
            .should.be.eql(['STYLE', 'STYLE', 'TEXTAREA']);
    });

    /**
     * @test {Component#toJS}
     */
    it('Bundle to JS',  async () => {

        var component = await (new Component('test/example-js')).toJS();

        component.includes(
            JSON.stringify( style.textContent ).slice(1, -1)
        ).should.be.true();

        component.includes(
            JSON.stringify( stringifyDOM( template ) )
                .slice(1, -1).replace(/\\"/g, '"')
        ).should.be.true();

        component.includes('name: \'Web components\'').should.be.true();

        component.includes(
            toDataURI('test/example-js/icon.svg')
        ).should.be.true();

        (() => eval( component )).should.not.throw( SyntaxError );
    });
});
