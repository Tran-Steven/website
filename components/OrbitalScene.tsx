import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import styles from "../styles/OrbitalScene.module.css";

const OrbitalScene = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0.2, 7.5);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    const keyLight = new THREE.DirectionalLight(0xff8a3d, 4);
    keyLight.position.set(3, 4, 5);
    const rimLight = new THREE.PointLight(0x147cff, 7, 12);
    rimLight.position.set(-4, -1, 3);
    scene.add(ambientLight, keyLight, rimLight);

    const group = new THREE.Group();
    scene.add(group);

    const loader = new GLTFLoader();
    loader.load("/orangecat.glb", (gltf) => {
      const model = gltf.scene;
      model.scale.setScalar(0.95);
      model.position.y = -0.6;
      model.rotation.y = -0.45;
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0xf47732,
            roughness: 0.42,
            metalness: 0.2,
            emissive: 0x341105,
            emissiveIntensity: 0.35,
          });
        }
      });

      model.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(model);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      const blackMaterial = new THREE.MeshStandardMaterial({
        color: 0x090909,
        roughness: 0.35,
        metalness: 0.05,
      });

      model.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const voxelPosition = model.worldToLocal(child.getWorldPosition(new THREE.Vector3()));
        const isUpperFace = voxelPosition.y > center.y + size.y * 0.04;
        const isFrontOrBack = Math.abs(voxelPosition.z - center.z) > size.z * 0.2;
        const isEyeArea = Math.abs(voxelPosition.x - center.x) < size.x * 0.38;
        if (isUpperFace && isFrontOrBack && isEyeArea) child.material = blackMaterial;
      });

      group.add(model);
    });

    const resize = () => {
      const { clientWidth, clientHeight } = canvas;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);

    let frame = 0;
    const animate = () => {
      group.rotation.y += 0.0025;
      group.rotation.x += (pointer.y * 0.08 - group.rotation.x) * 0.02;
      group.position.x += (pointer.x * 0.12 - group.position.x) * 0.02;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
          else object.material.dispose();
        }
      });
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-label="Interactive 3D orange cat scene" />;
};

export default OrbitalScene;
