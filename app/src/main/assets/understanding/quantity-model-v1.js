/* Idée Vision — Modèle descriptif des quantités et mesures v1 */
(function(root){"use strict";
const VERSION="1.0.0",norm=s=>String(s==null?"":s).normalize("NFKC").replace(/[’‘]/g,"'").replace(/\s+/g," ").trim(),fold=s=>norm(s).toLocaleLowerCase("fr-FR").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const UNITS={
length:new Set(["mm","cm","m","km","micrometre","micrometres"]),
mass:new Set(["mg","g","kg","tonne","tonnes"]),
volume:new Set(["ml","l","litre","litres","cl"]),
time:new Set(["s","sec","seconde","secondes","min","minute","minutes","h","heure","heures","jour","jours"]),
temperature:new Set(["°c","°f","c","f"]),
pressure:new Set(["pa","kpa","mpa","bar"]),
speed:new Set(["m/s","km/h"]),
angle:new Set(["°","deg","degre","degres","rad"]),
energy:new Set(["j","kj","mj"]),
power:new Set(["w","kw","mw"]),
electric_voltage:new Set(["v","mv","kv"]),
electric_current:new Set(["a","ma"]),
resistance:new Set(["ohm","ohms","ω"])
};
const UNIT_MAP=new Map();for(const [cat,set] of Object.entries(UNITS))for(const u of set)UNIT_MAP.set(fold(u),cat);
const APPROX=["environ","approximativement","presque","à peu près","a peu pres","en moyenne","environ"];
const COMPARATORS=[["au moins","lower_bound"],["au maximum","upper_bound"],["au plus","upper_bound"],["supérieur à","greater_than"],["supérieure à","greater_than"],["superieur a","greater_than"],["superieure a","greater_than"],["inférieur à","less_than"],["inférieure à","less_than"],["inferieur a","less_than"],["inferieure a","less_than"],["plus grand que","greater_than"],["plus petit que","less_than"],["égal à","equal_to"],["égale à","equal_to"],["egal a","equal_to"],["egale a","equal_to"],["exactement","exact"],["entre","range_start"],["de","range_start"]];
function analyze(input,language,objectModel){
 const source=norm(input),out={engine:"IdeeVisionQuantityModel",version:VERSION,offline:true,source,ready:false,quantities:[],ranges:[],comparisons:[],constraints:[],issues:[],policy:{unitConversionsPerformed:false,missingUnitsRemainUnknown:true,valuesAreNotPhysicallyValidated:true,arithmeticNotInferred:true,sourceEvidencePreserved:true}};
 if(!language||language.source!==source||!language.structure||!Array.isArray(language.structure.quantities)){out.issues.push({code:"matching_language_analysis_required"});return out;}
 if(objectModel&&(objectModel.source!==source||!Array.isArray(objectModel.objects))){out.issues.push({code:"object_model_source_mismatch"});return out;}
 out.ready=true;
 const objectOccurrences=(objectModel?.objects||[]).flatMap(o=>(o.occurrences||[]).map(x=>({id:o.id,name:o.name,start:x.start,end:x.end})));
 const nearestObject=pos=>objectOccurrences.filter(x=>x.end<=pos).sort((a,b)=>b.end-a.end)[0]||objectOccurrences.filter(x=>x.start>=pos).sort((a,b)=>a.start-b.start)[0]||null;
 const dimensionRe=/(longueur|largeur|hauteur|diamètre|diametre|rayon|épaisseur|epaisseur|profondeur|distance|masse|volume|température|temperature|pression|vitesse|durée|duree|angle|énergie|energie|puissance)\s*(?:est|de|:)?\s*$/iu;
 const unitRe=/^(mm|cm|km|m|mg|kg|g|ml|cl|l|pa|kpa|mpa|bar|°c|°f|°|deg|rad|j|kj|mj|w|kw|mw|v|mv|kv|a|ma|m\/s|km\/h|s|sec|min|h|ohm|ω|litres?|secondes?|minutes?|heures?|jours?|degrés?|degres?)$/iu;
 const numericRe=/[+-]?\d+(?:[,.]\d+)?(?:[eE][+-]?\d+)?/g;let m;
 while((m=numericRe.exec(source))){const before=source.slice(Math.max(0,m.index-18),m.index),after=source.slice(numericRe.lastIndex,numericRe.lastIndex+24);if(/\d\s*\/\s*$/.test(before)||/^\s*\/\s*\d/.test(after))continue;const raw=m[0],value=Number(raw.replace(",",".")),unitMatch=after.match(/^\s*(°\s*[CF]|[a-zA-ZµΩ°]+(?:\s*\/\s*[a-zA-Z]+)?)/u),unit=unitMatch?unitMatch[1].replace(/\s+/g,""):null,category=unit?UNIT_MAP.get(fold(unit))||null:null;const prefix=before.match(dimensionRe),approx=APPROX.some(w=>fold(before).endsWith(fold(w))||fold(source.slice(numericRe.lastIndex,numericRe.lastIndex+30)).startsWith(fold(w)));const percent=/^\s*%/.test(after);const rec={id:"quantity-"+(out.quantities.length+1),raw,value:Number.isFinite(value)?value:null,unit:percent?"%":unit,category:percent?"percentage":category,kind:percent?"percentage":unit?"measured_value":"scalar",approximate:approx,dimension:prefix?fold(prefix[1]):null,start:m.index,end:numericRe.lastIndex+(unitMatch?unitMatch[0].length:0)+(percent?1:0),sentenceIndex:null,associatedObject:nearestObject(m.index),evidence:source.slice(Math.max(0,m.index-16),Math.min(source.length,numericRe.lastIndex+16)),status:"explicit_numeric_candidate"};let cursor=0;const sentences=language.sentences||[];for(let i=0;i<sentences.length;i++){const at=source.indexOf(sentences[i].text,cursor);if(at>=0&&m.index>=at&&m.index<at+sentences[i].text.length){rec.sentenceIndex=i;break;}if(at>=0)cursor=at+sentences[i].text.length;}out.quantities.push(rec);}
 const rangeRe=/\bentre\s+([+-]?\d+(?:[,.]\d+)?)\s+et\s+([+-]?\d+(?:[,.]\d+)?)\s*([a-zA-Z°]+)?|\bde\s+([+-]?\d+(?:[,.]\d+)?)\s+à\s+([+-]?\d+(?:[,.]\d+)?)\s*([a-zA-Z°]+)?/giu;
 while((m=rangeRe.exec(source))){const low=Number((m[1]||m[4]).replace(",",".")),high=Number((m[2]||m[5]).replace(",",".")),unit=m[3]||m[6]||null;out.ranges.push({id:"quantity-range-"+(out.ranges.length+1),minimum:low,maximum:high,unit,category:unit?UNIT_MAP.get(fold(unit))||null:null,start:m.index,end:rangeRe.lastIndex,status:low<=high?"explicit_range_candidate":"reversed_range_candidate",evidence:m[0]});}
 const compWords=[["au moins","minimum"],["au maximum","maximum"],["au plus","maximum"],["supérieur à","greater_than"],["supérieur a","greater_than"],["inférieur à","less_than"],["inférieur a","less_than"],["plus grand que","greater_than"],["plus petit que","less_than"],["égal à","equal_to"],["égal a","equal_to"],["environ","approximate"],["approximativement","approximate"],["à peu près","approximate"],["a peu pres","approximate"],["presque","approximate"],["exactement","exact"]];
 for(const [word,type] of compWords){const re=new RegExp("(?<![\\p{L}])"+fold(word).replace(/[.*+?^$|()[\]\\]/g,"\\$&").replace(/\s+/g,"\\s+")+"(?![\\p{L}])","giu");while((m=re.exec(source)))out.comparisons.push({id:"quantity-comparison-"+(out.comparisons.length+1),type,marker:m[0],start:m.index,end:re.lastIndex,status:"textual_comparison_candidate"});}
 const signs=[["au moins","≥"],["au plus","≤"],["supérieur à",">"],["inférieur à","<"],["égal à","="]];for(const [w,symbol] of signs){const re=new RegExp("(?<![\\p{L}])"+fold(w).replace(/[.*+?^$|()[\]\\]/g,"\\$&").replace(/\s+/g,"\\s+")+"(?![\\p{L}])","giu");while((m=re.exec(source)))out.constraints.push({id:"quantity-constraint-"+(out.constraints.length+1),operator:symbol,marker:m[0],start:m.index,end:re.lastIndex,status:"inequality_candidate"});}
 if(!out.quantities.length)out.issues.push({code:"no_numeric_quantity_detected",severity:"information"});
 if(out.quantities.some(x=>x.unit===null))out.issues.push({code:"unit_missing_for_some_values",severity:"information"});
 out.metrics={quantityCount:out.quantities.length,measuredCount:out.quantities.filter(x=>x.unit!==null).length,unitlessCount:out.quantities.filter(x=>x.unit===null).length,rangeCount:out.ranges.length,comparisonCount:out.comparisons.length,constraintCount:out.constraints.length};
 return out;
}
function diagnostics(){return {name:"Idée Vision — Modèle des quantités et mesures",version:VERSION,offline:true,externalDependencies:[],capabilities:["nombres entiers et décimaux","signe positif et négatif","notation scientifique","unités de longueur","unités de masse","unités de volume","unités de temps","unités de température","unités de pression","vitesse et angle","énergie et puissance","grandeurs électriques","pourcentages","intervalles numériques","bornes minimales et maximales","comparaisons","approximation","dimensions nommées","association candidate à un objet","positions et preuves textuelles","unités manquantes signalées","absence de conversion automatique","aucun calcul ou résultat physique inventé"],limitations:["lexique d'unités initial","ambiguïtés entre symboles et mots","aucune conversion d'unité","aucune validation physique ou arithmétique","les intervalles restent des candidats textuels"]};}
const api=Object.freeze({version:VERSION,analyze,diagnostics});root.IdeeVisionQuantityModel=api;if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
