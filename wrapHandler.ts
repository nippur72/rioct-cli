import { Context } from "./context";
import CompileError from "./CompileError";
import { getLine } from "./location";
import { Brackets, printableString, splitBrackets } from "./utils";

export default function wrapHandler(jsCode: string, context: Context)
{   
   var expr = jsCode;   
   
   if(context.options.trace) {
      //expr = `(function() { return ${jsCode}(arguments); })`;
      expr = `(function() { 
                  try 
                  {
                     return ${jsCode}.apply(this,arguments)
                  }
                  catch(ex) 
                  {                     
                     console.error("runtime error when calling event: ${printableString(jsCode)}\\nin file: '${context.file}', line ${context.line}, col ${context.column}\\nerror: " + ex.message)
                  }
              })`;
      expr = expr.split("\n").join(" ");
   }

   /*
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
   */
   return expr;
}

