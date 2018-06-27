import Component from '../source/Component';

import Should from 'should';

import {join} from 'path';


function SyntaxRight(code) {
    try {
        Should.doesNotThrow(() => eval( code ),  SyntaxError);

    } catch (error) {

        console.warn(`Expected error: ${error.message}`);
    }
}


/**
 * @test {Component}
 */
describe('Core class',  () => {

    var CSS, HTML;

    /**
     * @test {Component.loadFile}
     * @test {Component.parseCSS}
     */
    it('Parse CSS',  async () => {

        const file = 'test/example-js/index.css';

        const style = await Component.parseCSS( file );

        style.tagName.should.be.equal('STYLE');

        style.textContent.should.be.equal(CSS = await Component.loadFile( file ));
    });

    /**
     * @test {Component.identifierOf}
     */
    it(
        'Tag name to Class name',
        () => Component.identifierOf('example-js').should.be.equal('ExampleJs')
    );

    /**
     * @test {Component.parseHTML}
     * @test {Component.stringOf}
     */
    it('Parse HTML',  async () => {

        const file = 'test/example-js/index.html';

        const template = await Component.parseHTML( file );

        template.nodeType.should.be.equal( 11 );

        Component.stringOf( template ).should.be.equal(
            HTML = await Component.loadFile( file )
        );
    });

    /**
     * @test {Component.findStyle}
     * @test {Component.parseJS}
     */
    it('Find styles & Parse script',  async () => {

        const fragment = await Component.parseHTML('test/example-html/index.html');

        Component.findStyle( fragment ).map(element => element.tagName)
            .should.be.eql(['LINK', 'STYLE']);

        SyntaxRight(
            Component.parseJS(join(
                'test/example-html/', fragment.lastElementChild.getAttribute('src')
            )).text
        );
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

        var component = new Component('test/example-js');

        component = await component.toJS();

        component.includes( JSON.stringify( CSS ) ).should.be.true();

        component.includes( JSON.stringify( HTML ) ).should.be.true();

        component.includes('"name": "Web components"').should.be.true();

        SyntaxRight( component );
    });
});
