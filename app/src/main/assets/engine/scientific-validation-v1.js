/* Idée Vision — Scientific Validation Engine v1
 * Deterministic unit, formula and plausibility checks. No arbitrary expression evaluation.
 */
(function(root){
 "use strict";
 const VERSION="1.0.0";
 const UNITS={
  m:{dimension:"length",factor:1,symbol:"m"},km:{dimension:"length",factor:1000,symbol:"km"},cm:{dimension:"length",factor:.01,symbol:"cm"},mm:{dimension:"length",factor:.001,symbol:"mm"},
  s:{dimension:"time",factor:1,symbol:"s"},min:{dimension:"time",factor:60,symbol:"min"},h:{dimension:"time",factor:3600,symbol:"h"},
  kg:{dimension:"mass",factor:1,symbol:"kg"},g:{dimension:"mass",factor:.001,symbol:"g"},mg:{dimension:"mass",factor:.000001,symbol:"mg"},
  mps:{dimension:"speed",factor:1,symbol:"m/s"},"m/s":{dimension:"speed",factor:1,symbol:"m/s"},"km/h":{dimension:"speed",factor:1/3.6,symbol:"km/h"},
  n:{dimension:"force",factor:1,symbol:"N"},j:{dimension:"energy",factor:1,symbol:"J"},w:{dimension:"power",factor:1,symbol:"W"},kw:{dimension:"power",factor:1000,symbol:"kW"},
  pa:{dimension:"pressure",factor:1,symbol:"Pa"},kpa:{dimension:"pressure",factor:1000,symbol:"kPa"},v:{dimension:"voltage",factor:1,symbol:"V"},a:{dimension:"current",factor:1,symbol:"A"},hz:{dimension:"frequency",factor:1,symbol:"Hz"},
  l:{dimension:"volume",factor:.001,symbol:"L"},ml:{dimension:"volume",factor:.000001,symbol:"mL"}
 };
 const CONSTANTS={g:9.80665,c:299792458,G:6.67430e-11,pi:Math.PI,R:8.314462618,NA:6.02214076e23};
 const FORMULAS={
  speed:{label:"vitesse moyenne",expression:"v = d / t",requires:["distance","time"],result:"speed"},
  density:{label:"masse volumique",expression:"ρ = m / V",requires:["mass","volume"],result:"density"},
  force:{label:"deuxième loi de Newton",expression:"F = m × a",requires:["mass","acceleration"],result:"force"},
  weight:{label:"poids près de la Terre",expression:"P = m × g",requires:["mass","gravity"],result:"force"},
  work:{label:"travail d'une force constante parallèle",expression:"W = F × d",requires:["force","distance"],result:"energy"},
  power:{label:"puissance moyenne",expression:"P = W / t",requires:["energy","time"],result:"power"},
  ohm:{label:"loi d'Ohm",expression:"U = R × I",requires:["resistance","current"],result:"voltage"},
  kinetic:{label:"énergie cinétique",expression:"Ec = ½ × m × v²",requires:["mass","speed"],result:"energy"}
 };
 const clean=s=>String(s==null?"":s).normalize("NFKC").replace(/\s+/g," ").trim();
 const fold=s=>clean(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
 function parseQuantity(value,unit){
  const n=Number(String(value).replace(",",".")),u=UNITS[String(unit||"").toLowerCase()];
  if(!Number.isFinite(n)||!u)return {valid:false,error:"Valeur ou unité inconnue."};
  return {valid:true,value:n,unit:u.symbol,dimension:u.dimension,siValue:n*u.factor};
 }
 function convert(value,from,to){
  const a=parseQuantity(value,from),b=UNITS[String(to||"").toLowerCase()];
  if(!a.valid||!b)return {valid:false,error:"Conversion impossible : unité inconnue."};
  if(a.dimension!==b.dimension)return {valid:false,error:"Les unités ne représentent pas la même grandeur."};
  return {valid:true,value:a.siValue/b.factor,unit:b.symbol,dimension:b.dimension};
 }
 function extractQuantities(text){
  const s=String(text||""),out=[],re=/([-+]?\d+(?:[.,]\d+)?)\s*(km\/h|m\/s|km|cm|mm|kg|mg|ml|ml|kpa|pa|hz|kw|n|j|w|v|a|m|s|h|g|l)\b/gi;let m;
  while((m=re.exec(s))!==null){const q=parseQuantity(m[1],m[2]);if(q.valid)out.push({...q,raw:m[0],index:m.index});}
  return out;
 }
 function checkDimensions(left,right){
  if(!left||!right)return {valid:false,reason:"Grandeur manquante."};
  return {valid:left===right,reason:left===right?"Dimensions compatibles.":"Dimensions incompatibles : "+left+" et "+right+"."};
 }
 function findFormulaCandidates(text){
  const t=fold(text),matches=[];
  if(/vitesse|speed|distance.*temps|km\/h/.test(t))matches.push("speed");
  if(/masse volumique|densite|density/.test(t))matches.push("density");
  if(/force|newton/.test(t))matches.push("force");
  if(/poids|weight|gravite|gravité/.test(t))matches.push("weight");
  if(/travail mecanique|travail d'une force/.test(t))matches.push("work");
  if(/puissance|power/.test(t))matches.push("power");
  if(/ohm|tension.*intensite/.test(t))matches.push("ohm");
  if(/energie cinetique|énergie cinétique/.test(t))matches.push("kinetic");
  return [...new Set(matches)].map(id=>({id,...FORMULAS[id]}));
 }
 function dimensionalCheck(terms){
  const list=Array.isArray(terms)?terms:[],dimensions=list.map(x=>x&&x.dimension).filter(Boolean);
  if(!dimensions.length)return {valid:false,reason:"Aucune dimension vérifiable."};
  return {valid:dimensions.every(x=>x===dimensions[0]),dimensions,reason:dimensions.every(x=>x===dimensions[0])?"Toutes les dimensions sont identiques.":"Les dimensions ne concordent pas."};
 }
 function safeArithmetic(op,a,b){
  a=Number(a);b=Number(b);if(!Number.isFinite(a)||!Number.isFinite(b))return {valid:false,error:"Entrée numérique invalide."};
  let value;
  if(op==="add")value=a+b;else if(op==="subtract")value=a-b;else if(op==="multiply")value=a*b;else if(op==="divide"){if(b===0)return {valid:false,error:"Division par zéro."};value=a/b;}else if(op==="power"){if(Math.abs(b)>100)return {valid:false,error:"Exposant hors limite."};value=Math.pow(a,b);}else return {valid:false,error:"Opération non autorisée."};
  return Number.isFinite(value)?{valid:true,value}:{valid:false,error:"Résultat non fini."};
 }
 function significantFigures(value){
  const s=String(value).trim().replace(",",".");if(!/^[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?$/i.test(s))return 0;
  const mantissa=s.toLowerCase().split("e")[0].replace(/^[-+]/,"");
  if(mantissa.includes("."))return (mantissa.replace(".","").replace(/^0+/,"").length)||1;
  return mantissa.replace(/^0+/,"").replace(/0+$/,"").length||1;
 }
 function roundSignificant(value,figures){
  const n=Number(value),f=Math.max(1,Math.min(12,Math.floor(Number(figures)||3)));
  if(!Number.isFinite(n)||n===0)return n;
  const p=Math.pow(10,f-1-Math.floor(Math.log10(Math.abs(n))));return Math.round(n*p)/p;
 }
 function relativeDifference(a,b){
  a=Number(a);b=Number(b);if(!Number.isFinite(a)||!Number.isFinite(b))return null;
  const scale=Math.max(Math.abs(a),Math.abs(b));return scale===0?0:Math.abs(a-b)/scale;
 }
 function compareValues(a,b,tolerance){
  const diff=relativeDifference(a,b),tol=Number.isFinite(tolerance)?Math.max(0,tolerance):.01;
  return {comparable:diff!==null,relativeDifference:diff,tolerance:tol,consistent:diff!==null&&diff<=tol};
 }
 function checkPositive(value,label){
  const n=Number(value);return {valid:Number.isFinite(n)&&n>0,issue:Number.isFinite(n)&&n>0?null:(label||"La valeur")+" doit être strictement positive."};
 }
 function checkRange(value,min,max,label){
  const n=Number(value),valid=Number.isFinite(n)&&n>=min&&n<=max;
  return {valid,issue:valid?null:(label||"La valeur")+" est en dehors de l'intervalle annoncé ["+min+", "+max+"]."};
 }
 function validateTriangle(a,b,c){
  [a,b,c]=[a,b,c].map(Number);const valid=[a,b,c].every(x=>Number.isFinite(x)&&x>0)&&a+b>c&&a+c>b&&b+c>a;
  return {valid,issue:valid?null:"Ces longueurs ne forment pas un triangle valide."};
 }
 function validateRectangle(length,width){
  const a=Number(length),b=Number(width),valid=Number.isFinite(a)&&Number.isFinite(b)&&a>0&&b>0;
  return {valid,area:valid?a*b:null,perimeter:valid?2*(a+b):null,issue:valid?null:"Les côtés du rectangle doivent être positifs."};
 }
 function checkSpeed(distance,time){
  const d=Number(distance),t=Number(time);if(!(d>=0)||!(t>0)||!Number.isFinite(d)||!Number.isFinite(t))return {valid:false,error:"La distance doit être positive ou nulle et le temps strictement positif."};
  return {valid:true,value:d/t,unit:"m/s"};
 }
 function checkMassDensity(mass,volume){
  const m=Number(mass),v=Number(volume);if(!(m>0)||!(v>0)||!Number.isFinite(m)||!Number.isFinite(v))return {valid:false,error:"La masse et le volume doivent être strictement positifs."};
  return {valid:true,value:m/v,unit:"kg/m³"};
 }
 function checkNewton(mass,acceleration){
  const m=Number(mass),a=Number(acceleration);if(!(m>=0)||!Number.isFinite(m)||!Number.isFinite(a))return {valid:false,error:"Masse ou accélération invalide."};
  return {valid:true,value:m*a,unit:"N"};
 }
 function checkWeight(mass,gravity){
  const m=Number(mass),g=gravity===undefined?CONSTANTS.g:Number(gravity);if(!(m>=0)||!(g>0)||!Number.isFinite(m)||!Number.isFinite(g))return {valid:false,error:"Masse ou gravité invalide."};
  return {valid:true,value:m*g,unit:"N",gravity:g};
 }
 function checkOhm(resistance,current){
  const r=Number(resistance),i=Number(current);if(!(r>=0)||!Number.isFinite(r)||!Number.isFinite(i))return {valid:false,error:"Résistance ou courant invalide."};
  return {valid:true,value:r*i,unit:"V"};
 }
 function checkKineticEnergy(mass,speed){
  const m=Number(mass),v=Number(speed);if(!(m>=0)||!Number.isFinite(m)||!Number.isFinite(v))return {valid:false,error:"Masse ou vitesse invalide."};
  return {valid:true,value:.5*m*v*v,unit:"J"};
 }
 function checkEnergyConservation(initial,final,tolerance){
  return compareValues(initial,final,tolerance===undefined?.01:tolerance);
 }
 function checkStoichiometry(coefficients){
  if(!Array.isArray(coefficients)||coefficients.length<2)return {valid:false,error:"Il faut au moins deux coefficients."};
  const valid=coefficients.every(x=>Number.isInteger(x)&&x>0);
  return {valid,error:valid?null:"Les coefficients doivent être des entiers strictement positifs."};
 }
 function checkConcentration(moles,volumeLitres){
  const n=Number(moles),v=Number(volumeLitres);if(!(n>=0)||!(v>0)||!Number.isFinite(n)||!Number.isFinite(v))return {valid:false,error:"Quantité de matière invalide ou volume nul."};
  return {valid:true,value:n/v,unit:"mol/L"};
 }
 function detectCalculationRisks(text){
  const t=fold(text),issues=[];
  if(/divis(e|ion).*par zero|divise par 0|\/\s*0\b/.test(t))issues.push("division_by_zero");
  if(/racine carree.*negatif|sqrt\s*\(\s*-/.test(t))issues.push("negative_square_root");
  if(/unite.*different|addition.*kg.*m/.test(t))issues.push("possible_unit_mismatch");
  if(/sans.*unite|unite.*absente/.test(t))issues.push("missing_unit");
  return issues;
 }
 function validateReportedResult(result,expectedUnit){
  if(!result||!Number.isFinite(Number(result.value)))return {valid:false,issues:["résultat numérique absent ou invalide"]};
  const issues=[];if(expectedUnit){const u=UNITS[String(result.unit||"").toLowerCase()],e=UNITS[String(expectedUnit).toLowerCase()];if(!u||!e||u.dimension!==e.dimension)issues.push("unité du résultat incompatible");}
  return {valid:issues.length===0,issues};
 }
 function auditRequest(text){
  const quantities=extractQuantities(text),formulas=findFormulaCandidates(text),risks=detectCalculationRisks(text);
  const units=[...new Set(quantities.map(q=>q.dimension))],warnings=[];
  if(quantities.length===1)warnings.push("Une seule grandeur avec unité a été repérée ; vérifier si les données sont suffisantes.");
  if(quantities.length>1&&units.length>1)warnings.push("Plusieurs dimensions sont présentes ; vérifier les conversions et la cohérence de la formule.");
  if(risks.length)warnings.push("La demande contient des marqueurs de calcul à vérifier : "+risks.join(", "));
  return {engine:"IdeeVisionScientific",version:VERSION,quantities,formulas,risks,warnings,constants:CONSTANTS,requiresHumanReview:risks.length>0||warnings.length>0};
 }
 function toPromptContext(audit){
  if(!audit||audit.engine!=="IdeeVisionScientific")throw new TypeError("Audit scientifique invalide.");
  return ["CONTRÔLE SCIENTIFIQUE PRÉLIMINAIRE","Grandeurs reconnues : "+audit.quantities.map(q=>q.raw+" ("+q.dimension+")").join(", "),"Formules candidates : "+audit.formulas.map(f=>f.label+" : "+f.expression).join(" ; "),"Alertes : "+(audit.warnings.join(" ")||"aucune détectée"),"Règles : convertir les unités avant le calcul ; vérifier les dimensions ; indiquer les hypothèses ; ne jamais inventer les données manquantes ; signaler les approximations. Ce contrôle est indicatif et ne certifie pas la réponse."].join("\n");
 }
 function diagnostics(){return {name:"Idée Vision Scientific Validation",version:VERSION,offline:true,arbitraryCodeExecution:false,unitConversion:true,dimensionalChecks:true,formulaCatalog:Object.keys(FORMULAS),constants:Object.keys(CONSTANTS)}}
 root.IdeeVisionScientific=Object.freeze({version:VERSION,units:UNITS,constants:CONSTANTS,formulas:FORMULAS,parseQuantity,convert,extractQuantities,checkDimensions,findFormulaCandidates,dimensionalCheck,safeArithmetic,significantFigures,roundSignificant,relativeDifference,compareValues,checkPositive,checkRange,validateTriangle,validateRectangle,checkSpeed,checkMassDensity,checkNewton,checkWeight,checkOhm,checkKineticEnergy,checkEnergyConservation,checkStoichiometry,checkConcentration,detectCalculationRisks,validateReportedResult,auditRequest,toPromptContext,diagnostics});
 if(typeof module!=="undefined"&&module.exports)module.exports=root.IdeeVisionScientific;
})(typeof window!=="undefined"?window:globalThis);
