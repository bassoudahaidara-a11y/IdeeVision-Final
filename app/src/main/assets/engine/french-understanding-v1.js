(function (root) {
  'use strict';

  const VERSION = '0.1.0';
  const ONTOLOGY = [
    { type: 'house', words: ['maison', 'villa', 'batiment', 'habitation'] },
    { type: 'tree', words: ['arbre', 'arbres'] },
    { type: 'car', words: ['voiture', 'auto', 'vehicule'] },
    { type: 'robot', words: ['robot', 'automate'] },
    { type: 'dragon', words: ['dragon'] },
    { type: 'ball', words: ['ballon', 'balle', 'sphere'] },
    { type: 'cube', words: ['cube', 'boite', 'bloc'] },
    { type: 'table', words: ['table'] },
    { type: 'planet', words: ['planete', 'astre'] },
    { type: 'rocket', words: ['fusee', 'lanceur'] },
    { type: 'airplane', words: ['avion', 'aeronef'] },
    { type: 'boat', words: ['bateau', 'navire', 'voilier'] },
    { type: 'flower', words: ['fleur', 'rose'] },
    { type: 'person', words: ['personne', 'personnage', 'humain'] },
    { type: 'bridge', words: ['pont'] }
  ];

  const NUMBERS = {
    un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5,
    six: 6, sept: 7, huit: 8, neuf: 9, dix: 10
  };
  const COLORS = {
    bleu: '#58A6FF', bleue: '#58A6FF', rouge: '#FF6B6B',
    vert: '#58D68D', verte: '#58D68D', jaune: '#FFD166',
    violet: '#B892FF', orange: '#FF9F43', blanc: '#F4F7FF',
    blanche: '#F4F7FF', noir: '#30384D', noire: '#30384D',
    rose: '#FF8FC7', marron: '#A66A43', gris: '#AAB3C5'
  };

  function normalize(text) {
    return String(text == null ? '' : text)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[’']/g, ' ')
      .replace(/[^a-z0-9\s.-]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function findMentions(text) {
    const found = [];
    for (const item of ONTOLOGY) {
      let best = null;
      for (const word of item.words) {
        const re = new RegExp('\\b' + escapeRegExp(word) + '\\b', 'g');
        let match;
        while ((match = re.exec(text)) !== null) {
          if (!best || match.index < best.index) {
            best = { word, index: match.index, end: match.index + match[0].length };
          }
        }
      }
      if (best) found.push({ type: item.type, mention: best.word, index: best.index, end: best.end });
    }
    return found.sort((a, b) => a.index - b.index);
  }

  function quantityBefore(text, mention) {
    const before = text.slice(Math.max(0, mention.index - 22), mention.index).trim();
    const match = before.match(/(?:^|\\s)(un|une|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|[1-9][0-9]?)(?:\\s+[a-z]+){0,2}$/);
    if (!match) return 1;
    const token = match[1];
    return NUMBERS[token] || Number(token) || 1;
  }

  function nearestAttribute(text, mention, dictionary, maxDistance) {
    let best = null;
    for (const word of Object.keys(dictionary)) {
      const re = new RegExp('\\b' + escapeRegExp(word) + '\\b', 'g');
      let match;
      while ((match = re.exec(text)) !== null) {
        const distance = match.index < mention.index
          ? mention.index - (match.index + match[0].length)
          : match.index - mention.end;
        if (distance >= -2 && distance <= maxDistance && (!best || distance < best.distance)) {
          best = { word, value: dictionary[word], distance };
        }
      }
    }
    return best;
  }

  function analyze(input) {
    const source = String(input == null ? '' : input).trim();
    const text = normalize(source);
    const mentions = findMentions(text);
    const objects = mentions.map((mention, index) => {
      const amount = quantityBefore(text, mention);
      const color = nearestAttribute(text, mention, COLORS, 28);
      const size = nearestAttribute(text, mention, {
        immense: 'large', geant: 'large', grand: 'large', grande: 'large',
        petit: 'small', petite: 'small', minuscule: 'small'
      }, 24);
      const position = nearestAttribute(text, mention, {
        gauche: 'left', droite: 'right', devant: 'front', derriere: 'back',
        dessus: 'above', dessous: 'below'
      }, 32);
      return {
        id: 'objet_' + (index + 1),
        type: mention.type,
        quantity: Math.min(20, amount),\n        quantityClamped: amount > 20,
        attributes: {
          color: color ? color.value : null,
          size: size ? size.value : null,
          position: position ? position.value : null
        },
        sourceMention: mention.mention
      };
    });

    const mode = /\b(2d|deux dimensions|dessin a plat|schema)\\b/.test(text)
      ? '2D' : '3D';
    const actions = [];
    if (/\b(tombe|tomber|chute|chuter|gravite|rebondit|rebondir)\\b/.test(text)) actions.push('fall');
    if (/\b(tourne|tourner|rotation|pivote|pivoter)\\b/.test(text)) actions.push('rotate');
    if (/\b(ouvre|ouvrir|s ouvre)\\b/.test(text)) actions.push('open');
    if (/\b(avance|avancer|recule|reculer|deplace|deplacer)\\b/.test(text)) actions.push('move');

    const intent = /\b(explique|expliquer|comment fonctionne|pourquoi)\\b/.test(text)
      ? 'explain'
      : /\b(simule|simuler|simulation|experience|experimente)\\b/.test(text)
        ? 'simulate'
        : /\b(dessine|dessiner|construis|construire|cree|creer|montre|representer|represente)\\b/.test(text)
          ? 'create' : 'describe';

    const clarifications = [];
    if (!source) clarifications.push('Décris ce que tu veux créer ou étudier.');
    else if (objects.length === 0) clarifications.push('Je n’ai pas encore identifié l’objet principal. Peux-tu le décrire autrement ?');
    if (objects.some(o => o.quantityClamped)) clarifications.push('La quantité demandée dépasse la limite initiale de 20 objets.');

    return {
      schemaVersion: 1,
      engineVersion: VERSION,
      language: 'fr',
      normalizedText: text,
      intent,
      mode,
      objects,
      actions,
      clarifications,
      status: clarifications.length ? 'needs_clarification' : 'parsed',
      limitations: ['Compréhension lexicale initiale : ce module ne constitue pas encore un modèle neuronal.']
    };
  }

  root.IdeeVisionLanguage = Object.freeze({
    version: VERSION,
    normalize,
    analyze,
    ontology: ONTOLOGY.map(item => ({ type: item.type, words: item.words.slice() }))
  });
})(typeof window !== 'undefined' ? window : globalThis);
