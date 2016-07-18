﻿/// <reference path="typings/glob/glob.d.ts" />

import processHtml from "./processHtml";
import Context from "./context";
import CompileError from "./CompileError";
import processResult from "./processResult";
import { opts, CommandLineOptions } from "./options";
import replaceExt from "./replace-extension";

import glob = require("glob");
import fs = require("fs");
import path = require('path');
import _ = require("lodash");

import md5 = require("blueimp-md5");
import entryPoint from "./entryPoint";

function main(argv) {
   var options;

   // process command line options
   try {
      options = opts.parseArgv(argv) as CommandLineOptions;
   }
   catch(ex) {
      console.log(ex.message);
      process.exit(-1);
   }

   entryPoint(options);
}

// entry point
main(process.argv);

