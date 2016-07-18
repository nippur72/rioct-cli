import { getLine } from "./location";

export class Context {
   options: {
      trace: boolean;
      new: boolean;
      typescript: boolean;
   };

   html: string;
   file: string;
   tag: CheerioElement;
   attrib: string;
   line: number;
   column: number;
   headerNodes: CheerioElement;
   hash: string;
   outName: string;
   tagName: string;

   moveTo(tag)
   {
      var coords = getLine(this.html, tag);      
      this.line = coords.line;
      this.column = coords.col;
   }
}

