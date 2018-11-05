import { setPackage, upgradeHTML } from '../source/utility';


describe('"boot" command',  () => {
    /**
     * @test {setPackage}
     */
    it('package.json',  () => setPackage({ }).should.be.fulfilledWith({
        name:         'devcli',
        description:  'Developer command-line tool for [WebCell](https://web-cell.tk/)',
        homepage:     'https://github.com/EasyWebApp/DevCLI/',
        repository:   {
            type:  'git',
            url:   'https://github.com/EasyWebApp/DevCLI.git'
        },
        bugs:         {
            url:  'https://github.com/EasyWebApp/DevCLI/issues/'
        }
    }));

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

        document.querySelectorAll('script[src^="node_modules/"]')
            .should.have.length(5);

        document.querySelectorAll('script[src$="min.js"]')
            .should.have.length(4);
    });
});
