/* Idée Vision — Systèmes et combinaisons d'inéquations v1 */
(function(root){"use strict";
const VERSION="1.0.0",EPS=1e-9;
function clone(x){return x.map(v=>({...v}));}
function cmp(a,b){return Math.abs(a-b)<=EPS?0:a<b?-1:1;}
function lowerMax(a,b){
 if(a.lower===null)return {...b};
 if(b.lower===null)return {...a};
 const c=cmp(a.lower,b.lower);
 if(c>0)return {lower:a.lower,lowerInclusive:a.lowerInclusive};
 if(c<0)return {lower:b.lower,lowerInclusive:b.lowerInclusive};
 return {lower:a.lower,lowerInclusive:a.lowerInclusive&&b.lowerInclusive};
}
function upperMin(a,b){
 if(a.upper===null)return {...b};
 if(b.upper===null)return {...a};
 const c=cmp(a.upper,b.upper);
 if(c<0)return {upper:a.upper,upperInclusive:a.upperInclusive};
 if(c>0)return {upper:b.upper,upperInclusive:b.upperInclusive};
 return {upper:a.upper,upperInclusive:a.upperInclusive&&b.upperInclusive};
}
function valid(x){
 if(x.lower===null||x.upper===null)return true;
 const c=cmp(x.lower,x.upper);
 return c<0||(c===0&&x.lowerInclusive&&x.upperInclusive);
}
function intersection(a,b){
 const out=[];
 for(const x of a)for(const y of b){
  const lo=lowerMax(x,y),hi=upperMin(x,y),z={...lo,...hi};
  if(valid(z))out.push(z);
 }
 return normalize(out);
}
function normalize(items){
 const sorted=clone(items).sort((a,b)=>{
  if(a.lower===null)return b.lower===null?0:-1;
  if(b.lower===null)return 1;
  return cmp(a.lower,b.lower)||(a.lowerInclusive===b.lowerInclusive?0:a.lowerInclusive?-1:1);
 });
 const out=[];
 for(const x of sorted){
  const p=out[out.length-1];
  if(!p){out.push(x);continue;}
  let join=p.upper===null||x.lower===null;
  if(!join){const c=cmp(p.upper,x.lower);join=c>0||(c===0&&(p.upperInclusive||x.lowerInclusive));}
  if(join){
   if(p.upper===null||x.upper===null){p.upper=null;p.upperInclusive=false;}
   else {const c=cmp(p.upper,x.upper);if(c<0){p.upper=x.upper;p.upperInclusive=x.upperInclusive;}else if(c===0)p.upperInclusive=p.upperInclusive||x.upperInclusive;}
  }else out.push(x);
 }
 return out;
}
function splitClauses(source){
 const lines=String(source).split(/[\\n;]+/).map(x=>x.trim()).filter(Boolean),clauses=[],connectors=[];
 for(const line of lines){
  if(!/[<>≤≥≠!]/.test(line))continue;
  const parts=line.split(/\\s+(et aussi|et|simultanément|ou)\\s+/i).map(x=>x.trim()).filter(Boolean);
  for(let i=0;i<parts.length;i++){
   if(/^(et aussi|et|simultanément|ou)$/i.test(parts[i])){connectors.push(parts[i].toLowerCase());continue;}
   if(/[<>≤≥≠!]/.test(parts[i]))clauses.push(parts[i]);
  }
  if(lines.length>1&&clauses.length>1&&connectors.length<clauses.length-1)connectors.push("et");
 }
 return {clauses,connectors};
}
function analyze(input,base,M,S){
 const source=String(input==null?"":input);
 if(!base||!M||!S)return {engine:"IdeeVisionInequalitySystemSolver",version:VERSION,ready:false,offline:true,source,status:"dependencies_missing",inequalities:[],intervals:[],issues:[{code:"dependency_missing"}]};
 const parsed=splitClauses(source);
 if(!parsed.clauses.length)return {engine:"IdeeVisionInequalitySystemSolver",version:VERSION,ready:true,offline:true,source,status:"no_inequality_detected",inequalities:[],intervals:[],issues:[],policy:{externalAIUsed:false,evalUsed:false}};
 const inequalities=parsed.clauses.map(x=>base.solveOne(x,M,S));
 const vars=[...new Set(inequalities.flatMap(x=>x.variables||[]))].sort();
 const fail=inequalities.find(x=>!["solution_set","empty_set","all_real_numbers"].includes(x.status));
 if(fail)return result("unsupported_system",[],inequalities,vars,[{code:"component_inequality_unsupported",componentStatus:fail.status}]);
 if(vars.length>1)return result("multiple_variables_unsupported",[],inequalities,vars,[{code:"same_variable_required"}]);
 if(parsed.connectors.length&&parsed.connectors.length!==inequalities.length-1)return result("unsupported_system",[],inequalities,vars,[{code:"ambiguous_connectors"}]);
 const ops=parsed.connectors.map(x=>/^ou$/i.test(x)?"OR":"AND");
 if(ops.some(x=>x!==ops[0]))return result("unsupported_system",[],inequalities,vars,[{code:"mixed_and_or_requires_parentheses"}]);
 let intervals=inequalities[0].intervals||[];
 for(let i=1;i<inequalities.length;i++){
  const next=inequalities[i].intervals||[];
  intervals=ops[0]==="OR"?normalize(intervals.concat(clone(next))):intersection(intervals,next);
 }
 const status=!intervals.length?"empty_set":intervals.length===1&&intervals[0].lower===null&&intervals[0].upper===null?"all_real_numbers":"solution_set";
 return result(status,intervals,inequalities,vars,[]);
}
function result(status,intervals,inequalities,variables,issues){
 return {engine:"IdeeVisionInequalitySystemSolver",version:VERSION,ready:true,offline:true,status,variables,inequalities,intervals,combination:inequalities.length>1?"intersection_or_union":"single",policy:{externalAIUsed:false,evalUsed:false,strictEndpointsPreserved:true,sourceOrderPreserved:true,onlyExplicitConstraintsCombined:true},issues};
}
function diagnostics(){return {name:"Résolveur de systèmes d'inéquations",version:VERSION,offline:true,capabilities:["séparation de plusieurs inéquations par lignes","séparation par point-virgule","conjonction et","conjonction et aussi","conjonction simultanément","disjonction ou","résolution réutilisant le résolveur individuel","intersection d'intervalles","union d'intervalles","bornes inférieures maximales","bornes supérieures minimales","conservation des bornes strictes","conservation des bornes inclusives","intersection réduite à un point","détection de l'ensemble vide","détection de l'ensemble des réels","systèmes linéaires et quadratiques mélangés","conservation de l'ordre des contraintes","conservation des sources","variables uniques vérifiées","détection de connecteurs ambigus","aucun eval","aucune IA externe"],limitations:["une seule variable commune par système","polynômes de degré maximal deux","racines réelles uniquement","connecteurs et/ou mélangés non pris en charge","parenthèses logiques de regroupement non prises en charge","dénominateurs polynomiaux refusés","symboles d'unités ambigus refusés"]};}
const api=Object.freeze({version:VERSION,analyze,intersection,normalize,diagnostics});root.IdeeVisionInequalitySystemSolver=api;if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
