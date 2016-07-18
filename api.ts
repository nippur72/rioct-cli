import wrapExpression from "./wrapExpression";
import wrapHandler from "./wrapHandler";
import { Context } from "./context";
import { processResult } from "./processResult";
import CompileError from "./CompileError";
import eventList from "./react-events";

import { getLine } from "./location";

import pascalcase = require("pascalcase");

import replaceAll from "./replaceAll";

import _ = require("lodash");

function processNode(node: CheerioElement, context: Context, r: processResult) {
         if (node.type === 'tag')     processTagNode(node, context, r)
    else if (node.type === 'style')   processStyleNode(node, context, r)
    else if (node.type === 'comment') processCommentNode(node, r)
    else if (node.type === 'text')    processTextNode(node, context)
}

function processTagNode(tag: CheerioElement, context: Context, r: processResult) {

   context.tag = tag;

   function replaceAttributes(oldName: string, newName: string) {
      _.each(_.keys(tag.attribs), (attrib) => {
         if(attrib === oldName) {
            replaceAttribute( tag, oldName, newName, context );
         }
      });
   }
   
   // render all tags as "div" by default
   if(tag.parentNode === null && tag.attribs["is"]===undefined) {
      tag.attribs["is"] = "div";
   }

   // replace if, each, repeat, scope, props
   replaceAttributes("if",     "rt-if");
   replaceAttributes("each",   "rt-repeat");
   replaceAttributes("repeat", "rt-repeat");
   replaceAttributes("scope",  "rt-scope");
   replaceAttributes("props",  "rt-props");   

   // process attributes   
   _.each(_.keys(tag.attribs), (attrib) => {
      var value = tag.attribs[attrib];
      processAttrib(tag, attrib, value, context)
   });  

   // process script tags (riot-like)

   // replace virtual with rt-virtual   
   if(tag.name === "virtual") {
      tag.name = "rt-virtual";
   }

   // turn hypenated names to camelcased, only if they are not "rt-"
   if(tag.name.indexOf("-")!==-1 && tag.name.indexOf("rt-")===-1) {
      tag.name = pascalcase(tag.name);
   }

   /*

   // this feature is included in react-templates

   // give a key to nodes containing rt-if 
   if(tag.attribs["rt-if"]) {
      provideKey(tag);         
   }

   if(tag.name === "rt-virtual") {
      // if more than one child, give them a key
      if(tag.children.length>1) {         
         _.each(tag.children, child => provideKey(child));         
      }
   }
   */

   // process yield 
   if(tag.name === "yield") {
      if(tag.attribs["to"]!==undefined) 
      {
        // yield to
        tag.name = "rt-template";
        tag.attribs["prop"] = tag.attribs["to"];  
        delete tag.attribs["to"];  
      } 
      else
      {
        // yield from  
        if(tag.children.length>1) {
            throw "yield/yield from may have no children";
        }
        tag.type = "text";
        tag["isText"] = false;        
        let fromAttr = tag.attribs["from"];
        let textExpression = fromAttr ? `{this.props.${fromAttr}()}` : "{this.props.children}";  
        tag["data"] = textExpression;
      }
   }

   // replace import with rt-import
   if(tag.name === "import") {
      tag.name = "rt-import";
      if(tag.attribs["default"]) {
         tag.attribs["name"] = "default";         
         tag.attribs["as"] = tag.attribs["default"];         
         delete tag.attribs["default"];
      }
      else if(tag.attribs["require"]) {
         tag.attribs["name"] = "*";         
         tag.attribs["as"] = tag.attribs["require"];         
         delete tag.attribs["require"];
      }
   }

   // rt-require are moved to header and deleted from the tree
   if(tag.name === "rt-require") {
      // insert into header nodes
      tag.attribs["dependency"] = tag.attribs["import"];
      context.headerNodes.childNodes.push(tag);      

      // remove from tree (ugly hack)
      tag.parentNode.children = tag.parentNode.children.filter( child => child.name!=="rt-require" );
      return;
   }

   // rt-import are moved to header and deleted from the tree
   if(tag.name === "rt-import") {
      // insert into header nodes
      context.headerNodes.childNodes.push(tag);      

      // remove from tree (ugly hack)
      tag.parentNode.children = tag.parentNode.children.filter( child => child.name!=="rt-import" );
      return;
   }

   /*
   // rt-import are moved to header and deleted from the tree
   if(tag.name === "stateless") {
      // insert into header nodes
      //context.headerNodes.childNodes.push(tag);      
      
      // remove from tree (ugly hack)
      tag.parentNode.children = tag.parentNode.children.filter( child => child.name!=="rt-import" );
      return;
   }
   */

   // visit children nodes
   _.each(tag.children, child => processNode(child, context, r));
}

