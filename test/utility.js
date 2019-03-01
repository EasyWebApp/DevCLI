import { identifierOf } from '../source/utility';


describe('Utility methods',  () => {
    /**
     * @test {identifierOf}
     */
    it(
        'Tag name to Class name',
        () => identifierOf('example-js', true).should.be.equal('ExampleJs')
    );
});
