import { extract as rtExtractor } from "./rtExtractor";
import { Context } from "./context";
import { CompileError } from "./CompileError";
import { processResult } from "./processResult";
import { getLine } from "./location";
import { processNode }from "./api";
import { wrapImports } from "./wrapImports";

import decamelize = require("decamelize");
import cheerio = require("cheerio");
import _ = require("lodash");

function processHtml(html: string, context: Context): processResult {

   var result = new processResult();
   
   // load DOM
   var rootNode = cheerio.load(html, {lowerCaseTags: false, lowerCaseAttributeNames: false, xmlMode: true, withStartIndices: true}); // xmlMode turned off to allow decode of &nbsp; 
   
   // filter tag and style nodes
   var rootTags = _.filter(rootNode.root()[0].children, node => node.type === 'tag' || node.type === 'style');

   if(rootTags.length!==1) {      
      throw new CompileError(`tag must have a single root node, found ${rootTags.length} instead`, 
                              context.file, 
                              getLine(context.html, rootTags[0]) );
   }

   var root = rootTags[0] as CheerioElement;

   // assign tag name
   result.tagName = root.name.toLowerCase(); 
   context.tagName = result.tagName;    

   // TODO match with filename.html
   // TODO check for redefinition of standard tags

   result.functionName = `${decamelize(result.tagName)}_RT`;    // TODO fix for stateless functions   

   var headerTree = cheerio.load("");
   context.headerNodes = headerTree.root()[0];

   processNode(root, context, result);   

   var headerHtml = headerTree.html();   
   
   var rtHtml = headerHtml + "\r\n" + rootNode.root().html();
      
   var jsCode;
   
   /*
   if(context.options.new) 
   {
      var emitter = new Emitter();
      jsCode = emitter.emit(rootNode);
   }
   else 
   {
      // use "react-templates" as external engine         
      jsCode = rtExtractor(rtHtml, context.options.trace, result.tagName, context.options.typescript);       
   }
   */   
   
   // use "react-templates" as external engine         
   jsCode = rtExtractor(rtHtml, context.options.trace, result.tagName, context.options.typescript);       

   jsCode = wrapImports(jsCode, context);   

   result.outName = context.outName;

   const augmented = jsCode + "\n\n" + result.importRioct() 
                            + "\n"   + result.importCommand() 
                            + "\n"   + result.styleCommand(context.options.trace);
   
   //jsCode = escodegen.generate(esprima.parse(jsCode));   
   result.rtSource = rtHtml;
   result.rtTemplate = jsCode;
   result.rtTemplateAugumented = augmented;

   return result;
}

export { processHtml };
