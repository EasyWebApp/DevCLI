import { component, blobURI } from 'web-cell';

import template from './index.html';

import style from './index.css';

import data from './index.json';

import icon from './icon.svg';


@component({ template, style, data })
export default  class ExampleJs extends HTMLElement {

    constructor() {  super().construct();  }

    get value() {  return this.$('textarea')[0].value;  }

    set value(raw) {  this.$('textarea')[0].value = raw;  }

    @blobURI
    static get icon() {  return icon;  }
}
