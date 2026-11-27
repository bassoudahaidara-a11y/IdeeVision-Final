/* Idée Vision — French Understanding Foundation v1
 * Moteur symbolique local : analyse linguistique prudente, sans réseau ni modèle externe.
 * Il conserve les faits exprimés et marque les interprétations incertaines comme candidates.
 * Ce module ne déduit aucune loi physique.
 */
(function (root) {
  "use strict";

  const VERSION = "0.1.0";

  const FUNCTION_WORDS = new Set((
    "le la les un une des du de d au aux à et ou mais donc or ni car " +
    "dans sur sous devant derrière entre parmi vers chez avec sans pour par " +
    "en comme que qui quoi dont où ce cet cette ces mon ma mes ton ta tes " +
    "son sa ses notre nos votre vos leur leurs je tu il elle on nous vous ils elles " +
    "me te se moi toi lui eux y ne n pas plus jamais aucun aucune rien " +
    "est sont suis es sommes êtes était étaient sera seront être avoir ai as a avons avez ont " +
    "faire fait fais font peux peut peuvent doit doivent doit être"
  ).split(/\s+/));

  const VERBS = new Map([
    ["est","être"],["sont","être"],["suis","être"],["es","être"],["sommes","être"],["êtes","être"],["était","être"],["étaient","être"],
    ["a","avoir"],["ont","avoir"],["ai","avoir"],["as","avoir"],["avait","avoir"],
    ["contient","contenir"],["contiennent","contenir"],["contient","contenir"],
    ["comprend","comprendre"],["comprennent","comprendre"],
    ["possède","posséder"],["possede","posséder"],["possèdent","posséder"],
    ["tient","tenir"],["tiennent","tenir"],["porte","porter"],["portent","porter"],["prend","prendre"],["prends","prendre"],["prennent","prendre"],
    ["place","placer"],["places","placer"],["placer","placer"],["pose","poser"],["poser","poser"],
    ["relie","relier"],["relier","relier"],["connecte","connecter"],["connecter","connecter"],
    ["traverse","traverser"],["traverser","traverser"],["entre","entrer"],["sort","sortir"],
    ["tombe","tomber"],["tomber","tomber"],["bouge","bouger"],["bouger","bouger"],
    ["tourne","tourner"],["tourner","tourner"],["avance","avancer"],["avancer","avancer"],
    ["recule","reculer"],["reculer","reculer"],["monte","monter"],["monter","monter"],
    ["descend","descendre"],["descendre","descendre"],["ouvre","ouvrir"],["ouvrir","ouvrir"],
    ["ferme","fermer"],["fermer","fermer"],["coule","couler"],["couler","couler"],
    ["remplit","remplir"],["remplir","remplir"],["vide","vider"],["vider","vider"],
    ["ajoute","ajouter"],["ajouter","ajouter"],["enlève","enlever"],["enlever","enlever"],
    ["construit","construire"],["construire","construire"],["fabrique","fabriquer"],["fabriquer","fabriquer"],
    ["dessine","dessiner"],["dessiner","dessiner"],["décrit","décrire"],["décrire","décrire"],
    ["appuie","appuyer"],["appuyer","appuyer"],["pousse","pousser"],["pousser","pousser"],
    ["tire","tirer"],["tirer","tirer"],["frappe","frapper"],["frapper","frapper"],
    ["éclaire","éclairer"],["éclairer","éclairer"],["chauffe","chauffer"],["chauffer","chauffer"],
    ["refroidit","refroidir"],["refroidir","refroidir"],["connecte","connecter"],["connecter","connecter"]
  ]);

  const OBJECTS = new Set((
    "avion voiture camion vélo velo moto train bateau hélicoptère helicopter " +
    "maison bâtiment batiment immeuble pièce piece chambre bureau laboratoire atelier " +
    "table chaise porte fenêtre fenetre mur sol plafond toit escalier " +
    "bouteille flacon verre tube tuyau pompe trou bouchon eau air liquide " +
    "ballon balle roue moteur hélice helice aile fuselage réservoir reservoir " +
    "boîte boite cube sphère sphere cylindre cône cone objet appareil machine " +
    "robot ordinateur téléphone telephone écran ecran clavier souris " +
    "vis écrou ecrou boulon ressort engrenage levier poulie corde fil câble cable chariot " +
    "lampe lumière lumiere ampoule miroir lentille pile batterie circuit " +
    "personne homme femme enfant animal arbre fleur pierre terre sable " +
    "livre feuille papier crayon stylo sac chaussure vêtement vetement " +
    "eau huile gaz vapeur métal metal bois plastique verre fer acier cuivre " +
    "rouge bleu vert jaune noir blanc gris orange violet"
  ).split(/\s+/));

  const ADJECTIVES = new Set((
    "grand grande grands grandes petit petite petits petites long longue longs longues " +
    "court courte courts courtes haut haute bas basse large étroit étroite épais épaisse " +
    "fin fine lourd lourde léger légère leger legere rond ronde carré carree carrée " +
    "rectangulaire triangulaire plat plate creux creuse plein pleine vide solide liquide gazeux " +
    "transparent transparente opaque ouvert ouverte fermé fermée ferme mobile fixe " +
    "rouge bleue bleu verte vert jaune noire noir blanche blanc gris grise " +
    "chaud chaude froid froide rapide lent lente droit droite incliné inclinee inclinée " +
    "horizontal horizontale vertical verticale métallique metallique métallique"
  ).split(/\s+/));

  const SPATIAL = new Map([
    ["dans","inside"],["sur","on"],["sous","under"],["devant","in_front_of"],
    ["derrière","behind"],["entre","between"],["près","near"],["proche","near"],
    ["à côté","beside"],["au-dessus","above"],["dessous","below"],["à gauche","left_of"],
    ["à droite","right_of"],["autour","around"],["à l'intérieur","inside"],["hors","outside"]
  ]);

  const TEMPORAL = new Map([
    ["avant","before"],["après","after"],["puis","then"],["ensuite","next"],
    ["pendant","during"],["lorsque","when"],["quand","when"],["d'abord","first"],
    ["finalement","finally"],["simultanément","simultaneously"]
  ]);

  const NEGATIONS = new Set(["ne","n","pas","plus","jamais","aucun","aucune","ni"]);
  const QUANTIFIERS = new Set(["un","une","des","deux","trois","quatre","cinq","plusieurs","quelques","chaque","tous","toutes","aucun","aucune"]);
  const COLORS = new Set(["rouge","bleu","bleue","vert","verte","jaune","noir","noire","blanc","blanche","gris","grise","orange","violet","violette"]);

  function normalize(text) {
    return String(text == null ? "" : text)
      .normalize("NFKC")
      .replace(/[’‘]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/\s+/g, " ")
      .trim();
  }

  function fold(text) {
    return normalize(text).toLocaleLowerCase("fr-FR")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function splitSentences(text) {
    const source = normalize(text);
    if (!source) return [];
    const result = [];
    const re = /[^.!?…]+(?:[.!?…]+|$)/gu;
    let match;
    while ((match = re.exec(source))) {
      const value = match[0].trim();
      if (value) result.push({ text: value, start: match.index, end: match.index + match[0].length });
    }
    return result;
  }

  function tokenize(text) {
    const source = normalize(text);
    const tokens = [];
    const re = /[\p{L}\p{M}]+(?:['’][\p{L}\p{M}]+)*|\d+(?:[.,]\d+)?|[^\s]/gu;
    let match;
    while ((match = re.exec(source))) {
      const raw = match[0];
      const normalized = fold(raw);
      const isWord = /^[\p{L}\p{M}]/u.test(raw);
      const isNumber = /^\d/u.test(raw);
      tokens.push({
        text: raw,
        normalized,
        kind: isWord ? "word" : isNumber ? "number" : "punctuation",
        start: match.index,
        end: match.index + raw.length
      });
    }
    return tokens;
  }

  function classifyToken(token) {
    if (token.kind === "number") return "number";
    if (token.kind === "punctuation") return "punctuation";
    const w = token.normalized;
    if (NEGATIONS.has(w)) return "negation";
    if (VERBS.has(w)) return "verb";
    if (QUANTIFIERS.has(w)) return "quantifier";
    if (ADJECTIVES.has(w)) return "adjective";
    if (OBJECTS.has(w)) return "known_noun";
    if (SPATIAL.has(w)) return "spatial_marker";
    if (TEMPORAL.has(w)) return "temporal_marker";
    if (FUNCTION_WORDS.has(w)) return "function_word";
    return "unknown_word";
  }

  function extractQuantities(tokens) {
    const quantities = [];
    const units = new Set(["mm","cm","m","km","mg","g","kg","ml","l","s","min","h","hz","v","a","w","kw","j","n","pa","bar","°c","%"]);
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].kind !== "number") continue;
      const raw = tokens[i].text;
      const value = Number(raw.replace(",", "."));
      const next = tokens[i + 1];
      const unit = next && units.has(next.normalized) ? next.normalized : null;
      quantities.push({
        value,
        raw,
        unit,
        start: tokens[i].start,
        end: unit ? next.end : tokens[i].end
      });
    }
    return quantities;
  }

  function findObjects(tokens) {
    const objects = [];
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.kind !== "word") continue;
      const w = token.normalized;
      if (OBJECTS.has(w)) {
        const previous = tokens[i - 1];
        const determiner = previous && ["le","la","les","un","une","des","ce","cet","cette","ces","mon","ma","mes"].includes(previous.normalized)
          ? previous.normalized : null;
        objects.push({
          text: token.text,
          lemma: w,
          status: "recognized",
          determiner,
          start: token.start,
          end: token.end,
          properties: []
        });
      } else if (i > 0 && ["le","la","les","un","une","des","ce","cet","cette","ces","mon","ma","mes"].includes(tokens[i - 1].normalized)
          && !VERBS.has(w) && !FUNCTION_WORDS.has(w) && !ADJECTIVES.has(w)) {
        objects.push({
          text: token.text,
          lemma: null,
          status: "candidate",
          determiner: tokens[i - 1].normalized,
          start: token.start,
          end: token.end,
          properties: []
        });
      }
    }
    for (const object of objects) {
      const index = tokens.findIndex(t => t.start === object.start);
      const nearby = tokens.slice(Math.max(0, index - 3), index)
        .concat(tokens.slice(index + 1, index + 4));
      for (const t of nearby) {
        if (ADJECTIVES.has(t.normalized)) {
          object.properties.push({
            value: t.text,
            category: COLORS.has(t.normalized) ? "color" : "adjective",
            status: "explicit"
          });
        }
      }
    }
    return objects;
  }

  function findActions(tokens) {
    const actions = [];
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.kind !== "word" || !VERBS.has(t.normalized)) continue;
      const preceding = tokens.slice(Math.max(0, i - 4), i);
      const following = tokens.slice(i + 1, Math.min(tokens.length, i + 7));
      const negated = preceding.some(x => NEGATIONS.has(x.normalized)) ||
        following.slice(0, 2).some(x => NEGATIONS.has(x.normalized));
      actions.push({
        verb: t.text,
        lemma: VERBS.get(t.normalized),
        polarity: negated ? "negative" : "positive",
        subjectText: null,
        objectText: null,
        start: t.start,
        end: t.end,
        status: "verb_recognized_roles_unresolved"
      });
    }
    return actions;
  }

  function findRelations(tokens, objects) {
    const relations = [];
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.kind !== "word" || !SPATIAL.has(t.normalized)) continue;
      const left = objects.filter(o => o.end <= t.start).slice(-1)[0] || null;
      const right = objects.find(o => o.start >= t.end) || null;
      relations.push({
        type: SPATIAL.get(t.normalized),
        marker: t.text,
        from: left ? left.text : null,
        to: right ? right.text : null,
        status: left && right ? "explicit_relation" : "incomplete_relation",
        start: t.start,
        end: t.end
      });
    }
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.kind !== "word" || !TEMPORAL.has(t.normalized)) continue;
      relations.push({
        type: "temporal_" + TEMPORAL.get(t.normalized),
        marker: t.text,
        from: null,
        to: null,
        status: "temporal_marker_detected",
        start: t.start,
        end: t.end
      });
    }
    return relations;
  }

  function analyzeSentence(sentence) {
    const tokens = tokenize(sentence.text).map(t => ({ ...t, role: classifyToken(t) }));
    const objects = findObjects(tokens);
    const actions = findActions(tokens);
    const relations = findRelations(tokens, objects);
    const quantities = extractQuantities(tokens);
    const negations = tokens.filter(t => t.kind === "word" && NEGATIONS.has(t.normalized)).map(t => ({
      text: t.text, start: t.start, end: t.end
    }));
    const unknownWords = tokens.filter(t => t.role === "unknown_word").map(t => ({
      text: t.text, start: t.start, end: t.end
    }));
    return {
      text: sentence.text,
      sourceRange: { start: sentence.start, end: sentence.end },
      tokens,
      objects,
      actions,
      relations,
      quantities,
      negations,
      unknownWords
    };
  }

  function analyze(text) {
    const source = normalize(text);
    const sentences = splitSentences(source).map(analyzeSentence);
    const objects = sentences.flatMap((s, sentenceIndex) => s.objects.map(o => ({ ...o, sentenceIndex })));
    const actions = sentences.flatMap((s, sentenceIndex) => s.actions.map(a => ({ ...a, sentenceIndex })));
    const relations = sentences.flatMap((s, sentenceIndex) => s.relations.map(r => ({ ...r, sentenceIndex })));
    const quantities = sentences.flatMap((s, sentenceIndex) => s.quantities.map(q => ({ ...q, sentenceIndex })));
    const unknownWords = sentences.flatMap((s, sentenceIndex) => s.unknownWords.map(w => ({ ...w, sentenceIndex })));
    const issues = [];
    if (!source) issues.push({ code: "empty_description", severity: "blocking" });
    if (!objects.length && source) issues.push({ code: "no_object_recognized", severity: "warning" });
    if (objects.some(o => o.status === "candidate")) issues.push({ code: "candidate_noun_needs_confirmation", severity: "warning" });
    if (actions.some(a => a.polarity === "negative")) issues.push({ code: "negated_action_detected", severity: "information" });
    if (relations.some(r => r.status === "incomplete_relation")) issues.push({ code: "incomplete_relation", severity: "warning" });
    return {
      engine: "IdeeVisionFrenchUnderstanding",
      version: VERSION,
      offline: true,
      source,
      sentences,
      structure: { objects, actions, relations, quantities },
      unknownWords,
      issues,
      interpretationPolicy: {
        physicsApplied: false,
        unstatedPropertiesInvented: false,
        uncertainItemsMarked: true
      }
    };
  }

  function diagnostics() {
    return {
      name: "Idée Vision — Fondations de compréhension française",
      version: VERSION,
      offline: true,
      externalDependencies: [],
      scope: [
        "normalisation du texte",
        "segmentation en phrases",
        "tokenisation Unicode avec positions",
        "classification lexicale prudente",
        "reconnaissance d'objets connus et de noms candidats",
        "propriétés explicitement exprimées",
        "actions reconnues sans attribuer de rôles non prouvés",
        "négation",
        "quantités et unités",
        "relations spatiales et temporelles",
        "descriptions longues composées de plusieurs phrases",
        "signalement des inconnus et ambiguïtés",
        "représentation structurée sans simulation physique"
      ],
      limitations: [
        "couverture lexicale initiale limitée",
        "accords et conjugaisons non exhaustifs",
        "rôles sujet/objet encore non résolus",
        "les noms inconnus restent des candidats",
        "ce module n'est pas une intelligence générale"
      ]
    };
  }

  const api = Object.freeze({
    version: VERSION,
    normalize,
    fold,
    splitSentences,
    tokenize,
    classifyToken,
    extractQuantities,
    findObjects,
    findActions,
    findRelations,
    analyzeSentence,
    analyze,
    diagnostics
  });

  root.IdeeVisionFrenchUnderstanding = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
