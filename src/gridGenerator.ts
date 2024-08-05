type Block = {
  baseHeight: number;
  width: number;
  depth: number;
  cutAngle: number;
  turns: number; // Number of 90 degree rotations
  colorBucket: number;
  cutType: 'edge' | 'corner';
};

type BlockGrid = {
  width: number;
  height: number;
  colorBuckets: number[];
  blocks: Block[];
};

type Range = [number, number];

export type GridConfig = {
  size: Range;
  borderBlurDistance: number;
  colorStops: number[];
};

export type BlockConfig = {
  baseHeightRange: Range;
  cutAngleRange: Range;
  cornerCutRatio: number;
};

const generateGrid = (gridConfig: GridConfig, blockConfig: BlockConfig): BlockGrid => {
  const NUM_BUCKETS = 4;
  const random = (range: Range) => {
    const bucket = Math.floor(Math.random() * NUM_BUCKETS);
    const t = bucket / NUM_BUCKETS;

    return t * (range[1] - range[0]) + range[0];
  };

  const { borderBlurDistance, colorStops } = gridConfig;

  const [gridWidth, gridHeight] = gridConfig.size;
  const blocks = new Array(gridWidth * gridHeight);
  for (let z = 0; z < gridHeight; z++) {
    for (let x = 0; x < gridWidth; x++) {
      const colorIndexF = z / gridHeight * colorStops.length;
      let colorIndex = Math.floor(colorIndexF);
      let distToBorder = colorIndexF - Math.round(colorIndexF);
      if (Math.abs(distToBorder) < borderBlurDistance) {
        // We're close to the boundary, blend
        const borderBlurProbabilityCutoff = Math.min(1, (borderBlurDistance - Math.abs(distToBorder)) / borderBlurDistance + 0.6) - 0.5;
        const t = Math.random();
        if (distToBorder >= 0) {
          colorIndex += t < borderBlurProbabilityCutoff ? -1 : 0;
        } else {
          colorIndex += t < borderBlurProbabilityCutoff ? 1 : 0;
        }
      }

      const block: Block = {
        baseHeight: random(blockConfig.baseHeightRange),
        colorBucket: Math.max(0, Math.min(colorIndex, colorStops.length - 1)),
        cutAngle: random(blockConfig.cutAngleRange),
        turns: Math.floor(Math.random() * 4),
        width: 1,
        depth: 1,
        cutType: Math.random() < blockConfig.cornerCutRatio ? 'corner' : 'edge',
      };

      blocks[x + gridWidth * z] = block;
    }
  }

  return {
    width: gridWidth,
    height: gridHeight,
    colorBuckets: gridConfig.colorStops,
    blocks,
  };
};

export { generateGrid };
