(function(root){
'use strict';
const VERSION='0.1.0',MAX_FACTS=500,MAX_RULES=100,MAX_STEPS=100;
function cleanText(v,max){return typeof v==='string'&&v.trim().length>0&&v.length<=max&&!/[<>]/.test(v)}
function clone(v){return JSON.parse(JSON.stringify(v))}
function normalize(v){return String(v==null?'':v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9?._-]+/g,' ').trim()}
function createKnowledgeBase(name){return {kind:'ideevision-reasoning-base',version:1,name:String(name||'Base de raisonnement'),facts:[],rules:[],revision:0}}
function validateFact(f){
 const errors=[];if(!f||typeof f!=='object'||Array.isArray(f))return {valid:false,errors:['fact-invalid']};
 if(!cleanText(f.subject,120))errors.push('subject-invalid');
 if(!cleanText(f.predicate,80))errors.push('predicate-invalid');
 if(!(typeof f.object==='string'&&f.object.length>0&&f.object.length<=240)&&!(typeof f.object==='number'&&Number.isFinite(f.object))&&typeof f.object!=='boolean')errors.push('object-invalid');
 if(f.confidence!=null&&(!Number.isFinite(f.confidence)||f.confidence<0||f.confidence>1))errors.push('confidence-invalid');
 return {valid:errors.length===0,errors};
}
function validatePattern(p){
 return !!p&&typeof p==='object'&&cleanText(p.subject,120)&&cleanText(p.predicate,80)&&((typeof p.object==='string'&&p.object.length>0&&p.object.length<=240)||typeof p.object==='number'||typeof p.object==='boolean');
}
function validateRule(rule){
 const errors=[];if(!rule||typeof rule!=='object'||!cleanText(rule.id,80))return {valid:false,errors:['rule-invalid']};
 if(!cleanText(rule.name,120))errors.push('rule-name-invalid');
 if(!Array.isArray(rule.when)||rule.when.length<1||rule.when.length>10||rule.when.some(p=>!validatePattern(p)))errors.push('rule-premises-invalid');
 if(!Array.isArray(rule.then)||rule.then.length<1||rule.then.length>10||rule.then.some(p=>!validatePattern(p)))errors.push('rule-conclusions-invalid');
 return {valid:errors.length===0,errors};
}
function addFact(base,fact){
 if(!base||base.kind!=='ideevision-reasoning-base')return {ok:false,error:'base-invalid'};
 const check=validateFact(fact);if(!check.valid)return {ok:false,error:'fact-invalid',validation:check};
 if(base.facts.length>=MAX_FACTS)return {ok:false,error:'fact-limit'};
 const id=String(fact.id||'fact-'+(base.facts.length+1));if(base.facts.some(f=>f.id===id))return {ok:false,error:'fact-id-duplicate'};
 base.facts.push({id,subject:String(fact.subject),predicate:String(fact.predicate),object:fact.object,source:String(fact.source||'user'),confidence:fact.confidence==null?1:fact.confidence});
 base.revision++;return {ok:true,fact:base.facts[base.facts.length-1]};
}
function addRule(base,rule){
 if(!base||base.kind!=='ideevision-reasoning-base')return {ok:false,error:'base-invalid'};
 const check=validateRule(rule);if(!check.valid)return {ok:false,error:'rule-invalid',validation:check};
 if(base.rules.length>=MAX_RULES)return {ok:false,error:'rule-limit'};
 if(base.rules.some(r=>r.id===rule.id))return {ok:false,error:'rule-id-duplicate'};
 base.rules.push(clone(rule));base.revision++;return {ok:true,rule:base.rules[base.rules.length-1]};
}
function unify(pattern,fact,bindings){
 const next=Object.assign({},bindings);
 for(const key of ['subject','predicate','object']){
  const wanted=pattern[key],actual=fact[key];
  if(typeof wanted==='string'&&wanted.charAt(0)==='?'){
   if(Object.prototype.hasOwnProperty.call(next,wanted)){if(next[wanted]!==actual)return null;}
   else next[wanted]=actual;
  }else if(wanted!==actual)return null;
 }
 return next;
}
function resolve(pattern,bindings){
 const out={};for(const key of ['subject','predicate','object']){const v=pattern[key];out[key]=typeof v==='string'&&v.charAt(0)==='?'&&Object.prototype.hasOwnProperty.call(bindings,v)?bindings[v]:v;}return out;
}
function sameFact(a,b){return a.subject===b.subject&&a.predicate===b.predicate&&a.object===b.object}
function infer(base,options){
 const o=options&&typeof options==='object'?options:{},maxSteps=Math.max(1,Math.min(MAX_STEPS,Number(o.maxSteps)||MAX_STEPS));
 if(!base||base.kind!=='ideevision-reasoning-base')return {ok:false,facts:[],derived:[],trace:[],contradictions:[],error:'base-invalid'};
 const facts=base.facts.map(clone),known=new Set(facts.map(f=>JSON.stringify([f.subject,f.predicate,f.object]))),derived=[],trace=[];let steps=0,changed=true;
 while(changed&&steps<maxSteps){changed=false;
  for(const rule of base.rules){let bindings=[{}];
   for(const premise of rule.when){const next=[];for(const binding of bindings){for(const fact of facts){const b=unify(premise,fact,binding);if(b)next.push(b);if(next.length>200)break;}if(next.length>200)break;}bindings=next;if(!bindings.length)break;}
   for(const binding of bindings){for(const conclusion of rule.then){const resolved=resolve(conclusion,binding),key=JSON.stringify([resolved.subject,resolved.predicate,resolved.object]);if(known.has(key))continue;
    if(facts.length>=MAX_FACTS) return {ok:false,facts,derived,trace,contradictions:detectContradictions(facts),error:'fact-limit'};
    const fact={id:'derived-'+(derived.length+1),subject:resolved.subject,predicate:resolved.predicate,object:resolved.object,source:'rule:'+rule.id,confidence:1};facts.push(fact);derived.push(fact);known.add(key);trace.push({step:++steps,ruleId:rule.id,ruleName:rule.name,bindings:Object.assign({},binding),conclusion:clone(fact)});changed=true;
    if(steps>=maxSteps)break;
   }if(steps>=maxSteps)break;}if(steps>=maxSteps)break;
  }
 }
 return {ok:true,facts,derived,trace,contradictions:detectContradictions(facts),steps,limitReached:steps>=maxSteps};
}
function detectContradictions(facts){
 const groups=new Map();facts.forEach(f=>{const k=JSON.stringify([f.subject,f.predicate]);if(!groups.has(k))groups.set(k,[]);if(!groups.get(k).some(x=>x.object===f.object))groups.get(k).push(f);});
 const out=[];groups.forEach(items=>{if(items.length>1)out.push({subject:items[0].subject,predicate:items[0].predicate,values:items.map(x=>({object:x.object,source:x.source||'unknown'}))});});return out;
}
function importActiveKnowledge(base,knowledgeApi){
 if(!base||base.kind!=='ideevision-reasoning-base')return {ok:false,error:'base-invalid',imported:0};
 if(!knowledgeApi||typeof knowledgeApi.active!=='function')return {ok:false,error:'knowledge-manager-unavailable',imported:0};
 let entries;try{entries=knowledgeApi.active();}catch(e){return {ok:false,error:'knowledge-read-failed',imported:0};}
 let imported=0,skipped=0;
 entries.forEach(entry=>{const candidates=[{subject:entry.id,predicate:'title',object:entry.title},{subject:entry.id,predicate:'domain',object:entry.domain},{subject:entry.id,predicate:'kind',object:entry.kind},{subject:entry.id,predicate:'description',object:entry.description}];
  if(entry.formula)candidates.push({subject:entry.id,predicate:'formula',object:entry.formula});
  candidates.forEach((f,i)=>{const id='knowledge-'+entry.id+'-'+i;if(base.facts.some(x=>x.id===id)){skipped++;return;}const r=addFact(base,Object.assign({id,source:'knowledge:'+entry.id,confidence:1},f));if(r.ok)imported++;else skipped++;});
 });
 return {ok:true,imported,skipped,entries:entries.length};
}
function answerText(base,question,knowledgeApi){
 const q=normalize(question),tokens=q.split(/\s+/).filter(x=>x.length>2),matches=[];
 if(knowledgeApi&&typeof knowledgeApi.active==='function'){
  let entries=[];try{entries=knowledgeApi.active();}catch(e){}
  entries.forEach(entry=>{const hay=normalize([entry.title,entry.description,entry.domain,entry.formula||''].join(' '));const hits=tokens.filter(token=>hay.includes(token));if(hits.length)matches.push({id:entry.id,title:entry.title,domain:entry.domain,description:entry.description,formula:entry.formula||null,score:hits.length/Math.max(1,tokens.length),matchedTerms:hits});});
 }
 matches.sort((a,b)=>b.score-a.score);
 const inferred=infer(base,{maxSteps:MAX_STEPS});
 return {ok:true,question:String(question||''),matches:matches.slice(0,5),inference:{derived:inferred.derived,trace:inferred.trace,contradictions:inferred.contradictions},confidence:matches.length?Math.min(.85,matches[0].score*.75):inferred.derived.length?.35:0,limitations:['Recherche lexicale locale : elle ne remplace pas une compréhension sémantique générale.','Les déductions ne sont valables que si les faits et règles fournis sont corrects.'],needsMoreKnowledge:matches.length===0&&inferred.derived.length===0};
}
function createScientificStarterBase(){
 const base=createKnowledgeBase('Raisonnement scientifique — base initiale');
 addFact(base,{id:'fact-water-state-1',subject:'eau',predicate:'has-state-at-20c',object:'liquid',source:'starter'});
 addFact(base,{id:'fact-sun-star',subject:'soleil',predicate:'is-a',object:'star',source:'starter'});
 addRule(base,{id:'rule-star-celestial',name:'Une étoile est un astre',when:[{subject:'?x',predicate:'is-a',object:'star'}],then:[{subject:'?x',predicate:'is-a',object:'celestial-body'}]});
 addRule(base,{id:'rule-celestial-space',name:'Un astre appartient à l’espace',when:[{subject:'?x',predicate:'is-a',object:'celestial-body'}],then:[{subject:'?x',predicate:'located-in',object:'space'}]});
 return base;
}
root.IdeeVisionReasoning=Object.freeze({version:VERSION,createKnowledgeBase,validateFact,validateRule,addFact,addRule,infer,detectContradictions,importActiveKnowledge,answerText,createScientificStarterBase,limits:Object.freeze({maxFacts:MAX_FACTS,maxRules:MAX_RULES,maxSteps:MAX_STEPS})});
})(typeof window!=='undefined'?window:globalThis);
