/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const fs = require('fs');
const path = require('path');
const program = require('commander');
const yamlInput = require('./yaml-inputs');
const { createAggregatorBlock } = require('./helpers');

program
  .command('init-subgraph')
  .description('Creates the necessary yaml and helper files for any supported synthetix subgraph')
  .option(
    '-s, --subgraph <value>',
    'defaults to synthetix but can be named after any folder under the main level subgraphs folder',
    'synthetix',
  )
  .action(async ({ subgraph }) => {
    // get the contracts based on the subgraph + env
    const contracts = yamlInput[env];
    if (hasRates) {
      const newLine = '\n';
      const readOnlyComment = `// this is a read only file generated by mustache.${newLine}`;
      const space = '\xa0';
      const doubleSpace = space + space;
      let contractsToProxiesContent = `${readOnlyComment}export let contractsToProxies = new Map<string, string>();${newLine}`;
      contracts.chainlink.forEach(({ aggregator, proxy, feed }) => {
        if (proxy != null) {
          contractsToProxiesContent += `contractsToProxies.set(${newLine}${doubleSpace}'${aggregator.toLowerCase()}',${space}//${space}${feed}${newLine}${doubleSpace}'${proxy}'${newLine});${newLine}`;
        }
      });
      contractsToProxiesContent += readOnlyComment;
      const targetFile = path.join(__dirname, '../src/', 'contractsToProxies.ts');
      fs.writeFileSync(targetFile, contractsToProxiesContent, 'utf8');
      const chainlinkData = contracts.chainlink.map(createAggregatorBlock);
    }
    const yamlData = { yaml: { ...contracts, chainlinkData } };
    delete yamlData.chainlink;
    return console.log(JSON.stringify(yamlData, null, 2) + '\n');
  });

program.parse(process.argv);
