(function(root){
'use strict';
const VERSION='0.1.0',MAX_EXPR=500,MAX_TOKENS=200,EPS=1e-10;
const UNITS={
 '1':{factor:1,d:[0,0,0,0,0]},m:{factor:1,d:[1,0,0,0,0]},km:{factor:1000,d:[1,0,0,0,0]},cm:{factor:.01,d:[1,0,0,0,0]},mm:{factor:.001,d:[1,0,0,0,0]},
 kg:{factor:1,d:[0,1,0,0,0]},g:{factor:.001,d:[0,1,0,0,0]},mg:{factor:.000001,d:[0,1,0,0,0]},
 s:{factor:1,d:[0,0,1,0,0]},min:{factor:60,d:[0,0,1,0,0]},h:{factor:3600,d:[0,0,1,0,0]},
 A:{factor:1,d:[0,0,0,1,0]},K:{factor:1,d:[0,0,0,0,1]},N:{factor:1,d:[1,1,-2,0,0]},J:{factor:1,d:[2,1,-2,0,0]},W:{factor:1,d:[2,1,-3,0,0]},Pa:{factor:1,d:[-1,1,-2,0,0]},Hz:{factor:1,d:[0,0,-1,0,0]},mps:{factor:1,d:[1,0,-1,0,0]},mps2:{factor:1,d:[1,0,-2,0,0]}
};
function fail(code,message){return {ok:false,error:code,message};}
function tokenize(source){
 if(typeof source!=='string'||!source.trim()||source.length>MAX_EXPR)throw new Error('expression-invalid');
 const tokens=[];const re=/\s*(?:(\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)|([A-Za-z_][A-Za-z0-9_]*)|(\+|-|\*|\/|\^|\(|\)))/gy;let pos=0;
 while(pos<source.length){re.lastIndex=pos;const m=re.exec(source);if(!m)throw new Error('token-invalid-at-'+pos);tokens.push(m[1]!==undefined?{type:'number',value:Number(m[1])}:m[2]!==undefined?{type:'name',value:m[2]}:{type:m[3],value:m[3]});pos=re.lastIndex;if(tokens.length>MAX_TOKENS)throw new Error('token-limit');}
 tokens.push({type:'eof'});return tokens;
}
function parse(source){
 const t=tokenize(source);let i=0;const peek=()=>t[i],take=()=>t[i++];
 function primary(){
  const x=take();if(x.type==='number')return {type:'number',value:x.value};
  if(x.type==='name')return {type:'variable',name:x.value};
  if(x.type==='-')return {type:'neg',value:primary()};
  if(x.type==='+')return primary();
  if(x.type==='('){const v=expression();if(take().type!==')')throw new Error('parenthesis-missing');return v;}
  throw new Error('expression-expected');
 }
 function power(){let a=primary();if(peek().type==='^'){take();a={type:'pow',left:a,right:power()};}return a;}
 function product(){let a=power();while(peek().type==='*'||peek().type==='/'){const op=take().type;a={type:op,left:a,right:power()};}return a;}
 function expression(){let a=product();while(peek().type==='+'||peek().type==='-'){const op=take().type;a={type:op,left:a,right:product()};}return a;}
 const ast=expression();if(peek().type!=='eof')throw new Error('unexpected-token');return ast;
}
function evaluateAst(ast,vars){
 switch(ast.type){
 case 'number':return ast.value;
 case 'variable':if(!vars||!Object.prototype.hasOwnProperty.call(vars,ast.name)||!Number.isFinite(Number(vars[ast.name])))throw new Error('variable-missing:'+ast.name);return Number(vars[ast.name]);
 case 'neg':return -evaluateAst(ast.value,vars);
 case '+':return evaluateAst(ast.left,vars)+evaluateAst(ast.right,vars);
 case '-':return evaluateAst(ast.left,vars)-evaluateAst(ast.right,vars);
 case '*':return evaluateAst(ast.left,vars)*evaluateAst(ast.right,vars);
 case '/':{const b=evaluateAst(ast.right,vars);if(Math.abs(b)<EPS)throw new Error('division-by-zero');return evaluateAst(ast.left,vars)/b;}
 case 'pow':{const a=evaluateAst(ast.left,vars),b=evaluateAst(ast.right,vars);if(Math.abs(a)<EPS&&b<0)throw new Error('division-by-zero');return Math.pow(a,b);}
 default:throw new Error('ast-invalid');
 }
}
function evaluateExpression(expression,variables){
 try{const value=evaluateAst(parse(expression),variables||{});if(!Number.isFinite(value))return fail('non-finite-result','Le résultat n’est pas un nombre fini.');return {ok:true,value,expression:String(expression),variables:Object.assign({},variables||{})};}
 catch(e){return fail(e.message,'Expression impossible à évaluer. Vérifie les variables et les opérateurs.');}
}
function poly(ast,variable){
 const zero=()=>[0,0,0],add=(a,b,s)=>a.map((v,i)=>v+s*b[i]),mul=(a,b)=>{const r=[0,0,0];for(let i=0;i<3;i++)for(let j=0;j<3;j++){if(i+j>2&&Math.abs(a[i]*b[j])>EPS)throw new Error('degree-above-two');if(i+j<=2)r[i+j]+=a[i]*b[j];}return r;};
 switch(ast.type){
 case 'number':return [ast.value,0,0];
 case 'variable':if(ast.name===variable)return [0,1,0];throw new Error('other-variable:'+ast.name);
 case 'neg':return poly(ast.value,variable).map(x=>-x);
 case '+':return add(poly(ast.left,variable),poly(ast.right,variable),1);
 case '-':return add(poly(ast.left,variable),poly(ast.right,variable),-1);
 case '*':return mul(poly(ast.left,variable),poly(ast.right,variable));
 case '/':{const b=poly(ast.right,variable);if(Math.abs(b[1])+Math.abs(b[2])>EPS)throw new Error('variable-denominator');if(Math.abs(b[0])<EPS)throw new Error('division-by-zero');return poly(ast.left,variable).map(x=>x/b[0]);}
 case 'pow':{const p=poly(ast.right,variable);if(Math.abs(p[1])+Math.abs(p[2])>EPS||!Number.isInteger(p[0])||p[0]<0||p[0]>2)throw new Error('unsupported-power');let out=[1,0,0],base=poly(ast.left,variable);for(let k=0;k<p[0];k++)out=mul(out,base);return out;}
 default:throw new Error('equation-invalid');
 }
}
function solveEquation(equation,variable){
 try{
  if(typeof equation!=='string'||equation.length>MAX_EXPR*2)return fail('equation-invalid','Équation invalide.');
  const parts=equation.split('=');if(parts.length!==2)return fail('equation-format','Utilise une seule égalité, par exemple 2*x+3=7.');
  const left=poly(parse(parts[0]),variable||'x'),right=poly(parse(parts[1]),variable||'x'),c=left.map((v,i)=>v-right[i]);let degree=2;while(degree>0&&Math.abs(c[degree])<EPS)degree--;
  if(degree===0)return Math.abs(c[0])<EPS?{ok:true,type:'identity',solutions:null,steps:['Les deux membres sont identiques : toutes les valeurs conviennent.']}:{ok:true,type:'inconsistent',solutions:[],steps:['Une égalité numérique fausse est obtenue : aucune solution.']};
  if(degree===1){const x=-c[0]/c[1];return {ok:true,type:'linear',solutions:[x],steps:['Regrouper les termes : '+c[1]+'·'+(variable||'x')+' + ('+c[0]+') = 0.','Isoler l’inconnue : '+(variable||'x')+' = '+x+'.']};}
  const delta=c[1]*c[1]-4*c[2]*c[0];if(delta< -EPS)return {ok:true,type:'quadratic-no-real-root',discriminant:delta,solutions:[],steps:['Calculer Δ = b² − 4ac = '+delta+'.','Δ est négatif : aucune solution réelle.']};
  if(Math.abs(delta)<EPS){const x=-c[1]/(2*c[2]);return {ok:true,type:'quadratic-double',discriminant:0,solutions:[x],steps:['Calculer Δ = 0.','La racine double est x = '+x+'.']};}
  const root=Math.sqrt(delta),solutions=[(-c[1]-root)/(2*c[2]),(-c[1]+root)/(2*c[2])].sort((a,b)=>a-b);
  return {ok:true,type:'quadratic',discriminant:delta,solutions,steps:['Identifier a = '+c[2]+', b = '+c[1]+', c = '+c[0]+'.','Calculer Δ = b² − 4ac = '+delta+'.','Appliquer x = (−b ± √Δ)/(2a).','Les deux solutions sont '+solutions.join(' et ')+'.']};
 }catch(e){return fail(e.message,'Cette équation dépasse les capacités du solveur polynomial actuel (degré 2).');}
}
function dimsEqual(a,b){return a.every((v,i)=>v===b[i]);}
function dimsAdd(a,b,sign){return a.map((v,i)=>v+sign*b[i]);}
function dimensionAst(ast,dimensions){
 switch(ast.type){
 case 'number':return [0,0,0,0,0];
 case 'variable':if(!dimensions||!dimensions[ast.name])throw new Error('dimension-missing:'+ast.name);return dimensions[ast.name].slice();
 case 'neg':return dimensionAst(ast.value,dimensions);
 case '+':case '-':{const a=dimensionAst(ast.left,dimensions),b=dimensionAst(ast.right,dimensions);if(!dimsEqual(a,b))throw new Error('dimension-mismatch-addition');return a;}
 case '*':return dimsAdd(dimensionAst(ast.left,dimensions),dimensionAst(ast.right,dimensions),1);
 case '/':return dimsAdd(dimensionAst(ast.left,dimensions),dimensionAst(ast.right,dimensions),-1);
 case 'pow':{const b=evaluateAst(ast.right,{});if(!Number.isInteger(b))throw new Error('dimension-power-not-integer');return dimensionAst(ast.left,dimensions).map(v=>v*b);}
 default:throw new Error('dimension-ast-invalid');
 }
}
function checkDimensions(expression,variableDimensions,expectedUnit){
 try{
  const actual=dimensionAst(parse(expression),variableDimensions||{});let expected=null;
  if(expectedUnit){if(!UNITS[expectedUnit])return fail('unit-unknown','Unité attendue inconnue : '+expectedUnit);expected=UNITS[expectedUnit].d;}
  const valid=!expected||dimsEqual(actual,expected);
  return {ok:true,valid,dimensions:actual,expected,unit:expectedUnit||null,message:valid?'Les dimensions sont cohérentes.':'Les dimensions calculées ne correspondent pas à l’unité attendue.'};
 }catch(e){return fail(e.message,'Analyse dimensionnelle impossible : vérifie les unités des variables.');}
}
function convertUnit(value,from,to){
 if(!Number.isFinite(Number(value)))return fail('value-invalid','Valeur numérique invalide.');
 if(!UNITS[from]||!UNITS[to])return fail('unit-unknown','Unité inconnue.');
 if(!dimsEqual(UNITS[from].d,UNITS[to].d))return fail('unit-incompatible','Ces unités ne mesurent pas la même grandeur.');
 const result=Number(value)*UNITS[from].factor/UNITS[to].factor;return {ok:true,value:result,from,to};
}
function evaluateFormula(expression,variables,variableUnits,resultUnit){
 const evaluated=evaluateExpression(expression,variables);if(!evaluated.ok)return evaluated;
 const dimensions={};Object.keys(variableUnits||{}).forEach(k=>{if(UNITS[variableUnits[k]])dimensions[k]=UNITS[variableUnits[k]].d;});
 const checked=checkDimensions(expression,dimensions,resultUnit);if(!checked.ok)return checked;
 if(!checked.valid)return fail('formula-dimension-mismatch','La formule produit des dimensions incompatibles avec '+resultUnit+'.');
 return {ok:true,value:evaluated.value,unit:resultUnit||null,dimensions:checked.dimensions};
}
function calculateMechanics(kind,values){
 const v=values||{};
 if(kind==='newton-second-law'){
  if(!['mass','acceleration'].every(k=>Number.isFinite(Number(v[k]))))return fail('input-missing','Il faut fournir mass et acceleration.');
  const m=Number(v.mass),a=Number(v.acceleration);if(m<0)return fail('mass-negative','La masse ne peut pas être négative.');
  return {ok:true,kind,formula:'F = m × a',value:m*a,unit:'N',steps:['Masse : '+m+' kg.','Accélération : '+a+' m/s².','Force résultante : F = m × a = '+(m*a)+' N.']};
 }
 if(kind==='kinetic-energy'){
  if(!['mass','speed'].every(k=>Number.isFinite(Number(v[k]))))return fail('input-missing','Il faut fournir mass et speed.');
  const m=Number(v.mass),speed=Number(v.speed);if(m<0)return fail('mass-negative','La masse ne peut pas être négative.');
  const value=.5*m*speed*speed;return {ok:true,kind,formula:'Ec = 1/2 × m × v²',value,unit:'J',steps:['Masse : '+m+' kg.','Vitesse : '+speed+' m/s.','Énergie cinétique : Ec = '+value+' J.']};
 }
 if(kind==='weight'){
  if(!Number.isFinite(Number(v.mass)))return fail('input-missing','Il faut fournir mass.');
  const m=Number(v.mass),g=v.gravity==null?9.81:Number(v.gravity);if(m<0||g<0||!Number.isFinite(g))return fail('input-invalid','Masse et gravité doivent être positives.');
  return {ok:true,kind,formula:'P = m × g',value:m*g,unit:'N',steps:['Masse : '+m+' kg.','Intensité de pesanteur : '+g+' m/s².','Poids : P = '+(m*g)+' N.']};
 }
 if(kind==='uniform-motion'){
  if(!['distance','time'].every(k=>Number.isFinite(Number(v[k]))))return fail('input-missing','Il faut fournir distance et time.');
  const d=Number(v.distance),t=Number(v.time);if(d<0||t<=0)return fail('input-invalid','Distance positive ou nulle et durée strictement positive requises.');
  return {ok:true,kind,formula:'v = d / t',value:d/t,unit:'m/s',steps:['Distance : '+d+' m.','Durée : '+t+' s.','Vitesse moyenne : v = '+(d/t)+' m/s.']};
 }
 return fail('mechanics-method-unknown','Méthode de mécanique inconnue.');
}
function listUnits(){return Object.keys(UNITS).sort().map(symbol=>({symbol,factorToSI:UNITS[symbol].factor,dimensions:UNITS[symbol].d.slice()}));}
root.IdeeVisionScientific=Object.freeze({version:VERSION,parse,evaluateExpression,solveEquation,checkDimensions,convertUnit,evaluateFormula,calculateMechanics,listUnits,limits:Object.freeze({maxExpressionLength:MAX_EXPR,maxTokens:MAX_TOKENS,maxPolynomialDegree:2})});
})(typeof window!=='undefined'?window:globalThis);
