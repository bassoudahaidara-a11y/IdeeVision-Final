const fs = require('fs');
const vm = require('vm');
const assert = require('assert/strict');

const context = { window: {} };
vm.createContext(context);

vm.runInContext(
  fs.readFileSync('app/src/main/assets/engine/json-engine-v2-1.js', 'utf8'),
  context
);

const Engine = context.window.IdeeVisionJSONV21;

let passed = 0;
let failed = 0;

function scene(objects = [], steps = []) {
  return vm.runInContext(
    '(' + JSON.stringify({ version: 2, objects, steps }) + ')',
    context
  );
}

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('✓ ' + name);
  } catch (error) {
    failed++;
    console.log('✗ ' + name + ' : ' + error.message);
  }
}

function validSphere() {
  return { id: 'ball', type: 'sphere', props: { r: 0.5 } };
}


test('Refuse une couleur de longueur invalide', () => {
  const obj = validSphere();
  obj.props.color = '#12345';
  assert.throws(() => Engine.validate(scene([obj])));
});

test('Refuse move sans destination', () => {
  assert.throws(() => Engine.validate(scene([validSphere()], [{
    actions: [{ type:'move', target:'ball' }]
  }])));
});

test('Refuse fade sans opacité', () => {
  assert.throws(() => Engine.validate(scene([validSphere()], [{
    actions: [{ type:'fade', target:'ball' }]
  }])));
});

test('Refuse recolor sans couleur', () => {
  assert.throws(() => Engine.validate(scene([validSphere()], [{
    actions: [{ type:'recolor', target:'ball' }]
  }])));
});

test('Refuse parallel avec une liste vide', () => {
  assert.throws(() => Engine.validate(scene([], [{
    actions: [{ type:'parallel', actions:[] }]
  }])));
});


test('Refuse une largeur sur une sphère', () => {
  const obj = validSphere();
  obj.props.w = 2;
  assert.throws(() => Engine.validate(scene([obj])));
});

test('Refuse un rayon sur un plan', () => {
  const obj = { id:'plane1', type:'plane', props:{w:2, h:2, r:1} };
  assert.throws(() => Engine.validate(scene([obj])));
});

test('Accepte une scène vide', () => {
  assert.equal(Engine.validate(scene()), true);
});

test('Accepte une sphère', () => {
  assert.equal(Engine.validate(scene([validSphere()])), true);
});

test('Accepte les formes avancées', () => {
  const objects = [
    { id: 'lathe1', type: 'lathe', data: { points: [{r:0.2,y:0},{r:0.5,y:1}] } },
    { id: 'extrude1', type: 'extrude', props: {d:1}, data: { points: [{x:0,y:0},{x:1,y:0},{x:0,y:1}] } },
    { id: 'tube1', type: 'tube', data: { points: [{x:0,y:0,z:0},{x:1,y:1,z:0}] } }
  ];
  assert.equal(Engine.validate(scene(objects)), true);
});

test('Accepte un mur avec deux points', () => {
  const wall = {
    id: 'wall1', type: 'wall',
    data: { from: {x:0,z:0}, to: {x:3,z:0} },
    props: { h: 2 }
  };
  assert.equal(Engine.validate(scene([wall])), true);
});

test('Accepte un groupe parent-enfant', () => {
  const objects = [
    { id: 'parent', type: 'group' },
    { id: 'child', type: 'sphere', parent: 'parent', props: {r:1} }
  ];
  assert.equal(Engine.validate(scene(objects)), true);
});

test('Refuse un parent inexistant', () => {
  const objects = [{ id:'child', type:'sphere', parent:'absent', props:{r:1} }];
  assert.throws(() => Engine.validate(scene(objects)));
});

test('Accepte quatre niveaux de groupes', () => {
  const objects = [
    {id:'g1', type:'group'},
    {id:'g2', type:'group', parent:'g1'},
    {id:'g3', type:'group', parent:'g2'},
    {id:'g4', type:'group', parent:'g3'},
    {id:'ball', type:'sphere', parent:'g4', props:{r:1}}
  ];
  assert.equal(Engine.validate(scene(objects)), true);
});

test('Refuse cinq niveaux de groupes', () => {
  const objects = [
    {id:'g1', type:'group'},
    {id:'g2', type:'group', parent:'g1'},
    {id:'g3', type:'group', parent:'g2'},
    {id:'g4', type:'group', parent:'g3'},
    {id:'g5', type:'group', parent:'g4'},
    {id:'ball', type:'sphere', parent:'g5', props:{r:1}}
  ];
  assert.throws(() => Engine.validate(scene(objects)));
});

