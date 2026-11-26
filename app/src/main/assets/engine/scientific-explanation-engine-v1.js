(function(root){
'use strict';
const VERSION='0.1.0',MAX_TRACE=40,MAX_TEXT=12000;
const LEVELS=['simple','standard','detailed'];
function fail(error,message){return {ok:false,error,message};}
function clean(value,max){return typeof value==='string'?value.trim().slice(0,max):'';}
function numberText(v){return typeof v==='number'&&Number.isFinite(v)?String(Number(v.toPrecision(10))):String(v);}
function statusLabel(step){
 const r=step.result||{};
 if(!step.ok)return 'non résolue';
 if(r.verified||step.verified)return 'vérifiée par un contrôle disponible';
 if(r.status==='calculated-not-independently-verified')return 'calculée, mais pas vérifiée indépendamment';
 return 'résultat disponible, vérification indépendante non établie';
}
function explainStep(step,index,level){
 const r=step.result||{},parts=[];
 parts.push({kind:'step',title:'Étape '+(index+1)+' — '+(step.id||'sans identifiant'),domain:step.domain||'inconnu',operation:step.operation||'inconnue',status:statusLabel(step)});
 if(!step.ok){
  parts.push({kind:'error',text:clean(r.message||r.error||'Cette étape n’a pas pu être exécutée.',500),code:r.error||'step-failed'});
  if(Array.isArray(r.missing)&&r.missing.length)parts.push({kind:'missing',items:r.missing.map(x=>typeof x==='string'?x:clean(x.key||x.name||JSON.stringify(x),160))});
  if(Array.isArray(r.dependencies)&&r.dependencies.length)parts.push({kind:'dependency',items:r.dependencies.slice(0,20)});
  return parts;
 }
 if(r.formula)parts.push({kind:'formula',text:clean(r.formula,300)});
 if(r.expression)parts.push({kind:'expression',text:clean(r.expression,300)});
 if(r.equation)parts.push({kind:'equation',text:clean(r.equation,300)});
 if(Array.isArray(r.steps)&&r.steps.length)parts.push({kind:'calculation-steps',items:r.steps.slice(0,20).map(x=>clean(String(x),500))});
 if(Array.isArray(r.solutions))parts.push({kind:'solutions',items:r.solutions.map(numberText)});
 if(Object.prototype.hasOwnProperty.call(r,'value')&&r.value!==null)parts.push({kind:'result',text:numberText(r.value)+(r.unit?' '+r.unit:'')});
 if(r.proof&&typeof r.proof==='object'){
  parts.push({kind:'proof',verified:!!r.proof.verified,status:clean(r.proof.status||'non précisé',100),explanation:clean(r.proof.message||'',300)});
  if(level==='detailed'&&Array.isArray(r.proof.steps))parts.push({kind:'proof-steps',items:r.proof.steps.slice(0,10).map(x=>clean(String(x),400))});
 }
 if(Array.isArray(r.assumptions)&&r.assumptions.length)parts.push({kind:'assumptions',items:r.assumptions.slice(0,10).map(x=>clean(x,300))});
 if(Array.isArray(r.sources)&&r.sources.length)parts.push({kind:'sources',items:r.sources.slice(0,10).map(x=>clean(x,300))});
 if(Array.isArray(step.dependencies)&&step.dependencies.length)parts.push({kind:'dependency',items:step.dependencies.slice(0,20)});
 return parts;
}
function explain(result,options){
 const opts=options||{},level=LEVELS.includes(opts.level)?opts.level:'standard';
 if(!result||typeof result!=='object'||!Array.isArray(result.trace))return fail('result-invalid','Un résultat structuré du moteur multidisciplinaire est nécessaire.');
 if(result.trace.length>MAX_TRACE)return fail('trace-too-large','La trace dépasse la limite d’explication.');
 const title=clean(opts.title||result.planTitle||'Problème scientifique',160);
 const details=result.trace.map((step,i)=>explainStep(step,i,level));
 const failures=result.trace.filter(x=>!x.ok),unverified=result.trace.filter(x=>x.ok&&!x.verified);
 const missing=Array.isArray(result.missingInputs)?result.missingInputs.slice(0,20):[];
 const assumptions=details.flat().filter(x=>x.kind==='assumptions').flatMap(x=>x.items);
 const sources=details.flat().filter(x=>x.kind==='sources').flatMap(x=>x.items);
 const conclusion=result.complete?
  (result.verified?'Tous les résultats de ce plan ont passé les contrôles disponibles.':'Le plan a produit ses résultats, mais certains ne sont pas vérifiés indépendamment.'):
  'La résolution est incomplète : certaines étapes ou données nécessaires manquent.';
 const summary={title,level,domains:Array.isArray(result.domains)?result.domains.slice(0,4):[],success:!!result.ok,complete:!!result.complete,verified:!!result.verified,stepCount:result.trace.length,failedCount:failures.length,unverifiedCount:unverified.length,missingCount:missing.length};
 const sections=[
  {kind:'overview',title:'Comprendre le problème',text:result.complete?'Le problème a été traité avec les opérations disponibles dans les moteurs scientifiques.':'Le traitement n’a pas pu être achevé avec les informations ou opérations disponibles.'},
  {kind:'method',title:'Méthode suivie',items:details},
  {kind:'assumptions',title:'Hypothèses utilisées',items:assumptions},
  {kind:'sources',title:'Sources déclarées',items:sources},
  {kind:'missing',title:'Informations manquantes',items:missing},
  {kind:'conclusion',title:'Conclusion',text:conclusion}
 ];
 const warnings=[];
 if(unverified.length)warnings.push('Au moins un résultat n’a pas fait l’objet d’une vérification indépendante.');
 if(failures.length)warnings.push('Certaines étapes ont échoué; leurs résultats ne doivent pas être utilisés comme des faits établis.');
 if(!sources.length)warnings.push('Aucune source documentaire n’a été déclarée pour ce raisonnement.');
 warnings.push('La vérification des calculs ne prouve pas à elle seule que les hypothèses décrivent correctement la réalité.');
 if(level==='simple'){
  sections.splice(1,1,{kind:'method',title:'Explication simplifiée',items:details.map((d,i)=>({kind:'step-summary',text:'Étape '+(i+1)+' : '+(result.trace[i].ok?'opération réalisée.':'opération non résolue.'),details:d.filter(x=>['result','error','formula'].includes(x.kind))}))});
 }
 return {ok:true,version:VERSION,summary,sections,warnings,conclusion,plainText:toText({title,summary,sections,warnings,conclusion},MAX_TEXT),limitations:['Le moteur explique les traces structurées existantes; il ne transforme pas une phrase inconnue en démonstration complète.','Les étapes et formules sont reprises des moteurs de calcul; aucune étape mathématique absente n’est inventée.','Les sources déclarées ne sont pas automatiquement authentifiées.','Les explications détaillées dépendent des informations réellement fournies par le solveur.']};
}
function toText(data,maxLength){
 const lines=[data.title,''];
 for(const section of data.sections||[]){
  lines.push(section.title+':');
  if(section.text)lines.push(section.text);
  for(const item of section.items||[]){
   if(item&&item.kind==='step-summary'){
    lines.push('• '+item.text);
    for(const d of item.details||[])lines.push('  - '+(d.text||''));
   }else if(Array.isArray(item)){
    for(const d of item)lines.push('• '+(d.title||d.text||d.kind||''));
   }else if(item&&typeof item==='object')lines.push('• '+(item.step||item.text||item.key||JSON.stringify(item)).slice(0,500));
   else lines.push('• '+String(item).slice(0,500));
  }
  lines.push('');
 }
 if(data.warnings&&data.warnings.length){lines.push('Précautions :');data.warnings.forEach(x=>lines.push('• '+x));}
 lines.push('', 'Conclusion :',data.conclusion);
 return lines.join('\n').slice(0,maxLength||MAX_TEXT);
}
function explainProblem(problem,options){
 const M=root.IdeeVisionMultiDomain;
 if(!M)return fail('multidomain-engine-unavailable','Le moteur multidisciplinaire est indisponible.');
 const solved=M.fromScientificProblem(problem);
 if(!solved.ok)return fail('problem-not-explained',solved.message||'Ce type de problème ne peut pas encore être expliqué automatiquement.');
 return explain(solved,options);
}
root.IdeeVisionScientificExplanation=Object.freeze({version:VERSION,explain,explainProblem,toText,levels:LEVELS.slice(),limits:Object.freeze({maxTraceSteps:MAX_TRACE,maxTextLength:MAX_TEXT})});
})(typeof window!=='undefined'?window:globalThis);
