import * as THREE from './vendor/three.module.min.js';

const white = new THREE.MeshStandardMaterial({ color: 0xfaf9f5, roughness: .62 });
const sphere = new THREE.SphereGeometry(1, 32, 24);

function group(parent, x = 0, y = 0, z = 0) {
  const part = new THREE.Group();
  part.position.set(x, y, z);
  parent.add(part);
  return part;
}

function oval(parent, material, position, radii) {
  const mesh = new THREE.Mesh(sphere, material);
  mesh.position.set(...position);
  mesh.scale.set(...radii);
  parent.add(mesh);
  return mesh;
}

const hair = new THREE.MeshStandardMaterial({ color: 0x35343a, roughness: .91, side: THREE.DoubleSide });
const ink = new THREE.MeshStandardMaterial({ color: 0x292622, roughness: .73 });
const tee = new THREE.MeshStandardMaterial({ color: 0xe4e4dc, roughness: .89 });
const pants = new THREE.MeshStandardMaterial({ color: 0x4e5862, roughness: .87 });
const trim = new THREE.MeshStandardMaterial({ color: 0x292928, roughness: .86 });

function stroke(parent, material, points, size) {
  const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
  parent.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, size, 12), material));
  oval(parent, material, points[0], [size, size, size]);
  oval(parent, material, points.at(-1), [size, size, size]);
}

let hairGeometry;

