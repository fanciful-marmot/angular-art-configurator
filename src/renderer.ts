import {
    Color,
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    Mesh,
    MeshPhysicalMaterial,
    HemisphereLight,
    CubeTextureLoader,
    DoubleSide,
    Vector3,
    DirectionalLight,
} from 'three';
import {
    OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js';
import { CutBlock } from './geometry/CutBlock';

class Renderer {
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    resizeObserver: ResizeObserver;
    controls: OrbitControls;

    animationFrameId: number;
    needsRender: boolean = true;

    constructor(canvas: HTMLCanvasElement) {
        const { width, height } = canvas.getBoundingClientRect();

        this.scene = new Scene();
        this.scene.background = new Color(0xd7cbb1);
        this.camera = new PerspectiveCamera(75, width / height, 0.1, 100);

        this.renderer = new WebGLRenderer({
            context: canvas.getContext('webgl2'),
            alpha: false,
            antialias: true,
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;

        this.resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
            const entry = entries.find((value) => value.target === canvas);

            if (entry) {
                const { width, height } = entry.contentRect;
                this.renderer.setSize(width, height);
                this.renderer.setPixelRatio(window.devicePixelRatio);

                canvas.width = width * window.devicePixelRatio;
                canvas.height = height * window.devicePixelRatio;

                this.camera.aspect = width / height;
                this.camera.updateProjectionMatrix();

                this.renderer.render(this.scene, this.camera);
            }
        });
        this.resizeObserver.observe(canvas, { box: 'device-pixel-content-box' });

        const render = () => {
            this.animationFrameId = requestAnimationFrame(render)

            if (this.needsRender) {
                this.renderer.render(this.scene, this.camera);
                this.needsRender = false;
            }
        };
        this.animationFrameId = requestAnimationFrame(render);

        // Setup controls
        this.controls = new OrbitControls(this.camera, canvas);
        this.controls.update();
        this.controls.addEventListener('change', () => {
            this.needsRender = true;
        });

        // Add lighting
        const hemispherelight = new HemisphereLight(0xffffff, 0xffffff, 2);
        const dirLight = new DirectionalLight(0xffffff, 1);
        dirLight.position.set(-20, 20, -20);
        dirLight.lookAt(new Vector3());

        const material = new MeshPhysicalMaterial({ color: 0xffffff, side: DoubleSide });

        new CubeTextureLoader()
            .setPath('resources/skydome/')
            .load([
                'px.jpg',
                'nx.jpg',
                'py.jpg',
                'ny.jpg',
                'pz.jpg',
                'nz.jpg'
            ], (data) => {
                this.scene.background = data;
                material.envMap = data;
                hemispherelight.intensity = 1;
                this.needsRender = true;
            });

        this.scene.add(hemispherelight);
        this.scene.add(dirLight);

        const gridWidth = 10;
        const gridHeight = 20;
        for (let x = 0; x < gridWidth; x++) {
            for (let z = 0; z < gridHeight; z++) {
                const geometry = new CutBlock({
                    baseHeight: 0.1,
                    cutAngle: Math.random() * 20 + 15,
                });
                const block = new Mesh(geometry, material);

                block.position.x = x - gridWidth / 2;
                block.position.z = z - gridHeight / 2;

                // Rotation
                const turns = Math.floor(Math.random() * 4);
                block.rotateOnAxis(new Vector3(0, 1, 0), turns * Math.PI / 2);

                this.scene.add(block);
            }
        }

        this.camera.position.z = 5;
    }

    destroy() {
        this.resizeObserver.disconnect();
        this.renderer.dispose();
        cancelAnimationFrame(this.animationFrameId);
    }

    render() {
        this.needsRender = true;
    }
}

export { Renderer };
