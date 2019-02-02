import { component } from 'web-cell';


@component({
    template:  'Hello, WebCell !'
})
export default  class CellHello extends HTMLElement {

    constructor() {  super().buildDOM();  }
}