/*
function provideKey(tag: CheerioElement) {
   if(!tag.attribs) tag.attribs = {};
   if(!tag.attribs["key"]) {
      tag.attribs["key"] = "rt" + tag.startIndex;
   }
}
*/

function processStyleNode(tag: CheerioElement, context: Context, r: processResult) {   
   // grab style text and delete node
   _.each(tag.children, child=> {
      let style = child["data"];
      style = replaceAll(style, "_this_", `_${context.hash}_`);
      r.extractedStyle += style;
   });                                                    
   tag.type = "";
}

function replaceAttribute(tag: CheerioElement, oldName: string, newName: string, context: Context) {   
   context.attrib = oldName;

   if(tag.attribs[newName]) {
      throw new CompileError(`<${context.tag}> can't have both attributes "${newName}" and "${oldName}"`,
                              context.file, 
                              getLine(context.html, tag) );
   }
   tag.attribs[newName] = cleanBrackets(tag.attribs[oldName]);
   delete tag.attribs[oldName];            
}

function processAttrib(tag: CheerioElement, attrib: string, value: string, context: Context): void {     
   context.attrib = attrib;
   context.tag = tag;

   // "is" attribute on the root tag
   if(attrib === "is") {
      if(tag.parentNode !== null) {         
         throw new CompileError(`'is' can be placed only on the root node in <${context.tag}>`,
                                 context.file, 
                                 getLine(context.html, tag) );
      }
      tag.name = value;   
      delete tag.attribs[attrib];
      return;      
   }    
   
   // restore back old React's string refs 
   if(attrib === "ref") {            
      // only if it's a string constant (does not contains parens)
      if(tag.attribs[attrib].indexOf("(")==-1) {
         value = `{(function(r) {this['${value}']=r}).bind(this)}`;
         tag.attribs[attrib] = value;      
         return;
      }
   }      

   // process if
   if(attrib==="rt-if") {
      context.moveTo(tag);
      tag.attribs[attrib] = wrapExpression(tag.attribs[attrib], context);   
   }

   // process repeat
   if(attrib==="rt-repeat") {

      var rExpr = tag.attribs["rt-repeat"];
      var arr = rExpr.split(' in ');
      if (arr.length !== 2) {
         throw new CompileError(`repeat 'in' syntax error >`,
                                 context.file, 
                                 getLine(context.html, tag), 
                                 rExpr);            
      }
      let variables = arr[0];
      let collection = arr[1];

      context.moveTo(tag);
      collection = wrapExpression(collection, context);   

      // TODO javascript check "variables"

      tag.attribs["rt-repeat"] = `${variables} in ${collection}`;      
   }

   // process scope
   if(attrib==="rt-scope") {
      let scopes = (tag.attribs["rt-scope"] as string).split(';');
      let newScopes: string[] = [];
      scopes.forEach(scope => {
         scope = scope.trim();
         if(scope) {
            let parts = scope.split(' as ');   
            if (parts.length !== 2) {
               throw new CompileError(`scope 'as' syntax error >`,
                                       context.file, 
                                       getLine(context.html, tag), 
                                       scope);            
            }
         
            var alias = parts[1];
            var value = parts[0];
            
            context.moveTo(tag);
            let newScope = `${wrapExpression(value, context)} as ${alias}`;
            newScopes.push(newScope);
         }
      });

      tag.attribs["rt-scope"] = newScopes.join(";");           
   }

   // process props
   if(attrib==="rt-props") {
      context.moveTo(tag);
      tag.attribs[attrib] = wrapExpression(tag.attribs[attrib], context);         
   }

   if(attrib==="class") {      
      let val = tag.attribs[attrib];      
      // substitute _this_ prefix in local <style>
      val = replaceAll(val, "_this_", `_${context.hash}_`);
   
      if(cleanBrackets(val) !== val) {
         // class + brackets found, turn it into rt-class                  
         context.moveTo(tag);  
         val = cleanBrackets(val);                
         val = wrapExpression("("+val+")", context);         
         attrib = "rt-class";
         tag.attribs[attrib] = val;         
         delete tag.attribs["class"];                         
      }
      else {         
         context.moveTo(tag);  
         val = replaceBrackets(val, context, false);            
         tag.attribs[attrib] = val;
      }
      return;
   }

   // stop processing for reserved attributes
   if(attrib.indexOf("rt-")!==-1) {
      return;
   }   

   // TODO class, require, template

   // "show" and "hide"
   if(attrib === "show" || attrib === "hide") {
      
      var vtrue  = attrib === "show" ? "''"     : "'none'";
      var vfalse = attrib === "show" ? "'none'" : "''";
      context.moveTo(tag);
      var cond = wrapExpression(cleanBrackets(value), context);      
      var propToAdd = `{style: { display: (${cond}) ? ${vtrue} : ${vfalse} } }`;

      var hasProps = tag.attribs["rt-props"] ? true : false;
      if(hasProps) {
         var oldProp = tag.attribs["rt-props"];
         propToAdd = `mergeProps(${oldProp},${propToAdd})`;
      }
      tag.attribs["rt-props"] = propToAdd;
      delete tag.attribs[attrib];         

      return;
   }
        
   // event handlers
   if(attrib.indexOf("on") === 0) {
      
      // replace lowercase name for known events
      var known = false;
      for(let t=0; t<eventList.length; t++) {
         if(eventList[t].toLowerCase() === attrib) {
            replaceAttribute(tag, attrib, eventList[t], context); 
            attrib = eventList[t];            
            known = true;
            break;
         }
      }

      // filter brackets for unknown event handlers too
      if(!known) {
         tag.attribs[attrib] = cleanBrackets(tag.attribs[attrib]);  
      }
      
      var handler = tag.attribs[attrib];

      // autobinds "this.funcName"
      if(handler.indexOf("(")!==0) {
         handler = wrapHandler(handler, context);
         handler = handler+".bind(this)";
         //handler = wrapExpression(handler, context, false);
         handler = "{" + handler + "}";
      }
   
      tag.attribs[attrib] = handler;

      return;
   }

   // TODO event ending in "Capture" ("onClickCapure")

   // convert brackets for normal attributes
   tag.attribs[attrib] = replaceBrackets(value, context, false);   
}

