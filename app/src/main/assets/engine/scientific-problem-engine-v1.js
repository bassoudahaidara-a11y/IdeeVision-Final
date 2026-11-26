(function(root){
'use strict';
const VERSION='0.1.0',MAX_TEXT=1200,MAX_VALUES=30;
const S=root.IdeeVisionScientific;
function fail(code,message){return {ok:false,error:code,message};}
function norm(s){return String(s==null?'':s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/,/g,'.').replace(/[^a-z0-9°²=+*/^().\s-]/g,' ').replace(/\s+/g,' ').trim();}
const TARGETS=[
 {kind:'newton-second-law',words:['force','resultante','deuxieme loi de newton','loi de newton'],vars:['mass','acceleration'],label:'force'},
 {kind:'weight',words:['poids','pesanteur','force de pesanteur'],vars:['mass'],label:'poids'},
 {kind:'kinetic-energy',words:['energie cinetique','energie du mouvement'],vars:['mass','speed'],label:'énergie cinétique'},
 {kind:'uniform-motion',words:['vitesse moyenne','vitesse','rapidite'],vars:['distance','time'],label:'vitesse moyenne'}
];
const LABELS={mass:'masse',acceleration:'accélération',speed:'vitesse',distance:'distance',time:'durée',angle:'angle'};
const UNITS={
 kg:{variable:'mass',factor:1,unit:'kg'},g:{variable:'mass',factor:.001,unit:'kg'},
 m:{variable:'distance',factor:1,unit:'m'},km:{variable:'distance',factor:1000,unit:'m'},cm:{variable:'distance',factor:.01,unit:'m'},mm:{variable:'distance',factor:.001,unit:'m'},
 s:{variable:'time',factor:1,unit:'s'},sec:{variable:'time',factor:1,unit:'s'},min:{variable:'time',factor:60,unit:'s'},h:{variable:'time',factor:3600,unit:'s'},
 'm/s':{variable:'speed',factor:1,unit:'m/s'},'km/h':{variable:'speed',factor:1/3.6,unit:'m/s'},
 'm/s2':{variable:'acceleration',factor:1,unit:'m/s²'},'m/s²':{variable:'acceleration',factor:1,unit:'m/s²'},
 '°':{variable:'angle',factor:1,unit:'°'}
};
function extractMeasurements(text){
 const source=String(text),re=/(\d+(?:[.,]\d+)?)\s*(km\/h|m\/s²|m\/s2|m\/s|min|kg|mm|cm|km|m|g|h|s|°)/gi,values={},measurements=[];let match;
 while((match=re.exec(source))!==null&&measurements.length<MAX_VALUES){
  const rawUnit=match[2].toLowerCase(),unit=UNITS[rawUnit];if(!unit)continue;
  const raw=Number(match[1].replace(',','.'));if(!Number.isFinite(raw))continue;
  const before=norm(source.slice(Math.max(0,match.index-45),match.index));
  const after=norm(source.slice(match.index+match[0].length,Math.min(source.length,match.index+match[0].length+30)));
  let variable=unit.variable;
  if(variable==='distance'&&/^(temps|duree|pendant)\b/.test(after))continue;
  if(variable==='time'&&/^(parcours|distance)\b/.test(after))continue;
  if(variable==='distance'&&/\b(vitesse|rapidite)\b/.test(before))continue;
  const value=raw*unit.factor;
  measurements.push({variable,value,unit:unit.unit,source:match[0],index:match.index});
  if(values[variable]===undefined)values[variable]=value;
 }
 return {values,measurements};
}
function detectTarget(text){
 const t=norm(text);
 for(const item of TARGETS)if(item.words.some(w=>t.includes(w)))return item;
 return null;
}
function findEquation(source){
 const match=String(source).match(/(?:equation\s*)?([0-9xX+*/^().\s-]{3,100}=[0-9xX+*/^().\s-]{1,100})/i);
 return match?match[1].replace(/\s+/g,''):null;
}
function explainCalculation(result,formula,variables){
 const supplied=Object.keys(variables).map(k=>LABELS[k]+ ' = '+variables[k]+({mass:' kg',distance:' m',time:' s',speed:' m/s',acceleration:' m/s²'}[k]||'')).join(' ; ');
 return {method:formula.label,formula:result.formula||formula.kind,given:supplied,missing:[],steps:(result.steps||[]).slice(),result:{value:result.value,unit:result.unit},verification:'Calcul effectué avec les valeurs converties en unités SI.'};
}
function analyze(input,options){
 const source=String(input==null?'':input).trim();
 if(!source)return fail('text-empty','Écris un énoncé scientifique.');
 if(source.length>MAX_TEXT)return fail('text-too-long','L’énoncé dépasse la limite de 1 200 caractères.');
 if(!S)return fail('scientific-engine-unavailable','Le moteur de calcul scientifique est indisponible.');
 const normalized=norm(source),extracted=extractMeasurements(source),equation=findEquation(source);
 if(equation&&/(resous|resoudre|solution|equation|equations)/.test(normalized)){
  const solved=S.solveEquation(equation,'x');
  return {ok:true,kind:'equation',intent:'solve-equation',source,normalized,equation,solved,needsClarification:!solved.ok,clarification:solved.ok?null:'Vérifie l’écriture de l’équation.',steps:solved.steps||[]};
 }
 const target=detectTarget(source);
 if(!target)return {ok:true,kind:'unclassified',intent:'scientific-question',source,normalized,measurements:extracted.measurements,values:extracted.values,missing:[],candidates:TARGETS.map(x=>({kind:x.kind,label:x.label,required:x.vars.slice()})),needsClarification:true,clarification:'Je n’ai pas identifié avec certitude la grandeur recherchée. Précise si tu cherches la force, le poids, la vitesse ou l’énergie cinétique.'};
 const values=Object.assign({},extracted.values);
 if(target.kind==='weight'&&values.gravity===undefined)values.gravity=9.81;
 const missing=target.vars.filter(k=>values[k]===undefined);
 const result=missing.length?null:S.calculateMechanics(target.kind,values);
 const candidates=TARGETS.map(x=>({kind:x.kind,label:x.label,required:x.vars.slice(),available:x.vars.filter(k=>values[k]!==undefined).length}));
 const base={ok:true,kind:'mechanics-problem',intent:'solve-mechanics',source,normalized,target:target.kind,targetLabel:target.label,measurements:extracted.measurements,values,required:target.vars.slice(),missing,missingLabels:missing.map(k=>LABELS[k]||k),candidates,needsClarification:missing.length>0,clarification:missing.length?'Il manque : '+missing.map(k=>LABELS[k]||k).join(', ')+'.':null};
 if(!result||!result.ok)return Object.assign(base,{solved:false,error:result&&result.error||'calculation-unavailable'});
 return Object.assign(base,{solved:true,calculation:explainCalculation(result,target,values),result});
}
function solve(input,options){const parsed=analyze(input,options);if(!parsed.ok||parsed.needsClarification||parsed.kind==='unclassified')return parsed;return parsed;}
root.IdeeVisionScientificProblem=Object.freeze({version:VERSION,analyze,solve,extractMeasurements,targets:TARGETS.map(x=>({kind:x.kind,label:x.label,required:x.vars.slice()})),limits:Object.freeze({maxTextLength:MAX_TEXT,maxMeasurements:MAX_VALUES})});
})(typeof window!=='undefined'?window:globalThis);
