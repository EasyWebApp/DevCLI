import {component} from 'web-cell';


export default  component(class ExampleHtml extends HTMLElement {

    constructor() {  super().construct();  }

    static get data() {  return  {name: 'Web components'};  }

    get value() {  return this.$('textarea')[0].value;  }

    set value(raw) {  this.$('textarea')[0].value = raw;  }
});
