#!/usr/bin/env node
const program = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const spinner = ora('Loading undead unicorns');
const getCodeMap = require('./getCodeMap');
const fs = require('fs');
const path = require('path');
const replace = require('./replace');
const sourcecode = require('./source');

const fileStat = (fileDir) => {
  return new Promise((resolve) => {
    fs.stat(fileDir, (err, stats) => {
      if (err) {
        spinner.fail(chalk.red('读取文件stats失败 \n' + err));
        process.exit();
      } else {
        resolve(stats);
      }
    });
  });
};

const readDir = (filePath) => {
  return new Promise((resolve) => {
    fs.readdir(filePath, (err, files) => {
      if (err) {
        spinner.fail(chalk.red('文件路径无效 \n' + err));
        process.exit();
      } else {
        resolve(files);
      }
    });
  });
};

const fileScan = async (filePath, codeMap) => {
  const files = await readDir(filePath);

  files.forEach(async (filename) => {
    const fileDir = path.join(filePath, filename);
    const stats = await fileStat(fileDir);

    if (stats.isFile() && /^\.(j|t)sx?$/.test(path.extname(fileDir))) {
      try {
        replace(fileDir, codeMap, path.extname(fileDir).substr(1));
        spinner.succeed(chalk.green(`${fileDir} 替换成功`));
      } catch (err) {
        spinner.fail(chalk.red(`${fileDir} 替换失败 \n` + err));
      }
    }

    if (stats.isDirectory() && filename !== 'node_modules') {
      await fileScan(fileDir, codeMap);
    }
  });
};

program
  .command('replace <code_path>')
  .option('-s, --source <source>', 'Which dir to use', './source.txt')
  .action((code_path, options) => {
    const { source } = options;
    const filePath = path.resolve(source);
    spinner.start(`开始抓取数据 ${filePath}`);

    // const originData = fs.readFileSync(filePath, 'utf8');

    const codeMap = getCodeMap(sourcecode);
    spinner.succeed(chalk.green(`抓取数据 ${filePath} 成功`));

    fileScan(path.resolve(code_path), codeMap);

    spinner.succeed(chalk.green(`替换 ${code_path} 成功`));
  });

program.parse(process.argv);
