/* Idée Vision — Multi-engine Orchestrator v1
 * Plans and checks work across declared capabilities. It does not execute model engines.
 */
(function(root){
 "use strict";
 const VERSION="1.0.0";
 const DEFAULT_ENGINES=[
  {id:"cognitive",capabilities:["understand","classify","extract"]},
  {id:"memory",capabilities:["context","references"]},
  {id:"reasoning",capabilities:["decompose","plan","validate"]},
  {id:"knowledge",capabilities:["retrieve","cite"]},
  {id:"design",capabilities:["scene","geometry","animation"]},
  {id:"programming",capabilities:["code","debug","tests"]},
  {id:"science",capabilities:["math","physics","chemistry","biology","units"]},
  {id:"language",capabilities:["translate","language"]},
  {id:"research",capabilities:["search","verify"]}
 ];
 const DOMAIN_RULES=[
  {domain:"programming",re:/\b(code|programme|python|javascript|html|css|debug|script|application|apk)\b/i,caps:["code","debug","tests"]},
  {domain:"science",re:/\b(math|mathématique|calcul|équation|physique|force|gravité|chimie|molécule|biologie|unité|vitesse)\b/i,caps:["math","physics","chemistry","biology","units"]},
  {domain:"design",re:/\b(dessine|dessin|construis|maison|robot|voiture|avion|scène|scene|3d|animation|modélise|modele)\b/i,caps:["scene","geometry","animation"]},
  {domain:"language",re:/\b(traduis|traduction|translate|grammaire|conjugaison|anglais|français)\b/i,caps:["translate","language"]},
  {domain:"research",re:/\b(recherche|cherche|actualité|prix|source|vérifie|verifie|récent|latest|search)\b/i,caps:["search","verify"]}
 ];
 const clean=s=>String(s==null?"":s).normalize("NFKC").replace(/\s+/g," ").trim();
 const unique=a=>[...new Set(a)];
 function inferDomains(request,intent){
  const t=clean(request),found=DOMAIN_RULES.filter(r=>r.re.test(t)).map(r=>({domain:r.domain,capabilities:r.caps}));
  if(!found.length)found.push({domain:intent==="create"?"design":intent==="code"?"programming":intent==="calculate"?"science":"general",capabilities:intent==="create"?["scene","geometry"]:intent==="code"?["code","tests"]:intent==="calculate"?["math","units"]:["understand"]});
  return found;
 }
 function normalizeEngines(engines){
  return (Array.isArray(engines)?engines:DEFAULT_ENGINES).filter(e=>e&&typeof e.id==="string"&&Array.isArray(e.capabilities)).map(e=>({id:e.id,capabilities:unique(e.capabilities.filter(x=>typeof x==="string"))}));
 }
 function makeTasks(request,domains){
  const tasks=[
   {id:"understand",label:"Comprendre et structurer la demande",capability:"understand",dependsOn:[],priority:100},
   {id:"context",label:"Rassembler le contexte et les références",capability:"context",dependsOn:["understand"],priority:80},
   {id:"decompose",label:"Décomposer le travail en sous-tâches",capability:"decompose",dependsOn:["understand"],priority:90}
  ];
  let previous=["decompose"];
  domains.forEach((d,i)=>{
   d.capabilities.forEach((cap,j)=>{
    const id="domain_"+i+"_"+j;
    tasks.push({id,label:"Traiter le domaine "+d.domain+" : "+cap,capability:cap,domain:d.domain,dependsOn:previous.slice(),priority:70-i*5-j});
    previous.push(id);
   });
  });
  tasks.push({id:"validate",label:"Vérifier la cohérence et la complétude",capability:"validate",dependsOn:previous.slice(),priority:95});
  tasks.push({id:"report",label:"Préparer le compte rendu final",capability:"understand",dependsOn:["validate"],priority:60});
  return tasks;
 }
 function topological(tasks){
  const byId=new Map(tasks.map(t=>[t.id,t])),indegree=new Map(),children=new Map();
  tasks.forEach(t=>{indegree.set(t.id,0);children.set(t.id,[])});
  for(const t of tasks)for(const dep of t.dependsOn||[]){
   if(!byId.has(dep))throw new Error("Dépendance inconnue : "+dep);
   indegree.set(t.id,indegree.get(t.id)+1);children.get(dep).push(t.id);
  }
  const ready=tasks.filter(t=>indegree.get(t.id)===0).sort((a,b)=>b.priority-a.priority),ordered=[];
  while(ready.length){
   const t=ready.shift();ordered.push(t);
   for(const id of children.get(t.id)){indegree.set(id,indegree.get(id)-1);if(indegree.get(id)===0){ready.push(byId.get(id));ready.sort((a,b)=>b.priority-a.priority)}}
  }
  if(ordered.length!==tasks.length)throw new Error("Cycle détecté dans les dépendances.");
  return ordered;
 }
 function plan(request,options){
  options=options||{};request=clean(request);
  if(!request)throw new TypeError("La demande est vide.");
  const engines=normalizeEngines(options.engines),domains=inferDomains(request,options.intent||"general"),tasks=makeTasks(request,domains);
  const capabilities=new Map();engines.forEach(e=>e.capabilities.forEach(c=>{if(!capabilities.has(c))capabilities.set(c,[]);capabilities.get(c).push(e.id)}));
  tasks.forEach(t=>{t.candidates=capabilities.get(t.capability)||[];t.status=t.candidates.length?"ready":"missing_engine";t.assignedEngine=t.candidates[0]||null;t.attempts=0});
  const ordered=topological(tasks),missing=unique(tasks.filter(t=>!t.candidates.length).map(t=>t.capability));
  const layers=[];const done=new Set();
  while(done.size<ordered.length){
   const layer=ordered.filter(t=>!done.has(t.id)&&(t.dependsOn||[]).every(d=>done.has(d)));
   if(!layer.length)throw new Error("Impossible de construire les phases du plan.");
   layers.push(layer.map(t=>t.id));layer.forEach(t=>done.add(t.id));
  }
  return {engine:"IdeeVisionOrchestrator",version:VERSION,request,domains:domains.map(d=>d.domain),tasks:ordered,layers,missingCapabilities:missing,ready:missing.length===0,createdAt:Number.isFinite(options.timestamp)?options.timestamp:null};
 }
 function validateOutput(output,requirements){
  const req=Array.isArray(requirements)?requirements:[],issues=[];
  if(output==null)issues.push("empty_output");
  else if(typeof output!=="string"&&typeof output!=="object")issues.push("unsupported_output_type");
  const text=typeof output==="string"?output:JSON.stringify(output);
  if(!text||!text.trim())issues.push("empty_output");
  req.forEach(r=>{if(typeof r==="string"&&r.trim()&&!text.toLocaleLowerCase().includes(r.toLocaleLowerCase()))issues.push("requirement_missing:"+r)});
  return {valid:issues.length===0,issues,characters:text?text.length:0};
 }
 function compareResults(results){
  const list=Array.isArray(results)?results.filter(x=>x&&typeof x.text==="string"):[];
  const conflicts=[];
  for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){
   const a=list[i],b=list[j],na=(a.text.match(/-?\d+(?:[.,]\d+)?/g)||[]),nb=(b.text.match(/-?\d+(?:[.,]\d+)?/g)||[]);
   const shared=na.filter(n=>nb.includes(n));
   if(a.topic&&b.topic&&a.topic===b.topic&&na.length&&nb.length&&!shared.length)conflicts.push({a:a.engine||"unknown",b:b.engine||"unknown",topic:a.topic,type:"numeric_disagreement_possible"});
  }
  return {conflicts,requiresReview:conflicts.length>0};
 }
 function recordAttempt(taskId,planResult,success,error,maxAttempts){
  const task=planResult&&planResult.tasks&&planResult.tasks.find(t=>t.id===taskId);
  if(!task)throw new Error("Tâche inconnue : "+taskId);
  const limit=Math.max(1,Math.min(5,Number(maxAttempts)||2));task.attempts++;
  task.status=success?"completed":task.attempts<limit?"retry_pending":"failed";
  task.error=success?null:clean(error||"Échec sans détail").slice(0,300);
  return {status:task.status,attempts:task.attempts,canRetry:task.status==="retry_pending"};
 }
 function summarize(planResult){
  const tasks=planResult&&Array.isArray(planResult.tasks)?planResult.tasks:[];
  return {total:tasks.length,ready:tasks.filter(t=>t.status==="ready").length,missing:tasks.filter(t=>t.status==="missing_engine").length,completed:tasks.filter(t=>t.status==="completed").length,failed:tasks.filter(t=>t.status==="failed").length,phases:(planResult.layers||[]).length,missingCapabilities:(planResult.missingCapabilities||[]).slice()};
 }
 function toPromptContext(p){
  if(!p||p.engine!=="IdeeVisionOrchestrator")throw new TypeError("Plan d'orchestration invalide.");
  return ["PLANIFICATEUR MULTI-MOTEURS IDÉE VISION","Domaines : "+p.domains.join(", "),"Phases : "+p.layers.map((l,i)=>"Phase "+(i+1)+" ["+l.join(", ")+"]").join(" ; "),"Capacités manquantes : "+(p.missingCapabilities.join(", ")||"aucune détectée"),"Important : ce plan décrit les capacités attendues. Il ne prouve pas que chaque moteur spécialisé est réellement installé ou exécuté."].join("\n");
 }
 function diagnostics(){return {name:"Idée Vision Multi-engine Orchestrator",version:VERSION,planningOffline:true,executesEngines:false,capabilities:["domain_routing","task_graph","dependency_validation","cycle_detection","topological_order","parallel_layers","capability_matching","missing_engine_detection","output_validation","numeric_conflict_flags","bounded_retry_tracking","status_summary","prompt_context"]}}
 root.IdeeVisionOrchestrator=Object.freeze({version:VERSION,defaultEngines:DEFAULT_ENGINES,inferDomains,topological,plan,validateOutput,compareResults,recordAttempt,summarize,toPromptContext,diagnostics});
 if(typeof module!=="undefined"&&module.exports)module.exports=root.IdeeVisionOrchestrator;
})(typeof window!=="undefined"?window:globalThis);
