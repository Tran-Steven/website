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
    const rear = THREE.MathUtils.smoothstep(-zDirection, .045, .68);
    const rearHairline = -.151 - .091 * rear + .017 * Math.abs(u);
    const edgeHeight = THREE.MathUtils.lerp(rearHairline, contour.y - foreheadCoverage, fringe);
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
      // At the nape the hair follows the skull's fuller cross-section.
      const rearRing = Math.sin(Math.min(polar, Math.PI / 2)) *
        (1 - .12 * THREE.MathUtils.smoothstep(t, .63, 1));
      const scalpRing = THREE.MathUtils.lerp(ring, rearRing, rear);
      const x = u * (.372 + sideVolume) * scalpRing * tuck + (contour.x - edgeX) * edgeBlend;
      const y = .102 + .358 * Math.cos(polar) - .060 * rear * THREE.MathUtils.smoothstep(t, .68, 1);
      const z = zDirection * (.336 + .050 * rear) * scalpRing * (tuck + .095 * rear * t ** 3) - .014;
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
      const templeAxis = -.86 + .15 * t;
      const templeLayer = .075 * Math.exp(-((u - templeAxis) ** 2) / .055) * layerEnvelope;
      const templeCrease = .023 * Math.exp(-((u - templeAxis - .11) ** 2) / .016) * layerEnvelope;
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
      const rearLayerEnvelope = rear * Math.sin(Math.PI * THREE.MathUtils.smoothstep(t, .14, .99));
      const rearPart = u + .28 - .36 * t;
      const rearLayers = rearLayerEnvelope * (
        .042 * Math.exp(-((rearPart + .34) ** 2) / .09) +
        .058 * Math.exp(-((rearPart - .26) ** 2) / .13) -
        .014 * Math.exp(-(rearPart ** 2) / .024));
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
        x + sweep + crownBlend * (-.049 * leftLobe + .140 * top + .088 * side) + u * (rearLayers * .48 - strandDepth - rearFlow),
        y + crownLift + crownBlend * (-.044 * leftPart + .060 * top + .007 * side),
        z + crownBlend * (frontVolume + sweptCrown + fringeLift + leftLayer + templeLayer - templeCrease - layerCrease + .054 * leftLobe + .057 * comma - groove) + zDirection * (rearLayers - strandDepth - rearFlow));
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
    eye.userData.restX = u;
    return eye;
  });
  const closedEyes = group(head);
  for (const pixel of [411, 625]) {
    const eyeX = x(pixel);
    const eyeY = y(533);
    const points = [[-.031,.004],[-.017,-.007],[0,-.011],[.017,-.007],[.031,.004]];
    stroke(closedEyes, ink, points.map(([dx,dy]) => [
      eyeX + dx, eyeY + dy, front(eyeX + dx, eyeY + dy) + .010
    ]), .008);
  }
  closedEyes.visible = false;
  faceLine([[518,534],[518,582],[517,627]], .010);
  const smile = faceLine([[467,689],[487,699],[513,703],[540,700],[555,692]], .0105);
  const heldMouth = faceLine([[484,700],[503,693],[524,694],[545,700]], .009);
  heldMouth.visible = false;
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
  return { eyes, closedEyes, brows: [leftBrow,rightBrow], smile, heldMouth, mouth, swirls };
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
  const elbows = [];
  const legs = [];
  const knees = [];
  const ankles = [];
  for (const side of [-1, 1]) {
    const arm = group(torso, side * .196, .394);
    arm.rotation.z = side * .24;
    oval(arm, white, [0,-.098,0], [.067,.105,.067]);
    const elbow = group(arm, 0, -.150);
    oval(elbow, white, [0,-.057,0], [.066,.111,.066]);
    oval(elbow, white, [0,-.125,.014], [.074,.077,.069]);
    elbows.push(elbow);
    lathe(arm, tee, [[0,-.137],[.091,-.137],[.098,-.12],[.105,-.028],[.09,.027],[.045,.05],[0,.055]], .92);
    arms.push(arm);

    const leg = group(hips, side * .109, .078);
    lathe(leg, pants, [[0,-.284],[.072,-.279],[.092,-.237],
      [.104,-.067],[.101,.016],[.064,.062],[0,.069]], .92);
    const knee = group(leg, 0, -.220);
    oval(knee, pants, [0,-.012,0], [.091,.081,.084]);
    lathe(knee, pants, [[0,-.221],[.084,-.221],[.089,-.203],
      [.092,-.017],[.086,.024],[0,.045]], .92);
    const ankle = group(knee, side * .008, -.243, .066);
    const foot = oval(ankle, white, [0,0,0], [.098,.069,.145]);
    foot.rotation.y = side * .11;
    ankles.push(ankle);
    knees.push(knee);
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
  return { root, hips, torso, shirt, neck, arms, elbows, legs, knees, ankles, face, stars };
}

