import React, { useEffect } from 'react';

export default function IntroAnimax({ onSkip }) {
  useEffect(() => {
    const timer = setTimeout(onSkip, 12000); // 12 segundos épicos
    return () => clearTimeout(timer);
  }, [onSkip]);

  useEffect(() => {
    const container = document.createElement('div');
    container.id = 'three-container';
    container.style.position = 'fixed';
    container.style.inset = '0';
    container.style.zIndex = '9999';
    container.style.background = '#000';
    document.body.appendChild(container);

    const script = document.createElement('script');
    script.type = 'module';
    script.innerHTML = `
      import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js';

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      scene.fog = new THREE.FogExp2(0x000000, 0.001);

      const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 5, 30);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      document.getElementById('three-container').appendChild(renderer.domElement);

      const light = new THREE.DirectionalLight(0xffffff, 1.5);
      light.position.set(10, 20, 10);
      scene.add(light);
      scene.add(new THREE.AmbientLight(0x404040));

      // Montaña oscura
      const mountain = new THREE.Mesh(new THREE.ConeGeometry(25, 40, 32), new THREE.MeshBasicMaterial({ color: 0x111111 }));
      mountain.position.y = -20;
      scene.add(mountain);

      // Árbol creciendo
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 12, 8), new THREE.MeshBasicMaterial({ color: 0x8B4513 }));
      trunk.position.y = 6;
      tree.add(trunk);
      const leaves = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 16), new THREE.MeshBasicMaterial({ color: 0x228B22 }));
      leaves.position.y = 15;
      tree.add(leaves);
      tree.scale.y = 0;
      scene.add(tree);

      // Pétalos cayendo (200 pétalos rosas)
      const petalCount = 200;
      const petalGeometry = new THREE.PlaneGeometry(0.8, 1.5);
      const petalMaterial = new THREE.MeshBasicMaterial({ color: 0xff69b4, side: THREE.DoubleSide });
      const petals = new THREE.InstancedMesh(petalGeometry, petalMaterial, petalCount);
      const dummy = new THREE.Object3D();
      for (let i = 0; i < petalCount; i++) {
        dummy.position.set(
          Math.random() * 60 - 30,
          Math.random() * 30 + 20,
          Math.random() * 60 - 30
        );
        dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        dummy.updateMatrix();
        petals.setMatrixAt(i, dummy.matrix);
      }
      petals.userData.velocity = new Array(petalCount).fill().map(() => Math.random() * 0.05 + 0.02);
      scene.add(petals);

      // Logo ANIMAX morph a flor
      const loader = new THREE.FontLoader();
      loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
        const textGeometry = new THREE.TextGeometry('ANIMAX', {
          font: font,
          size: 8,
          depth: 2,
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xff1493 });
        const animaxText = new THREE.Mesh(textGeometry, textMaterial);
        animaxText.position.set(-20, 0, 0);
        animaxText.scale.set(0, 0, 0);
        scene.add(animaxText);

        animaxText.userData.morph = (t) => {
          if (t > 5) {
            const progress = Math.min(1, (t - 5) / 3);
            animaxText.scale.setScalar(progress);
            animaxText.rotation.y = progress * Math.PI * 2;
            animaxText.material.color.setRGB(1 - progress * 0.5, progress * 0.5, 1);
          }
        };
      });

      const clock = new THREE.Clock();

      function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        // Árbol creciendo
        tree.scale.y = Math.min(1, t * 0.2);

        // Pétalos cayendo
        for (let i = 0; i < petalCount; i++) {
          petals.getMatrixAt(i, dummy.matrix);
          dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
          dummy.position.y -= petals.userData.velocity[i];
          if (dummy.position.y < -10) dummy.position.y = 40;
          dummy.rotation.z += 0.01;
          dummy.updateMatrix();
          petals.setMatrixAt(i, dummy.matrix);
        }
        petals.instanceMatrix.needsUpdate = true;

        // Camera zoom suave
        camera.position.z = 30 - t * 2;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      }
      animate();

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    `;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(container);
      document.body.removeChild(script);
    };
  }, []);

  return (
    <button
      onClick={onSkip}
      className="absolute bottom-20 right-10 z-[99999] bg-pink-600 hover:bg-pink-700 px-16 py-8 rounded-full text-3xl font-bold text-white shadow-2xl transition-all"
    >
      SKIP INTRO →
    </button>
  );