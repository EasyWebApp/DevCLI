# WebCell DevCLI

Developer command-line tool for [WebCell](https://web-cell.tk/)

[![NPM Dependency](https://david-dm.org/EasyWebApp/DevCLI.svg)](https://david-dm.org/EasyWebApp/DevCLI)

[![NPM](https://nodei.co/npm/web-cell-cli.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/web-cell-cli/)



## Usage

 1. `npm install web-cell-cli -D`

 1. refer [BootCell][1] to [configure the **Source directory**](https://github.com/EasyWebApp/BootCell/blob/V2/package.json#L6)

 3. refer [BootCell][1] to [configure the **NPM script**](https://github.com/EasyWebApp/BootCell/blob/V2/package.json#L13)

 4. `npm run your_script`



### Command

  Usage: `web-cell [options] [command]`

  Options:

    -H, --HTML  Bundle as HTML
    -h, --help  output usage information

  Commands:

    pack        Bundle components to a package within JS modules (or HTML files)
    preview     Real-time preview during development
    help [cmd]  display help for [cmd]



[1]: https://github.com/EasyWebApp/BootCell "Offical component library of WebCell (based on BootStrap v4)"
