import Component from '../source/Component';

import Should from 'should';


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
     * @test {Component#toJS}
     */
    it('Bundle to JS',  async () => {

        var component = new Component('test/example-js');

        component = await component.toJS();

        component.includes( JSON.stringify( CSS ) ).should.be.true();

        component.includes( JSON.stringify( HTML ) ).should.be.true();

        try {
            Should.doesNotThrow(() => eval( component ),  SyntaxError);

        } catch(error) {

            console.warn(`Expected error: ${error.message}`);
        }
    });
});
