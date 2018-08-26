# WebCell DevCLI

Developer command-line tool for [WebCell](https://web-cell.tk/)

[![NPM Dependency](https://david-dm.org/EasyWebApp/DevCLI.svg)](https://david-dm.org/EasyWebApp/DevCLI)

[![NPM](https://nodei.co/npm/web-cell-cli.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/web-cell-cli/)



## Feature

 1. Bundle components to a package with **JS modules** (or HTML files) in it

 2. Support to import **HTML** & **CSS** (LESS, SASS/SCSS or Stylus) as a `String`, **JSON** as an `Object` in ES module

 3. **Real-time preview** during development in Chrome, Firefox or IE



## Usage

 1. `npm install web-cell-cli -D`

 2. refer [BootCell][1] to [configure the **Source directory**](https://github.com/EasyWebApp/BootCell/blob/master/package.json#L6)

 3. refer [BootCell][1] to [configure the **NPM script**](https://github.com/EasyWebApp/BootCell/blob/master/package.json#L13)

 4. `npm run your_script`



### Command

  Usage: `web-cell [options] [command]`

  Options:

    -H, --HTML  Bundle as HTML
    -h, --help  output usage information

  Commands:

    pack        Bundle components to a package with JS modules (or HTML files) in it
    preview     Real-time preview during development
    help [cmd]  display help for [cmd]



[1]: https://github.com/EasyWebApp/BootCell "Offical component library of WebCell (based on BootStrap v4)"
