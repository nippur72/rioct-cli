import CompileError from "./CompileError";
import { getLine } from "./location";
import { Brackets, printableString, splitBrackets } from "./utils";
import Context from "./context";
import esprima = require("esprima");

function wrapAndApply(jsFunctionCode) {
   return `((${jsFunctionCode}).apply(this))`;   
}

function wrapTextExpression(jsCode: string, context: Context)
{   
   var fn =`function() { 
               try {
                  var $expr = (${jsCode});
                  if($expr !== null && typeof $expr !== 'string' && typeof $expr !== 'number' && typeof $expr !== 'undefined') {
                     console.error("runtime error when evaluating: ${printableString(jsCode)}\\nin file: '${printableString(context.file)}', line ${context.line}, col ${context.column}\\nexpression must be of type 'string' or 'number', instead is '"+(typeof $expr)+"'");
                  }
                  return $expr;
               }
               catch(ex) {                     
                  console.error("runtime error when evaluating: ${printableString(jsCode)}\\nin file: '${printableString(context.file)}', line ${context.line}, col ${context.column}\\n" + ex.message)
               }
            }`;
   return wrapAndApply(fn);
}

function wrapGenericExpression(jsCode: string, context: Context) 
{   
   var fn =`function() { 
               try {
                  return (${jsCode})
               }
               catch(ex) {                     
                  console.error("runtime expression error when evaluating: ${printableString(jsCode)}\\nin file: '${printableString(context.file)}', line ${context.line}, col ${context.column}\\nerror: " + ex.message)
               }
            }`;

   return wrapAndApply(fn).split("\n").join(" ");
}

/**
 * Syntatically checks a javascript expression and 
 * optionally wraps it in a debug wrapper function 
 * for runtime error tracing
 */

export default function wrapExpression(jsCode: string, context: Context, isTextExpression?: boolean): string {
   var expr = jsCode;   
   
   if(context.options.trace) {
      // special case of <yield> tag
      if(jsCode==="this.props.children") isTextExpression = false;

      expr = isTextExpression === true ? wrapTextExpression(jsCode, context) : wrapGenericExpression(jsCode, context);
   }

   try
   {
      var checkJs = esprima.parse(expr);
   }
   catch(ex) 
   {      
      throw new CompileError(`javascript error when parsing: ${jsCode}`,
                              context.file, 
                              getLine(context.html, context.tag), 
                              ex.description);                  
   }

   return expr;
}

