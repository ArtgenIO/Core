import { MutableRefObject } from 'react';
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

export const renderGalaxy = (mountRef: MutableRefObject<any>) => {
  const textureLoader = new TextureLoader();
  const scene = new Scene();
  const renderer = new WebGLRenderer();

  mountRef.current.appendChild(renderer.domElement);

  const galaxyConfig = {
    count: 70000,
    size: 0.014,
    radius: 5.5,
    branches: 6,
    spin: -2,
    randomness: 8.5,
    randomnessPower: 4.9,
    stars: 1000,
    starColor: '#cccccc',
    insideColor: '#f55726',
    outsideColor: '#8100ff',
  };

  const shape = textureLoader.load('/assets/particle.png');

  const bgStarsGeometry = new BufferGeometry();
  const bgStarsPositions = new Float32Array(galaxyConfig.stars * 3);

  // Scatter white stars around
  for (let i = 0; i < galaxyConfig.stars; i++) {
    bgStarsPositions[i * 3 + 0] = (Math.random() - 0.5) * 20;
    bgStarsPositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    bgStarsPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }

  bgStarsGeometry.setAttribute(
    'position',
    new BufferAttribute(bgStarsPositions, 3),
  );

  const bgStarsMaterial = new PointsMaterial({
    size: galaxyConfig.size,
    depthWrite: false,
    sizeAttenuation: true,
    blending: AdditiveBlending,
    color: galaxyConfig.starColor,
    transparent: true,
    alphaMap: shape,
  });
  const bgStars = new Points(bgStarsGeometry, bgStarsMaterial);

  scene.add(bgStars);

  // Generate the galaxy shape
  const geometry = new BufferGeometry();
  const positions = new Float32Array(galaxyConfig.count * 3);
  const colors = new Float32Array(galaxyConfig.count * 3);

  const colorInside = new Color(galaxyConfig.insideColor);
  const colorOutside = new Color(galaxyConfig.outsideColor);

  for (let i = 0; i < galaxyConfig.count; i++) {
    // Position
    const x = Math.random() * galaxyConfig.radius;
    const branchAngle =
      ((i % galaxyConfig.branches) / galaxyConfig.branches) * 2 * Math.PI;
    const spinAngle = x * galaxyConfig.spin;

    const randomX =
      Math.pow(Math.random(), galaxyConfig.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomY =
      Math.pow(Math.random(), galaxyConfig.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomZ =
      Math.pow(Math.random(), galaxyConfig.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);

    positions[i * 3] = Math.sin(branchAngle + spinAngle) * x + randomX;
    positions[i * 3 + 1] = randomY;
    positions[i * 3 + 2] = Math.cos(branchAngle + spinAngle) * x + randomZ;

    // Color
    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, x / galaxyConfig.radius);

    colors[i * 3 + 0] = mixedColor.r;
    colors[i * 3 + 1] = mixedColor.g;
    colors[i * 3 + 2] = mixedColor.b;
  }

  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('color', new BufferAttribute(colors, 3));

  const material = new PointsMaterial({
    color: 'white',
    size: galaxyConfig.size,
    depthWrite: false,
    sizeAttenuation: true,
    blending: AdditiveBlending,
    vertexColors: true,
    transparent: true,
    alphaMap: shape,
  });

  const points = new Points(geometry, material);
  scene.add(points);

  const windowSizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const camera = new PerspectiveCamera(
    70,
    windowSizes.width / windowSizes.height,
    1,
    50,
  );
  camera.position.x = 5;
  camera.position.y = 2.5;
  camera.position.z = 3;
  camera.lookAt(0, 5, 0);
  scene.add(camera);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  renderer.setSize(windowSizes.width, windowSizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const renderScene = new RenderPass(scene, camera);

  const bloomPass = new UnrealBloomPass(
    new Vector2(window.innerWidth, window.innerHeight),
    8.5,
    0.4,
    0.85,
  );
  bloomPass.threshold = 0.05;
  bloomPass.strength = 1.2;
  bloomPass.radius = -0.25;

  const composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  const resizeHandler = () => {
    // Update sizes
    windowSizes.width = window.innerWidth;
    windowSizes.height = window.innerHeight;

    // Update camera
    camera.aspect = windowSizes.width / windowSizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(windowSizes.width, windowSizes.height);
    composer.setSize(windowSizes.width, windowSizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  resizeHandler();

  camera.rotation.x = 5;
  camera.rotation.y = 0.7;

  let handle: number;
  let frameCount: number = 0;

  const animate = () => {
    frameCount++;

    // Rotate the stars
    points.rotation.y += 0.0003;
    bgStars.rotation.y -= 0.0018;

    // Move around with the camera
    const offsetX = (frameCount % (400 * 15)) / (80 * 15);
    const moveX = (offsetX < 2.5 ? offsetX : 5 - offsetX) * 0.5;

    const offsetY = (frameCount % (1600 * 7)) / (320 * 7);
    const moveY = (offsetY < 2.5 ? offsetY : 5 - offsetY) * 1.5;

    camera.position.x = 5 + moveX;
    camera.rotation.x = 5 + moveX * 0.25;
    camera.position.y = 2.5 + moveY * 0.5;
    camera.rotation.y = 0.7 - moveY * 0.02;

    // Render
    composer.render();
    // Call tick again on the next frame
    handle = requestAnimationFrame(animate);
  };

  return {
    start: () => {
      window.addEventListener('resize', resizeHandler);
      animate();
    },
    doCancel: () => {
      window.removeEventListener('resize', resizeHandler);

      if (handle) cancelAnimationFrame(handle);

      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    },
  };
};
