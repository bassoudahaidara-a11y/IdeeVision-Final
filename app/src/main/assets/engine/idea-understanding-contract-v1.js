(function (root) {
  'use strict';

  const VERSION = '1.0.0';
  const MAX_OBJECTS = 30;
  const MAX_RELATIONS = 60;
  const MAX_ACTIONS = 40;
    const INTENTS = ['create', 'simulate', 'explain', 'modify', 'describe', 'compare'];
  const MODES = ['2D', '3D', 'text'];
  const RELATIONS = [
    'on', 'under', 'inside', 'contains', 'left_of', 'right_of',
    'in_front_of', 'behind', 'above', 'below', 'attached_to',
    'connected_to', 'near', 'far_from', 'part_of'
  ];
  const ACTIONS = ['fall', 'bounce', 'rotate', 'move', 'open', 'close', 'grow', 'flow', 'heat', 'cool', 'explode', 'transform'];
  const SIZES = ['tiny', 'small', 'medium', 'large', 'huge'];
  const MATERIALS = ['wood', 'metal', 'plastic', 'glass', 'stone', 'water', 'air', 'soil', 'rubber', 'fabric', 'ceramic', 'unknown'];

  function isPlainObject(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
  }

  function ownKeys(value, allowed, label, errors) {
    if (!isPlainObject(value)) {
      errors.push(label + ' doit être un objet.');
      return false;
    }
    for (const key of Object.keys(value)) {
      if (!allowed.includes(key)) errors.push(label + '.' + key + ' est une propriété inconnue.');
    }
    return true;
  }

  function text(value, label, max, errors, optional) {
    if (value === undefined && optional) return;
    if (typeof value !== 'string' || !value.trim() || value.length > max) {
      errors.push(label + ' doit être un texte non vide de ' + max + ' caractères maximum.');
    }
  }

  function number(value, label, min, max, errors) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
      errors.push(label + ' doit être un nombre compris entre ' + min + ' et ' + max + '.');
    }
  }

  function validate(input) {
    const errors = [];
    if (!ownKeys(input, [
      'schemaVersion', 'language', 'intent', 'mode', 'objects',
      'relations', 'actions', 'confidence', 'needsClarification',
      'clarificationQuestion', 'notes'
    ], 'interpretation', errors)) return { valid: false, errors };

    if (input.schemaVersion !== 1) errors.push('schemaVersion doit être égal à 1.');
    if (input.language !== 'fr') errors.push('language doit être fr.');
    if (!INTENTS.includes(input.intent)) errors.push('Intention inconnue.');
    if (!MODES.includes(input.mode)) errors.push('Mode inconnu.');

    if (!Array.isArray(input.objects) || input.objects.length > MAX_OBJECTS) {
      errors.push('objects doit contenir au maximum ' + MAX_OBJECTS + ' éléments.');
    } else {
      const ids = new Set();
      input.objects.forEach((obj, index) => {
        const label = 'objects[' + index + ']';
        if (!ownKeys(obj, ['id', 'concept', 'label', 'quantity', 'properties'], label, errors)) return;
        text(obj.id, label + '.id', 40, errors);
        text(obj.concept, label + '.concept', 80, errors);
        text(obj.label, label + '.label', 100, errors);
        if (typeof obj.id === 'string') {
          if (!/^[a-z][a-z0-9_-]{0,39}$/.test(obj.id)) errors.push(label + '.id a un format invalide.');
          if (ids.has(obj.id)) errors.push('Identifiant répété : ' + obj.id);
          ids.add(obj.id);
        }
        if (!Number.isInteger(obj.quantity) || obj.quantity < 1 || obj.quantity > 20) {
          errors.push(label + '.quantity doit être un entier entre 1 et 20.');
        }
        if (ownKeys(obj.properties, ['color', 'size', 'material', 'dimensions', 'purpose', 'custom'], label + '.properties', errors)) {
          const p = obj.properties;
          if (p.color !== undefined) text(p.color, label + '.properties.color', 40, errors);
          if (p.size !== undefined && !SIZES.includes(p.size)) errors.push(label + '.properties.size inconnue.');
          if (p.material !== undefined && !MATERIALS.includes(p.material)) errors.push(label + '.properties.material inconnu.');
          if (p.purpose !== undefined) text(p.purpose, label + '.properties.purpose', 160, errors);
          if (p.custom !== undefined) {
            if (!isPlainObject(p.custom)) errors.push(label + '.properties.custom doit être un objet.');
            else {
              const customKeys = Object.keys(p.custom);
              if (customKeys.length > 12) errors.push(label + '.properties.custom contient trop de champs.');
              for (const key of customKeys) {
                const value = p.custom[key];
                if (!/^[a-zA-Z][a-zA-Z0-9_-]{0,39}$/.test(key) ||
                    !(['string', 'number', 'boolean'].includes(typeof value)) ||
                    (typeof value === 'number' && !Number.isFinite(value)) ||
                    (typeof value === 'string' && value.length > 120)) {
                  errors.push(label + '.properties.custom contient une valeur non autorisée.');
                }
              }
            }
          }
          if (p.dimensions !== undefined) {
            if (ownKeys(p.dimensions, ['width', 'height', 'depth', 'radius', 'unit'], label + '.properties.dimensions', errors)) {
              for (const k of ['width', 'height', 'depth', 'radius']) {
                if (p.dimensions[k] !== undefined) number(p.dimensions[k], label + '.properties.dimensions.' + k, 0.001, 100000, errors);
              }
              if (p.dimensions.unit !== undefined && !['mm', 'cm', 'm', 'km', 'in', 'ft'].includes(p.dimensions.unit)) {
                errors.push(label + '.properties.dimensions.unit non prise en charge.');
              }
            }
          }
        }
      });

      if (Array.isArray(input.relations)) {
        input.relations.forEach((rel, index) => {
          if (isPlainObject(rel) && typeof rel.from === 'string' && typeof rel.to === 'string') {
            if (!ids.has(rel.from)) errors.push('relations[' + index + '].from référence un objet absent.');
            if (!ids.has(rel.to)) errors.push('relations[' + index + '].to référence un objet absent.');
          }
        });
      }
    }

    if (!Array.isArray(input.relations) || input.relations.length > MAX_RELATIONS) {
      errors.push('relations doit être une liste de ' + MAX_RELATIONS + ' éléments maximum.');
    } else {
      input.relations.forEach((rel, index) => {
        const label = 'relations[' + index + ']';
        if (!ownKeys(rel, ['from', 'to', 'type'], label, errors)) return;
        text(rel.from, label + '.from', 40, errors);
        text(rel.to, label + '.to', 40, errors);
        if (!RELATIONS.includes(rel.type)) errors.push(label + '.type inconnue.');
        if (rel.from === rel.to) errors.push(label + ' ne peut pas relier un objet à lui-même.');
      });
    }

    const idsForActions = new Set(Array.isArray(input.objects) ? input.objects.map(obj => obj && obj.id).filter(id => typeof id === 'string') : []);
    if (!Array.isArray(input.actions) || input.actions.length > MAX_ACTIONS) {
      errors.push('actions doit être une liste de ' + MAX_ACTIONS + ' éléments maximum.');
    } else {
      input.actions.forEach((action, index) => {
        const label = 'actions[' + index + ']';
        if (!ownKeys(action, ['type', 'target', 'parameters'], label, errors)) return;
        if (!ACTIONS.includes(action.type)) errors.push(label + '.type inconnue.');
        if (action.target !== undefined) {
          text(action.target, label + '.target', 40, errors);
          if (typeof action.target === 'string' && !idsForActions.has(action.target)) {
            errors.push(label + '.target référence un objet absent.');
          }
        }
        if (action.parameters !== undefined) {
          const allowedParameters = ['speed', 'angle', 'axis', 'distance', 'duration', 'temperature', 'force', 'height', 'mass', 'count', 'unit', 'direction'];
          if (!ownKeys(action.parameters, allowedParameters, label + '.parameters', errors)) return;
          for (const key of Object.keys(action.parameters)) {
            const value = action.parameters[key];
            if (!['string', 'number', 'boolean'].includes(typeof value) ||
                (typeof value === 'number' && !Number.isFinite(value)) ||
                (typeof value === 'string' && value.length > 80)) {
              errors.push(label + '.parameters.' + key + ' contient une valeur invalide.');
            }
          }
        }
      });
    }

    number(input.confidence, 'confidence', 0, 1, errors);
    if (typeof input.needsClarification !== 'boolean') errors.push('needsClarification doit être booléen.');
    if (input.clarificationQuestion !== undefined) text(input.clarificationQuestion, 'clarificationQuestion', 240, errors);
    if (input.notes !== undefined) {
      if (!Array.isArray(input.notes) || input.notes.length > 10 || input.notes.some(x => typeof x !== 'string' || x.length > 200)) {
        errors.push('notes doit être une liste de 10 textes maximum (200 caractères chacun).');
      }
    }
    if ((!Array.isArray(input.objects) || input.objects.length === 0) && !input.needsClarification) errors.push('Une interprétation sans objet doit demander une précision.');
    if (input.needsClarification && !input.clarificationQuestion) {
      errors.push('Une question est obligatoire quand needsClarification vaut true.');
    }
    if (!input.needsClarification && input.clarificationQuestion !== undefined) {
      errors.push('clarificationQuestion doit être absent si aucune précision n’est nécessaire.');
    }
    return { valid: errors.length === 0, errors };
  }

  function fromLexical(parsed) {
    if (!parsed || !Array.isArray(parsed.objects)) throw new TypeError('Résultat lexical invalide.');
    const objects = parsed.objects.map((obj, index) => ({
      id: 'objet_' + (index + 1),
      concept: obj.type,
      label: obj.sourceMention || obj.type,
      quantity: obj.quantity,
      properties: {
        ...(obj.attributes && obj.attributes.color ? { color: obj.attributes.color } : {}),
        ...(obj.attributes && obj.attributes.size ? { size: obj.attributes.size } : {})
      }
    }));
    const result = {
      schemaVersion: 1,
      language: 'fr',
      intent: ['simulate', 'explain', 'modify', 'describe', 'compare'].includes(parsed.intent) ? parsed.intent : 'create',
      mode: parsed.mode === '2D' ? '2D' : '3D',
      objects,
      relations: [],
      actions: (parsed.actions || []).map(type => ({ type })),
      confidence: parsed.status === 'parsed' ? 0.35 : 0.1,
      needsClarification: parsed.status !== 'parsed',
      ...(parsed.status !== 'parsed' ? {
        clarificationQuestion: (parsed.clarifications || ['Peux-tu préciser ton idée ?'])[0]
      } : {}),
      notes: ['Conversion du moteur lexical v0.x ; résultat provisoire, à confirmer par le modèle neuronal.']
    };
    return result;
  }

  root.IdeeVisionUnderstandingContract = Object.freeze({
    version: VERSION,
    validate,
    fromLexical,
    limits: Object.freeze({ maxObjects: MAX_OBJECTS, maxRelations: MAX_RELATIONS, maxActions: MAX_ACTIONS })
  });
})(typeof window !== 'undefined' ? window : globalThis);
