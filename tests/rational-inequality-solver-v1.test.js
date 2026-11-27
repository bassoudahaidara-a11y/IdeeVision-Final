"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const M=require("../app/src/main/assets/understanding/math-expression-model-v1.js");
const R=require("../app/src/main/assets/understanding/rational-inequality-solver-v1.js");
const solve=s=>R.analyze(s,M).inequalities[0],bounds=r=>r.intervals.map(x=>[x.lower,x.upper,x.lowerInclusive,x.upperInclusive]);
const cases=[
 ["(x-1)/(x+2)>0","solution_set",[[null,-2,false,false],[1,null,false,false]],[-2]],
 ["(x-1)/(x+2)>=0","solution_set",[[null,-2,false,false],[1,null,true,false]],[-2]],
 ["(x-1)/(x+2)<0","solution_set",[[-2,1,false,false]],[-2]],
 ["(x-1)/(x+2)<=0","solution_set",[[-2,1,false,true]],[-2]],
 ["1/(x-3)>0","solution_set",[[3,null,false,false]],[3]],
 ["1/(x-3)<0","solution_set",[[null,3,false,false]],[3]],
 ["1/(x-3)>=0","solution_set",[[3,null,false,false]],[3]],
 ["1/(x-3)<=0","solution_set",[[null,3,false,false]],[3]],
 ["1/(x-3)!=0","solution_set",[[null,3,false,false],[3,null,false,false]],[3]],
 ["1/(x^2-4)>0","solution_set",[[null,-2,false,false],[2,null,false,false]],[-2,2]],
 ["1/(x^2-4)<0","solution_set",[[-2,2,false,false]],[-2,2]],
 ["1/(x^2-4)>=0","solution_set",[[null,-2,false,false],[2,null,false,false]],[-2,2]],
 ["1/(x^2-4)<=0","solution_set",[[-2,2,false,false]],[-2,2]],
 ["(x^2-1)/(x-2)>=0","solution_set",[[-1,1,true,true],[2,null,false,false]],[2]],
 ["(x^2-1)/(x-2)>0","solution_set",[[-1,1,false,false],[2,null,false,false]],[2]],
 ["(x^2-1)/(x-2)<0","solution_set",[[null,-1,false,false],[1,2,false,false]],[2]],
 ["(x^2-1)/(x-2)<=0","solution_set",[[null,-1,false,true],[1,2,true,false]],[2]],
 ["x/(x-1)>2","solution_set",[[1,2,false,false]],[1]],
 ["x/(x-1)<0","solution_set",[[0,1,false,false]],[1]],
 ["x/(x-1)>=0","solution_set",[[null,0,false,true],[1,null,false,false]],[1]],
 ["x/(x-1)<=0","solution_set",[[0,1,true,false]],[1]],
 ["1/x>0","solution_set",[[0,null,false,false]],[0]],
 ["1/x<0","solution_set",[[null,0,false,false]],[0]],
 ["1/x>=0","solution_set",[[0,null,false,false]],[0]],
 ["1/x<=0","solution_set",[[null,0,false,false]],[0]],
 ["(x^2-4)/(x^2-1)>=0","solution_set",[[null,-2,false,true],[-1,1,false,false],[2,null,true,false]],[-1,1]],
 ["(x^2-4)/(x^2-1)>0","solution_set",[[null,-2,false,false],[-1,1,false,false],[2,null,false,false]],[-1,1]],
 ["(x^2-4)/(x^2-1)<0","solution_set",[[-2,-1,false,false],[1,2,false,false]],[-1,1]],
 ["(x^2-4)/(x^2-1)<=0","solution_set",[[-2,-1,true,false],[1,2,false,true]],[-1,1]],
 ["(x^2+1)/(x^2+2)>0","solution_set",[[null,null,false,false]],[]],
 ["(x^2+1)/(x^2+2)<0","empty_set",[],[]],
 ["(x^2+1)/(x^2+2)>=0","solution_set",[[null,null,false,false]],[]],
 ["(x^2+1)/(x^2+2)<=0","empty_set",[],[]],
 ["(x-1)/(x-1)>0","solution_set",[[null,1,false,false],[1,null,false,false]],[1]],
 ["(x-1)/(x-1)>=0","solution_set",[[null,1,false,false],[1,null,false,false]],[1]],
 ["(x-1)/(x-1)<0","empty_set",[],[1]],
 ["(x-1)/(x-1)<=0","empty_set",[],[1]],
 ["(x^2-1)/(x-1)>0","solution_set",[[-1,1,false,false],[1,null,false,false]],[1]],
 ["(x^2-1)/(x-1)>=0","solution_set",[[-1,1,true,false],[1,null,false,false]],[1]],
 ["(x^2-1)/(x-1)<0","solution_set",[[null,-1,false,false]], [1]],
 ["(x^2-1)/(x-1)<=0","solution_set",[[null,-1,false,true]], [1]],
 ["(x+1)/(x^2-1)>0","solution_set",[[1,null,false,false]],[-1,1]],
 ["(x+1)/(x^2-1)<0","solution_set",[[null,-1,false,false],[-1,1,false,false]],[-1,1]],
 ["(x+1)/(x^2-1)>=0","solution_set",[[1,null,false,false]],[-1,1]],
 ["(x+1)/(x^2-1)<=0","solution_set",[[null,-1,false,false],[-1,1,false,false]],[-1,1]],
 ["(x+2)/(2*x-4)>0","solution_set",[[null,-2,false,false],[2,null,false,false]],[2]],
 ["(x+2)/(2*x-4)<0","solution_set",[[-2,2,false,false]], [2]],
 ["(2*x+4)/(x-2)>=0","solution_set",[[null,-2,false,true],[2,null,false,false]],[2]],
 ["(x-4)/(x+1)>1","solution_set",[[-1,2,false,false]],[ -1]],
 ["(x-4)/(x+1)<=1","solution_set",[[-1,null,false,false]],[-1]],
 ["(x+1)/(x-1)>2","solution_set",[[1,3,false,false]],[1]],
 ["(x+1)/(x-1)<2","solution_set",[[null,1,false,false],[3,null,false,false]],[1]],
 ["(x+1)/(x-1)>=2","solution_set",[[1,3,false,true]],[1]],
 ["(x+1)/(x-1)<=2","solution_set",[[null,1,false,false],[3,null,true,false]],[1]],
 ["(x^2-9)/(x^2-4)>0","solution_set",[[null,-3,false,false],[-2,2,false,false],[3,null,false,false]],[-2,2]],
 ["(x^2-9)/(x^2-4)<0","solution_set",[[-3,-2,false,false],[2,3,false,false]],[-2,2]],
 ["(x^2-9)/(x^2-4)>=0","solution_set",[[null,-3,false,true],[-2,2,false,false],[3,null,true,false]],[-2,2]],
 ["(x^2-9)/(x^2-4)<=0","solution_set",[[-3,-2,true,false],[2,3,false,true]],[-2,2]],
 ["(x^2-1)/(x^2+1)>0","solution_set",[[null,-1,false,false],[1,null,false,false]],[]],
 ["(x^2-1)/(x^2+1)<=0","solution_set",[[-1,1,true,true]],[]],
 ["(x^2-1)/(x^2+1)<0","solution_set",[[-1,1,false,false]],[]]
];
for(const [src,status,expected,excluded] of cases)test("rationnelle "+src,()=>{const r=solve(src);assert.equal(r.status,status);assert.deepEqual(bounds(r),expected);assert.deepEqual(r.excludedValues,excluded);});
test("source préservée",()=>assert.equal(solve("(x-1)/(x+2)>0").source,"(x-1)/(x+2)>0"));
test("valeurs interdites explicitement exposées",()=>assert.deepEqual(solve("1/(x-2)>0").excludedValues,[2]));
test("racines du numérateur exposées",()=>assert.deepEqual(solve("(x-1)/(x+2)>=0").zeros,[1]));
test("numérateur conservé",()=>assert.deepEqual(solve("(x-1)/(x+2)>0").numerator,[-1,1]));
test("dénominateur conservé",()=>assert.deepEqual(solve("(x-1)/(x+2)>0").denominator,[2,1]));
test("degrés des polynômes exposés",()=>assert.deepEqual(solve("(x^2-1)/(x-2)>0").degree,{numerator:2,denominator:1}));
test("pôles jamais inclus",()=>{const r=solve("1/(x-3)>=0");assert.ok(!r.intervals.some(x=>x.lower===3&&x.lowerInclusive||x.upper===3&&x.upperInclusive));});
test("racine numérateur incluse pour large",()=>assert.ok(solve("(x-1)/(x+2)>=0").intervals[0].upperInclusive));
test("racine numérateur exclue pour strict",()=>assert.ok(!solve("(x-1)/(x+2)>0").intervals[0].upperInclusive));
test("fraction dans le membre droit",()=>assert.equal(solve("x>1/(x-2)").status,"solution_set"));
test("opérations rationnelles addition",()=>assert.equal(solve("1/x+1/(x-1)>0").status,"solution_set"));
test("opérations rationnelles soustraction",()=>assert.equal(solve("1/x-1/(x-1)>0").status,"solution_set"));
test("multiplication de fractions",()=>assert.equal(solve("(1/x)*(1/(x-1))>0").status,"solution_set"));
test("division de fractions",()=>assert.equal(solve("(1/x)/(1/(x-1))>0").status,"solution_set"));
test("puissance rationnelle autorisée",()=>assert.equal(solve("(1/x)^2>0").status,"solution_set"));
test("exposant supérieur refusé",()=>assert.equal(solve("(1/x)^3>0").status,"unsupported_expression"));
test("fonction non rationnelle refusée",()=>assert.equal(solve("sin(x)/x>0").status,"unsupported_expression"));
test("degré résultant supérieur à deux refusé",()=>assert.equal(solve("(x^2+1)*(x^2+2)>0").status,"unsupported_degree"));
test("deux variables refusées",()=>assert.equal(solve("(x+y)/(x-1)>0").status,"multiple_variables_unsupported"));
test("symbole d'unité ambigu refusé",()=>assert.equal(solve("(m-1)/(m+1)>0").status,"ambiguous_unit_symbol"));
test("pas de comparaison reconnu",()=>assert.equal(R.analyze("La balle tombe",M).status,"no_inequality_detected"));
test("équation non prise pour inéquation",()=>assert.equal(R.analyze("x=2",M).status,"no_inequality_detected"));
test("aucun eval",()=>assert.equal(R.analyze("1/x>0",M).policy.evalUsed,false));
test("aucune IA externe",()=>assert.equal(R.analyze("1/x>0",M).policy.externalAIUsed,false));
test("fonctionne hors ligne",()=>assert.equal(R.analyze("1/x>0",M).offline,true));
test("JSON sérialisable",()=>assert.doesNotThrow(()=>JSON.stringify(R.analyze("(x-1)/(x+2)>0",M))));
test("diagnostics au moins 15 capacités",()=>assert.ok(R.diagnostics().capabilities.length>=15));
test("diagnostics limitations explicites",()=>assert.ok(R.diagnostics().limitations.length>=6));
test("vérification de domaine déclarée",()=>assert.equal(solve("1/(x-2)>0").verification.denominatorRootsExcluded,true));
test("intervalles séparés autour d'un pôle",()=>assert.equal(solve("1/(x-2)>0").intervals.length,1));
test("annulation non effectuée et trou conservé",()=>assert.equal(solve("(x-1)/(x-1)>0").intervals.length,2));
test("dénominateur quadratique avec deux valeurs interdites",()=>assert.deepEqual(solve("1/(x^2-1)>0").excludedValues,[-1,1]));
test("racine double au dénominateur",()=>assert.deepEqual(solve("1/(x^2)>0").excludedValues,[0]));
test("racine double au numérateur",()=>assert.equal(solve("x^2/(x+1)>=0").status,"solution_set"));
test("point racine double inclus",()=>assert.ok(solve("x^2/(x+1)<=0").intervals.some(x=>x.lower===0&&x.upper===0)));
test("constante rationnelle positive",()=>assert.equal(solve("(x^2+1)/(x^2+2)>0").intervals.length,1));
test("constante rationnelle négative impossible",()=>assert.equal(solve("(x^2+1)/(x^2+2)<0").status,"empty_set"));
test("bornes non finies représentées par null",()=>assert.equal(solve("1/x>0").intervals[0].upper,null));
test("intervalles conservent les bornes ouvertes",()=>assert.equal(solve("1/x>0").intervals[0].lowerInclusive,false));
test("valeurs interdites triées",()=>assert.deepEqual(solve("1/(x^2-4)>0").excludedValues,[-2,2]));
test("plusieurs lignes analysées séparément",()=>assert.equal(R.analyze("1/x>0\n1/(x-1)<0",M).inequalities.length,2));
test("système n'affiche pas un résultat combiné",()=>assert.equal(R.analyze("1/x>0\n1/(x-1)<0",M).status,"multiple_inequalities_analyzed"));
