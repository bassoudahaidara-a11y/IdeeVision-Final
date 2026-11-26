(function(root){
'use strict';
const KEY='ideevision.knowledge.v1';
const MAX_FILE_BYTES=2*1024*1024;
const ALLOWED_KINDS=['concept','law','formula','property','method','constant','procedure'];
const ALLOWED_STATUS=['draft','active','disabled'];
function safeText(v,max){return typeof v==='string'&&v.trim().length>0&&v.length<=max&&!/[<>]/.test(v)}
function validId(v){return typeof v==='string'&&/^[a-z0-9][a-z0-9._-]{2,79}$/i.test(v)}
function validFormula(v){
 if(v==null||v==='')return true;
 if(typeof v!=='string'||v.length>500)return false;
 return /^[a-zA-Z0-9_+\-*/^().,\s=<>≤≥√π%]+$/.test(v);
}
function validateEntry(e){
 const errors=[];
 if(!e||typeof e!=='object'||Array.isArray(e))return {valid:false,errors:['Entrée invalide.']};
 if(!validId(e.id))errors.push('Identifiant absent ou invalide.');
 if(!safeText(e.domain,80))errors.push('Domaine manquant ou trop long.');
 if(!safeText(e.title,120))errors.push('Titre manquant ou trop long.');
 if(!safeText(e.description,4000))errors.push('Description manquante ou trop longue.');
 if(!ALLOWED_KINDS.includes(e.kind))errors.push('Type de connaissance non autorisé.');
 if(e.formula!=null&&!validFormula(e.formula))errors.push('Formule contenant des caractères non autorisés.');
 if(e.variables!=null&&(!Array.isArray(e.variables)||e.variables.length>40))errors.push('Liste de variables invalide.');
 if(Array.isArray(e.variables))e.variables.forEach((v,i)=>{
  if(!v||!safeText(v.symbol,24)||!safeText(v.unit||'sans unité',40)||!safeText(v.meaning,160))errors.push('Variable '+i+' invalide.');
 });
 if(e.assumptions!=null&&(!Array.isArray(e.assumptions)||e.assumptions.length>30||e.assumptions.some(x=>!safeText(x,300))))errors.push('Hypothèses invalides.');
 if(e.tests!=null&&(!Array.isArray(e.tests)||e.tests.length>30))errors.push('Tests de référence invalides.');
 if(Array.isArray(e.tests))e.tests.forEach((t,i)=>{
  if(!t||!safeText(t.name,100)||typeof t.expected!=='string'&&typeof t.expected!=='number')errors.push('Test '+i+' invalide.');
 });
 if(e.source!=null&&typeof e.source!=='string')errors.push('Source invalide.');
 return {valid:errors.length===0,errors};
}
function readAll(){
 try{const raw=root.localStorage&&root.localStorage.getItem(KEY);if(!raw)return [];const parsed=JSON.parse(raw);return Array.isArray(parsed)?parsed:[]}
 catch(e){return []}
}
function writeAll(items){
 try{root.localStorage.setItem(KEY,JSON.stringify(items));return {ok:true}}
 catch(e){return {ok:false,error:'Stockage local indisponible ou plein.'}}
}
function importPackage(pkg){
 if(!pkg||pkg.format!=='ideevision-knowledge'||pkg.schemaVersion!==1||!Array.isArray(pkg.entries))return {ok:false,error:'Format non reconnu. Utilise un paquet Idée Vision version 1.'};
 if(pkg.entries.length>500)return {ok:false,error:'Maximum 500 connaissances par importation.'};
 const current=readAll(),seen=new Set(current.map(x=>x.id)),accepted=[],rejected=[];
 pkg.entries.forEach((entry,index)=>{
  const check=validateEntry(entry);
  if(!check.valid){rejected.push({index, id:entry&&entry.id||'',errors:check.errors});return}
  if(seen.has(entry.id)){rejected.push({index,id:entry.id,errors:['Cet identifiant existe déjà.']});return}
  seen.add(entry.id);
  accepted.push(Object.assign({},entry,{status:'draft',importedAt:new Date().toISOString(),packageTitle:pkg.title||'Import sans titre'}));
 });
 const next=current.concat(accepted),saved=writeAll(next);
 if(!saved.ok)return {ok:false,error:saved.error,accepted:0,rejected};
 return {ok:true,accepted:accepted.length,rejected,entries:accepted,needsReview:true};
}
function setStatus(id,status){
 if(!ALLOWED_STATUS.includes(status))return {ok:false,error:'Statut invalide.'};
 const all=readAll(),item=all.find(x=>x.id===id);
 if(!item)return {ok:false,error:'Connaissance introuvable.'};
 item.status=status;item.updatedAt=new Date().toISOString();
 const result=writeAll(all);return result.ok?{ok:true,item}:{ok:false,error:result.error};
}
function remove(id){const all=readAll(),next=all.filter(x=>x.id!==id);if(next.length===all.length)return {ok:false,error:'Connaissance introuvable.'};return writeAll(next)}
function active(){return readAll().filter(x=>x.status==='active')}
function stats(){const all=readAll();return {total:all.length,draft:all.filter(x=>x.status==='draft').length,active:all.filter(x=>x.status==='active').length,disabled:all.filter(x=>x.status==='disabled').length}}
function exportPackage(){return {format:'ideevision-knowledge',schemaVersion:1,title:'Sauvegarde Idée Vision',entries:readAll()}}
root.IdeeVisionKnowledge=Object.freeze({version:'1.0.0',validateEntry,importPackage,list:readAll,active,setStatus,remove,stats,exportPackage,maxFileBytes:MAX_FILE_BYTES});
})(typeof window!=='undefined'?window:globalThis);
