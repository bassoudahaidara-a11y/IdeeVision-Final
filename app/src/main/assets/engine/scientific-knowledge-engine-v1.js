(function(root){
'use strict';
const VERSION='0.1.0',MAX_ENTRIES=500,MAX_RESULTS=10,MAX_FORMULA=500;
const K=root.IdeeVisionKnowledge,R=root.IdeeVisionReasoning,S=root.IdeeVisionScientific;
function fail(error,message){return {ok:false,error,message};}
function norm(v){return String(v==null?'':v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
function activeEntries(api){const source=api||K;if(!source||typeof source.active!=='function')return fail('knowledge-manager-unavailable','La bibliothèque de connaissances est indisponible.');try{const list=source.active();if(!Array.isArray(list))return fail('knowledge-list-invalid','La bibliothèque a retourné une liste invalide.');return {ok:true,entries:list.slice(0,MAX_ENTRIES).filter(e=>e&&typeof e==='object'&&e.status==='active')};}catch(e){return fail('knowledge-read-failed','Impossible de lire les connaissances actives.');}}
function tokens(s){const stop=new Set(['et','de','du','des','la','le','les','un','une','a','au','aux','en','par','pour','sur','avec','dans','est','qui','que','ce','ces','son','sa','the','of','to']);return norm(s).split(/\s+/).filter(x=>x.length>1&&!stop.has(x));}
function search(query,options){
 const got=activeEntries(options&&options.knowledgeApi),limit=Math.max(1,Math.min(MAX_RESULTS,Number(options&&options.limit)||5));
 if(!got.ok)return got;
 const q=tokens(query);if(!q.length)return {ok:true,matches:[],query:String(query||''),needsClarification:true};
 const matches=got.entries.map(entry=>{
  const fields={title:tokens(entry.title),description:tokens(entry.description),domain:tokens(entry.domain),formula:tokens(entry.formula||'')};
  const all=new Set([].concat(fields.title,fields.description,fields.domain,fields.formula));
  const matched=q.filter(x=>all.has(x));
  const score=(matched.length/Math.max(1,q.length))*.55+
   (q.some(x=>fields.title.includes(x))?.25:0)+(q.some(x=>fields.formula.includes(x))?.12:0)+(q.some(x=>fields.domain.includes(x))?.08:0);
  return {id:entry.id,title:entry.title,domain:entry.domain,kind:entry.kind,description:entry.description,formula:entry.formula||null,variables:Array.isArray(entry.variables)?entry.variables.map(v=>({symbol:v.symbol,unit:v.unit,meaning:v.meaning})):[],source:entry.source||null,score:Number(Math.min(1,score).toFixed(4)),matchedTerms:matched};
 }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title));
 return {ok:true,query:String(query||''),matches:matches.slice(0,limit),needsClarification:matches.length===0,limitations:['Classement lexical local, non compréhension sémantique générale.','Les connaissances doivent être vérifiées avant activation.']};
}
function importIntoReasoning(base,options){
 if(!R)return fail('reasoning-engine-unavailable','Le moteur de raisonnement est indisponible.');
 const got=activeEntries(options&&options.knowledgeApi);if(!got.ok)return got;
 const result=R.importActiveKnowledge(base,{active:()=>got.entries});
 return Object.assign({ok:true,activeEntries:got.entries.length},result);
}
function parseFormula(formula){
 if(typeof formula!=='string'||formula.length>MAX_FORMULA)return fail('formula-invalid','Formule absente ou trop longue.');
 const parts=formula.split('=');if(parts.length!==2)return fail('formula-equality-invalid','La formule doit contenir une seule égalité.');
 const lhs=parts[0].trim(),rhs=parts[1].trim();
 if(!/^[A-Za-z_][A-Za-z0-9_]*$/.test(lhs)||!rhs)return fail('formula-shape-invalid','La formule doit avoir une variable à gauche et une expression à droite.');
 if(!S)return fail('scientific-engine-unavailable','Le moteur de calcul est indisponible.');
 let parsed;try{parsed=S.parse(rhs);}catch(e){return fail('formula-expression-invalid','Expression de formule refusée par le parseur sécurisé.');}
 return {ok:true,resultSymbol:lhs,expression:rhs,ast:parsed};
}
function aliasForMeaning(meaning){
 const m=norm(meaning);
 const aliases=[
  [/\b(masse|mass)\b/,'mass'],[/\b(acceleration|accel)\b/,'acceleration'],[/\b(vitesse|speed|rapidite)\b/,'speed'],
  [/\b(distance|longueur|deplacement)\b/,'distance'],[/\b(temps|duree|time)\b/,'time'],[/\b(force|poids)\b/,'force'],
  [/\b(gravite|pesanteur)\b/,'gravity'],[/\b(rayon|distance entre les centres)\b/,'radius'],
  [/\b(energie)\b/,'energy'],[/\b(volume)\b/,'volume'],[/\b(surface|aire)\b/,'area'],[/\b(puissance)\b/,'power']
 ];
 for(const [re,key] of aliases)if(re.test(m))return key;
 return null;
}
function evaluateKnowledgeFormula(entry,values,options){
 if(!entry||entry.status!=='active'||entry.kind!=='formula')return fail('knowledge-not-active-formula','Une formule active de la bibliothèque est requise.');
 const parsed=parseFormula(entry.formula);if(!parsed.ok)return parsed;
 const vars={},units={},missing=[];
 (entry.variables||[]).forEach(v=>{
  const key=aliasForMeaning(v.meaning)||v.symbol;
  if(Object.prototype.hasOwnProperty.call(values||{},v.symbol))vars[v.symbol]=Number(values[v.symbol]);
  else if(Object.prototype.hasOwnProperty.call(values||{},key))vars[v.symbol]=Number(values[key]);
  else missing.push({symbol:v.symbol,meaning:v.meaning,unit:v.unit});
  if(v.unit&&v.unit!=='sans unité')units[v.symbol]=v.unit;
 });
 if(missing.length)return {ok:true,solved:false,formula:entry.formula,missing,entryId:entry.id,message:'Données manquantes pour cette formule.'};
 if(Object.values(vars).some(x=>!Number.isFinite(x)))return fail('formula-variable-invalid','Une valeur fournie n’est pas numérique.');
 const expected=options&&options.resultUnit||null;
 const evaluated=S.evaluateFormula(parsed.expression,vars,units,expected);
 if(!evaluated.ok)return Object.assign({entryId:entry.id,formula:entry.formula},evaluated);
 return {ok:true,solved:true,entryId:entry.id,title:entry.title,formula:entry.formula,resultSymbol:parsed.resultSymbol,value:evaluated.value,unit:expected||null,variables:vars,dimensionCheck:evaluated.dimensions,steps:['Identifier les variables de la formule.','Remplacer chaque variable par sa valeur fournie.','Calculer le membre de droite avec le moteur scientifique.','Résultat : '+parsed.resultSymbol+' = '+evaluated.value+(expected?' '+expected:'')+'.'],source:entry.source||null};
}
function compareMethods(query,options){
 const found=search(query,{knowledgeApi:options&&options.knowledgeApi,limit:MAX_RESULTS});
 if(!found.ok)return found;
 const formulas=found.matches.filter(x=>x.kind==='formula'&&x.formula);
 return {ok:true,query:String(query||''),methods:formulas.map((x,i)=>({rank:i+1,id:x.id,title:x.title,formula:x.formula,score:x.score,variables:x.variables,source:x.source})),count:formulas.length,needsMoreKnowledge:formulas.length===0,notice:'Les méthodes sont classées par correspondance lexicale. Leur pertinence scientifique doit être vérifiée.'};
}
function audit(base,options){
 const imported=importIntoReasoning(base,options);if(!imported.ok)return imported;
 const inference=R.infer(base,{maxSteps:100});
 return {ok:inference.ok,imported,revision:base.revision,facts:base.facts.length,rules:base.rules.length,derived:inference.derived||[],trace:inference.trace||[],contradictions:inference.contradictions||[],warnings:(inference.contradictions||[]).map(c=>'Valeurs contradictoires pour '+c.subject+' / '+c.predicate+'.'),limitsReached:!!inference.limitReached};
}
function analyze(query,values,options){
 const found=search(query,{knowledgeApi:options&&options.knowledgeApi,limit:MAX_RESULTS});
 if(!found.ok)return found;
 const methods=compareMethods(query,options);
 const evaluated=[];
 if(values&&typeof values==='object')for(const m of methods.methods){const entry=activeEntries(options&&options.knowledgeApi).entries.find(e=>e.id===m.id);if(entry)evaluated.push(evaluateKnowledgeFormula(entry,values,options));}
 return {ok:true,query:String(query||''),knowledge:found.matches,methods:methods.methods,evaluations:evaluated,needsMoreKnowledge:found.matches.length===0,limitations:['Aucune formule n’est exécutée si ses variables sont absentes.','Une correspondance lexicale n’est pas une preuve de pertinence.','Les contradictions sont signalées, jamais résolues arbitrairement.']};
}
root.IdeeVisionScientificKnowledge=Object.freeze({version:VERSION,search,importIntoReasoning,parseFormula,evaluateKnowledgeFormula,compareMethods,audit,analyze,limits:Object.freeze({maxEntries:MAX_ENTRIES,maxResults:MAX_RESULTS,maxFormulaLength:MAX_FORMULA})});
})(typeof window!=='undefined'?window:globalThis);
