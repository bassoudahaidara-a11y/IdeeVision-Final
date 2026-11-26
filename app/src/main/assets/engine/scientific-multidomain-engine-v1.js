(function(root){
'use strict';
const VERSION='0.1.0',MAX_STEPS=40,MAX_ID=64,DOMAINS=['mathematics','physics','chemistry','computer-science'];
const S=root.IdeeVisionScientific,A=root.IdeeVisionScientificAdvanced,P=root.IdeeVisionScientificProof,K=root.IdeeVisionScientificKnowledge,KM=root.IdeeVisionKnowledge;
function fail(error,message,extra){return Object.assign({ok:false,error,message},extra||{});}
function clone(v){return JSON.parse(JSON.stringify(v));}
function classifyDomain(text){
 const s=String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const hits=[];
 if(/\b(math|mathematique|equation|polynome|calcul|algebre|geometrie)\b/.test(s))hits.push('mathematics');
 if(/\b(physique|force|masse|vitesse|acceleration|mecanique|energie|poids)\b/.test(s))hits.push('physics');
 if(/\b(chimie|molecule|atome|reaction|solution|concentration|molaire|ph)\b/.test(s))hits.push('chemistry');
 if(/\b(informatique|ordinateur|algorithme|programme|code|donnee|programmation)\b/.test(s))hits.push('computer-science');
 return {domains:hits,primary:hits[0]||null,ambiguous:hits.length>1,needsClarification:hits.length===0};
}
function topo(steps){
 const byId=new Map(steps.map(s=>[s.id,s])),state=new Map(),ordered=[];
 function visit(id){
  const st=state.get(id)||0;if(st===1)throw Error('dependency-cycle');if(st===2)return;
  const item=byId.get(id);if(!item)throw Error('dependency-missing:'+id);
  state.set(id,1);for(const dep of item.dependsOn||[]){if(!byId.has(dep))throw Error('dependency-missing:'+dep);visit(dep);}
  state.set(id,2);ordered.push(item);
 }
 for(const s of steps)visit(s.id);
 return ordered;
}
function resolveValues(values,results){
 const out={},missing=[];
 for(const [key,v] of Object.entries(values||{})){
  if(v&&typeof v==='object'&&!Array.isArray(v)&&typeof v.from==='string'){
   if(!Object.prototype.hasOwnProperty.call(results,v.from)){missing.push({key,from:v.from});continue;}
   const prior=results[v.from];if(!prior||!Object.prototype.hasOwnProperty.call(prior,'value')){missing.push({key,from:v.from,reason:'result-value-unavailable'});continue;}out[key]=prior.value;
  }else if(typeof v==='number'&&Number.isFinite(v))out[key]=v;
  else if(typeof v==='string'&&v.trim()!==''&&Number.isFinite(Number(v)))out[key]=Number(v);
  else missing.push({key});
 }
 return {values:out,missing};
}
function executeStep(step,values,options){
 if(step.operation==='calculate'){
  if(!S)return fail('scientific-engine-unavailable','Le moteur de calcul est indisponible.');
  const r=S.evaluateExpression(step.expression,values);if(!r.ok)return r;
  if(step.expectedValue!==undefined&&P){const check=P.verifyCalculation(step.expression,values,step.expectedValue,{tolerance:step.tolerance,expectedUnit:step.expectedUnit,variableDimensions:step.variableDimensions});return Object.assign({value:r.value,unit:step.expectedUnit||null,proof:check},check);}
  return {ok:true,value:r.value,unit:step.expectedUnit||null,verified:false,status:'calculated-not-independently-verified',steps:['Expression évaluée par le parseur scientifique sécurisé.']};
 }
 if(step.operation==='equation'){
  if(!S)return fail('scientific-engine-unavailable','Le solveur scientifique est indisponible.');
  const r=P?P.proveEquation(step.equation,step.variable||'x',step.solutions):S.solveEquation(step.equation,step.variable||'x');
  if(!r.ok)return r;return {ok:true,value:r.solutions&&r.solutions.length===1?r.solutions[0]:null,solutions:r.solutions,status:r.status||r.type,verified:!!r.verified,proof:r};
 }
 if(step.operation==='mechanics'){
  if(!S)return fail('scientific-engine-unavailable','Le moteur physique est indisponible.');
  const r=S.calculateMechanics(step.target,values);if(!r.ok)return r;
  const proof=P?P.auditProblem({kind:'mechanics-problem',target:step.target,solved:true,values,result:{value:r.value}}):null;
  return {ok:true,value:r.value,unit:r.unit,formula:r.formula,verified:!!(proof&&proof.verified),proof,steps:r.steps};
 }
 if(step.operation==='knowledge-formula'){
  if(!K)return fail('knowledge-engine-unavailable','Le moteur de connaissances scientifiques est indisponible.');
  const entry=(KM&&KM.active?KM.active():[]).find(x=>x.id===step.entryId);
  if(!entry)return fail('active-knowledge-missing','La formule demandée ne figure pas dans les connaissances actives.');
  const r=K.evaluateKnowledgeFormula(entry,values,{resultUnit:step.expectedUnit});
  if(!r.ok)return r;if(!r.solved)return fail('input-missing','Variables manquantes dans la formule de connaissance.',{missing:r.missing});
  return {ok:true,value:r.value,unit:r.unit,formula:r.formula,verified:false,source:r.source,entryId:r.entryId,steps:r.steps};
 }
 return fail('operation-unsupported','Opération non prise en charge : '+String(step.operation));
}
function run(plan,options){
 if(!plan||typeof plan!=='object'||!Array.isArray(plan.steps)||plan.steps.length<1||plan.steps.length>MAX_STEPS)return fail('plan-invalid','Le plan doit contenir entre 1 et '+MAX_STEPS+' étapes.');
 const source=clone(plan),ids=new Set();
 for(const s of source.steps){
  if(!s||typeof s!=='object'||typeof s.id!=='string'||!s.id.trim()||s.id.length>MAX_ID||ids.has(s.id))return fail('step-id-invalid','Chaque étape doit avoir un identifiant unique valide.');
  ids.add(s.id);
  if(!DOMAINS.includes(s.domain))return fail('domain-unsupported','Domaine inconnu ou non pris en charge : '+String(s.domain),{step:s.id,supportedDomains:DOMAINS.slice()});
  if(!Array.isArray(s.dependsOn||[])||(s.dependsOn||[]).some(x=>typeof x!=='string'))return fail('dependency-invalid','La liste des dépendances est invalide.',{step:s.id});
 }
 let ordered;try{ordered=topo(source.steps);}catch(e){return fail(e.message==='dependency-cycle'?'dependency-cycle':'dependency-missing',e.message==='dependency-cycle'?'Le plan contient une dépendance circulaire.':'Une étape dépend d’un identifiant inexistant.',{detail:e.message});}
 const results=Object.create(null),trace=[],missingInputs=[];
 for(const step of ordered){
  const deps=step.dependsOn||[],unavailable=deps.filter(id=>!Object.prototype.hasOwnProperty.call(results,id)||!results[id].ok);
  if(unavailable.length){const r=fail('dependency-unavailable','Une dépendance n’a pas produit de résultat valide.',{dependencies:unavailable});trace.push({id:step.id,domain:step.domain,operation:step.operation,ok:false,result:r});results[step.id]=r;continue;}
  const resolved=resolveValues(step.variables||step.values,results);
  if(resolved.missing.length){const r=fail('input-missing','Des données d’entrée sont absentes ou invalides.',{missing:resolved.missing});missingInputs.push({step:step.id,missing:resolved.missing});trace.push({id:step.id,domain:step.domain,operation:step.operation,ok:false,result:r});results[step.id]=r;continue;}
  const r=executeStep(step,resolved.values,options||{});
  const sources=Array.isArray(step.sources)?step.sources.filter(x=>typeof x==='string').slice(0,10):[];
  const assumptions=Array.isArray(step.assumptions)?step.assumptions.filter(x=>typeof x==='string').slice(0,10):[];
  const record=Object.assign({},r,{domain:step.domain,operation:step.operation,sources,assumptions,dependsOn:deps.slice()});
  results[step.id]=record;trace.push({id:step.id,domain:step.domain,operation:step.operation,ok:!!record.ok,verified:!!record.verified,result:record});
 }
 const failed=trace.filter(x=>!x.ok),unverified=trace.filter(x=>x.ok&&!x.verified);
 return {ok:failed.length===0,complete:failed.length===0&&missingInputs.length===0,verified:failed.length===0&&unverified.length===0&&trace.length===ordered.length,planTitle:String(plan.title||'Problème multidisciplinaire').slice(0,160),domains:Array.from(new Set(ordered.map(x=>x.domain))),orderedStepIds:ordered.map(x=>x.id),trace,results:Object.assign({},results),missingInputs,failedSteps:failed.map(x=>x.id),unverifiedSteps:unverified.map(x=>x.id),provenance:trace.map(x=>({step:x.id,domain:x.domain,sources:x.result.sources||[],assumptions:x.result.assumptions||[]})),limitations:['Les domaines ne disposent pas tous d’un solveur spécialisé : seules les opérations explicitement prises en charge sont exécutées.','La chimie et l’informatique ne possèdent pas ici de solveur universel de réactions ou de programmes.','Un calcul sans contrôle indépendant est marqué comme non vérifié.','Les sources et hypothèses sont conservées, mais leur fiabilité n’est pas automatiquement certifiée.']};
}
function fromScientificProblem(problem){
 if(!problem||typeof problem!=='object')return fail('problem-invalid','Un problème scientifique structuré est requis.');
 if(problem.kind==='equation'&&problem.equation)return run({title:'Équation scientifique',steps:[{id:'equation',domain:'mathematics',operation:'equation',equation:problem.equation,variable:'x',solutions:problem.solved&&problem.solved.solutions,sources:problem.source?[problem.source]:[]}]});
 if(problem.kind==='mechanics-problem'&&problem.solved&&problem.target)return run({title:'Problème de mécanique',steps:[{id:'mechanics',domain:'physics',operation:'mechanics',target:problem.target,values:problem.values||{},sources:problem.source?[problem.source]:[],assumptions:problem.assumptions||[]}]});
 return fail('problem-type-unsupported','Ce type de problème ne possède pas encore de parcours multidisciplinaire automatisé.');
}
root.IdeeVisionMultiDomain=Object.freeze({version:VERSION,domains:DOMAINS.slice(),classifyDomain,run,fromScientificProblem,limits:Object.freeze({maxSteps:MAX_STEPS,maxIdLength:MAX_ID})});
})(typeof window!=='undefined'?window:globalThis);
