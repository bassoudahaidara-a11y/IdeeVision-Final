/* Idée Vision — Physics & Mechanics Engine v1.0.0
 * Modèles classiques pédagogiques. Unités SI sauf indication contraire.
 */
(function(root){"use strict";
const VERSION="1.0.0",G=9.80665,G_NEWTON=6.67430e-11,EPS=1e-12;
function n(v,label="Valeur"){v=Number(v);if(!Number.isFinite(v))throw new TypeError(label+" doit être un nombre fini.");return v;}
function positive(v,label="Valeur",zero=true){v=n(v,label);if(zero?v<0:v<=0)throw new RangeError(label+(zero?" ne peut pas être négatif.":" doit être strictement positif."));return v;}
function vec(v,label="Vecteur"){if(!v||typeof v!=="object")throw new TypeError(label+" invalide.");return {x:n(v.x,label+".x"),y:n(v.y,label+".y"),z:n(v.z??0,label+".z")};}
function add(a,b){a=vec(a);b=vec(b);return {x:a.x+b.x,y:a.y+b.y,z:a.z+b.z};}
function subtract(a,b){a=vec(a);b=vec(b);return {x:a.x-b.x,y:a.y-b.y,z:a.z-b.z};}
function magnitude(a){a=vec(a);return Math.hypot(a.x,a.y,a.z);}
function dot(a,b){a=vec(a);b=vec(b);return a.x*b.x+a.y*b.y+a.z*b.z;}
function scaleVector(a,k){a=vec(a);k=n(k);return {x:a.x*k,y:a.y*k,z:a.z*k};}
function acceleration(force,mass){force=vec(force,"Force");mass=positive(mass,"Masse",false);return scaleVector(force,1/mass);}
function newtonForce(mass,a){mass=positive(mass,"Masse");return scaleVector(vec(a,"Accélération"),mass);}
function weight(mass,g=G){return positive(mass,"Masse")*positive(g,"Gravité",false);}
function kinematics(v0,a,t,x0=0){v0=n(v0,"Vitesse initiale");a=n(a,"Accélération");t=n(t,"Temps");x0=n(x0,"Position initiale");return {position:x0+v0*t+.5*a*t*t,velocity:v0+a*t,displacement:v0*t+.5*a*t*t};}
function averageSpeed(distanceValue,time){distanceValue=positive(distanceValue,"Distance");time=positive(time,"Durée",false);return distanceValue/time;}
function accelerationFromSpeeds(v1,v0,dt){dt=positive(dt,"Durée",false);return (n(v1)-n(v0))/dt;}
function circularMotion(speed,radius){speed=positive(speed,"Vitesse");radius=positive(radius,"Rayon",false);return {centripetalAcceleration:speed*speed/radius,angularSpeed:speed/radius,period:2*Math.PI*radius/speed};}
function centripetalForce(mass,speed,radius){mass=positive(mass,"Masse");return mass*circularMotion(speed,radius).centripetalAcceleration;}
function kineticEnergy(mass,speed){mass=positive(mass,"Masse");speed=n(speed,"Vitesse");return .5*mass*speed*speed;}
function gravitationalPotentialEnergy(mass,height,g=G){return positive(mass,"Masse")*n(height,"Hauteur")*positive(g,"Gravité",false);}
function mechanicalEnergy(kinetic,potential){return n(kinetic,"Énergie cinétique")+n(potential,"Énergie potentielle");}
function work(force,displacement,angleRadians=0){force=positive(force,"Force");displacement=n(displacement,"Déplacement");return force*displacement*Math.cos(n(angleRadians,"Angle"));}
function power(workJoules,time){time=positive(time,"Durée",false);return n(workJoules,"Travail")/time;}
function efficiency(useful,received){useful=positive(useful,"Énergie utile");received=positive(received,"Énergie reçue",false);if(useful>received+EPS)throw new RangeError("L'énergie utile ne peut pas dépasser l'énergie reçue.");return 100*useful/received;}
function momentum(mass,velocity){return scaleVector(vec(velocity,"Vitesse"),positive(mass,"Masse"));}
function impulse(force,duration){return scaleVector(vec(force,"Force"),positive(duration,"Durée"));}
function impulseFromMomentumChange(mass,vBefore,vAfter){return subtract(momentum(mass,vAfter),momentum(mass,vBefore));}
function gravitationalForce(m1,m2,distanceValue){m1=positive(m1,"Masse 1");m2=positive(m2,"Masse 2");distanceValue=positive(distanceValue,"Distance",false);return G_NEWTON*m1*m2/(distanceValue*distanceValue);}
function springForce(k,extension){return -positive(k,"Raideur",false)*n(extension,"Allongement");}
function springEnergy(k,extension){return .5*positive(k,"Raideur",false)*n(extension,"Allongement")**2;}
function frictionForce(mu,normalForce){return positive(mu,"Coefficient de frottement")*positive(normalForce,"Réaction normale");}
function inclineComponents(mass,angleRadians,g=G){mass=positive(mass,"Masse");const w=weight(mass,g),a=n(angleRadians,"Angle");return {parallel:w*Math.sin(a),perpendicular:w*Math.cos(a),weight:w};}
function torque(forceLeverArm,force,angleRadians=Math.PI/2){return n(forceLeverArm,"Bras de levier")*positive(force,"Force")*Math.sin(n(angleRadians,"Angle"));}
function rotationalKineticEnergy(inertia,angularSpeed){return .5*positive(inertia,"Moment d'inertie")*n(angularSpeed,"Vitesse angulaire")**2;}
function angularMomentum(inertia,angularSpeed){return positive(inertia,"Moment d'inertie")*n(angularSpeed,"Vitesse angulaire");}
function density(mass,volume){return positive(mass,"Masse")/positive(volume,"Volume",false);}
function pressure(force,area){return positive(force,"Force")/positive(area,"Surface",false);}
function hydrostaticPressure(rho,depth,g=G){return positive(rho,"Masse volumique")*positive(g,"Gravité",false)*positive(depth,"Profondeur");}
function buoyantForce(fluidDensity,displacedVolume,g=G){return positive(fluidDensity,"Masse volumique")*positive(displacedVolume,"Volume déplacé")*positive(g,"Gravité",false);}
function springPeriod(mass,k){return 2*Math.PI*Math.sqrt(positive(mass,"Masse",false)/positive(k,"Raideur",false));}
function pendulumPeriod(length,g=G){return 2*Math.PI*Math.sqrt(positive(length,"Longueur",false)/positive(g,"Gravité",false));}
function springFrequency(mass,k){return 1/springPeriod(mass,k);}
function solveLinearMomentumCollision(m1,u1,m2,u2){m1=positive(m1,"Masse 1",false);m2=positive(m2,"Masse 2",false);u1=n(u1,"Vitesse initiale 1");u2=n(u2,"Vitesse initiale 2");const v=(m1*u1+m2*u2)/(m1+m2);return {sharedFinalVelocity:v,initialMomentum:m1*u1+m2*u2,finalMomentum:(m1+m2)*v,model:"collision parfaitement inélastique 1D"};}
function convert(value,from,to){value=n(value);const factors={m:1,km:1000,cm:.01,mm:.001,s:1,min:60,h:3600,kg:1,g:.001,mps:1,kph:1/3.6,N:1,kN:1000,J:1,kJ:1000,W:1,kW:1000,Pa:1,kPa:1000};if(!(from in factors)||!(to in factors))throw new Error("Unité non prise en charge.");const distanceUnits=["m","km","cm","mm"],timeUnits=["s","min","h"],massUnits=["kg","g"],forceUnits=["N","kN"],energyUnits=["J","kJ"],powerUnits=["W","kW"],pressureUnits=["Pa","kPa"],speedUnits=["mps","kph"];const groups=[distanceUnits,timeUnits,massUnits,forceUnits,energyUnits,powerUnits,pressureUnits,speedUnits];if(!groups.some(g=>g.includes(from)&&g.includes(to)))throw new Error("Conversion entre grandeurs différentes interdite.");return value*factors[from]/factors[to];}
function buildAudit(request){const s=String(request||""),topics=[];if(/mouvement|vitesse|accélération|acceleration|cinématique/i.test(s))topics.push("cinématique");if(/force|newton|poids|frottement|plan incliné/i.test(s))topics.push("forces et lois de Newton");if(/énergie|energie|travail|puissance|rendement/i.test(s))topics.push("travail et énergie");if(/gravitation|gravité|gravite|pesanteur|orbite/i.test(s))topics.push("gravitation");if(/ressort|oscillation|pendule|harmonique/i.test(s))topics.push("oscillations");if(/pression|poussée|poussee|archimède|archimede|densité|densite|masse volumique/i.test(s))topics.push("fluides");if(/collision|quantité de mouvement|impulsion/i.test(s))topics.push("quantité de mouvement");if(/rotation|couple|moment d'inertie/i.test(s))topics.push("rotation");return {engine:"IdeeVisionPhysics",version:VERSION,topics,request:s.slice(0,240)};}
function toPromptContext(a){if(!a||a.engine!=="IdeeVisionPhysics")throw TypeError("Audit physique invalide.");return ["CONTRÔLE PHYSIQUE ET MÉCANIQUE","Sujets détectés : "+(a.topics.join(", ")||"non détectés"),"Toujours annoncer les unités SI, définir le système étudié, préciser les hypothèses et le référentiel, écrire les formules avant les substitutions et vérifier les dimensions.","Les modèles sont classiques et limités à leurs hypothèses : accélération constante en cinématique, petites oscillations pour le pendule, collision parfaitement inélastique 1D pour la fonction dédiée. Ne pas extrapoler hors de ces conditions."].join("\n");}
function diagnostics(){return {name:"Idée Vision Physics",version:VERSION,offline:true,unitSystem:"SI",constants:{standardGravity:G,newtonianGravitationalConstant:G_NEWTON},topics:["kinematics","Newton laws","energy","momentum","gravitation","rotation","oscillations","fluids"]};}
root.IdeeVisionPhysics=Object.freeze({version:VERSION,constants:Object.freeze({standardGravity:G,newtonianGravitationalConstant:G_NEWTON}),add,subtract,magnitude,dot,scaleVector,acceleration,newtonForce,weight,kinematics,averageSpeed,accelerationFromSpeeds,circularMotion,centripetalForce,kineticEnergy,gravitationalPotentialEnergy,mechanicalEnergy,work,power,efficiency,momentum,impulse,impulseFromMomentumChange,gravitationalForce,springForce,springEnergy,frictionForce,inclineComponents,torque,rotationalKineticEnergy,angularMomentum,density,pressure,hydrostaticPressure,buoyantForce,springPeriod,pendulumPeriod,springFrequency,solveLinearMomentumCollision,convert,buildAudit,toPromptContext,diagnostics});
if(typeof module!=="undefined"&&module.exports)module.exports=root.IdeeVisionPhysics;
})(typeof window!=="undefined"?window:globalThis);
