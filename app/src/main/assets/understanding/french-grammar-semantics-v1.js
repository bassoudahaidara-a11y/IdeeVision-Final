/* Idée Vision — French grammatical and semantic analysis v1
 * Analyseur symbolique local. Les rôles sont des hypothèses linguistiques traçables,
 * jamais des conclusions physiques. Les ambiguïtés restent explicitement signalées.
 */
(function (root) {
  "use strict";
  const VERSION = "0.1.0";
  const DETERMINERS = new Set(["le","la","les","l'","un","une","des","du","de","d'","ce","cet","cette","ces","mon","ma","mes","ton","ta","tes","son","sa","ses","notre","nos","votre","vos","leur","leurs","quelques","plusieurs","chaque"]);
  const PRONOUNS = new Set(["je","j'","tu","il","elle","on","nous","vous","ils","elles","me","m'","te","t'","se","s'","lui","leur","eux","y","en","ce","cela","ça","qui","que","dont"]);
  const PREPOSITIONS = new Set(["à","a","au","aux","de","du","des","d'","dans","sur","sous","avec","sans","pour","par","vers","chez","entre","devant","derrière","près","contre","depuis","pendant","après","avant","en"]);
  const CONJUNCTIONS = new Set(["et","ou","mais","donc","or","ni","car","que","lorsque","quand","puis","ensuite"]);
  const ADVERBS = new Set(["très","trop","assez","peu","beaucoup","rapidement","lentement","doucement","fortement","ne","pas","plus","jamais","déjà","encore","bien","mal","ici","là"]);
  const AUXILIARIES = new Set(["être","avoir"]);
  const POSSESSIVES = new Set(["mon","ma","mes","ton","ta","tes","son","sa","ses","notre","nos","votre","vos","leur","leurs"]);
  const GENDER = new Map([
    ["bouteille","f"],["pompe","f"],["table","f"],["voiture","f"],["maison","f"],["porte","f"],["fenêtre","f"],["eau","f"],["voiture","f"],["machine","f"],["balle","f"],["boîte","f"],["boite","f"],["pompe","f"],
    ["avion","m"],["tube","m"],["tuyau","m"],["moteur","m"],["ballon","m"],["ordinateur","m"],["robot","m"],["chariot","m"],["garçon","m"],["garcon","m"],["livre","m"],["circuit","m"],["sol","m"],["verre","m"]
  ]);
  const SINGULAR_TO_PLURAL = new Map([["le","les"],["la","les"],["un","des"],["une","des"],["ce","ces"],["cet","ces"],["cette","ces"],["mon","mes"],["ma","mes"],["ton","tes"],["ta","tes"],["son","ses"],["sa","ses"]]);
  const AGREEMENT_PAIRS = new Map([
    ["grand","grande"],["petit","petite"],["long","longue"],["court","courte"],["haut","haute"],["bas","basse"],["lourd","lourde"],["léger","légère"],["leger","legere"],["fermé","fermée"],["ferme","fermee"],["ouvert","ouverte"],["plein","pleine"],["vide","vide"],["rouge","rouge"],["bleu","bleue"],["vert","verte"],["noir","noire"],["blanc","blanche"]
  ]);
  const KNOWN_VERBS = new Set([
    "être","avoir","contenir","comprendre","posséder","tenir","porter","placer","poser","relier","connecter","traverser","entrer","sortir","tomber","bouger","tourner","avancer","reculer","monter","descendre","ouvrir","fermer","couler","remplir","vider","ajouter","enlever","construire","fabriquer","dessiner","décrire","appuyer","pousser","tirer","frapper","éclairer","chauffer","refroidir","mesurer","utiliser","mettre","prendre","donner","devenir","rester","sembler","paraître","paraitre","fonctionner","tourner"
  ]);
  const FORMS = new Map([
    ["est",["être","present"]],["sont",["être","present"]],["suis",["être","present"]],["es",["être","present"]],["sommes",["être","present"]],["êtes",["être","present"]],["était",["être","imparfait"]],["étaient",["être","imparfait"]],["sera",["être","future"]],["seront",["être","future"]],
    ["a",["avoir","present"]],["ont",["avoir","present"]],["ai",["avoir","present"]],["as",["avoir","present"]],["avons",["avoir","present"]],["avez",["avoir","present"]],["avait",["avoir","imparfait"]],
    ["contient",["contenir","present"]],["contiennent",["contenir","present"]],["pousse",["pousser","present"]],["poussent",["pousser","present"]],["tire",["tirer","present"]],["tombe",["tomber","present"]],["tombent",["tomber","present"]],
    ["relie",["relier","present"]],["connecte",["connecter","present"]],["tourne",["tourner","present"]],["avance",["avancer","present"]],["descend",["descendre","present"]],["monte",["monter","present"]],
    ["ouvre",["ouvrir","present"]],["ferme",["fermer","present"]],["coule",["couler","present"]],["remplit",["remplir","present"]],["mesure",["mesurer","present"]],["utilise",["utiliser","present"]],
    ["est placé",["placer","past_participle"]],["est place",["placer","past_participle"]]
  ]);

  function fold(s) { return String(s == null ? "" : s).toLocaleLowerCase("fr-FR").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[’‘]/g,"'"); }
  function baseApi() { return root.IdeeVisionFrenchUnderstanding || (typeof require === "function" ? require("./french-language-foundation-v1.js") : null); }
  function tagToken(token, base) {
    const w = fold(token.text);
    if (/^[0-9]/.test(w)) return "number";
    if (/^[^\p{L}\p{M}0-9]/u.test(w)) return "punctuation";
    if (DETERMINERS.has(w)) return "determiner";
    if (PRONOUNS.has(w)) return "pronoun";
    if (CONJUNCTIONS.has(w)) return "conjunction";
    if (PREPOSITIONS.has(w)) return "preposition";
    if (ADVERBS.has(w)) return "adverb";
    if (token.role === "verb" || KNOWN_VERBS.has(w)) return "verb_candidate";
    if (token.role === "adjective") return "adjective";
    if (token.role === "known_noun" || token.role === "unknown_word") return "noun_or_unknown";
    return token.role || "unknown";
  }
  function tokenizeSentence(text, offset) {
    const base = baseApi();
    if (!base) throw new Error("Le moteur de fondation française doit être chargé avant l'analyse grammaticale.");
    const expanded = [];
    for (const t of base.tokenize(text)) {
      const match = fold(t.text).match(/^(l|d|j|m|t|s|n|c|qu)'(.+)$/u);
      if (match) {
        const prefixLength = match[1].length + 1;
        const prefix = t.text.slice(0, prefixLength);
        const suffix = t.text.slice(prefixLength);
        const first = {text:prefix, normalized:fold(prefix), kind:"word", start:t.start, end:t.start+prefix.length};
        const second = {text:suffix, normalized:fold(suffix), kind:"word", start:t.start+prefix.length, end:t.end};
        expanded.push({...first, role:base.classifyToken(first), absoluteStart:first.start+(offset||0), absoluteEnd:first.end+(offset||0)});
        expanded.push({...second, role:base.classifyToken(second), absoluteStart:second.start+(offset||0), absoluteEnd:second.end+(offset||0)});
      } else {
        expanded.push({...t, role:base.classifyToken(t), absoluteStart:t.start+(offset||0), absoluteEnd:t.end+(offset||0)});
      }
    }
    return expanded;
  }
  function analyzeSentence(sentence) {
    const base = baseApi();
    if (!base) throw new Error("French foundation unavailable");
    const rawTokens = tokenizeSentence(sentence.text, sentence.start);
    const tokens = rawTokens.map(t => ({...t, tag:tagToken(t, base)}));
    const recognized = base.analyzeSentence({text:sentence.text,start:sentence.start,end:sentence.end}).objects;
    const nounTokens = [];
    for (const obj of recognized) {
      const tokenIndex = tokens.findIndex(t => t.start === obj.start);
      if (tokenIndex >= 0) nounTokens.push({head:obj.text, lemma:obj.lemma, status:obj.status, start:obj.start, end:obj.end, tokenIndex, properties:obj.properties||[]});
    }
    for (let i=0;i<tokens.length;i++) {
      const t=tokens[i];
      if (t.role==="known_noun" && !nounTokens.some(n=>n.start===t.start)) {
        nounTokens.push({head:t.text,lemma:t.normalized,status:"recognized",start:t.start,end:t.end,tokenIndex:i,properties:[]});
      }
    }
    nounTokens.sort((a,b)=>a.start-b.start);
    const nounPhrases = nounTokens.map(n => {
      let left=n.tokenIndex, right=n.tokenIndex;
      while(left>0 && (tokens[left-1].tag==="determiner" || tokens[left-1].tag==="adjective" || POSSESSIVES.has(fold(tokens[left-1].text)))) left--;
      while(right+1<tokens.length && tokens[right+1].tag==="adjective") right++;
      const words=tokens.slice(left,right+1);
      const determiner=words.find(t=>t.tag==="determiner");
      const adjectives=words.filter(t=>t.tag==="adjective").map(t=>t.text);
      const lemma=n.lemma;
      const expectedGender=GENDER.get(lemma)||null;
      const agreementIssues=[];
      if(determiner && expectedGender) {
        const d=fold(determiner.text);
        const feminine=["la","une","cette","ma","ta","sa"].includes(d);
        const masculine=["le","un","ce","cet","mon","ton","son"].includes(d);
        if((expectedGender==="f" && masculine)||(expectedGender==="m" && feminine)) agreementIssues.push({type:"determiner_gender_mismatch",word:determiner.text,head:n.head});
      }
      return {text:sentence.text.slice(words[0].start,words[words.length-1].end),head:n.head,lemma:n.lemma,status:n.status,determiner:determiner?determiner.text:null,adjectives,expectedGender,agreementIssues,start:words[0].start,end:words[words.length-1].end,headStart:n.start,headEnd:n.end};
    });
    const verbs=[];
    for(let i=0;i<tokens.length;i++) {
      const t=tokens[i], w=fold(t.text);
      if(t.tag!=="verb_candidate" && !FORMS.has(w)) continue;
      const form=FORMS.get(w);
      const infinitive=/er$|ir$|re$|oir$/.test(w);
      const lemma=form?form[0]:(base.VERBS && base.VERBS.get(w)) || (KNOWN_VERBS.has(w)?w:null);
      if(!lemma) continue;
      verbs.push({text:t.text,lemma,tense:form?form[1]:(infinitive?"infinitive":"unresolved"),index:i,start:t.start,end:t.end});
    }
    const clauses=[];
    const boundaries=[-1];
    for(let i=0;i<tokens.length;i++) if(tokens[i].tag==="conjunction" && ["mais","et","ou","car","donc"].includes(fold(tokens[i].text))) boundaries.push(i);
    boundaries.push(tokens.length);
    for(let b=0;b<boundaries.length-1;b++) {
      const start=boundaries[b]+1,end=boundaries[b+1];
      const localVerbs=verbs.filter(v=>v.index>=start&&v.index<end);
      if(localVerbs.length) clauses.push({startToken:start,endToken:end,verbIndexes:localVerbs.map(v=>v.index),connector:b?tokens[boundaries[b]].text:null});
    }
    const predicates=[];
    for(const verb of verbs) {
      const clause=clauses.find(c=>verb.index>=c.startToken&&verb.index<c.endToken);
      const lower=clause?clause.startToken:0, upper=clause?clause.endToken:tokens.length;
      const prior=nounPhrases.filter(n=>n.headStart<verb.start&&tokens.findIndex(t=>t.start===n.headStart)>=lower).slice(-1)[0]||null;
      const next=nounPhrases.find(n=>n.headStart>verb.end&&tokens.findIndex(t=>t.start===n.headStart)<upper)||null;
      const beforeVerb=tokens.slice(lower,verb.index);
      const afterVerb=tokens.slice(verb.index+1,upper);
      const negated=beforeVerb.slice(-3).some(t=>["ne","n'","pas","jamais","plus"].includes(fold(t.text)))||afterVerb.slice(0,3).some(t=>["pas","jamais","plus"].includes(fold(t.text)));
      const nextPrep=afterVerb.find(t=>t.tag==="preposition"||t.tag==="punctuation");
      const objectEligible=next && (!nextPrep || tokens.findIndex(t=>t.start===next.headStart)<tokens.findIndex(t=>t.start===nextPrep.start));
      const role=verb.lemma==="être"?"copular":objectEligible?"transitive_candidate":"intransitive_or_incomplete";
      predicates.push({
        verb:verb.text,lemma:verb.lemma,tense:verb.tense,
        subject:prior?prior.head:null,
        subjectStatus:prior?"candidate_by_word_order":"unresolved",
        directObject:role==="transitive_candidate"?next.head:null,
        objectStatus:role==="transitive_candidate"?"candidate_by_word_order":"unresolved",
        predicateType:role,
        negated,
        confidence:prior?(role==="transitive_candidate"?"heuristic_medium":"heuristic_low"):"low",
        sourceRange:{start:verb.start,end:verb.end}
      });
    }
    const prepositionalPhrases=[];
    for(let i=0;i<tokens.length;i++) if(tokens[i].tag==="preposition") {
      const complement=nounPhrases.find(n=>n.headStart>tokens[i].end);
      prepositionalPhrases.push({preposition:tokens[i].text,complement:complement?complement.head:null,status:complement?"complement_candidate":"complement_missing",start:tokens[i].start,end:complement?complement.end:tokens[i].end});
    }
    const pronouns=tokens.filter(t=>t.tag==="pronoun").map(t=>({text:t.text,start:t.start,reference:null,status:"reference_unresolved"}));
    const coordination=tokens.filter(t=>t.tag==="conjunction").map(t=>({connector:t.text,type:["et","ou","mais"].includes(fold(t.text))?"coordination":"subordination_or_logic"}));
    const unknown=tokens.filter(t=>t.tag==="noun_or_unknown"&&!nounTokens.some(n=>n.start===t.start)).map(t=>({text:t.text,start:t.start,status:"lexical_or_role_ambiguous"}));
    const issues=[];
    if(!verbs.length) issues.push({code:"no_verb_identified",severity:"warning"});
    if(predicates.some(p=>p.subjectStatus==="unresolved")) issues.push({code:"subject_unresolved",severity:"warning"});
    if(pronouns.length) issues.push({code:"pronoun_reference_unresolved",severity:"information"});
    if(nounPhrases.some(n=>n.agreementIssues.length)) issues.push({code:"agreement_mismatch_candidate",severity:"warning"});
    if(unknown.length) issues.push({code:"unknown_or_ambiguous_tokens",severity:"information"});
    return {text:sentence.text,tokens,nounPhrases,verbs,predicates,prepositionalPhrases,pronouns,coordination,clauses,unknown,issues};
  }
  function analyze(text) {
    const base=baseApi();
    if(!base) throw new Error("Le moteur de fondation française doit être chargé avant l'analyse grammaticale.");
    const foundation=base.analyze(text);
    const sentences=foundation.sentences.map(analyzeSentence);
    return {
      engine:"IdeeVisionFrenchGrammarSemantics",version:VERSION,offline:true,
      source:foundation.source,sentences,
      structure:{
        nounPhrases:sentences.flatMap(s=>s.nounPhrases),
        predicates:sentences.flatMap(s=>s.predicates),
        prepositionalPhrases:sentences.flatMap(s=>s.prepositionalPhrases),
        pronouns:sentences.flatMap(s=>s.pronouns),
        coordination:sentences.flatMap(s=>s.coordination)
      },
      issues:sentences.flatMap((s,i)=>s.issues.map(x=>({...x,sentenceIndex:i}))),
      interpretationPolicy:{rolesAreHeuristicCandidates:true,unresolvedReferencesRemainUnresolved:true,physicsApplied:false}
    };
  }
  function diagnostics(){return {name:"Idée Vision — Analyse grammaticale et sémantique",version:VERSION,offline:true,externalDependencies:[],capabilities:["étiquetage grammatical initial","déterminants et groupes nominaux","noms reconnus et candidats","adjectifs liés à un groupe nominal","accords de genre connus signalés prudemment","verbes et temps de conjugaison connus","sujets candidats selon l'ordre des mots","compléments directs candidats","négation des prédicats","groupes prépositionnels","pronoms sans résolution forcée","coordination","découpage en propositions simples","positions exactes dans le texte","signalement des ambiguïtés"],limitations:["analyse syntaxique heuristique et non universelle","ordre des mots utilisé comme indice, pas comme preuve","accords lexicaux incomplets","pronoms anaphoriques non résolus","phrases complexes et subordonnées à approfondir","pas de compréhension physique ou causale"]};}
  const api=Object.freeze({version:VERSION,fold,tokenizeSentence,analyzeSentence,analyze,diagnostics});
  root.IdeeVisionFrenchGrammarSemantics=api;
  if(typeof module!=="undefined"&&module.exports) module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
