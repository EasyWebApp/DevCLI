export const tagAttribute = {
    script:  {
        key:   'src',
        kind:  'js'
    },
    link:    {
        key:   'href',
        kind:  'css'
    }
};


export const library = [
    {
        name:  '@babel/polyfill',
        file:  'polyfill',
        path:  'dist/',
        type:  'script'
    },
    {
        name:  '@webcomponents/webcomponentsjs',
        file:  'webcomponents-bundle',
        type:  'script'
    },
    {
        name:  '@webcomponents/webcomponentsjs',
        file:  'custom-elements-es5-adapter.js',
        type:  'script'
    },
    {
        name:  'dom-renderer',
        path:  'dist/',
        type:  'script'
    },
    {
        name:  'web-cell',
        path:  'dist/',
        type:  'script'
    }
];