test('Refuse un cycle de groupes', () => {
  const objects = [
    { id:'a', type:'group', parent:'b' },
    { id:'b', type:'group', parent:'a' }
  ];
  assert.throws(() => Engine.validate(scene(objects)));
});

test('Accepte les animations parallèles', () => {
  const steps = [{
    actions: [{
      type: 'parallel',
      actions: [
        { type:'move', target:'ball', to:{x:2}, duration:2 },
        { type:'rotate', target:'ball', to:{y:1}, duration:3 }
      ]
    }]
  }];
  assert.equal(Engine.validate(scene([validSphere()], steps)), true);
});

test('Refuse une commande inconnue', () => {
  assert.throws(() => Engine.validate(scene([validSphere()], [{
    actions: [{ type:'hack' }]
  }])));
});

test('Refuse une cible inconnue', () => {
  assert.throws(() => Engine.validate(scene([], [{
    actions: [{ type:'move', target:'absent', to:{x:1} }]
  }])));
});

test('Refuse une couleur incorrecte', () => {
  const obj = validSphere();
  obj.props.color = 'red; alert(1)';
  assert.throws(() => Engine.validate(scene([obj])));
});

test('Refuse une dimension négative', () => {
  const obj = validSphere();
  obj.props.r = -1;
  assert.throws(() => Engine.validate(scene([obj])));
});

test('Refuse une propriété inconnue', () => {
  const obj = validSphere();
  obj.props.script = 'alert(1)';
  assert.throws(() => Engine.validate(scene([obj])));
});

test('Refuse une imbrication excessive', () => {
  let action = { type:'wait', duration:1 };
  for (let i = 0; i < 6; i++) {
    action = { type:'parallel', actions:[action] };
  }
  assert.throws(() => Engine.validate(scene([], [{actions:[action]}])));
});

test('Refuse plus de 100 objets', () => {
  const objects = Array.from({length:101}, (_,i) => ({
    id:'ball'+i, type:'sphere', props:{r:1}
  }));
  assert.throws(() => Engine.validate(scene(objects)));
});

test('Refuse une durée excessive', () => {
  const steps = [{
    actions: [{type:'wait',duration:30},{type:'wait',duration:30}]
  }];
  const many = Array.from({length:11}, () => steps[0]);
  assert.throws(() => Engine.validate(scene([], many)));
});


test('Refuse une durée individuelle supérieure à 30 secondes', () => {
  const steps = [{actions:[{type:'wait', duration:31}]}];
  assert.throws(() => Engine.validate(scene([], steps)));
});

test('Accepte exactement 600 secondes au total', () => {
  const steps = Array.from({length:20}, () => ({
    actions:[{type:'wait', duration:30}]
  }));
  assert.equal(Engine.validate(scene([], steps)), true);
});

test('Refuse une durée totale supérieure à 600 secondes', () => {
  const steps = Array.from({length:21}, () => ({
    actions:[{type:'wait', duration:30}]
  }));
  assert.throws(() => Engine.validate(scene([], steps)));
});

test('Calcule correctement la durée des animations parallèles', () => {
  const steps = [{
    actions:[{
      type:'parallel',
      actions:[
        {type:'wait', duration:30},
        {type:'wait', duration:30}
      ]
    }]
  }];
  assert.equal(Engine.validate(scene([], steps)), true);
});

test('Refuse props null', () => {
  const obj = validSphere();
  obj.props = null;
  assert.throws(() => Engine.validate(scene([obj])));
});

test('Refuse props sous forme de tableau', () => {
  const obj = validSphere();
  obj.props = [];
  assert.throws(() => Engine.validate(scene([obj])));
});

test('Refuse data inutile sur une sphère', () => {
  const obj = validSphere();
  obj.data = { points: [] };
  assert.throws(() => Engine.validate(scene([obj])));
});

test('Refuse un parent null', () => {
  const obj = validSphere();
  obj.parent = null;
  assert.throws(() => Engine.validate(scene([obj])));
});

test('Refuse un objet de scène null', () => {
  assert.throws(() => Engine.validate(scene([null])));
});

test('Refuse une scène null', () => {
  assert.throws(() => Engine.validate(null));
});

