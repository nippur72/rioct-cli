//
// extract results from command line utility "rt" (react-templates)
//

import rt = require("react-templates/src/reactTemplates");
import { Context } from "./context";

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


export default function extract(rtHtml: string, trace: boolean, tagName: string, typeScriptOutput: boolean): string
{
   var rtOptions = {
         modules: typeScriptOutput ? 'typescript' : 'commonjs',
         version: false,
         format: 'stylish',
         native: false,
         target: "0.14.0",
         reactImportPath: "react",
         normalizeHtmlWhitespace: true           
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

   return typeScriptOutput ? wrapCodeTypeScript(jsCode, trace, tagName) : wrapCodeCommonJs(jsCode, trace, tagName);
}     




