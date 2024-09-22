import {
    Color,
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    Mesh,
    MeshPhysicalMaterial,
    HemisphereLight,
    CubeTextureLoader,
    Vector3,
    DirectionalLight,
    Material,
    CubeTexture,
} from 'three';
import {
    OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js';
import { CutBlockGeometry } from './geometry/CutBlockGeometry';
import { generateGrid, GridConfig, BlockConfig, BlockGrid } from './gridGenerator';

class Renderer {
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    resizeObserver: ResizeObserver;
    controls: OrbitControls;

    blockMaterial: MeshPhysicalMaterial;
    blocks: Mesh<CutBlockGeometry, MeshPhysicalMaterial>[] = [];
    envMap: CubeTexture | null = null;
    grid: BlockGrid;

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
                this.envMap = data;
                this.scene.background = data;
                this.blocks.forEach(block => block.material.envMap = this.envMap);
                hemispherelight.intensity = 1;
                this.needsRender = true;
            });

        this.scene.add(hemispherelight);
        this.scene.add(dirLight);

        this.configureGrid(
            {
                size: [10, 20],
                colorStops: [0xffffff],
                borderBlurDistance: 0,
            },
            {
                baseHeightRange: [0.1, 0.1],
                cutAngleRange: [15, 30],
                cornerCutRatio: 0,
            }
        );

        this.camera.position.set(10, 10, 15);
        this.camera.lookAt(new Vector3());
    }

    configureGrid(gridConfig: GridConfig, blockConfig: BlockConfig) {
        this.disposeCutBlockGeometrys();

        const grid = generateGrid(gridConfig, blockConfig);
        this.grid = grid;

        const [gridWidth, gridHeight] = gridConfig.size;

        const colorStops = gridConfig.colorStops.map(c => new Color(c));

        this.blocks = grid.blocks.map((block, i) => {
            const geometry = new CutBlockGeometry({
                baseHeight: block.baseHeight,
                cutAngle: grid.cutAngleBuckets[block.cutAngleBucket],
                cutType: block.cutType,
                width: 1,
                depth: 1,
            });
            const blockMesh = new Mesh(geometry, new MeshPhysicalMaterial({ color: colorStops[block.colorBucket], envMap: this.envMap }));
            const z = Math.floor(i / gridWidth);
            const x = i - z * gridWidth;
            blockMesh.position.z = (z - gridHeight / 2);
            blockMesh.position.x = (x - gridWidth / 2);
            blockMesh.rotateOnAxis(new Vector3(0, 1, 0), block.turns * Math.PI / 2);

            this.scene.add(blockMesh);

            return blockMesh;
        });

        this.needsRender = true;
    }

    disposeCutBlockGeometrys() {
        this.blocks.forEach(block => {
            block.removeFromParent();
            block.geometry.dispose();
            (block.material as Material).dispose();
        });

        this.blocks = [];
    }

    destroy() {
        this.resizeObserver.disconnect();

        this.disposeCutBlockGeometrys();
        this.envMap.dispose();

        this.renderer.dispose();
        cancelAnimationFrame(this.animationFrameId);
    }

    render() {
        this.needsRender = true;
    }
}

export { Renderer };
