import * as THREE from './vendor/three.module.min.js';

const coats = {
  yoona: {
    fur: 0xbe8456, cream: 0xedd0ae, stripe: 0x985a35, iris: 0xa4874a, nose: 0xb6776c,
    eye: { width: .091, upper: .055, lower: .041, iris: .044, pupilWidth: .018, pupilHeight: .034 },
    muzzle: .74, forehead: .61, cheekStripe: .58
  },
  kaguya: {
    fur: 0x747375, cream: 0xd9cdbd, stripe: 0x3e3b3e, iris: 0x929651, nose: 0x695054,
    eye: { width: .100, upper: .075, lower: .056, iris: .056, pupilWidth: .039, pupilHeight: .045 },
    muzzle: 1, forehead: .87, cheekStripe: .92
  }
};

export function createCatView() {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(Math.max(devicePixelRatio, 1.5), 2));
  renderer.setSize(132, 99);
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xfff4e8, 0x9294a6, 2.15));
  const key = new THREE.DirectionalLight(0xfff6ea, 1.55);
  key.position.set(-2, 4, 3);
  scene.add(key);
  const camera = new THREE.OrthographicCamera(-1.72, 1.72, 1.18, -1.4, .1, 12);
  camera.position.set(0, 1.35, 5);
  camera.lookAt(0, .75, 0);

  const model = new THREE.Group();
  model.scale.setScalar(.60);
  scene.add(model);
  const body = new THREE.Group();
  model.add(body);
  const sphere = new THREE.SphereGeometry(1, 40, 28);
  const furSurface = document.createElement('canvas');
  furSurface.width = furSurface.height = 192;
  const brush = furSurface.getContext('2d');
  const grain = brush.createImageData(192, 192);
  for (let y = 0; y < 192; y++) {
    for (let x = 0; x < 192; x++) {
      const streak = Math.sin(x * 1.61 + Math.sin(y * .11 + x * .04) * 2.3);
      const value = 128 + streak * 35 + 15 * Math.cos(y * .22 + x * 1.24);
      const pixel = (y * 192 + x) * 4;
      grain.data.set([value, value, value, 255], pixel);
    }
  }
  brush.putImageData(grain, 0, 0);
  const furMap = new THREE.CanvasTexture(furSurface);
  const furFinish = { roughness: .83, bumpMap: furMap, bumpScale: .026 };
  const material = (color, finish = {}) => new THREE.MeshStandardMaterial({ color, roughness: .9, ...finish });
  const fur = material(coats.yoona.fur, furFinish);
  const cream = material(coats.yoona.cream, furFinish);
  const stripe = material(coats.yoona.stripe);
  const pink = material(0xa86260);
  const nosePaint = material(coats.yoona.nose, { roughness: .55 });
  const eyes = material(0x202022);
  const gold = material(coats.yoona.iris, { roughness: .33 });
  const whisker = material(0xbfb5a6);
  const collarPaint = material(0x262225);
  const tagPaint = material(0xc29b55);
  const patterns = [];

  function oval(parent, paint, x, y, z, rx, ry, rz) {
    const part = new THREE.Mesh(sphere, paint);
    part.position.set(x, y, z);
    part.scale.set(rx, ry, rz);
    parent.add(part);
    return part;
  }

  function tube(parent, paint, points, radius) {
    const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
    const part = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, radius, 6, false), paint);
    parent.add(part);
    return part;
  }

  function patternedOval(parent, x, y, rx, ry, rz, pattern, sculpt, lightPatch) {
    const geometry = new THREE.SphereGeometry(1, 96, 56);
    const vertices = geometry.attributes.position;
    const colors = new THREE.BufferAttribute(new Float32Array(vertices.count * 3), 3);
    geometry.setAttribute('color', colors);
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
      vertexColors: true, ...furFinish
    }));
    mesh.position.set(x, y, 0);
    mesh.scale.set(rx, ry, rz);
    parent.add(mesh);
    const samples = vertices.array.slice();
    if (sculpt) {
      for (let i = 0; i < vertices.count; i++) {
        vertices.setXYZ(i, ...sculpt(vertices.getX(i), vertices.getY(i), vertices.getZ(i)));
      }
      geometry.computeVertexNormals();
    }
    patterns.push(coat => {
      const base = new THREE.Color(coat.fur);
      const light = new THREE.Color(coat.cream);
      const dark = new THREE.Color(coat.stripe);
      const sample = new THREE.Color();
      for (let i = 0; i < vertices.count; i++) {
        const vx = samples[i * 3], vy = samples[i * 3 + 1], vz = samples[i * 3 + 2];
        const band = pattern(vx, vy, vz, coat);
        const grain = Math.sin(vx * 122 + vy * 91 + vz * 126) * Math.sin(vx * 76 - vz * 105);
        const undercoat = .58 * THREE.MathUtils.smoothstep(-vy, .12, 1);
        sample.copy(base).lerp(light, Math.max(undercoat, lightPatch?.(vx, vy, vz, coat) ?? 0))
          .lerp(dark, band * .87).multiplyScalar(1 + grain * .045);
        colors.setXYZ(i, sample.r, sample.g, sample.b);
      }
      colors.needsUpdate = true;
    });
    return mesh;
  }

  const back = patternedOval(body, -.085, .70, .86, .282, .268, (x, y, z) => {
    const warp = x * 18.4 + 2.2 * y * y + Math.sin(z * 8 + x * 5) * .78 + .2 * Math.cos(y * 26 + x * 51);
    return THREE.MathUtils.smoothstep(Math.cos(warp), .25, .84) *
      THREE.MathUtils.smoothstep(y, -.44 + .11 * Math.sin(x * 23), .28);
  }, (x, y, z) => {
    const shoulders = Math.exp(-((x - .51) ** 2) * 12);
    const haunch = Math.exp(-((x + .61) ** 2) * 17);
    const waist = Math.exp(-((x + .16) ** 2) * 24);
    return [x, y * (1 + shoulders * .23 + haunch * .14 - waist * .10) + shoulders * .20,
      z * (1 + haunch * .14 - waist * .12)];
  });
  const throat = oval(body, fur, .544, .807, 0, .277, .238, .219);
  throat.rotation.z = .61;
  oval(body, cream, .655, .713, 0, .110, .157, .158);

  const head = new THREE.Group();
  head.position.set(.69, 1.015, 0);
  body.add(head);
  patternedOval(head, 0, 0, .34, .345, .36, (x, y, z, coat) => {
    const brow = Math.abs(z);
    const m = Math.abs(y - (.45 + .30 * Math.sin(brow * 7.6)));
    const foreheadMark = (1 - THREE.MathUtils.smoothstep(m, .029, .10)) *
      (1 - THREE.MathUtils.smoothstep(brow, .54, .79));
    const crown = THREE.MathUtils.smoothstep(y, .57, .82) *
      THREE.MathUtils.smoothstep(Math.cos(z * 26 + Math.sin(y * 8) * .45), .4, .91);
    const cheeks = THREE.MathUtils.smoothstep(brow, .53, .86) *
      THREE.MathUtils.smoothstep(Math.cos((y + x * .40 + brow * .09) * 24), .39, .83);
    const bridge = Math.exp(-((z / .23) ** 2 + ((y - .08) / .37) ** 2)) * .18;
    return Math.max(foreheadMark * THREE.MathUtils.smoothstep(x, .10, .49) * coat.forehead,
      crown * coat.forehead, cheeks * coat.cheekStripe, bridge);
  }, (x, y, z) => {
    const muzzlePad = Math.exp(-(((Math.abs(z) - .24) / .28) ** 2 + ((y + .28) / .28) ** 2));
    const bridge = Math.exp(-((z / .26) ** 2 + ((y + .06) / .52) ** 2));
    return [x + Math.max(0, x) * (.06 + muzzlePad * .17 + bridge * .14), y, z * (1 - .16 * y)];
  }, (x, y, z, coat) => {
    const cheeks = Math.exp(-(((Math.abs(z) - .25) / .34) ** 2 + ((y + .33) / .30) ** 2));
    const chin = Math.exp(-((z / .43) ** 2 + ((y + .69) / .32) ** 2));
    return Math.max(cheeks, chin * .94) * THREE.MathUtils.smoothstep(x, .28, .75) * coat.muzzle;
  });
  const noseShape = new THREE.Shape();
  noseShape.moveTo(-.060, .017);
  noseShape.quadraticCurveTo(-.042, .044, 0, .029);
  noseShape.quadraticCurveTo(.042, .044, .060, .017);
  noseShape.quadraticCurveTo(.052, -.001, .015, -.023);
  noseShape.quadraticCurveTo(0, -.034, -.015, -.023);
  noseShape.quadraticCurveTo(-.052, -.001, -.060, .017);
  const nose = new THREE.Mesh(new THREE.ExtrudeGeometry(noseShape, {
    depth: .009, bevelThickness: .006, bevelSize: .006, bevelSegments: 4, curveSegments: 12
  }), nosePaint);
  nose.rotation.y = Math.PI / 2;
  nose.position.set(.394, -.055, 0);
  head.add(nose);
  tube(head, eyes, [[.392, -.082, 0], [.38, -.123, 0], [.363, -.142, .048]], .008);
  tube(head, eyes, [[.38, -.123, 0], [.363, -.142, -.048]], .008);

  const earShape = new THREE.Shape();
  earShape.moveTo(-.145, 0);
  earShape.quadraticCurveTo(-.11, .22, .014, .34);
  earShape.quadraticCurveTo(.059, .365, .079, .304);
  earShape.quadraticCurveTo(.126, .192, .143, 0);
  earShape.closePath();
  const earGeometry = new THREE.ExtrudeGeometry(earShape, {
    depth: .042, bevelEnabled: true, bevelThickness: .028, bevelSize: .025, bevelSegments: 6, curveSegments: 20
  });
  const eyeSockets = [];
  const ears = [];
  function eyeContour({ width, upper, lower }) {
    const outline = new THREE.Shape();
    outline.moveTo(-width, -.006);
    outline.bezierCurveTo(-width * .60, upper * 1.24, width * .56, upper * 1.20, width, .009);
    outline.bezierCurveTo(width * .61, -lower, -width * .47, -lower * 1.35, -width, -.006);
    const geometry = new THREE.ShapeGeometry(outline, 32);
    geometry.rotateY(Math.PI / 2);
    return geometry;
  }
  const eyeContours = {
    yoona: eyeContour(coats.yoona.eye),
    kaguya: eyeContour(coats.kaguya.eye)
  };
  for (const side of [-1, 1]) {
    const ear = new THREE.Group();
    ear.position.set(-.095, .185, side * .224);
    ear.rotation.set(side * .28, Math.PI / 2 - side * .22, .02);
    head.add(ear);
    ear.add(new THREE.Mesh(earGeometry, fur));
    const innerEar = new THREE.Mesh(earGeometry, pink);
    innerEar.position.set(.015, .042, .050);
    innerEar.scale.set(.69, .74, .45);
    ear.add(innerEar);
    ears.push(ear);

    const eyeSocket = new THREE.Group();
    eyeSocket.position.set(.250, .044, side * .244);
    eyeSocket.rotation.y = -side * .46;
    head.add(eyeSocket);
    const lid = new THREE.Mesh(eyeContours.yoona, eyes);
    lid.position.x = .029;
    eyeSocket.add(lid);
    const iris = oval(eyeSocket, gold, .034, .004, 0, .012, .049, .049);
    const pupil = oval(eyeSocket, eyes, .044, .006, 0, .009, .040, .028);
    oval(eyeSocket, cream, .052, .024, side * .018, .003, .008, .007);
    eyeSockets.push({ eyeSocket, lid, iris, pupil, side });
    for (let i = 0; i < 4; i++) {
      const rootY = -.093 - i * .025;
      tube(head, whisker, [[.33, rootY, side * .143], [.30, rootY + .025 - i * .018, side * .30],
        [.20 - i * .025, rootY + .035 - i * .028, side * (.53 - i * .026)]], .0037);
    }
  }

  const collar = new THREE.Group();
  const collarBand = new THREE.Mesh(new THREE.TorusGeometry(.239, .032, 10, 30), collarPaint);
  collarBand.rotation.y = Math.PI / 2;
  collar.add(collarBand);
  oval(collar, tagPaint, .019, -.252, .11, .033, .075, .057);
  collar.position.set(.57, .75, 0);
  body.add(collar);

  const legs = [];
  const legRings = 14;
  const legSides = 14;
  const legTemplate = new THREE.CylinderGeometry(1, 1, 1, legSides, legRings, true);
  for (const x of [-.56, .43]) {
    for (const z of [-.183, .183]) {
      const leg = new THREE.Mesh(legTemplate.clone(), fur);
      leg.geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
      leg.frustumCulled = false;
      body.add(leg);
      const paw = oval(body, fur, x, .065, z, .105, .060, .075);
      oval(paw, cream, .53, -.12, 0, .44, .82, .92);
      legs.push({ x, z, leg, paw });
    }
  }

  function shapeLeg(leg, x, z, kneeX, kneeY, pawX, pawY) {
    const positions = leg.geometry.attributes.position;
    const hipY = .671;
    for (let ring = 0; ring <= legRings; ring++) {
      const t = ring / legRings;
      const q = 1 - t;
      const cx = q * q * x + 2 * q * t * kneeX + t * t * pawX;
      const cy = q * q * hipY + 2 * q * t * kneeY + t * t * pawY;
      const radius = .050 + (x < 0 ? .083 : .061) * q ** 2;
      const dx = q * (kneeX - x) + t * (pawX - kneeX);
      const dy = q * (kneeY - hipY) + t * (pawY - kneeY);
      const length = Math.hypot(dx, dy);
      for (let side = 0; side <= legSides; side++) {
        const angle = side / legSides * Math.PI * 2;
        const offset = Math.sin(angle) * radius;
        positions.setXYZ(ring * (legSides + 1) + side,
          cx - dy / length * offset, cy + dx / length * offset, z + Math.cos(angle) * radius * .81);
      }
    }
    positions.needsUpdate = true;
    leg.geometry.computeVertexNormals();
  }

  const tail = new THREE.Group();
  tail.position.set(-.77, .70, 0);
  body.add(tail);
  const tailPath = new THREE.CatmullRomCurve3([
    [0, 0, 0], [-.23, .19, 0], [-.36, .45, .03], [-.42, .65, .10], [-.57, .75, .16]
  ].map(point => new THREE.Vector3(...point)));
  const tailGeometry = new THREE.TubeGeometry(tailPath, 56, .072, 16, false);
  const tailUV = tailGeometry.attributes.uv;
  const tailVertices = tailGeometry.attributes.position;
  const tailPoint = new THREE.Vector3();
  for (let i = 0; i < tailVertices.count; i++) {
    const t = tailUV.getX(i);
    const center = tailPath.getPointAt(t);
    tailPoint.fromBufferAttribute(tailVertices, i).lerp(center, t * .43);
    tailVertices.setXYZ(i, tailPoint.x, tailPoint.y, tailPoint.z);
  }
  const tailColors = new THREE.BufferAttribute(new Float32Array(tailUV.count * 3), 3);
  tailGeometry.setAttribute('color', tailColors);
  patterns.push(coat => {
    const base = new THREE.Color(coat.fur);
    const dark = new THREE.Color(coat.stripe);
    const color = new THREE.Color();
    for (let i = 0; i < tailUV.count; i++) {
      const along = tailUV.getX(i);
      const ring = Math.cos(along * 38 + Math.sin(tailUV.getY(i) * Math.PI * 2) * .34);
      color.copy(base).lerp(dark, Math.max(THREE.MathUtils.smoothstep(ring, .28, .88),
        THREE.MathUtils.smoothstep(along, .89, 1)) * .86);
      tailColors.setXYZ(i, color.r, color.g, color.b);
    }
    tailColors.needsUpdate = true;
  });
  tail.add(new THREE.Mesh(tailGeometry, new THREE.MeshStandardMaterial({ vertexColors: true, ...furFinish })));
  oval(tail, stripe, -.57, .75, .16, .040, .040, .040);

  const layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  layer.style.cssText = 'position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:89';
  layer.hidden = true;
  const canvas = renderer.domElement;
  const petSpot = new THREE.Vector3();
  const petRay = new THREE.Raycaster();
  const down = new THREE.Vector3();
  canvas.style.cssText = 'position:absolute;left:0;top:0;width:132px;height:99px';
  layer.append(canvas);
  document.body.append(layer);

  return {
    show(name) {
      const colors = coats[name];
      fur.color.setHex(colors.fur);
      cream.color.setHex(colors.cream);
      stripe.color.setHex(colors.stripe);
      gold.color.setHex(colors.iris);
      nosePaint.color.setHex(colors.nose);
      patterns.forEach(paint => paint(colors));
      const gray = name === 'kaguya';
      collar.visible = gray;
      head.scale.set(gray ? .93 : 1.03, gray ? 1.04 : .96, gray ? 1.03 : .93);
      ears.forEach((ear, index) => {
        ear.scale.set(1, gray ? 1.08 : .95, 1);
        ear.rotation.z = (index ? -1 : 1) * (gray ? .05 : .13);
      });
      nose.scale.set(gray ? .86 : 1.05, gray ? .90 : .96, 1);
      eyeSockets.forEach(({ eyeSocket, lid, iris, pupil, side }) => {
        lid.geometry = eyeContours[name];
        eyeSocket.rotation.x = -side * (gray ? .08 : .22);
        iris.scale.y = iris.scale.z = colors.eye.iris;
        pupil.scale.y = colors.eye.pupilHeight;
        pupil.scale.z = colors.eye.pupilWidth;
      });
      layer.dataset.catCameo = name;
      layer.hidden = false;
    },
    hide() { layer.hidden = true; },
    draw(time, x, feet, { facing, distance, stride, curious, nuzzle, turn, foreground, stroke, pet, gallop }) {
      const left = x - 66;
      const top = feet - 80;
      canvas.style.transform = 'translate(' + left + 'px,' + top + 'px)';
      layer.style.zIndex = foreground ? '91' : '89';
      model.rotation.y = (facing < 0 ? Math.PI + .29 - turn * (Math.PI + .58) : -.29 + turn * (Math.PI + .58))
        + facing * pet * .22;
      const cycle = distance / (gallop ? 31 : 23);
      const stepWidth = gallop ? .76 : .56;
      const gait = Math.min(1, stride);
      const bob = Math.abs(Math.sin(cycle * Math.PI * 2)) * gait * .045;
      body.position.y = bob - nuzzle * .085 + pet * .046;
      body.rotation.x = pet * .17;
      head.rotation.y = -facing * (curious * .98 + nuzzle * .22) + pet * facing * .72;
      head.rotation.z = curious * .12 - nuzzle * .34 + pet * (.15 + stroke * .12);
      head.position.x = .69 + nuzzle * .23;
      const blink = Math.max(0, 1 - Math.abs(time % 3100 - 120) / 85);
      eyeSockets.forEach(({ eyeSocket }) => { eyeSocket.scale.y = Math.max(.12, 1 - blink * .88 - pet * .47); });
      legs.forEach(({ x, z, leg, paw }, i) => {
        const phase = (cycle + (i === 0 || i === 3 ? 0 : .5)) % 1;
        const swing = Math.max(0, (phase - .61) / .39);
        const reach = phase < .61 ? .5 - phase / .61 : -.5 + swing * swing * (3 - 2 * swing);
        const planted = reach * stepWidth * gait;
        const front = x > 0;
        const stepAround = Math.max(0, Math.sin(turn * Math.PI * 2 + (i % 2 ? Math.PI : 0))) * .10;
        const pawTap = front && z > 0 ? Math.sin(nuzzle * Math.PI) : 0;
        const lift = Math.sin(swing * Math.PI) * (gallop ? .24 : .16) * gait + stepAround + pawTap * .12;
        const px = x + planted + .065 + pawTap * .11;
        const py = .065 + lift - body.position.y + z * Math.sin(body.rotation.x);
        const kneeX = (x + px) / 2 + (front ? -.16 : .23);
        const kneeY = .33 + lift * .64;
        shapeLeg(leg, x, z, kneeX, kneeY, px - .031, py + .033);
        paw.position.set(px, py, z);
        paw.rotation.z = -Math.sin(swing * Math.PI * 2) * gait * .35;
      });
      tail.rotation.y = Math.sin(time / (stride ? 124 : 242)) * (.19 + gait * .13);
      tail.rotation.z = Math.sin(time / 280) * .09 - nuzzle * .13;
      renderer.render(scene, camera);
      if (!pet) return;
      body.localToWorld(petSpot.set(.25 - .45 * stroke, 1.7, .105));
      down.set(0, -1, 0).transformDirection(body.matrixWorld);
      petRay.set(petSpot, down);
      const surface = petRay.intersectObject(back, false)[0];
      if (!surface) return;
      petSpot.copy(surface.point).project(camera);
      return { x: left + (petSpot.x + 1) * 66, y: top + (1 - petSpot.y) * 49.5 };
    }
  };
}