function sculptHair() {
  const columns = 240;
  const rows = 108;
  const geometry = new THREE.SphereGeometry(1, columns, rows, 0, Math.PI * 2, 0, Math.PI / 2);
  const positions = geometry.attributes.position;
  // Landmarks in the reference image, sampled in order along the fringe.
  // The return at each tip is kept in the curve, including the short left lock.
  const hairline = new THREE.SplineCurve([
    [259,527],[267,388],[295,354],[316,320],[320,363],
    [339,399],[364,410],[386,384],[411,323],[438,250],
    [454,301],[480,344],[514,376],[554,398],[589,403],
    [615,394],[650,394],[688,399],[728,393],[765,385],[820,407]
  ].map(([px, py]) => new THREE.Vector2((px - 518) * .00128, (477 - py) * .00114)));
  const strandPaths = [
    [[-.176,.350],[-.157,.285],[-.164,.221],[-.185,.163],[-.202,.118]],
    [[-.132,.377],[-.100,.305],[-.030,.220],[.068,.148],[.182,.109],[.247,.112]],
    [[-.060,.399],[-.017,.334],[.063,.264],[.161,.205],[.261,.168],[.329,.164]],
    [[.023,.418],[.081,.365],[.172,.303],[.266,.254],[.364,.212]]
  ];

  function strandRelief(x, y) {
    let depth = 0;
    for (const path of strandPaths) {
      let nearest = Infinity;
      let progress = 0;
      for (let i = 1; i < path.length; i++) {
        const [u, v] = path[i - 1];
        const dx = path[i][0] - u;
        const dy = path[i][1] - v;
        const t = THREE.MathUtils.clamp(((x - u) * dx + (y - v) * dy) / (dx * dx + dy * dy), 0, 1);
        const distance = (x - u - t * dx) ** 2 + (y - v - t * dy) ** 2;
        if (distance < nearest) {
          nearest = distance;
          progress = (i - 1 + t) / (path.length - 1);
        }
      }
      depth += .030 * Math.exp(-nearest / .00082) * Math.sin(Math.PI * progress);
    }
    return depth;
  }

  for (let column = 0; column <= columns; column++) {
    const azimuth = column / columns * Math.PI * 2;
    const u = -Math.cos(azimuth);
    const zDirection = Math.sin(azimuth);
    const front = Math.max(0, zDirection);
    const fringe = THREE.MathUtils.smoothstep(front, 0, .38);
    const contour = hairline.getPoint((u + 1) / 2);
    const browClearance = .006 * Math.exp(-((u + .53) ** 2) / .025);
    const foreheadCoverage = .057 + .014 * Math.exp(-((u + .28) ** 2) / .29) - browClearance;
    const edgeHeight = THREE.MathUtils.lerp(-.140 + .034 * Math.abs(u),
      contour.y - foreheadCoverage, fringe);
    const edge = Math.acos((edgeHeight - .102) / .358);
    for (let row = 0; row <= rows; row++) {
      const t = row / rows;
      const polar = t * edge;
      const ring = Math.sin(polar);
      const tuck = 1 - .125 * THREE.MathUtils.smoothstep(t, .92, 1);
      const edgeX = u * .372 * Math.sin(edge) * .875;
      const edgeBlend = fringe * THREE.MathUtils.smoothstep(t, .62, 1);
      // Keep the traced tips in place and round out the side panels above them.
      const sideWeight = Math.abs(u) ** 1.7;
      const sideVolume = (.090 + .054 * Math.max(0, -u)) * sideWeight *
        Math.sin(Math.PI * t) ** 1.55;
      const x = u * (.372 + sideVolume) * ring * tuck + (contour.x - edgeX) * edgeBlend;
      const y = .102 + .358 * Math.cos(polar);
      const z = zDirection * (zDirection < 0 ? .377 : .336) * ring * tuck - .014;
      // Both tips are sculpted from the crown itself. Their displacement
      // fades out before the temples and the lower front edge.
      const top = fringe * Math.exp(-((polar - .47) ** 2) / .058 - ((u - .70) ** 2) / .115);
      const side = fringe * Math.exp(-((polar - .86) ** 2) / .025 - ((u - .91) ** 2) / .047);
      const leftLobe = fringe * Math.exp(-((polar - .79) ** 2) / .16 - ((u + .77) ** 2) / .19);
      const leftPart = fringe * Math.exp(-((polar - .44) ** 2) / .055 - ((u + .64) ** 2) / .20);
      const sweep = .042 * front ** 1.65 * ring * Math.sin(Math.PI * t);
      const comma = fringe * Math.exp(-((u + .62) ** 2) / .016) *
        Math.sin(Math.PI * THREE.MathUtils.smoothstep(t, .43, 1));
      // A rounded left lock and a shallow crease where it meets the sweep.
      // Both fade out before the hairline to preserve the fringe length.
      const leftLayerAxis = -.29 - .31 * t;
      const layerEnvelope = front ** 1.3 *
        Math.sin(Math.PI * THREE.MathUtils.smoothstep(t, .25, .995));
      const leftLayer = .102 * Math.exp(-((u - leftLayerAxis) ** 2) / .033) * layerEnvelope;
      const layerCrease = .021 * Math.exp(-((u - leftLayerAxis - .23) ** 2) / .012) * layerEnvelope;
      const fringeLift = .022 * front ** 1.4 * Math.sin(Math.PI * t) ** 1.5;
      const groove = fringe * strandRelief(x + sweep, y);
      // Shallow strand relief follows the scalp around the temples and nape.
      const strandPhase = azimuth * 24 - polar * 5.2 + .47 * Math.sin(azimuth * 5 + polar * 2);
      const edgeFade = 1 - THREE.MathUtils.smoothstep(t, .89, 1);
      const leftTexture = THREE.MathUtils.smoothstep(-u, .16, .82);
      const fineStrands = Math.cos(strandPhase + .58 * leftTexture * Math.sin(azimuth * 11)) ** 6;
      const broadStrands = Math.cos(strandPhase * .5 + .22 * Math.sin(azimuth * 6 + polar * 3)) ** 6;
      const strandDepth = (.0052 + .0032 * leftTexture + .0024 * Math.sin(azimuth * 8 + polar * 4) ** 2) *
        Math.sin(polar) * edgeFade * (.64 * fineStrands + .52 * broadStrands);
      const rearFlow = .003 * Math.max(0, -zDirection) * Math.sin(polar) * edgeFade *
        Math.sin(azimuth * 5 + polar * 2.3) ** 12;
      // Raise a broad roll from the part toward the right. At the tip it
      // rolls under toward the forehead, so the profile reads as solid hair.
      const rollAxis = -.24 + .50 * t;
      const rollWidth = Math.exp(-((u - rollAxis) ** 2) / .35);
      const rollHeight = Math.exp(-((t - .72) ** 2) / .098);
      const frontVolume = .201 * front ** 2.1 * ring * rollWidth * rollHeight *
        (1 - .73 * THREE.MathUtils.smoothstep(t, .83, 1));
      const crownLift = .078 * Math.exp(-((polar - .37) ** 2) / .19) * ring;
      const sweptCrown = .049 * front * Math.exp(-((polar - .53) ** 2) / .10 - ((u + .10) ** 2) / .44) * ring;
      const crownBlend = THREE.MathUtils.smoothstep(polar, 0, .22);
      positions.setXYZ(row * (columns + 1) + column,
        x + sweep + crownBlend * (-.049 * leftLobe + .140 * top + .088 * side) - u * (strandDepth + rearFlow),
        y + crownLift + crownBlend * (-.044 * leftPart + .060 * top + .007 * side),
        z + crownBlend * (frontVolume + sweptCrown + fringeLift + leftLayer - layerCrease + .054 * leftLobe + .057 * comma - groove) - zDirection * (strandDepth + rearFlow));
    }
  }
  geometry.computeVertexNormals();
  return geometry;
}

