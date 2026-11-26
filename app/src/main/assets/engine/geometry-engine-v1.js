/* Idée Vision Geometry v1 — géométrie plane 2D. */
(function(root){"use strict";
const VERSION="1.0.0",EPS=1e-9,MAX=10000;
function n(v){v=Number(v);if(!Number.isFinite(v))throw Error("Coordonnée ou valeur non finie.");return v;}
function p(v){if(!v||typeof v!=="object")throw Error("Point invalide.");return {x:n(v.x),y:n(v.y)};}
function list(a,min=1){if(!Array.isArray(a)||a.length<min||a.length>MAX)throw Error("Liste de points invalide.");return a.map(p);}
function near(a,b,t=EPS){return Math.abs(a-b)<=t;}
function vector(a,b){a=p(a);b=p(b);return {x:b.x-a.x,y:b.y-a.y};}
function distance(a,b){const v=vector(a,b);return Math.hypot(v.x,v.y);}
function midpoint(a,b){a=p(a);b=p(b);return {x:(a.x+b.x)/2,y:(a.y+b.y)/2};}
function dot(a,b){a=p(a);b=p(b);return a.x*b.x+a.y*b.y;}
function cross(a,b){a=p(a);b=p(b);return a.x*b.y-a.y*b.x;}
function norm(a){a=p(a);return Math.hypot(a.x,a.y);}
function slope(a,b){const v=vector(a,b);return near(v.x,0)?{kind:"vertical",value:null}:{kind:"finite",value:v.y/v.x};}
function lineThrough(a,b){a=p(a);b=p(b);if(distance(a,b)<EPS)throw Error("Points distincts requis.");let A=b.y-a.y,B=a.x-b.x,C=-(A*a.x+B*a.y),z=Math.hypot(A,B);A/=z;B/=z;C/=z;if(A< -EPS||(near(A,0)&&B<0)){A=-A;B=-B;C=-C;}return {A,B,C};}
function lineIntersection(u,v){const d=n(u.A)*n(v.B)-n(v.A)*n(u.B);if(near(d,0))return {kind:"parallel-or-coincident"};return {kind:"point",point:{x:(u.B*v.C-v.B*u.C)/d,y:(u.C*v.A-v.C*u.A)/d}};}
function projectOnLine(q,l){q=p(q);const A=n(l.A),B=n(l.B),C=n(l.C),z=A*A+B*B;if(z<EPS)throw Error("Droite invalide.");const k=(A*q.x+B*q.y+C)/z;return {x:q.x-A*k,y:q.y-B*k};}
function pointLineDistance(q,l){q=p(q);const z=Math.hypot(n(l.A),n(l.B));if(z<EPS)throw Error("Droite invalide.");return Math.abs(l.A*q.x+l.B*q.y+l.C)/z;}
function circleArea(r){r=n(r);if(r<0)throw Error("Rayon négatif.");return Math.PI*r*r;}
function circleCircumference(r){r=n(r);if(r<0)throw Error("Rayon négatif.");return 2*Math.PI*r;}
function circleRelation(q,c,r){r=n(r);if(r<0)throw Error("Rayon négatif.");const d=distance(q,c);return {distance:d,kind:near(d,r)?"on":d<r?"inside":"outside"};}
function triangleArea(a,b,c){return Math.abs(cross(vector(a,b),vector(a,c)))/2;}
function triangleFromSides(a,b,c){[a,b,c]=[a,b,c].map(n);if(Math.min(a,b,c)<=0||a+b<=c+EPS||a+c<=b+EPS||b+c<=a+EPS)throw Error("Triangle invalide.");const s=(a+b+c)/2;return {perimeter:a+b+c,semiperimeter:s,area:Math.sqrt(s*(s-a)*(s-b)*(s-c))};}
function classifyTriangle(a,b,c){const s=[distance(a,b),distance(b,c),distance(c,a)].sort((x,y)=>x-y);if(s[0]<EPS)throw Error("Triangle dégénéré.");const eq=near(s[0],s[2]),iso=near(s[0],s[1])||near(s[1],s[2]);return {sides:s,type:eq?"equilateral":iso?"isosceles":"scalene",angle:near(s[0]**2+s[1]**2,s[2]**2,1e-7)?"right":s[0]**2+s[1]**2>s[2]**2?"acute":"obtuse",area:triangleArea(a,b,c),perimeter:s.reduce((x,y)=>x+y,0)};}
function angleAt(a,b,c){const u=vector(b,a),v=vector(b,c),d=norm(u)*norm(v);if(d<EPS)throw Error("Angle indéfini.");return Math.acos(Math.max(-1,Math.min(1,dot(u,v)/d)));}
function radiansToDegrees(r){return n(r)*180/Math.PI;}function degreesToRadians(d){return n(d)*Math.PI/180;}
function polygonSignedArea(q){const a=list(q,3);let s=0;for(let i=0;i<a.length;i++){const b=a[(i+1)%a.length];s+=a[i].x*b.y-b.x*a[i].y;}return s/2;}
function polygonArea(q){return Math.abs(polygonSignedArea(q));}
function polygonPerimeter(q){const a=list(q,3);return a.reduce((s,v,i)=>s+distance(v,a[(i+1)%a.length]),0);}
function polygonCentroid(q){const a=list(q,3);let ar=0,x=0,y=0;for(let i=0;i<a.length;i++){const u=a[i],v=a[(i+1)%a.length],k=u.x*v.y-v.x*u.y;ar+=k;x+=(u.x+v.x)*k;y+=(u.y+v.y)*k;}if(Math.abs(ar)<EPS)throw Error("Polygone d'aire nulle.");return {x:x/(3*ar),y:y/(3*ar)};}
function pointInPolygon(q,poly){q=p(q);const a=list(poly,3);let inside=false;for(let i=0,j=a.length-1;i<a.length;j=i++){const u=a[i],v=a[j],cr=cross(vector(u,v),vector(u,q));if(Math.abs(cr)<EPS&&q.x>=Math.min(u.x,v.x)-EPS&&q.x<=Math.max(u.x,v.x)+EPS&&q.y>=Math.min(u.y,v.y)-EPS&&q.y<=Math.max(u.y,v.y)+EPS)return {inside:true,boundary:true};if((u.y>q.y)!==(v.y>q.y)&&q.x<(v.x-u.x)*(q.y-u.y)/(v.y-u.y)+u.x)inside=!inside;}return {inside,boundary:false};}
function segmentIntersection(a,b,c,d){a=p(a);b=p(b);c=p(c);d=p(d);const r=vector(a,b),s=vector(c,d),den=cross(r,s),ca=vector(a,c);if(near(den,0))return {kind:near(cross(ca,r),0)?"collinear":"parallel"};const t=cross(ca,s)/den,u=cross(ca,r)/den;if(t>=-EPS&&t<=1+EPS&&u>=-EPS&&u<=1+EPS)return {kind:"point",point:{x:a.x+t*r.x,y:a.y+t*r.y}};return {kind:"none"};}
function circleLineIntersections(c,r,l){c=p(c);r=n(r);if(r<0)throw Error("Rayon négatif.");const foot=projectOnLine(c,l),d=distance(c,foot);if(d>r+EPS)return {kind:"none",points:[]};if(near(d,r))return {kind:"tangent",points:[foot]};const z=Math.hypot(l.A,l.B),h=Math.sqrt(Math.max(0,r*r-d*d))/z,dx=-l.B/z*h,dy=l.A/z*h;return {kind:"two",points:[{x:foot.x+dx,y:foot.y+dy},{x:foot.x-dx,y:foot.y-dy}]};}
function circleCircleIntersections(c1,r1,c2,r2){c1=p(c1);c2=p(c2);r1=n(r1);r2=n(r2);if(r1<0||r2<0)throw Error("Rayon négatif.");const d=distance(c1,c2);if(d<EPS&&near(r1,r2))return {kind:"coincident",points:[]};if(d>r1+r2+EPS||d<Math.abs(r1-r2)-EPS||d<EPS)return {kind:"none",points:[]};const a=(r1*r1-r2*r2+d*d)/(2*d),h2=r1*r1-a*a,base={x:c1.x+a*(c2.x-c1.x)/d,y:c1.y+a*(c2.y-c1.y)/d};if(h2<=EPS)return {kind:"tangent",points:[base]};const h=Math.sqrt(h2),dx=-(c2.y-c1.y)*h/d,dy=(c2.x-c1.x)*h/d;return {kind:"two",points:[{x:base.x+dx,y:base.y+dy},{x:base.x-dx,y:base.y-dy}]};}
function translate(q,dx,dy){q=p(q);return {x:q.x+n(dx),y:q.y+n(dy)};}
function rotate(q,a,c={x:0,y:0}){q=p(q);c=p(c);a=n(a);const x=q.x-c.x,y=q.y-c.y,co=Math.cos(a),si=Math.sin(a);return {x:c.x+x*co-y*si,y:c.y+x*si+y*co};}
function scale(q,k,c={x:0,y:0}){q=p(q);c=p(c);k=n(k);return {x:c.x+(q.x-c.x)*k,y:c.y+(q.y-c.y)*k};}
function reflectAcrossLine(q,l){q=p(q);const f=projectOnLine(q,l);return {x:2*f.x-q.x,y:2*f.y-q.y};}
function circumcenter(a,b,c){a=p(a);b=p(b);c=p(c);const d=2*(a.x*(b.y-c.y)+b.x*(c.y-a.y)+c.x*(a.y-b.y));if(Math.abs(d)<EPS)throw Error("Points alignés.");const aa=a.x*a.x+a.y*a.y,bb=b.x*b.x+b.y*b.y,cc=c.x*c.x+c.y*c.y;return {x:(aa*(b.y-c.y)+bb*(c.y-a.y)+cc*(a.y-b.y))/d,y:(aa*(c.x-b.x)+bb*(a.x-c.x)+cc*(b.x-a.x))/d};}
function boundingBox(q){const a=list(q),xs=a.map(v=>v.x),ys=a.map(v=>v.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);return {minX,maxX,minY,maxY,width:maxX-minX,height:maxY-minY};}
function buildAudit(req){const s=String(req||""),topics=[];if(/triangle|pythagore|thales|angle/i.test(s))topics.push("triangles et angles");if(/cercle|rayon|tangente/i.test(s))topics.push("cercles");if(/droite|pente|coefficient directeur|intersection/i.test(s))topics.push("droites et intersections");if(/polygone|quadrilat|aire|périmètre/i.test(s))topics.push("polygones et mesures");if(/coordonn|vecteur|milieu|distance/i.test(s))topics.push("coordonnées et vecteurs");if(/rotation|translation|symétr|homothétie/i.test(s))topics.push("transformations");return {engine:"IdeeVisionGeometry",version:VERSION,topics,request:s.slice(0,240)};}
function toPromptContext(a){if(!a||a.engine!=="IdeeVisionGeometry")throw TypeError("Audit invalide.");return ["CONTRÔLE GÉOMÉTRIQUE","Sujets : "+(a.topics.join(", ")||"non détectés"),"Préciser unités et hypothèses, justifier les formules, vérifier les coordonnées et les résultats.","Outils disponibles en géométrie plane 2D seulement ; ne pas prétendre avoir vérifié une figure 3D."].join("\\n");}
function diagnostics(){return {name:"Idée Vision Geometry",version:VERSION,offline:true,dimension:"2D",operations:["points/vectors","lines","circles","triangles","polygons","transformations"]};}
root.IdeeVisionGeometry=Object.freeze({version:VERSION,near,vector,distance,midpoint,dot,cross,norm,slope,lineThrough,lineIntersection,projectOnLine,pointLineDistance,circleArea,circleCircumference,circleRelation,triangleArea,triangleFromSides,classifyTriangle,angleAt,radiansToDegrees,degreesToRadians,polygonSignedArea,polygonArea,polygonPerimeter,polygonCentroid,pointInPolygon,segmentIntersection,circleLineIntersections,circleCircleIntersections,translate,rotate,scale,reflectAcrossLine,circumcenter,boundingBox,buildAudit,toPromptContext,diagnostics});
if(typeof module!=="undefined"&&module.exports)module.exports=root.IdeeVisionGeometry;
})(typeof window!=="undefined"?window:globalThis);
