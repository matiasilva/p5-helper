const axios = require("axios");
const fs = require('fs');
const path = require('path');
const download = require('download');
const VError = require("verror");
const chalk = require('chalk');

const ASSET_PATH = path.join(__dirname, '..', 'assets');
const ERROR_SLUG = chalk.bgRed('Uh oh! An error occurred');
const SCRIPT_TAG = "<script src=\"../{{lib_path}}\"></script>";

const PATHS = {
  "minified": {
    "src": {
      "p5": path.join("libraries", "p5.min.js"),
      "p5.sound": path.join("libraries", "addons", "p5.sound.min.js")
    },
    "dest": {
      "p5": path.join("libraries", "p5.min.js"),
      "p5.sound": path.join("libraries", "p5.sound.min.js")
    }
  },
  "full": {
    "src": {
      "p5": path.join("libraries", "p5.js"),
      "p5.sound": path.join("libraries", "addons", "p5.sound.js")
    },
    "dest": {
      "p5": path.join("libraries", "p5.js"),
      "p5.sound": path.join("libraries", "p5.sound.js")
    }
  }
}

const loadAsset = (assetPath) => {
  const filePath = path.join(ASSET_PATH, assetPath);
  return loadFile(filePath);
};

const writeAsset = (basePath, relPath, data, mode) => {
  const filePath = path.join(basePath, relPath);
  writeFile(filePath, data, mode);
  logCreated(filePath, relPath);
};

const loadConfig = () => {
  const filePath = path.join(__dirname, "..", "config.json");
  return JSON.parse(loadFile(filePath));
};

const writeConfig = (config) => {
  let data = JSON.stringify(config);
  const filePath = path.join(__dirname, "..", "config.json");
  writeFile(filePath, data);
  console.log(chalk.cyan('Updated local configuration'));
};

const loadFile = (absPath) => {
  try {
    return fs.readFileSync(absPath, 'utf-8');
  }
  catch (e) {
    console.error(`${ERROR_SLUG}: ${e.message}`);
  }
};

const logCreated = (absPath, relPath) => {
  const note = chalk.keyword('orange')
  const depth = relPath.split(path.sep).filter(v => v).reduce(acc => acc + '     ', '  ');
  console.log(`${depth}|_ ${note('created:')} ${absPath}`);
};

const writeFile = (filePath, data, mode) => {
  try {
    fs.writeFileSync(filePath, data, {
      mode: mode || 0o666
    });
  }
  catch (e) {
    console.error(`${ERROR_SLUG}: ${e.message}`);
  }
};

const mkdir = (basePath, relPath) => {
  const dirPath = path.join(basePath, relPath);
  if (fs.existsSync(dirPath)) throw new VError({
    'name': 'FileExistsError',
    'cause': new Error(`${chalk.bold(dirPath)} already exists`),
  }, ERROR_SLUG);
  fs.mkdirSync(dirPath, 0o755);
  logCreated(dirPath, relPath);
};

const copyAsset = (relAssetPath, baseDestPath, relDestPath) => {
  const srcPath = path.join(ASSET_PATH, relAssetPath);
  const destPath = path.join(baseDestPath, relDestPath);

  try {
    fs.copyFileSync(srcPath, destPath);
  }
  catch (e) {
    console.error(`${ERROR_SLUG}: failed to copy file ${destPath}`);
    console.error(`More information: ${e.message}`);
  }
  logCreated(destPath, relDestPath);
};

const makeScriptTag = scriptPath => `${SCRIPT_TAG.replace("{{lib_path}}", scriptPath)}\n`;

const downloadAsset = async (URI, relPath) => {
  try {
    const data = await download(URI);
    console.log(`${chalk.bgGreen('SUCCESS')}: got ${relPath}`)
    const destPath = path.join(ASSET_PATH, 'libraries', relPath);
    fs.writeFileSync(destPath, data);
  }
  catch (e) {
    console.error(`${ERROR_SLUG}: download of ${fileName} failed`);
  }
};

const fetchUpstream = async (url) => {
  try {
    return await axios.get(url, { headers: { Accept: "application/json" } });
  }
  catch (e) {
    console.error(`${ERROR_SLUG}: version check failed`);
  }
};

module.exports = {
  loadAsset,
  writeAsset,
  copyAsset,
  downloadAsset,
  loadConfig,
  writeConfig,
  mkdir,
  makeScriptTag,
  fetchUpstream,
  PATHS,
};