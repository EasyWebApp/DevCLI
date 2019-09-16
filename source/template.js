import { prettify } from '@tech_query/node-toolkit';

import { identifierOf } from './utility';


/**
 * @private
 *
 * @return {String}
 */
export function index_html() {

    return `<template>
    <style>
        h1 {
            color: lightblue;
        }
    </style>

    <h1>Hello, WebCell !</h1>
</template>`;
}


/**
 * @private
 *
 * @param {String}   name
 * @param {String[]} [keys=[]]
 *
 * @return {String}
 */
export function index_js(name,  keys = [ ]) {

    return prettify(`
import { component${keys[0] ? ', mapProperty, mapData' : ''} } from 'web-cell';

import template from './index.html';


@component({ template })
export default  class ${identifierOf(name, true)} extends HTMLElement {

    constructor() {  super().construct();  }
${
    keys[0] ? `
    @mapProperty
    static get observedAttributes() {

        return  ${JSON.stringify( keys )};
    }

    @mapData
    attributeChangedCallback() { }` : ''}
}`);
}


/**
 * @private
 *
 * @param {String}   name
 * @param {String[]} page
 *
 * @return {String}
 */
export  function router_js(name, page) {

    return prettify(`import { component } from 'web-cell';

import HTMLRouter, { load } from 'cell-router';


@component()
export default  class ${identifierOf(name, true)}Router extends HTMLRouter {
${page.map(name => {

        name = name.toLowerCase();

        return `
    @load('/${name}')
    ${name}Page() {  return '<page-${name} />';  }
`;}).join('\n')}
}`);
}
