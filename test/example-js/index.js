import {component} from 'web-cell';

import template from './index.html';

import style from './index.css';

import data from './index.json';


export default  component(class ExampleJs extends HTMLElement {

    constructor() {  super().buildDOM(template, style);  }

    static get data() {  return data;  }

    get value() {  return this.$('textarea')[0].value;  }

    set value(raw) {  this.$('textarea')[0].value = raw;  }
});
