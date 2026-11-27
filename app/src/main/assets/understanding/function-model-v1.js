/* Idée Vision — Modèle symbolique des fonctions et de leurs représentations v1 */
(function(root){
"use strict";
const VERSION="1.0.0";
const norm=s=>String(s==null?"":s).normalize("NFKC").replace(/[’‘]/g,"'").trim();
function ranges(s){
 const out=[];const re=/\[[^\]]*\]|\]\s*[,;]\s*\[[^\]]*\]|\([^)]*\)|\][^;,\n]*/g;let m;
 while((m=re.exec(s))!==null)out.push({text:m[0],start:m.index,end:m.index+m[0].length});
 return out;
}
function parseFunctionDefs(source,MathModel){
 const defs=[],re=/\b([fghpqrstuvw])\s*\(\s*([a-zA-Zα-ωΑ-Ω])\s*\)\s*=\s*([^;\n]+)/gu;let m;
 while((m=re.exec(source))!==null){
  const variable=m[2],expression=m[3].trim(),start=m.index,end=m.index+m[0].length;
  defs.push({id:"function_"+defs.length,name:m[1],variable,expression,expressionModel:MathModel?MathModel.analyze(expression):null,sourceRange:{start,end},evidence:m[0],status:"candidate"});
 }
 return defs;
}
function analyze(input,MathModel){
 const source=String(input==null?"":input),text=norm(source),functions=parseFunctionDefs(source,MathModel),domains=[],images=[],compositions=[],inverses=[],variations=[],limits=[],continuity=[],graphs=[],relations=[],issues=[];
 const add=(arr,type,re,mapper)=>{re.lastIndex=0;let m;while((m=re.exec(source))!==null){const v=mapper?mapper(m):{};arr.push({type,...v,sourceRange:{start:m.index,end:m.index+m[0].length},evidence:m[0],status:"candidate"});}};
 add(domains,"domain",/(?:D\s*[_({]?\s*([fgh])\s*[)}]?\s*=|domaine\s+de\s+([fgh]))\s*([^\n.]*)/giu,m=>({functionName:m[1]||m[2]||null,expression:(m[3]||"").trim()}));
 add(images,"image",/(?:Im\s*\(\s*([fgh])\s*\)|image\s+de\s+([fgh]))\s*(?:=|est|:)?\s*([^\n.]*)/giu,m=>({functionName:m[1]||m[2]||null,expression:(m[3]||"").trim()}));
 add(compositions,"composition",/\b([fgh])\s*∘\s*([fgh])\b|\b([fgh])\s*\(\s*([fgh])\s*\(\s*([a-z])\s*\)\s*\)/gu,m=>({outer:m[1]||m[3]||null,inner:m[2]||m[4]||null,notation:m[0]}));
 add(inverses,"inverse_function",/\b([fgh])\s*(?:\^\s*-1|⁻¹)\s*\(\s*([a-z])\s*\)/gu,m=>({functionName:m[1],variable:m[2]}));
 add(variations,"variation",/\b(f|g|h)\b\s*(?:est\s+)?(strictement croissante|strictement décroissante|croissante|décroissante|constante|monotone)(?:\s+sur\s+(\[[^\]]+\]|\][^\]]+\[|\([^)]*\)|[^\n.]+))?/giu,m=>({functionName:m[1],behavior:m[2].toLocaleLowerCase("fr-FR"),interval:(m[3]||"").trim()||null}));
 add(limits,"limit",/(?:lim\s*[_({]?\s*([a-z])\s*(?:→|->|tend\s+vers)\s*([^\s)}\]]+)[)}\]]?\s*|limite\s+de\s+([fgh])\s+en\s+([^\s,;]+))/giu,m=>({variable:m[1]||null,target:(m[2]||m[4]||"").trim(),functionName:m[3]||null,notation:m[0]}));
 add(continuity,"continuity",/\b(f|g|h)\b\s*(?:est\s+)?(continue|continuité|discontinue)(?:\s+(?:en|sur)\s+(\[[^\]]+\]|\][^\]]+\[|\([^)]*\)|[^\n.]+))?/giu,m=>({functionName:m[1],property:m[2].toLocaleLowerCase("fr-FR"),location:(m[3]||"").trim()||null}));
 add(graphs,"graph",/\b(courbe représentative|représentation graphique|graphe de|tracer la courbe de|dessiner la courbe de)\s*(?:la\s+)?(?:fonction\s+)?([fgh])?\b/giu,m=>({functionName:m[2]||null,requested:m[1]}));
 const intervalRe=/(?:sur|dans)\s*(\[[^\]]+\]|\][^\]]+\[|\([^)]*\))/gu;let im;
 while((im=intervalRe.exec(source))!==null)relations.push({type:"interval",interval:im[1],sourceRange:{start:im.index,end:im.index+im[0].length},evidence:im[0],status:"candidate"});
 const symbols=[...new Set(functions.map(x=>x.name).concat(domains.map(x=>x.functionName),images.map(x=>x.functionName),variations.map(x=>x.functionName),continuity.map(x=>x.functionName)).filter(Boolean))];
 const policy={evaluated:false,solved:false,limitsCalculated:false,continuityProved:false,variationsCalculated:false,graphsDrawn:false,domainValidated:false,rangeValidated:false,unknownValuesPreserved:true,sourcePositionsPreserved:true,allInterpretationsRemainCandidates:true};
 return {engine:"IdeeVisionFunctionModel",version:VERSION,offline:true,source,ready:true,functions,domains,images,compositions,inverses,variations,limits,continuity,graphs,relations,symbols,metrics:{functionCount:functions.length,domainCount:domains.length,imageCount:images.length,compositionCount:compositions.length,inverseCount:inverses.length,variationCount:variations.length,limitCount:limits.length,continuityCount:continuity.length,graphCount:graphs.length},issues,policy};
}
function diagnostics(){return {name:"Modèle symbolique des fonctions — Idée Vision",version:VERSION,offline:true,capabilities:["définitions f(x) et expressions associées","domaines et ensembles de définition candidats","images et ensembles d'arrivée candidats","compositions de fonctions","fonctions réciproques ou inverses comme notation","intervalles","sens de variation et monotonie exprimés","limites symboliques","continuité et discontinuité exprimées","demandes de courbes et représentations graphiques","positions et preuves textuelles"],limitations:["aucune fonction n'est évaluée","aucun domaine ni ensemble image n'est calculé","aucune limite n'est calculée","aucune continuité ni variation n'est démontrée","aucun graphe n'est tracé par ce module","notations et phrases ambiguës restent candidates"]};}
const api=Object.freeze({version:VERSION,analyze,diagnostics,ranges});
root.IdeeVisionFunctionModel=api;if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
