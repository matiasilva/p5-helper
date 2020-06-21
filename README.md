<h1 align="center">
	<br>
	<img width="70%" src="media/p5helper.png" alt="p5-helper">
	<br>
</h1>

> A helper tool for creating and managing your p5 projects!

[![Downloads](https://badgen.net/npm/dt/p5-helper)](https://www.npmjs.com/package/chalk) [![](https://img.shields.io/badge/unicorn-approved-ff69b4.svg)](https://google.com)

## Install

```bash
$ npm install -g p5-helper
```

## Usage

You can use `p5-helper` to create a project:

```bash
p5 new myAmazingProject
```

By default, `p5-helper` will use minified files and omit the `p5.sound` library. You can override this by using the `-f` and `-s` flags for full libraries and `p5.sound`, respectively.

## Other features

### Updating

`p5-helper` uses a local source of `p5` to enable you to create projects anywhere, even offline. It will alert you of a new available version, after which you will be able to update with

```bash
p5 update
```

### Customizing

Want to customize `index.html` or `sketch.js`? No problem, simply head to your global `node_modules` directory and edit the files under `assets`.