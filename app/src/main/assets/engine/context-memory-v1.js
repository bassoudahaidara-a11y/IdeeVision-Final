/* Idée Vision — Context Memory v1
 * Volatile, offline working memory. Persistence is deliberately opt-in and external.
 */
(function(root){
  "use strict";
  const VERSION="1.0.0";
  const SCHEMA="idee-vision-context-memory";
  const FOLLOW_UP=/\b(et aussi|et maintenant|ensuite|continue|poursuis|ajoute|modifie|change|agrandis|réduis|ce modèle|cette maison|ce bâtiment|cet objet|comme avant|pareil|it|that|this|also|continue|next|same)\b/i;
  const PRONOUN=/\b(ça|cela|ceci|ce|cet|cette|ces|il|elle|ils|elles|lui|leur|it|this|that|they)\b/i;
  const STOP=new Set(["alors","avec","dans","pour","mais","donc","plus","moins","faire","fais","fait","veux","voudrais","comme","aussi","maintenant","ensuite","continue","maison","objet"]);
  function clean(v,max){return String(v==null?"":v).normalize("NFKC").replace(/\s+/g," ").trim().slice(0,max||4000);}
  function words(v){return clean(v).toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g,"").match(/[\p{L}\p{N}]{3,}/gu)||[];}
  function unique(a){return [...new Set(a)];}
  function create(options){
    options=options||{};
    const maxTurns=Math.max(2,Math.min(80,Number(options.maxTurns)||24));
    const maxChars=Math.max(2000,Math.min(100000,Number(options.maxChars)||24000));
    const turns=[];
    let totalChars=0, sequence=0;
    function rebuild(){
      totalChars=turns.reduce((n,t)=>n+t.content.length,0);
      while(turns.length>maxTurns||totalChars>maxChars){
        const old=turns.shift(); if(old) totalChars-=old.content.length;
      }
    }
    function latestEntities(){
      for(let i=turns.length-1;i>=0;i--){
        const e=turns[i].entities||[];
        if(e.length)return e.slice();
      }
      return [];
    }
    function add(role,content,meta){
      role=role==="assistant"?"assistant":role==="system"?"system":"user";
      content=clean(content,4000);
      if(!content)throw new TypeError("Le contenu du tour est vide.");
      const cognitive=root.IdeeVisionCognitive;
      const extracted=cognitive?cognitive.extractEntities(content):{keywords:[]};
      const entities=unique((extracted.keywords||[]).filter(w=>w.length>3&&!STOP.has(w))).slice(0,12);
      const record={id:++sequence,role,content,entities,intent:meta&&clean(meta.intent,40)||null,
        timestamp:meta&&Number.isFinite(meta.timestamp)?meta.timestamp:null};
      turns.push(record);totalChars+=content.length;rebuild();
      return publicTurn(record);
    }
    function publicTurn(t){return {id:t.id,role:t.role,content:t.content,entities:t.entities.slice(),intent:t.intent,timestamp:t.timestamp};}
    function recent(count){
      const n=Math.max(1,Math.min(maxTurns,Number(count)||maxTurns));
      return turns.slice(-n).map(publicTurn);
    }
    function resolveReference(text){
      const q=clean(text,1000), prior=latestEntities();
      const isFollowUp=FOLLOW_UP.test(q), hasPronoun=PRONOUN.test(q);
      const qWords=words(q);
      const overlaps=prior.filter(e=>qWords.includes(e));
      return {isFollowUp,hasPronoun,referents:overlaps.length?overlaps:((isFollowUp||hasPronoun)?prior:[]),
        unresolved:(isFollowUp||hasPronoun)&&prior.length===0};
    }
    function topic(){
      const counts=new Map();
      turns.forEach(t=>(t.entities||[]).forEach(e=>counts.set(e,(counts.get(e)||0)+1)));
      return [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8).map(x=>x[0]);
    }
    function summary(){
      const users=turns.filter(t=>t.role==="user");
      const assistants=turns.filter(t=>t.role==="assistant");
      return {turnCount:turns.length,userTurnCount:users.length,assistantTurnCount:assistants.length,
        currentTopic:topic(),lastUserMessage:[...users].pop()?.content||"",
        recentIntents:turns.filter(t=>t.intent).slice(-6).map(t=>t.intent),
        truncated:sequence>turns.length};
    }
    function context(text){
      const ref=text?resolveReference(text):null;
      return ["MÉMOIRE DE TRAVAIL IDÉE VISION",
        "Sujets récents : "+topic().join(", "),
        "Historique récent :",
        ...recent(8).map(t=>t.role.toUpperCase()+": "+t.content),
        ref?"Références possibles : "+ref.referents.join(", "):"",
        ref&&ref.unresolved?"Référence non résolue : demander une précision.":""
      ].filter(Boolean).join("\n");
    }
    function clear(){turns.length=0;totalChars=0;sequence=0;}
    function exportData(){
      return {schema:SCHEMA,version:VERSION,turns:turns.map(publicTurn),exportedAt:Date.now()};
    }
    function importData(data){
      if(!data||data.schema!==SCHEMA||!Array.isArray(data.turns))throw new TypeError("Format de mémoire invalide.");
      if(data.turns.length>maxTurns*4)throw new RangeError("Historique importé trop volumineux.");
      clear();
      data.turns.forEach(t=>{
        if(!t||!["user","assistant","system"].includes(t.role)||typeof t.content!=="string")return;
        add(t.role,t.content,{intent:t.intent,timestamp:t.timestamp});
      });
      return summary();
    }
    function diagnostics(){return {name:"Idée Vision Context Memory",version:VERSION,volatile:true,
      persistence:"disabled_by_default",turns:turns.length,characters:totalChars,maxTurns,maxChars};}
    return Object.freeze({add,recent,resolveReference,topic,summary,context,clear,exportData,importData,diagnostics,
      get size(){return turns.length;},get characters(){return totalChars;}});
  }
  root.IdeeVisionContextMemory=Object.freeze({version:VERSION,create,diagnostics:{schema:SCHEMA}});
})(typeof window!=="undefined"?window:globalThis);
