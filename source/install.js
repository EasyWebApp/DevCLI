#! /usr/bin/env node

import { getNPMConfig, setNPMConfig } from '@tech_query/node-toolkit';

var browser;


for (let name  of  ['chrome', 'firefox'])  if (getNPMConfig( name )) {

    browser = name;    break;
}


if (browser = browser  ||  ((process.platform === 'win32') && 'IE'))
    setNPMConfig('PUPPETEER_BROWSER', browser);
