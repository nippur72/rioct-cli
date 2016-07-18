export const LibName = "Rioct";

export default class processResult {
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

   styleCommand() {
      if(this.extractedStyle) return `${LibName}.styles.push("${this.sanitizeStyle(this.extractedStyle)}"); ${LibName}.updateStyles();`;
      else return "";
   }

   importRioct() {
      return `var ${LibName} = require('rioct');`;
   }

   sanitizeStyle(style: string): string {
      return style.split('\n').map(item=>item.trim()).join(' ').split('\r').map(item=>item.trim()).join(' ');
   }
}

   