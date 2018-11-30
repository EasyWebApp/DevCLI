# WebCell DevCLI

Developer command-line tool for [WebCell](https://web-cell.tk/)

[![NPM Dependency](https://david-dm.org/EasyWebApp/DevCLI.svg)](https://david-dm.org/EasyWebApp/DevCLI)

[![NPM](https://nodei.co/npm/web-cell-cli.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/web-cell-cli/)



## Feature

 1. Boot current directory as a **WebCell project**

 2. Bundle components to a package with **JS modules** in it

 3. Support to import **HTML** & **CSS** (LESS, SASS/SCSS or Stylus) as a `String`, **JSON** as an `Object`, and other assets as **Data URI** in ES module

 4. **Real-time preview** during development in Chrome, Firefox or IE



## Usage

```Shell
npm init web-cell path/to/your_project
```

### Configuration reference

 - [**Source directory**](https://github.com/EasyWebApp/material-cell/blob/master/package.json#L24)

 - [**NPM script**](https://github.com/EasyWebApp/material-cell/blob/master/package.json#L29)

 - [**Babel**](https://github.com/EasyWebApp/material-cell/blob/master/package.json#L55)


### Command

    Usage: web-cell [options] [command]

    Options:

        -V, --version  output the version number
        -h, --help     output usage information

    Commands:

        boot           Boot current directory as a WebCell project
        pack           Bundle components to a package with JS modules in it
        preview        Real-time preview during development
        help [cmd]     display help for [cmd]



## Typical case

 1. [Cell Router](https://web-cell.tk/cell-router/)

 2. [Material Cell](https://web-cell-ht.ml)
