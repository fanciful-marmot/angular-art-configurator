import type { Block, BlockGrid } from '../gridGenerator';

const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const TURNS = 'NESW'

const renderInstructions = (grid: BlockGrid) => {
  const angleCounts: Map<number, number> = new Map();
  const angleToColorCounts: Map<number, Map<number, number>> = new Map();
  for (let i = 0; i < grid.cutAngleBuckets.length; i++) {
    const blocksOfAngle = grid.blocks.filter(block => block.cutAngleBucket === i);
    angleCounts.set(i, blocksOfAngle.length);

    const colorCounts = new Map();
    for (let j = 0; j < grid.colorBuckets.length; j++) {
      colorCounts.set(j, blocksOfAngle.reduce((count, block) => {
        return block.colorBucket === j ? count + 1 : count;
      }, 0));
    }
    angleToColorCounts.set(i, colorCounts);
  }

  // Angle counts
  {
    const div = document.getElementById('angle-counts');
    div.innerHTML = '';
    for (const [angleBucket, count] of angleCounts.entries()) {
      const angle = grid.cutAngleBuckets[angleBucket];
      div.innerHTML += `${angle}º: ${count} (${AZ[angleBucket]})<br>`;
    }
  }

  // Piece counts
  {
    const div = document.getElementById('piece-counts');
    div.innerHTML = '';
    for (const [angleBucket, colorCounts] of angleToColorCounts.entries()) {
      for (const [colorBucket, count] of colorCounts.entries()) {
        const angle = grid.cutAngleBuckets[angleBucket];
        const colorString = grid.colorBuckets[colorBucket].toString(16);
        div.innerHTML += `${angle}º <span class="swatch" style="background: #${colorString}"></span>: ${count} (${AZ[angleBucket]}${colorBucket + 1})<br>`;
      }
      div.innerHTML += '<br>';
    }
  }

  // Grid
  {
    const div = document.getElementById('grid');
    div.innerHTML = '';

    for (let r = 0; r < grid.height; r++) {
      const rowDiv = document.createElement('div');
      rowDiv.classList.add('grid-row');
      for (let c = 0; c < grid.width; c++) {
        const { cutAngleBucket, colorBucket, turns } = grid.blocks[r * grid.width + c];
        const colorString = grid.colorBuckets[colorBucket].toString(16);
        rowDiv.innerHTML += `<div style="background: #${colorString}" class="grid-cell">${AZ[cutAngleBucket]}${colorBucket + 1}<br>${TURNS[turns]}</div>`
      }
      div.appendChild(rowDiv);
    }
  }
};

export { renderInstructions };
