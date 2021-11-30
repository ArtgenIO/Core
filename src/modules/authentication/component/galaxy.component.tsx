import { useEffect, useRef } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  TextureLoader,
  Vector2,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export default function GalaxyComponent() {
  const mountRef = useRef(null);

  useEffect(() => {
    const textureLoader = new TextureLoader();
    const scene = new Scene();
    const renderer = new WebGLRenderer();

    mountRef.current.appendChild(renderer.domElement);

    const config = {
      count: 70000,
      size: 0.014,
      radius: 5.5,
      branches: 6,
      spin: -2,
      randomness: 8.5,
      randomnessPower: 4.9,
      stars: 18000,
      starColor: '#37393f',
      insideColor: '#2df0b2',
      outsideColor: '#4b21a8',
    };

    const shape = textureLoader.load('/assets/particle.png');

    let bgStarsGeometry = null;
    let bgStarsMaterial = null;
    let bgStars = null;

    if (bgStars !== null) {
      bgStarsGeometry.dispose();
      bgStarsMaterial.dispose();
      scene.remove(bgStars);
    }

    bgStarsGeometry = new BufferGeometry();
    const bgStarsPositions = new Float32Array(config.stars * 3);

    for (let j = 0; j < config.stars; j++) {
      bgStarsPositions[j * 3 + 0] = (Math.random() - 0.5) * 20;
      bgStarsPositions[j * 3 + 1] = (Math.random() - 0.5) * 20;
      bgStarsPositions[j * 3 + 2] = (Math.random() - 0.5) * 20;
    }

    bgStarsGeometry.setAttribute(
      'position',
      new BufferAttribute(bgStarsPositions, 3),
    );

    bgStarsMaterial = new PointsMaterial({
      size: config.size,
      depthWrite: false,
      sizeAttenuation: true,
      blending: AdditiveBlending,
      color: config.starColor,
      transparent: true,
      alphaMap: shape,
    });

    bgStars = new Points(bgStarsGeometry, bgStarsMaterial);

    scene.add(bgStars);

    // Generate the galaxy shape
    let geometry = null;
    let material = null;
    let points = null;

    if (points !== null) {
      geometry.dispose();
      material.dispose();
      scene.remove(points);
    }

    geometry = new BufferGeometry();

    const positions = new Float32Array(config.count * 3);
    const colors = new Float32Array(config.count * 3);

    const colorInside = new Color(config.insideColor);
    const colorOutside = new Color(config.outsideColor);

    for (let i = 0; i < config.count; i++) {
      //Position
      const x = Math.random() * config.radius;
      const branchAngle =
        ((i % config.branches) / config.branches) * 2 * Math.PI;
      const spinAngle = x * config.spin;

      const randomX =
        Math.pow(Math.random(), config.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1);
      const randomY =
        Math.pow(Math.random(), config.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1);
      const randomZ =
        Math.pow(Math.random(), config.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1);

      positions[i * 3] = Math.sin(branchAngle + spinAngle) * x + randomX;
      positions[i * 3 + 1] = randomY;
      positions[i * 3 + 2] = Math.cos(branchAngle + spinAngle) * x + randomZ;

      // Color
      const mixedColor = colorInside.clone();
      mixedColor.lerp(colorOutside, x / config.radius);

      colors[i * 3 + 0] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));

    material = new PointsMaterial({
      color: 'white',
      size: config.size,
      depthWrite: false,
      sizeAttenuation: true,
      blending: AdditiveBlending,
      vertexColors: true,
      transparent: true,
      alphaMap: shape,
    });

    points = new Points(geometry, material);
    scene.add(points);

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const camera = new PerspectiveCamera(70, sizes.width / sizes.height, 1, 50);
    camera.position.x = 5;
    camera.position.y = 2.5;
    camera.position.z = 3;
    camera.lookAt(0, 5, 0);
    scene.add(camera);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const renderScene = new RenderPass(scene, camera);

    const bloomPass = new UnrealBloomPass(
      new Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85,
    );
    bloomPass.threshold = 0.05;
    bloomPass.strength = 1.0;
    bloomPass.radius = -0.25;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    const resizeHandler = () => {
      // Update sizes
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      // Update camera
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      // Update renderer
      renderer.setSize(sizes.width, sizes.height);
      composer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    resizeHandler();

    camera.rotation.x = 5;
    camera.rotation.y = 0.7;

    const animate = () => {
      //Update the camera
      points.rotation.y += 0.0003;
      bgStars.rotation.y += 0.0008;

      // Render
      composer.render();
      // Call tick again on the next frame
      requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeHandler);

    animate();

    return () => {
      window.removeEventListener('resize', resizeHandler);

      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute top-0 left-0 right-0 bottom-0"
    ></div>
  );
}
