﻿
import optionator = require("optionator");

var pkg = require("./package.json");

var optsConfig = 
{
   prepend: [`${pkg.name}  v${pkg.version}`,
             `${pkg.description}`,
             `Usage:`,
             `rioct-cli <filename> [<args>]`].join('\n'),

   concatRepeatedArrays: true,

   mergeRepeatedObjects: true,

   options: [
      { heading: 'Options' }, 
      { option: 'help', alias: 'h', type: 'Boolean', description: 'Show help.' },      
      { option: 'trace', alias: 't', type: 'Boolean', default: 'false', required: false, description: 'Catches all runtime errors and logs them to the console.'},
      //{ option: 'new', alias: 'n', type: 'Boolean', required: false, description: 'Use new emit engine (do not rely on react-templates).'},
      { option: 'typescript', type: 'Boolean', default: 'false', required: false, description: '(experimental) Output typescript files.'}
   ]
};

var opts = optionator(optsConfig);

interface CommandLineOptions {
   _: string[];
   trace: boolean;
   //new: boolean;
   typescript: boolean;   
}

export { opts, CommandLineOptions };