function processCommentNode(comment: CheerioElement, r: processResult) {
   // parse metacommands
}

function processTextNode(text: CheerioElement, context) {
   // replace brackets
   context.tag = text;
   var isText = text["isText"] ? text["isText"] : true;
   text["data"] = replaceBrackets(text["data"], context, isText);
}

// TODO process command line options
// TODO process multiple files
// TODO switch to enable error catching in render()


/**
  * Get brackets from command line option parameter
  * Brackets must be specified with the regex syntax and
  * separated by a space character (e.g. "\{ \}")
  * @param {string} brackets open and close brackets separated by a space
  */
  /*
function getBrackets(brackets) {
    var s = brackets.split(' ');

    if (s.length !== 2 || s[0].length === 0 && s[1].length === 0) {
        throw new RTCodeError('Invalid delimiters ' + brackets);
    }

    return {
        open: s[0],
        close: s[1]
    };
}
*/

function replaceBrackets(text: string, context: Context, isTextExpression?: boolean): string {

    var bracket = { open: "{{", close: "}}" };

    var res: string[] = [];

    // TODO fails to replace {{serverInfo.databaseName ? serverInfo.databaseName : '<non connesso>'}}

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

        if (error) {
            throw new CompileError(`Failed to replace brackets in`,
                                    context.file, 
                                    getLine(context.html, context.tag), 
                                    text);            
        }
        
        if (match[1]) res.push(match[1]); 
        if (match[2]) res.push("{" + wrapExpression(match[2], context, isTextExpression) + "}"); 
        if (match[3]) res.push(match[3]); 
        if (match[4]) res.push(match[4]); 
    }

    return res.join('');
}

// 


/**
 * Makes brackets optional for reserved attributes
 * by simply eliminating them if present
 */

function cleanBrackets(text: string) {
    var bracket = { open: "{{", close: "}}" };    

    var regex = new RegExp('^' + bracket.open + '([\\s\\S]*?)' + bracket.close + '$', 'g');

    var match = regex.exec(text);

    if(match === null) return text;
    if(match[1]) return match[1];
    return "";
}

// rt-debug = (function(){debugger})() as debug
// rt-execute


export default processNode;

