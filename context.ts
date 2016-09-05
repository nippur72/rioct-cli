import { getLine } from "./location";
import { CommandLineOptions } from "./options";
import { Brackets } from "./brackets";

export class Context {
   options: CommandLineOptions;
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
   brackets: Brackets;
   importNames: string[] = [];

   moveTo(tag)
   {
      var coords = getLine(this.html, tag);      
      this.line = coords.line;
      this.column = coords.col;
   }
}

