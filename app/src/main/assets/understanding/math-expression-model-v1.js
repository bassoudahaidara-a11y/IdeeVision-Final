/* Idée Vision — Analyse symbolique des expressions mathématiques v1 */
(function(root){
"use strict";
const VERSION="1.0.0";
const norm=s=>String(s==null?"":s).normalize("NFKC").replace(/[’‘]/g,"'").replace(/\s+/g," ").trim();
const UNITS=new Set(["m","mm","cm","km","kg","g","mg","s","sec","min","h","l","ml","cl","pa","kpa","bar","w","kw","v","mv","a","ma","ohm","ohms","rad","deg","hz","n","j","kj","mol","k"]);
const CONSTANTS=new Set(["pi","π","e","phi","φ"]);
const FUNCTIONS=new Set(["sin","cos","tan","asin","acos","atan","sqrt","racine","log","ln","exp","abs","min","max","sinh","cosh","tanh"]);
const PRECEDENCE={"=":1,"==":1,"≠":1,"<":1,">":1,"<=":1,">=":1,"≤":1,"≥":1,"+":2,"-":2,"*":3,"×":3,"·":3,"/":3,"÷":3,"^":4,"**":4};
function tokenize(input){
 const s=String(input),tokens=[],issues=[];let i=0;
 while(i<s.length){
  const c=s[i];if(/\s/.test(c)){i++;continue;}
  const start=i;
  if(/[0-9]/.test(c)||(c==="."&&/[0-9]/.test(s[i+1]||""))||(c===","&&/[0-9]/.test(s[i+1]||""))){
   let raw="";while(i<s.length&&/[0-9]/.test(s[i]))raw+=s[i++];
   if((s[i]==="."||s[i]===",")&&/[0-9]/.test(s[i+1]||"")){raw+=".";i++;while(i<s.length&&/[0-9]/.test(s[i]))raw+=s[i++];}
   if(/[eE]/.test(s[i]||"")&&(/[0-9]/.test(s[i+1]||"")||/[+-]/.test(s[i+1]||"")&&/[0-9]/.test(s[i+2]||""))){raw+=s[i++];if(/[+-]/.test(s[i]||""))raw+=s[i++];while(i<s.length&&/[0-9]/.test(s[i]))raw+=s[i++];}
   tokens.push({type:"number",value:Number(raw),raw,start,end:i});continue;
  }
  if(/[\p{L}_πφ]/u.test(c)){
   let raw="";while(i<s.length&&/[\p{L}\p{N}_πφ]/u.test(s[i]))raw+=s[i++];
   tokens.push({type:"identifier",value:raw,raw,start,end:i});continue;
  }
  const two=s.slice(i,i+2);
  if(["<=",">=","==","!=","**"].includes(two)){tokens.push({type:"operator",value:two==="!="?"≠":two,start,end:i+2,raw:two});i+=2;continue;}
  if("+-*/×·÷^=<>≤≥≠".includes(c)){tokens.push({type:"operator",value:c,start,end:i+1,raw:c});i++;continue;}
  if("([{".includes(c)){tokens.push({type:"open",value:c,start,end:i+1,raw:c});i++;continue;}
  if(")]}".includes(c)){tokens.push({type:"close",value:c,start,end:i+1,raw:c});i++;continue;}
  if(c==="√"){tokens.push({type:"sqrt",value:"sqrt",start,end:i+1,raw:c});i++;continue;}
  if(c==="²"||c==="³"){tokens.push({type:"operator",value:"^",start,end:i+1,raw:c});tokens.push({type:"number",value:c==="²"?2:3,raw:c,start,end:i+1,superscript:true});i++;continue;}
  if(c===";"){tokens.push({type:"separator",value:c,start,end:i+1,raw:c});i++;continue;}
  issues.push({code:"unsupported_character",character:c,start,end:start+1});i++;
 }
 tokens.push({type:"eof",value:"",start:s.length,end:s.length,raw:""});
 return {tokens,issues};
}
function parse(input){
 const source=norm(input),lex=tokenize(source),tokens=lex.tokens;let p=0;const errors=lex.issues.slice();
 const peek=()=>tokens[p]||tokens[tokens.length-1],take=()=>tokens[p++]||tokens[tokens.length-1];
 const match=(...v)=>v.includes(peek().value);
 const error=(code,t=peek())=>errors.push({code,start:t.start,end:t.end,token:t.raw});
 const node=(type,props,start,end)=>({type,...props,start,end});
 const startsPrimary=t=>t.type==="number"||t.type==="identifier"||t.type==="open"||t.type==="sqrt";
 const closeFor={"(":")","[":"]","{":"}"};
 function primary(){
  const t=take();
  if(t.type==="number")return node("number",{value:t.value,raw:t.raw},t.start,t.end);
  if(t.type==="identifier"){
   const name=t.value,low=name.toLocaleLowerCase("fr-FR");
   if(match("(")){
    take();const args=[];
    if(!match(")")){while(peek().type!=="eof"){args.push(expression(0));if(match(",")){take();continue;}break;}}
    if(match(")")){const z=take();return node("function",{name,normalizedName:low,args},t.start,z.end);}
    error("unclosed_function_call",t);return node("function",{name,normalizedName:low,args,closed:false},t.start,peek().end);
   }
   if(CONSTANTS.has(low)||CONSTANTS.has(name))return node("constant",{name},t.start,t.end);
   return node(UNITS.has(low)?"unit_or_variable":"variable",{name,normalizedName:low},t.start,t.end);
  }
  if(t.type==="sqrt"){
   let arg;if(match("(")){take();arg=expression(0);if(match(")")){const z=take();return node("root",{index:2,argument:arg},t.start,z.end);}error("unclosed_root",t);}
   else arg=expression(4);
   return node("root",{index:2,argument:arg},t.start,arg.end);
  }
  if(t.type==="open"){
   const expected=closeFor[t.value],inner=expression(0);
   if(peek().type==="close"&&peek().value===expected){const z=take();return node("group",{bracket:t.value,expression:inner},t.start,z.end);}
   error("unclosed_group",t);return node("group",{bracket:t.value,expression:inner,closed:false},t.start,inner.end);
  }
  if(t.type==="operator"&&(t.value==="+"||t.value==="-")){
   const arg=expression(4);return node("unary",{operator:t.value,argument:arg},t.start,arg.end);
  }
  error("expected_expression",t);
  return node("unknown",{raw:t.raw},t.start,t.end);
 }
 function expression(min){
  let left=primary();
  while(true){
   const t=peek();let op=t.type==="operator"?t.value:null,implicit=false;
   if(!op&&startsPrimary(t)){op="×";implicit=true;}
   if(!op||PRECEDENCE[op]===undefined||PRECEDENCE[op]<min)break;
   if(!implicit)take();
   const prec=PRECEDENCE[op],right=expression(prec+(op==="^"||op==="**"?0:1));
   left=node("binary",{operator:op==="**"?"^":op,implicit,left,right,semanticKind:(op==="/"||op==="÷")?"fraction":null},left.start,right.end);
  }
  return left;
 }
 const ast=expression(0),remaining=[];
 while(peek().type!=="eof"){remaining.push(take());}
 for(const t of remaining)error("unexpected_token",t);
 const walk=(n,fn)=>{if(!n)return;fn(n);if(n.argument)walk(n.argument,fn);if(n.expression)walk(n.expression,fn);if(n.left)walk(n.left,fn);if(n.right)walk(n.right,fn);(n.args||[]).forEach(x=>walk(x,fn));};
 const variables=[],constants=[],units=[],functions=[];
 walk(ast,n=>{if(n.type==="variable"||n.type==="unit_or_variable"){const a={name:n.name,start:n.start,end:n.end,status:n.type==="unit_or_variable"?"unit_or_variable_ambiguous":"symbol_candidate"};(n.type==="unit_or_variable"?units:variables).push(a);}if(n.type==="constant")constants.push({name:n.name,start:n.start,end:n.end});if(n.type==="function")functions.push({name:n.name,start:n.start,end:n.end,argumentCount:n.args.length});});
 const comparison=tokens.filter(t=>t.type==="operator"&&["=","==","≠","<",">","<=",">=","≤","≥"].includes(t.value));
 let kind=comparison.length?(comparison.some(t=>t.value==="="||t.value==="==")?"equation":"inequality"):"expression";
 if(!tokens.some(t=>t.type!=="eof")||ast.type==="unknown")kind="unparsed";
 const balanced=errors.every(e=>!["unclosed_group","unclosed_function_call","unclosed_root"].includes(e.code));
 return {engine:"IdeeVisionMathExpressionModel",version:VERSION,offline:true,source,ready:true,kind,ast,variables,constants,unitCandidates:units,functions,comparisons:comparison.map(t=>({operator:t.value,start:t.start,end:t.end,evidence:t.raw})),issues:errors,metrics:{tokenCount:tokens.filter(t=>t.type!=="eof").length,variableCount:variables.length,constantCount:constants.length,unitCandidateCount:units.length,functionCount:functions.length,comparisonCount:comparison.length},policy:{evaluated:false,solved:false,unitConversionsPerformed:false,unknownSymbolsPreserved:true,operatorPrecedenceApplied:true,sourcePositionsPreserved:true,unitSymbolsRemainAmbiguous:true},status:balanced&&errors.length===0?"parsed_with_heuristics":"partial_parse"};
}
function analyze(input){return parse(input);}
function diagnostics(){return {name:"Analyseur symbolique mathématique Idée Vision",version:VERSION,offline:true,capabilities:["nombres et décimaux","variables et constantes","opérateurs arithmétiques","priorité des opérateurs","parenthèses et crochets","multiplication implicite","fractions par division","puissances","racines carrées","fonctions usuelles","équations","inégalités","candidats d'unités","positions et preuves textuelles"],limitations:["aucune résolution ni évaluation numérique","syntaxe mathématique encore partielle","une unité comme m peut aussi être une variable","les fonctions sont reconnues lexicalement sans calcul","les équations multiples et notations LaTeX complexes ne sont pas encore prises en charge"]};}
const api=Object.freeze({version:VERSION,tokenize,parse,analyze,diagnostics});
root.IdeeVisionMathExpressionModel=api;if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);