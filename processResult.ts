﻿export const LibName = "Rioct";

export class processResult {
   tagName: string;
   functionName: string;
   extractedStyle: string = "";
   rtTemplate: string;
   rtTemplateAugumented: string;
   rtSource: string;
   fileName: string;
   outName: string;

   importCommand() {
      return `${LibName}.tags["${this.tagName}"] = render;`;
   }

   styleCommand(trace: boolean) {
      if(this.extractedStyle) return `${LibName}.styles.push("${this.sanitizeStyle(this.extractedStyle, trace)}"); ${LibName}.updateStyles();`;
      else return "";
   }

   importRioct() {
      return `var ${LibName} = require('rioct');`;
   }

   sanitizeStyle(style: string, trace: boolean): string {
      if(trace) {
         return style;
      }
      else {
         return style.split('\n').map(item=>item.trim()).join(' ').split('\r').map(item=>item.trim()).join(' ');
      }
   }
}

   