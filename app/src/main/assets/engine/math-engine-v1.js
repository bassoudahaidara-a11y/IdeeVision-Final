/* Idée Vision — Math Engine v1: safe parser and elementary symbolic algebra. */
(function(root){"use strict";
const VERSION="1.0.0",MAX_LENGTH=240,MAX_DEGREE=8,EPS=1e-10;
function tokenize(input){
 const s=String(input||"").replace(/,/g,".");if(s.length>MAX_LENGTH)throw Error("Expression trop longue.");
 const out=[];let i=0;
 while(i<s.length){if(/\s/.test(s[i])){i++;continue;}const rest=s.slice(i);
 let m=rest.match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/i);
 if(m){out.push({type:"num",value:Number(m[0])});i+=m[0].length;continue;}
 m=rest.match(/^[a-zA-Z]+/);if(m){const name=m[0].toLowerCase();if(name!=="x")throw Error("Seule la variable x est acceptée.");out.push({type:"x"});i++;continue;}
 if("+-*/^()".includes(s[i])){out.push({type:s[i],value:s[i]});i++;continue;}
 throw Error("Caractère non autorisé : "+s[i]);
 }return out;
}
function parse(input){
 const t=tokenize(input);let p=0;
 function expr(){let n=term();while(t[p]&&(t[p].type==="+"||t[p].type==="-")){const op=t[p++].type;n={type:"bin",op,left:n,right:term()};}return n;}
 function term(){let n=power();while(t[p]&&(t[p].type==="*"||t[p].type==="/")){const op=t[p++].type;n={type:"bin",op,left:n,right:power()};}return n;}
 function power(){let n=unary();if(t[p]&&t[p].type==="^"){p++;n={type:"bin",op:"^",left:n,right:power()};}return n;}
 function unary(){if(t[p]&&(t[p].type==="+"||t[p].type==="-")){const op=t[p++].type;return {type:"un",op,arg:unary()};}return atom();}
 function atom(){const z=t[p++];if(!z)throw Error("Expression incomplète.");if(z.type==="num")return {type:"num",value:z.value};if(z.type==="x")return {type:"x"};if(z.type==="("){const n=expr();if(!t[p]||t[p++].type!==")")throw Error("Parenthèse fermante manquante.");return n;}throw Error("Nombre ou variable attendu.");}
 const ast=expr();if(p!==t.length)throw Error("Expression non reconnue.");return ast;
}
function evaluateAst(n,x){if(n.type==="num")return n.value;if(n.type==="x")return x;if(n.type==="un")return n.op==="-"?-evaluateAst(n.arg,x):evaluateAst(n.arg,x);
 const a=evaluateAst(n.left,x),b=evaluateAst(n.right,x);let v;
 if(n.op==="+")v=a+b;else if(n.op==="-")v=a-b;else if(n.op==="*")v=a*b;else if(n.op==="/"){if(b===0)throw Error("Division par zéro.");v=a/b;}else {if(Math.abs(b)>100||Math.abs(a)>1e100)throw Error("Puissance hors limite.");v=Math.pow(a,b);}
 if(!Number.isFinite(v))throw Error("Résultat non fini.");return v;
}
function evaluate(expression,x=0){if(!Number.isFinite(Number(x)))throw Error("Valeur de x invalide.");return evaluateAst(parse(expression),Number(x));}
function poly(n){
 if(n.type==="num")return [n.value];if(n.type==="x")return [0,1];
 if(n.type==="un"){const a=poly(n.arg);return n.op==="-"?a.map(v=>-v):a;}
 const a=poly(n.left),b=poly(n.right),out=Array(Math.max(a.length,b.length)).fill(0);
 if(n.op==="+"||n.op==="-"){for(let i=0;i<out.length;i++)out[i]=(a[i]||0)+(n.op==="+"?1:-1)*(b[i]||0);return trim(out);}
 if(n.op==="*"){if(a.length+b.length-2>MAX_DEGREE)throw Error("Degré maximal dépassé.");const c=Array(a.length+b.length-1).fill(0);a.forEach((v,i)=>b.forEach((w,j)=>c[i+j]+=v*w));return trim(c);}
 if(n.op==="/"){if(b.length!==1||Math.abs(b[0])<EPS)throw Error("Division polynomiale non prise en charge.");return trim(a.map(v=>v/b[0]));}
 if(n.op==="^"){if(b.length!==1||!Number.isInteger(b[0])||b[0]<0||b[0]>MAX_DEGREE)throw Error("Exposant polynomial invalide.");let c=[1];for(let i=0;i<b[0];i++)c=polyMul(c,a);return trim(c);}
 throw Error("Opération symbolique inconnue.");
}
function polyMul(a,b){const c=Array(a.length+b.length-1).fill(0);a.forEach((v,i)=>b.forEach((w,j)=>c[i+j]+=v*w));return trim(c);}
function trim(a){while(a.length>1&&Math.abs(a[a.length-1])<EPS)a.pop();return a;}
function toPolynomial(expression){const c=trim(poly(parse(expression)));return {coefficients:c,degree:c.length-1};}
function formatNumber(n){if(Math.abs(n)<EPS)return "0";return Number(n.toPrecision(10)).toString();}
function formatPolynomial(coeff){const terms=[];for(let i=coeff.length-1;i>=0;i--){const c=coeff[i];if(Math.abs(c)<EPS)continue;const sign=c<0?" - ":" + ",a=Math.abs(c),body=i===0?formatNumber(a):((Math.abs(a-1)<EPS?"":formatNumber(a)+"*")+"x"+(i===1?"":"^"+i));terms.push({sign,body,negative:c<0});}if(!terms.length)return "0";return (terms[0].negative?"-":"")+terms[0].body+terms.slice(1).map(t=>t.sign+t.body).join("");}
function simplify(expression){return formatPolynomial(toPolynomial(expression).coefficients);}
function derivative(expression){const c=toPolynomial(expression).coefficients;if(c.length===1)return "0";const d=c.slice(1).map((v,i)=>v*(i+1));return formatPolynomial(d);}
function integrate(expression,constant=0){const c=toPolynomial(expression).coefficients;if(!Number.isFinite(Number(constant)))throw Error("Constante invalide.");const d=[Number(constant),...c.map((v,i)=>v/(i+1))];return formatPolynomial(d);}
function solveLinear(a,b){a=Number(a);b=Number(b);if(!Number.isFinite(a)||!Number.isFinite(b))throw Error("Coefficients invalides.");if(Math.abs(a)<EPS)return Math.abs(b)<EPS?{kind:"infinite"}:{kind:"none"};return {kind:"unique",x:-b/a};}
function solveQuadratic(a,b,c){[a,b,c]=[a,b,c].map(Number);if(![a,b,c].every(Number.isFinite))throw Error("Coefficients invalides.");if(Math.abs(a)<EPS)return solveLinear(b,c);const delta=b*b-4*a*c;if(delta<-EPS)return {kind:"none",discriminant:delta};if(Math.abs(delta)<EPS)return {kind:"double",discriminant:0,roots:[-b/(2*a)]};const d=Math.sqrt(delta);return {kind:"two",discriminant:delta,roots:[(-b-d)/(2*a),(-b+d)/(2*a)].sort((x,y)=>x-y)};}
function solvePolynomial(expression){const c=toPolynomial(expression).coefficients;if(c.length===1)return Math.abs(c[0])<EPS?{kind:"all"}:{kind:"none"};if(c.length===2)return solveLinear(c[1],c[0]);if(c.length===3)return solveQuadratic(c[2],c[1],c[0]);return {kind:"unsupported",degree:c.length-1,reason:"La résolution exacte est limitée aux degrés 1 et 2."};}
function solveEquation(left,right){const a=toPolynomial(left).coefficients,b=toPolynomial(right).coefficients,n=Math.max(a.length,b.length),c=Array(n).fill(0);for(let i=0;i<n;i++)c[i]=(a[i]||0)-(b[i]||0);return solvePolynomial(formatPolynomial(c));}
function solveSystem2x2(a,b,c,d,e,f){[a,b,c,d,e,f]=[a,b,c,d,e,f].map(Number);if(![a,b,c,d,e,f].every(Number.isFinite))throw Error("Coefficients invalides.");const det=a*d-b*c;if(Math.abs(det)<EPS)return {kind:"singular"};return {kind:"unique",x:(e*d-b*f)/det,y:(a*f-e*c)/det,determinant:det};}
function evaluateMany(expression,values){if(!Array.isArray(values)||values.length>1000)throw Error("Liste de valeurs invalide.");return values.map(x=>({x,value:evaluate(expression,x)}));}
function rootsCheck(expression,roots,tolerance=1e-7){return roots.map(x=>({x,residual:evaluate(expression,x),valid:Math.abs(evaluate(expression,x))<=tolerance}));}
function domainWarnings(expression){const s=String(expression),w=[];if(/\/\s*0(?:\D|$)/.test(s))w.push("Division explicite par zéro possible.");if(/\^\s*-/.test(s))w.push("Une puissance négative peut exclure x = 0.");return w;}
function statistics(values){if(!Array.isArray(values)||!values.length||values.some(v=>!Number.isFinite(Number(v))))throw Error("Données numériques invalides.");const a=values.map(Number).sort((x,y)=>x-y),sum=a.reduce((x,y)=>x+y,0),mid=Math.floor(a.length/2);return {count:a.length,sum,mean:sum/a.length,median:a.length%2?a[mid]:(a[mid-1]+a[mid])/2,min:a[0],max:a[a.length-1]};}
function gcd(a,b){a=Math.abs(Math.trunc(a));b=Math.abs(Math.trunc(b));while(b){const t=b;b=a%b;a=t;}return a;}
function lcm(a,b){a=Math.trunc(a);b=Math.trunc(b);if(!a||!b)return 0;return Math.abs(a/gcd(a,b)*b);}
function fraction(n,d){n=Number(n);d=Number(d);if(!Number.isInteger(n)||!Number.isInteger(d)||d===0)throw Error("Fraction invalide.");const g=gcd(n,d),sign=d<0?-1:1;return {numerator:sign*n/g,denominator:Math.abs(d/g)};}
function percentage(part,total){part=Number(part);total=Number(total);if(!Number.isFinite(part)||!Number.isFinite(total)||total===0)throw Error("Total invalide.");return 100*part/total;}
function quadraticVertex(a,b,c){[a,b,c]=[a,b,c].map(Number);if(![a,b,c].every(Number.isFinite)||Math.abs(a)<EPS)throw Error("Parabole invalide.");const x=-b/(2*a),y=a*x*x+b*x+c;return {x,y};}
function discriminant(a,b,c){return Number(b)**2-4*Number(a)*Number(c);}
function buildAudit(request){const s=String(request||""),formulas=[];if(/derive|dériv|derivative/i.test(s))formulas.push("dérivée");if(/integr/i.test(s))formulas.push("primitive/intégrale");if(/polyn|racine|discriminant/i.test(s))formulas.push("polynôme");if(/equation|équation|systeme|système/i.test(s))formulas.push("équation/système");return {engine:"IdeeVisionMath",version:VERSION,topics:formulas,request:s.slice(0,MAX_LENGTH),limits:["Parseur limité à +, -, *, /, ^, x et parenthèses.","Résolution exacte des équations limitée aux degrés 1 et 2.","Pas de trigonométrie, logarithmes ou nombres complexes dans cette version."]};}
function toPromptContext(a){if(!a||a.engine!=="IdeeVisionMath")throw TypeError("Audit mathématique invalide.");return ["ASSISTANT MATHÉMATIQUE SYMBOLIQUE","Sujets détectés : "+(a.topics.join(", ")||"aucun"),"Utiliser le calcul symbolique uniquement si l'expression est compatible avec le parseur.","Vérifier les solutions en les remplaçant dans l'équation originale ; détailler les étapes et les domaines de définition.","Ne pas prétendre résoudre exactement les fonctions non prises en charge."].join("\\n"); }
function diagnostics(){return {name:"Idée Vision Math",version:VERSION,offline:true,parser:"safe recursive descent",maxDegree:MAX_DEGREE,operations:["evaluate","polynomial","derivative","integral","linear/quadratic equations","2x2 systems","statistics","fractions"]};}
root.IdeeVisionMath=Object.freeze({version:VERSION,tokenize,parse,evaluate,toPolynomial,simplify,derivative,integrate,solveLinear,solveQuadratic,solvePolynomial,solveEquation,solveSystem2x2,evaluateMany,rootsCheck,domainWarnings,statistics,gcd,lcm,fraction,percentage,quadraticVertex,discriminant,buildAudit,toPromptContext,diagnostics});
if(typeof module!=="undefined"&&module.exports)module.exports=root.IdeeVisionMath;
})(typeof window!=="undefined"?window:globalThis);
