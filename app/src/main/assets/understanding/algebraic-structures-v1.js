/* Idée Vision — Structures algébriques et systèmes v1 */
(function(root){
"use strict";
const VERSION="1.0.0";
function varsOf(ast,out=[]){if(!ast)return out;if(ast.type==="variable")out.push(ast.name);if(ast.left)varsOf(ast.left,out);if(ast.right)varsOf(ast.right,out);if(ast.argument)varsOf(ast.argument,out);if(ast.expression)varsOf(ast.expression,out);(ast.args||[]).forEach(x=>varsOf(x,out));return out;}
function unwrap(n){while(n&&n.type==="group")n=n.expression;return n;}
function degree(n){
 n=unwrap(n);if(!n)return {degree:null,known:false};
 if(n.type==="number"||n.type==="constant")return {degree:0,known:true};
 if(n.type==="variable")return {degree:1,known:true};
 if(n.type==="unit_or_variable")return {degree:null,known:false};
 if(n.type==="unary")return degree(n.argument);
 if(n.type==="binary"){
  const a=degree(n.left),b=degree(n.right);
  if(!a.known||!b.known)return {degree:null,known:false};
  if(n.operator==="+"||n.operator==="-")return {degree:Math.max(a.degree,b.degree),known:true};
  if(["*","×","·"].includes(n.operator))return {degree:a.degree+b.degree,known:true};
  if(n.operator==="/"||n.operator==="÷")return b.degree===0?{degree:a.degree,known:true}:{degree:null,known:false};
  if(n.operator==="^"&&n.right&&n.right.type==="number"&&Number.isInteger(n.right.value)&&n.right.value>=0)return {degree:a.degree*n.right.value,known:true};
  return {degree:null,known:false};
 }
 return {degree:null,known:false};
}
function countTerms(n){n=unwrap(n);if(n&&n.type==="binary"&&(n.operator==="+"||n.operator==="-"))return countTerms(n.left)+countTerms(n.right);return n?1:0;}
function shape(n){
 n=unwrap(n);if(!n)return "unknown";
 if(n.type==="binary"){
  if(n.semanticKind==="fraction"||n.operator==="/"||n.operator==="÷")return "fraction_rational_candidate";
  if(["*","×","·"].includes(n.operator))return "product_factorized_candidate";
  if(["+","-"].includes(n.operator)){const c=countTerms(n);return c===1?"monomial":c===2?"binomial":"polynomial";}
  if(n.operator==="^")return "power";
 }
 if(n.type==="number"||n.type==="variable"||n.type==="constant")return "monomial";
 if(n.type==="function")return "function_expression";
 return n.type;
}
function normalizeNames(list){return [...new Set(list)].sort();}
function analyze(input,mathEngine){
 const source=String(input==null?"":input),engine=mathEngine||root.IdeeVisionMathExpressionModel;
 const lines=source.split(/\n|;|\s+\bet\b\s+/i).map((s,index)=>({text:s.trim(),index})).filter(x=>x.text);
 const items=[];
 for(const line of lines){
  if(!/[=<>≤≥≠]|!=|>=|<=/.test(line.text))continue;
  if(!engine||typeof engine.analyze!=="function"){items.push({source:line.text,lineIndex:line.index,status:"math_engine_unavailable"});continue;}
  const parsed=engine.analyze(line.text),v=normalizeNames(varsOf(parsed.ast));
  const rootNode=unwrap(parsed.ast),isComparison=rootNode&&rootNode.type==="binary"&&["=","==","≠","<",">","<=",">=","≤","≥"].includes(rootNode.operator);
  const left=isComparison?rootNode.left:null,right=isComparison?rootNode.right:null;
  const lhsVars=normalizeNames(varsOf(left)),rhsVars=normalizeNames(varsOf(right));
  const lhsDegree=left?degree(left):{degree:null,known:false},rhsDegree=right?degree(right):{degree:null,known:false};
  items.push({source:line.text,lineIndex:line.index,kind:parsed.kind,operator:isComparison?rootNode.operator:null,variables:v,leftVariables:lhsVars,rightVariables:rhsVars,leftDegree:lhsDegree.degree,rightDegree:rhsDegree.degree,polynomialDegree:lhsDegree.known&&rhsDegree.known?Math.max(lhsDegree.degree,rhsDegree.degree):null,degreeKnown:lhsDegree.known&&rhsDegree.known,structure:left?shape(left):shape(parsed.ast),ast:parsed.ast,issues:parsed.issues,status:isComparison?"candidate_relation":"partial"});
 }
 const equations=items.filter(x=>x.operator==="="||x.operator==="==");
 const inequalities=items.filter(x=>["<",">","<=",">=","≤","≥","≠"].includes(x.operator));
 const allVars=normalizeNames(items.flatMap(x=>x.variables));
 const shared=allVars.filter(v=>equations.filter(e=>e.variables.includes(v)).length>=2);
 const system=equations.length>=2?{status:"system_candidate",equationCount:equations.length,variables:allVars,sharedVariables:shared,equations:equations.map(x=>x.source),solved:false,verified:false}:null;
 const classification=system?"system_candidate":equations.length===1?"single_equation_candidate":inequalities.length?"inequality_relation_candidate":items.length?"algebraic_relations_candidate":"no_equation_detected";
 return {engine:"IdeeVisionAlgebraicStructures",version:VERSION,offline:true,source,ready:true,classification,items,equations,inequalities,system,variables:allVars,metrics:{relationCount:items.length,equationCount:equations.length,inequalityCount:inequalities.length,variableCount:allVars.length,sharedVariableCount:shared.length},policy:{solved:false,numericallyEvaluated:false,systemsSolved:false,solutionsVerified:false,unknownSymbolsPreserved:true,degreeIsSyntacticCandidate:true,physicalLawsApplied:false},issues:items.flatMap(x=>x.issues||[])};
}
function diagnostics(){return {name:"Structures algébriques et systèmes — Idée Vision",version:VERSION,offline:true,capabilities:["repérage de plusieurs relations algébriques","candidats de systèmes d'équations","variables communes entre équations","équations et inégalités","monômes, binômes et polynômes candidats","produits factorisés et fractions rationnelles candidates","degré polynomial syntaxique simple","conservation des AST et indices de ligne","signalement des ambiguïtés"],limitations:["aucun système n'est résolu","le degré est une estimation syntaxique limitée","les équations dans une même phrase peuvent ne pas être séparées correctement","pas encore de matrices, déterminants, espaces vectoriels ou structures abstraites","les coefficients et solutions ne sont pas calculés"]};}
const api=Object.freeze({version:VERSION,analyze,degree,shape,diagnostics});
root.IdeeVisionAlgebraicStructures=api;if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);