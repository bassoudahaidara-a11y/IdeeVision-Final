/* Idée Vision — Moteur de calcul numérique contrôlé v1 */
(function(root){
"use strict";
const VERSION="1.0.0";
const CONSTANTS={pi:Math.PI,"π":Math.PI,e:Math.E,phi:(1+Math.sqrt(5))/2,"φ":(1+Math.sqrt(5))/2};
const FUNCTIONS={
 sin:Math.sin,cos:Math.cos,tan:Math.tan,asin:Math.asin,acos:Math.acos,atan:Math.atan,
 sqrt:Math.sqrt,racine:Math.sqrt,log:Math.log10,ln:Math.log,exp:Math.exp,abs:Math.abs,
 sinh:Math.sinh,cosh:Math.cosh,tanh:Math.tanh
};
const finite=n=>typeof n==="number"&&Number.isFinite(n);
const clean=n=>Object.is(n,-0)?0:n;
function evaluateNode(n,vars,issues){
 if(!n){issues.push({code:"missing_ast"});return null;}
 switch(n.type){
  case "number":return n.value;
  case "constant":{const k=n.name.toLocaleLowerCase("fr-FR");if(k in CONSTANTS)return CONSTANTS[k];issues.push({code:"unknown_constant",name:n.name});return null;}
  case "variable":{if(Object.prototype.hasOwnProperty.call(vars,n.name)){const v=Number(vars[n.name]);if(finite(v))return v;issues.push({code:"invalid_variable_value",name:n.name});return null;}issues.push({code:"unknown_variable",name:n.name});return null;}
  case "unit_or_variable":{if(Object.prototype.hasOwnProperty.call(vars,n.name)){const v=Number(vars[n.name]);if(finite(v))return v;}issues.push({code:"ambiguous_unit_or_variable",name:n.name});return null;}
  case "group":return evaluateNode(n.expression,vars,issues);
  case "unary":{const v=evaluateNode(n.argument,vars,issues);if(v===null)return null;return n.operator==="-"?-v:v;}
  case "root":{const v=evaluateNode(n.argument,vars,issues);if(v===null)return null;if(v<0){issues.push({code:"square_root_negative",value:v});return null;}return Math.sqrt(v);}
  case "function":{
   const f=FUNCTIONS[n.normalizedName||String(n.name).toLowerCase()];
   if(!f){issues.push({code:"unsupported_function",name:n.name});return null;}
   if(n.args.length!==1){issues.push({code:"function_argument_count",name:n.name,expected:1,actual:n.args.length});return null;}
   const v=evaluateNode(n.args[0],vars,issues);if(v===null)return null;
   if(["sqrt","racine"].includes(n.normalizedName)&&v<0){issues.push({code:"square_root_negative",value:v});return null;}
   if(["log","ln"].includes(n.normalizedName)&&v<=0){issues.push({code:"logarithm_domain_error",value:v});return null;}
   if(["asin","acos"].includes(n.normalizedName)&&(v< -1||v>1)){issues.push({code:"inverse_trigonometric_domain_error",value:v});return null;}
   const out=f(v);if(!finite(out)){issues.push({code:"non_finite_function_result",name:n.name});return null;}return out;
  }
  case "binary":{
   const a=evaluateNode(n.left,vars,issues),b=evaluateNode(n.right,vars,issues);if(a===null||b===null)return null;
   let out;
   switch(n.operator){
    case "+":out=a+b;break;case "-":out=a-b;break;case "*":case "×":case "·":out=a*b;break;
    case "/":case "÷":if(b===0){issues.push({code:"division_by_zero"});return null;}out=a/b;break;
    case "^":if(a===0&&b<0){issues.push({code:"zero_negative_power"});return null;}out=Math.pow(a,b);break;
    default:issues.push({code:"unsupported_operator",operator:n.operator});return null;
   }
   if(!finite(out)){issues.push({code:"non_finite_result"});return null;}return out;
  }
  default:issues.push({code:"unsupported_ast_node",nodeType:n.type});return null;
 }
}
function analyze(input,MathModel,options){
 const source=String(input==null?"":input),opts=options&&typeof options==="object"?options:{},variables=opts.variables&&typeof opts.variables==="object"?opts.variables:{};
 const parsed=MathModel?MathModel.parse(source):null,issues=[];
 if(!parsed){issues.push({code:"math_parser_unavailable"});return {engine:"IdeeVisionNumericMath",version:VERSION,source,ready:false,evaluated:false,result:null,issues,variables:{...variables}};}
 if(parsed.kind!=="expression"){issues.push({code:parsed.kind==="equation"?"equation_not_solved":"inequality_not_solved"});return {engine:"IdeeVisionNumericMath",version:VERSION,source,ready:true,evaluated:false,result:null,ast:parsed.ast,issues,variables:{...variables},policy:{equationsSolved:false,inequalitiesSolved:false}};}
 issues.push(...parsed.issues);
 const result=parsed.issues.length?null:evaluateNode(parsed.ast,variables,issues);
 const evaluated=result!==null&&issues.length===0;
 const precision=Number.isInteger(opts.precision)?Math.max(0,Math.min(15,opts.precision)):12;
 const rounded=evaluated?Number(result.toPrecision(Math.max(1,precision))):null;
 return {engine:"IdeeVisionNumericMath",version:VERSION,offline:true,source,ready:true,ast:parsed.ast,evaluated,result:evaluated?clean(rounded):null,rawResult:evaluated?clean(result):null,formatted:evaluated?String(clean(rounded)):null,variables:{...variables},issues,policy:{evaluated,solved:false,unitConversionsPerformed:false,unknownSymbolsPreserved:true,divisionByZeroChecked:true,domainChecksApplied:true,precisionDigits:precision}};
}
function diagnostics(){return {name:"Moteur de calcul numérique Idée Vision",version:VERSION,offline:true,capabilities:["addition, soustraction, multiplication et division","priorité des opérations et parenthèses","multiplication implicite et fractions","puissances et racines carrées","constantes pi, e et nombre d'or","fonctions usuelles trigonométriques, logarithmiques et exponentielles","substitution de variables numériques explicites","contrôle des divisions par zéro et domaines simples","résultats finis et précision contrôlée"],limitations:["ne résout pas les équations ou inégalités","ne convertit pas les unités","ne calcule pas les matrices ni les vecteurs","ne simplifie pas encore les expressions symboliques générales","les fonctions trigonométriques utilisent les radians","les expressions contenant des unités ambiguës sont refusées"]};}
const api=Object.freeze({version:VERSION,analyze,diagnostics,evaluateNode});
root.IdeeVisionNumericMath=api;if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