function sculptHead(head) {
  const x = pixel => (pixel - 518) * .00128;
  const y = pixel => (477 - pixel) * .00114;
  // Half-widths measured down the outline of the drawing. The rounded
  // corners lead into a shallow chin, with almost vertical cheeks above.
  const profile = [
    [822,0,0],[819,65,66],[810,117,112],[792,166,162],
    [771,195,193],[740,216,217],[700,230,231],[648,241,242],
    [590,247,250],[526,249,256],[463,250,257],[399,249,253],
    [337,240,242],[271,218,226],[216,179,191],[174,121,139],[149,0,0]
  ];
  const outline = new THREE.SplineCurve(profile.map(([pixel, left, right]) =>
    new THREE.Vector2(y(pixel), (left + right) * .00064)));
  const sections = outline.getPoints(120).sort((a, b) => a.x - b.x);
  const geometry = new THREE.LatheGeometry(sections.map(({x, y}) => new THREE.Vector2(Math.max(0, y), x)), 96);
  const vertices = geometry.attributes.position;
  const power = (value, exponent) => Math.sign(value) * Math.abs(value) ** exponent;
  const faceCurve = .76;
  function radiusAt(height) {
    const i = sections.findIndex(point => point.x > height);
    if (i <= 0) return .001;
    const lower = sections[i - 1];
    const upper = sections[i];
    return Math.max(.001, THREE.MathUtils.lerp(lower.y, upper.y, (height - lower.x) / (upper.x - lower.x)));
  }
  function depthAt(height) {
    return .25 + .048 * Math.exp(-((height + .04) ** 2) / .085);
  }
  function jawDepth(height, radius) {
    const taper = 1 - Math.min(1, radius / .31);
    return depthAt(height) * Math.sqrt(1 - taper * taper);
  }
  for (let i = 0; i < vertices.count; i++) {
    const h = vertices.getY(i);
    const px = vertices.getX(i);
    const pz = vertices.getZ(i);
    const radius = Math.hypot(px, pz);
    if (radius < .00001) continue;
    const depth = jawDepth(h, radius);
    const back = Math.max(0, -pz / radius);
    const occiput = .048 * back ** 2 * Math.exp(-((h - .045) ** 2) / .036);
    vertices.setXYZ(i, radius * power(px / radius, faceCurve), h,
      depth * power(pz / radius, faceCurve) - occiput);
  }
  geometry.computeVertexNormals();
  head.add(new THREE.Mesh(geometry, white));
  const front = (u, h) => {
    const radius = radiusAt(h);
    return jawDepth(h, radius) *
      Math.max(.001, 1 - Math.abs(u / radius) ** (2 / faceCurve)) ** (faceCurve / 2);
  };
  for (const side of [-1, 1]) {
    const ear = oval(head, white, [side * .341, -.103, .031], [.074, .067, .054]);
    ear.rotation.z = side * .24;
  }

  hairGeometry ??= sculptHair();
  head.add(new THREE.Mesh(hairGeometry, hair));

  function faceLine(points, size) {
    const coords = points.map(([px, py]) => [x(px), y(py)]);
    const feature = group(head);
    stroke(feature, ink, coords.map(([u, v]) => [u, v, front(u, v) - .003]), size);
    return feature;
  }
  const leftBrow = faceLine([[327,460],[381,458],[437,458]], .021);
  const rightBrow = faceLine([[616,460],[653,461],[693,464]], .021);
  const eyes = [411, 625].map(pixel => {
    const u = x(pixel);
    const v = y(533);
    const eye = oval(head, ink, [u, v, front(u, v) + .002], [.027, .037, .018]);
    eye.rotation.y = u * 1.5;
    return eye;
  });
  faceLine([[518,534],[518,582],[517,627]], .010);
  const smile = faceLine([[467,689],[487,699],[513,703],[540,700],[555,692]], .0105);
  const mouth = oval(head, ink, [0, y(687), front(0, y(687)) + .008], [.041,.048,.019]);
  mouth.visible = false;
  const swirls = group(head);
  for (const pixel of [411,625]) {
    const spiral = [];
    for (let i = 0; i <= 52; i++) {
      const angle = i / 52 * Math.PI * 4.5;
      const radius = .004 + .039 * i / 52;
      const u = x(pixel) + Math.cos(angle) * radius;
      const v = y(533) + Math.sin(angle) * radius;
      spiral.push([u,v,front(u,v) + .021]);
    }
    stroke(swirls, ink, spiral, .0055);
  }
  swirls.visible = false;
  return { eyes, brows: [leftBrow,rightBrow], smile, mouth, swirls };
}