test('Refuse une liste de points trop longue', () => {
  const points = Array.from({length:101}, (_,i) => ({x:i,y:0,z:0}));
  const obj = {id:'tube1', type:'tube', data:{points}};
  assert.throws(() => Engine.validate(scene([obj])));
});

test('Refuse un point géométrique incomplet', () => {
  const obj = {
    id:'lathe1',
    type:'lathe',
    data:{points:[{r:0.2,y:0},{r:0.5}]}
  };
  assert.throws(() => Engine.validate(scene([obj])));
});


test('Accepte une chute avec durée calculée', () => {
  const obj = {id:'ball', type:'sphere', props:{y:10}};
  const steps = [{actions:[{
    type:'drop', target:'ball', options:{y:0}
  }]}];
  assert.equal(Engine.validate(scene([obj], steps)), true);
});

test('Refuse une chute avec gravité nulle', () => {
  const obj = {id:'ball', type:'sphere', props:{y:10}};
  const steps = [{actions:[{
    type:'drop', target:'ball', options:{y:0, g:0}
  }]}];
  assert.throws(() => Engine.validate(scene([obj], steps)));
});

test('Accepte une chute sans rebond', () => {
  const obj = {id:'ball', type:'sphere', props:{y:5}};
  const steps = [{actions:[{
    type:'drop', target:'ball',
    options:{y:0, bounces:0}
  }]}];
  assert.equal(Engine.validate(scene([obj], steps)), true);
});

console.log('\nRésultat : ' + passed + ' réussis, ' + failed + ' échoués.');

async function asyncTest(name, fn) {
  try {
    await fn();
    passed++;
    console.log('✓ ' + name);
  } catch (error) {
    failed++;
    console.log('✗ ' + name + ' : ' + error.message);
  }
}

