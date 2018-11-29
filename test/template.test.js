import { upgradeHTML } from '../source/utility';

import { $ } from 'web-cell';


describe('"boot" command',  () => {
    /**
     * @test {upgradeHTML}
     */
    it('index.html',  () => {

        const document = upgradeHTML(`
<!DocType HTML>
<html><head>

</head><body>

</body></html>`
        );

        $('script[src^="node_modules/"]', document).should.have.length(5);

        $('script[src$="min.js"]', document).should.have.length(4);
    });
});
