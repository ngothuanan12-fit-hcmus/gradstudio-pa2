// The landing page's 3D story, driven by scroll: a classroom forms from lines, three photos are pinned on the board,
// and the camera moves to each. All shapes and textures are drawn in code; only the three photos load as files.
// Loaded with a dynamic import, at 768 px or wider. Returns a function that stops the scene and frees its memory.
import * as THREE from 'three';

export function startStory({ canvas, story, caps, bar, veil, packages }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  let dirty = true, stopped = false;

  const INK = new THREE.Color('#0c100f');
  const scene = new THREE.Scene();
  scene.background = INK.clone();
  const camera = new THREE.PerspectiveCamera(50, 1, .1, 60);

  scene.add(new THREE.HemisphereLight('#fff0d2', '#6e5230', 1.05));
  const sun = new THREE.DirectionalLight('#ffd9a0', 3.1);
  sun.position.set(11, 7, 2.5);
  sun.target.position.set(-1, 0, 0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 8, bottom: -8, near: 1, far: 30 });
  sun.shadow.bias = -.0006;
  sun.shadow.normalBias = .025;
  sun.shadow.radius = 4;
  scene.add(sun, sun.target);

  // Every part of the room is a group that starts as lines and fades into solid shapes.
  const parts = [];
  const box = new THREE.BoxGeometry(1, 1, 1);
  const boxEdges = new THREE.EdgesGeometry(box);

  function part(order) {
    const g = new THREE.Group();
    const entry = { g, order, solids: [], lines: new THREE.LineBasicMaterial({ color: '#e6e0d0', transparent: true }) };
    parts.push(entry);
    scene.add(g);
    return entry;
  }
  function solid(entry, mat, cast) {
    const m = mat.clone();
    m.transparent = true;
    entry.solids.push(m);
    return (w, h, d, x, y, z, ry = 0) => {
      const mesh = new THREE.Mesh(box, m);
      mesh.scale.set(w, h, d);
      mesh.position.set(x, y, z);
      mesh.rotation.y = ry;
      mesh.castShadow = !!cast;
      mesh.receiveShadow = true;
      const line = new THREE.LineSegments(boxEdges, entry.lines);
      line.scale.copy(mesh.scale); line.position.copy(mesh.position); line.rotation.copy(mesh.rotation);
      entry.g.add(mesh, line);
      return mesh;
    };
  }
  const std = (color, roughness = .85, map = null) => new THREE.MeshStandardMaterial({ color, roughness, map });

  // Worn surfaces, drawn in code so the page needs no image files. Seeded, so every load looks the same.
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  function canvasTex(w, h, paint) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    paint(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  }
  function plaster(base, stain) {
    return canvasTex(1024, 512, (x, w, h) => {
      x.fillStyle = base; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 1400; i++) {
        x.fillStyle = `rgba(${rnd() > .5 ? '255,245,220' : '70,48,20'},${rnd() * .035})`;
        x.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 26, 1 + rnd() * 10);
      }
      for (let i = 0; i < 26; i++) {
        const sx = rnd() * w, len = 40 + rnd() * 170;
        const g = x.createLinearGradient(0, 0, 0, len);
        g.addColorStop(0, `rgba(70,48,22,${stain * (.4 + rnd() * .6)})`); g.addColorStop(1, 'rgba(70,48,22,0)');
        x.fillStyle = g; x.fillRect(sx, 0, 3 + rnd() * 16, len);
      }
      const shade = x.createLinearGradient(0, 0, 0, h);
      shade.addColorStop(0, 'rgba(50,34,14,.22)'); shade.addColorStop(.12, 'rgba(50,34,14,0)');
      shade.addColorStop(.86, 'rgba(50,34,14,0)'); shade.addColorStop(1, 'rgba(50,34,14,.32)');
      x.fillStyle = shade; x.fillRect(0, 0, w, h);
    });
  }
  function woodTex() {
    return canvasTex(1024, 256, (x, w, h) => {
      x.fillStyle = '#b5612a'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 240; i++) {
        const y = rnd() * h;
        x.strokeStyle = `rgba(${rnd() > .5 ? '76,34,10' : '226,150,84'},${.05 + rnd() * .13})`;
        x.lineWidth = .5 + rnd() * 2;
        x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(w * .3, y + rnd() * 9 - 4, w * .7, y + rnd() * 9 - 4, w, y + rnd() * 6 - 3); x.stroke();
      }
      for (let i = 0; i < 26; i++) {
        x.fillStyle = `rgba(232,214,184,${rnd() * .22})`;
        x.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 40, 1 + rnd() * 2);
      }
    });
  }
  function outsideTex() {
    return canvasTex(256, 256, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#fffbe9'); g.addColorStop(.62, '#fff0c8'); g.addColorStop(1, '#d9e3a6');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.filter = 'blur(9px)';
      for (let i = 0; i < 22; i++) {
        x.fillStyle = `rgba(${90 + rnd() * 50},${140 + rnd() * 50},${70 + rnd() * 30},.55)`;
        x.beginPath(); x.arc(rnd() * w, h * .62 + rnd() * h * .45, 18 + rnd() * 34, 0, 7); x.fill();
      }
      x.filter = 'none';
    });
  }
  function shaftTex() {
    return canvasTex(256, 64, (x, w, h) => {
      const a = x.createLinearGradient(0, 0, w, 0);
      a.addColorStop(0, 'rgba(255,222,160,.0)'); a.addColorStop(.08, 'rgba(255,222,160,.9)'); a.addColorStop(1, 'rgba(255,222,160,0)');
      x.fillStyle = a; x.fillRect(0, 0, w, h);
      x.globalCompositeOperation = 'destination-in';
      const b = x.createLinearGradient(0, 0, 0, h);
      b.addColorStop(0, 'rgba(0,0,0,0)'); b.addColorStop(.25, 'rgba(0,0,0,1)'); b.addColorStop(.75, 'rgba(0,0,0,1)'); b.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = b; x.fillRect(0, 0, w, h);
    });
  }

  // Canvas textures, drawn in code so the page needs no image files.
  function tiles() {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d');
    x.fillStyle = '#e9d9b4'; x.fillRect(0, 0, 128, 128);
    x.fillStyle = '#b98a3f';
    x.beginPath(); x.moveTo(64, 6); x.lineTo(122, 64); x.lineTo(64, 122); x.lineTo(6, 64); x.closePath(); x.fill();
    x.fillStyle = '#f2e7cc';
    x.beginPath(); x.moveTo(64, 36); x.lineTo(92, 64); x.lineTo(64, 92); x.lineTo(36, 64); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(70,48,22,.28)'; x.lineWidth = 1.5; x.strokeRect(0, 0, 128, 128);
    for (let i = 0; i < 90; i++) { x.fillStyle = `rgba(60,40,18,${rnd() * .07})`; x.fillRect(rnd() * 128, rnd() * 128, 1 + rnd() * 16, 1 + rnd() * 4); }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(18, 22); t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  }
  const BW = 5.3, BH = 1.55, BY = 1.85;
  const PIN_PLACES = [
    { x: -1.58, y: 1.9, w: 1.26, h: .84, tilt: -.022, labelY: 1.26, at: .33 },
    { x: .12, y: 1.88, w: .62, h: .93, tilt: .016, labelY: 1.26, at: .355 },
    { x: 1.66, y: 1.9, w: .68, h: .85, tilt: -.014, labelY: 1.26, at: .38 },
  ];
  const PINS = packages.map((item, i) => ({ ...PIN_PLACES[i], label: item.name, url: `./photos/${item.photo.name}-${item.photo.large}.webp` }));
  const CHALK = 'Các gói chụp' + PINS.map((q) => q.label).join('');
  function boardTexture() {
    const c = document.createElement('canvas'); c.width = 2560; c.height = 748;
    const x = c.getContext('2d');
    x.fillStyle = '#1f3d33'; x.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < 160; i++) { x.fillStyle = `rgba(235,235,225,${Math.random() * .045})`; x.save(); x.translate(Math.random() * c.width, Math.random() * c.height); x.rotate(Math.random() * .5 - .25); x.fillRect(-240, -9, 180 + Math.random() * 480, 8 + Math.random() * 40); x.restore(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  }

  const W = 4.5, H = 3.4, D = 5.5;

  // Shell
  {
    const p = part(.72);
    const wall = solid(p, std('#ffffff', .92, plaster('#e8c883', .2)));
    wall(.2, H, D * 2, W + .1, H / 2, 0);
    wall(.2, H, D * 2, -W - .1, H / 2, 0);
    wall(W * 2 + .4, H, .2, 0, H / 2, -D - .1);
    const ceilMat = std('#ffffff', .95, plaster('#e8e0cb', .13));
    ceilMat.emissive = new THREE.Color('#857a60');
    const ceil = solid(p, ceilMat);
    ceil(W * 2 + .4, .15, D * 2, 0, H + .07, 0);
    ceil(.5, .24, D * 2, -1.5, H - .12, 0);
    ceil(.5, .24, D * 2, 1.5, H - .12, 0);
  }
  {
    const p = part(.82);
    const dado = solid(p, std('#ffffff', .75, plaster('#b98c4b', .3)));
    dado(.03, .9, D * 2, W - .01, .45, 0);
    dado(.03, .9, D * 2, -W + .01, .45, 0);
    dado(W * 2, .9, .03, 0, .45, -D + .01);
  }
  // Floor
  {
    const p = part(.6);
    const m = new THREE.MeshStandardMaterial({ map: tiles(), roughness: .62 });
    const mesh = solid(p, m)(W * 2, .04, D * 2, 0, -.02, 0);
    mesh.castShadow = false;
    const pts = [];
    for (let x = -W; x <= W + .01; x += 1) pts.push(x, .01, -D, x, .01, D);
    for (let z = -D; z <= D + .01; z += 1) pts.push(-W, .01, z, W, .01, z);
    for (let x = -14; x <= 14; x += 2) pts.push(x, -.01, D, x, -.01, D + 8);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    p.g.add(new THREE.LineSegments(g, p.lines));
  }
  // Board
  {
    const p = part(.05);
    const frame = solid(p, std('#6f4a26'), true);
    frame(5.5, 1.75, .06, 0, 1.85, -D + .03);
    frame(5.5, .06, .14, 0, .98, -D + .08);
    const m = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .9 });
    const front = new THREE.MeshStandardMaterial({ map: boardTexture(), roughness: .9, transparent: true });
    p.solids.push(front);
    m.transparent = true; p.solids.push(m);
    const b = new THREE.Mesh(box, [m, m, m, m, front, m]);
    b.scale.set(5.3, 1.55, .04); b.position.set(0, 1.85, -D + .07);
    const l = new THREE.LineSegments(boxEdges, p.lines); l.scale.copy(b.scale); l.position.copy(b.position);
    p.g.add(b, l);
  }
  // Windows and door
  const TEAL = '#17879a';
  let outsideCache;
  const outsideTexture = () => (outsideCache ||= outsideTex());
  function windowAt(side, z, order) {
    const p = part(order);
    const x = side * (W - .02), w = 1.9, h = 1.85, y = 1.95;
    const bar = solid(p, std(TEAL, .55), true);
    const glass = solid(p, new THREE.MeshBasicMaterial({ map: outsideTexture() }));
    glass(.01, h, w, x - side * .006, y, z);
    bar(.08, h + .12, .08, x, y, z - w / 2);
    bar(.08, h + .12, .08, x, y, z + w / 2);
    bar(.08, h + .12, .05, x, y, z - w / 6);
    bar(.08, h + .12, .05, x, y, z + w / 6);
    bar(.08, .08, w, x, y - h / 2, z);
    bar(.08, .08, w, x, y + h / 2, z);
    bar(.08, .05, w, x, y + .32, z);
    bar(.08, .05, w, x, y - .28, z);
  }
  windowAt(1, -3.3, .12); windowAt(1, -.3, .3); windowAt(1, 2.7, .48);
  windowAt(-1, -.3, .3); windowAt(-1, 2.7, .48);
  {
    const p = part(.14);
    const x = -W + .02, z = -3.5, w = 1.25, h = 2.45;
    const open = solid(p, new THREE.MeshBasicMaterial({ map: outsideTexture() }));
    open(.01, h, w, x + .006, h / 2, z);
    const leaf = solid(p, std(TEAL, .55), true);
    leaf(.07, h + .08, .1, x, h / 2, z - w / 2);
    leaf(.07, h + .08, .1, x, h / 2, z + w / 2);
    leaf(.07, .1, w, x, h, z);
    leaf(.06, h - .1, .52, x + .46, h / 2, z - w / 2 + .05, -1.15);
  }
  // Desks: two columns of long wooden desks with benches, as in Vietnamese classrooms.
  const sharedWood = woodTex();
  function desk(x, z, order) {
    const p = part(order);
    const wood = solid(p, std('#ffffff', .46, sharedWood), true);
    const dark = solid(p, std('#7c3f1d', .7), true);
    const w = 3.1, top = .8;
    wood(w, .055, .5, x, top, z);
    dark(w - .06, .2, .03, x, top - .13, z - .22);
    dark(w - .06, .03, .42, x, top - .24, z);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => dark(.06, top, .06, x + a * (w / 2 - .06), top / 2, z + b * .2));
    wood(w, .05, .27, x, .47, z + .55);
    [-1, 1].forEach((a) => dark(.06, .47, .22, x + a * (w / 2 - .1), .235, z + .55));
  }
  [-3.1, -1.5, .1, 1.7, 3.3].forEach((z, i) => {
    const o = .14 + i * .12;
    desk(-2.25, z, o); desk(2.25, z, o);
  });
  // Details that make it read as a real Vietnamese classroom
  {
    const p = part(.1);
    const c = document.createElement('canvas'); c.width = 1024; c.height = 96;
    const x = c.getContext('2d');
    x.fillStyle = '#1b2f5c'; x.fillRect(0, 0, 1024, 96);
    x.strokeStyle = '#d8c98f'; x.lineWidth = 3; x.strokeRect(7, 7, 1010, 82);
    x.fillStyle = '#f4efdf'; x.textAlign = 'center'; x.font = '600 44px "Be Vietnam Pro", Arial, sans-serif';
    x.fillText('TIÊN HỌC LỄ, HẬU HỌC VĂN', 512, 64);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const front = new THREE.MeshStandardMaterial({ map: t, roughness: .8, transparent: true });
    const edge = new THREE.MeshStandardMaterial({ color: '#1b2f5c', transparent: true });
    p.solids.push(front, edge);
    const b = new THREE.Mesh(box, [edge, edge, edge, edge, front, edge]);
    b.scale.set(5.3, .5, .03); b.position.set(0, 3.0, -D + .03);
    p.g.add(b);
    document.fonts.load('600 44px "Be Vietnam Pro"', 'TIÊN HỌC LỄ, HẬU HỌC VĂN').then(() => {
      x.fillStyle = '#1b2f5c'; x.fillRect(10, 10, 1004, 76);
      x.fillStyle = '#f4efdf'; x.fillText('TIÊN HỌC LỄ, HẬU HỌC VĂN', 512, 64);
      t.needsUpdate = true; dirty = true;
    });
    // Lectern, chalk tray items and strip lights
    const lect = solid(p, std('#ffffff', .5, sharedWood), true);
    lect(1.5, .05, .7, 2.9, .95, -4.6);
    const legs = solid(p, std('#7c3f1d', .7), true);
    legs(1.42, .9, .62, 2.9, .47, -4.6);
    const chalk = solid(p, std('#f4f1e8', .9));
    chalk(.16, .025, .025, -1.2, 1.03, -D + .1); chalk(.12, .025, .025, -.8, 1.03, -D + .1);
    const lamp = new THREE.MeshBasicMaterial({ color: '#fff7e2', transparent: true });
    p.solids.push(lamp);
    [[-3.2, -2.5], [3.2, -2.5], [-3.2, 1.2], [3.2, 1.2]].forEach(([lx, lz]) => {
      const m = new THREE.Mesh(box, lamp); m.scale.set(.09, .05, 1.2); m.position.set(lx, H - .05, lz); p.g.add(m);
      const l = new THREE.LineSegments(boxEdges, p.lines); l.scale.copy(m.scale); l.position.copy(m.position); p.g.add(l);
    });
  }
  // Sunlight falling through the right-hand windows
  const shafts = [];
  {
    const map = shaftTex();
    [-3.3, -.3, 2.7].forEach((z) => {
      const m = new THREE.MeshBasicMaterial({ map, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
      const s = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 1.9), m);
      s.position.set(2.05, .62, z); s.rotation.z = .52;
      scene.add(s); shafts.push(m);
    });
  }
  // Ceiling fans
  const fans = [];
  [-1.5, 1.5].forEach((x) => {
    const p = part(.5);
    const m = solid(p, std('#efe9da', .5));
    m(.03, .34, .03, x, H - .4, -1.2);
    const hub = new THREE.Group(); hub.position.set(x, H - .58, -1.2);
    const mat = p.solids[0];
    for (let i = 0; i < 3; i++) {
      const a = new THREE.Group(); a.rotation.y = i * Math.PI * 2 / 3;
      const b = new THREE.Mesh(box, mat); b.scale.set(.62, .012, .13); b.position.x = .36;
      const l = new THREE.LineSegments(boxEdges, p.lines); l.scale.copy(b.scale); l.position.copy(b.position);
      a.add(b, l); hub.add(a);
    }
    const c = new THREE.Mesh(box, mat); c.scale.set(.15, .07, .15); hub.add(c);
    p.g.add(hub); fans.push(hub);
  });

  // Photos pinned on the board. They are real photographs, so they skip the room's warm lighting.
  const shadowMap = canvasTex(128, 128, (x, w, h) => {
    x.filter = 'blur(9px)'; x.fillStyle = 'rgba(0,0,0,.8)'; x.fillRect(16, 16, w - 32, h - 32); x.filter = 'none';
  });
  // A soft light from the camera's side, so the chalk and photo borders stay bright up close.
  const fill = new THREE.DirectionalLight('#fff4e4', 0);
  fill.position.set(0, 2.2, 5);
  fill.target.position.set(0, 1.8, -5);
  scene.add(fill, fill.target);
  const loader = new THREE.TextureLoader();
  // Chalk writing on its own layer, so it can appear together with its photo.
  const chalkLabels = [];
  function chalkLabel(text, x, y, size) {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 160;
    const paint = () => {
      const k = c.getContext('2d');
      k.clearRect(0, 0, c.width, c.height);
      k.fillStyle = '#f1ece0'; k.textAlign = 'center'; k.textBaseline = 'middle';
      k.font = `italic 400 ${size * 1.25}px Newsreader, Georgia, serif`;
      k.fillText(text, c.width / 2, c.height / 2);
      t.needsUpdate = true;
    };
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    paint();
    chalkLabels.push(paint);
    const mat = new THREE.MeshStandardMaterial({ map: t, roughness: .9, transparent: true, opacity: 0, depthWrite: false });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1024 / 390, 160 / 390), mat);
    mesh.position.set(x, y, -D + .092);
    scene.add(mesh);
    return mat;
  }
  const pins = PINS.map((q) => {
    const g = new THREE.Group();
    // Upload to the graphics card as soon as it loads, so the first zoom has no hitch.
    const tex = loader.load(q.url, (t) => { renderer.initTexture(t); dirty = true; });
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const photo = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, transparent: true });
    const paper = new THREE.MeshBasicMaterial({ color: '#f1ece1', toneMapped: false, transparent: true });
    const metal = new THREE.MeshStandardMaterial({ color: '#c8452e', roughness: .35, transparent: true });
    const shade = new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false });
    const b = .035;
    const under = new THREE.Mesh(new THREE.PlaneGeometry((q.w + b * 2) * 1.14, (q.h + b * 2) * 1.14), shade);
    under.position.set(.012, -.016, -.006);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(q.w + b * 2, q.h + b * 2, .005), paper);
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(q.w, q.h), photo);
    pic.position.z = .004;
    const magnet = new THREE.Mesh(new THREE.SphereGeometry(.026, 16, 10).scale(1, 1, .5), metal);
    magnet.position.set(0, q.h / 2 + b * .3, .012);
    g.add(under, frame, pic, magnet);
    scene.add(g);
    return { ...q, g, mats: [photo, paper, metal], shade, chalk: chalkLabel(q.label, q.x, q.labelY, 54) };
  });
  // The first photo brings the heading with it.
  const heading = chalkLabel('Các gói chụp', 0, 2.5, 64);
  document.fonts.load('italic 400 64px Newsreader', CHALK).then(() => { if (!stopped) { chalkLabels.forEach((f) => f()); dirty = true; } });

  const clamp = (v) => Math.max(0, Math.min(1, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const ease = (t) => t * t * (3 - 2 * t);
  const warm = new THREE.Color('#2a2118');
  const lookTo = new THREE.Vector3();

  let shadowsDone = false;
  // Where the camera rests, in order. focus is the photo it looks at, side is where that photo sits on a wide screen.
  const STOPS = [
    { from: .42, to: .46, x: 0, y: 1.72, w: 6.5, h: 2.9, focus: -1, side: 0 },
    { from: .56, to: .6, x: PINS[0].x, y: 1.9, w: 1.42, h: 1.2, focus: 0, side: -1 },
    { from: .7, to: .74, x: PINS[1].x, y: 1.88, w: .86, h: 1.25, focus: 1, side: 1 },
    { from: .84, to: .88, x: PINS[2].x, y: 1.9, w: .92, h: 1.2, focus: 2, side: 1 },
    { from: .97, to: 1, x: 0, y: 1.72, w: 6.5, h: 2.9, focus: -1, side: 0 },
  ];
  // When each moment's words are on screen: fully in between in1 and out0.
  const WORDS = [
    [-1, -.5, .05, .09], [.1, .14, .26, .3], [.4, .43, .47, .5], [.53, .56, .6, .63],
    [.67, .7, .74, .77], [.81, .84, .88, .91], [.945, .97, 2, 3],
  ];
  const ROOM_END = .3;
  const BOARD_Z = -D + .09;
  const smooth = (t) => t * t * t * (t * (6 * t - 15) + 10);
  // Close-ups leave room for the words: the photo sits to one side on wide screens, higher on narrow ones.
  function framing(stop) {
    const tv = 2 * Math.tan(camera.fov * Math.PI / 360), wide = camera.aspect >= 1, off = stop.focus >= 0;
    const usableW = off && wide ? .54 : 1, usableH = off && !wide ? .52 : 1;
    const d = Math.max(stop.h / (tv * usableH), stop.w / (tv * camera.aspect * usableW));
    return { x: stop.x - (off && wide ? d * tv * camera.aspect * .2 * stop.side : 0), y: stop.y - (off && !wide ? d * tv * .2 : 0), d };
  }
  const shot = { x: 0, y: 0, z: 0, lx: 0, ly: 0, focus: [0, 0, 0] };
  function cameraAt(p) {
    shot.focus.fill(0);
    if (p <= STOPS[0].from) {
      const walk = ease(seg(p, 0, ROOM_END)), to = framing(STOPS[0]), t = smooth(seg(p, ROOM_END, STOPS[0].from));
      const x = Math.sin(walk * Math.PI) * -.28, y = 1.5 + Math.sin(walk * 26) * .012, z = mix(11.5, 3.4, walk);
      shot.x = mix(x, to.x, t); shot.y = mix(y, to.y, t); shot.z = mix(z, BOARD_Z + to.d, t);
      shot.lx = mix(Math.sin(walk * Math.PI) * .3, to.x, t); shot.ly = mix(mix(1.55, 1.42, walk), to.y, t);
      return shot;
    }
    for (let i = 0; i < STOPS.length; i++) {
      const a = STOPS[i], b = STOPS[i + 1], A = framing(a);
      if (p <= a.to || !b) {
        shot.x = shot.lx = A.x; shot.y = shot.ly = A.y; shot.z = BOARD_Z + A.d;
        if (a.focus >= 0) shot.focus[a.focus] = 1;
        return shot;
      }
      if (p < b.from) {
        const t = smooth(seg(p, a.to, b.from)), B = framing(b);
        // Distance changes by ratio, so the zoom looks even instead of rushing at the end.
        const stepBack = a.focus >= 0 && b.focus >= 0 ? Math.sin(t * Math.PI) * .3 * Math.max(A.d, B.d) : 0;
        shot.x = shot.lx = mix(A.x, B.x, t); shot.y = shot.ly = mix(A.y, B.y, t);
        shot.z = BOARD_Z + Math.exp(mix(Math.log(A.d), Math.log(B.d), t)) + stepBack;
        if (a.focus >= 0) shot.focus[a.focus] = 1 - t;
        if (b.focus >= 0) shot.focus[b.focus] = t;
        return shot;
      }
    }
    return shot;
  }
  // Opening: the chalk lines draw themselves in, part by part in the room's build order (walls, then windows, then
  // desks), each one settling down from slightly above. The clock starts once the first frame is on screen.
  let introStart = null;
  const INTRO_STEP = 900, INTRO_EACH = 520;
  const INTRO_MS = INTRO_STEP + INTRO_EACH;
  function drawnIn(order) {
    return introStart === null ? 0 : ease(clamp((performance.now() - introStart - order * INTRO_STEP) / INTRO_EACH));
  }
  function draw(p) {
    const room = seg(p, 0, ROOM_END);
    renderer.shadowMap.needsUpdate = room < 1 || !shadowsDone;
    shadowsDone = room >= 1;
    parts.forEach(({ order, solids, lines, g }) => {
      const q = ease(seg(room, .1 + order * .42, .3 + order * .42));
      solids.forEach((m) => { m.opacity = q; m.depthWrite = q > .35; m.visible = q > .001; m.transparent = q < .999; });
      const r = drawnIn(order);
      lines.opacity = mix(.95, .08, q) * r;
      g.position.y = (1 - r) * .35;
      g.visible = true;
    });
    cameraAt(p);
    fill.intensity = 1.5 * smooth(seg(p, ROOM_END, STOPS[0].from));
    camera.position.set(shot.x, shot.y, shot.z);
    lookTo.set(shot.lx, shot.ly, -D);
    camera.lookAt(lookTo);
    // Each photo arrives with its chalk label. In a close-up the rest of the board steps back so the words stay clear.
    const closeUp = Math.max(...shot.focus), closing = smooth(seg(p, .91, .965));
    pins.forEach((f, i) => {
      const w = shot.focus[i], q = ease(seg(p, f.at, f.at + .04)), o = q * (1 - (closeUp - w) * .98);
      f.mats.forEach((m) => { m.opacity = o; m.transparent = o < .999; m.depthWrite = o > .35; });
      f.shade.opacity = o * o * .7;
      f.chalk.opacity = ease(seg(p, f.at + .012, f.at + .04)) * (1 - closeUp) * (1 - closing);
      f.g.visible = o > .001;
      f.g.position.set(f.x, f.y + (1 - q) * .14, BOARD_Z + (1 - q) * .75 + w * .012);
      f.g.rotation.z = (f.tilt + (1 - q) * (i % 2 ? .22 : -.22)) * (1 - w);
    });
    heading.opacity = ease(seg(p, PINS[0].at + .012, PINS[0].at + .04)) * (1 - closeUp) * (1 - closing);
    fans.forEach((f) => { f.rotation.y = p * 8; });
    scene.background.copy(INK).lerp(warm, ease(seg(room, .4, .8)));
    sun.intensity = 3.1 * ease(seg(room, .2, .7));
    shafts.forEach((m) => { m.opacity = .2 * ease(seg(room, .45, .8)); });
    bar.style.transform = `scaleX(${p})`;
    // Words fade and drift with the scroll instead of switching.
    caps.forEach((c, i) => {
      const [a, b, e, g] = WORDS[i], rise = smooth(seg(p, a, b)), fall = smooth(seg(p, e, g)), o = rise * (1 - fall);
      c.style.opacity = o;
      c.style.visibility = o > .002 ? 'visible' : 'hidden';
      c.style.transform = `translateY(${(1 - rise) * 28 - fall * 28}px)`;
    });
    veil.style.opacity = .62 * smooth(seg(p, .91, .965));
    renderer.render(scene, camera);
  }
  function mix(a, b, t) { return a + (b - a) * t; }

  let cur = 0;
  function target() {
    const r = story.getBoundingClientRect(), span = r.height - window.innerHeight;
    return span > 0 ? clamp(-r.top / span) : 0;
  }
  function size() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = camera.aspect < 1 ? 72 : 50;
    camera.updateProjectionMatrix();
    dirty = true;
  }
  let last = performance.now();
  let frame = 0;
  // The view fades in only once the first frame is drawn; that frame compiles the shaders and can take half a second.
  let drawnOnce = false;
  function loop(now = last) {
    const t = target(), dt = Math.min(.05, (now - last) / 1000);
    last = now;
    if (Math.abs(t - cur) > .00003 || dirty || introStart === null || now - introStart < INTRO_MS + 50) {
      // Follow the scroll position by time, so fast and slow screens feel the same.
      cur += (t - cur) * (1 - Math.exp(-dt * 6));
      if (Math.abs(t - cur) <= .00003) cur = t;
      dirty = false;
      draw(cur);
      if (!drawnOnce) { drawnOnce = true; introStart = performance.now(); canvas.classList.add('is-ready'); }
    }
    frame = requestAnimationFrame(loop);
  }
  window.addEventListener('resize', size);
  size();
  cur = target();
  loop();

  return function stop() {
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', size);
    stopped = true;
    scene.traverse((item) => {
      item.geometry?.dispose();
      [item.material].flat().forEach((m) => { m?.map?.dispose(); m?.dispose(); });
    });
    renderer.dispose();
  };
}
