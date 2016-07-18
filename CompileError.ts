export default class CompileError
{
   message: string;
   fileName: string;
   loc: {line: number, col: number };
   snip: string;

   constructor(message: string, fileName: string, loc, snip?: string)
   {
      this.message = message;
      this.fileName = fileName;
      this.loc = loc;      
      this.snip = snip;
   }
}