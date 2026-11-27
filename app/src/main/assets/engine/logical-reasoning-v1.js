/* Idée Vision — Logical Reasoning Engine v1
 * Structures a verifiable solution plan; it does not expose private chain-of-thought.
 */
(function(root){
 "use strict";
 const VERSION="1.0.0";
 const STOP=new Set(["avec","dans","pour","mais","donc","plus","moins","faire","fais","fait","veux","comment","pourquoi","alors","ensuite","cette","cela","ceci","the","and","for","with","from"]);
 const DOMAIN_RULES=[
  ["mathematics",/\b(calcule|calculer|résous|resous|équation|equation|fonction|fraction|vitesse|distance|aire|volume|mathématique|mathematics|solve)\b/],
  ["physics",/\b(force|gravité|gravite|masse|énergie|energie|mouvement|vitesse|accélération|acceleration|physique|physics)\b/],
  ["programming",/\b(code|python|javascript|programme|programmer|algorithme|fonction|variable|bug|script)\b/],
  ["design",/\b(construis|construire|crée|cree|dessine|modélise|modelise|maison|pont|robot|voiture|scène|scene|3d)\b/],
  ["biology",/\b(cellule|plante|animal|corps|organisme|photosynthèse|photosynthese|biologie|biology)\b/]
 ];
 const MISSING_PATTERNS=[
  ["target",/\b(ce résultat|ce resultat|cela|ça|ça marche|it|this|that)\b/],
  ["quantity",/\b(combien|quelle quantité|quelle quantite|how much|how many)\b/]
 ];
 function clean(s){return String(s==null?"":s).normalize("NFKC").replace(/\s+/g," ").trim();}
 function fold(s){return clean(s).toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g,"");}
 function tokens(s){return (fold(s).match(/[\p{L}\p{N}]{2,}/gu)||[]).filter(w=>!STOP.has(w));}
 function unique(a){return [...new Set(a)];}
 function detectDomain(text,intent){
  const t=fold(text);
  for(const [name,re] of DOMAIN_RULES)if(re.test(t))return name;
  return intent==="calculate"?"mathematics":intent==="code"?"programming":intent==="simulate"?"physics":"general";
 }
 function extractFacts(text){
  const s=clean(text), numbers=(s.match(/[-+]?\d+(?:[.,]\d+)?/g)||[]).map(x=>Number(x.replace(",","."))).filter(Number.isFinite);
  const units=(s.toLowerCase().match(/\b(?:mm|cm|km|m|mg|kg|g|ml|l|s|min|h|hz|v|w|kw|n|pa|°c)\b/g)||[]);
  const unknowns=unique((s.match(/\b(?:inconnu|inconnue|à trouver|a trouver|cherche|recherche|unknown|find)\b/gi)||[]).map(fold));
  return {numbers,units:unique(units),unknowns};
 }
 function splitSubproblems(text){
  const parts=clean(text).split(/\b(?:puis|ensuite|et enfin|après|apres|then|finally)\b|[;\n]+/i).map(clean).filter(x=>x.length>2);
  return (parts.length>1?parts:[clean(text)]).slice(0,8);
 }
 function findUnknowns(text,intent,facts){
  const t=fold(text),u=[];
  if(/\b(inconnu|inconnue|à trouver|a trouver|cherche|recherche|unknown|find|calcule|calculer|résous|resous)\b/.test(t))u.push("résultat demandé à déterminer");
  if(/\b(vitesse|distance|temps|masse|force|volume|aire|longueur|largeur|hauteur)\b/.test(t)&&facts.numbers.length===0)u.push("valeurs numériques nécessaires");
  if(intent==="create"&&/\b(maison|pont|robot|voiture|avion)\b/.test(t)&&facts.numbers.length===0)u.push("dimensions ou proportions (si elles sont importantes)");
  return unique(u);
 }
 function findConstraints(text){
  const t=fold(text),out=[];
  if(/\b(sans internet|hors ligne|offline)\b/.test(t))out.push("fonctionner hors ligne");
  if(/\b(gratuit|gratuite|free)\b/.test(t))out.push("ne pas nécessiter de paiement");
  if(/\b(en francais|en français|francais|français)\b/.test(t))out.push("réponse en français");
  if(/\b(uniquement|seulement|exactement)\b/.test(t))out.push("respecter la restriction explicitement demandée");
  const limits=text.match(/\b(?:maximum|minium|minimum|max|au moins|pas plus de)\s+\d+(?:[.,]\d+)?\s*\w*/gi)||[];
  return unique(out.concat(limits.map(clean)));
 }
 function detectConflicts(text){
  const t=fold(text),c=[];
  if(/\b(hors ligne|sans internet|offline)\b/.test(t)&&/\b(recherche web|sur internet|en ligne|online)\b/.test(t))c.push("La demande combine un fonctionnement hors ligne et une recherche sur Internet.");
  if(/\b(gratuit|gratuite|free)\b/.test(t)&&/\b(payant|payer|abonnement|premium obligatoire)\b/.test(t))c.push("La demande combine une exigence de gratuité et un élément payant obligatoire.");
  if(/\b(aucune donnée|aucune donnee|sans données|sans donnees)\b/.test(t)&&/\b(utilise mes données|utilise mes donnees|analyse mes fichiers)\b/.test(t))c.push("La demande interdit les données tout en demandant leur utilisation.");
  return c;
 }
 function chooseStrategy(domain,intent){
  const map={mathematics:["lister_les_données","choisir_une_relation_mathématique","calculer_avec_les_unités","vérifier_le_résultat"],physics:["définir_le_système_physique","identifier_les grandeurs","choisir_les lois pertinentes","contrôler_les unités_et_les_hypothèses"],programming:["définir_les entrées_et_sorties","décomposer_en_fonctions","implémenter_progressivement","tester_les_cas_normaux_et_limites"],design:["définir_les éléments_de_la_scène","établir_les dimensions_et_relations","construire_un prototype","vérifier_la_cohérence_spatiale"],biology:["identifier_les organismes_ou_structures","organiser_les mécanismes","relier_cause_et_effet","vérifier_avec_des_connaissances fiables"],general:["clarifier_l’objectif","séparer_les faits_des hypothèses","traiter_les étapes dans l’ordre","vérifier_que la réponse satisfait la demande"]};
  return (map[domain]||map.general).slice();
 }
 function buildPlan(text,analysis){
  const request=clean(text),intent=analysis&&analysis.intent||"general",facts=extractFacts(request),domain=detectDomain(request,intent);
  const subtasks=splitSubproblems(request),unknowns=findUnknowns(request,intent,facts),constraints=findConstraints(request),conflicts=detectConflicts(request);
  const assumptions=[];
  if(facts.numbers.length&&facts.units.length===0)assumptions.push("Les nombres fournis n'ont pas d'unité explicite.");
  if(/\b(environ|à peu près|environ|around|about)\b/i.test(request))assumptions.push("Les valeurs sont approximatives.");
  const strategy=chooseStrategy(domain,intent);
  const steps=[{id:"understand",action:"reformuler_l’objectif",detail:"Identifier le résultat attendu."},
   {id:"facts",action:"séparer_données_et_inconnues",detail:"Données : "+(facts.numbers.length?facts.numbers.join(", "):"non chiffrées")+". Inconnues : "+(unknowns.join("; ")||"aucune explicitement repérée")+".",dependsOn:["understand"]},
   {id:"constraints",action:"contrôler_les contraintes",detail:constraints.join("; ")||"Aucune contrainte particulière détectée.",dependsOn:["understand"]},
   {id:"strategy",action:"appliquer_une stratégie adaptée",detail:strategy.join(" → "),dependsOn:["facts","constraints"]},
   {id:"verify",action:"vérifier_la_solution",detail:"Contrôler la cohérence, les unités et la réponse à la demande.",dependsOn:["strategy"]},
   {id:"present",action:"présenter_le résultat",detail:"Donner les étapes utiles, les limites et les éventuelles précisions nécessaires.",dependsOn:["verify"]}];
  return {engine:"IdeeVisionReasoning",version:VERSION,domain,intent,subproblems:subtasks,knowns:facts.numbers.map((value,i)=>({label:"valeur_"+(i+1),value,unit:facts.units[i]||null})),facts,unknowns,constraints,assumptions,conflicts,strategy,steps,needsClarification:conflicts.length>0||unknowns.length>0&&facts.numbers.length===0,confidence:conflicts.length?0.35:unknowns.length?0.62:0.78};
 }
 function validatePlan(plan){
  if(!plan||plan.engine!=="IdeeVisionReasoning"||!Array.isArray(plan.steps)||!plan.steps.length)return {valid:false,errors:["plan_invalid"]};
  const ids=new Set(plan.steps.map(s=>s.id)),errors=[];
  plan.steps.forEach(s=>(s.dependsOn||[]).forEach(d=>{if(!ids.has(d))errors.push("dependency_missing:"+d)}));
  if(plan.steps.some(s=>!s.action||!s.detail))errors.push("step_incomplete");
  return {valid:errors.length===0,errors};
 }
 function toPromptContext(plan){
  const check=validatePlan(plan);if(!check.valid)throw new TypeError("Plan de raisonnement invalide.");
  return ["PLAN DE RAISONNEMENT IDÉE VISION","Domaine : "+plan.domain,"Sous-problèmes : "+plan.subproblems.join(" | "),
   "Données connues : "+(plan.knowns.map(x=>x.value+(x.unit||"")).join(", ")||"non précisées"),
   "Inconnues : "+(plan.unknowns.join("; ")||"aucune repérée"),"Contraintes : "+(plan.constraints.join("; ")||"aucune détectée"),
   "Hypothèses à vérifier : "+(plan.assumptions.join("; ")||"aucune détectée"),
   "Conflits : "+(plan.conflicts.join("; ")||"aucun détecté"),"Méthode proposée : "+plan.strategy.join(" → "),
   "Étapes : "+plan.steps.map((s,i)=>(i+1)+". "+s.action+" — "+s.detail).join("\n"),
   "Niveau de confiance heuristique : "+plan.confidence,
   "Ne pas inventer les données manquantes ; demander une précision si elle est indispensable."].join("\n");
 }
 function comparePlans(a,b){
  const va=validatePlan(a),vb=validatePlan(b);
  return {first:va.valid?{valid:true,steps:a.steps.length,conflicts:a.conflicts.length}:{valid:false},
   second:vb.valid?{valid:true,steps:b.steps.length,conflicts:b.conflicts.length}:{valid:false},
   recommendation:!va.valid?"second":!vb.valid?"first":a.conflicts.length<b.conflicts.length?"first":b.conflicts.length<a.conflicts.length?"second":"either"};
 }
 function diagnostics(){return {name:"Idée Vision Logical Reasoning Engine",version:VERSION,offline:true,capabilities:["décomposition","faits_et_inconnues","contraintes","hypothèses","détection_conflits","stratégies_domaines","dépendances","validation_plan","contexte_prompt"],limitations:["heuristique","pas_de_preuve_formelle","ne_remplace_pas_un_modèle_de_langage"]};}
 root.IdeeVisionReasoning=Object.freeze({version:VERSION,clean,fold,tokens,detectDomain,extractFacts,splitSubproblems,findUnknowns,findConstraints,detectConflicts,chooseStrategy,buildPlan,validatePlan,toPromptContext,comparePlans,diagnostics});
})(typeof window!=="undefined"?window:globalThis);
