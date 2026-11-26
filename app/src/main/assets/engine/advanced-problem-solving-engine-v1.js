(function(root){
'use strict';
const VERSION='0.1.0',MAX_METHODS=12,MAX_CLAIMS=200,MAX_ID=64;
const M=root.IdeeVisionMultiDomain,R=root.IdeeVisionReasoning,P=root.IdeeVisionProblemSolver,Proof=root.IdeeVisionScientificProof;
function fail(error,message,extra){return Object.assign({ok:false,error,message},extra||{});}
function clone(v){return JSON.parse(JSON.stringify(v));}
function stable(v){if(Array.isArray(v))return '['+v.map(stable).join(',')+']';if(v&&typeof v==='object')return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}';return JSON.stringify(v);}
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(16).padStart(8,'0');}
function signature(request){return hash(stable({methods:request.methods||[],logical:request.logical||null,claims:request.claims||[]}));}
function validMethods(methods){
 if(!Array.isArray(methods)||methods.length<1||methods.length>MAX_METHODS)return fail('methods-invalid','Il faut fournir entre 1 et '+MAX_METHODS+' méthodes candidates.');
 const ids=new Set();
 for(const m of methods){if(!m||typeof m!=='object'||typeof m.id!=='string'||!m.id.trim()||m.id.length>MAX_ID||ids.has(m.id))return fail('method-id-invalid','Chaque méthode doit avoir un identifiant unique valide.');ids.add(m.id);if(!m.plan||!Array.isArray(m.plan.steps))return fail('method-plan-invalid','Chaque méthode doit contenir un plan scientifique structuré.');}
 return {ok:true};
}
function auditClaims(claims,tolerance){
 if(!Array.isArray(claims)||claims.length>MAX_CLAIMS)return fail('claims-invalid','La liste des résultats comparables est invalide ou trop grande.');
 const groups=new Map();
 for(const c of claims){
  if(!c||typeof c.key!=='string'||!c.key.trim()||typeof c.value!=='number'||!Number.isFinite(c.value)||typeof (c.unit||'')!=='string')return fail('claim-invalid','Chaque résultat comparé doit avoir une clé, une valeur numérique finie et une unité textuelle.');
  const k=c.key+'|'+(c.unit||'');if(!groups.has(k))groups.set(k,[]);groups.get(k).push({method:String(c.method||'unknown'),value:c.value,unit:c.unit||''});
 }
 const contradictions=[];
 groups.forEach((items,key)=>{if(items.length<2)return;const min=Math.min(...items.map(x=>x.value)),max=Math.max(...items.map(x=>x.value)),scale=Math.max(1,Math.abs(min),Math.abs(max)),tol=Number.isFinite(tolerance)&&tolerance>=0?tolerance:1e-9;if(max-min>tol*scale)contradictions.push({key,values:items,spread:max-min,tolerance:tol*scale,reason:'Des méthodes annoncent des valeurs incompatibles pour la même grandeur et la même unité.'});});
 return {ok:true,consistent:contradictions.length===0,contradictions,comparedGroups:groups.size};
}
function score(outcome){
 const r=outcome.result||{};
 return [r.complete&&r.verified?0:r.complete?1:r.ok?2:3,r.unverifiedSteps?r.unverifiedSteps.length:0,r.failedSteps?r.failedSteps.length:0,r.trace?r.trace.length:999];
}
function compareOutcomes(outcomes){
 const ranked=outcomes.slice().sort((a,b)=>{const x=score(a),y=score(b);for(let i=0;i<x.length;i++)if(x[i]!==y[i])return x[i]-y[i];return a.id.localeCompare(b.id);});
 return {ranked:ranked.map((x,i)=>({id:x.id,rank:i+1,complete:!!(x.result&&x.result.complete),verified:!!(x.result&&x.result.verified),ok:!!(x.result&&x.result.ok),failedSteps:x.result&&x.result.failedSteps?x.result.failedSteps.length:0,unverifiedSteps:x.result&&x.result.unverifiedSteps?x.result.unverifiedSteps.length:0})),preferred:ranked[0]?ranked[0].id:null,selectionRule:'Priorité à une méthode complète et vérifiée, puis complète, puis réussie; départage par le nombre de résultats non vérifiés, d’échecs et d’étapes. Ce classement ne garantit pas que les hypothèses soient vraies.'};
}
function runMethods(methods,completed){
 const done=Object.assign({},completed||{}),outcomes=[];
 for(const method of methods){
  if(Object.prototype.hasOwnProperty.call(done,method.id)){outcomes.push({id:method.id,result:done[method.id],reused:true});continue;}
  const result=M?M.run(method.plan):fail('multidomain-engine-unavailable','Le moteur multidisciplinaire est indisponible.');
  done[method.id]=result;outcomes.push({id:method.id,result,reused:false});
 }
 return {done,outcomes};
}
function solve(request,options){
 if(!request||typeof request!=='object')return fail('request-invalid','Une demande structurée est nécessaire.');
 const check=validMethods(request.methods);if(!check.ok)return check;
 const opts=options||{},signatureValue=signature(request);
 const run=runMethods(request.methods,{});
 const comparison=compareOutcomes(run.outcomes);
 const claims=auditClaims(request.claims||[],opts.tolerance);
 if(!claims.ok)return claims;
 let logical=null;
 if(request.logical){
  if(!R||!P)return fail('logical-engine-unavailable','Le moteur de raisonnement logique est indisponible.');
  logical=P.solveProblem(request.logical.base,request.logical.problem,request.logical.options||{});
  if(!logical.ok)return fail('logical-solve-failed','La résolution logique n’a pas pu être exécutée.',{logical});
 }
 const logicalContradictions=logical&&logical.inference?logical.inference.contradictions:[];
 const allContradictions=claims.contradictions.concat(logicalContradictions.map(x=>Object.assign({source:'logical-inference'},x)));
 const pending=[];
 const checkpoint={version:VERSION,signature:signatureValue,completedMethods:clone(run.done),pendingMethods:pending,logical:logical?clone(logical):null};
 return {ok:true,status:allContradictions.length?'contradictions-detected':comparison.ranked.length&&comparison.ranked[0].complete?'solved': 'partial',preferredMethod:comparison.preferred,comparison,methods:run.outcomes.map(x=>({id:x.id,result:x.result,reused:x.reused})),claims,contradictions:allContradictions,logical,checkpoint,summary:allContradictions.length?'Des résultats contradictoires ont été détectés; aucune valeur ne doit être choisie sans examen.':comparison.preferred?'Les méthodes ont été comparées selon leur complétude et leur niveau de vérification.':'Aucune méthode n’a produit de résultat.',limitations:['Les méthodes candidates doivent être décrites explicitement; le moteur ne crée pas de formule inconnue.','Le classement évalue la complétude technique et les vérifications disponibles, pas la vérité des hypothèses.','Les contradictions numériques ne sont comparées que si la clé et l’unité correspondent exactement.','La logique symbolique dépend exclusivement des faits et règles fournis.']};
}
function resume(request,checkpoint,options){
 if(!request||typeof request!=='object'||!checkpoint||typeof checkpoint!=='object'||checkpoint.version!==VERSION)return fail('checkpoint-invalid','Le point de reprise est absent ou incompatible.');
 const check=validMethods(request.methods);if(!check.ok)return check;
 if(checkpoint.signature!==signature(request))return fail('checkpoint-mismatch','La demande a changé depuis la création du point de reprise.');
 const completed=checkpoint.completedMethods&&typeof checkpoint.completedMethods==='object'?checkpoint.completedMethods:{};
 const validIds=new Set(request.methods.map(x=>x.id));
 if(Object.keys(completed).some(id=>!validIds.has(id)))return fail('checkpoint-corrupt','Le point de reprise contient une méthode inconnue.');
 const run=runMethods(request.methods,completed),comparison=compareOutcomes(run.outcomes),claims=auditClaims(request.claims||[],options&&options.tolerance);
 if(!claims.ok)return claims;
 const logical=checkpoint.logical||null,contradictions=claims.contradictions.concat(logical&&logical.inference?logical.inference.contradictions.map(x=>Object.assign({source:'logical-inference'},x)):[]);
 const next={version:VERSION,signature:checkpoint.signature,completedMethods:clone(run.done),pendingMethods:[],logical:logical?clone(logical):null};
 return {ok:true,status:contradictions.length?'contradictions-detected':comparison.ranked[0]&&comparison.ranked[0].complete?'solved':'partial',preferredMethod:comparison.preferred,comparison,methods:run.outcomes.map(x=>({id:x.id,result:x.result,reused:x.reused})),claims,contradictions,logical,checkpoint:next,resumed:true,summary:'Le raisonnement a été repris à partir des résultats conservés; les méthodes déjà terminées n’ont pas été recalculées.'};
}
function auditResult(result){
 if(!result||typeof result!=='object'||!Array.isArray(result.trace))return fail('result-invalid','Un résultat multidisciplinaire structuré est requis.');
 const failed=result.trace.filter(x=>!x.ok),unverified=result.trace.filter(x=>x.ok&&!x.verified),missing=Array.isArray(result.missingInputs)?clone(result.missingInputs):[];
 const contradiction=Array.isArray(result.contradictions)?clone(result.contradictions):[];
 return {ok:true,complete:!!result.complete,verified:!!result.verified,failedSteps:failed.map(x=>x.id),unverifiedSteps:unverified.map(x=>x.id),missingInputs:missing,contradictions:contradiction,canConclude:!!result.complete&&!!result.verified&&failed.length===0&&contradiction.length===0,advice:failed.length?'Corriger les étapes en échec avant de conclure.':missing.length?'Fournir les données manquantes.':unverified.length?'Effectuer les contrôles indépendants encore disponibles.':contradiction.length?'Examiner les résultats contradictoires.':'Les contrôles disponibles sont satisfaits.'};
}
root.IdeeVisionAdvancedProblemSolver=Object.freeze({version:VERSION,solve,resume,auditResult,auditClaims,compareOutcomes,limits:Object.freeze({maxMethods:MAX_METHODS,maxClaims:MAX_CLAIMS,maxIdLength:MAX_ID})});
})(typeof window!=='undefined'?window:globalThis);
