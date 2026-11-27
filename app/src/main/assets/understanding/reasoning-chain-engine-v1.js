/* Idée Vision — Chaînage prudent de raisonnements v1 */
(function(root){"use strict";
const VERSION="1.0.0";
const fold=s=>String(s||"").toLocaleLowerCase("fr-FR").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[’‘]/g,"'").replace(/[.!?…,:;]/g," ").replace(/\b(peut|peuvent|pourrait|pourraient|doit|doivent|doivent|alors|donc|ainsi|le|la|les|un|une|des|du|de|d|un|et|ou|que|qui|il|elle|ils|elles|se|s|ne|pas)\b/g," ").replace(/\s+/g," ").trim();
const sourceNorm=s=>String(s==null?"":s).normalize("NFKC").replace(/[’‘]/g,"'").replace(/\s+/g," ").trim();
function tokens(s){return fold(s).split(" ").filter(x=>x.length>1);}
function similarity(a,b){const x=tokens(a),y=tokens(b);if(!x.length||!y.length)return 0;const X=new Set(x),Y=new Set(y),inter=[...X].filter(t=>Y.has(t)).length;return inter/Math.max(X.size,Y.size);}
function sameProposition(a,b){const x=fold(a),y=fold(b);return !!x&&x===y;}
function analyze(input,logical){const source=sourceNorm(input),out={engine:"IdeeVisionReasoningChains",version:VERSION,offline:true,source,ready:false,chains:[],links:[],unresolved:[],cycles:[],components:[],issues:[],policy:{derivedClaimsRemainCandidates:true,truthValuesNotInferred:true,scientificLawsNotInferred:true,approximateMatchesNeverBecomeLinks:true}};
if(!logical||logical.source!==source||!Array.isArray(logical.rules)){out.issues.push({code:"matching_logical_analysis_required"});return out;}
out.ready=true;const rules=logical.rules.filter(r=>r.conditionText&&r.resultText&&r.type!=="biconditional");
const edges=[],adj=new Map(rules.map(r=>[r.id,[]]));
for(const from of rules)for(const to of rules){if(from.id===to.id)continue;const a=from.resultText,b=to.conditionText;if(sameProposition(a,b)){const edge={id:"chain-link-"+(edges.length+1),fromRule:from.id,toRule:to.id,bridgeText:a,match:"exact_normalized",score:1,status:"explicit_textual_dependency_candidate"};edges.push(edge);adj.get(from.id).push(to.id);}else{const score=similarity(a,b);if(score>=0.6&&tokens(a).length>=2&&tokens(b).length>=2)out.unresolved.push({fromRule:from.id,toRule:to.id,resultText:a,conditionText:b,similarity:Number(score.toFixed(3)),status:"possible_bridge_requires_confirmation"});}}
out.links=edges;
const incoming=new Set(edges.map(e=>e.toRule)),starts=rules.filter(r=>!incoming.has(r.id));
const visited=new Set();function walk(rule,path){if(path.includes(rule.id)){out.cycles.push({ruleIds:[...path,rule.id],status:"possible_cycle"});return;}const nextPath=[...path,rule.id];visited.add(rule.id);const next=adj.get(rule.id)||[];if(!next.length){if(nextPath.length>1)out.chains.push({id:"chain-"+(out.chains.length+1),ruleIds:nextPath,steps:nextPath.map(id=>{const r=rules.find(x=>x.id===id);return {ruleId:id,condition:r.conditionText,result:r.resultText,evidence:r.evidence};}),length:nextPath.length,status:"multi_step_inference_candidate",conclusion:rules.find(x=>x.id===rule.id).resultText});return;}for(const id of next)walk(rules.find(x=>x.id===id),nextPath);}
for(const r of starts)walk(r,[]);
for(const r of rules)if(!visited.has(r.id))out.components.push({ruleId:r.id,status:"unconnected_rule_or_cycle_member"});
out.components=out.components.filter((x,i,a)=>a.findIndex(y=>y.ruleId===x.ruleId)===i);
out.metrics={ruleCount:rules.length,linkCount:edges.length,chainCount:out.chains.length,longestChain:out.chains.reduce((m,c)=>Math.max(m,c.length),0),unresolvedBridgeCount:out.unresolved.length,cycleCount:out.cycles.length};
if(!rules.length)out.issues.push({code:"no_conditional_rules_to_chain"});
if(rules.length>0&&!edges.length)out.issues.push({code:"no_exact_inter_rule_bridge_found"});
out.policy={derivedClaimsRemainCandidates:true,truthValuesNotInferred:true,scientificLawsNotInferred:true,approximateMatchesNeverBecomeLinks:true,pronounReferencesNotGuessed:true,chainRequiresExplicitTextualBridge:true};
return out;}
function diagnostics(){return {name:"Idée Vision — Chaînage logique local",version:VERSION,offline:true,externalDependencies:[],capabilities:["chaînage de règles conditionnelles","liaisons textuelles exactes entre étapes","chaînes à plusieurs niveaux","repérage des propositions intermédiaires","détection de ponts possibles non confirmés","identification des règles isolées","repérage de cycles possibles","calcul de longueur de chaîne","conservation des preuves","gestion de plusieurs chaînes","détection de dépendances orientées","séparation des chaînes indépendantes","signalement des liens manquants possibles","limitation des correspondances approximatives","conclusions candidates","aucune valeur de vérité inventée","aucune loi scientifique déduite"],limitations:["liaison automatique volontairement stricte","les reformulations et pronoms nécessitent une résolution plus avancée","ne constitue pas un démonstrateur formel complet","un lien textuel ne prouve pas une causalité","les règles conditionnelles d'entrée peuvent être incomplètes"]};}
const api=Object.freeze({version:VERSION,analyze,diagnostics,similarity,sameProposition});root.IdeeVisionReasoningChains=api;if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
