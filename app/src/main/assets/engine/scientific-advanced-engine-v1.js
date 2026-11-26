(function(root){
'use strict';
const BASE=root.IdeeVisionScientific,VERSION='0.1.0',EPS=1e-10,MAX_SIZE=12,MAX_DEGREE=8;
function fail(error,message){return {ok:false,error,message};}
function polynomial(ast){
 const zero=()=>Array(MAX_DEGREE+1).fill(0);
 function add(a,b,sign){const r=zero();for(let i=0;i<=MAX_DEGREE;i++)r[i]=a[i]+sign*b[i];return r;}
 function mul(a,b){const r=zero();for(let i=0;i<=MAX_DEGREE;i++)for(let j=0;j<=MAX_DEGREE;j++){if(i+j>MAX_DEGREE&&Math.abs(a[i]*b[j])>EPS)throw Error('polynomial-degree-limit');if(i+j<=MAX_DEGREE)r[i+j]+=a[i]*b[j];}return r;}
 switch(ast.type){
 case 'number':{const r=zero();r[0]=ast.value;return r;}
 case 'variable':{const r=zero();r[1]=1;return r;}
 case 'neg':return polynomial(ast.value).map(x=>-x);
 case '+':return add(polynomial(ast.left),polynomial(ast.right),1);
 case '-':return add(polynomial(ast.left),polynomial(ast.right),-1);
 case '*':return mul(polynomial(ast.left),polynomial(ast.right));
 case '/':{const d=polynomial(ast.right);if(d.slice(1).some(x=>Math.abs(x)>EPS)||Math.abs(d[0])<EPS)throw Error('polynomial-division-unsupported');return polynomial(ast.left).map(x=>x/d[0]);}
 case 'pow':{const p=polynomial(ast.right);if(p.slice(1).some(x=>Math.abs(x)>EPS)||!Number.isInteger(p[0])||p[0]<0||p[0]>MAX_DEGREE)throw Error('polynomial-power-unsupported');let r=zero();r[0]=1;const b=polynomial(ast.left);for(let i=0;i<p[0];i++)r=mul(r,b);return r;}
 default:throw Error('polynomial-expression-unsupported');
 }
}
function formatPolynomial(c,variable){
 const terms=[];for(let i=c.length-1;i>=0;i--){const v=c[i];if(Math.abs(v)<EPS)continue;const magnitude=Math.abs(v),body=(i===0||Math.abs(magnitude-1)>EPS?String(Number(magnitude.toPrecision(10))):'')+(i===0?'':(i===1?variable:variable+'^'+i));if(!terms.length)terms.push((v<0?'-':'')+body);else terms.push((v<0?' - ':' + ')+body);}return terms.join('')||'0';
}
function symbolic(source,variable,operation){
 if(!BASE)return fail('scientific-engine-unavailable','Le moteur scientifique de base est absent.');
 try{
  const ast=BASE.parse(source),coefficients=polynomial(ast),result=Array(MAX_DEGREE+1).fill(0);
  if(operation==='differentiate'){for(let i=1;i<=MAX_DEGREE;i++)result[i-1]=coefficients[i]*i;}
  else if(operation==='integrate'){for(let i=0;i<=MAX_DEGREE;i++){if(Math.abs(coefficients[i])>EPS&&i+1>MAX_DEGREE)throw Error('polynomial-degree-limit');result[i+1]=coefficients[i]/(i+1);}}
  else return fail('operation-unknown','Opération symbolique inconnue.');
  return {ok:true,operation,variable,coefficients:result.slice(0,MAX_DEGREE+1),expression:formatPolynomial(result,variable),steps:operation==='differentiate'?['Dériver chaque terme séparément.','Multiplier le coefficient par son exposant puis diminuer cet exposant de 1.']:['Intégrer chaque terme séparément.','Augmenter chaque exposant de 1 puis diviser le coefficient par ce nouvel exposant.','Ajouter la constante arbitraire C.'],constantOfIntegration:operation==='integrate'?' + C':null};
 }catch(e){return fail(e.message,'Cette expression ne peut pas être traitée comme un polynôme dans les limites actuelles.');}
}
function solveLinearSystem(matrix,vector){
 if(!Array.isArray(matrix)||!Array.isArray(vector)||matrix.length<1||matrix.length>MAX_SIZE||matrix.length!==vector.length)return fail('system-shape-invalid','Le système doit avoir autant d’équations que d’inconnues.');
 const n=matrix.length,a=[];
 for(let i=0;i<n;i++){if(!Array.isArray(matrix[i])||matrix[i].length!==n||matrix[i].some(x=>!Number.isFinite(x))||!Number.isFinite(vector[i]))return fail('system-values-invalid','La matrice doit être carrée et contenir uniquement des nombres finis.');a.push(matrix[i].slice().concat(vector[i]));}
 let swaps=0;
 for(let col=0;col<n;col++){
  let pivot=col;for(let row=col+1;row<n;row++)if(Math.abs(a[row][col])>Math.abs(a[pivot][col]))pivot=row;
  if(Math.abs(a[pivot][col])<EPS)return {ok:true,solvable:false,type:'singular-or-underdetermined',solutions:null,rank:col,steps:['Un pivot nul ou presque nul a été rencontré : le système ne possède pas une solution unique.']};
  if(pivot!==col){[a[pivot],a[col]]=[a[col],a[pivot]];swaps++;}
  const div=a[col][col];for(let j=col;j<=n;j++)a[col][j]/=div;
  for(let row=0;row<n;row++){if(row===col)continue;const factor=a[row][col];for(let j=col;j<=n;j++)a[row][j]-=factor*a[col][j];}
 }
 const solutions=a.map(row=>row[n]);return {ok:true,solvable:true,type:'unique',solutions,rank:n,swaps,steps:['Appliquer l’élimination de Gauss avec pivot partiel.','Réduire la matrice augmentée jusqu’à obtenir les inconnues.','Solutions : '+solutions.join(', ')+'.']};
}
function evaluatePolynomial(coefficients,x){return coefficients.reduceRight((acc,c)=>acc*x+c,0);}
function verifyEquation(equation,variable,solutions){
 if(!BASE||!Array.isArray(solutions))return fail('verification-input-invalid','Fournis une équation et une liste de solutions.');
 const parts=String(equation).split('=');if(parts.length!==2)return fail('equation-format','Une seule égalité est attendue.');
 try{
  const left=polynomial(BASE.parse(parts[0])),right=polynomial(BASE.parse(parts[1]));
  const checks=solutions.map(x=>{if(!Number.isFinite(x))return {value:x,valid:false,error:'solution-non-finite'};const difference=evaluatePolynomial(left,x)-evaluatePolynomial(right,x);return {value:x,left:evaluatePolynomial(left,x),right:evaluatePolynomial(right,x),difference,valid:Math.abs(difference)<=1e-7*Math.max(1,Math.abs(evaluatePolynomial(left,x)),Math.abs(evaluatePolynomial(right,x)))};});
  return {ok:true,checks,allValid:checks.every(x=>x.valid),steps:['Remplacer l’inconnue par chaque solution proposée.','Comparer les deux membres de l’égalité.']};
 }catch(e){return fail(e.message,'Vérification impossible pour cette équation.');}
}
function projectile(values){
 const v=values||{},v0=Number(v.initialSpeed),angle=Number(v.angleDegrees),g=v.gravity==null?9.81:Number(v.gravity);
 if(!Number.isFinite(v0)||!Number.isFinite(angle)||!Number.isFinite(g)||v0<0||g<=0||angle<0||angle>90)return fail('projectile-input-invalid','Il faut une vitesse positive ou nulle, un angle entre 0° et 90° et une gravité positive.');
 const rad=angle*Math.PI/180,vx=v0*Math.cos(rad),vy=v0*Math.sin(rad),flight=2*vy/g,range=vx*flight,height=vy*vy/(2*g);
 const at=t=>{if(!Number.isFinite(t)||t<0||t>flight+EPS)return fail('time-out-of-range','Le temps doit être compris entre le lancement et le retour au niveau initial.');return {ok:true,time:t,x:vx*t,y:vy*t-.5*g*t*t,vx,vy:g*t*-1+vy};};
 return {ok:true,kind:'ideal-projectile',assumptions:['Sans résistance de l’air.','Gravité constante.','Départ et arrivée à la même hauteur.'],horizontalSpeed:vx,verticalSpeed:vy,flightTime:flight,range,maximumHeight:height,at};
}
root.IdeeVisionScientificAdvanced=Object.freeze({version:VERSION,differentiate:(e,v)=>symbolic(e,v||'x','differentiate'),integrate:(e,v)=>symbolic(e,v||'x','integrate'),solveLinearSystem,verifyEquation,projectile,limits:Object.freeze({maxSystemSize:MAX_SIZE,maxPolynomialDegree:MAX_DEGREE})});
})(typeof window!=='undefined'?window:globalThis);
