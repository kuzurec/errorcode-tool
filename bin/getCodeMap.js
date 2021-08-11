#!/usr/bin/env node
const superagent = require('superagent');
const chalk = require('chalk');
const ora = require('ora');
const spinner = ora('Loading undead unicorns');
const cheerio = require('cheerio');
const fs = require('fs');

const getCodeMap = (source) => {
  let codeMap = {};
  let $ = cheerio.load(source);
  let strPrefix = '';

  $('tr').each((i, tr) => {
    let strText = '';
    $(tr)
      .find('td')
      .each((i, td) => {
        let text = $(td).text();
        // 有rowspan属性的td文本先保留在单独的变量中
        if ($(td).attr('rowspan')) {
          if (strPrefix.length === 0 || strPrefix.split('.').length === 2) {
            strPrefix = text;
          } else {
            strPrefix = strPrefix.concat(`.${text}`);
          }
        } else if (/^[a-zA-Z]+$/.test(text)) {
          strText = strPrefix.concat(`.${text}`);
        } else if (/^[0-9]{10}$/.test(text)) {
          codeMap[text] = strText;
        }
      });
  });

  spinner.succeed(chalk.green(JSON.stringify(codeMap)));

  return codeMap;
};

module.exports = (source) => {
  // superagent
  //   .get('https://confluence.aishu.cn/pages/viewpage.action?pageId=112233953')
  //   .end((err, res) => {
  //     if (err) {
  //       console.log(`抓取失败 - ${err}`);
  //     } else {
  //       getCodeMap(res.text); // res.text就是我们需要的网页html文本
  //     }
  //   });
  return getCodeMap(source);
};
