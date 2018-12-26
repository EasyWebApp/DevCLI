import { upgradeHTML } from '../source/core';


describe('Core methods',  () => {
    /**
     * @test {upgradeHTML}
     */
    it('index.html',  () => {

        const { window: { document } } = upgradeHTML(`
<!DocType HTML>
<html><head>

</head><body>

</body></html>`
        );

        document.querySelectorAll('script[src^="node_modules/"]')
            .should.have.length(5);

        document.querySelectorAll('script[src$="min.js"]')
            .should.have.length(4);
    });
});
