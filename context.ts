import { getLine } from "./location";

export default class Context {
   options: any;

   html: string;
   file: string;
   tag: CheerioElement;
   attrib: string;
   line: number;
   column: number;
   headerNodes: CheerioElement;
   hash: string;
   outName: string;

   moveTo(tag)
   {
      var coords = getLine(this.html, tag);      
      this.line = coords.line;
      this.column = coords.col;
   }
}

