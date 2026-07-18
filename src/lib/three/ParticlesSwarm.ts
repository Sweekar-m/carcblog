import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export class ParticlesSwarm {
  public count: number;
  public container: HTMLElement;
  public speedMult: number;

  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private dummy: THREE.Object3D;
  private color: THREE.Color;
  private target: THREE.Vector3;
  private pColor: THREE.Color;
  private geometry: THREE.SphereGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.InstancedMesh;
  private positions: THREE.Vector3[];
  private clock: THREE.Clock;

  private stopped: boolean = false;
  private animationFrameId: number | null = null;
  private handleResize: () => void;

  constructor(container: HTMLElement, count = 1800) {
    this.container = container;
    this.speedMult = 0.85;

    // Detect mobile or low performance
    const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || (navigator.hardwareConcurrency || 4) <= 4);
    this.count = isMobile ? 600 : count;

    // SETUP
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000000, 0.01);
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
    this.camera.position.set(0, 0, 100);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance", alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0.0); // Transparent clear color
    this.container.appendChild(this.renderer.domElement);

    // OBJECTS
    this.dummy = new THREE.Object3D();
    this.color = new THREE.Color();
    this.target = new THREE.Vector3();
    this.pColor = new THREE.Color();

    this.geometry = new THREE.SphereGeometry(0.22, 8, 8);
    this.material = new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vColor;
        void main() {
            vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
            vNormal = normalize(normalMatrix * normal);
            vViewPosition = -mvPosition.xyz;
            vColor = instanceColor;
            gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vColor;
        void main() {
            float fresnel = dot(vNormal, normalize(vViewPosition));
            fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
            fresnel = pow(fresnel, 4.0); // Sharper specular edge highlight
            vec3 specular = vec3(0.32) * fresnel; // Wet obsidian glancing reflection
            vec3 col = vColor + specular; 
            gl_FragColor = vec4(col, 0.35 + fresnel * 0.45);
        }
      `,
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false
    });

    this.mesh = new THREE.InstancedMesh(this.geometry, this.material, this.count);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.mesh);

    this.positions = [];
    for (let i = 0; i < this.count; i++) {
      this.positions.push(new THREE.Vector3((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100));
      this.mesh.setColorAt(i, this.color.setHex(0x00ff88));
    }

    this.clock = new THREE.Clock();

    // RESIZE EVENT HANDLER
    this.handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };
    window.addEventListener('resize', this.handleResize);

    this.animate = this.animate.bind(this);
    this.animate();
  }

  animate() {
    if (this.stopped) return;
    this.animationFrameId = requestAnimationFrame(this.animate);
    
    const time = this.clock.getElapsedTime() * this.speedMult;

    if (this.material.uniforms && this.material.uniforms.uTime) {
      this.material.uniforms.uTime.value = time;
    }

    // Parameters control
    const PARAMS: { [key: string]: number } = {
      "macroRadius": 50,
      "microRadius": 15,
      "pLoops": 2,
      "qTwists": 5,
      "blocks": 350,
      "length": 7,
      "size": 2.5,
      "stagger": 4,
      "twist": 1.5,
      "flow": 0.3
    };

    const addControl = (id: string, _l: string, _min: number, _max: number, val: number) => {
      return PARAMS[id] !== undefined ? PARAMS[id] : val;
    };

    const count = this.count; // Alias for calculations

    for (let i = 0; i < this.count; i++) {
      const target = this.target;
      const color = this.pColor;

      const R = addControl("macroRadius", "Macro Radius", 10, 100, 50);
      const r = addControl("microRadius", "Micro Radius", 5, 50, 15);
      const P = Math.floor(addControl("pLoops", "Knot P Loops", 1, 10, 2));
      const Q = Math.floor(addControl("qTwists", "Knot Q Twists", 1, 10, 5));
      const numBlocks = Math.floor(addControl("blocks", "Num Blocks", 10, 800, 350));
      const pLen = addControl("length", "Block Length", 1, 30, 7.0);
      const pSize = addControl("size", "Block Size", 0.5, 10, 2.5);
      const stagger = addControl("stagger", "Track Stagger", 0, 15, 4.0);
      const extraTwist = addControl("twist", "Bundle Twist", 0, 10, 1.5);
      const flow = addControl("flow", "Energy Flow", -2, 2, 0.3);

      const stardustRatio = 0.10;
      const numStardust = count * stardustRatio;

      const gRx = time * 0.11;
      const gRy = time * 0.17;
      const cgx = Math.cos(gRx), sgx = Math.sin(gRx);
      const cgx_y = Math.cos(gRy), sgx_y = Math.sin(gRy);

      if (i < numStardust) {
        const raw1 = Math.sin(i * 11.11) * 43758.54;
        const sd1 = raw1 - Math.floor(raw1);
        const raw2 = Math.cos(i * 22.22) * 43758.54;
        const sd2 = raw2 - Math.floor(raw2);
        const raw3 = Math.sin(i * 33.33) * 43758.54;
        const sd3 = raw3 - Math.floor(raw3);

        const radiusDist = R * 1.2 + sd1 * 80.0;
        const theta = sd2 * Math.PI * 2.0;
        const phi = Math.acos(sd3 * 2.0 - 1.0);

        const driftX = Math.sin(time * 0.2 + i * 0.1) * 10.0;
        const driftY = Math.cos(time * 0.25 + i * 0.1) * 10.0;
        const driftZ = Math.sin(time * 0.15 + i * 0.2) * 10.0;

        const sx = radiusDist * Math.sin(phi) * Math.cos(theta) + driftX;
        const sy = radiusDist * Math.sin(phi) * Math.sin(theta) + driftY;
        const sz = radiusDist * Math.cos(phi) + driftZ;

        const y1 = sy * cgx - sz * sgx;
        const z1 = sy * sgx + sz * cgx;
        const x2 = sx * cgx_y + z1 * sgx_y;
        const y2 = y1;
        const z2 = -sx * sgx_y + z1 * cgx_y;

        target.set(x2, y2, z2);

        const twinkle = Math.pow((Math.sin(time * 3.0 + i) + 1.0) * 0.5, 8.0);
        color.setHSL(0.6, 0.2, 0.08 + sd2 * 0.1 + twinkle * 0.05);
      } else {
        const remainingCount = count - numStardust;
        const iRem = i - numStardust;

        const blocksSafe = Math.max(1, numBlocks);
        const ppb = remainingCount / blocksSafe;
        const blockId = Math.floor(iRem / ppb);
        const localId = iRem - blockId * ppb;

        const wireRatio = 0.85;
        const numWire = ppb * wireRatio;
        const isWire = localId < numWire;

        const tBase = (blockId / blocksSafe) * Math.PI * 2.0;
        const t = tBase + time * flow * 0.1;

        const cosQt = Math.cos(Q * t);
        const sinQt = Math.sin(Q * t);
        const cosPt = Math.cos(P * t);
        const sinPt = Math.sin(P * t);

        const px = (R + r * cosQt) * cosPt;
        const py = (R + r * cosQt) * sinPt;
        const pz = r * sinQt;

        let tx = -P * (R + r * cosQt) * sinPt - Q * r * sinQt * cosPt;
        let ty = P * (R + r * cosQt) * cosPt - Q * r * sinQt * sinPt;
        let tz = Q * r * cosQt;
        const tLen = Math.sqrt(tx * tx + ty * ty + tz * tz) + 0.0001;
        tx /= tLen; ty /= tLen; tz /= tLen;

        const nx_torus = cosPt;
        const ny_torus = sinPt;
        const nz_torus = 0.0;

        let bx = ty * nz_torus - tz * ny_torus;
        let by = tz * nx_torus - tx * nz_torus;
        let bz = tx * ny_torus - ty * nx_torus;
        const bLen = Math.sqrt(bx * bx + by * by + bz * bz) + 0.0001;
        bx /= bLen; by /= bLen; bz /= bLen;

        let nx = by * tz - bz * ty;
        let ny = bz * tx - bx * tz;
        let nz = bx * ty - by * tx;

        const twistAngle = tBase * extraTwist + time * flow * 0.5;
        const cosTw = Math.cos(twistAngle);
        const sinTw = Math.sin(twistAngle);

        const fnx = nx * cosTw - bx * sinTw;
        const fny = ny * cosTw - by * sinTw;
        const fnz = nz * cosTw - bz * sinTw;

        const fbx = nx * sinTw + bx * cosTw;
        const fby = ny * sinTw + by * cosTw;
        const fbz = nz * sinTw + bz * cosTw;

        const track = blockId % 4;
        const c1 = track % 2 === 0 ? 1.0 : -1.0;
        const c2 = Math.floor(track / 2) === 0 ? 1.0 : -1.0;

        const cx = px + fnx * c1 * stagger + fbx * c2 * stagger;
        const cy = py + fny * c1 * stagger + fby * c2 * stagger;
        const cz = pz + fnz * c1 * stagger + fbz * c2 * stagger;

        let lx = 0.0, ly = 0.0, lz = 0.0;
        let u = 0.0;

        if (isWire) {
          const edgePosRaw = (localId / numWire) * 12.0;
          const edgeId = Math.min(11, Math.floor(edgePosRaw));
          u = (edgePosRaw - edgeId) * 2.0 - 1.0;

          const axis = edgeId % 3;
          const corner = Math.floor(edgeId / 3);
          const e1 = (corner % 2 === 0) ? -1.0 : 1.0;
          const e2 = (Math.floor(corner / 2) === 0) ? -1.0 : 1.0;

          if (axis === 0) { lx = u; ly = e1; lz = e2; }
          else if (axis === 1) { lx = e1; ly = u; lz = e2; }
          else { lx = e1; ly = e2; lz = u; }
        } else {
          const rawS1 = Math.sin(localId * 12.989 + blockId * 78.233) * 43758.545;
          const rawS2 = Math.cos(localId * 39.346 + blockId * 53.211) * 43758.545;
          const rawS3 = Math.sin(localId * 73.156 + blockId * 12.742) * 43758.545;
          const rawS4 = Math.cos(localId * 23.456 + blockId * 89.123) * 43758.545;

          const s1 = rawS1 - Math.floor(rawS1);
          const s2 = rawS2 - Math.floor(rawS2);
          const s3 = rawS3 - Math.floor(rawS3);
          const s4 = rawS4 - Math.floor(rawS4);

          const faceAxis = Math.min(2, Math.floor(s1 * 3.0));
          const signFace = s2 > 0.5 ? 1.0 : -1.0;
          const u2 = s3 * 2.0 - 1.0;
          const v2 = s4 * 2.0 - 1.0;

          u = 0.0;

          if (faceAxis === 0) { lx = signFace; ly = u2; lz = v2; }
          else if (faceAxis === 1) { lx = u2; ly = signFace; lz = v2; }
          else { lx = u2; ly = v2; lz = signFace; }
        }

        lx *= pLen;
        ly *= pSize;
        lz *= pSize;

        const fx = cx + lx * tx + ly * fnx + lz * fbx;
        const fy = cy + lx * ty + ly * fny + lz * fby;
        const fz = cz + lx * tz + ly * fnz + lz * fbz;

        const y1 = fy * cgx - fz * sgx;
        const z1 = fy * sgx + fz * cgx;
        const x2 = fx * cgx_y + z1 * sgx_y;
        const y2 = y1;
        const z2 = -fx * sgx_y + z1 * cgx_y;

        target.set(x2, y2, z2);

        const trackOffset = (track / 4.0) * 0.05;
        const hue = 0.58 + trackOffset + Math.sin(tBase * P * 2.0 + time) * 0.02;

        const noiseVal = Math.sin(blockId * 11.23 + localId * 4.56) * 0.5 + 0.5;
        let sat = isWire ? 0.25 : 0.15;
        let lit = 0.08 + noiseVal * 0.08;

        if (isWire) {
          const pulseEnv = Math.sin(tBase * P * 12.0 - time * 5.0);
          if (pulseEnv > 0.8) {
            lit += (pulseEnv - 0.8) * 1.5;
            sat += 0.35;
          }

          const isCorner = Math.abs(u) > 0.90 ? 1.0 : 0.0;
          lit += isCorner * 0.1;
          sat += isCorner * 0.15;
        }

        color.setHSL(hue % 1.0, Math.min(1.0, Math.max(0.0, sat)), Math.min(1.0, Math.max(0.0, lit)));
      }

      // UPDATE
      this.positions[i].lerp(this.target, 0.1);
      this.dummy.position.copy(this.positions[i]);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
      this.mesh.setColorAt(i, color);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) {
      this.mesh.instanceColor.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stopped = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.handleResize);

    this.geometry.dispose();
    this.material.dispose();
    this.scene.remove(this.mesh);
    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
