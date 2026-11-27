/* Idée Vision — Pipeline local de compréhension v1 */
(function(root){
"use strict";
const VERSION="1.0.0";
function analyze(input){
 const source=String(input==null?"":input).normalize("NFKC").replace(/[’‘]/g,"'").replace(/\s+/g," ").trim();
 if(!source)return {engine:"IdeeVisionUnderstandingPipeline",version:VERSION,offline:true,source,ready:false,stages:{},issues:[{code:"empty_request"}],policy:{physicsApplied:false,externalAIUsed:false}};
 const V=root.IdeeVisionVectorMatrixModel,Z=root.IdeeVisionAlgebraicStructures,X=root.IdeeVisionMathExpressionModel,U=root.IdeeVisionQuantityModel,S=root.IdeeVisionSpatialModel,T=root.IdeeVisionTimeModel,E=root.IdeeVisionEvidenceTrace,K=root.IdeeVisionKnowledgeRegistry,F=root.IdeeVisionFrenchUnderstanding,G=root.IdeeVisionFrenchGrammarSemantics,I=root.IdeeVisionIntentUnderstanding,O=root.IdeeVisionObjectModel,A=root.IdeeVisionActionModel,R=root.IdeeVisionRelationGraph,Q=root.IdeeVisionReferenceResolver,C=root.IdeeVisionComplexClauseAnalyzer,L=root.IdeeVisionLogicalReasoner,M=root.IdeeVisionReasoningChains;
 const missing=[];
 if(!F)missing.push("french_foundation");
 if(!G)missing.push("french_grammar");
 if(!I)missing.push("intent_understanding");
 if(!O)missing.push("object_model");
 if(!A)missing.push("action_model");
 if(!R)missing.push("relation_graph");
 if(!Q)missing.push("reference_resolver");
 if(!C)missing.push("complex_clause_analyzer");
 if(!L)missing.push("logical_reasoner");
 if(!M)missing.push("reasoning_chain_engine");
 if(!K)missing.push("knowledge_registry");
 if(!E)missing.push("evidence_trace");
 if(!T)missing.push("time_model");
 if(!S)missing.push("spatial_model");
 if(!U)missing.push("quantity_model");
 if(!X)missing.push("math_expression_model");
 if(!Z)missing.push("algebraic_structures");
 if(!V)missing.push("vector_matrix_model");
 
 if(missing.length)return {engine:"IdeeVisionUnderstandingPipeline",version:VERSION,offline:true,source,ready:false,stages:{},issues:missing.map(code=>({code})),policy:{physicsApplied:false,externalAIUsed:false}};
 const language=F.analyze(source);
 const grammar=G.analyze(source);
 const intention=I.analyzeWithContext(source,language,grammar);
 const objectModel=O.analyze(source,language);
 const actionModel=A.analyze(source,language,grammar);
 const relationGraph=R.analyze(source,language,objectModel,actionModel);
 const referenceResolution=Q.analyze(source,grammar,objectModel);
 const complexClauses=C.analyze(source,grammar);
 const logicalReasoning=L.analyze(source,grammar,complexClauses);
 const reasoningChains=M.analyze(source,logicalReasoning);
 const knowledgeRegistry=K.analyze(source,grammar,logicalReasoning,reasoningChains);
 const evidenceTrace=E.analyze(source,knowledgeRegistry,grammar);
 const timeModel=T.analyze(source,grammar,actionModel);
 const spatialModel=S.analyze(source,grammar,objectModel,relationGraph);
 const quantityModel=U.analyze(source,language,objectModel);
 const mathExpressions=X.analyze(source);
 const algebraicStructures=Z.analyze(String(input==null?"":input),X);
 const vectorMatrixModel=V.analyze(String(input==null?"":input));
 const objects=language.structure.objects.map(x=>({text:x.text,lemma:x.lemma,status:x.status,properties:x.properties||[],start:x.start,end:x.end}));
 const actions=language.structure.actions.map(x=>({text:x.text,lemma:x.lemma,polarity:x.polarity,status:x.status,start:x.start,end:x.end}));
 const relations=language.structure.relations.map(x=>({type:x.type,evidence:x.evidence||x.text||"",status:x.status||"candidate",start:x.start,end:x.end}));
 const quantities=language.structure.quantities.map(x=>({...x}));
 return {
  engine:"IdeeVisionUnderstandingPipeline",version:VERSION,offline:true,source,ready:true,
  stages:{vectorMatrixModel:{version:V.version,vectorCount:vectorMatrixModel.metrics.vectorCount,matrixCount:vectorMatrixModel.metrics.matrixCount,operationCount:vectorMatrixModel.metrics.operationCount,issues:vectorMatrixModel.issues},algebraicStructures:{version:Z.version,relationCount:algebraicStructures.metrics.relationCount,equationCount:algebraicStructures.metrics.equationCount,inequalityCount:algebraicStructures.metrics.inequalityCount,systemCandidate:!!algebraicStructures.system,issues:algebraicStructures.issues},mathExpressions:{version:X.version,expressionCount:mathExpressions.kind==="unparsed"?0:1,variableCount:mathExpressions.variables.length,functionCount:mathExpressions.functions.length,issues:mathExpressions.issues},quantityModel:{version:U.version,quantityCount:quantityModel.quantities.length,rangeCount:quantityModel.ranges.length,comparisonCount:quantityModel.comparisons.length,issues:quantityModel.issues},spatialModel:{version:S.version,objectCount:spatialModel.objects.length,relationCount:spatialModel.relations.length,coordinateGroupCount:spatialModel.coordinates.length,issues:spatialModel.issues},timeModel:{version:T.version,eventCount:timeModel.events.length,markerCount:timeModel.markers.length,durationCount:timeModel.durations.length,dateCount:timeModel.dates.length,issues:timeModel.issues},evidenceTrace:{version:E.version,recordCount:evidenceTrace.records.length,unverifiedCount:evidenceTrace.metrics.unverifiedCount,issues:evidenceTrace.issues},knowledgeRegistry:{version:K.version,itemCount:knowledgeRegistry.items.length,assumptionCount:knowledgeRegistry.assumptions.length,unknownCount:knowledgeRegistry.unknowns.length,issues:knowledgeRegistry.issues},reasoningChains:{version:M.version,chainCount:reasoningChains.chains.length,linkCount:reasoningChains.links.length,longestChain:reasoningChains.metrics.longestChain,issues:reasoningChains.issues},logicalReasoning:{version:L.version,ruleCount:logicalReasoning.rules.length,atomCount:logicalReasoning.atoms.length,contradictionCount:logicalReasoning.contradictions.length,issues:logicalReasoning.issues},complexClauses:{version:C.version,clauseCount:complexClauses.clauses.length,linkCount:complexClauses.links.length,issues:complexClauses.issues},references:{version:Q.version,mentionCount:referenceResolution.mentions.length,referenceCount:referenceResolution.references.length,issues:referenceResolution.issues},relations:{version:R.version,nodeCount:relationGraph.nodes.length,edgeCount:relationGraph.edges.length,issues:relationGraph.issues},actions:{version:A.version,actionCount:actionModel.actions.length,sequenceCount:actionModel.sequence.length,issues:actionModel.issues},objects:{version:O.version,objectCount:objectModel.objects.length,issues:objectModel.issues},language:{version:F.version,objectCount:objects.length,actionCount:actions.length,relationCount:relations.length,quantityCount:quantities.length,issues:language.issues},grammar:{version:G.version,predicateCount:grammar.structure.predicates.length,pronounCount:grammar.structure.pronouns.length,issues:grammar.issues},intent:{version:I.version,intentCount:intention.intents.length,primaryIntent:intention.primaryIntent,constraints:intention.constraints,outputs:intention.outputs,sequence:intention.sequence,issues:intention.issues,contextIntegration:intention.contextIntegration}},
  representation:{vectorMatrixModel,algebraicStructures,mathExpressions,quantityModel,spatialModel,timeModel,evidenceTrace,knowledgeRegistry,objects,objectModels:objectModel.objects,actionModels:actionModel.actions,actionSequence:actionModel.sequence,relationGraph,referenceResolution,complexClauses,logicalReasoning,reasoningChains,actions,relations,quantities,nounPhrases:grammar.structure.nounPhrases,predicates:grammar.structure.predicates,pronouns:grammar.structure.pronouns,intents:intention.intents},
  issues:[...language.issues,...grammar.issues,...intention.issues],
  promptContext:JSON.stringify({vectorMatrixModel,algebraicStructures,mathExpressions,quantityModel,spatialModel,timeModel,evidenceTrace,knowledgeRegistry,objects,objectModels:objectModel.objects,actionModels:actionModel.actions,actionSequence:actionModel.sequence,relationGraph,referenceResolution,complexClauses,logicalReasoning,reasoningChains,actions,relations,quantities,nounPhrases:grammar.structure.nounPhrases,predicates:grammar.structure.predicates,pronouns:grammar.structure.pronouns,intents:intention.intents,constraints:intention.constraints,outputs:intention.outputs,sequence:intention.sequence}),
  policy:{physicsApplied:false,externalAIUsed:false,unstatedFactsInvented:false,uncertainInterpretationsRemainCandidates:true,objectIdentityAcrossSentencesResolved:false}
 };
}
function diagnostics(){return {name:"Pipeline local de compréhension Idée Vision",version:VERSION,offline:true,externalDependencies:[],stages:["fondations françaises","analyse grammaticale et sémantique","compréhension des intentions","modélisation descriptive des objets","représentation descriptive des actions","graphe descriptif des relations","résolution prudente des références","analyse des propositions complexes","représentation du raisonnement logique","chaînage de raisonnements en plusieurs étapes","registre des affirmations, hypothèses et inconnues","traçabilité de la provenance et du statut des preuves","compréhension et représentation descriptive du temps","représentation descriptive des événements et relations temporels","représentation descriptive des positions, directions et relations spatiales","représentation des quantités, unités, mesures et comparaisons","analyse symbolique des expressions, formules, équations et inégalités","repérage des structures algébriques et systèmes d’équations","représentation symbolique des vecteurs, matrices et opérations matricielles"],limitations:["vocabulaire et grammaire encore incomplets","analyse heuristique","aucune déduction physique","ne constitue pas encore une intelligence générale","les affirmations ne sont pas vérifiées comme vraies","la traçabilité ne constitue pas une vérification externe","les dates relatives ne sont pas résolues sans date de référence","les relations temporelles ne prouvent pas la chronologie réelle","les relations spatiales restent candidates sans repère ni point de vue explicite","les unités et valeurs sont conservées sans conversion ni validation physique","les expressions mathématiques sont représentées sans calcul ni résolution","les systèmes algébriques sont repérés sans être résolus","les vecteurs et matrices sont représentés sans calcul ni résolution"]};}
const api=Object.freeze({version:VERSION,analyze,diagnostics});
root.IdeeVisionUnderstandingPipeline=api;
if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