// One stride, starting with the lead foot contacting the ground.
// Values are thigh pitch, knee bend, and the opposite shoulder's swing.
const runningStride = [
  [0, -.68, .18, .57],
  [.12, -.39, .24, .43],
  [.28, .12, .16, -.04],
  [.42, .73, .12, -.61],
  [.57, .44, 1.06, -.48],
  [.72, -.27, .97, .02],
  [.88, -.76, .36, .49],
  [1, -.68, .18, .57]
];
const runningHeight = [
  [0, .016], [.16, -.030], [.45, .015], [.73, .118], [1, .016]
];

function sampleGait(frames, cycle, channel) {
  const next = frames.findIndex(frame => frame[0] > cycle);
  const from = frames[next - 1];
  const to = frames[next];
  const t = (cycle - from[0]) / (to[0] - from[0]);
  return THREE.MathUtils.lerp(from[channel], to[channel], t * t * (3 - 2 * t));
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

  const sole = new THREE.Vector3(0, -.303, .068);
  const projectedSole = new THREE.Vector3();
  const currentPoint = new THREE.Vector3();
  const pinnedPoint = new THREE.Vector3();
  const kneePoint = new THREE.Vector3();
  const legAxis = new THREE.Vector3();
  const bendAxis = new THREE.Vector3();
  const kneeDirection = new THREE.Vector3();
  const legDown = new THREE.Vector3(0, -1, 0);
  const soleDirection = sole.clone().normalize();
  const thighLength = .220;
  const shinLength = sole.length();
  const plantedRotation = new THREE.Quaternion();
  let landing;
  let landingLeg;
  let landingKnee;
  let landingX;
  let landingY;

  function landStep(emotion, swing, contact, contactWeight) {
    const turnKey = contactWeight > 0 ? emotion.landing : undefined;
    const key = turnKey ?? contact?.key;
    const screenWidth = emotion.screenWidth ?? width;
    const screenHeight = emotion.screenHeight ?? height;
    if (key === undefined || contactWeight <= .001) {
      landing = undefined;
      return;
    }

    if (landing !== key) {
      landing = key;
      const index = turnKey === undefined ? contact.index : swing >= 0 ? 0 : 1;
      landingLeg = figure.legs[index];
      landingKnee = figure.knees[index];
      landingKnee.localToWorld(projectedSole.copy(sole)).project(camera);
      landingX = emotion.screenX + (projectedSole.x + 1) * screenWidth / 2;
      landingY = emotion.screenY + (1 - projectedSole.y) * screenHeight / 2;
    }

    // Hold the supporting sole in screen space while the hip moves through
    // the turn, then blend it back into the next walking step.
    landingKnee.localToWorld(projectedSole.copy(sole)).project(camera);
    currentPoint.copy(projectedSole).unproject(camera);
    pinnedPoint.set(2 * (landingX - emotion.screenX) / screenWidth - 1,
      1 - 2 * (landingY - emotion.screenY) / screenHeight, projectedSole.z).unproject(camera);
    figure.hips.worldToLocal(currentPoint);
    figure.hips.worldToLocal(pinnedPoint);
    const progress = turnKey === undefined ? contact.progress : emotion.landingProgress;
    const release = contactWeight * (1 - THREE.MathUtils.smoothstep(progress, .48, 1));
    if (release <= 0 || pinnedPoint.distanceToSquared(currentPoint) < .000001) return;

    // Solve toward the pinned sole by rotating the leg's joints. Its hip
    // stays attached to the body even when the step reaches its limit.
    pinnedPoint.sub(currentPoint).clampLength(0, .20).add(currentPoint);
    legAxis.copy(pinnedPoint).sub(landingLeg.position);
    const reach = THREE.MathUtils.clamp(legAxis.length(),
      Math.abs(thighLength - shinLength) + .002, thighLength + shinLength - .002);
    legAxis.normalize();
    kneePoint.setFromMatrixPosition(landingKnee.matrixWorld);
    figure.hips.worldToLocal(kneePoint);
    bendAxis.copy(kneePoint).sub(landingLeg.position);
    bendAxis.addScaledVector(legAxis, -bendAxis.dot(legAxis));
    if (bendAxis.lengthSq() < .00001) {
      bendAxis.set(0, 0, 1).addScaledVector(legAxis, -legAxis.z);
    }
    bendAxis.normalize();
    const along = (thighLength ** 2 + reach ** 2 - shinLength ** 2) / (2 * reach);
    kneeDirection.copy(legAxis).multiplyScalar(along)
      .addScaledVector(bendAxis, Math.sqrt(Math.max(0, thighLength ** 2 - along ** 2))).normalize();
    plantedRotation.setFromUnitVectors(legDown, kneeDirection);
    landingLeg.quaternion.slerp(plantedRotation, release);

    // Account for the actual blended hip rotation before aiming the shin.
    figure.hips.localToWorld(pinnedPoint);
    landingLeg.worldToLocal(pinnedPoint);
    pinnedPoint.sub(landingKnee.position).normalize();
    plantedRotation.setFromUnitVectors(soleDirection, pinnedPoint);
    landingKnee.quaternion.slerp(plantedRotation, release);
  }

  function draw(time, phase, stride, yaw, wave = 0, waveTime = 0, look = [0, 0, 0], breath = 0, fatigue = 0, emotion = {}) {
    const bracing = emotion.bracing ?? false;
    const weightShift = emotion.weightShift ?? 0;
    const running = emotion.running ?? 0;
    const sleep = emotion.sleep ?? 0;
    const doze = emotion.doze ?? 0;
    const wake = emotion.wake ?? 0;
    const grab = emotion.grab ?? 0;
    const dragLean = emotion.dragLean ?? 0;
    const dragPitch = emotion.dragPitch ?? 0;
    const limbLean = emotion.limbLean ?? 0;
    const limbPitch = emotion.limbPitch ?? 0;
    const frontWalk = emotion.walkTowardCamera ?? 0;
    const verticalTravel = emotion.verticalTravel ?? 0;
    const contactWeight = 1 - THREE.MathUtils.smoothstep(verticalTravel, .24, .65);
    const fall = emotion.drop ?? 0;
    const dropDirection = emotion.dropDirection ?? 0;
    const dropRecovery = emotion.dropRecovery ?? 0;
    const landingSquash = emotion.landingSquash ?? 0;
    figure.root.scale.y = 1.11 * (1 - .09 * landingSquash);
    const startle = wake > 0 ? Math.sin(Math.PI * THREE.MathUtils.clamp((wake - .11) / .64, 0, 1)) : 0;
    const sleepingBreath = sleep * (.5 + .5 * Math.sin(time / 460));
    const swing = bracing ? 0 : Math.sin(phase) * stride;
    figure.root.rotation.y = yaw;
    figure.root.position.x = 0;
    // Move only the torso and head while the feet are planted.
    const strideCycle = (phase / (2 * Math.PI)) % 1;
    const halfStride = (strideCycle * 2) % 1;
    const walkHeight = Math.abs(swing) * .093 + Math.sin(time / 460) * .008;
    figure.hips.position.y = .455 + (bracing || emotion.entrance ? 0 : THREE.MathUtils.lerp(walkHeight,
      sampleGait(runningHeight, halfStride, 1), running));
    figure.hips.rotation.x = bracing ? 0 : stride * .23;
    figure.torso.rotation.x = fatigue * 1.04 + running * .34 + sleep * .074;
    figure.torso.position.set(0, -fatigue * .053 + breath * .047, -fatigue * .073);
    figure.shirt.scale.x = 1 + breath * .060 + sleepingBreath * .016;
    figure.shirt.scale.z = .70 * (1 + breath * .24 + sleepingBreath * .042);
    for (let i = 0; i < figure.arms.length; i++) {
      figure.arms[i].position.x = i === 0 ? -.196 : .196;
      figure.arms[i].position.y = .394 + breath * .032;
    }
    figure.neck.rotation.set(look[1] - stride * .14 - fatigue * .68 - breath * .048, look[0], look[2] + swing * .065);
    figure.arms[0].rotation.x = swing * (1.15 + .60 * running) - wave * .28 - fatigue * .25;
    figure.arms[0].rotation.z = -.24 - wave * (2.0 + Math.sin(waveTime * 13) * .22);
    figure.arms[1].rotation.x = -swing * (1.15 + .60 * running) - fatigue * .25;
    figure.legs[0].position.set(-.109,.078,0);
    figure.legs[1].position.set(.109,.078,0);
    for (let i = 0; i < figure.knees.length; i++) {
      const cycle = (strideCycle + i * .5) % 1;
      const walkThigh = i === 0 ? -swing : swing;
      const thigh = sampleGait(runningStride, cycle, 1);
      const kneeBend = sampleGait(runningStride, cycle, 2);
      figure.legs[i].rotation.set(THREE.MathUtils.lerp(walkThigh, thigh, running), 0, 0);
      const walkCycle = (cycle + .75) % 1;
      const swingPhase = THREE.MathUtils.clamp((walkCycle - .52) / .48, 0, 1);
      const walkKnee = Math.sin(Math.PI * swingPhase) * stride * (.68 + .32 * frontWalk);
      const frontRun = verticalTravel * running;
      figure.knees[i].rotation.set(THREE.MathUtils.lerp(walkKnee, kneeBend * (1 - .26 * frontRun), running), 0, 0);
      figure.arms[i].rotation.x = THREE.MathUtils.lerp(figure.arms[i].rotation.x,
        sampleGait(runningStride, cycle, 3), running);
      const elbowPhase = Math.sin(cycle * Math.PI * 2 + .63);
      figure.elbows[i].rotation.set(-running * (.73 + .36 * elbowPhase) - (1 - running) * stride * .21, 0, 0);
      figure.arms[i].rotation.y = (i === 0 ? -1 : 1) * running * (.075 + .10 * elbowPhase);
    }
    const dizzy = emotion.dizzy ?? 0;
    const surprise = emotion.surprise ?? 0;
    const { face } = figure;
    const exhausted = fatigue > .04;
    const heldFace = grab > .12;
    const grabAge = emotion.grabAge;
    const motion = emotion.grabMotion ?? 0;
    const effort = grabAge === undefined ? 0 : grab * motion * (.64 + .36 * Math.sin(grabAge * 2.35 + .55) ** 2);
    const reachBeat = grabAge === undefined ? 0 : grabAge * 5.1;
    const heldGaze = heldFace ? motion * Math.sin(reachBeat + .6) * .012 + dragLean * .023 : 0;
    const whoa = heldFace ? THREE.MathUtils.smoothstep(motion, .24, .68) : 0;
    const startledSwing = whoa > .08;
    const alarmBeat = grabAge === undefined ? 0 : Math.sin(grabAge * 8.5) * whoa;
    const effortMouth = heldFace && effort > .60;
    const bracingForImpact = landingSquash > .38;
    face.smile.visible = !exhausted && !dizzy && !surprise && (!heldFace || effort < .16) && !startledSwing && !bracingForImpact;
    face.heldMouth.visible = bracingForImpact || (heldFace && effort >= .16 && !effortMouth && !startledSwing);
    face.mouth.visible = exhausted || dizzy > 0 || surprise > 0 || effortMouth || startledSwing;
    face.mouth.scale.set(startledSwing ? .033 + whoa * .020 : effortMouth ? .028 : exhausted ? .031 + .010 * breath : .039,
      surprise ? .062 : startledSwing ? .027 + whoa * (.064 + .004 * alarmBeat) : effortMouth ? .017 + effort * .009 : exhausted ? .012 + .018 * breath : .031, .020);
    face.swirls.visible = dizzy > 0;
    const wakeBlink = wake > .69 && wake < .83;
    const eyelidsShut = sleep > .70 || (doze > .27 && doze < .43) || wakeBlink;
    face.closedEyes.visible = eyelidsShut && !dizzy && !surprise;
    for (let i = 0; i < face.eyes.length; i++) {
      const eye = face.eyes[i];
      eye.visible = !dizzy && !face.closedEyes.visible;
      const lid = sleep > 0 ? .037 - .031 * Math.min(1, sleep * 1.8) : time % 3800 > 3690 ? .006 : .037;
      eye.position.x = eye.userData.restX + heldGaze;
      eye.scale.y = surprise ? .052 : heldFace ? .037 - effort * .013 * (1 - whoa) + whoa * .033 : lid + startle * .014;
      if (bracingForImpact) eye.scale.y *= 1 - landingSquash * .56;
      eye.scale.x = .027 + whoa * .012;
      const eyebrowBeat = i === 0 ? Math.sin(reachBeat) : -Math.sin(reachBeat);
      face.brows[i].position.y = surprise ? .047 : heldFace ? .006 + effort * .012 + eyebrowBeat * motion * .005 + whoa * .047 : startle * .022;
      face.brows[i].rotation.z = heldFace ? (i === 0 ? 1 : -1) * (.025 + effort * .175) * (1 - .82 * whoa) : 0;
    }
    const runningRoll = Math.sin(phase) * running * .065;
    figure.arms[0].rotation.z += runningRoll;
    figure.arms[1].rotation.z = .24 + runningRoll;
    figure.torso.rotation.z = runningRoll * .42;
    figure.hips.rotation.z = -runningRoll * .32;
    figure.root.rotation.z = dizzy * Math.sin(time / 170) * .12 - weightShift * .075;
    braceHands(THREE.MathUtils.smoothstep(fatigue, .17, .94));
    figure.neck.rotation.x += sleep * .30 + Math.sin(doze * Math.PI * 2) * doze * .19;
    figure.neck.rotation.z += dizzy * Math.sin(time / 120) * .16 + sleep * .13;
    figure.stars.visible = dizzy > 0;
    figure.stars.rotation.y = time / 440;
    for (let i=0; i<figure.stars.children.length; i++) {
      const star = figure.stars.children[i];
      const angle = i * Math.PI * 2 / 3;
      star.position.set(Math.cos(angle)*.40, .02 + Math.sin(time/260+i)*.02,Math.sin(angle)*.22);
      star.rotation.y = -figure.stars.rotation.y;
    }
    if (wake) {
      figure.neck.rotation.x -= startle * .21;
      figure.neck.rotation.z -= startle * .09;
      figure.hips.position.y += startle * .040;
      figure.arms[0].rotation.z -= startle * .25;
      figure.arms[1].rotation.z += startle * .25;
    }
    if (surprise) {
      figure.hips.rotation.x = -.09;
      figure.neck.rotation.x = -.12;
      figure.arms[0].rotation.z = -1.05;
      figure.arms[1].rotation.z = 1.05;
      figure.arms[0].rotation.x = figure.arms[1].rotation.x = -.45;
      figure.hips.position.y += .035 * Math.sin(Math.min(1,surprise)*Math.PI);
    }
    if (grab > .002) {
      // The torso hangs from the pickup point; the limbs lag behind its sway.
      const sway = Math.sin(time / 230) * grab * motion;
      const looseLeg = Math.sin(time / 240 - .9) * grab * motion;
      const swingFromHand = .045 * sway + dragLean * grab;
      figure.root.rotation.z += swingFromHand;
      figure.root.position.x = Math.sin(swingFromHand) * 1.55;
      figure.torso.rotation.x += dragPitch * .48;
      figure.neck.rotation.z -= dragLean * .46;
      figure.neck.rotation.x -= dragPitch * .24;
      figure.arms[0].rotation.x += dragPitch * .43 + limbPitch * .49 - limbLean * .38;
      figure.arms[1].rotation.x += dragPitch * .43 + limbPitch * .38 + limbLean * .38;
      figure.arms[0].rotation.z -= limbLean * .46;
      figure.arms[1].rotation.z -= limbLean * .39;
      figure.elbows[0].rotation.x -= limbPitch * .52 + limbLean * .28;
      figure.elbows[1].rotation.x -= limbPitch * .43 - limbLean * .28;
      figure.legs[0].rotation.z -= limbLean * .48;
      figure.legs[1].rotation.z -= limbLean * .35;
      figure.legs[0].rotation.x += limbPitch * .56;
      figure.legs[1].rotation.x += limbPitch * .45;
      figure.knees[0].rotation.x += limbPitch * .68 + limbLean * .40;
      figure.knees[1].rotation.x += limbPitch * .53 - limbLean * .40;
      figure.hips.position.y += .165 * grab;
      figure.torso.rotation.x -= .075 * grab;
      figure.neck.rotation.x += .13 * grab;
      figure.neck.rotation.z -= .052 * sway;
      figure.arms[0].rotation.z += .095 * grab - .10 * sway;
      figure.arms[1].rotation.z -= .095 * grab + .08 * sway;
      figure.arms[0].rotation.x += .16 * sway;
      figure.arms[1].rotation.x -= .16 * sway;
      figure.elbows[0].rotation.x -= .12 * grab + .12 * sway;
      figure.elbows[1].rotation.x -= .09 * grab - .10 * sway;
      figure.legs[0].rotation.x += -.12 * grab + .18 * looseLeg;
      figure.legs[1].rotation.x += -.06 * grab - .16 * looseLeg;
      figure.knees[0].rotation.x += .17 * grab + .20 * looseLeg;
      figure.knees[1].rotation.x += .13 * grab - .17 * looseLeg;
      // Reach upward in staggered attempts; the opposite leg counters the reach.
      figure.torso.rotation.z += Math.sin(reachBeat) * effort * .11;
      figure.neck.rotation.x -= effort * .14 + whoa * .10;
      // Strong swings make him brace wide, with smaller reaching motions underneath.
      figure.neck.rotation.z += alarmBeat * .035;
      figure.torso.rotation.x -= whoa * .055;
      for (let i = 0; i < figure.arms.length; i++) {
        const side = i === 0 ? -1 : 1;
        const beat = reachBeat + i * Math.PI;
        const reach = Math.max(0, Math.sin(beat + .55)) ** 1.5;
        const counter = Math.max(0, Math.sin(beat + Math.PI));
        figure.arms[i].rotation.z += side * (whoa * .78 + effort * (.28 + reach * .70) * (1 - whoa * .50));
        figure.arms[i].rotation.x -= effort * (.10 + reach * .48);
        figure.elbows[i].rotation.x -= whoa * .32 + effort * (.23 + reach * .52);
        figure.legs[i].rotation.x -= effort * counter * .28;
        figure.legs[i].rotation.z += side * (whoa * .14 + effort * counter * .095);
        figure.knees[i].rotation.x += effort * counter * .37;
      }
    }
    if (emotion.entrance) {
      const { seat, plant, air, reach, impact, catchStep, hello, waveSwing } = emotion.entrance;
      figure.torso.rotation.x += .31 * plant + .27 * impact;
      figure.torso.rotation.z += .19 * plant - .22 * air - .24 * impact + .16 * catchStep;
      figure.hips.position.y -= .073 * impact + .021 * catchStep;
      figure.neck.rotation.x += .18 * reach - .18 * impact;
      figure.neck.rotation.z -= .12 * plant - .10 * impact;
      figure.neck.rotation.x -= .10 * hello;
      for (let i = 0; i < face.eyes.length; i++) {
        face.eyes[i].scale.y += .009 * hello;
        face.brows[i].position.y += .021 * hello;
      }

      // The left hand props him up while the right arm leads the jump.
      figure.arms[0].rotation.z -= .34 * plant + .37 * air + .47 * impact;
      figure.arms[0].rotation.x += .20 * plant + .36 * air;
      figure.arms[0].scale.y = 1 + .20 * plant;
      figure.elbows[0].rotation.x -= .13 * seat + .21 * impact;
      // Stretch up through the shoulder and sweep the full arm with a soft elbow.
      figure.arms[0].position.x -= .034 * hello;
      figure.arms[0].position.y += .058 * hello;
      figure.arms[0].scale.y += .26 * hello;
      figure.arms[0].rotation.z -= (1.83 + .31 * waveSwing) * hello;
      figure.arms[0].rotation.x += .22 * hello;
      figure.elbows[0].rotation.x -= .10 * hello;
      figure.arms[1].rotation.z += .69 * air + .55 * catchStep;
      figure.arms[1].rotation.x -= .22 * plant + .57 * air + .40 * impact;
      figure.elbows[1].rotation.x -= .23 * seat + .44 * air;

      // The lead foot takes the weight. The trailing foot comes forward to steady him.
      const dangle = Math.sin(time / 124) * .12 * seat;
      figure.legs[0].rotation.x -= 1.40 * seat + .20 * air + .64 * catchStep;
      figure.knees[0].rotation.x += 1.42 * seat + dangle + .72 * air + .38 * impact + .71 * catchStep;
      figure.legs[1].rotation.x -= 1.36 * seat + .51 * air + .23 * reach + .29 * impact;
      figure.knees[1].rotation.x += 1.39 * seat - dangle + .21 * air + .56 * impact;
      figure.legs[1].position.x += .056 * (reach + impact * (1 - reach));
    }
    if (fall > 0 || dropRecovery > 0) {
      // Reach for the ground, absorb the impact, then rock back into balance.
      const reach = fall > 0 ? Math.sin(fall * Math.PI / 2) : 1 - dropRecovery;
      const rock = fall > 0 ? reach * .18 : .18 * (1 - dropRecovery) + .19 * Math.sin(dropRecovery * Math.PI * 2);
      const brace = .38 * reach + .32 * landingSquash;
      figure.torso.rotation.z -= dropDirection * rock;
      figure.torso.rotation.x += .28 * landingSquash;
      figure.neck.rotation.z += dropDirection * rock * .55;
      figure.neck.rotation.x -= .16 * landingSquash;
      figure.hips.position.y -= .043 * landingSquash;
      for (let i = 0; i < figure.legs.length; i++) {
        const side = i === 0 ? -1 : 1;
        const lead = side * dropDirection;
        figure.arms[i].rotation.z += side * brace * (1 + lead * .38);
        figure.arms[i].rotation.x -= .25 * brace;
        figure.elbows[i].rotation.x -= .42 * brace;
        figure.legs[i].position.x += side * (.032 + lead * .024) * reach;
        figure.legs[i].rotation.x -= .24 * landingSquash + (.08 + lead * .11) * reach;
        figure.knees[i].rotation.x += .49 * landingSquash + (.15 - lead * .10) * reach;
      }
    }
    const runContact = running > .76 && halfStride < .84 ? {
      key: 'run-' + Math.floor(phase / Math.PI),
      index: strideCycle < .5 ? 0 : 1,
      progress: halfStride / .84
    } : undefined;
    const walkCycle = (strideCycle + .75) % 1;
    const walkSupport = (walkCycle * 2) % 1;
    const walkContact = running < .42 && stride > .12 && !bracing && grab < .03 && walkSupport < .90 ? {
      key: 'walk-' + Math.floor((phase - Math.PI / 2) / Math.PI),
      index: walkCycle < .5 ? 0 : 1,
      progress: walkSupport / .90
    } : undefined;
    landStep(emotion, swing, runContact ?? walkContact, contactWeight);
    for (let i = 0; i < figure.ankles.length; i++) {
      const legPitch = figure.hips.rotation.x + figure.legs[i].rotation.x + figure.knees[i].rotation.x;
      const ground = (1 - grab) * ((1 - running) * (.55 + .37 * frontWalk) + running * verticalTravel * .86);
      figure.ankles[i].rotation.x = -legPitch * ground + grab * (.075 + limbPitch * .30);
      figure.ankles[i].rotation.z = grab * limbLean * .28;
    }
    renderer.render(scene, camera);
  }
  return { canvas: renderer.domElement, draw };
}
