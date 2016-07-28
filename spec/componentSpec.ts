import { renderComponent as render } from "./makeInlineComponent";
import { defaultOptions } from "../options";

describe("custom brackets", ()=> {
   it("is rendered correctly", ()=>{        
      let options = defaultOptions();          
      options.brackets = "{% %}";

      const rendered = render("<test rt-stateless><span>Hello {% props.name %}</span></test>", {name: "Nino"}, options);      
      const expected = "<div><span>Hello Nino</span></div>";
      expect(rendered).toEqual(expected);      
   });
});
          

describe("default brackets", ()=> {
   it("is rendered correctly", ()=>{    
      
      const template = "<test rt-stateless>Hello {props.name}</test>";
      const props = {name: "Nino"};
      const rendered = render(template, props);      
      const expected = "<div>Hello Nino</div>";
      expect(rendered).toEqual(expected);      
   });
});

