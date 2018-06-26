import {component} from 'web-cell';

import HTML from './index.html';

import CSS from './index.css';


export default  component(class ExampleJs extends HTMLElement {

    constructor() {  super().buildDOM(HTML, CSS);  }

    static get data() {  return  {name: 'Web components'};  }

    get value() {  return this.$('textarea')[0].value;  }

    set value(raw) {  this.$('textarea')[0].value = raw;  }
});
