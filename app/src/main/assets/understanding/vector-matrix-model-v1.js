/* Idée Vision — Représentation symbolique des vecteurs et matrices v1 */
(function(root){
"use strict";
const VERSION="1.0.0";
const IDENT=/^[\p{L}_][\p{L}\p{N}_]*$/u;
function splitTop(s,delims){
 const out=[];let start=0,depth=0;
 for(let i=0;i<s.length;i++){const c=s[i];if("([{".includes(c))depth++;else if(")]}".includes(c))depth--;else if(depth===0&&delims.includes(c)){out.push({text:s.slice(start,i).trim(),start,end:i});start=i+1;}}
 out.push({text:s.slice(start).trim(),start,end:s.length});return out.filter(x=>x.text);
}
function matchingOuter(s){
 const pairs={"(":")","[":"]","{":"}"},first=s[0],last=pairs[first];if(!last||s[s.length-1]!==last)return false;
 let depth=0;for(let i=0;i<s.length;i++){if(s[i]===first)depth++;if(s[i]===last){depth--;if(depth===0&&i!==s.length-1)return false;}}return depth===0;
}
function scalar(raw){
 const s=raw.trim();if(!s)return {kind:"unknown",raw:s};
 if(/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:e[+-]?\d+)?$/i.test(s))return {kind:"number",raw:s,value:Number(s.replace(",","."))};
 if(IDENT.test(s))return {kind:"symbol",raw:s,name:s};
 return {kind:"expression",raw:s,name:null};
}
function literal(raw){
 let s=raw.trim(),depth=0;
 while(matchingOuter(s)){s=s.slice(1,-1).trim();depth++;}
 if(!s)return {kind:"empty",entries:[],dimensions:[0]};
 const parts=splitTop(s,",;");const nested=parts.length>0&&parts.every(p=>matchingOuter(p.text));
 if(nested){
  const rows=parts.map(p=>{let t=p.text;while(matchingOuter(t))t=t.slice(1,-1).trim();return splitTop(t,",;").map(x=>scalar(x.text));});
  const cols=rows[0].length,ragged=rows.some(r=>r.length!==cols);
  return {kind:"matrix",rows,dimensions:[rows.length,cols],ragged};
 }
 const entries=splitTop(s,",;").map(x=>scalar(x.text));
 return {kind:"vector",entries,dimensions:[entries.length]};
}
function analyze(input){
 const source=String(input==null?"":input),vectors=[],matrices=[],operations=[],relations=[],issues=[];
 const lines=source.split(/\n/);let offset=0;
 for(let li=0;li<lines.length;li++){
  const line=lines[li],trim=line.trim(),lead=line.indexOf(trim);if(!trim){offset+=line.length+1;continue;}
  const assign=/^\s*([\p{L}_][\p{L}\p{N}_]*)\s*=\s*(.+?)\s*$/u.exec(line);
  if(assign){
   const name=assign[1],raw=assign[2],start=offset+line.indexOf(raw),value=literal(raw);
   if(value.kind==="vector"&&value.entries.length>=2){
    vectors.push({id:"vector_"+vectors.length,name,notation:raw[0],components:value.entries,dimension:value.entries.length,sourceRange:{start,end:start+raw.length},evidence:raw,lineIndex:li,status:"candidate"});
   }else if(value.kind==="matrix"){
    const item={id:"matrix_"+matrices.length,name,notation:raw[0],rows:value.rows,dimensions:value.dimensions,rowCount:value.dimensions[0],columnCount:value.dimensions[1],sourceRange:{start,end:start+raw.length},evidence:raw,lineIndex:li,status:"candidate",rectangular:!value.ragged};
    matrices.push(item);if(value.ragged)issues.push({code:"ragged_matrix_candidate",name,lineIndex:li});
   }else if(value.kind==="vector"&&value.entries.length===1){
    issues.push({code:"single_component_vector_ambiguous",name,lineIndex:li,evidence:raw});
   }
  }
  offset+=line.length+1;
 }
 const patterns=[
  {type:"vector_addition",re:/\b([\p{L}_]\w*)\s*\+\s*([\p{L}_]\w*)\b/gu},
  {type:"vector_subtraction",re:/\b([\p{L}_]\w*)\s*-\s*([\p{L}_]\w*)\b/gu},
  {type:"scalar_multiplication",re:/\b([\p{L}_]\w*)\s*(?:\*|×)\s*([\p{L}_]\w*)\b/gu},
  {type:"dot_product",re:/\b([\p{L}_]\w*)\s*·\s*([\p{L}_]\w*)\b/gu},
  {type:"cross_product",re:/\b([\p{L}_]\w*)\s*×\s*([\p{L}_]\w*)\b/gu},
  {type:"matrix_addition",re:/\b([A-Z])\s*\+\s*([A-Z])\b/g},
  {type:"matrix_subtraction",re:/\b([A-Z])\s*-\s*([A-Z])\b/g},
  {type:"matrix_multiplication",re:/\b([A-Z])\s*([A-Z])\b/g}
 ];
 for(const p of patterns){p.re.lastIndex=0;let m;while((m=p.re.exec(source))!==null){
  if(p.type==="matrix_multiplication"&&m[1]===m[2])continue;
  if(p.type==="scalar_multiplication"&&p.type!=="cross_product"&&m[0].includes("×"))continue;
  operations.push({type:p.type,operands:m.slice(1),sourceRange:{start:m.index,end:m.index+m[0].length},evidence:m[0],status:"candidate"});
 }}
 const unary=[
  {type:"transpose",re:/\b([A-Z])\s*(?:\^T|ᵀ|transposee?)/gi},
  {type:"determinant",re:/\b(?:det|determinant)\s*\(\s*([A-Z])\s*\)/gi},
  {type:"inverse",re:/\b([A-Z])\s*(?:\^\s*-1|⁻¹)/g},
  {type:"vector_norm",re:/\|\s*([\p{L}_]\w*)\s*\|/gu}
 ];
 for(const p of unary){let m;while((m=p.re.exec(source))!==null)operations.push({type:p.type,operands:[m[1]],sourceRange:{start:m.index,end:m.index+m[0].length},evidence:m[0],status:"candidate"});}
 const vectorEquations=source.match(/\b[\p{L}_]\w*\s*=\s*[\p{L}_]\w*\s*(?:\+\s*[\p{L}_]\w*)?/gu)||[];
 const matrixEquations=source.match(/\b[A-Z]\s*[\p{L}_]\w*\s*=\s*[\p{L}_]\w*/gu)||[];
 const matrixSymbols=[...new Set(matrices.map(x=>x.name))],vectorSymbols=[...new Set(vectors.map(x=>x.name))];
 const policy={computed:false,solved:false,determinantsCalculated:false,inversesCalculated:false,dimensionsVerified:false,physicalLawsApplied:false,unknownEntriesPreserved:true,sourcePositionsPreserved:true,allRelationsRemainCandidates:true};
 return {engine:"IdeeVisionVectorMatrixModel",version:VERSION,offline:true,source,ready:true,vectors,matrices,operations,relations:{vectorEquations,matrixEquations},symbols:{vectors:vectorSymbols,matrices:matrixSymbols},metrics:{vectorCount:vectors.length,matrixCount:matrices.length,operationCount:operations.length,dimensionCount:vectors.length+matrices.length},issues,policy};
}
function diagnostics(){return {name:"Modèle des vecteurs et matrices — Idée Vision",version:VERSION,offline:true,capabilities:["vecteurs en coordonnées et composantes","dimensions des vecteurs","matrices par lignes et colonnes","dimensions et entrées","symboles et valeurs inconnues","matrices rectangulaires ou irrégulières signalées","addition et soustraction candidates","multiplication scalaire et matricielle candidates","produit scalaire et vectoriel candidats","transposée, déterminant et inverse comme opérations symboliques","équations vectorielles et matricielles candidates","preuves textuelles et indices de ligne"],limitations:["aucune opération numérique n'est effectuée","aucun déterminant ni inverse n'est calculé","aucun système matriciel n'est résolu","la notation entre parenthèses ou crochets peut être ambiguë","les opérations sont des reconnaissances lexicales candidates"]};}
const api=Object.freeze({version:VERSION,analyze,diagnostics,literal,splitTop});
root.IdeeVisionVectorMatrixModel=api;if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
