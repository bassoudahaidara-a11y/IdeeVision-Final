/* Idée Vision — Cognitive Core v1
 * Offline-first request analysis. No network, no external dependencies.
 * This module structures requests; it is not a large language model.
 */
(function (root) {
  "use strict";
  const VERSION = "1.0.0";
  const STOP = new Set(["le","la","les","un","une","des","du","de","d","et","ou","en","dans","sur","pour","avec","sans","que","qui","quoi","est","sont","ce","cette","ces","mon","ma","mes","ton","ta","tes","je","tu","il","elle","nous","vous","ils","elles","à","au","aux","the","a","an","and","or","in","on","for","with","to","is","are"]);
  const INTENTS = [
    ["create", /\b(crée|creer|créer|construis|construire|fabrique|dessine|modélise|modelise|génère|genere|build|create|draw|design)\b/],
    ["explain", /\b(explique|expliquer|définis|definis|définir|pourquoi|comment fonctionne|what is|explain|why|how does)\b/],
    ["calculate", /\b(calcule|calculer|résous|resous|résoudre|combien|solve|calculate|compute)\b/],
    ["compare", /\b(compare|comparer|différence|difference|versus|vs\.?|meilleur|best)\b/],
    ["summarize", /\b(résume|resume|résumer|synthèse|synthese|summary|summarize)\b/],
    ["translate", /\b(traduis|traduire|traduction|translate|translation)\b/],
    ["code", /\b(code|programme|programmer|script|python|javascript|html|css|java|debug|débogue)\b/],
    ["simulate", /\b(simule|simuler|simulation|expérience|experience|physique|mouvement|gravité|gravite|simulate)\b/],
    ["search", /\b(recherche|cherche|trouve|vérifie|verifie|actualités|actualites|prix|météo|meteo|search|find|latest)\b/]
  ];
  const UNSAFE = /\b(fabriquer une bombe|construire une bombe|explosif maison|arme artisanale|empoisonner|poisonner|malware|ransomware)\b/i;
  const UNITS = ["mm","cm","m","km","mg","g","kg","ml","l","s","min","h","hz","khz","mhz","°c","celsius","v","a","w","kw","j","n","pa","bar","%"];
  const LANG_MARKERS = {
    fr: /\b(je|tu|nous|vous|est|sont|avec|pour|dans|comment|pourquoi|bonjour|merci|crée|fais|explique)\b/,
    en: /\b(the|is|are|with|for|how|why|please|hello|thanks|create|make|explain)\b/,
    bm: /\b(n b’a|n bɛ|i ka|a bɛ|an bɛ|aw ye|ka kɛ|ne ye|i ye)\b/
  };
  function normalizeText(value) {
    return String(value == null ? "" : value).normalize("NFKC")
      .replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"')
      .replace(/\s+/g, " ").trim();
  }
  function fold(value) {
    return normalizeText(value).toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  function tokenize(text) {
    return fold(text).match(/[\p{L}\p{N}]+(?:['’][\p{L}]+)?/gu) || [];
  }
  function detectLanguage(text) {
    const t = fold(text), scores = { fr: 0, en: 0, bm: 0 };
    Object.keys(LANG_MARKERS).forEach(lang => {
      const matches = t.match(new RegExp(LANG_MARKERS[lang].source, "g"));
      scores[lang] = matches ? matches.length : 0;
    });
    const ranked = Object.entries(scores).sort((a,b) => b[1]-a[1]);
    return ranked[0][1] > 0 ? ranked[0][0] : "unknown";
  }
  function classifyIntent(text) {
    const t = fold(text);
    for (const [intent, re] of INTENTS) if (re.test(t)) return intent;
    return "general";
  }
  function extractEntities(text) {
    const source = normalizeText(text);
    const numberPattern = /[-+]?\d+(?:[.,]\d+)?/g;
    const numbers = (source.match(numberPattern) || []).map(v => Number(v.replace(",", "."))).filter(Number.isFinite);
    const lower = fold(source);
    const unitTokens = lower.split(/[^a-z0-9°]+/).filter(Boolean);\n    const units = UNITS.filter(unit => unit === "%" ? lower.includes("%") : unitTokens.includes(unit));
    const dimensions = [];
    const dimRe = /([-+]?\d+(?:[.,]\d+)?)\s*(mm|cm|km|m)\s*[x×]\s*([-+]?\d+(?:[.,]\d+)?)\s*(mm|cm|km|m)(?:\s*[x×]\s*([-+]?\d+(?:[.,]\d+)?)\s*(mm|cm|km|m))?/gi;
    let match;
    while ((match = dimRe.exec(source))) {
      dimensions.push({ values: [match[1],match[3],match[5]].filter(Boolean).map(v => Number(v.replace(",", "."))), units: [match[2],match[4],match[6]].filter(Boolean) });
    }
    const words = tokenize(source).filter(w => w.length > 2 && !STOP.has(w));
    return { numbers, units, dimensions, keywords: [...new Set(words)].slice(0,30) };
  }
  function detectAmbiguity(text, intent, entities) {
    const t = fold(text), issues = [];
    if (t.length < 8) issues.push("request_too_short");
    if (/\b(ça|cela|ceci|lui|elle|it|that|this)\b/.test(t) && entities.keywords.length < 2) issues.push("unresolved_reference");
    if (intent === "create" && entities.numbers.length === 0 && /\b(maison|pont|avion|robot|voiture|batiment|house|bridge|plane|car)\b/.test(t)) issues.push("missing_dimensions_optional");
    return issues;
  }
  function assessSafety(text) {
    return UNSAFE.test(fold(text)) ? { status: "review_required", category: "potentially_harmful_instructions" } : { status: "normal", category: "none" };
  }
  function buildPlan(intent, entities, ambiguity) {
    const base = ["comprendre_la_demande","identifier_les_informations_utiles"];
    const plans = {
      create:["définir_les_composants","proposer_les_dimensions","préparer_la_conception","vérifier_la_cohérence"],
      explain:["organiser_les_concepts","expliquer_par_étapes","donner_un_exemple"],
      calculate:["identifier_les_données","choisir_la_formule","effectuer_le_calcul","vérifier_l_unité"],
      compare:["définir_les_critères","comparer_les_caractéristiques","formuler_une_conclusion"],
      summarize:["repérer_les_idées_principales","ordonner_les_informations","rédiger_la_synthèse"],
      translate:["identifier_les_langues","préserver_le_sens","vérifier_la_formulation"],
      code:["définir_le_comportement_attendu","choisir_une_structure","écrire_le_code","prévoir_des_tests"],
      simulate:["définir_le_système","identifier_les_variables","choisir_les_lois","préparer_la_simulation","contrôler_les_résultats"],
      search:["définir_les_faits_à_vérifier","repérer_les_sources","recouper_les_informations"]
    };
    const plan = base.concat(plans[intent] || ["déterminer_le_type_de_réponse","préparer_une_réponse_claire"]);
    if (ambiguity.length) plan.push("demander_une_précision_si_nécessaire");
    plan.push("présenter_le_résultat_et_signaler_les_limites");
    return plan;
  }
  function analyze(text, options) {
    const request = normalizeText(text), intent = classifyIntent(request), language = detectLanguage(request);
    const entities = extractEntities(request), ambiguity = detectAmbiguity(request,intent,entities), safety = assessSafety(request);
    const confidence = Math.max(0.15,Math.min(0.98,0.42+Math.min(entities.keywords.length,8)*0.045+(intent!=="general"?0.16:0)+(language!=="unknown"?0.08:0)-ambiguity.length*0.08));
    return { engine:"IdeeVisionCognitive", version:VERSION, request, normalized:fold(request), language, intent, entities, ambiguity,
      needsClarification:ambiguity.some(x=>x==="request_too_short"||x==="unresolved_reference"), safety,
      confidence:Number(confidence.toFixed(2)), plan:buildPlan(intent,entities,ambiguity),
      timestamp:options&&Number.isFinite(options.timestamp)?options.timestamp:null };
  }
  function createSession(options) {
    const maxTurns = Math.max(1,Math.min(40,Number(options&&options.maxTurns)||12)), turns=[];
    return {
      add(userText,analysis) { turns.push({user:normalizeText(userText).slice(0,4000),intent:analysis&&analysis.intent||"general"}); while(turns.length>maxTurns) turns.shift(); return turns.length; },
      recent() { return turns.map(t=>({...t})); },
      clear() { turns.length=0; },
      get size() { return turns.length; }
    };
  }
  function makePromptContext(analysis) {
    if (!analysis||analysis.engine!=="IdeeVisionCognitive") throw new TypeError("Analyse cognitive invalide.");
    return ["CONTEXTE STRUCTURÉ IDÉE VISION","Langue détectée : "+analysis.language,"Intention : "+analysis.intent,
      "Mots-clés : "+analysis.entities.keywords.join(", "),"Nombres : "+analysis.entities.numbers.join(", "),
      "Unités : "+analysis.entities.units.join(", "),"Confiance heuristique : "+analysis.confidence,
      "Plan : "+analysis.plan.join(" -> "),"Précisions : "+(analysis.ambiguity.length?analysis.ambiguity.join(", "):"aucune détectée"),
      "Sécurité : "+analysis.safety.status].join("\n");
  }
  function routeIntent(intent) {
    return ({create:"design_engine",explain:"knowledge_engine",calculate:"math_engine",compare:"analysis_engine",
      summarize:"knowledge_engine",translate:"language_engine",code:"programming_engine",simulate:"simulation_engine",
      search:"research_engine",general:"conversation_engine"})[intent]||"conversation_engine";
  }
  function diagnostics() {
    return {name:"Idée Vision Cognitive Core",version:VERSION,offline:true,dependencies:[],
      capabilities:["normalisation","détection_langue_heuristique","classification_intention","extraction_nombres_unités_dimensions",
      "détection_ambiguïté","planification","mémoire_session","routage","contrôle_préliminaire"]};
  }
  root.IdeeVisionCognitive = Object.freeze({version:VERSION,normalizeText,detectLanguage,tokenize,classifyIntent,extractEntities,
    detectAmbiguity,assessSafety,buildPlan,analyze,createSession,makePromptContext,routeIntent,diagnostics});
})(typeof window !== "undefined" ? window : globalThis);
