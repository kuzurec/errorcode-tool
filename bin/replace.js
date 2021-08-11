#!/usr/bin/env node
const j = require('jscodeshift');
const fs = require('fs');

const modifyFile = (source, codeMap, exten) => {
  const ast = j.withParser(exten)(source);

  ast
    .find(j.Literal)
    .filter((item) => item?.name === 'key' || item?.value?.type === 'Literal')
    .forEach((item) => {
      if (codeMap[item?.value?.value]?.length) {
        j(item).replaceWith(j.literal(codeMap[item?.value?.value]));
      }
    });

  return ast.toSource();
};

const replace = (filePath, codeMap, exten) => {
  const originData = fs.readFileSync(filePath, 'utf8');
  const newData = modifyFile(originData, codeMap, exten);

  fs.writeFileSync(filePath, newData);
};

module.exports = replace;
