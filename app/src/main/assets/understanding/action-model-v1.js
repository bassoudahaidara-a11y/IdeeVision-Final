/* Idée Vision — Représentation descriptive des actions v1 */
(function(root){
"use strict";
const VERSION="1.0.0";
const fold=s=>String(s||"").toLocaleLowerCase("fr-FR").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const TYPES={
movement:new Set(["tomber","bouger","tourner","avancer","reculer","monter","descendre","entrer","sortir","traverser","pousser","tirer","porter","transporter"]),
manipulation:new Set(["placer","poser","prendre","tenir","appuyer","ouvrir","fermer","ajouter","enlever","remplir","vider"]),
transformation:new Set(["construire","fabriquer","chauffer","refroidir","fondre","casser","couper","assembler","demonter"]),
connection:new Set(["relier","connecter","attacher","fixer","debrancher"]),
fluid:new Set(["couler","verser","remplir","vider"]),
creation:new Set(["dessiner","construire","fabriquer","creer"]),
communication:new Set(["decrire","expliquer","montrer","mesurer"])
};
const RESULT=new Map([["ouvrir","open"],["fermer","closed"],["remplir","filled"],["vider","emptied"],["chauffer","heated"],["refroidir","cooled"],["connecter","connected"],["debrancher","disconnected"],["construire","constructed"],["fabriquer","constructed"],["casser","broken"],["assembler","assembled"]]);
const TRANSITIVE=new Set(["placer","poser","prendre","tenir","porter","transporter","pousser","tirer","appuyer","ouvrir","fermer","ajouter","enlever","remplir","vider","relier","connecter","attacher","fixer","chauffer","refroidir","construire","fabriquer","dessiner","mesurer","verser"]);
const CONNECTORS=new Map([["d'abord","first"],["premierement","first"],["ensuite","then"],["puis","then"],["apres","after"],["finalement","finally"],["pour finir","finally"],["avant","before"],["pendant","during"],["simultanement","simultaneous"],["en meme temps","simultaneous"]]);
function typeOf(lemma){for(const [k,set] of Object.entries(TYPES))if(set.has(lemma))return k;return "action_candidate";}
function analyze(input,languageAnalysis,grammarAnalysis){
 const source=String(input==null?"":input).normalize("NFKC").replace(/[’‘]/g,"'").replace(/\s+/g," ").trim();
 if(!languageAnalysis||languageAnalysis.source!==source||!languageAnalysis.structure||!grammarAnalysis||grammarAnalysis.source!==source||!grammarAnalysis.structure)
 return {engine:"IdeeVisionActionModel",version:VERSION,offline:true,source,ready:false,actions:[],issues:[{code:"matching_language_and_grammar_analyses_required"}],policy:{causalEffectsInferred:false,unstatedRolesInvented:false,physicsApplied:false}};
 const tokens=languageAnalysis.sentences.flatMap((s,si)=>s.tokens.map(t=>({...t,sentenceIndex:si})));
 const predicates=grammarAnalysis.structure.predicates;
 const actions=languageAnalysis.structure.actions.map((a,index)=>{
  const predicate=predicates.find(p=>p.sourceRange&&p.sourceRange.start===a.start&&p.sourceRange.end===a.end)||null;
  const lemma=fold(a.lemma||"");
  const preceding=tokens.filter(t=>t.sentenceIndex===a.sentenceIndex&&t.end<=a.start);
  const following=tokens.filter(t=>t.sentenceIndex===a.sentenceIndex&&t.start>=a.end);
  const negated=a.polarity==="negative"||(predicate&&predicate.negated);
  const explicitActor=predicate&&predicate.subject?{text:predicate.subject,status:predicate.subjectStatus,confidence:predicate.confidence}:null;
  const directObject=predicate&&predicate.directObject?{text:predicate.directObject,status:predicate.objectStatus,confidence:predicate.confidence}:null;
  const prepTokens=following.filter(t=>["a","à","de","dans","sur","sous","avec","vers","par","pour"].includes(fold(t.text)));
  const complementCandidates=prepTokens.map(p=>{
   const n=languageAnalysis.structure.objects.find(o=>o.sentenceIndex===a.sentenceIndex&&o.start>p.end);
   return {marker:p.text,object:n?n.text:null,status:n?"prepositional_complement_candidate":"unresolved",start:p.start,end:n?n.end:p.end};
  });
  const conditionMarkers=tokens.filter(t=>t.sentenceIndex===a.sentenceIndex&&["si","quand","lorsque","pendant","jusqu"].includes(fold(t.text))).map(t=>({marker:t.text,start:t.start,end:t.end,status:"condition_or_time_candidate"}));
  const modifiers=preceding.concat(following).filter(t=>t.sentenceIndex===a.sentenceIndex&&t.role==="negation").map(t=>({text:t.text,start:t.start,end:t.end}));
  return {id:"action-"+(index+1),verb:a.verb,lemma:a.lemma,type:typeOf(lemma),polarity:negated?"negative":"positive",tense:predicate?predicate.tense:"unresolved",actor:explicitActor||{text:null,status:"unresolved"},directObject:directObject||{text:null,status:"unresolved"},complementCandidates,conditionMarkers,modifiers,resultStateCandidate:RESULT.get(lemma)||null,resultStateStatus:RESULT.has(lemma)?"lexical_result_candidate":"not_specified",transitivity:TRANSITIVE.has(lemma)?"transitive_verb_candidate":"unresolved_or_intransitive_candidate",occurrence:{start:a.start,end:a.end,sentenceIndex:a.sentenceIndex},evidence:{start:a.start,end:a.end,text:a.verb},status:predicate?"roles_linked_as_grammatical_candidates":"verb_recognized_roles_unresolved"};
 });
 const ordered=actions.slice().sort((a,b)=>a.occurrence.start-b.occurrence.start);
 const sequence=ordered.map((a,i)=>{
  const between=i?source.slice(ordered[i-1].occurrence.end,a.occurrence.start):"";
  const markers=Array.from(CONNECTORS.entries()).filter(([m])=>fold(between).includes(m)).map(([marker,type])=>({marker,type}));
  return {actionId:a.id,index:i+1,orderStatus:i===0?"first_occurrence_in_text":markers.length?"explicit_sequence_marker":"textual_order_only",markers,previousActionId:i?ordered[i-1].id:null};
 });
 const issues=[];
 if(!actions.length)issues.push({code:"no_action_occurrence",severity:"warning"});
 if(actions.some(a=>a.actor.status==="unresolved"||a.directObject.status==="unresolved"))issues.push({code:"action_roles_unresolved_or_partial",severity:"information"});
 if(actions.some(a=>a.polarity==="negative"))issues.push({code:"negative_action_preserved_not_executed",severity:"information"});
 if(actions.some(a=>a.type==="action_candidate"))issues.push({code:"unknown_action_type",severity:"information"});
 return {engine:"IdeeVisionActionModel",version:VERSION,offline:true,source,ready:true,actions,sequence,issues,policy:{rolesRemainCandidates:true,negatedActionsAreNotExecutionOrders:true,causalEffectsInferred:false,unstatedRolesInvented:false,physicsApplied:false,sequenceMeansTextualOrderUnlessExplicitMarker:true}};
}
function diagnostics(){return {name:"Idée Vision — Représentation descriptive des actions",version:VERSION,offline:true,externalDependencies:[],capabilities:["occurrences d'actions","lemmes verbaux","catégories d'action candidates","polarité positive ou négative","temps grammatical disponible","acteur candidat issu de l'analyse grammaticale","objet direct candidat","compléments prépositionnels candidats","marqueurs de condition et de temps","modificateurs de négation","états résultants lexicaux candidats","transitivité candidate","preuves et positions textuelles","ordre des actions dans le texte","connecteurs explicites entre actions","plusieurs actions dans une phrase","actions dans plusieurs phrases","signalement des rôles inconnus","aucune causalité ou physique inventée"],limitations:["reconnaissance des verbes limitée au lexique actuel","rôles sujet et objet restent heuristiques","conditions et compléments incomplets","les marqueurs temporels ne prouvent pas toujours un ordre d'exécution","aucun effet physique n'est calculé","aucune action n'est réellement exécutée"]};}
const api=Object.freeze({version:VERSION,analyze,diagnostics});
root.IdeeVisionActionModel=api;if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
