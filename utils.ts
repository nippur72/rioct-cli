import escodegen = require("escodegen");
import replaceAll from "./replaceAll";

export function debug(msg: any) {
   console.log(msg);
}

export function printableString(s: string): string {
   let code = replaceAll(s, '"','\\"');    
   code = replaceAll(code, '\n','\\n');    
   code = replaceAll(code, '\r','\\r');    
   code = replaceAll(code, '\t','\\t');    
   code = replaceAll(code, '\\','\\\\');    

   return code;
}

export function jsString(s: string): string {
   const AST = {
      type: 'Literal',
      value: s
   };

   return escodegen.generate(AST);
}