function lathe(parent, material, profile, depth) {
  const mesh = new THREE.Mesh(
    new THREE.LatheGeometry(profile.map(([radius, y]) => new THREE.Vector2(radius, y)), 40),
    material
  );
  mesh.scale.z = depth;
  parent.add(mesh);
  return mesh;
}

function makeFigurine(scene) {
  const root = group(scene);
  const hips = group(root, 0, .455);
  root.scale.y = 1.11;
  oval(hips, pants, [0, .085, 0], [.217, .105, .148]);
  const torso = group(hips);
  const shirt = lathe(torso, tee, [[0,.097],[.193,.097],[.224,.111],[.230,.158],[.219,.281],
    [.236,.392],[.216,.446],[.167,.483],[.115,.499],[0,.499]], .70);
  oval(torso, white, [0, .529, 0], [.096, .10, .091]);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(.094, .013, 10, 40), trim);
  collar.rotation.x = Math.PI / 2 + .18;
  collar.position.set(0, .51, .008);
  torso.add(collar);

  const neck = group(torso, 0, .537);
  const head = group(neck, 0, .334);
  const face = sculptHead(head);

  const arms = [];
  const legs = [];
  for (const side of [-1, 1]) {
    const arm = group(torso, side * .196, .394);
    arm.rotation.z = side * .24;
    oval(arm, white, [0,-.188,0], [.067,.135,.067]);
    oval(arm, white, [0,-.275,.014], [.074,.077,.069]);
    lathe(arm, tee, [[0,-.137],[.091,-.137],[.098,-.12],[.105,-.028],[.09,.027],[.045,.05],[0,.055]], .92);
    arms.push(arm);

    const leg = group(hips, side * .109, .078);
    lathe(leg, pants, [[0,-.441],[.084,-.441],[.089,-.423],[.092,-.237],
      [.104,-.067],[.101,.016],[.064,.062],[0,.069]], .92);
    const foot = oval(leg, white, [side * .008,-.463,.066], [.098,.069,.145]);
    foot.rotation.y = side * .11;
    legs.push(leg);
  }
  const stars = group(neck, 0, .76);
  const starMaterial = new THREE.MeshStandardMaterial({color: 0xe6bd55, emissive: 0x654400, roughness: .6});
  for (let i = 0; i < 3; i++) {
    const shape = new THREE.Shape();
    for (let j = 0; j < 10; j++) {
      const angle = j * Math.PI / 5 + Math.PI / 2;
      const radius = j % 2 ? .020 : .045;
      if (j === 0) shape.moveTo(Math.cos(angle)*radius,Math.sin(angle)*radius);
      else shape.lineTo(Math.cos(angle)*radius,Math.sin(angle)*radius);
    }
    shape.closePath();
    const star = new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.012,bevelEnabled:false}),starMaterial);
    stars.add(star);
  }
  stars.visible = false;
  return { root, hips, torso, shirt, neck, arms, legs, face, stars };
}

