import { Component, DestroyRef, ElementRef, afterNextRender, inject, output, viewChild } from '@angular/core';
import { prefersReducedMotion } from '../../core/browser';

/**
 * 3D-модель зуба (Three.js). Завантажується ліниво через @defer і лише в браузері.
 * Процедурна геометрія: коронка з горбками й фісурою, шийка та три корені.
 */
@Component({
  selector: 'app-tooth-scene',
  host: { class: 'absolute inset-0 block' },
  template: `<canvas #canvas class="h-full w-full" aria-hidden="true"></canvas>`,
})
export class ToothScene {
  readonly ready = output<void>();
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      let dispose: (() => void) | undefined;
      let destroyed = false;
      destroy.onDestroy(() => {
        destroyed = true;
        dispose?.();
      });
      void this.setup().then((d) => {
        if (destroyed) d?.();
        else dispose = d;
      });
    });
  }

  private async setup(): Promise<(() => void) | undefined> {
    const canvas = this.canvas().nativeElement;
    if (!canvas.getContext('webgl2') && !canvas.getContext('webgl')) return undefined;

    const THREE = await import('three');
    const reduce = prefersReducedMotion();
    const mobile = matchMedia('(max-width: 1023px), (pointer: coarse)').matches;
    const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    // Карта відбиттів — дорога операція; на мобільних замінюємо її півсферним світлом
    const pmrem = mobile ? null : new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem?.fromScene(new RoomEnvironment(), 0.04).texture ?? null;
    scene.environment = envTexture;
    if (mobile) scene.add(new THREE.HemisphereLight('#ffffff', '#bfe9e3', 1.6));

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 0.25, 7.2);

    // ── Геометрія коронки ──
    const crownGeo = new THREE.SphereGeometry(1, mobile ? 96 : 140, mobile ? 72 : 110);
    const pos = crownGeo.attributes['position'] as InstanceType<typeof THREE.BufferAttribute>;
    const v = new THREE.Vector3();
    const smooth = (a: number, b: number, x: number) => {
      const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };
    const cusps = [0.785, 2.356, 3.927, 5.498].map((a) => [Math.cos(a) * 0.5, Math.sin(a) * 0.46]);
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      let { x, y, z } = v;
      // «кубічніша» форма корінного зуба
      const r = Math.hypot(x, z) || 1e-6;
      const squareness = 1 + 0.1 * Math.abs(Math.sin(2 * Math.atan2(z, x)));
      x = (x / r) * Math.min(r * squareness, 1.08) * 1.0;
      z = (z / r) * Math.min(r * squareness, 1.08) * 0.92;
      y *= 0.78;
      // звуження до шийки
      const neck = 1 - 0.24 * smooth(-0.1, -0.78, y);
      x *= neck;
      z *= neck;
      // жувальна поверхня: горбки та фісури
      if (y > 0.2) {
        const top = smooth(0.2, 0.75, y);
        let h = 0;
        for (const [cx, cz] of cusps) h += 0.15 * Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / 0.09);
        h -= 0.12 * Math.exp(-(x * x + z * z) / 0.06);
        h -= 0.05 * Math.exp(-(z * z) / 0.006) * smooth(0.6, 0.1, Math.abs(x));
        h -= 0.05 * Math.exp(-(x * x) / 0.006) * smooth(0.6, 0.1, Math.abs(z));
        y += h * top;
      }
      pos.setXYZ(i, x, y, z);
    }
    crownGeo.computeVertexNormals();

    const enamel = new THREE.MeshPhysicalMaterial({
      color: '#f6fbfa',
      roughness: 0.22,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      sheen: 1,
      sheenRoughness: 0.45,
      sheenColor: new THREE.Color('#bdf5ee'),
      iridescence: 0.35,
      iridescenceIOR: 1.3,
    });

    const tooth = new THREE.Group();
    const crown = new THREE.Mesh(crownGeo, enamel);
    crown.position.y = 0.55;
    tooth.add(crown);

    // ── Корені ──
    const rootMat = enamel.clone();
    rootMat.color = new THREE.Color('#eef3ef');
    rootMat.iridescence = 0.15;
    const roots: [number, number, number][] = [
      [-0.36, 0.1, 0.12],
      [0.36, -0.1, -0.1],
      [0.02, 0.0, 0.26],
    ];
    for (const [rx, tilt, rz] of roots) {
      const g = new THREE.CylinderGeometry(0.3, 0.06, 1.9, 40, 30, false);
      const rp = g.attributes['position'] as InstanceType<typeof THREE.BufferAttribute>;
      for (let i = 0; i < rp.count; i++) {
        v.fromBufferAttribute(rp, i);
        const t = (0.95 - v.y) / 1.9; // 0 зверху → 1 на кінчику
        v.x += Math.sin(t * 1.4) * 0.22 * Math.sign(rx || 1); // легкий вигин
        rp.setXYZ(i, v.x, v.y, v.z);
      }
      g.computeVertexNormals();
      const root = new THREE.Mesh(g, rootMat);
      root.position.set(rx, -0.62, rz);
      root.rotation.z = tilt;
      tooth.add(root);
    }
    tooth.rotation.set(0.18, -0.5, 0.06);
    tooth.position.y = 0.15;
    scene.add(tooth);

    // ── Світло ──
    scene.add(new THREE.AmbientLight('#ffffff', 0.35));
    const key = new THREE.DirectionalLight('#ffffff', 1.6);
    key.position.set(3, 5, 4);
    scene.add(key);
    const rim = new THREE.PointLight('#14b8a6', 18, 12, 2);
    rim.position.set(-2.5, 1.5, -2.5);
    scene.add(rim);

    // ── Ореол позаду ──
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = glowCanvas.height = 256;
    const ctx = glowCanvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(127,245,230,0.55)');
    grad.addColorStop(0.45, 'rgba(20,184,166,0.18)');
    grad.addColorStop(1, 'rgba(20,184,166,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    const glowTex = new THREE.CanvasTexture(glowCanvas);
    const halo = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 6),
      new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    halo.position.z = -2;
    scene.add(halo);

    // ── Кільце сканера ──
    const ringMat = new THREE.MeshBasicMaterial({ color: '#7ff5e6', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.012, 12, 180), ringMat);
    ring.rotation.x = Math.PI / 2;
    const discMat = new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const disc = new THREE.Mesh(new THREE.CircleGeometry(1.4, 64), discMat);
    disc.rotation.x = -Math.PI / 2;
    const scanner = new THREE.Group();
    scanner.add(ring, disc);
    scene.add(scanner);

    // ── Розмір ──
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = this.host.nativeElement;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) renderer.render(scene, camera);
    });
    ro.observe(this.host.nativeElement);
    resize();

    // ── Взаємодія: курсор і скрол ──
    const pointer = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / innerWidth) * 2 - 1;
      pointer.y = (e.clientY / innerHeight) * 2 - 1;
    };
    if (!reduce) window.addEventListener('pointermove', onPointer, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(this.host.nativeElement);

    const clock = new THREE.Timer();
    let raf = 0;
    let spin = -0.5;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      clock.update();
      const t = clock.getElapsed();
      const dt = Math.min(clock.getDelta(), 0.05);
      const scroll = Math.min(scrollY / innerHeight, 1.5);
      spin += dt * 0.22;
      const targetY = spin + scroll * 1.6 + pointer.x * 0.35;
      tooth.rotation.y += (targetY - tooth.rotation.y) * 0.06;
      tooth.rotation.x += (0.18 + pointer.y * 0.18 - tooth.rotation.x) * 0.06;
      tooth.position.y = 0.15 + Math.sin(t * 0.7) * 0.05;

      // прохід сканера кожні 7 секунд
      const cycle = (t % 7) / 7;
      const pass = Math.min(1, cycle / 0.42);
      scanner.position.y = 1.35 - pass * 3.2;
      const fade = cycle < 0.42 ? Math.sin(pass * Math.PI) : 0;
      ringMat.opacity = fade * 0.95;
      discMat.opacity = fade * 0.35;
      renderer.render(scene, camera);
    };

    if (reduce) {
      renderer.render(scene, camera);
    } else {
      clock.connect(document);
      loop();
    }
    this.ready.emit();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
      clock.dispose();
      scene.traverse((o) => {
        const mesh = o as InstanceType<typeof THREE.Mesh>;
        mesh.geometry?.dispose();
      });
      enamel.dispose();
      rootMat.dispose();
      ringMat.dispose();
      discMat.dispose();
      glowTex.dispose();
      envTexture?.dispose();
      pmrem?.dispose();
      renderer.dispose();
    };
  }
}
