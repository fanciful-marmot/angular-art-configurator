import { BufferAttribute, BufferGeometry, MathUtils } from 'three';

type Config = {
  baseHeight: number;
  width: number;
  depth: number;
  cutAngle: number;
  cutType: 'edge' | 'corner';
};

const DEFAULT: Config = {
  baseHeight: 1,
  width: 1,
  depth: 1,
  cutAngle: 45,
  cutType: 'edge',
};

class CutBlock extends BufferGeometry {
  constructor(options: Partial<Config> = {}) {
    super();

    const config = {
      ...DEFAULT,
      ...options,
    };

    // Construct Geometry
    const { width, depth, baseHeight: bh } = config;
    const hW = width / 2;
    const hD = depth / 2;
    const backHeight = depth * Math.tan(MathUtils.degToRad(config.cutAngle));
    const vertices = [
      -hW, 0, -hD,
      hW, 0, -hD,
      -hW, 0, hD,
      hW, 0, hD,

      -hW, bh, hD,
      hW, bh, hD,

      -hW, backHeight + bh, -hD,
      hW, backHeight + bh, -hD,
    ];

    const indices = [
      // Base
      0, 1, 2,
      2, 1, 3,

      // Front
      2, 5, 4,
      3, 5, 2,

      // Left
      0, 4, 6,
      2, 4, 0,

      // Right
      1, 5, 3,
      7, 5, 1,

      // Top
      4, 7, 6,
      5, 7, 4,

      // Back
      1, 6, 7,
      0, 6, 1,
    ];

    const flatShadedVertices = new Float32Array(indices.map(i => vertices.slice(i * 3, i * 3 + 3)).flat());
    this.setAttribute('position', new BufferAttribute(flatShadedVertices, 3));;
    this.computeVertexNormals();
  }
}

export { CutBlock };
