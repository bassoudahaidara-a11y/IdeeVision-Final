/* Idée Vision — Compréhension initiale des intentions v0.3 */
(function(root) {
"use strict";
const VERSION="0.3.0";
const RULES=[
["translation",/\b(traduis|traduire|traduction|comment dit[- ]on|en anglais|en français)\b/i],
["summary",/\b(résume|résumer|résumé|synthétise)\b/i],
["comparison",/\b(compare|comparer|comparaison|différence entre|lequel est meilleur|avantages et inconvénients)\b/i],
["measurement",/\b(mesure|mesurer|calcule|calculer|combien vaut|quelle valeur|détermine la valeur)\b/i],
["simulation",/\b(simule|simuler|simulation|fais fonctionner virtuellement|visualise le mouvement)\b/i],
["creation",/\b(crée|créer|construis|construire|fabrique|fabriquer|invente|inventer|conçois|concevoir|dessine|dessiner|développe|développer)\b/i],
["modification",/\b(modifie|modifier|change|changer|améliore|améliorer|remplace|remplacer|ajoute|ajouter|corrige|corriger|mets à jour)\b/i],
["deletion",/\b(supprime|supprimer|efface|effacer|retire|retirer)\b/i],
["explanation",/\b(explique|expliquer|explique[- ]moi|pourquoi|comment fonctionne|qu'est[- ]ce qui fait|décris|décrire|apprends[- ]moi)\b/i],
["question",/[?？]|^\s*(qui|que|quoi|où|quand|combien|quel|quelle|quels|quelles|est[- ]ce que|comment)\b/i],
["planning",/\b(planifie|planifier|organise|organiser|prépare|préparer|établis un plan|programme les étapes|donne un emploi du temps)\b/i],
["instruction",/\b(fais|faites|donne|donnez|montre|montrez|indique|indiquez|écris|écrire|génère|générer|cherche|chercher|ouvre|ouvrir|lance|lancer|installe|installer)\b/i],
["description",/\b(voici|je décris|je te décris|il y a|on trouve|se compose de|est constitué de|est composée de)\b/i],
["verification",/\b(vérifie|vérifier|contrôle|contrôler|teste|tester|confirme|confirmer|est[- ]ce correct|est[- ]ce juste)\b/i],
["construction",/\b(compile|compiler|compilation|assemble|assembler)\b/i]
];
const OUTPUTS=[
["code",/\b(code|programme|script|python|javascript|java|kotlin)\b/i],
["steps",/(?:^|\s)(étapes|étape par étape|procédure|méthode|démarche)(?:\b|$)/i],
["list",/(?:^|\s)(liste|points|éléments|exemples)(?:\b|$)/i],
["table",/\b(tableau|comparatif)\b/i],["drawing",/\b(dessin|schéma|croquis|plan technique)\b/i],
["model",/\b(modèle|maquette|3d|2d|modélisation)\b/i],
["explanation",/\b(explication|détails|raisonnement|démonstration)\b/i],
["file",/\b(fichier|document|pdf|apk|application)\b/i]
];
const CONSTRAINTS=[
["offline",/\b(hors ligne|sans internet|sans connexion|déconnecté|offline)\b/i],
["no_image",/\b(ne crée pas d'image|pas d'image|sans image|ne génère aucune image)\b/i],
["no_compile",/\b(ne compile pas|sans compiler|ne pas compiler|pas d'apk)\b/i],
["free",/\b(gratuit|gratuitement|sans payer|libre et gratuit)\b/i],
["no_external_ai",/\b(sans api|sans modèle externe|sans moteur externe|pas de groq|pas de gemini)\b/i],
["brevity",/\b(brièvement|court|en peu de mots|sans longue explication)\b/i],
["detail",/\b(en détail|très détaillé|complet|approfondi)\b/i]
];
const PRIORITIES=[
["highest",/\b(priorité absolue|avant tout|en premier|prioritaire|d'abord)\b/i],
["high",/\b(très important|essentiel|indispensable)\b/i],
["low",/\b(si possible|facultatif|optionnel)\b/i]
];
const SEQUENCE_MARKERS=[
["first",/\b(d'abord|premièrement|en premier)\b/i],
["next",/\b(ensuite|puis|après)\b/i],
["finally",/\b(finalement|pour finir|en dernier)\b/i],
["before",/\b(avant)\b/i]
];
function normalize(v){return String(v==null?"":v).normalize("NFKC").replace(/[’‘]/g,"'").replace(/\s+/g," ").trim();}
function matchesAll(text,patterns){
const out=[];
for(const [value,re] of patterns){
const scan=new RegExp(re.source,re.flags.includes("g")?re.flags:re.flags+"g");
let m;
while((m=scan.exec(text))){out.push({value,evidence:m[0],start:m.index,end:m.index+m[0].length});if(!m[0].length)scan.lastIndex++;}
}
return out.sort((a,b)=>a.start-b.start);
}
function splitSentences(source){
const out=[],re=/[^.!?…]+(?:[.!?…]+|$)/gu;let m;
while((m=re.exec(source))){
const leading=(m[0].match(/^\s*/u)||[""])[0].length,value=m[0].trim();
if(value){const start=m.index+leading;out.push({text:value,start,end:start+value.length});}
}
return out;
}
function isNegated(text,x){
const before=text.slice(Math.max(0,x.start-24),x.start),after=text.slice(x.end,Math.min(text.length,x.end+18));
return /\bne\s*(?:pas\s+)?$/iu.test(before)||/^\s*(?:pas|plus|jamais)\b/iu.test(after);
}
function detectSentence(s){
const intents=matchesAll(s.text,RULES).map(x=>{
const negative=isNegated(s.text,x);
return {type:x.value,evidence:x.evidence,sourceRange:{start:s.start+x.start,end:s.start+x.end},polarity:negative?"negative":"positive",status:negative?"negated_or_prohibited_candidate":"candidate"};
});
const outputs=matchesAll(s.text,OUTPUTS).map(x=>({type:x.value,evidence:x.evidence,sourceRange:{start:s.start+x.start,end:s.start+x.end}}));
const constraints=matchesAll(s.text,CONSTRAINTS).map(x=>({type:x.value,evidence:x.evidence,sourceRange:{start:s.start+x.start,end:s.start+x.end}}));
const priorities=matchesAll(s.text,PRIORITIES).map(x=>({level:x.value,evidence:x.evidence,sourceRange:{start:s.start+x.start,end:s.start+x.end}}));
const sequence=matchesAll(s.text,SEQUENCE_MARKERS).map(x=>({order:x.value,evidence:x.evidence,sourceRange:{start:s.start+x.start,end:s.start+x.end}}));
const target=s.text.replace(/^\s*(s'il te plaît|svp|stp)[, ]*/i,"").replace(/\b(explique[- ]moi|explique|crée|créer|construis|construire|fabrique|compare|résume|traduis|simule|modifie|supprime|vérifie|calcule|mesure|montre|donne|écris|génère|cherche|compile|assembler)\b/i,"").replace(/[?!.,;:]+$/g,"").trim();
const ambiguity=intents.length>1?[{code:"multiple_intents_in_same_sentence",candidates:intents.map(x=>x.type)}]:intents.length===0?[{code:"intent_not_recognized",candidates:[]}]:[];
return {text:s.text,start:s.start,end:s.end,intents,outputs,constraints,priorities,sequence,targetCandidate:target||null,ambiguity};
}
function analyze(input){
const source=normalize(input);
if(!source)return {engine:"IdeeVisionIntentUnderstanding",version:VERSION,offline:true,source,sentences:[],intents:[],constraints:[],outputs:[],issues:[{code:"empty_request",severity:"blocking"}],policy:{intentIsCandidate:true,unstatedGoalInvented:false,physicsApplied:false}};
const sentences=splitSentences(source).map(detectSentence);
const flatten=(key)=>sentences.flatMap((s,sentenceIndex)=>s[key].map(x=>({...x,sentenceIndex})));
const intents=flatten("intents"),constraints=flatten("constraints"),outputs=flatten("outputs"),sequence=flatten("sequence");
const issues=[];
if(!intents.length)issues.push({code:"intent_not_recognized",severity:"warning"});
if(intents.some(x=>x.polarity==="negative"))issues.push({code:"negated_intent_detected",severity:"information"});
if(sentences.some(s=>s.ambiguity.some(a=>a.code==="multiple_intents_in_same_sentence")))issues.push({code:"multiple_intents_need_ordering",severity:"information"});
if(sentences.some(s=>s.ambiguity.some(a=>a.code==="intent_not_recognized")))issues.push({code:"some_sentences_have_no_detected_intent",severity:"information"});
return {engine:"IdeeVisionIntentUnderstanding",version:VERSION,offline:true,source,sentences,intents,constraints,outputs,sequence,primaryIntent:intents.length===1&&intents[0].polarity==="positive"?intents[0].type:null,targetCandidates:sentences.map((s,i)=>({sentenceIndex:i,value:s.targetCandidate})).filter(x=>x.value),issues,policy:{intentIsCandidate:true,unstatedGoalInvented:false,explicitConstraintsPreserved:true,physicsApplied:false}};
}
function analyzeWithContext(input,languageAnalysis,grammarAnalysis){
const base=analyze(input),source=base.source;
const valid=x=>!!x&&typeof x==="object"&&normalize(x.source||"")===source;
const languageValid=valid(languageAnalysis),grammarValid=valid(grammarAnalysis);
return {...base,contextIntegration:{
status:languageValid&&grammarValid?"linked":languageValid?"language_only":grammarValid?"grammar_only":"context_missing_or_source_mismatch",
language:{provided:!!languageAnalysis,sourceMatches:languageValid,objectCount:languageValid&&languageAnalysis.structure&&Array.isArray(languageAnalysis.structure.objects)?languageAnalysis.structure.objects.length:null},
grammar:{provided:!!grammarAnalysis,sourceMatches:grammarValid,predicateCount:grammarValid&&grammarAnalysis.structure&&Array.isArray(grammarAnalysis.structure.predicates)?grammarAnalysis.structure.predicates.length:null},
policy:"Les analyses linguistiques sont jointes comme contexte ; elles ne changent pas les intentions détectées et ne déclenchent aucun raisonnement physique."
}};
}
function diagnostics(){return {name:"Idée Vision — Compréhension initiale des intentions",version:VERSION,offline:true,externalDependencies:[],capabilities:["questions et instructions","descriptions et explications","création, modification et suppression","comparaison, mesure et simulation demandée","traduction, résumé, planification et vérification","construction et compilation","formats de sortie","contraintes et priorités","polaritė négative et ordre explicite","raccordement contrôlé aux analyses linguistiques"],limitations:["règles lexicales et couverture française encore limitées","intentions implicites non résolues","ambiguïtés complexes non résolues","cibles encore candidates","ordre des tâches seulement extrait à partir de marqueurs explicites","aucun raisonnement physique"]};}
const api=Object.freeze({version:VERSION,normalize,splitSentences,analyze,analyzeWithContext,diagnostics});
root.IdeeVisionIntentUnderstanding=api;
if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
