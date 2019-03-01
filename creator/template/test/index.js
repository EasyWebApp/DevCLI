import PuppeteerBrowser from 'puppeteer-browser';


var page;

describe('Component',  () => {

    before(async () => page = await PuppeteerBrowser.getPage());
    /**
     * @test {CellHello}
     */
    it('cell-hello',  async () => {

        (await page.$eval('cell-hello',  tag => tag.$('h1')[0].textContent))
            .should.be.equal('Hello, WebCell !');
    });
});
