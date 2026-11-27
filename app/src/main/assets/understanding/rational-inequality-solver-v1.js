/* Idée Vision — Inéquations rationnelles et valeurs interdites v1 */
(function(root){"use strict";
const VERSION="1.0.0",EPS=1e-9,MAX_DEGREE=2;
function trim(p){const a=p.slice();while(a.length>1&&Math.abs(a[a.length-1])<EPS)a.pop();return a.map(x=>Math.abs(x)<EPS?0:Number(x.toPrecision(12)));}
function add(a,b,s=1){const o=Array(Math.max(a.length,b.length)).fill(0);for(let i=0;i<o.length;i++)o[i]=(a[i]||0)+s*(b[i]||0);return trim(o);}
function mul(a,b){const o=Array(a.length+b.length-1).fill(0);for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)o[i+j]+=a[i]*b[j];return trim(o);}
function degree(p){return trim(p).length-1;}
function zero(p){return trim(p).every(x=>Math.abs(x)<EPS);}
function val(p,x){return p.reduce((s,c,i)=>s+c*Math.pow(x,i),0);}
function roots(p){p=trim(p);if(p.length===1)return [];if(p.length===2)return [-p[0]/p[1]].map(clean);const [c,b,a]=p,d=b*b-4*a*c;if(d< -EPS)return [];if(Math.abs(d)<=EPS)return [clean(-b/(2*a))];const s=Math.sqrt(d);return [clean((-b-s)/(2*a)),clean((-b+s)/(2*a))].sort((x,y)=>x-y);}
function clean(x){return Math.abs(x)<EPS?0:Number(x.toPrecision(12));}
function unwrap(n){while(n&&n.type==="group")n=n.expression;return n;}
function rat(n,name){
 n=unwrap(n);if(!n)return {ok:false,code:"missing_expression"};
 if(n.type==="number")return {ok:true,n:[Number(n.value)],d:[1]};
 if(n.type==="variable"||n.type==="unit_or_variable")return n.name===name?{ok:true,n:[0,1],d:[1]}:{ok:false,code:"unexpected_variable"};
 if(n.type==="unary"){const a=rat(n.argument,name);if(!a.ok)return a;return n.operator==="-"?{ok:true,n:a.n.map(x=>-x),d:a.d}:a;}
 if(n.type!=="binary")return {ok:false,code:"unsupported_ast_node"};
 const a=rat(n.left,name),b=rat(n.right,name);if(!a.ok)return a;if(!b.ok)return b;
 let out;
 switch(n.operator){
 case "+":out={n:add(mul(a.n,b.d),mul(b.n,a.d)),d:mul(a.d,b.d)};break;
 case "-":out={n:add(mul(a.n,b.d),mul(b.n,a.d),-1),d:mul(a.d,b.d)};break;
 case "*":case "×":case "·":out={n:mul(a.n,b.n),d:mul(a.d,b.d)};break;
 case "/":case "÷":if(zero(b.n))return {ok:false,code:"division_by_zero_expression"};out={n:mul(a.n,b.d),d:mul(a.d,b.n)};break;
 case "^":if(b.d.length!==1||Math.abs(b.d[0]-1)>EPS||b.n.length!==1||!Number.isInteger(b.n[0])||b.n[0]<0||b.n[0]>2)return {ok:false,code:"rational_power_must_be_integer_zero_to_two"};out={n:[1],d:[1]};for(let i=0;i<b.n[0];i++){out.n=mul(out.n,a.n);out.d=mul(out.d,a.d);}break;
 default:return {ok:false,code:"unsupported_operator"};
 }
 if(degree(out.n)>MAX_DEGREE||degree(out.d)>MAX_DEGREE)return {ok:false,code:"polynomial_degree_exceeds_two"};
 if(zero(out.d))return {ok:false,code:"zero_denominator"};
 return {ok:true,n:trim(out.n),d:trim(out.d)};
}
function test(v,op){if(op===">")return v>EPS;if(op==="<")return v< -EPS;if(op===">="||op==="≥")return v>=-EPS;if(op==="<="||op==="≤")return v<=EPS;if(op==="≠"||op==="!=")return Math.abs(v)>EPS;return false;}
function normalize(items){
 const a=items.slice().sort((x,y)=>(x.lower===null?-Infinity:x.lower)-(y.lower===null?-Infinity:y.lower)),o=[];
 for(const z of a){const p=o[o.length-1];if(!p){o.push({...z});continue;}
  const touches=p.upper===null||z.lower===null||(z.lower<p.upper+EPS&&(z.lower<=p.upper+EPS));
  if(touches&&(p.upper===null||z.lower===null||z.lower<p.upper-EPS||p.upperInclusive||z.lowerInclusive)){
   if(p.upper===null||z.upper===null){p.upper=null;p.upperInclusive=false;}else if(z.upper>p.upper+EPS){p.upper=z.upper;p.upperInclusive=z.upperInclusive;}else if(Math.abs(z.upper-p.upper)<=EPS)p.upperInclusive=p.upperInclusive||z.upperInclusive;
  }else o.push({...z});
 }
 return o;
}
function solveOne(source,M){
 const parsed=M.parse(source),ast=unwrap(parsed.ast);
 if(parsed.kind!=="inequality"||parsed.issues.length||!ast||ast.type!=="binary")return {source,status:"unsupported_or_invalid",intervals:[],excludedValues:[],issues:[{code:"inequality_required"}]};
 const op=ast.operator;if(![">","<",">=","<=","≥","≤","≠"].includes(op))return {source,status:"unsupported_relation",intervals:[],excludedValues:[],issues:[{code:"unsupported_comparison_operator"}]};
 if(parsed.comparisons.length!==1)return {source,status:"multiple_relations_unsupported",intervals:[],excludedValues:[],issues:[{code:"exactly_one_comparison_required"}]};
 const names=[...new Set(parsed.variables.map(x=>x.name))].sort();
 if(parsed.unitCandidates.length)return {source,status:"ambiguous_unit_symbol",variables:names,intervals:[],excludedValues:[],issues:[{code:"unit_symbol_ambiguous"}]};
 if(names.length>1)return {source,status:"multiple_variables_unsupported",variables:names,intervals:[],excludedValues:[],issues:[{code:"one_variable_required"}]};
 const name=names[0]||null;
 if(!name){
  const l=rat(ast.left,""),r=rat(ast.right,"");if(!l.ok||!r.ok)return {source,status:"unsupported_expression",variables:[],intervals:[],excludedValues:[],issues:[{code:"constant_expression_required"}]};
  const n=add(mul(l.n,r.d),mul(r.n,l.d),-1),d=mul(l.d,r.d),yes=!zero(d)&&test(val(n,0)/val(d,0),op);
  return {source,status:yes?"all_real_numbers":"empty_set",variables:[],numerator:n,denominator:d,intervals:yes?[{lower:null,upper:null,lowerInclusive:false,upperInclusive:false}]:[],excludedValues:roots(d),issues:[]};
 }
 const l=rat(ast.left,name),r=rat(ast.right,name);
 if(!l.ok||!r.ok)return {source,status:"unsupported_expression",variables:names,intervals:[],excludedValues:[],issues:[{code:l.code||r.code}]};
 const numerator=add(mul(l.n,r.d),mul(r.n,l.d),-1),denominator=mul(l.d,r.d);
 if(degree(numerator)>MAX_DEGREE||degree(denominator)>MAX_DEGREE)return {source,status:"unsupported_degree",variables:names,intervals:[],excludedValues:[],issues:[{code:"resulting_polynomial_degree_exceeds_two"}]};
 if(zero(denominator))return {source,status:"undefined_expression",variables:names,intervals:[],excludedValues:[],issues:[{code:"identically_zero_denominator"}]};
 const zeros=roots(numerator),poles=roots(denominator),critical=[...new Set(zeros.concat(poles).map(clean))].sort((a,b)=>a-b),points=[null,...critical,null],segments=[];
 for(let i=0;i<points.length-1;i++){
  const lo=points[i],hi=points[i+1],sample=lo===null?(hi===null?0:hi-Math.max(1,Math.abs(hi)+1)):hi===null?lo+Math.max(1,Math.abs(lo)+1):(lo+hi)/2;
  const den=val(denominator,sample);if(Math.abs(den)<EPS)continue;
  if(test(val(numerator,sample)/den,op))segments.push({lower:lo,upper:hi,lowerInclusive:false,upperInclusive:false});
 }
 for(const x of critical){const den=val(denominator,x);if(Math.abs(den)<EPS)continue;const v=val(numerator,x)/den;if(test(v,op))segments.push({lower:x,upper:x,lowerInclusive:true,upperInclusive:true});}
 const intervals=normalize(segments).map(x=>({...x,lower:x.lower===null?null:clean(x.lower),upper:x.upper===null?null:clean(x.upper)}));
 const status=intervals.length?"solution_set":"empty_set";
 return {source,status,relation:op,variables:names,degree:{numerator:degree(numerator),denominator:degree(denominator)},numerator,denominator,criticalPoints:critical,zeros:zeros.map(clean),excludedValues:poles.map(clean),intervals,verification:{numeratorRootsChecked:true,denominatorRootsExcluded:true,signIntervalsChecked:true},issues:[]};
}
function analyze(input,M){const source=String(input==null?"":input),lines=source.split(/\n|;/).map(x=>x.trim()).filter(Boolean),candidates=lines.filter(x=>/[<>≤≥≠!]/.test(x));if(!M)return {engine:"IdeeVisionRationalInequalitySolver",version:VERSION,ready:false,offline:true,source,status:"dependencies_missing",inequalities:[],issues:[{code:"dependency_missing"}]};if(!candidates.length)return {engine:"IdeeVisionRationalInequalitySolver",version:VERSION,ready:true,offline:true,source,status:"no_inequality_detected",inequalities:[],issues:[]};const inequalities=candidates.map(x=>solveOne(x,M)),supported=inequalities.every(x=>["solution_set","empty_set","all_real_numbers"].includes(x.status));return {engine:"IdeeVisionRationalInequalitySolver",version:VERSION,ready:true,offline:true,source,status:inequalities.length>1?"multiple_inequalities_analyzed":inequalities[0].status,inequalities,policy:{externalAIUsed:false,evalUsed:false,denominatorRootsExcluded:true,domainRestrictionsPreserved:true},issues:inequalities.flatMap(x=>x.issues||[]),allSupported:supported};}
function diagnostics(){return {name:"Résolveur d'inéquations rationnelles",version:VERSION,offline:true,capabilities:["fractions rationnelles explicites","numérateur polynomial","dénominateur polynomial","différence des deux membres","détection des zéros du numérateur","détection des zéros du dénominateur","valeurs interdites conservées","tableau de signes par intervalles critiques","racines linéaires et quadratiques","inégalités strictes et larges","comparaison différente","parenthèses","opérations rationnelles + - × ÷","puissances entières 0 à 2","intervalles ouverts","points racines inclus si autorisés","exclusion systématique des pôles","preuve des restrictions de domaine","aucun eval","aucune IA externe"],limitations:["une seule variable","numérateur et dénominateur de degré maximal deux après réduction","racines réelles uniquement","pas de simplification par annulation des facteurs","pas de dénominateurs imbriqués de degré résultant supérieur à deux","pas de fonctions trigonométriques ou exponentielles","symboles d'unités ambigus refusés"]};}
const api=Object.freeze({version:VERSION,analyze,solveOne,diagnostics});root.IdeeVisionRationalInequalitySolver=api;if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
