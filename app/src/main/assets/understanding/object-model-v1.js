/* Idée Vision — Modèle descriptif local des objets v1 */
(function(root){
"use strict";
const VERSION="1.0.0";
const fold=s=>String(s||"").toLocaleLowerCase("fr-FR").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const COLORS=new Set(["rouge","bleu","bleue","vert","verte","jaune","noir","noire","blanc","blanche","gris","grise","orange","violet","violette"]);
const SHAPES=new Map([["rond","spherical_or_round"],["ronde","spherical_or_round"],["carre","square"],["carree","square"],["rectangulaire","rectangular"],["triangulaire","triangular"],["cylindrique","cylindrical"],["conique","conical"],["spherique","spherical"],["plat","flat"],["plate","flat"]]);
const MATERIALS=new Map([["bois","wood"],["métal","metal"],["metal","metal"],["fer","iron"],["acier","steel"],["cuivre","copper"],["plastique","plastic"],["verre","glass"],["aluminium","aluminium"],["carton","cardboard"],["caoutchouc","rubber"],["tissu","fabric"],["papier","paper"],["pierre","stone"]]);
const LENGTH=new Set(["mm","cm","m","km"]),MASS=new Set(["mg","g","kg"]),VOLUME=new Set(["ml","l"]),TIME=new Set(["s","min","h"]);
const CLASS={
vehicle:new Set(["avion","voiture","camion","vélo","velo","moto","train","bateau","hélicoptère","helicopter"]),
building:new Set(["maison","bâtiment","batiment","immeuble","pièce","piece","chambre","bureau","laboratoire","atelier"]),
furniture:new Set(["table","chaise","porte","fenêtre","fenetre","mur","sol","plafond","toit","escalier"]),
container:new Set(["bouteille","flacon","verre","tube","tuyau","boîte","boite","réservoir","reservoir"]),
mechanism:new Set(["pompe","moteur","roue","hélice","helice","engrenage","levier","poulie","ressort"]),
device:new Set(["ordinateur","téléphone","telephone","écran","ecran","clavier","souris","lampe","ampoule","robot","machine","appareil"]),
living_thing:new Set(["personne","homme","femme","enfant","animal","arbre","fleur"])
};
function category(lemma){for(const [k,set] of Object.entries(CLASS))if(set.has(lemma))return k;return "physical_object_candidate";}
function analyze(input,languageAnalysis){
 const source=String(input==null?"":input).normalize("NFKC").replace(/[’‘]/g,"'").replace(/\s+/g," ").trim();
 if(!languageAnalysis||languageAnalysis.source!==source||!languageAnalysis.structure)return {engine:"IdeeVisionObjectModel",version:VERSION,offline:true,source,ready:false,objects:[],issues:[{code:"language_analysis_missing_or_mismatched"}],policy:{unstatedPropertiesInvented:false,physicsApplied:false}};
 const tokens=languageAnalysis.sentences.flatMap((s,si)=>s.tokens.map(t=>({...t,sentenceIndex:si})));
 const objects=languageAnalysis.structure.objects.map((o,index)=>{
  const lemma=fold(o.lemma||o.text),near=tokens.filter(t=>t.sentenceIndex===o.sentenceIndex&&t.start>=Math.max(0,o.start-5)&&t.end<=o.end+16);
  const properties=[];
  for(const t of near){
   const w=fold(t.text);
   if(COLORS.has(w))properties.push({kind:"color",value:t.text,evidence:t.text,start:t.start,end:t.end,status:"explicit"});
   if(SHAPES.has(w))properties.push({kind:"shape",value:SHAPES.get(w),evidence:t.text,start:t.start,end:t.end,status:"explicit"});
  }
  const materialTokens=near.filter(t=>MATERIALS.has(fold(t.text)));
  for(const t of materialTokens){
   const preceding=near.filter(x=>x.end<=t.start);
   const marker=preceding.slice(-2).map(x=>fold(x.text)).join(" ");
   if(["en","en métal","en metal","en bois","en plastique","en verre","en acier","en fer","en cuivre"].some(x=>marker.endsWith(x))||preceding.slice(-1).some(x=>["en","fabriqué","fabrique","faite","fait"].includes(fold(x.text)))){
    properties.push({kind:"material",value:MATERIALS.get(fold(t.text)),evidence:source.slice(Math.max(o.start,t.start-18),t.end),start:t.start,end:t.end,status:"explicit"});
   }
  }
  const dimensions=[];
  const relevant=languageAnalysis.structure.quantities.filter(q=>q.sentenceIndex===o.sentenceIndex&&Math.abs(q.start-o.end)<35);
  for(const q of relevant){
   const unit=fold(q.unit||"");
   const window=source.slice(Math.max(0,q.start-24),q.start).toLocaleLowerCase("fr-FR");
   const dimensionWord=(window.match(/(longueur|largeur|hauteur|diamètre|diametre|rayon|épaisseur|epaisseur|profondeur|mesure|mesurant)\s*(?:de|:)?\s*$/u)||[])[1];
   if(LENGTH.has(unit)||dimensionWord){
    dimensions.push({value:q.value,unit:q.unit||null,dimension:dimensionWord?fold(dimensionWord):"unspecified_length",start:q.start,end:q.end,status:"explicit"});
   }
  }
  const quantity=languageAnalysis.structure.quantities.filter(q=>q.sentenceIndex===o.sentenceIndex&&Math.abs(q.start-o.end)<16);
  const explicitStates=near.filter(t=>["ouvert","ouverte","fermé","fermée","ferme","plein","pleine","vide","mobile","fixe","chaud","chaude","froid","froide","transparent","transparente","opaque"].includes(fold(t.text))).map(t=>({value:t.text,start:t.start,end:t.end,status:"explicit"}));
  const occurrence={start:o.start,end:o.end,sentenceIndex:o.sentenceIndex,text:o.text};
  return {id:"object-"+(index+1),name:o.text,lemma:o.lemma||null,status:o.status,category:category(lemma),occurrences:[occurrence],properties,dimensions,nearbyQuantities:quantity.map(q=>({value:q.value,unit:q.unit,start:q.start,end:q.end})),states:explicitStates,relations:languageAnalysis.structure.relations.filter(r=>r.sentenceIndex===o.sentenceIndex&&(r.from===o.text||r.to===o.text)).map(r=>({type:r.type,from:r.from,to:r.to,status:r.status,evidence:r.marker})),evidence:{start:o.start,end:o.end,text:o.text}};
 });
 const issues=[];
 if(!objects.length)issues.push({code:"no_object_occurrences",severity:"warning"});
 if(objects.some(o=>o.status==="candidate"))issues.push({code:"unknown_object_candidates_present",severity:"warning"});
 if(objects.some(o=>o.dimensions.length===0))issues.push({code:"dimensions_not_specified_for_some_objects",severity:"information"});
 return {engine:"IdeeVisionObjectModel",version:VERSION,offline:true,source,ready:true,objects,issues,policy:{unstatedPropertiesInvented:false,physicsApplied:false,objectIdentityAcrossSentencesResolved:false,ambiguousMaterialLinksRemainUnassigned:true}};
}
function diagnostics(){return {name:"Idée Vision — Modèle descriptif des objets",version:VERSION,offline:true,externalDependencies:[],capabilities:["identifiants d'occurrences","catégories descriptives prudentes","propriétés de couleur explicites","formes explicitement décrites","matériaux avec marqueurs linguistiques explicites","dimensions avec unités de longueur","quantités proches conservées séparément","états explicitement exprimés","relations spatiales déjà détectées","positions et preuves textuelles","noms inconnus conservés comme candidats","plusieurs objets dans une description","plusieurs phrases","contrôle de concordance de source","sortie JSON stable","aucune loi physique déduite"],limitations:["identité d'un même objet entre phrases non résolue","association dimensions-objets encore heuristique","matériaux sans marqueur clair non attribués","vocabulaire descriptif incomplet","aucune géométrie 3D construite","aucune propriété implicite inventée"]};}
const api=Object.freeze({version:VERSION,analyze,diagnostics});
root.IdeeVisionObjectModel=api;if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
