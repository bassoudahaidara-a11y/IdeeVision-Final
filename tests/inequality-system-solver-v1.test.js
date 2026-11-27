"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const M=require("../app/src/main/assets/understanding/math-expression-model-v1.js");
const S=require("../app/src/main/assets/understanding/symbolic-algebra-engine-v1.js");
const B=require("../app/src/main/assets/understanding/inequality-solver-v1.js");
const I=require("../app/src/main/assets/understanding/inequality-system-solver-v1.js");
const solve=s=>I.analyze(s,B,M,S), bounds=r=>r.intervals.map(x=>[x.lower,x.upper,x.lowerInclusive,x.upperInclusive]);
const cases=[
 ["x>1\nx<5","solution_set",[[1,5,false,false]]],
 ["x>=1\nx<=5","solution_set",[[1,5,true,true]]],
 ["x>1 et x<5","solution_set",[[1,5,false,false]]],
 ["x>=1 et x<5","solution_set",[[1,5,true,false]]],
 ["x>1 et x<=5","solution_set",[[1,5,false,true]]],
 ["x>=1 et x<=5","solution_set",[[1,5,true,true]]],
 ["x>5 et x<1","empty_set",[]],
 ["x>=5 et x<=5","solution_set",[[5,5,true,true]]],
 ["x>5 et x<=5","empty_set",[]],
 ["x>=5 et x<5","empty_set",[]],
 ["x<0 et x>2","empty_set",[]],
 ["x<=0 et x>=0","solution_set",[[0,0,true,true]]],
 ["x<0 et x>=0","empty_set",[]],
 ["x<=0 et x>0","empty_set",[]],
 ["x>1; x<5","solution_set",[[1,5,false,false]]],
 ["x>1; x<5; x!=3","solution_set",[[1,3,false,false],[3,5,false,false]]],
 ["x>1 ou x<0","solution_set",[[null,0,false,false],[1,null,false,false]]],
 ["x>=1 ou x<=0","all_real_numbers",[[null,null,false,false]]],
 ["x>1 ou x>3","solution_set",[[1,null,false,false]]],
 ["x>=1 ou x>1","solution_set",[[1,null,true,false]]],
 ["x>1 ou x>=1","solution_set",[[1,null,true,false]]],
 ["x<1 ou x<=1","solution_set",[[null,1,false,true]]],
 ["x<1 ou x>1","solution_set",[[null,1,false,false],[1,null,false,false]]],
 ["x^2-4<0 et x>0","solution_set",[[0,2,false,false]]],
 ["x^2-4<=0 et x>=0","solution_set",[[0,2,true,true]]],
 ["x^2-4>0 et x<0","solution_set",[[null,-2,false,false]]],
 ["x^2-4>=0 et x<=0","solution_set",[[null,-2,false,true]]],
 ["x^2-4<0 et x>3","empty_set",[]],
 ["x^2-1<=0 et x>=0","solution_set",[[0,1,true,true]]],
 ["x^2-1<0 et x<=0","solution_set",[[-1,0,false,true]]],
 ["x^2-1>0 et x>0","solution_set",[[1,null,false,false]]],
 ["x^2+1>0 et x<2","solution_set",[[null,2,false,false]]],
 ["x^2+1<0 et x>0","empty_set",[]],
 ["x>0 et x<10 et x!=5","solution_set",[[0,5,false,false],[5,10,false,false]]],
 ["x>=0 et x<=10 et x!=5","solution_set",[[0,5,true,false],[5,10,false,true]]],
 ["x<0 ou x>0 ou x=2","unsupported_system",[]],
 ["x+y>2 et x<4","multiple_variables_unsupported",[]],
 ["x>1 et y<5","multiple_variables_unsupported",[]],
 ["m>2 et m<5","unsupported_system",[]],
 ["sin(x)>0 et x<2","unsupported_system",[]],
 ["x>1 et y<2 et x<4","multiple_variables_unsupported",[]],
 ["x>1 et x<4 ou x=2","unsupported_system",[]],
 ["x>1","solution_set",[[1,null,false,false]]],
 ["x<1","solution_set",[[null,1,false,false]]],
 ["0>1 et x>0","empty_set",[]],
 ["0<1 et x>0","solution_set",[[0,null,false,false]]],
 ["0<1 et 0>1","empty_set",[]],
 ["0<1 ou x>0","all_real_numbers",[[null,null,false,false]]],
 ["x>=2; x<=2","solution_set",[[2,2,true,true]]],
 ["x>2; x<=2","empty_set",[]],
 ["x^2-9<=0 et x>=0","solution_set",[[0,3,true,true]]],
 ["x^2-9>=0 et x<=0","solution_set",[[null,-3,false,true]]],
 ["-x^2+4>=0 et x>0","solution_set",[[0,2,false,true]]],
 ["-x^2+4<0 et x>0","solution_set",[[2,null,false,false]]],
 ["x^2+2x+1<=0 et x>=-1","solution_set",[[-1,-1,true,true]]],
 ["x^2+2x+1<0 et x>=-1","empty_set",[]],
 ["x>1\nx<5\nLa balle roule","solution_set",[[1,5,false,false]]],
 ["La balle tombe","no_inequality_detected",[]],
 ["x=2","no_inequality_detected",[]],
 ["x>2 et x<2","empty_set",[]]
];
for(const [src,status,expected] of cases)test("système "+src.replace(/\n/g," / "),()=>{const r=solve(src);assert.equal(r.status,status);assert.deepEqual(bounds(r),expected);});
test("conserve les contraintes sources",()=>{const r=solve("x>1 et x<4");assert.deepEqual(r.inequalities.map(x=>x.source),["x>1","x<4"]);});
test("conserve l'ordre des contraintes",()=>{const r=solve("x<4 et x>1");assert.equal(r.inequalities[0].source,"x<4");});
test("variables communes exposées",()=>assert.deepEqual(solve("x>1 et x<4").variables,["x"]));
test("combinaison indique plusieurs contraintes",()=>assert.equal(solve("x>1 et x<4").combination,"intersection_or_union"));
test("contrainte isolée indiquée",()=>assert.equal(solve("x>1").combination,"single"));
test("mode hors ligne",()=>assert.equal(solve("x>1").offline,true));
test("aucune IA externe",()=>assert.equal(solve("x>1").policy.externalAIUsed,false));
test("aucun eval",()=>assert.equal(solve("x>1").policy.evalUsed,false));
test("bornes strictes conservées",()=>assert.equal(solve("x>1 et x<4").intervals[0].lowerInclusive,false));
test("bornes inclusives conservées",()=>assert.equal(solve("x>=1 et x<=4").intervals[0].upperInclusive,true));
test("intersection ponctuelle incluse",()=>assert.deepEqual(bounds(solve("x>=3 et x<=3")) ,[[3,3,true,true]]));
test("intersection ponctuelle exclue",()=>assert.equal(solve("x>3 et x<=3").status,"empty_set"));
test("union fusionne les intervalles chevauchants",()=>assert.deepEqual(bounds(solve("x>1 ou x>3")),[[1,null,false,false]]));
test("union fusionne les intervalles adjacents avec point inclus",()=>assert.deepEqual(bounds(solve("x<=1 ou x>=1")),[[null,null,false,false]]));
test("union conserve le trou strict",()=>assert.equal(solve("x<1 ou x>1").intervals.length,2));
test("union garde la borne incluse si une branche l'inclut",()=>assert.deepEqual(bounds(solve("x>1 ou x>=1")),[[1,null,true,false]]));
test("intersection de plusieurs intervalles",()=>assert.deepEqual(bounds(solve("x>-2 et x<8 et x>=0 et x<=4")),[[0,4,true,true]]));
test("intersections quadratique et linéaire",()=>assert.deepEqual(bounds(solve("x^2-4<=0 et x>0")),[[0,2,false,true]]));
test("intersection de deux unions quadratiques",()=>assert.deepEqual(bounds(solve("x^2-4>0 et x^2-9<0")) ,[[null,-2,false,false],[2,3,false,false]]));
test("différentes variables non combinées",()=>assert.equal(solve("x>0 et y>0").status,"multiple_variables_unsupported"));
test("variables multiples dans une contrainte refusées",()=>assert.equal(solve("x+y>0 et x>0").status,"unsupported_system"));
test("connecteurs mixtes refusés",()=>assert.equal(solve("x>0 et x<4 ou x=2").status,"unsupported_system"));
test("JSON sérialisable",()=>assert.doesNotThrow(()=>JSON.stringify(solve("x>1 et x<4"))));
test("diagnostics riches",()=>assert.ok(I.diagnostics().capabilities.length>=20));
test("limitations explicites",()=>assert.ok(I.diagnostics().limitations.length>=6));
test("statut de composant non pris en charge",()=>assert.equal(solve("sin(x)>0 et x<2").issues[0].code,"component_inequality_unsupported"));
test("système vide conserve les contraintes",()=>assert.equal(solve("x>3 et x<1").inequalities.length,2));
test("source générale préservée",()=>assert.equal(solve("x>1 et x<4").source,"x>1 et x<4"));
test("intervalles sans bornes normalisés",()=>assert.deepEqual(bounds(solve("x>0 ou x<0")),[[null,0,false,false],[0,null,false,false]]));
test("point commun entre deux demi-droites",()=>assert.deepEqual(bounds(solve("x<=0 ou x>=0")),[[null,null,false,false]]));
test("système avec contrainte constante vraie",()=>assert.deepEqual(bounds(solve("0<=0 et x>2")),[[2,null,false,false]]));
test("système avec contrainte constante fausse",()=>assert.equal(solve("0>1 et x>2").status,"empty_set"));
test("point isolé depuis racine double",()=>assert.deepEqual(bounds(solve("x^2<=0 et x>=0")),[[0,0,true,true]]));
test("racine double exclue puis intersection",()=>assert.equal(solve("x^2>0 et x<=0 et x>=0").status,"empty_set"));
test("fraction dans une contrainte",()=>assert.deepEqual(bounds(solve("x/2>1 et x<4")),[[2,4,false,false]]));
test("parenthèses conservées dans contraintes",()=>assert.deepEqual(bounds(solve("2(x+1)>4 et x<5")),[[1,5,false,false]]));
test("inégalité stricte et large asymétriques",()=>assert.deepEqual(bounds(solve("x>2 et x<=2")),[]));
test("connecteur simultanément reconnu",()=>assert.deepEqual(bounds(solve("x>1 simultanément x<3")),[[1,3,false,false]]));
test("connecteur et aussi reconnu",()=>assert.deepEqual(bounds(solve("x>1 et aussi x<3")),[[1,3,false,false]]));
test("séparateur point-virgule",()=>assert.deepEqual(bounds(solve("x>1; x<3")),[[1,3,false,false]]));
test("aucun résultat fictif pour les inégalités invalides",()=>assert.equal(solve("x>1 et x+y<3").status,"unsupported_system"));
