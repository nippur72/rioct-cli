import rh = require("./regexHelper");

export interface scopeItem 
{
   expression: string;
   identifier: string;
}

export function parseScope(s: string): scopeItem[]
{
   const id = "[$_a-zA-Z]+[$_a-zA-Z0-9]*";   
   const expr = "[\\s\\S]*?";
   const as = rh.OneOrMore(" ") + rh.text("as") + rh.OneOrMore(" ");
   const spaces = rh.zeroOrMore(" ");

   const semicolon = rh.nonCapture(rh.or(rh.text(";"), rh.endOfLine()));    

   const regex = rh.capture(expr) + as + rh.capture(id) + spaces + semicolon + spaces;

   const R = new RegExp(regex, "g");

   const result = buildResult(R, s);

   return result;
}

function buildResult(regex: RegExp, text: string): scopeItem[]
{
   const res: scopeItem[] = [];

   do {       
      const idx = regex.lastIndex;  
      const match = regex.exec(text);      
      if(regex.lastIndex===idx || match === null) {
         // did not match at the index, report as error
         throw text.substr(idx);
      }            
      if(match.index === regex.lastIndex) {
         regex.lastIndex++;
      }                                
      res.push({expression: match[1].trim(), identifier: match[2]});
   } while(regex.lastIndex < text.length)

   return res;
}

