(function(root){
'use strict';
const VERSION='0.1.0',MAX_GOALS=12,MAX_DEPTH=8,MAX_NODES=120;
function validGoal(g){return !!g&&typeof g==='object'&&['subject','predicate','object'].every(k=>Object.prototype.hasOwnProperty.call(g,k))&&typeof g.subject==='string'&&g.subject.length>0&&g.subject.length<=120&&typeof g.predicate==='string'&&g.predicate.length>0&&g.predicate.length<=80&&(typeof g.object==='string'||typeof g.object==='number'||typeof g.object==='boolean');}
function clone(v){return JSON.parse(JSON.stringify(v));}
function isVar(v){return typeof v==='string'&&v.charAt(0)==='?';}
function unifyConclusion(template,target,bindings){
 const next=Object.assign({},bindings);
 for(const key of ['subject','predicate','object']){
  const a=template[key],b=target[key];
  if(isVar(a)){if(Object.prototype.hasOwnProperty.call(next,a)){if(next[a]!==b)return null;}else next[a]=b;}
  else if(a!==b)return null;
 }
 return next;
}
function resolve(pattern,bindings){
 const result={};for(const key of ['subject','predicate','object']){const v=pattern[key];result[key]=isVar(v)&&Object.prototype.hasOwnProperty.call(bindings,v)?bindings[v]:v;}return result;
}
function factMatches(goal,fact){return goal.subject===fact.subject&&goal.predicate===fact.predicate&&goal.object===fact.object;}
function solveProblem(base,problem,options){
 const R=root.IdeeVisionReasoning;
 if(!R||!base||base.kind!=='ideevision-reasoning-base')return {ok:false,error:'reasoning-engine-unavailable'};
 if(!problem||typeof problem!=='object'||!Array.isArray(problem.goals)||problem.goals.length<1||problem.goals.length>MAX_GOALS||problem.goals.some(g=>!validGoal(g)))return {ok:false,error:'problem-invalid'};
 const o=options&&typeof options==='object'?options:{},maxDepth=Math.max(1,Math.min(MAX_DEPTH,Number(o.maxDepth)||MAX_DEPTH)),maxNodes=Math.max(1,Math.min(MAX_NODES,Number(o.maxNodes)||MAX_NODES));
 const working={kind:base.kind,version:base.version,name:base.name,facts:base.facts.map(clone),rules:base.rules.map(clone),revision:base.revision};
 const givens=Array.isArray(problem.givens)?problem.givens:[];
 if(givens.length>100)return {ok:false,error:'too-many-givens'};
 const acceptedGivens=[];
 for(let i=0;i<givens.length;i++){
  const given=givens[i],fact=Object.assign({id:'problem-given-'+(i+1),source:'problem-given',confidence:1},given);
  const added=R.addFact(working,fact);if(!added.ok)return {ok:false,error:'invalid-given',index:i,details:added};acceptedGivens.push(added.fact);
 }
 const inferred=R.infer(working,{maxSteps:o.maxSteps||100});
 if(!inferred.ok)return {ok:false,error:'inference-failed',details:inferred};
 let visitedNodes=0,limited=false;
 function plan(goal,depth,stack){
  visitedNodes++;if(visitedNodes>maxNodes){limited=true;return {status:'limit',goal:clone(goal),reason:'Limite de recherche atteinte.',subgoals:[],proof:[]};}
  const direct=inferred.facts.find(f=>factMatches(goal,f));
  if(direct)return {status:'known',goal:clone(goal),factId:direct.id,source:direct.source||'unknown',subgoals:[],proof:[{type:'fact',factId:direct.id}]};
  const key=JSON.stringify([goal.subject,goal.predicate,goal.object]);
  if(stack.has(key))return {status:'cycle',goal:clone(goal),reason:'Cycle logique détecté.',subgoals:[],proof:[]};
  if(depth>=maxDepth){limited=true;return {status:'limit',goal:clone(goal),reason:'Profondeur maximale atteinte.',subgoals:[],proof:[]};}
  const nextStack=new Set(stack);nextStack.add(key);const alternatives=[];
  for(const rule of working.rules){
   for(const conclusion of rule.then||[]){
    const bindings=unifyConclusion(conclusion,goal,{});
    if(!bindings)continue;
    const subgoals=(rule.when||[]).map(p=>resolve(p,bindings));
    const plans=subgoals.map(g=>plan(g,depth+1,nextStack));
    const complete=plans.every(p=>p.status==='known'||p.status==='derivable');
    alternatives.push({status:complete?'derivable':'incomplete',goal:clone(goal),ruleId:rule.id,ruleName:rule.name,subgoals:plans,proof:complete?[{type:'rule',ruleId:rule.id,ruleName:rule.name}].concat(...plans.map(p=>p.proof)):[],reason:complete?'Règle satisfaite par les faits disponibles.':'Certaines prémisses ne sont pas établies.'});
   }
  }
  if(!alternatives.length)return {status:'unknown',goal:clone(goal),reason:'Aucun fait ni règle applicable dans la base actuelle.',subgoals:[],proof:[]};
  alternatives.sort((a,b)=>({derivable:0,incomplete:1}[a.status]-({derivable:0,incomplete:1}[b.status]));
  return alternatives[0];
 }
 const results=problem.goals.map(goal=>plan(goal,0,new Set()));
 const known=results.filter(x=>x.status==='known').length,derivable=results.filter(x=>x.status==='derivable').length,unresolved=results.filter(x=>!['known','derivable'].includes(x.status));
 const missing=[];
 function collectMissing(node){if(node.status==='unknown'||node.status==='cycle'||node.status==='limit')missing.push({goal:node.goal,status:node.status,reason:node.reason});(node.subgoals||[]).forEach(collectMissing);}
 unresolved.forEach(collectMissing);
 const allSolved=unresolved.length===0;
 const conclusions=results.filter(x=>x.status==='derivable').map(x=>({goal:x.goal,ruleId:x.ruleId,ruleName:x.ruleName,proof:x.proof}));
 return {ok:true,problemId:String(problem.id||'problem'),title:String(problem.title||'Problème à résoudre'),summary:allSolved?'Tous les objectifs sont établis avec les connaissances disponibles.':known+derivable+' objectif(s) sur '+results.length+' établi(s) ; des informations ou règles supplémentaires sont nécessaires.',status:allSolved?'solved':known+derivable?'partial':'insufficient_knowledge',goals:results,knownCount:known,derivedCount:derivable,unresolvedCount:unresolved.length,missing,conclusions,acceptedGivens,inference:{derived:inferred.derived,trace:inferred.trace,contradictions:inferred.contradictions},search:{visitedNodes,maxNodes,maxDepth,limitReached:limited},limitations:['Le moteur applique des règles explicites ; il ne devine pas les prémisses absentes.','Les résultats dépendent de la qualité des faits et des règles enregistrés.','Un objectif non démontré est signalé comme inconnu, pas comme faux.']};
}
function createProblem(title,goals,givens){
 return {id:'problem-'+Date.now().toString(36),title:String(title||'Nouveau problème'),givens:Array.isArray(givens)?clone(givens):[],goals:Array.isArray(goals)?clone(goals):[]};
}
root.IdeeVisionProblemSolver=Object.freeze({version:VERSION,createProblem,solveProblem,limits:Object.freeze({maxGoals:MAX_GOALS,maxDepth:MAX_DEPTH,maxNodes:MAX_NODES})});
})(typeof window!=='undefined'?window:globalThis);
