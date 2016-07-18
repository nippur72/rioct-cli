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

export class SplitResult {
   text: string;
   isJs: boolean;
}

export interface Brackets {
   open: string;
   close: string;
}

export function splitBrackets(text: string, bracket: Brackets): SplitResult[] {

    var res: SplitResult[] = [];

    var regex = new RegExp('([\\s\\S]*?)' + bracket.open + '([\\s\\S]*?)' + bracket.close + '([\\s\\S]*?)|([\\s\\S]*)', 'g');

    // a syntax error might capture delimiters, so we check it
    var badCaptured = new RegExp('(' + bracket.open + ')|(' + bracket.close + ')');

    for (;;) {
        var match = regex.exec(text);
        if (match === null) {
            break;
        }
        if (match.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        // check for bad captured delimiters
        var error = match[1] !== undefined && badCaptured.test(match[1]) ||
                    match[3] !== undefined && badCaptured.test(match[3]) ||
                    match[4] !== undefined && badCaptured.test(match[4]);

        if (error) return null;

        if (match[1]) res.push({ text: match[1], isJs: false });
        if (match[2]) res.push({ text: match[2], isJs: true  });
        if (match[3]) res.push({ text: match[3], isJs: false });
        if (match[4]) res.push({ text: match[4], isJs: false });
    }
    
    return res;
}

