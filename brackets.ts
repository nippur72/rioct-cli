﻿
export class SplitResult {
   text: string;
   isJs: boolean;
}

export interface Brackets {
   open: string;
   close: string;
}

export function splitBrackets(text: string, bracket: Brackets): SplitResult[]|null {

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
