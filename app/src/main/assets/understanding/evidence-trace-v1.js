/* Idée Vision — Traçabilité des preuves et de leur provenance v1 */
(function(root){"use strict";
const VERSION="1.0.0";
function analyze(input,registry,grammar){
 const source=String(input||"").normalize("NFKC").replace(/[’‘]/g,"'").replace(/\s+/g," ").trim();
 const out={engine:"IdeeVisionEvidenceTrace",version:VERSION,offline:true,source,ready:false,records:[],byOrigin:{user_text:[],hypothesis:[],conditional:[],derived_candidate:[],unknown:[],question:[]},issues:[],policy:{textualEvidenceIsNotExternalProof:true,provenanceMustBePreserved:true,missingEvidenceMustNotBeInvented:true,derivedClaimsRemainCandidates:true}};
 if(!registry||registry.source!==source||!Array.isArray(registry.items)){out.issues.push({code:"matching_knowledge_registry_required"});return out;}
 if(grammar&&(grammar.source!==source||!Array.isArray(grammar.sentences))){out.issues.push({code:"matching_grammar_required"});return out;}
 out.ready=true;
 const sentenceTexts=grammar?grammar.sentences.map(s=>String(s.text||"")):[];
 registry.items.forEach((item,index)=>{
  const type=item.type||"statement";
  let origin="user_text",status="unverified_textual_claim";
  if(type==="assumption"){origin="hypothesis";status="assumption_not_fact";}
  else if(type==="conditional_statement"||type==="conditional_rule"){origin="conditional";status="condition_not_verified";}
  else if(type==="inference_candidate"){origin="derived_candidate";status="candidate_requires_validation";}
  else if(type==="unknown"){origin="unknown";status="unknown_not_filled";}
  else if(type==="question"){origin="question";status="question_not_answered";}
  const evidence=String(item.evidence||item.text||"");
  const sentenceIndex=Number.isInteger(item.sentenceIndex)?item.sentenceIndex:null;
  const sentence=sentenceIndex!==null?sentenceTexts[sentenceIndex]||null:null;
  const rec={id:"evidence-"+(index+1),knowledgeItemId:item.id||null,origin,status,claimType:type,text:String(item.text||""),evidence,sentenceIndex,sourceSentence:sentence,evidencePresent:evidence.length>0,externalVerification:"not_performed",supportingEvidenceIds:[],limitations:["source text is not proof of real-world truth","no external source was consulted","independent scientific verification may be required"]};
  out.records.push(rec);if(out.byOrigin[origin])out.byOrigin[origin].push(rec.id);
 });
 out.metrics={recordCount:out.records.length,evidencePresentCount:out.records.filter(r=>r.evidencePresent).length,unverifiedCount:out.records.filter(r=>r.externalVerification==="not_performed").length,hypothesisCount:out.byOrigin.hypothesis.length,derivedCandidateCount:out.byOrigin.derived_candidate.length,unknownCount:out.byOrigin.unknown.length};
 if(!out.records.length)out.issues.push({code:"no_knowledge_items_to_trace",severity:"information"});
 return out;
}
function diagnostics(){return {name:"Idée Vision — Traçabilité des preuves",version:VERSION,offline:true,externalDependencies:[],capabilities:["traçabilité par élément de connaissance","identifiant de provenance","conservation de la preuve textuelle","raccord à l'identifiant de connaissance","raccord à la phrase source","distinction texte utilisateur","distinction hypothèse","distinction condition","distinction déduction candidate","distinction inconnue","distinction question","statut de vérification explicite","preuve absente signalée","aucune preuve inventée","aucune source externe simulée","index par origine","métriques de traçabilité","détection de registre incompatible","détection de grammaire incompatible","sortie JSON stable"],limitations:["ne vérifie pas les sources externes","ne prouve pas la vérité d'une phrase","hérite des limites du registre lexical","les liens de soutien ne sont pas encore établis automatiquement"]};}
const api=Object.freeze({version:VERSION,analyze,diagnostics});root.IdeeVisionEvidenceTrace=api;if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
