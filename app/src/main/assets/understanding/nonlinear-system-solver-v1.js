/* Idée Vision — Résolution contrôlée de systèmes non linéaires v1 */
(function(root){"use strict";
const VERSION="1.0.0",EPS=1e-9,clean=n=>Math.abs(n)<EPS?0:Number(n.toPrecision(12));
function un(n){while(n&&n.type==="group")n=n.expression;return n;}
function poly(n,vars){n=un(n);if(!n)return {error:"missing_ast"};
 if(n.type==="number")return new Map([["0,0",n.value]]);
 if(n.type==="variable"){const i=vars.indexOf(n.name);if(i<0)return {error:"unknown_variable"};const e=[0,0];e[i]=1;return new Map([[e.join(","),1]]);}
 if(n.type==="unit_or_variable")return {error:"ambiguous_unit_symbol"};
 if(n.type==="unary"){const a=poly(n.argument,vars);if(a.error)return a;return n.operator==="-"?scale(a,-1):a;}
 if(n.type!=="binary")return {error:"unsupported_ast_node"};
 const a=poly(n.left,vars),b=poly(n.right,vars);if(a.error)return a;if(b.error)return b;
 if(n.operator==="+")return plus(a,b);
 if(n.operator==="-")return plus(a,b,-1);
 if(["*","×","·"].includes(n.operator))return multiply(a,b);
 if(["/","÷"].includes(n.operator)){if(b.size!==1||!b.has("0,0")||Math.abs(b.get("0,0"))<EPS)return {error:"only_nonzero_numeric_denominators_supported"};return scale(a,1/b.get("0,0"));}
 if(n.operator==="^"){if(b.size!==1||!b.has("0,0")||!Number.isInteger(b.get("0,0"))||b.get("0,0")<0||b.get("0,0")>2)return {error:"only_powers_zero_to_two_supported"};let out=constant(1);for(let i=0;i<b.get("0,0");i++){out=multiply(out,a);if(out.error)return out;}return out;}
 return {error:"unsupported_operator"};
}
function constant(v){return new Map([["0,0",clean(v)]]);}
function plus(a,b,s=1){const o=new Map(a);for(const [k,v] of b)o.set(k,clean((o.get(k)||0)+s*v));for(const [k,v] of o)if(Math.abs(v)<EPS)o.delete(k);return o;}
function scale(a,k){return new Map([...a].map(([x,v])=>[x,clean(v*k)]).filter(([,v])=>Math.abs(v)>EPS));}
function multiply(a,b){const o=new Map();for(const [ka,va] of a)for(const [kb,vb] of b){const ea=ka.split(",").map(Number),eb=kb.split(",").map(Number),e=[ea[0]+eb[0],ea[1]+eb[1]];if(e[0]+e[1]>2)return {error:"degree_above_two"};const k=e.join(",");o.set(k,clean((o.get(k)||0)+va*vb));}for(const [k,v] of o)if(Math.abs(v)<EPS)o.delete(k);return o;}
function degree(p){let d=-1;for(const [k,v] of p)if(Math.abs(v)>EPS){const e=k.split(",").map(Number);d=Math.max(d,e[0]+e[1]);}return d;}
function equation(s,M,vars){const p=M.parse(s),a=un(p.ast);if(p.kind!=="equation"||p.issues.length||!a||a.type!=="binary"||!["=","=="].includes(a.operator))return {error:"invalid_equation"};const l=poly(a.left,vars),r=poly(a.right,vars);if(l.error||r.error)return {error:l.error||r.error};const terms=plus(l,r,-1);return {source:s,ast:a,terms,degree:degree(terms)};}
function uniAdd(a,b){const o=[0,0,0];for(let i=0;i<3;i++)o[i]=clean((a[i]||0)+(b[i]||0));return o;}
function uniMul(a,b){const o=[0,0,0,0,0];for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(a[i]&&b[j])o[i+j]+=a[i]*b[j];if(Math.abs(o[3])>EPS||Math.abs(o[4])>EPS)return {error:"substitution_degree_above_four"};return o.slice(0,3).map(clean);}
function uniPow(a,n){let o=[1,0,0];for(let i=0;i<n;i++){const z=uniMul(o,a);if(z.error)return z;o=z;}return o;}
function substitute(terms,isolatedIndex,alpha,beta){const out=[0,0,0],line=[alpha,beta,0];for(const [k,v] of terms){const e=k.split(",").map(Number),i=isolatedIndex,j=1-i;const pow=uniPow(line,e[i]);if(pow.error)return pow;const z=[0,0,0];for(let q=0;q<3;q++)z[q]=pow[q]||0;for(let q=0;q<j;q++){const w=uniMul(z,[0,1,0]);if(w.error)return w;for(let h=0;h<3;h++)z[h]=w[h]||0;}for(let h=0;h<3;h++)out[h]+=v*z[h];}return out.map(clean);}
function roots(c){const [d,b,a]=c;if(Math.abs(a)<EPS)return {values:Math.abs(b)<EPS?[]:[clean(-d/b)],discriminant:null};const disc=clean(b*b-4*a*d);if(disc< -EPS)return {none:true,discriminant:disc};if(Math.abs(disc)<EPS)return {values:[clean(-b/(2*a))],discriminant:0};const s=Math.sqrt(disc),q1=(-b-s)/(2*a),q2=(-b+s)/(2*a);return {values:[clean(Math.min(q1,q2)),clean(Math.max(q1,q2))],discriminant:disc};}
function evaluate(ast,values,N){const issues=[],left=N.evaluateNode(ast.left,values,issues),right=N.evaluateNode(ast.right,values,issues);return {verified:left!==null&&right!==null&&!issues.length&&Math.abs(left-right)<=1e-7*Math.max(1,Math.abs(left),Math.abs(right)),left,right,issues};}
function analyze(input,M,N){const source=String(input==null?"":input),lines=source.split(/\n|;/).map(x=>x.trim()).filter(Boolean).filter(x=>/[=＝]/.test(x));const base={engine:"IdeeVisionNonlinearSystemSolver",version:VERSION,ready:true,offline:true,source,equations:[],variables:[],solutions:[],issues:[]};
 if(!M||!N)return {...base,ready:false,status:"dependencies_missing",issues:[{code:"math_or_numeric_engine_missing"}]};
 if(!lines.length)return {...base,status:"no_system_detected"};
 if(lines.length!==2)return {...base,status:"two_equations_required",issues:[{code:"only_two_equations_supported"}]};
 const parsed=lines.map(s=>M.parse(s)),names=[...new Set(parsed.flatMap(p=>p.variables.map(v=>v.name)))].sort();
 if(parsed.some(p=>p.unitCandidates.length))return {...base,status:"ambiguous_symbol",variables:names,issues:[{code:"ambiguous_unit_symbol"}]};
 if(names.length!==2)return {...base,status:"two_variables_required",variables:names,issues:[{code:"exactly_two_variables_required"}]};
 const rows=lines.map(s=>equation(s,M,names));if(rows.some(r=>r.error))return {...base,status:"unsupported_expression",variables:names,equations:lines.map((source,i)=>({source,error:rows[i].error||null})),issues:rows.filter(r=>r.error).map(r=>({code:r.error}))};
 const degrees=rows.map(r=>r.degree);if(degrees.every(d=>d<=1))return {...base,status:"linear_system_delegate",variables:names,equations:lines.map((source,i)=>({source,degree:degrees[i]})),issues:[{code:"use_linear_equation_solver"}]};
 if(!degrees.some(d=>d===1)||!degrees.some(d=>d===2))return {...base,status:"unsupported_system_shape",variables:names,equations:lines.map((source,i)=>({source,degree:degrees[i]})),issues:[{code:"one_linear_and_one_quadratic_equation_required"}]};
 const li=degrees.indexOf(1),qi=1-li,L=rows[li],Q=rows[qi],co=[0,0,0];
 for(const [k,v] of L.terms){const e=k.split(",").map(Number);if(e[0]+e[1]===0)co[0]=v;else if(e[0]===1)co[1]=v;else if(e[1]===1)co[2]=v;}
 let isolatedIndex=1,remainingIndex=0;if(Math.abs(co[2])<EPS){if(Math.abs(co[1])<EPS)return {...base,status:"degenerate_linear_equation",variables:names,issues:[{code:"linear_equation_has_no_variable_coefficient"}]};isolatedIndex=0;remainingIndex=1;}
 const denom=co[isolatedIndex+1];if(Math.abs(denom)<EPS)return {...base,status:"degenerate_linear_equation",variables:names,issues:[{code:"cannot_isolate_variable"}]};
 const alpha=clean(-co[0]/denom),beta=clean(-co[remainingIndex+1]/denom),reduced=substitute(Q.terms,isolatedIndex,alpha,beta);
 if(reduced.error)return {...base,status:"unsupported_expression",variables:names,issues:[{code:reduced.error}]};
 const rootsResult=roots(reduced),eqOut=rows.map((r,i)=>({source:r.source,degree:r.degree,role:i===li?"linear_constraint":"quadratic_constraint"}));
 const common={...base,variables:names,equations:eqOut,method:"linear_substitution",isolatedVariable:names[isolatedIndex],remainingVariable:names[remainingIndex],substitution:{variable:names[isolatedIndex],expression:String(alpha)+(beta<0?" - ":" + ")+String(Math.abs(beta))+"*"+names[remainingIndex],coefficients:{constant:alpha,linear:beta}},reducedPolynomial:{variable:names[remainingIndex],constant:reduced[0],linear:reduced[1],quadratic:reduced[2]},policy:{externalAIUsed:false,evalUsed:false,realSolutionsOnly:true,solutionsVerified:true,sourcePreserved:true}};
 if(Math.abs(reduced[0])+Math.abs(reduced[1])+Math.abs(reduced[2])<EPS)return {...common,status:"infinite_solutions",solutionSet:"the_linear_constraint",solutions:[],verification:[],issues:[]};
 if(rootsResult.none)return {...common,status:"no_real_solution",discriminant:rootsResult.discriminant,solutions:[],verification:[],issues:[]};
 const values=rootsResult.values||[],candidates=values.map(t=>{const vals=[];vals[remainingIndex]=t;vals[isolatedIndex]=clean(alpha+beta*t);const obj={[names[0]]:vals[0],[names[1]]:vals[1]},checks=rows.map(r=>evaluate(r.ast,obj,N));return {values:obj,verified:checks.every(x=>x.verified),checks};});
 const valid=candidates.filter(x=>x.verified),status=valid.length===0?"no_valid_solution":valid.length===1?"unique_solution":"two_real_solutions";
 return {...common,status,discriminant:rootsResult.discriminant??null,solutions:valid.map(x=>x.values),verification:candidates.map(x=>({values:x.values,verified:x.verified,checks:x.checks})),issues:valid.length===candidates.length?[]:[{code:"some_candidates_failed_verification"}]};
}
function diagnostics(){return {name:"Résolveur de systèmes non linéaires Idée Vision",version:VERSION,offline:true,capabilities:["détection de systèmes de deux équations","identification de deux inconnues","analyse de degré polynomial","prise en charge d'une contrainte linéaire et d'une quadratique","isolation algébrique d'une variable","substitution dans la seconde équation","réduction en polynôme d'une variable","résolution linéaire après substitution","calcul du discriminant","calcul des racines réelles","détection d'absence de solution réelle","détection d'une infinité de solutions sur la contrainte linéaire","reconstruction des deux inconnues","vérification numérique dans les deux équations","parenthèses et multiplication implicite","fractions à dénominateur numérique non nul","préservation des sources","résultat JSON hors ligne","aucun eval","aucune IA externe"],limitations:["deux équations et deux inconnues uniquement","une équation doit être linéaire et l'autre quadratique","les systèmes avec deux équations quadratiques ne sont pas pris en charge","degré total maximal deux dans chaque équation","pas de racines complexes","symboles d'unités ambigus refusés","dénominateurs variables refusés","les systèmes linéaires sont délégués au résolveur linéaire"]};}
const api=Object.freeze({version:VERSION,analyze,diagnostics});root.IdeeVisionNonlinearSystemSolver=api;if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
