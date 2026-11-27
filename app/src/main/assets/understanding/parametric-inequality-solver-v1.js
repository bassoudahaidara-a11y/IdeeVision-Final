/* Idée Vision — Inéquations paramétriques v1 */
(function(root){"use strict";
const VERSION="1.0.0",EPS=1e-9;
const clean=x=>Math.abs(x)<EPS?0:Number(x.toPrecision(12));
function unwrap(n){while(n&&n.type==="group")n=n.expression;return n;}
function add(a,b,s=1){return [[clean(a[0][0]+s*b[0][0]),clean(a[0][1]+s*b[0][1])],[clean(a[1][0]+s*b[1][0]),clean(a[1][1]+s*b[1][1])]];}
function scale(a,k){return a.map(r=>r.map(x=>clean(x*k)));}
function mul(a,b){const o=[[0,0],[0,0]];for(let i=0;i<2;i++)for(let j=0;j<2;j++)for(let k=0;k<2;k++)for(let l=0;l<2;l++){if(i+k>1||j+l>1){if(Math.abs(a[i][j]*b[k][l])>EPS)return {error:"non_affine_product"};continue;}o[i+k][j+l]+=a[i][j]*b[k][l];}return o.map(r=>r.map(clean));}
function isConst(a){return Math.abs(a[0][1])+Math.abs(a[1][0])+Math.abs(a[1][1])<EPS;}
function poly(n,v,p){
 n=unwrap(n);if(!n)return {error:"missing_node"};
 if(n.type==="number")return [[n.value,0],[0,0]];
 if(n.type==="variable"||n.type==="unit_or_variable"){
  if(n.name===v)return [[0,0],[1,0]];
  if(n.name===p)return [[0,1],[0,0]];
  return {error:"unexpected_symbol:"+n.name};
 }
 if(n.type==="unary"){const a=poly(n.argument,v,p);return a.error?a:n.operator==="-"?scale(a,-1):a;}
 if(n.type!=="binary")return {error:"unsupported_ast_node"};
 const a=poly(n.left,v,p),b=poly(n.right,v,p);if(a.error)return a;if(b.error)return b;
 switch(n.operator){
 case "+":return add(a,b);
 case "-":return add(a,b,-1);
 case "*":case "×":case "·":return mul(a,b);
 case "/":case "÷":if(!isConst(b)||Math.abs(b[0][0])<EPS)return {error:"only_nonzero_numeric_denominators_supported"};return scale(a,1/b[0][0]);
 case "^":if(!isConst(b)||!Number.isInteger(b[0][0])||b[0][0]<0||b[0][0]>1)return {error:"only_first_degree_powers_supported"};return b[0][0]===0?[[1,0],[0,0]]:a;
 default:return {error:"unsupported_operator"};
 }
}
function rootsLinear(c0,c1){return Math.abs(c1)<EPS?[]:[clean(-c0/c1)];}
function val(c,p){return c[0]+c[1]*p;}
function evalPoly(a,x,p){return (a[0][0]+a[0][1]*p)+(a[1][0]+a[1][1]*p)*x;}
function relation(op){return op===">"||op==="<"||op===">="||op==="<="||op==="≥"||op==="≤"||op==="≠";}
function condition(lo,hi,li,ui,p){const fmt=x=>x===null?"":String(x);return (lo===null?"":p+" "+(li?">=":">")+" "+fmt(lo))+(lo!==null&&hi!==null?" et ":"")+(hi===null?"":p+" "+(ui?"<=":"<")+" "+fmt(hi))||"toutes les valeurs réelles";}
function xSolution(A,B,op,pName,parameterValue){
 const eps=EPS,pass=x=>op===">"?x>eps:op==="<"?x< -eps:(op===">="||op==="≥")?x>=-eps:(op==="<="||op==="≤")?x<=eps:Math.abs(x)>eps;
 if(Math.abs(A)<eps){const ok=pass(B);return {status:ok?"all_real_numbers":"empty_set",intervals:ok?[{lower:null,upper:null,lowerInclusive:false,upperInclusive:false}]:[],reason:"coefficient_of_variable_zero"};}
 const root=clean(-B/A),positive=A>0,lower=(op===">"||op===">="||op==="≥")===positive;
 if(op==="≠"||op==="!=")return {status:"solution_set",intervals:[{lower:null,upper:root,lowerInclusive:false,upperInclusive:false},{lower:root,upper:null,lowerInclusive:false,upperInclusive:false}]};
 if(lower)return {status:"solution_set",intervals:[{lower:root,upper:null,lowerInclusive:op!==">",upperInclusive:false}]};
 return {status:"solution_set",intervals:[{lower:null,upper:root,lowerInclusive:false,upperInclusive:op!=="<"}]};
}
function solveOne(source,M,options={}){
 const parsed=M.parse(source),ast=unwrap(parsed.ast);
 if(parsed.kind!=="inequality"||parsed.issues.length||!ast||ast.type!=="binary"||!relation(ast.operator))return {source,status:"unsupported_or_invalid",cases:[],issues:[{code:"one_inequality_required"}]};
 if(parsed.comparisons.length!==1)return {source,status:"multiple_relations_unsupported",cases:[],issues:[{code:"one_comparison_required"}]};
 const names=[...new Set(parsed.variables.concat(parsed.unitCandidates).map(x=>x.name))].sort(),params=(options.parameters||[]).map(String),variable=options.variable||(names.find(x=>!params.includes(x)&&!parsed.unitCandidates.some(u=>u.name===x))||names.find(x=>!params.includes(x)));
 if(!variable)return {source,status:"variable_not_identified",cases:[],issues:[{code:"variable_required"}]};
 const other=names.filter(x=>x!==variable);
 if(other.length!==1||!params.includes(other[0]))return {source,status:other.length?"parameter_declaration_required":"parameter_required",variables:names,cases:[],issues:[{code:"declare_exactly_one_parameter",symbols:other}]};
 const parameter=other[0],left=poly(ast.left,variable,parameter),right=poly(ast.right,variable,parameter);
 if(left.error||right.error)return {source,status:"unsupported_expression",variables:names,parameter,variable,cases:[],issues:[{code:left.error||right.error}]};
 const diff=add(left,right,-1),A=diff[1],B=diff[0],aRoots=rootsLinear(A[0],A[1]),bRoots=rootsLinear(B[0],B[1]),critical=[...new Set(aRoots.concat(bRoots).filter(Number.isFinite))].sort((x,y)=>x-y);
 const paramValue=options.values&&Object.prototype.hasOwnProperty.call(options.values,parameter)?Number(options.values[parameter]):null;
 if(paramValue!==null){if(!Number.isFinite(paramValue))return {source,status:"invalid_parameter_value",cases:[],issues:[{code:"parameter_value_must_be_finite"}]};const result=xSolution(val(A,paramValue),val(B,paramValue),ast.operator,parameter,paramValue);return {source,status:result.status,mode:"substituted_parameter",variable,parameter,parameterValue:paramValue,coefficients:{A:val(A,paramValue),B:val(B,paramValue)},cases:[{condition:parameter+" = "+paramValue,parameterRange:{lower:paramValue,upper:paramValue,lowerInclusive:true,upperInclusive:true},...result}],issues:[]};}
 const boundaries=[null,...critical,null],cases=[];
 for(let i=0;i<boundaries.length-1;i++){const lo=boundaries[i],hi=boundaries[i+1],sample=lo===null?(hi===null?0:hi-Math.max(1,Math.abs(hi)+1)):hi===null?lo+Math.max(1,Math.abs(lo)+1):(lo+hi)/2;const result=xSolution(val(A,sample),val(B,sample),ast.operator,parameter);const A0=A[0],A1=A[1],B0=B[0],B1=B[1];const endpoint= val(A,sample)!==0?"-("+B0+(B1? (B1>0?" + ":" - ")+Math.abs(B1)+"*"+parameter:"")+")/("+A0+(A1?(A1>0?" + ":" - ")+Math.abs(A1)+"*"+parameter:"")+")":null;cases.push({condition:condition(lo,hi,false,false,parameter),parameterRange:{lower:lo,upper:hi,lowerInclusive:false,upperInclusive:false},solution:result,endpointExpression:endpoint,coefficientSigns:{A:Math.sign(val(A,sample)),B:Math.sign(val(B,sample))}});}
 for(const q of critical){const aa=val(A,q),bb=val(B,q),result=xSolution(aa,bb,ast.operator,parameter,q);cases.push({condition:parameter+" = "+q,parameterRange:{lower:q,upper:q,lowerInclusive:true,upperInclusive:true},solution:result,endpointExpression:null,coefficientSigns:{A:Math.sign(aa),B:Math.sign(bb)}});}
 cases.sort((a,b)=>(a.parameterRange.lower===null?-Infinity:a.parameterRange.lower)-(b.parameterRange.lower===null?-Infinity:b.parameterRange.lower)||(a.parameterRange.upper===null?Infinity:a.parameterRange.upper)-(b.parameterRange.upper===null?Infinity:b.parameterRange.upper));
 return {source,status:"parameter_cases",mode:"symbolic_case_analysis",variable,parameter,relation:ast.operator,coefficients:{A,B},criticalParameterValues:critical,cases,policy:{externalAIUsed:false,evalUsed:false,parameterCasesExplicit:true,zeroCoefficientCaseHandled:true},issues:[]};
}
function analyze(input,M,options={}){
 const source=String(input==null?"":input),declared=source.match(/param(?:è|e)tre(?:s)?\s+([a-zA-Z])\b/i),parameters=options.parameters|| (declared?[declared[1]]:[]),expr=declared?source.replace(/.*?param(?:è|e)tre(?:s)?\s+[a-zA-Z]\s*[:;,]?/i,"").trim():source;
 const lines=expr.split(/\n|;/).map(x=>x.trim()).filter(Boolean),candidates=lines.filter(x=>/[<>≤≥≠!]/.test(x));
 if(!candidates.length)return {engine:"IdeeVisionParametricInequalitySolver",version:VERSION,ready:true,offline:true,source,status:"no_parameterized_inequality_detected",cases:[],inequalities:[],issues:[]};
 const results=candidates.map(x=>solveOne(x,M,{...options,parameters}));
 return {engine:"IdeeVisionParametricInequalitySolver",version:VERSION,ready:true,offline:true,source,status:results.length===1?results[0].status:"multiple_parameterized_inequalities",parameter:results[0].parameter,variable:results[0].variable,inequalities:results,cases:results.flatMap(x=>x.cases||[]),issues:results.flatMap(x=>x.issues||[]),policy:{externalAIUsed:false,evalUsed:false}};
}
function diagnostics(){return {name:"Résolveur d'inéquations paramétriques",version:VERSION,offline:true,capabilities:["identification explicite d'une variable et d'un paramètre","inéquations affines en la variable","coefficients affines en un paramètre","développement contrôlé des produits affines","étude des cas paramètre positif","étude des cas paramètre négatif","étude du cas paramètre nul","calcul des valeurs critiques du paramètre","découpage de la droite du paramètre","prise en charge des bornes de cas","substitution d'une valeur numérique de paramètre","résolution de l'inégalité après substitution","gestion des coefficients nuls","gestion des solutions vides","gestion de tous les réels","gestion des bornes strictes et larges","préservation de la relation d'origine","résultats structurés et sérialisables","aucun eval","aucune IA externe"],limitations:["une variable et un paramètre par inéquation","degré au plus un en chaque symbole","pas de termes x²","pas de fonctions ni racines symboliques","pas de dénominateur dépendant du paramètre","déclaration du paramètre requise lorsqu'il est ambigu","pas encore de systèmes paramétriques conjoints"]};}
const api=Object.freeze({version:VERSION,analyze,solveOne,diagnostics});root.IdeeVisionParametricInequalitySolver=api;if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
