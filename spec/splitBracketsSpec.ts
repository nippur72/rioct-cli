import { splitBrackets, Brackets, SplitResult } from "../brackets";

const customBrackets: Brackets = {
   open: "{{",
   close: "}}"
};

const normalBrackets: Brackets = {
   open: "{",
   close: "}"
};

describe("splitBrackets" , ()=> {
   it("parses {{ expressions }} (aka custom brackets)",()=>{

      let s = splitBrackets("{{hello}}", customBrackets);
      expect(s).toEqual([{ text: "hello", isJs: true }]);
   
      s = splitBrackets("aaaaa{{hello}}bbbbb", customBrackets);
      expect(s).toEqual([
         { text: "aaaaa", isJs: false },
         { text: "hello", isJs: true  },
         { text: "bbbbb", isJs: false }
      ]);

      s = splitBrackets("aaaaa{{hello}}", customBrackets);
      expect(s).toEqual([
         { text: "aaaaa", isJs: false },
         { text: "hello", isJs: true  }         
      ]);

      s = splitBrackets("{{hello}}bbbbb", customBrackets);
      expect(s).toEqual([
         { text: "hello", isJs: true  },
         { text: "bbbbb", isJs: false }
      ]);

      s = splitBrackets("a{{hello}}b{{some}}c", customBrackets);
      expect(s).toEqual([
         { text: "a"    , isJs: false },         
         { text: "hello", isJs: true  },
         { text: "b"    , isJs: false },
         { text: "some" , isJs: true  },
         { text: "c"    , isJs: false }
      ]);

      s = splitBrackets("text", customBrackets);
      expect(s).toEqual([
         { text: "text" , isJs: false }
      ]);

      s = splitBrackets("", customBrackets);
      expect(s).toEqual([]);

      s = splitBrackets("{{", customBrackets);
      expect(s).toBeNull();

      s = splitBrackets("{{ hello }} }}", customBrackets);
      expect(s).toBeNull();
   });

   it("parses { expressions } (aka normal brackets)",()=>{

      let s = splitBrackets("{hello}", normalBrackets);
      expect(s).toEqual([{ text: "hello", isJs: true }]);
   
      s = splitBrackets("aaaaa{hello}bbbbb", normalBrackets);
      expect(s).toEqual([
         { text: "aaaaa", isJs: false },
         { text: "hello", isJs: true  },
         { text: "bbbbb", isJs: false }
      ]);

      s = splitBrackets("aaaaa{hello}", normalBrackets);
      expect(s).toEqual([
         { text: "aaaaa", isJs: false },
         { text: "hello", isJs: true  }         
      ]);

      s = splitBrackets("{hello}bbbbb", normalBrackets);
      expect(s).toEqual([
         { text: "hello", isJs: true  },
         { text: "bbbbb", isJs: false }
      ]);

      s = splitBrackets("a{hello}b{some}c", normalBrackets);
      expect(s).toEqual([
         { text: "a"    , isJs: false },         
         { text: "hello", isJs: true  },
         { text: "b"    , isJs: false },
         { text: "some" , isJs: true  },
         { text: "c"    , isJs: false }
      ]);

      s = splitBrackets("text", normalBrackets);
      expect(s).toEqual([
         { text: "text" , isJs: false }
      ]);

      s = splitBrackets("", normalBrackets);
      expect(s).toEqual([]);

      s = splitBrackets("{", normalBrackets);
      expect(s).toBeNull();

      // TODO: document this different behavior than custom brackets
      s = splitBrackets("{ hello } }", normalBrackets);
      expect(s).toEqual([
         { text: " hello " , isJs: true  },
         { text: " }"      , isJs: false }
      ]);
   });

   it("parses nested normal brackets",()=>{
      // TODO: document this different behavior than custom brackets
      let s = splitBrackets("{ { hello } }", normalBrackets);
      expect(s).toEqual([
         { text: " { hello } " , isJs: true  }         
      ]);
   });
});

