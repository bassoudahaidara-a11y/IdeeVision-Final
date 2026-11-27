/* Idée Vision — Détection initiale des intentions v1 */
(function(root) {
"use strict";
const VERSION="0.1.0";
const RULES=[
["translation",/\b(traduis|traduire|traduction|comment dit[- ]on|en anglais|en français)\b/i],
["summary",/\b(résume|résumer|résumé|fais un résumé|synthétise)\b/i],
["comparison",/\b(compare|comparer|comparaison|différence entre|lequel est meilleur|avantages et inconvénients)\b/i],
["measurement",/\b(mesure|mesurer|calcule|calculer|combien vaut|quelle valeur|détermine la valeur)\b/i],
["simulation",/\b(simule|simuler|simulation|fais fonctionner virtuellement|visualise le mouvement)\b/i],
["creation",/\b(crée|créer|construis|construire|fabrique|fabriquer|invente|inventer|conçois|concevoir|dessine|dessiner|développe|développer|je veux construire|je veux créer)\b/i],
["modification",/\b(modifie|modifier|change|changer|améliore|améliorer|remplace|remplacer|ajoute|ajouter|corrige|corriger|mets à jour)\b/i],
["deletion",/\b(supprime|supprimer|efface|effacer|retire|retirer)\b/i],
["explanation",/\b(explique|expliquer|explique[- ]moi|pourquoi|comment fonctionne|qu'est[- ]ce qui fait|décris|décrire|apprends[- ]moi)\b/i],
["question",/[?？]|^\s*(qui|que|quoi|où|quand|combien|quel|quelle|quels|quelles|est[- ]ce que|comment)\b/i],
["planning",/\b(planifie|planifier|organise|organiser|prépare|préparer|établis un plan|programme les étapes|donne un emploi du temps)\b/i],
["instruction",/\b(fais|faites|donne|donnez|montre|montrez|indique|indiquez|écris|écrire|génère|générer|cherche|chercher|ouvre|ouvrir|lance|lancer|installe|installer)\b/i],
["description",/\b(voici|je décris|je te décris|il y a|on trouve|se compose de|est constitué de|est composée de)\b/i],
["verification",/\b(vérifie|vérifier|contrôle|contrôler|teste|tester|confirme|confirmer|est[- ]ce correct|est[- ]ce juste)\b/i]
];
const OUTPUTS=[["code",/\b(code|programme|script|python|javascript|java|kotlin)\b/i],["steps",/\b(étapes|étape par étape|procédure|méthode|démarche)\b/i],["list",/\b(liste|points|éléments|exemples)\b/i],["table",/\b(tableau|comparatif)\b/i],["drawing",/\b(dessin|schéma|croquis|plan technique)\b/i],["model",/\b(modèle|maquette|3d|2d|modélisation)\b/i],["explanation",/\b(explication|détails|raisonnement|démonstration)\b/i],["file",/\b(fichier|document|pdf|apk|application)\b/i]];
const CONSTRAINTS=[["offline",/\b(hors ligne|sans internet|sans connexion|déconnecté|offline)\b/i],["no_image",/\b(ne crée pas d'image|pas d'image|sans image|ne génère aucune image)\b/i],["no_compile",/\b(ne compile pas|sans compiler|ne pas compiler|pas d'apk)\b/i],["free",/\b(gratuit|gratuitement|sans payer|libre et gratuit)\b/i],["no_external_ai",/\b(sans api|sans modèle externe|sans moteur externe|pas de groq|pas de gemini)\b/i],["brevity",/\b(brièvement|court|en peu de mots|sans longue explication)\b/i],["detail",/\b(en détail|très détaillé|complet|approfondi)\b/i]];
const PRIORITIES=[["highest",/\b(priorité absolue|avant tout|en premier|prioritaire|d'abord)\b/i],["high",/\b(très important|essentiel|indispensable)\b/i],["low",/\b(si possible|facultatif|optionnel)\b/i]];
function normalize(v){return String(v==null?"":v).normalize("NFKC").replace(/[’‘]/g,"'").replace(/\s+/g," ").trim();}
function matches(text,patterns){const out=[];for(const [value,re] of patterns){const m=re.exec(text);if(m)out.push({value,evidence:m[0],start:m.index,end:m.index+m[0].length});}return out;}
function splitSentences(source){const out=[];const re=/[^.!?…]+(?:[.!?…]+|$)/gu;let m;while((m=re.exec(source))){const value=m[0].trim();if(value)out.push({text:value,start:m.index,end:m.index+m[0].length});}return out;}
function detectSentence(s){
const found=matches(s.text,RULES);
const intents=found.map(x=>({type:x.value,evidence:x.evidence,sourceRange:{start:s.start+x.start,end:s.start+x.end},status:"candidate"}));
const outputs=matches(s.text,OUTPUTS).map(x=>({type:x.value,evidence:x.evidence,sourceRange:{start:s.start+x.start,end:s.start+x.end}}));
const constraints=matches(s.text,CONSTRAINTS).map(x=>({type:x.value,evidence:x.evidence,sourceRange:{start:s.start+x.start,end:s.start+x.end}}));
const priorities=matches(s.text,PRIORITIES).map(x=>({level:x.value,evidence:x.evidence,sourceRange:{start:s.start+x.start,end:s.start+x.end}}));
const target=s.text.replace(/^\s*(s'il te plaît|svp|stp)[, ]*/i,"").replace(/\b(explique[- ]moi|explique|crée|construis|fabrique|compare|résume|traduis|simule|modifie|supprime|vérifie|calcule|mesure|montre|donne|écris|génère|cherche|je veux construire|je veux créer)\b/i,"").replace(/[?!.,;:]+$/g,"").trim();
const ambiguity=intents.length>1?[{code:"multiple_intents_in_same_sentence",candidates:intents.map(x=>x.type)}]:intents.length===0?[{code:"intent_not_recognized",candidates:[]}]:[];
return {text:s.text,intents,outputs,constraints,priorities,targetCandidate:target||null,ambiguity};
}
function analyze(input){
const source=normalize(input);
if(!source)return {engine:"IdeeVisionIntentUnderstanding",version:VERSION,offline:true,source,sentences:[],intents:[],constraints:[],outputs:[],issues:[{code:"empty_request",severity:"blocking"}],policy:{intentIsCandidate:true,unstatedGoalInvented:false,physicsApplied:false}};
const sentences=splitSentences(source).map(detectSentence);
const intents=sentences.flatMap((s,sentenceIndex)=>s.intents.map(x=>({...x,sentenceIndex})));
const constraints=sentences.flatMap((s,sentenceIndex)=>s.constraints.map(x=>({...x,sentenceIndex})));
const outputs=sentences.flatMap((s,sentenceIndex)=>s.outputs.map(x=>({...x,sentenceIndex})));
const issues=[];
if(!intents.length)issues.push({code:"intent_not_recognized",severity:"warning"});
if(sentences.some(s=>s.ambiguity.some(a=>a.code==="multiple_intents_in_same_sentence")))issues.push({code:"multiple_intents_need_ordering",severity:"information"});
if(sentences.some(s=>s.ambiguity.some(a=>a.code==="intent_not_recognized")))issues.push({code:"some_sentences_have_no_detected_intent",severity:"information"});
return {engine:"IdeeVisionIntentUnderstanding",version:VERSION,offline:true,source,sentences,intents,constraints,outputs,primaryIntent:intents.length===1?intents[0].type:null,targetCandidates:sentences.map((s,i)=>({sentenceIndex:i,value:s.targetCandidate})).filter(x=>x.value),issues,policy:{intentIsCandidate:true,unstatedGoalInvented:false,explicitConstraintsPreserved:true,physicsApplied:false}};
}
function diagnostics(){return {name:"Idée Vision — Compréhension initiale des intentions",version:VERSION,offline:true,externalDependencies:[],capabilities:["question","instruction","description","explanation","comparison","creation","modification","deletion","simulation","measurement","translation","summary","planning","verification","formats de sortie","contraintes explicites","priorités explicites","intentions multiples signalées","indices textuels et positions conservés"],limitations:["règles lexicales initiales et couverture limitée","une expression peut correspondre à plusieurs intentions","cible de la demande encore candidate","ordre complexe des sous-tâches à approfondir","intentions implicites non résolues","aucune simulation physique"]};}
const api=Object.freeze({version:VERSION,normalize,splitSentences,analyze,diagnostics});root.IdeeVisionIntentUnderstanding=api;if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
