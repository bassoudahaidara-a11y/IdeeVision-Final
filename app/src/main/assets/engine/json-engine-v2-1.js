(function () {
  'use strict';

  const MAX_OBJECTS = 100;
  const MAX_COMMANDS = 200;
  const MAX_STEPS = 60;
  const MAX_DURATION = 30;
  const MAX_TOTAL_DURATION = 600;
  const MAX_POINTS = 100;
  const MAX_DEPTH = 4;

  const ID = /^[a-zA-Z][a-zA-Z0-9_-]{0,39}$/;
  const COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

  const TYPES = {
    box: ['w', 'h', 'd'],
    sphere: ['r'],
    cylinder: ['r', 'r2', 'h'],
    cone: ['r', 'h'],
    torus: ['r', 'tube'],
    roof: ['w', 'h', 'd'],
    plane: ['w', 'h'],
    circle: ['r'],
    floor: ['w', 'd'],
    tree: ['s'],
    person: ['s'],
    car: ['s'],
    group: [],
    wall: ['h', 't'],
    rod: ['t'],
    arrow: [],
    text: ['size', 'bg'],
    lathe: [],
    extrude: ['d'],
    tube: ['r']
  };

  const COMMON = [
    'x', 'y', 'z', 'rx', 'ry', 'rz',
    'color', 'opacity', 'name', 'ghost',
    'metal', 'rough', 'emissive', 'glow'
  ];

  const ACTION_KEYS = {
    move: ['type', 'target', 'to', 'duration'],
    rotate: ['type', 'target', 'to', 'duration'],
    scale: ['type', 'target', 'to', 'duration'],
    fade: ['type', 'target', 'opacity', 'duration'],
    recolor: ['type', 'target', 'color', 'duration'],
    drop: ['type', 'target', 'options'],
    wait: ['type', 'duration'],
    say: ['type', 'text'],
    focus: ['type', 'at', 'zoom', 'duration', 'camera'],
    world: ['type', 'ground', 'bg'],
    keepLevel: ['type', 'target'],
    parallel: ['type', 'actions']
  };

  function fail(message) {
    throw new Error('JSON Engine V2.1 : ' + message);
  }

  function isObject(value) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      return false;
    }
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
  }

  function keys(obj, allowed, label) {
    if (!isObject(obj)) fail(label + ' doit être un objet JSON.');
    for (const key of Object.keys(obj)) {
      if (!allowed.includes(key)) {
        fail('Propriété interdite : ' + label + '.' + key);
      }
    }
  }

  function num(value, label, min, max) {
    if (typeof value !== 'number' ||
        !Number.isFinite(value) ||
        value < min || value > max) {
      fail(label + ' doit être un nombre entre ' + min + ' et ' + max + '.');
    }
  }

  function str(value, label, max) {
    if (typeof value !== 'string' ||
        value.trim().length === 0 ||
        value.length > max) {
      fail(label + ' contient un texte invalide.');
    }
  }

  function color(value, label) {
    if (typeof value !== 'string' || !COLOR.test(value)) {
      fail('Couleur invalide : ' + label);
    }
  }

  function point(value, label, allowed, optional) {
    keys(value, allowed || ['x', 'y', 'z'], label);
    const fields = Object.keys(value);
    if (!optional && fields.length === 0) fail(label + ' est vide.');
    for (const k of fields) num(value[k], label + '.' + k, -50, 50);
  }

  function duration(value, label) {
    if (value !== undefined) num(value, label, 0, MAX_DURATION);
  }

  function vector(value, label, positive) {
    if (typeof value === 'number') {
      num(value, label, positive ? 0.05 : -50, 50);
      return;
    }
    keys(value, ['x', 'y', 'z'], label);
    const fields = Object.keys(value);
    if (!fields.length) fail(label + ' est vide.');
    for (const k of fields) {
      num(value[k], label + '.' + k, positive ? 0.05 : -50, 50);
    }
  }

  function validateProps(type, props) {
    const allowed = COMMON.concat(TYPES[type]);
    keys(props, allowed, 'props');

    for (const k of Object.keys(props)) {
      const v = props[k];

      if (['x', 'y', 'z', 'rx', 'ry', 'rz'].includes(k)) {
        num(v, 'props.' + k, -50, 50);
      } else if ([
        'w', 'h', 'd', 'r', 'r2', 'tube', 's', 't', 'size'
      ].includes(k)) {
        num(v, 'props.' + k, 0.05, 30);
      } else if (['opacity', 'metal', 'rough', 'glow'].includes(k)) {
        num(v, 'props.' + k, 0, 1);
      } else if (k === 'color' || k === 'emissive' || k === 'bg') {
        color(v, 'props.' + k);
      } else if (k === 'name') {
        str(v, 'props.name', 50);
      } else if (k === 'ghost' && typeof v !== 'boolean') {
        fail('props.ghost doit être vrai ou faux.');
      }
    }
  }

  function validateData(type, data) {
    const dataTypes = ['wall', 'rod', 'arrow', 'text', 'lathe', 'extrude', 'tube'];

    if (data === undefined) {
      if (dataTypes.includes(type)) {
        fail('Données manquantes pour ' + type + '.');
      }
      return;
    }

    if (!dataTypes.includes(type)) {
      fail('Données inattendues pour ' + type + '.');
    }

    if (type === 'wall' || type === 'rod' || type === 'arrow') {
      keys(data, ['from', 'to'], type + '.data');
      point(data.from, type + '.from', type === 'wall' ? ['x', 'z'] : ['x', 'y', 'z']);
      point(data.to, type + '.to', type === 'wall' ? ['x', 'z'] : ['x', 'y', 'z']);
      return;
    }

    if (type === 'text') {
      keys(data, ['value'], 'text.data');
      str(data.value, 'text.value', 200);
      return;
    }

    if (['lathe', 'extrude', 'tube'].includes(type)) {
      keys(data, ['points'], type + '.data');
      const pts = data.points;
      if (!Array.isArray(pts) ||
          pts.length < (type === 'extrude' ? 3 : 2) ||
          pts.length > MAX_POINTS) {
        fail('Nombre de points invalide pour ' + type + '.');
      }

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        if (type === 'lathe') {
          keys(p, ['r', 'y'], 'point ' + i);
          num(p.r, 'point.r', 0, 30);
          num(p.y, 'point.y', -50, 50);
        } else if (type === 'extrude') {
          keys(p, ['x', 'y'], 'point ' + i);
          num(p.x, 'point.x', -50, 50);
          num(p.y, 'point.y', -50, 50);
        } else {
          point(p, 'point ' + i);
        }
      }
    }
  }

  function validateDrop(options) {
    keys(options, [
      'y', 'x', 'z', 'g', 'bounce', 'bounces', 'speed'
    ], 'drop.options');

    if (options.y === undefined) fail('Hauteur finale manquante.');

    for (const k of ['x', 'y', 'z']) {
      if (options[k] !== undefined) num(options[k], 'drop.' + k, -50, 50);
    }
    if (options.g !== undefined) num(options.g, 'drop.g', 0.1, 30);
    if (options.bounce !== undefined) num(options.bounce, 'drop.bounce', 0, 1);
    if (options.speed !== undefined) num(options.speed, 'drop.speed', 0.1, 10);

    if (options.bounces !== undefined &&
        (!Number.isInteger(options.bounces) ||
         options.bounces < 0 || options.bounces > 10)) {
      fail('Nombre de rebonds invalide.');
    }
  }

  function validateAction(action, ids, depth, counter) {
    if (depth > MAX_DEPTH) fail('Imbrication de commandes trop profonde.');
    if (!isObject(action) || typeof action.type !== 'string') {
      fail('Commande invalide.');
    }

    const allowed = ACTION_KEYS[action.type];
    if (!allowed) fail('Commande inconnue : ' + action.type);
    keys(action, allowed, 'action');

    counter.count++;
    if (counter.count > MAX_COMMANDS) fail('Trop de commandes.');

    const targetTypes = [
      'move', 'rotate', 'scale', 'fade', 'recolor', 'drop', 'keepLevel'
    ];

    if (targetTypes.includes(action.type)) {
      if (typeof action.target !== 'string' || !ids.has(action.target)) {
        fail('Objet cible inconnu : ' + action.target);
      }
    }

    switch (action.type) {
      case 'move':
      case 'rotate':
        point(action.to, action.type + '.to');
        duration(action.duration, action.type + '.duration');
        break;

      case 'scale':
        vector(action.to, 'scale.to', true);
        duration(action.duration, 'scale.duration');
        break;

      case 'fade':
        num(action.opacity, 'fade.opacity', 0, 1);
        duration(action.duration, 'fade.duration');
        break;

      case 'recolor':
        color(action.color, 'recolor.color');
        duration(action.duration, 'recolor.duration');
        break;

      case 'drop':
        validateDrop(action.options);
        break;

      case 'wait':
        duration(action.duration, 'wait.duration');
        break;

      case 'say':
        str(action.text, 'say.text', 500);
        break;

      case 'focus':
        if (action.at !== undefined) point(action.at, 'focus.at', ['x', 'y', 'z'], true);
        if (action.zoom !== undefined) num(action.zoom, 'focus.zoom', 0.2, 3);
        duration(action.duration, 'focus.duration');
        if (action.camera !== undefined) {
          keys(action.camera, ['az', 'el'], 'focus.camera');
          for (const k of Object.keys(action.camera)) {
            num(action.camera[k], 'focus.camera.' + k, -3.2, 3.2);
          }
        }
        break;

      case 'world':
        if (action.ground !== undefined && typeof action.ground !== 'boolean') {
          fail('world.ground doit être vrai ou faux.');
        }
        if (action.bg !== undefined) color(action.bg, 'world.bg');
        break;

      case 'parallel':
        if (!Array.isArray(action.actions) || action.actions.length === 0) {
          fail('parallel.actions doit être une liste non vide.');
        }
        for (const child of action.actions) {
          validateAction(child, ids, depth + 1, counter);
        }
        break;
    }
  }

  function actionTime(action, byId) {
    if (action.type === 'parallel') {
      return Math.max(0, ...action.actions.map(a => actionTime(a, byId)));
    }

    if (action.type === 'drop') {
      const obj = byId[action.target];
      const options = action.options;
      const startY = obj.props && obj.props.y !== undefined ? obj.props.y : 0;
      const height = Math.max(0, startY - options.y);
      const gravity = options.g || 9.8;
      const bounce = options.bounce === undefined ? 0.45 : options.bounce;
      const bounces = options.bounces === undefined ? 3 : options.bounces;
      const speed = options.speed || 1;

      let total = Math.sqrt(2 * height / gravity);
      let velocity = Math.sqrt(2 * gravity * height) * bounce;

      for (let i = 0; i < bounces && velocity > 0.3; i++) {
        total += 2 * velocity / gravity;
        velocity *= bounce;
      }

      return total / speed;
    }

    return action.duration || 0;
  }

  function validate(spec) {
    keys(spec, ['version', 'objects', 'steps'], 'scene');

    if (spec.version !== 2) fail('La version doit être 2.');
    if (!Array.isArray(spec.objects) || spec.objects.length > MAX_OBJECTS) {
      fail('Maximum ' + MAX_OBJECTS + ' objets.');
    }
    if (!Array.isArray(spec.steps) || spec.steps.length > MAX_STEPS) {
      fail('Nombre d’étapes invalide.');
    }

    const ids = new Set();
    const parents = Object.create(null);

    for (const obj of spec.objects) {
      keys(obj, ['id', 'type', 'props', 'parent', 'data'], 'object');

      if (typeof obj.id !== 'string' || !ID.test(obj.id)) {
        fail('Identifiant d’objet invalide.');
      }
      if (ids.has(obj.id)) fail('Identifiant répété : ' + obj.id);
      if (!Object.prototype.hasOwnProperty.call(TYPES, obj.type)) {
        fail('Type interdit : ' + obj.type);
      }

      ids.add(obj.id);
      parents[obj.id] = obj.parent || null;
      validateProps(obj.type, obj.props === undefined ? {} : obj.props);
      validateData(obj.type, obj.data);
    }

    const byId = Object.create(null);
    for (const obj of spec.objects) byId[obj.id] = obj;

    for (const obj of spec.objects) {
      if (obj.parent !== undefined) {
        if (typeof obj.parent !== 'string' ||
            !byId[obj.parent] ||
            byId[obj.parent].type !== 'group') {
          fail('Le parent de ' + obj.id + ' doit être un groupe existant.');
        }
        if (obj.parent === obj.id) fail('Un groupe ne peut pas être son propre parent.');
      }
    }

    for (const id of ids) {
      const visited = new Set();
      let current = id;
      let groupDepth = 0;

      while (parents[current]) {
        if (visited.has(current)) fail('Cycle détecté dans les groupes.');
        visited.add(current);
        groupDepth++;

        if (groupDepth > MAX_DEPTH) {
          fail('Profondeur maximale des groupes dépassée.');
        }

        current = parents[current];
      }
    }

    const counter = { count: 0 };
    let totalDuration = 0;

    for (const step of spec.steps) {
      keys(step, ['say', 'actions'], 'step');
      if (step.say !== undefined) str(step.say, 'step.say', 500);
      if (step.actions !== undefined && !Array.isArray(step.actions)) {
        fail('step.actions doit être une liste.');
      }

      let stepDuration = 0;
      for (const action of (step.actions || [])) {
        validateAction(action, ids, 0, counter);
        stepDuration += actionTime(action, byId);
      }
      totalDuration += stepDuration;
    }

    if (totalDuration > MAX_TOTAL_DURATION) {
      fail('Durée totale estimée trop longue.');
    }

    return true;
  }

  async function run(S, spec) {
    validate(spec);

    if (!S || typeof S !== 'object') fail('Moteur graphique absent.');
    if (S.aborted) throw new Error('Animation arrêtée.');

    const methods = new Set();

    for (const item of spec.objects) {
      methods.add(item.type);
    }

    const actionMethods = {
      move: 'move', rotate: 'rotate', scale: 'scaleTo',
      fade: 'fade', recolor: 'recolor', drop: 'drop',
      wait: 'wait', say: 'say', focus: 'focus',
      world: 'world', keepLevel: 'keepLevel'
    };

    function collectMethods(action) {
      if (action.type === 'parallel') {
        methods.add('all');
        for (const child of action.actions) collectMethods(child);
      } else {
        methods.add(actionMethods[action.type]);
      }
    }

    for (const step of spec.steps) {
      if (step.say !== undefined) methods.add('say');
      for (const action of (step.actions || [])) collectMethods(action);
    }

    for (const method of methods) {
      if (typeof S[method] !== 'function') {
        fail('Fonction graphique indisponible : S.' + method);
      }
    }

    const objects = Object.create(null);

    function create(item) {
      const p = item.props || {};
      const d = item.data || {};
      let result;

      switch (item.type) {
        case 'wall':
          result = S.wall(d.from, d.to, p);
          break;
        case 'rod':
          result = S.rod(d.from, d.to, p);
          break;
        case 'arrow':
          result = S.arrow(d.from, d.to, p);
          break;
        case 'text':
          result = S.text(d.value, p);
          break;
        case 'lathe':
          result = S.lathe(d.points, p);
          break;
        case 'extrude':
          result = S.extrude(d.points, p);
          break;
        case 'tube':
          result = S.tube(d.points, p);
          break;
        default:
          result = S[item.type](p);
      }

      if (!result) fail('Création impossible : ' + item.id);
      objects[item.id] = result;
    }

    for (const item of spec.objects) {
      if (item.type === 'group') create(item);
    }
    for (const item of spec.objects) {
      if (item.type !== 'group') create(item);
    }

    for (const item of spec.objects) {
      if (item.parent) {
        const parent = objects[item.parent];
        if (!parent || typeof parent.add !== 'function') {
          fail('Le groupe parent ne permet pas d’ajouter des enfants : ' + item.parent);
        }
        parent.add(objects[item.id]);
      }
    }

    async function execute(action) {
      if (S.aborted) throw new Error('Animation arrêtée.');

      if (action.type === 'parallel') {
        return S.all(action.actions.map(execute));
      }

      const o = objects[action.target];

      switch (action.type) {
        case 'move':
          return S.move(o, action.to, action.duration || 0);
        case 'rotate':
          return S.rotate(o, action.to, action.duration || 0);
        case 'scale':
          return S.scaleTo(o, action.to, action.duration || 0);
        case 'fade':
          return S.fade(o, action.opacity, action.duration || 0);
        case 'recolor':
          return S.recolor(o, action.color, action.duration || 0);
        case 'drop':
          return S.drop(o, action.options, action.options.speed);
        case 'wait':
          return S.wait(action.duration || 0);
        case 'say':
          return S.say(action.text);
        case 'focus':
          return S.focus(action.at || {}, action.zoom, action.duration || 0, action.camera || {});
        case 'world':
          return S.world({ ground: action.ground, bg: action.bg });
        case 'keepLevel':
          return S.keepLevel(o);
      }
    }

    for (const step of spec.steps) {
      if (S.aborted) throw new Error('Animation arrêtée.');
      if (step.say) await S.say(step.say);

      for (const action of (step.actions || [])) {
        await execute(action);
      }
    }

    return objects;
  }

  window.IdeeVisionJSONV21 = Object.freeze({
    version: 2.1,
    validate: validate,
    run: run
  });
})();
