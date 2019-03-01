#! /usr/bin/env node

const { getNPMConfig, setNPMConfig } = require('@tech_query/node-toolkit');

var browser = ['chrome', 'firefox'].find(name => getNPMConfig( name ));


if (browser = browser  ||  ((process.platform === 'win32') && 'IE'))
    setNPMConfig('PUPPETEER_BROWSER', browser);
