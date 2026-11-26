/* Idée Vision — Simulation numérique des systèmes physiques v1.0.0
 * Simulations pédagogiques en unités SI. Pas de trajectoires d'armes.
 */
(function(root){"use strict";
const VERSION="1.0.0", DEFAULT_MAX_STEPS=200000;
function finite(v,name="Valeur"){v=Number(v);if(!Number.isFinite(v))throw new TypeError(name+" doit être un nombre fini.");return v;}
function positive(v,name="Valeur",zero=true){v=finite(v,name);if(zero?v<0:v<=0)throw new RangeError(name+(zero?" ne peut pas être négatif.":" doit être positif."));return v;}
function vector(y){if(!Array.isArray(y)||!y.length||y.length>64)throw new TypeError("État numérique invalide.");return y.map((v,i)=>finite(v,"État["+i+"]"));}
function addScaled(y,k,h){return y.map((v,i)=>v+h*k[i]);}
function same(a,b){if(a.length!==b.length)throw new Error("Dimensions d'état incompatibles.");}
function derivativeCall(fn,t,y,p){const d=vector(fn(t,y.slice(),p));same(y,d);return d;}
function integrateStep(fn,t,y,h,method="rk4",params){
 y=vector(y);h=positive(h,"Pas de temps",false);const f=(tt,yy)=>derivativeCall(fn,tt,yy,params);
 if(method==="euler")return addScaled(y,f(t,y),h);
 if(method==="midpoint"){const k1=f(t,y),k2=f(t+h/2,addScaled(y,k1,h/2));return addScaled(y,k2,h);}
 if(method==="rk4"){const k1=f(t,y),k2=f(t+h/2,addScaled(y,k1,h/2)),k3=f(t+h/2,addScaled(y,k2,h/2)),k4=f(t+h,addScaled(y,k3,h));return y.map((v,i)=>v+h*(k1[i]+2*k2[i]+2*k3[i]+k4[i])/6);}
 throw new Error("Méthode inconnue : "+method);
}
function simulate(fn,initial,options={}){
 const y0=vector(initial),duration=positive(options.duration??1,"Durée"),dt=positive(options.dt??.01,"Pas de temps",false),method=options.method||"rk4";
 const maxSteps=Math.min(DEFAULT_MAX_STEPS,Math.floor(positive(options.maxSteps??DEFAULT_MAX_STEPS,"Nombre maximal de pas",false)));
 const count=Math.ceil(duration/dt);if(count>maxSteps)throw new RangeError("Nombre de pas trop élevé.");
 const times=[0],states=[y0.slice()];let y=y0.slice(),t=0;
 for(let i=0;i<count;i++){const h=Math.min(dt,duration-t);y=integrateStep(fn,t,y,h,method,options.params);if(y.some(v=>!Number.isFinite(v)))throw new Error("Divergence numérique détectée.");t=Math.min(duration,t+h);times.push(t);states.push(y.slice());}
 return {times,states,method,steps:count,duration,dt,diagnostics:{finite:true,stepCount:count,method}};
}
function symplecticStep(position,velocity,acceleration,t,dt){position=finite(position);velocity=finite(velocity);dt=positive(dt,"Pas de temps",false);const v=velocity+finite(acceleration(t,position,velocity))*dt;return {position:position+v*dt,velocity:v};}
function oscillatorAcceleration(x,v,m,k,c,force=0){m=positive(m,"Masse",false);k=positive(k,"Raideur");c=positive(c,"Amortissement");return (finite(force)-k*finite(x)-c*finite(v))/m;}
function simulateOscillator(options={}){
 const m=positive(options.mass??1,"Masse",false),k=positive(options.spring??4,"Raideur",false),c=positive(options.damping??0,"Amortissement"),x0=finite(options.position??1),v0=finite(options.velocity??0),force=typeof options.force==="function"?options.force:()=>finite(options.force??0);
 const run=simulate((t,y)=>[y[1],oscillatorAcceleration(y[0],y[1],m,k,c,force(t))],[x0,v0],options);
 const energy=run.states.map(y=>.5*m*y[1]*y[1]+.5*k*y[0]*y[0]);
 return {...run,model:"oscillateur masse-ressort-amortisseur",parameters:{mass:m,spring:k,damping:c},energy,diagnostics:{...run.diagnostics,energyInitial:energy[0],energyFinal:energy[energy.length-1],damping:c}};
}
function simulatePendulum(options={}){
 const length=positive(options.length??1,"Longueur",false),g=positive(options.gravity??9.80665,"Gravité",false),damping=positive(options.damping??0,"Amortissement"),theta=finite(options.angle??.3,"Angle initial"),omega=finite(options.angularVelocity??0,"Vitesse angulaire initiale");
 const run=simulate((t,y)=>[y[1],-(g/length)*Math.sin(y[0])-damping*y[1]],[theta,omega],options);
 const energy=run.states.map(y=>.5*length*length*y[1]*y[1]+g*length*(1-Math.cos(y[0])));
 return {...run,model:"pendule simple non linéaire",parameters:{length,gravity:g,damping},energy,diagnostics:{...run.diagnostics,energyInitial:energy[0],energyFinal:energy[energy.length-1],smallAngleApproximation:false}};
}
function derivative(samples,dt){if(!Array.isArray(samples)||samples.length<2)throw new TypeError("Deux échantillons au minimum.");dt=positive(dt,"Intervalle",false);return samples.map((v,i)=>{const a=finite(samples[Math.max(0,i-1)]),b=finite(samples[Math.min(samples.length-1,i+1)]);return (b-a)/(i===0||i===samples.length-1?dt:2*dt);});}
function integrateTrapezoid(samples,dt){if(!Array.isArray(samples)||samples.length<2)throw new TypeError("Deux échantillons au minimum.");dt=positive(dt,"Intervalle",false);let sum=0;for(let i=1;i<samples.length;i++)sum+=(finite(samples[i-1])+finite(samples[i]))*.5*dt;return sum;}
function integrateSimpson(samples,dt){if(!Array.isArray(samples)||samples.length<3||(samples.length-1)%2!==0)throw new RangeError("Simpson exige un nombre pair d'intervalles.");dt=positive(dt,"Intervalle",false);let sum=finite(samples[0])+finite(samples[samples.length-1]);for(let i=1;i<samples.length-1;i++)sum+=(i%2?4:2)*finite(samples[i]);return sum*dt/3;}
function sampleAt(times,values,target){if(!Array.isArray(times)||!Array.isArray(values)||times.length!==values.length||!times.length)throw new TypeError("Série temporelle invalide.");target=finite(target);if(target<times[0]||target>times[times.length-1])throw new RangeError("Temps hors de la série.");let i=1;while(i<times.length&&times[i]<target)i++;if(i===times.length)return values[values.length-1];const f=(target-times[i-1])/(times[i]-times[i-1]);return finite(values[i-1])+(finite(values[i])-finite(values[i-1]))*f;}
function estimateConvergence(fn,initial,options={}){const dt=positive(options.dt??.02,"Pas de temps",false),duration=positive(options.duration??1,"Durée"),method=options.method||"rk4";const a=simulate(fn,initial,{...options,dt, duration,method}),b=simulate(fn,initial,{...options,dt:dt/2,duration,method});const error=b.states[b.states.length-1].map((v,i)=>Math.abs(v-a.states[a.states.length-1][i]));return {coarse:a.states[a.states.length-1],fine:b.states[b.states.length-1],absoluteError:error,maxError:Math.max(...error),method,dt,refinedDt:dt/2};}
function energyTrend(energy){if(!Array.isArray(energy)||energy.length<2)throw new TypeError("Série d'énergie insuffisante.");const first=finite(energy[0]),last=finite(energy[energy.length-1]);return {initial:first,final:last,change:last-first,nonIncreasing:energy.every((v,i)=>i===0||finite(v)<=finite(energy[i-1])+1e-9)};}
function peakAmplitude(values){if(!Array.isArray(values)||!values.length)throw new TypeError("Série vide.");return Math.max(...values.map(v=>Math.abs(finite(v))));}
function zeroCrossings(values){if(!Array.isArray(values)||values.length<2)throw new TypeError("Série insuffisante.");let n=0;for(let i=1;i<values.length;i++)if(finite(values[i-1])*finite(values[i])<0)n++;return n;}
function frequencyFromPeriod(period){return 1/positive(period,"Période",false);}
function periodFromFrequency(frequency){return 1/positive(frequency,"Fréquence",false);}
function angularFrequency(frequency){return 2*Math.PI*positive(frequency,"Fréquence",false);}
function springNaturalFrequency(m,k){return Math.sqrt(positive(k,"Raideur",false)/positive(m,"Masse",false));}
function dampingRatio(m,k,c){return positive(c,"Amortissement")/(2*Math.sqrt(positive(m,"Masse",false)*positive(k,"Raideur",false)));}
function oscillatorClassification(zeta){zeta=positive(zeta,"Taux d'amortissement");return zeta<1?"sous-amorti":zeta===1?"critiquement amorti":"sur-amorti";}
function exponentialDecay(initial,rate,time){return finite(initial)*Math.exp(-positive(rate,"Taux")*positive(time,"Temps"));}
function makeTimeline(duration,dt,maxSteps=DEFAULT_MAX_STEPS){duration=positive(duration,"Durée");dt=positive(dt,"Pas",false);const n=Math.ceil(duration/dt);if(n>Math.min(maxSteps,DEFAULT_MAX_STEPS))throw new RangeError("Trop d'échantillons.");return Array.from({length:n+1},(_,i)=>Math.min(duration,i*dt));}
function resample(times,values,newTimes){if(!Array.isArray(newTimes))throw new TypeError("Nouvelle grille invalide.");return newTimes.map(t=>sampleAt(times,values,t));}
function rms(values){if(!Array.isArray(values)||!values.length)throw new TypeError("Série vide.");return Math.sqrt(values.reduce((s,v)=>s+finite(v)**2,0)/values.length);}
function mean(values){if(!Array.isArray(values)||!values.length)throw new TypeError("Série vide.");return values.reduce((s,v)=>s+finite(v),0)/values.length;}
function validateSimulationOptions(o={}){const dt=positive(o.dt??.01,"Pas",false),duration=positive(o.duration??1,"Durée"),steps=Math.ceil(duration/dt);return {valid:steps<=Math.min(DEFAULT_MAX_STEPS,o.maxSteps??DEFAULT_MAX_STEPS),steps,dt,duration,method:o.method||"rk4"};}
function buildAudit(request){const s=String(request||"").toLowerCase(),topics=[];if(/simulation|numérique|numerique|intégration|integration|euler|runge|rk4/.test(s))topics.push("intégration numérique");if(/ressort|oscillateur|amortissement|oscillation/.test(s))topics.push("oscillateur amorti");if(/pendule/.test(s))topics.push("pendule non linéaire");if(/dérivée|derivee|intégrale|integrale|simpson|trapèze|trapeze/.test(s))topics.push("analyse numérique");return {topics,methods:["Euler","point milieu","Runge-Kutta ordre 4"],units:"SI",safety:"modèles pédagogiques non orientés vers des applications dangereuses"};}
function toPromptContext(a){if(!a)return "Simulation numérique indisponible.";return "SIMULATION NUMÉRIQUE — sujets : "+(a.topics.join(", ")||"non détectés")+". Méthodes disponibles : "+a.methods.join(", ")+". Unités SI. Préciser le pas de temps, les conditions initiales, les hypothèses et les limites d'erreur. Les simulations doivent être vérifiées par convergence et ne pas présenter une approximation numérique comme une mesure exacte.";}
function diagnostics(){return {version:VERSION,offline:true,methods:["euler","midpoint","rk4","symplectic"],models:["oscillator","pendulum"],maxSteps:DEFAULT_MAX_STEPS,finiteChecks:true};}
const api={version:VERSION,integrateStep,simulate,symplecticStep,oscillatorAcceleration,simulateOscillator,simulatePendulum,derivative,integrateTrapezoid,integrateSimpson,sampleAt,estimateConvergence,energyTrend,peakAmplitude,zeroCrossings,frequencyFromPeriod,periodFromFrequency,angularFrequency,springNaturalFrequency,dampingRatio,oscillatorClassification,exponentialDecay,makeTimeline,resample,rms,mean,validateSimulationOptions,buildAudit,toPromptContext,diagnostics,constants:{maxSteps:DEFAULT_MAX_STEPS}};
if(typeof module!=="undefined"&&module.exports)module.exports=api;root.IdeeVisionSimulation=api;
})(typeof window!=="undefined"?window:globalThis);
