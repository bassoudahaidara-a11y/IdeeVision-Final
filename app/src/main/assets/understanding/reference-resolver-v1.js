/* Idée Vision — Résolution prudente des références v1 */
(function(root){
"use strict";
const VERSION="1.0.0";
const fold=s=>String(s||"").toLocaleLowerCase("fr-FR").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[’‘]/g,"'");
const PRONOUNS=new Map([
 ["il",{gender:"m",number:"singular",role:"subject"}],["elle",{gender:"f",number:"singular",role:"subject"}],
 ["ils",{gender:"m",number:"plural",role:"subject"}],["elles",{gender:"f",number:"plural",role:"subject"}],
 ["lui",{gender:null,number:"singular",role:"indirect_object"}],["leur",{gender:null,number:"plural",role:"indirect_object"}],
 ["la",{gender:"f",number:"singular",role:"direct_object"}],["le",{gender:"m",number:"singular",role:"direct_object"}],
 ["les",{gender:null,number:"plural",role:"direct_object"}],["en",{gender:null,number:null,role:"partitive_or_prepositional"}],
 ["y",{gender:null,number:null,role:"locative_or_indirect"}],["cela",{gender:"n",number:"singular",role:"demonstrative"}],
 ["ça",{gender:"n",number:"singular",role:"demonstrative"}]
]);
const PLURAL=new Set(["les","des","ces","mes","tes","ses","nos","vos","leurs","plusieurs","quelques","tous","toutes"]);
const FEMININE=new Set(["la","une","cette","ma","ta","sa"]);
const MASCULINE=new Set(["le","un","ce","cet","mon","ton","son"]);
function analyze(input,grammarAnalysis,objectModel){
 const source=String(input==null?"":input).normalize("NFKC").replace(/[’‘]/g,"'").replace(/\s+/g," ").trim();
 if(!grammarAnalysis||grammarAnalysis.source!==source||!grammarAnalysis.structure||!objectModel||objectModel.source!==source||objectModel.ready===false)
 return {engine:"IdeeVisionReferenceResolver",version:VERSION,offline:true,source,ready:false,mentions:[],references:[],issues:[{code:"matching_grammar_and_object_models_required"}],policy:{ambiguousReferencesRemainUnresolved:true,identityInvented:false}};
 const nps=grammarAnalysis.structure.nounPhrases||[];
 const sentenceStarts=[];let sentenceMatch;const sentenceRe=/[^.!?…]+(?:[.!?…]+|$)/gu;
 while((sentenceMatch=sentenceRe.exec(source))){const value=sentenceMatch[0].trim();if(value)sentenceStarts.push(sentenceMatch.index+sentenceMatch[0].indexOf(value));}
 const mentions=objectModel.objects.map(o=>{
  const occ=o.occurrences[0]||o.evidence,sentenceIndex=occ.sentenceIndex||0,base=sentenceStarts[sentenceIndex]||0;
  const np=nps.find(n=>n.headStart===occ.start && (grammarAnalysis.sentences[sentenceIndex]||{}).nounPhrases.some(x=>x.headStart===n.headStart))||null;
  const det=np?fold(np.determiner):"";
  const gender=np&&np.expectedGender?np.expectedGender:(FEMININE.has(det)?"f":MASCULINE.has(det)?"m":null);
  const number=PLURAL.has(det)?"plural":"singular";
  return {id:o.id,text:o.name,lemma:o.lemma||null,start:base+occ.start,end:base+occ.end,gender,number,sentenceIndex,determiner:np?np.determiner:null,sourceStatus:o.status};
 });
 const candidates=[];
 for(let si=0;si<grammarAnalysis.sentences.length;si++){
  const base=sentenceStarts[si]||0,sent=grammarAnalysis.sentences[si];
  for(const p of sent.pronouns||[]){const key=fold(p.text),spec=PRONOUNS.get(key);if(spec)candidates.push({text:p.text,start:base+p.start,end:base+(p.end||p.start+p.text.length),sentenceIndex:si,spec,origin:"grammar_pronoun"});}
  const tokens=sent.tokens||[];
  for(let i=0;i<tokens.length;i++){
   const t=tokens[i],key=fold(t.text);
   if(!["la","le","les","lui","leur","en","y","l'"].includes(key))continue;
   const next=tokens.slice(i+1,i+3).find(x=>x.tag==="verb_candidate");if(!next)continue;
   if(candidates.some(p=>p.start===base+t.start))continue;
   const spec=PRONOUNS.get(key)||{gender:null,number:null,role:"direct_object"};
   candidates.push({text:t.text,start:base+t.start,end:base+t.end,sentenceIndex:si,spec,origin:"clitic_candidate"});
  }
 }
 candidates.sort((a,b)=>a.start-b.start);
 const references=candidates.map((p,index)=>{
  const eligible=mentions.filter(m=>m.end<=p.start);
  const scored=eligible.map(m=>{
   let score=0,checks=[];
   if(p.spec.gender){if(m.gender===p.spec.gender){score+=5;checks.push("gender_match");}else if(m.gender&&m.gender!==p.spec.gender){score-=8;checks.push("gender_mismatch");}}
   if(p.spec.number){if(m.number===p.spec.number){score+=3;checks.push("number_match");}else{score-=6;checks.push("number_mismatch");}}
   const distance=p.start-m.end;
   score+=Math.max(0,4-Math.floor(distance/45));
   if(m.sentenceIndex===tokens.find(t=>t.start===p.start)?.sentenceIndex)score+=1;
   return {mentionId:m.id,text:m.text,score,checks,distance};
  }).filter(x=>x.score>=0).sort((a,b)=>b.score-a.score||a.distance-b.distance);
  const best=scored[0]||null,second=scored[1]||null;
  const unique=!!best&&(!second||best.score>second.score);
  return {id:"reference-"+(index+1),text:p.text,role:p.spec.role,origin:p.origin,start:p.start,end:p.end,candidateMentionIds:scored.map(x=>x.mentionId),candidateScores:scored,status:unique?"resolved_candidate":best?"ambiguous":"unresolved",resolvedMentionId:unique?best.mentionId:null,evidence:{start:p.start,end:p.end,text:source.slice(p.start,p.end)},policy:"linguistic_candidate_only"};
 });
 const issues=[];
 if(!references.length)issues.push({code:"no_reference_expression_detected",severity:"information"});
 if(references.some(r=>r.status==="ambiguous"))issues.push({code:"ambiguous_references_preserved",severity:"warning"});
 if(references.some(r=>r.status==="unresolved"))issues.push({code:"unresolved_references_preserved",severity:"information"});
 return {engine:"IdeeVisionReferenceResolver",version:VERSION,offline:true,source,ready:true,mentions,references,issues,policy:{ambiguousReferencesRemainUnresolved:true,identityInvented:false,onlyPriorMentionsConsidered:true,genderAndNumberAreHeuristics:true,physicalPropertiesTransferred:false,physicsApplied:false}};
}
function diagnostics(){return {name:"Idée Vision — Résolution prudente des références",version:VERSION,offline:true,externalDependencies:[],capabilities:["inventaire des mentions d'objets","positions des mentions","repérage de pronoms sujets","repérage de clitiques objets devant un verbe","candidats antérieurs uniquement","compatibilité grammaticale de genre","compatibilité grammaticale de nombre","classement par proximité textuelle","identifiant de mention candidat","plusieurs candidats conservés","ambiguïtés non forcées","références sans antécédent conservées","indices et preuves textuelles","sortie JSON stable","aucun transfert de propriété physique"],limitations:["analyse heuristique et non résolution linguistique complète","genre et nombre inconnus pour de nombreux noms","clitiques et pronoms complexes incomplets","la proximité textuelle ne prouve pas l'identité","les références interphrases peuvent rester ambiguës","aucune propriété n'est transférée automatiquement"]};}
const api=Object.freeze({version:VERSION,analyze,diagnostics});
root.IdeeVisionReferenceResolver=api;if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
