#!/usr/bin/env node

const { loadAsset,
  writeAsset,
  copyAsset,
  downloadAsset,
  loadConfig,
  writeConfig,
  mkdir,
  makeScriptTag,
  fetchUpstream,
  PATHS, } = require('../utils/utils');
const yargs = require("yargs")
const chalk = require('chalk');
const path = require('path');

const BASE_URL = "https://api.cdnjs.com/libraries/p5.js";
const FETCH_URL = "https://cdnjs.cloudflare.com/ajax/libs/p5.js";

const options = yargs
  .usage("Usage: p5 <command> args [flags]")
  .command({
    command: 'new <name>',
    aliases: ['g'],
    desc: "Generates a new project folder from local source"
  })
  .command(
    {
      command: 'update',
      aliases: ['u'],
      desc: "Updates the local p5 source with the latest upstream release"
    }
  )
  .options({
    's': {
      alias: 'sound',
      boolean: true,
      demandOption: false,
      describe: 'Include the p5.sound addon in project',
    },
    'f': {
      alias: 'full',
      boolean: true,
      demandOption: false,
      describe: 'Uses full non-minified library files',
    }
  })
  .help(false)
  .version(false)
  .demandCommand(1, "You need to specify at least one command")
  .strict()
  .argv;

const { _ } = options;
const cfg = loadConfig();
const localVsn = cfg.p5.version;

// init
let pjson = require('../package.json');
console.log(`${chalk.red(pjson.name)} ${pjson.version}`);

switch (_[0]) {
  case "new":

    const { name, sound, full } = options;
    const BASE_PATH = path.join(process.cwd(), name);

    // create directories
    try {
      mkdir(BASE_PATH, '');
    }
    catch (err) {
      console.error(err.message);
      // we can't proceed from here, so exit
      process.exit(0);
    }

    const paths = full ? PATHS.full : PATHS.minified;
    // create template files
    let indexTemplate = loadAsset("index.html")
    indexTemplate = indexTemplate.replace('{{project_title}}', name);
    // build scripts
    let scripts = "";
    scripts += makeScriptTag(paths.dest.p5);
    if (sound) scripts += makeScriptTag(paths.dest['p5.sound']);
    indexTemplate = indexTemplate.replace('{{lib_scripts}}', scripts);
    writeAsset(BASE_PATH, 'index.html', indexTemplate);
    copyAsset('sketch.js', BASE_PATH, 'sketch.js');

    // copy libraries
    mkdir(BASE_PATH, 'libraries');
    copyAsset(paths.src.p5, BASE_PATH, paths.dest.p5);
    if (sound) copyAsset(paths.src['p5.sound'], BASE_PATH, paths.dest['p5.sound']);

    fetchUpstream(BASE_URL)
      .then((response) => {
        const upstreamVsn = response.data.version;
        if (localVsn !== upstreamVsn) {
          // new verson available
          console.log(`\n${chalk.bgMagenta('Note')}: new p5 version available`)
          console.log(`run ${chalk.green('p5 update')} to pull the latest source`);
        }
      });

    break;
  case "update":
    fetchUpstream()
      .then((response) => {
        const upstreamVsn = response.data.version;
        console.log(`${chalk.yellow('Current p5 version')}: ${localVsn}`);
        console.log(`${chalk.magenta('Upstream p5 version')}: ${upstreamVsn}\n`);
        if (localVsn === upstreamVsn) {
          console.log("Upstream matches source, no need to update");
        }
        else {
          // pull latest files
          const toFetch = response.data.assets[0].files.map(
            (val) => ({ 'url': `${FETCH_URL}/${upstreamVsn}/${val}`, 'path': val })
          );
          toFetch.forEach(val => downloadAsset(val.url, val.path));
          cfg.p5.version = upstreamVsn;
          writeConfig(cfg);
        }
      });
    break;
}

  // TODO:
  // clean up after failure
  // checksums
  // better version check