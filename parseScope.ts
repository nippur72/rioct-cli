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
   let res: scopeItem[] = [];

   for (;;) {
        var match = regex.exec(text);
        if (match === null) {
            break;
        }
        if (match.index === regex.lastIndex) {
            regex.lastIndex++;
        }
                                
        res.push({ expression: match[1].trim(), identifier: match[2] });
    }

    return res;
}

