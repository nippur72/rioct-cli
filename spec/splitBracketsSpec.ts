import { splitBrackets, Brackets, SplitResult } from "../brackets";

const defaultBrackets: Brackets = {
   open: "{{",
   close: "}}"
};

describe("splitBrackets" , ()=> {
   it("parses {{ expressions }}",()=>{
      let s = splitBrackets("{{hello}}", defaultBrackets);
      expect(s).toEqual([{ text: "hello", isJs: true }]);
   
      s = splitBrackets("aaaaa{{hello}}bbbbb", defaultBrackets);
      expect(s).toEqual([
         { text: "aaaaa", isJs: false },
         { text: "hello", isJs: true  },
         { text: "bbbbb", isJs: false }
      ]);

      s = splitBrackets("aaaaa{{hello}}", defaultBrackets);
      expect(s).toEqual([
         { text: "aaaaa", isJs: false },
         { text: "hello", isJs: true  }         
      ]);

      s = splitBrackets("{{hello}}bbbbb", defaultBrackets);
      expect(s).toEqual([
         { text: "hello", isJs: true  },
         { text: "bbbbb", isJs: false }
      ]);

      s = splitBrackets("a{{hello}}b{{some}}c", defaultBrackets);
      expect(s).toEqual([
         { text: "a"    , isJs: false },         
         { text: "hello", isJs: true  },
         { text: "b"    , isJs: false },
         { text: "some" , isJs: true  },
         { text: "c"    , isJs: false }
      ]);

      s = splitBrackets("text", defaultBrackets);
      expect(s).toEqual([
         { text: "text" , isJs: false }
      ]);

      s = splitBrackets("", defaultBrackets);
      expect(s).toEqual([]);

      s = splitBrackets("{{", defaultBrackets);
      expect(s).toBeNull();

      s = splitBrackets("{{ hello }} }}", defaultBrackets);
      expect(s).toBeNull();
   });
});

