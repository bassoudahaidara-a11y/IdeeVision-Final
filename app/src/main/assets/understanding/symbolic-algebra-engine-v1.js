/* Idée Vision — Simplification symbolique et transformations algébriques v1 */
(function(root){
"use strict";
const VERSION="1.0.0",MAX_TERMS=256,MAX_POWER=8;
const node=(type,p={})=>({type,...p});
const clean=n=>Math.abs(n)<1e-12?0:Number(n.toPrecision(12));
const unwrap=n=>{while(n&&n.type==="group")n=n.expression;return n;};
function keyOf(exps){return Object.keys(exps).filter(k=>exps[k]).sort().map(k=>k+"^"+exps[k]).join("*");}
function cloneExp(x){return Object.assign({},x);}
function polyConstant(v){return new Map([[ "",clean(v) ]]);}
function polyVariable(name){return new Map([[name+"^1",1]]);}
function parseKey(k){const o={};if(k)k.split("*").forEach(x=>{const z=x.lastIndexOf("^");o[x.slice(0,z)]=Number(x.slice(z+1));});return o;}
function addPoly(a,b,sign=1){const out=new Map(a);for(const [k,v] of b){out.set(k,clean((out.get(k)||0)+sign*v));if(out.get(k)===0)out.delete(k);}return out;}
function multiplyPoly(a,b){const out=new Map();for(const [ka,va] of a)for(const [kb,vb] of b){const e=parseKey(ka);for(const [n,p] of Object.entries(parseKey(kb)))e[n]=(e[n]||0)+p;const k=keyOf(e);out.set(k,clean((out.get(k)||0)+va*vb));if(out.size>MAX_TERMS)throw Object.assign(new Error("term_limit"),{code:"expansion_term_limit"});}for(const [k,v] of out)if(v===0)out.delete(k);return out;}
function polyOf(ast){
 const n=unwrap(ast);if(!n)return {ok:false,code:"missing_ast"};
 if(n.type==="number")return {ok:true,terms:polyConstant(n.value)};
 if(n.type==="variable")return {ok:true,terms:polyVariable(n.name)};
 if(n.type==="constant")return {ok:false,code:"constant_not_polynomial"};
 if(n.type==="unary"){const a=polyOf(n.argument);if(!a.ok)return a;return {ok:true,terms:n.operator==="-"?new Map([...a.terms].map(([k,v])=>[k,-v])):a.terms};}
 if(n.type==="binary"){
  const a=polyOf(n.left),b=polyOf(n.right);if(!a.ok)return a;if(!b.ok)return b;
  if(n.operator==="+")return {ok:true,terms:addPoly(a.terms,b.terms)};
  if(n.operator==="-")return {ok:true,terms:addPoly(a.terms,b.terms,-1)};
  if(["*","×","·"].includes(n.operator)){try{return {ok:true,terms:multiplyPoly(a.terms,b.terms)};}catch(e){return {ok:false,code:e.code||"expansion_error"};}}
  if(["/","÷"].includes(n.operator)){if(b.terms.size!==1||!b.terms.has("")||b.terms.get("")===0)return {ok:false,code:"non_constant_or_zero_denominator"};return {ok:true,terms:new Map([...a.terms].map(([k,v])=>[k,clean(v/b.terms.get(""))]))};}
  if(n.operator==="^"&&b.terms.size===1&&b.terms.has("")&&Number.isInteger(b.terms.get(""))&&b.terms.get("")>=0&&b.terms.get("")<=MAX_POWER){
   let out=polyConstant(1),base=a.terms;for(let i=0;i<b.terms.get("");i++){try{out=multiplyPoly(out,base);}catch(e){return {ok:false,code:e.code||"expansion_error"};}}return {ok:true,terms:out};
  }
 }
 return {ok:false,code:"non_polynomial_expression"};
}
function fromPoly(poly){
 const entries=[...poly.entries()].filter(([,c])=>c!==0).sort((a,b)=>b[0].localeCompare(a[0]));
 if(!entries.length)return node("number",{value:0,raw:"0"});
 const factors=[];
 for(const [k,c] of entries){const exps=parseKey(k),vars=Object.keys(exps).sort();let term;
  if(!vars.length)term=node("number",{value:Math.abs(c),raw:String(Math.abs(c))});
  else{const fs=vars.map(v=>exps[v]===1?node("variable",{name:v,normalizedName:v.toLowerCase()}):node("binary",{operator:"^",left:node("variable",{name:v,normalizedName:v.toLowerCase()}),right:node("number",{value:exps[v],raw:String(exps[v])})}));term=fs.reduce((a,b)=>a?node("binary",{operator:"*",left:a,right:b}):b,null);if(Math.abs(c)!==1)term=node("binary",{operator:"*",left:node("number",{value:Math.abs(c),raw:String(Math.abs(c))}),right:term});}
  factors.push({sign:c<0?-1:1,term});
 }
 let out=factors[0].term;if(factors[0].sign<0)out=node("unary",{operator:"-",argument:out});
 for(let i=1;i<factors.length;i++)out=node("binary",{operator:factors[i].sign<0?"-":"+",left:out,right:factors[i].term});
 return out;
}
function stringify(n,parent=0){
 if(!n)return "?";if(n.type==="group")return "("+stringify(n.expression)+")";
 if(n.type==="number")return String(clean(n.value));
 if(n.type==="variable"||n.type==="constant")return n.name;
 if(n.type==="unary")return n.operator+stringify(n.argument,4);
 if(n.type==="function")return n.name+"("+n.args.map(x=>stringify(x)).join(", ")+")";
 if(n.type==="root")return "√("+stringify(n.argument)+")";
 if(n.type==="binary"){const p={"+":1,"-":1,"*":2,"×":2,"/":2,"÷":2,"^":3}[n.operator]||0;const s=stringify(n.left,p)+" "+n.operator+" "+stringify(n.right,p+1);return p<parent?"("+s+")":s;}
 return n.raw||"?";
}
function simple(ast,steps){
 const n=unwrap(ast);if(!n)return {ast:n,changed:false};
 if(n.type==="unary"){const a=simple(n.argument,steps);if(a.ast.type==="number"){steps.push("Calcul du signe unaire");return {ast:node("number",{value:clean(n.operator==="-"?-a.ast.value:a.ast.value)}),changed:true};}if(a.ast.type==="unary"&&a.ast.operator==="-"){steps.push("Suppression des signes négatifs doubles");return {ast:a.ast.argument,changed:true};}return {ast:node("unary",{operator:n.operator,argument:a.ast}),changed:a.changed};}
 if(n.type!=="binary")return {ast:n,changed:false};
 const l=simple(n.left,steps),r=simple(n.right,steps),a=l.ast,b=r.ast,op=n.operator;
 if(a.type==="number"&&b.type==="number"){
  let v;if(op==="+")v=a.value+b.value;else if(op==="-")v=a.value-b.value;else if(["*","×","·"].includes(op))v=a.value*b.value;else if(["/","÷"].includes(op)&&b.value!==0)v=a.value/b.value;else if(op==="^"&&!(a.value===0&&b.value<0))v=Math.pow(a.value,b.value);else v=null;
  if(v!==null&&Number.isFinite(v)){steps.push("Calcul numérique de "+stringify(n));return {ast:node("number",{value:clean(v)}),changed:true};}
 }
 if(op==="+"&&b.type==="number"&&b.value===0||op==="+"&&a.type==="number"&&a.value===0){steps.push("Suppression de l'addition de zéro");return {ast:a.type==="number"?b:a,changed:true};}
 if(op==="-"&&b.type==="number"&&b.value===0){steps.push("Suppression de la soustraction de zéro");return {ast:a,changed:true};}
 if(["*","×","·"].includes(op)){if(a.type==="number"&&a.value===0||b.type==="number"&&b.value===0){steps.push("Produit par zéro");return {ast:node("number",{value:0}),changed:true};}if(a.type==="number"&&a.value===1||b.type==="number"&&b.value===1){steps.push("Suppression du facteur un");return {ast:a.type==="number"?b:a,changed:true};}}
 if(op==="/"&&b.type==="number"&&b.value===1){steps.push("Division par un");return {ast:a,changed:true};}
 if(op==="^"&&b.type==="number"){if(b.value===1){steps.push("Puissance un");return {ast:a,changed:true};}if(b.value===0){steps.push("Puissance zéro");return {ast:node("number",{value:1}),changed:true};}}
 return {ast:node("binary",{operator:op,left:a,right:b}),changed:l.changed||r.changed};
}
function gcd(a,b){a=Math.round(Math.abs(a));b=Math.round(Math.abs(b));while(b){const t=b;b=a%b;a=t;}return a||1;}
function commonFactor(poly){
 const es=[...poly.entries()];if(es.length<2)return null;
 const vars=Object.keys(parseKey(es[0][0]));const common={};
 for(const v of vars){const m=Math.min(...es.map(([k])=>parseKey(k)[v]||0));if(m>0)common[v]=m;}
 let coeff=es.map(([,v])=>v),g=coeff.every(Number.isInteger)?coeff.reduce((a,b)=>gcd(a,b),0):1;
 if(g===0)g=1;
 const rem=new Map();for(const [k,c] of es){const ex=parseKey(k);for(const [v,p] of Object.entries(common)){ex[v]-=p;if(!ex[v])delete ex[v];}rem.set(keyOf(ex),clean(c/g));}
 if(!Object.keys(common).length&&g===1)return null;
 return {common,g,remaining:rem};
}
function factorAst(f){let out=null;for(const v of Object.keys(f.common).sort()){const a=node("variable",{name:v});const b=f.common[v]===1?a:node("binary",{operator:"^",left:a,right:node("number",{value:f.common[v]})});out=out?node("binary",{operator:"*",left:out,right:b}):b;}if(f.g!==1){const c=node("number",{value:f.g});out=out?node("binary",{operator:"*",left:c,right:out}):c;}return out;}
function analyze(input,mathModel,options){
 const source=String(input==null?"":input),opts=options||{},parsed=mathModel?mathModel.parse(source):null,steps=[],issues=[];
 if(!parsed)return {engine:"IdeeVisionSymbolicAlgebra",version:VERSION,source,ready:false,issues:[{code:"math_parser_unavailable"}]};
 if(parsed.kind!=="expression")return {engine:"IdeeVisionSymbolicAlgebra",version:VERSION,source,ready:true,parsedKind:parsed.kind,simplified:false,expanded:false,factored:false,issues:[{code:"relation_not_transformed"}],policy:{equationsSolved:false,inequalitiesSolved:false,sourcePreserved:true}};
 if(parsed.issues.length)return {engine:"IdeeVisionSymbolicAlgebra",version:VERSION,source,ready:true,simplified:false,issues:parsed.issues,policy:{sourcePreserved:true}};
 const basic=simple(parsed.ast,steps),poly=polyOf(basic.ast),limit=Number.isInteger(opts.maxTerms)?Math.max(1,Math.min(MAX_TERMS,opts.maxTerms)):MAX_TERMS;
 let ast=basic.ast,expanded=false,simplified=false,polynomial=null;
 if(poly.ok&&poly.terms.size<=limit){const canonical=fromPoly(poly.terms);const before=stringify(ast),after=stringify(canonical);if(before!==after){steps.push("Réduction et regroupement des termes semblables");simplified=true;}ast=canonical;expanded=/[(*]/.test(source)&&poly.terms.size>1;polynomial=[...poly.terms.entries()].map(([monomial,coefficient])=>({monomial,coefficient}));}
 else if(poly.code==="expansion_term_limit")issues.push({code:"expansion_term_limit",maxTerms:limit});
 const factor=poly.ok?commonFactor(poly.terms):null;let factoredAst=null;
 if(factor){factoredAst=node("binary",{operator:"*",left:factorAst(factor),right:fromPoly(factor.remaining)});}
 const factorText=factoredAst?stringify(factoredAst):null;
 const result=stringify(ast);
 return {engine:"IdeeVisionSymbolicAlgebra",version:VERSION,offline:true,source,ready:true,simplified:true,expanded,factored:!!factor,originalExpression:source,simplifiedAst:ast,simplifiedExpression:result,expandedExpression:expanded?result:null,factoredExpression:factorText,polynomial,steps,issues,metrics:{termCount:polynomial?polynomial.length:null,stepCount:steps.length,variableCount:parsed.variables.length},policy:{equationsSolved:false,inequalitiesSolved:false,unknownVariablesPreserved:true,sourcePreserved:true,transformationsAlgebraicallyEquivalent:true,domainRestrictionsMayNeedSeparateTracking:true,maxExpansionTerms:limit}};
}
function diagnostics(){return {name:"Moteur de simplification symbolique Idée Vision",version:VERSION,offline:true,capabilities:["réduction des constantes et identités élémentaires","regroupement de termes semblables","développement polynomial par distributivité","puissances entières positives limitées","produits remarquables via développement","factorisation par facteur monomial commun","simplification des coefficients numériques","conservation des variables inconnues","journal des transformations"],limitations:["ne résout pas les équations ni les inégalités","ne factorise pas les polynômes irréductibles généraux","ne simplifie pas les fractions rationnelles avec facteurs symboliques","ne suit pas encore toutes les restrictions de domaine","les transformations polynomiales sont limitées à 256 termes et aux puissances entières de 0 à 8","les expressions trigonométriques et autres fonctions restent symboliques"]};}
const api=Object.freeze({version:VERSION,analyze,diagnostics,polyOf,stringify});
root.IdeeVisionSymbolicAlgebra=api;if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
