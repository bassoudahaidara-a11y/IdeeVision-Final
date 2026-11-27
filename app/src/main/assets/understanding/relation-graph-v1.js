/* Idée Vision — Graphe descriptif des relations v1 */
(function(root){
"use strict";
const VERSION="1.0.0";
const fold=s=>String(s||"").toLocaleLowerCase("fr-FR").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
function analyze(input,languageAnalysis,objectModel,actionModel){
 const source=String(input==null?"":input).normalize("NFKC").replace(/[’‘]/g,"'").replace(/\s+/g," ").trim();
 const valid=x=>x&&x.source===source&&x.ready!==false;
 if(!valid(languageAnalysis)||!valid(objectModel)||!valid(actionModel))
 return {engine:"IdeeVisionRelationGraph",version:VERSION,offline:true,source,ready:false,nodes:[],edges:[],issues:[{code:"matching_language_object_and_action_models_required"}],policy:{causalityInferred:false,physicsApplied:false,unstatedRelationsInvented:false}};
 const nodes=[];
 for(const o of objectModel.objects)nodes.push({id:o.id,type:"object",label:o.name,status:o.status,category:o.category,occurrence:o.occurrences[0]||o.evidence});
 for(const a of actionModel.actions)nodes.push({id:a.id,type:"action",label:a.verb,status:a.status,occurrence:a.occurrence});
 const edges=[];
 const add=(type,from,to,marker,range,status,details={})=>{
  edges.push({id:"relation-"+(edges.length+1),type,from:from||null,to:to||null,marker:marker||null,status:status||"candidate",evidenceRange:range||null,details});
 };
 const findObject=(label,sentenceIndex,at)=>{
  if(!label)return null;
  const candidates=objectModel.objects.filter(o=>o.occurrences.some(x=>x.sentenceIndex===sentenceIndex)&&fold(o.name)===fold(label));
  if(!candidates.length)return null;
  return candidates.find(o=>o.occurrences.some(x=>x.start<=at&&x.end>=at))||candidates[0];
 };
 const actionByOccurrence=new Map(actionModel.actions.map(a=>[a.occurrence.start,a]));
 for(const r of languageAnalysis.structure.relations){
  if(String(r.type||"").startsWith("temporal_"))continue;
  const from=findObject(r.from,r.sentenceIndex,r.start),to=findObject(r.to,r.sentenceIndex,r.end);
  add("spatial_"+r.type,from&&from.id,to&&to.id,r.marker,{start:r.start,end:r.end},from&&to?"explicit_textual_relation":"endpoint_unresolved",{fromText:r.from,toText:r.to,orientation:"textual_neighbor_order_only"});
 }
 for(const a of actionModel.actions){
  const actor=findObject(a.actor.text,a.occurrence.sentenceIndex,a.occurrence.start);
  const target=findObject(a.directObject.text,a.occurrence.sentenceIndex,a.occurrence.end);
  if(actor)add("action_actor",actor.id,a.id,null,a.occurrence,"grammatical_role_candidate",{roleStatus:a.actor.status,confidence:a.actor.confidence||null});
  if(target)add("action_target",a.id,target.id,null,a.occurrence,"grammatical_role_candidate",{roleStatus:a.directObject.status,confidence:a.directObject.confidence||null});
  for(const c of a.complementCandidates){
   const object=findObject(c.object,a.occurrence.sentenceIndex,c.start);
   add("action_prepositional_complement",a.id,object&&object.id,c.marker,{start:c.start,end:c.end},object?"prepositional_link_candidate":"complement_unresolved",{text:c.object});
  }
 }
 for(const s of actionModel.sequence){
  if(!s.previousActionId)continue;
  const previous=actionModel.actions.find(a=>a.id===s.previousActionId);
  const current=actionModel.actions.find(a=>a.id===s.actionId);
  if(!previous||!current)continue;
  for(const marker of s.markers){
   add("temporal_"+marker.type,previous.id,current.id,marker.marker,{start:previous.occurrence.end,end:current.occurrence.start},"explicit_sequence_marker");
  }
 }
 const issues=[];
 if(!edges.length)issues.push({code:"no_relation_edges_found",severity:"information"});
 if(edges.some(e=>e.status==="endpoint_unresolved"||e.status==="complement_unresolved"))issues.push({code:"some_relation_endpoints_unresolved",severity:"warning"});
 if(edges.some(e=>e.status==="grammatical_role_candidate"||e.status==="prepositional_link_candidate"))issues.push({code:"some_action_links_are_candidates",severity:"information"});
 return {engine:"IdeeVisionRelationGraph",version:VERSION,offline:true,source,ready:true,nodes,edges,issues,policy:{grammaticalRolesRemainCandidates:true,textualSpatialOrientationMayBeAmbiguous:true,causalityInferred:false,physicsApplied:false,unstatedRelationsInvented:false,objectIdentityAcrossSentencesResolved:false}};
}
function diagnostics(){return {name:"Idée Vision — Graphe descriptif des relations",version:VERSION,offline:true,externalDependencies:[],capabilities:["nœuds d'objets et d'actions","identifiants reliés aux occurrences","relations spatiales textuelles","relations acteur-action candidates","relations action-objet candidates","compléments prépositionnels candidats","liens temporels entre actions","marqueurs explicites conservés","positions de preuve conservées","extrémités manquantes signalées","plusieurs relations par description","plusieurs phrases conservées sans fusion d'identité","sortie graphe JSON","validation des analyses sources","aucune causalité inventée","aucune loi physique calculée"],limitations:["les relations spatiales héritent des heuristiques lexicales initiales","les rôles grammaticaux restent candidats","les objets répétés ne sont pas désambiguïsés parfaitement","les relations implicites ne sont pas inventées","les connecteurs temporels ne garantissent pas l'ordre réel","aucune simulation physique"]};}
const api=Object.freeze({version:VERSION,analyze,diagnostics});
root.IdeeVisionRelationGraph=api;if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