export function createView(width, height) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(width, height, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none';
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xf5f7ff, 0x89837a, 1.5));
  const key = new THREE.DirectionalLight(0xfff4e7, 2.6);
  key.position.set(-3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xe8f1ff, 1.75);
  rim.position.set(2, 3, -4);
  scene.add(rim);

  const aspect = width / height;
  const camera = new THREE.OrthographicCamera(-1.22 * aspect, 1.22 * aspect, 1.22, -1.22, .1, 20);
  camera.position.set(0, 1.53, 5);
  camera.lookAt(0, 1.07, 0);
  const figure = makeFigurine(scene);
  const knee = new THREE.Vector3();
  const armDown = new THREE.Vector3(0, -.275, .014).normalize();
  const bracedArm = new THREE.Quaternion();

  function braceHands(amount) {
    for (let i = 0; i < figure.arms.length; i++) {
      const arm = figure.arms[i];
      arm.scale.set(1, 1, 1);
      if (!amount) continue;
      // Track the front of each knee as the torso leans and the legs bend.
      knee.set(i === 0 ? -.012 : .012, -.215, .087);
      figure.legs[i].localToWorld(knee);
      figure.torso.worldToLocal(knee);
      knee.sub(arm.position);
      const reach = knee.length() / .275;
      bracedArm.setFromUnitVectors(armDown, knee.normalize());
      arm.quaternion.slerp(bracedArm, amount);
      arm.scale.y = THREE.MathUtils.lerp(1, reach, amount);
    }
  }

  const sole = new THREE.Vector3(0, -.523, .068);
  const projectedSole = new THREE.Vector3();
  const currentPoint = new THREE.Vector3();
  const pinnedPoint = new THREE.Vector3();
  let landing;
  let landingLeg;
  let landingX;
  let landingY;

  function landStep(emotion, swing) {
    if (emotion.landing === undefined) {
      landing = undefined;
      return;
    }

    if (landing !== emotion.landing) {
      landing = emotion.landing;
      landingLeg = swing >= 0 ? figure.legs[0] : figure.legs[1];
      landingLeg.localToWorld(projectedSole.copy(sole)).project(camera);
      landingX = emotion.screenX + (projectedSole.x + 1) * width / 2;
      landingY = emotion.screenY + (1 - projectedSole.y) * height / 2;
    }

    // Hold the supporting sole in screen space while the hip moves through
    // the turn, then blend it back into the next walking step.
    landingLeg.localToWorld(projectedSole.copy(sole)).project(camera);
    currentPoint.copy(projectedSole).unproject(camera);
    pinnedPoint.set(2 * (landingX - emotion.screenX) / width - 1,
      1 - 2 * (landingY - emotion.screenY) / height, projectedSole.z).unproject(camera);
    figure.hips.worldToLocal(currentPoint);
    figure.hips.worldToLocal(pinnedPoint);
    const release = 1 - THREE.MathUtils.smoothstep(emotion.landingProgress, .38, 1);
    landingLeg.position.add(pinnedPoint.sub(currentPoint).clampLength(0, .20).multiplyScalar(release));
  }

  function draw(time, phase, stride, yaw, wave = 0, waveTime = 0, look = [0, 0, 0], breath = 0, fatigue = 0, emotion = {}) {
    const bracing = emotion.bracing ?? false;
    const weightShift = emotion.weightShift ?? 0;
    const swing = bracing ? 0 : Math.sin(phase) * stride;
    figure.root.rotation.y = yaw;
    // Move only the torso and head while the feet are planted.
    figure.hips.position.y = .455 + (bracing ? 0 : Math.abs(swing) * .093 + Math.sin(time / 460) * .008);
    figure.hips.rotation.x = bracing ? 0 : stride * .23;
    figure.torso.rotation.x = fatigue * 1.04;
    figure.torso.position.set(0, -fatigue * .053 + breath * .047, -fatigue * .073);
    figure.shirt.scale.x = 1 + breath * .060;
    figure.shirt.scale.z = .70 * (1 + breath * .24);
    for (const arm of figure.arms) arm.position.y = .394 + breath * .032;
    figure.neck.rotation.set(look[1] - stride * .14 - fatigue * .68 - breath * .048, look[0], look[2] + swing * .065);
    figure.arms[0].rotation.x = swing * 1.15 - wave * .28 - fatigue * .25;
    figure.arms[0].rotation.z = -.24 - wave * (2.0 + Math.sin(waveTime * 13) * .22);
    figure.arms[1].rotation.x = -swing * 1.15 - fatigue * .25;
    figure.legs[0].position.set(-.109,.078,0);
    figure.legs[1].position.set(.109,.078,0);
    figure.legs[0].rotation.x = -swing;
    figure.legs[1].rotation.x = swing;
    const dizzy = emotion.dizzy ?? 0;
    const surprise = emotion.surprise ?? 0;
    const { face } = figure;
    const exhausted = fatigue > .04;
    face.smile.visible = !exhausted && !dizzy && !surprise;
    face.mouth.visible = exhausted || dizzy > 0 || surprise > 0;
    face.mouth.scale.set(exhausted ? .031 + .010 * breath : .039,
      surprise ? .062 : exhausted ? .012 + .018 * breath : .031, .020);
    face.swirls.visible = dizzy > 0;
    for (let i = 0; i < face.eyes.length; i++) {
      const eye = face.eyes[i];
      eye.visible = !dizzy;
      eye.scale.y = surprise ? .052 : time % 3800 > 3690 ? .006 : .037;
      face.brows[i].position.y = surprise ? .047 : 0;
    }
    figure.arms[1].rotation.z = .24;
    figure.root.rotation.z = dizzy * Math.sin(time / 170) * .12 - weightShift * .075;
    braceHands(THREE.MathUtils.smoothstep(fatigue, .17, .94));
    figure.neck.rotation.z += dizzy * Math.sin(time / 120) * .16;
    figure.stars.visible = dizzy > 0;
    figure.stars.rotation.y = time / 440;
    for (let i=0; i<figure.stars.children.length; i++) {
      const star = figure.stars.children[i];
      const angle = i * Math.PI * 2 / 3;
      star.position.set(Math.cos(angle)*.40, .02 + Math.sin(time/260+i)*.02,Math.sin(angle)*.22);
      star.rotation.y = -figure.stars.rotation.y;
    }
    if (surprise) {
      figure.hips.rotation.x = -.09;
      figure.neck.rotation.x = -.12;
      figure.arms[0].rotation.z = -1.05;
      figure.arms[1].rotation.z = 1.05;
      figure.arms[0].rotation.x = figure.arms[1].rotation.x = -.45;
      figure.hips.position.y += .035 * Math.sin(Math.min(1,surprise)*Math.PI);
    }
    landStep(emotion, swing);
    renderer.render(scene, camera);
  }
  return { canvas: renderer.domElement, draw };
}
