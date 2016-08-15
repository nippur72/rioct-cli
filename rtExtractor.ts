//
// extract results from command line utility "rt" (react-templates)
//

import rt = require("react-templates/src/reactTemplates");
import { Context } from "./context";
import { CommandLineOptions } from "./options";

function wrapCodeCommonJs(js: string, trace: boolean, tagName: string) 
{      
   var p = "module.exports = ";
   var x = js.indexOf(p);

   if(x==-1) {
      console.log(js);
      throw "error extracting from JavaScript code";         
   }

   var before = js.substring(0, x);
   var func   = js.substr(x+p.length);      

   let stateless = func.indexOf("(props, context)")!==-1 ? "props, context" : "";

   if(trace) {   
      return before +
`var old_render = ${func}
var render = function (${stateless}) { 
   try 
   {       
      return old_render.apply(this,arguments) 
   } 
   catch(ex) 
   { 
      console.error("<${tagName}> runtime render() error:")
      console.error(ex)
      console.error(this)
   } 
};
module.exports = render;`;
   }
   else
   {
      return before +
`
var render = ${func}
module.exports = render;`;
   }
}

function wrapCodeTypeScript(js: string, trace: boolean, tagName: string) 
{      
   var p = "export = ";
   var x = js.indexOf(p);

   if(x==-1) {
      console.log(js);
      throw "error extracting from TypeScript code";         
   }

   var before = js.substring(0, x);
   var func   = js.substr(x+p.length);      

   let stateless = func.indexOf("(props, context)")!==-1 ? "props, context" : "";  

   before = before + 
`
import component from './${tagName}';

`;

   if(trace) {   
      return before +
`var old_render = ${func}
var render = function (${stateless}) 
{ 
   try 
   {       
      return old_render.apply(this,arguments) 
   } 
   catch(ex) 
   { 
      console.error("<${tagName}> runtime render() error:")
      console.error(ex)
      console.error(this)
   } 
};
export = render;`;
   }
   else
   {
      return before +
`
var render = ${func}
export = render;`;
   }
}


export function extract(rtHtml: string, tagName: string, options: CommandLineOptions): string
{
   var rtOptions = {
         modules: options.typescript ? 'typescript' : 'commonjs',
         version: false,
         format: 'stylish',
         native: false,
         targetVersion: options.targetVersion,
         reactImportPath: options.reactImportPath,
         lodashImportPath: options.lodashImportPath,
         normalizeHtmlWhitespace: options.normalizeHtmlWhitespace,
         createElementAlias: options.createElementAlias
   };
   
   var jsCode;
   
   try 
   {
      //console.log(rtHtml);
      jsCode = rt.convertTemplateToReact(rtHtml, rtOptions);
   }
   catch(ex) 
   {
      console.log(ex);
      console.log(rtHtml);
      return "";
   }

   return options.typescript ? wrapCodeTypeScript(jsCode, options.trace, tagName) : wrapCodeCommonJs(jsCode, options.trace, tagName);
}     




