# WebCell DevCLI

Developer command-line tool for [WebCell](https://web-cell.tk/)

[![NPM Dependency](https://david-dm.org/EasyWebApp/DevCLI.svg)](https://david-dm.org/EasyWebApp/DevCLI)

[![NPM](https://nodei.co/npm/web-cell-cli.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/web-cell-cli/)



## Feature

 1. Bundle components to a package with **JS modules** in it

 2. Support to import **HTML** & **CSS** (LESS, SASS/SCSS or Stylus) as a `String`, **JSON** as an `Object`, and other assets as **Data URI** in ES module

 3. **Real-time preview** during development in Chrome, Firefox or IE



## Usage

 1. `npm install web-cell-cli @babel/preset-env @babel/plugin-proposal-decorators -D`

 2. refer [Material Cell][1] to [configure the **Source directory**](https://github.com/EasyWebApp/material-cell/blob/master/package.json#L24)

 3. refer [Material Cell][1] to [configure the **NPM script**](https://github.com/EasyWebApp/material-cell/blob/master/package.json#L29)

 4. refer [Material Cell][1] to [configure **Babel**](https://github.com/EasyWebApp/material-cell/blob/master/package.json#L55)

 5. `npm run your_script`



### Command

    Usage: web-cell [options] [command]

    Options:

        -V, --version  output the version number
        -h, --help     output usage information

    Commands:

        pack           Bundle components to a package with JS modules in it
        preview        Real-time preview during development
        help [cmd]     display help for [cmd]



## Typical case

 1. [Cell Router](https://easywebapp.github.io/cell-router/)

 2. [Material Cell][1]



[1]: https://web-cell-ht.ml "Offical component library of WebCell (based on Material Design lite v1.3)"