async function runExtraTests() {
  await asyncTest('Run refuse une fonction graphique manquante avant création', async () => {
    let created = false;
    const S = {
      sphere() {
        created = true;
        return {};
      }
    };
    await assert.rejects(
      Engine.run(S, scene([validSphere()], [{actions:[{
        type:'move', target:'ball', to:{x:1,y:0,z:0}
      }]}])),
      /Fonction graphique indisponible : S\.move/
    );
    assert.equal(created, false);
  });

  await asyncTest('Run refuse un groupe sans méthode add', async () => {
    const S = {
      group() { return {}; },
      sphere() { return {}; }
    };
    const objects = [
      {id:'parent', type:'group'},
      {id:'child', type:'sphere', parent:'parent'}
    ];
    await assert.rejects(
      Engine.run(S, scene(objects)),
      /groupe parent ne permet pas/
    );
  });

  await asyncTest('Run crée les objets et exécute une animation', async () => {
    const calls = [];
    const group = {
      children: [],
      add(child) { this.children.push(child); }
    };
    const S = {
      group() { return group; },
      sphere(props) { return {props}; },
      move(object, to, duration) {
        calls.push({object, to, duration});
        return Promise.resolve();
      }
    };
    const objects = [
      {id:'parent', type:'group'},
      {id:'ball', type:'sphere', parent:'parent'}
    ];
    const steps = [{actions:[{
      type:'move', target:'ball', to:{x:2,y:0,z:0}, duration:1
    }]}];

    const result = await Engine.run(S, scene(objects, steps));
    assert.equal(result.ball !== undefined, true);
    assert.equal(result.parent, group);
    assert.equal(group.children.length, 1);
    assert.equal(group.children[0], result.ball);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].object, result.ball);
  });

  await asyncTest('Run signale une erreur pendant la création', async () => {
    const S = {
      sphere() { throw new Error('Erreur de création simulée'); }
    };
    await assert.rejects(
      Engine.run(S, scene([validSphere()])),
      /Erreur de création simulée/
    );
  });

  await asyncTest('Run propage une erreur pendant une animation', async () => {
    const S = {
      sphere() { return {}; },
      move() { return Promise.reject(new Error('Erreur animation simulée')); }
    };
    const steps = [{actions:[{
      type:'move', target:'ball', to:{x:1,y:0,z:0}
    }]}];
    await assert.rejects(
      Engine.run(S, scene([validSphere()], steps)),
      /Erreur animation simulée/
    );
  });

  await asyncTest('Run respecte S.aborted avant toute création', async () => {
    let created = false;
    const S = {
      aborted: true,
      sphere() { created = true; return {}; },
      wait() { return Promise.resolve(); }
    };
    const steps = [{actions:[{type:'wait', duration:0}]}];
    await assert.rejects(
      Engine.run(S, scene([validSphere()], steps)),
      /Animation arrêtée/
    );
    assert.equal(created, false);
  });

  await asyncTest('Run respecte S.aborted entre deux commandes parallèles', async () => {
    const started = [];
    const S = {
      aborted: false,
      sphere() { return {}; },
      move(object, to) {
        started.push(to.x);
        S.aborted = true;
        return Promise.resolve();
      },
      all(promises) { return Promise.all(promises); }
    };

    const steps = [{
      actions: [{
        type: 'parallel',
        actions: [
          {type:'move', target:'ball', to:{x:1,y:0,z:0}},
          {type:'move', target:'ball', to:{x:2,y:0,z:0}}
        ]
      }]
    }];

    await assert.rejects(
      Engine.run(S, scene([validSphere()], steps)),
      /Animation arrêtée/
    );

    assert.deepEqual(started, [1]);
  });

  await asyncTest('Run exécute les animations parallèles', async () => {
    const started = [];
    const S = {
      sphere() { return {}; },
      move(object, to) {
        started.push(to.x);
        return Promise.resolve();
      },
      all(promises) { return Promise.all(promises); }
    };
    const steps = [{actions:[{
      type:'parallel',
      actions:[
        {type:'move', target:'ball', to:{x:1,y:0,z:0}},
        {type:'move', target:'ball', to:{x:2,y:0,z:0}}
      ]
    }]}];

    await Engine.run(S, scene([validSphere()], steps));
    assert.deepEqual(started, [1, 2]);
  });


  await asyncTest('Run refuse les identifiants dupliqués avant création', async () => {
    let created = false;
    const S = {
      sphere() { created = true; return {}; }
    };
    const objects = [
      validSphere(),
      {id:'ball', type:'sphere', props:{r:1}}
    ];

    await assert.rejects(
      Engine.run(S, scene(objects)),
      /Identifiant répété/
    );
    assert.equal(created, false);
  });

  await asyncTest('Run refuse plus de 200 commandes avant création', async () => {
    let created = false;
    const S = {
      sphere() { created = true; return {}; },
      wait() { return Promise.resolve(); }
    };
    const actions = Array.from(
      {length:201},
      () => ({type:'wait', duration:0})
    );

    await assert.rejects(
      Engine.run(S, scene([validSphere()], [{actions}])),
      /Trop de commandes/
    );
    assert.equal(created, false);
  });

  await asyncTest('Run propage une erreur dans une animation parallèle', async () => {
    let started = 0;
    const S = {
      sphere() { return {}; },
      move(object, to) {
        started++;
        if (to.x === 2) {
          return Promise.reject(new Error('Erreur parallèle simulée'));
        }
        return Promise.resolve();
      },
      all(promises) { return Promise.all(promises); }
    };
    const steps = [{actions:[{
      type:'parallel',
      actions:[
        {type:'move', target:'ball', to:{x:1,y:0,z:0}},
        {type:'move', target:'ball', to:{x:2,y:0,z:0}}
      ]
    }]}];

    await assert.rejects(
      Engine.run(S, scene([validSphere()], steps)),
      /Erreur parallèle simulée/
    );
    assert.equal(started, 2);
  });

  await asyncTest('Run ne passe pas à l’étape suivante après une erreur parallèle', async () => {
    let nextStepStarted = false;

    const S = {
      sphere() { return {}; },
      move(object, to) {
        if (to.x === 2) {
          return Promise.reject(new Error('Erreur parallèle simulée'));
        }
        return Promise.resolve();
      },
      wait() {
        nextStepStarted = true;
        return Promise.resolve();
      },
      all(promises) { return Promise.all(promises); }
    };

    const steps = [
      {
        actions: [{
          type: 'parallel',
          actions: [
            {type:'move', target:'ball', to:{x:1,y:0,z:0}},
            {type:'move', target:'ball', to:{x:2,y:0,z:0}}
          ]
        }]
      },
      {
        actions: [{type:'wait', duration:0}]
      }
    ];

    await assert.rejects(
      Engine.run(S, scene([validSphere()], steps)),
      /Erreur parallèle simulée/
    );

    assert.equal(nextStepStarted, false);
  });
}

runExtraTests().then(() => {
  console.log('\\nRésultat final : ' + passed + ' réussis, ' + failed + ' échoués.');
  if (failed > 0) process.exitCode = 1;
}).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
