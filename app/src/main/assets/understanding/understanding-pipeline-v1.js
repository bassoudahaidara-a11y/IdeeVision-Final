/* Idée Vision — Pipeline local de compréhension v1 */
(function(root){
"use strict";
const VERSION="1.0.0";
function analyze(input){
 const source=String(input==null?"":input).normalize("NFKC").replace(/[’‘]/g,"'").replace(/\s+/g," ").trim();
 if(!source)return {engine:"IdeeVisionUnderstandingPipeline",version:VERSION,offline:true,source,ready:false,stages:{},issues:[{code:"empty_request"}],policy:{physicsApplied:false,externalAIUsed:false}};
 const F=root.IdeeVisionFrenchUnderstanding,G=root.IdeeVisionFrenchGrammarSemantics,I=root.IdeeVisionIntentUnderstanding;
 const missing=[];
 if(!F)missing.push("french_foundation");
 if(!G)missing.push("french_grammar");
 if(!I)missing.push("intent_understanding");
 if(missing.length)return {engine:"IdeeVisionUnderstandingPipeline",version:VERSION,offline:true,source,ready:false,stages:{},issues:missing.map(code=>({code})),policy:{physicsApplied:false,externalAIUsed:false}};
 const language=F.analyze(source);
 const grammar=G.analyze(source);
 const intention=I.analyzeWithContext(source,language,grammar);
 const objects=language.structure.objects.map(x=>({text:x.text,lemma:x.lemma,status:x.status,properties:x.properties||[],start:x.start,end:x.end}));
 const actions=language.structure.actions.map(x=>({text:x.text,lemma:x.lemma,polarity:x.polarity,status:x.status,start:x.start,end:x.end}));
 const relations=language.structure.relations.map(x=>({type:x.type,evidence:x.evidence||x.text||"",status:x.status||"candidate",start:x.start,end:x.end}));
 const quantities=language.structure.quantities.map(x=>({...x}));
 return {
  engine:"IdeeVisionUnderstandingPipeline",version:VERSION,offline:true,source,ready:true,
  stages:{language:{version:F.version,objectCount:objects.length,actionCount:actions.length,relationCount:relations.length,quantityCount:quantities.length,issues:language.issues},grammar:{version:G.version,predicateCount:grammar.structure.predicates.length,pronounCount:grammar.structure.pronouns.length,issues:grammar.issues},intent:{version:I.version,intentCount:intention.intents.length,primaryIntent:intention.primaryIntent,constraints:intention.constraints,outputs:intention.outputs,sequence:intention.sequence,issues:intention.issues,contextIntegration:intention.contextIntegration}},
  representation:{objects,actions,relations,quantities,nounPhrases:grammar.structure.nounPhrases,predicates:grammar.structure.predicates,pronouns:grammar.structure.pronouns,intents:intention.intents},
  issues:[...language.issues,...grammar.issues,...intention.issues],
  promptContext:JSON.stringify({objects,actions,relations,quantities,nounPhrases:grammar.structure.nounPhrases,predicates:grammar.structure.predicates,pronouns:grammar.structure.pronouns,intents:intention.intents,constraints:intention.constraints,outputs:intention.outputs,sequence:intention.sequence}),
  policy:{physicsApplied:false,externalAIUsed:false,unstatedFactsInvented:false,uncertainInterpretationsRemainCandidates:true}
 };
}
function diagnostics(){return {name:"Pipeline local de compréhension Idée Vision",version:VERSION,offline:true,externalDependencies:[],stages:["fondations françaises","analyse grammaticale et sémantique","compréhension des intentions"],limitations:["vocabulaire et grammaire encore incomplets","analyse heuristique","aucune déduction physique","ne constitue pas encore une intelligence générale"]};}
const api=Object.freeze({version:VERSION,analyze,diagnostics});
root.IdeeVisionUnderstandingPipeline=api;
if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
