(function(root){
'use strict';
const VERSION='0.1.0',MAX_STEPS=30,MAX_ID=64,DEFAULT_TOLERANCE=1e-9;
const S=root.IdeeVisionScientific,A=root.IdeeVisionScientificAdvanced;
function fail(error,message){return {ok:false,error,message};}
function finite(v){return typeof v==='number'&&Number.isFinite(v);}
function tolerance(v){return finite(v)&&v>=0&&v<=1e-3?v:DEFAULT_TOLERANCE;}
function compare(a,b,tol){const t=tolerance(tol),delta=Math.abs(a-b),scale=Math.max(1,Math.abs(a),Math.abs(b));return {valid:delta<=t*scale,difference:delta,tolerance:t*scale};}
function verifyCalculation(expression,variables,claimedValue,options){
 if(!S)return fail('scientific-engine-unavailable','Le moteur scientifique de base est absent.');
 if(!finite(Number(claimedValue)))return fail('claimed-value-invalid','La valeur annoncée doit être un nombre fini.');
 const calculated=S.evaluateExpression(expression,variables||{});if(!calculated.ok)return Object.assign({stage:'calculation'},calculated);
 const check=compare(calculated.value,Number(claimedValue),options&&options.tolerance);
 let dimensions=null;
 if(options&&options.expectedUnit){
  dimensions=S.checkDimensions(expression,options.variableDimensions||{},options.expectedUnit);
  if(!dimensions.ok)return Object.assign({stage:'dimensions'},dimensions);
  if(!dimensions.valid)return fail('dimension-mismatch','Le résultat ne possède pas les dimensions de '+options.expectedUnit+'.');
 }
 return {ok:true,verified:check.valid,status:check.valid?'verified':'rejected',expression:String(expression),variables:Object.assign({},variables||{}),calculatedValue:calculated.value,claimedValue:Number(claimedValue),difference:check.difference,tolerance:check.tolerance,unit:options&&options.expectedUnit||null,dimensions,steps:['Évaluer l’expression avec le parseur mathématique sécurisé.','Comparer le résultat calculé à la valeur annoncée.'].concat(dimensions?['Vérifier la cohérence dimensionnelle avec '+options.expectedUnit+'.']:[])};
}
function proveEquation(equation,variable,solutions){
 if(!S||!A)return fail('scientific-solver-unavailable','Les solveurs scientifiques sont indisponibles.');
 const solved=S.solveEquation(equation,variable||'x');if(!solved.ok)return Object.assign({stage:'solve'},solved);
 if(solved.type==='identity')return {ok:true,verified:true,status:'identity',equation,variable:variable||'x',solutions:null,solver:solved,checks:[],steps:['Le solveur a ramené les deux membres à une identité.','Toutes les valeurs du domaine considéré satisfont cette égalité.'],scope:'Équation polynomiale réelle dans les limites du solveur.'};
 if(solved.type==='inconsistent'||solved.type==='quadratic-no-real-root')return {ok:true,verified:true,status:'no-solution',equation,variable:variable||'x',solutions:[],solver:solved,checks:[],steps:['Le solveur a établi que cette équation ne possède aucune solution réelle.'],scope:'Équation polynomiale réelle dans les limites du solveur.'};
 const checks=A.verifyEquation(equation,variable||'x',solved.solutions);if(!checks.ok)return checks;
 return {ok:true,verified:checks.allValid,status:checks.allValid?'verified':'rejected',equation,variable:variable||'x',solutions:solved.solutions.slice(),solver:solved,checks:checks.checks,steps:['Résoudre l’équation avec le solveur polynomial disponible.','Substituer chaque solution dans les deux membres.','Vérifier que les deux membres sont égaux pour chaque solution.'],scope:'Équation polynomiale réelle de degré au plus 2.'};
}
function verifyDimensions(expression,variableDimensions,expectedUnit){
 if(!S)return fail('scientific-engine-unavailable','Le moteur scientifique est absent.');
 const result=S.checkDimensions(expression,variableDimensions||{},expectedUnit);
 if(!result.ok)return result;
 return {ok:true,verified:result.valid,status:result.valid?'verified':'rejected',expression,expectedUnit:expectedUnit||null,dimensions:result.dimensions,expected:result.expected,message:result.message};
}
function resolveVariables(variables,results){
 const out={};for(const [key,value] of Object.entries(variables||{})){
  if(value&&typeof value==='object'&&typeof value.from==='string'){
   if(!Object.prototype.hasOwnProperty.call(results,value.from))return fail('step-reference-missing','Référence inconnue ou étape antérieure non validée : '+value.from);
   out[key]=results[value.from];
  }else out[key]=Number(value);
  if(!Number.isFinite(out[key]))return fail('step-variable-invalid','Valeur non numérique pour '+key+'.');
 }
 return {ok:true,values:out};
}
function verifyDerivation(steps){
 if(!Array.isArray(steps)||steps.length===0||steps.length>MAX_STEPS)return fail('proof-steps-invalid','Une démonstration doit contenir entre 1 et '+MAX_STEPS+' étapes.');
 const results=Object.create(null),trace=[];let allVerified=true;
 for(let i=0;i<steps.length;i++){
  const step=steps[i];if(!step||typeof step!=='object'||typeof step.id!=='string'||!step.id.trim()||step.id.length>MAX_ID||Object.prototype.hasOwnProperty.call(results,step.id))return fail('proof-step-id-invalid','Chaque étape doit avoir un identifiant unique valide.');
  let checked;
  if(step.type==='calculation'){
   const resolved=resolveVariables(step.variables,results);if(!resolved.ok)return Object.assign({step:step.id,index:i},resolved);
   checked=verifyCalculation(step.expression,resolved.values,Number(step.expectedValue),{tolerance:step.tolerance,expectedUnit:step.expectedUnit,variableDimensions:step.variableDimensions});
   if(checked.ok&&checked.verified)results[step.id]=checked.calculatedValue;
  }else if(step.type==='equation'){
   checked=proveEquation(step.equation,step.variable,step.solutions);
   if(checked.ok&&checked.verified&&Array.isArray(checked.solutions)&&checked.solutions.length===1)results[step.id]=checked.solutions[0];
   if(checked.ok&&checked.status==='identity')checked={...checked,note:'Identité reconnue, aucune valeur unique à transmettre.'};
  }else if(step.type==='dimensions'){
   checked=verifyDimensions(step.expression,step.variableDimensions,step.expectedUnit);
   if(checked.ok&&checked.verified)results[step.id]=1;
  }else return fail('proof-step-type-unsupported','Type d’étape non pris en charge : '+String(step.type));
  trace.push({id:step.id,type:step.type,verified:!!(checked&&checked.ok&&checked.verified),result:checked});
  if(!checked||!checked.ok||!checked.verified){allVerified=false;break;}
 }
 return {ok:true,verified:allVerified,status:allVerified?'verified':'incomplete-or-rejected',completedSteps:trace.length,totalSteps:steps.length,trace,results:Object.assign({},results),steps:allVerified?['Toutes les étapes fournies ont passé leurs contrôles.','Les valeurs référencées proviennent uniquement d’étapes antérieures vérifiées.']:['La chaîne de preuve est incomplète ou contient une étape non validée.','Les étapes suivantes n’ont pas été exécutées.'],limitations:['Vérification informatique des opérations prises en charge, pas preuve formelle universelle.','Une suite d’étapes correcte ne garantit pas que les hypothèses initiales décrivent le monde réel.']};
}
function compareResults(theoretical,measured,options){
 if(!finite(Number(theoretical))||!finite(Number(measured)))return fail('comparison-values-invalid','Les deux résultats doivent être numériques et finis.');
 const check=compare(Number(theoretical),Number(measured),options&&options.tolerance);
 return {ok:true,consistent:check.valid,status:check.valid?'consistent-within-tolerance':'difference-detected',theoretical:Number(theoretical),measured:Number(measured),absoluteDifference:check.difference,relativeDifference:Math.abs(Number(theoretical)-Number(measured))/Math.max(Math.abs(Number(theoretical)),Math.abs(Number(measured)),1e-30),tolerance:check.tolerance,unit:options&&options.unit||null,interpretation:check.valid?'Les résultats sont compatibles avec la tolérance choisie.':'Un écart supérieur à la tolérance est détecté; vérifier les mesures, unités et hypothèses.'};
}
function auditProblem(problem){
 if(!problem||typeof problem!=='object')return fail('problem-invalid','Un problème scientifique analysé est requis.');
 if(problem.kind==='equation'&&problem.equation)return proveEquation(problem.equation,'x',problem.solved&&problem.solved.solutions);
 if(problem.kind==='mechanics-problem'&&problem.solved&&problem.result){
  const r=problem.result,v=problem.values||{};
  const formulas={'newton-second-law':{expression:'mass*acceleration',variables:{mass:Number(v.mass),acceleration:Number(v.acceleration)},unit:'N',dims:{mass:[0,1,0,0,0],acceleration:[1,0,-2,0,0]}},'weight':{expression:'mass*gravity',variables:{mass:Number(v.mass),gravity:Number(v.gravity==null?9.81:v.gravity)},unit:'N',dims:{mass:[0,1,0,0,0],gravity:[1,0,-2,0,0]}},'kinetic-energy':{expression:'0.5*mass*speed^2',variables:{mass:Number(v.mass),speed:Number(v.speed)},unit:'J',dims:{mass:[0,1,0,0,0],speed:[1,0,-1,0,0]}},'uniform-motion':{expression:'distance/time',variables:{distance:Number(v.distance),time:Number(v.time)},unit:'mps',dims:{distance:[1,0,0,0,0],time:[0,0,1,0,0]}}};
  const f=formulas[problem.target];if(!f)return fail('problem-method-unsupported','Cette méthode n’a pas de vérificateur dédié.');
  return verifyCalculation(f.expression,f.variables,r.value,{expectedUnit:f.unit,variableDimensions:f.dims});
 }
 return fail('problem-not-verifiable','Aucun vérificateur dédié à ce type de problème.');
}
root.IdeeVisionScientificProof=Object.freeze({version:VERSION,verifyCalculation,proveEquation,verifyDimensions,verifyDerivation,compareResults,auditProblem,limits:Object.freeze({maxSteps:MAX_STEPS,maxStepIdLength:MAX_ID,defaultTolerance:DEFAULT_TOLERANCE})});
})(typeof window!=='undefined'?window:globalThis);
