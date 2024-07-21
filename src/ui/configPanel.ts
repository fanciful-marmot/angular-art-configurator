import { Pane } from 'tweakpane';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import type { Renderer } from '../renderer';

const createConfigPanel = (renderer: Renderer) => {
  const gridConfig = {
    size: { x: 10, y: 20 }
  };

  const blockConfig = {
    baseHeightRange: { min: 0.1, max: 0.1 },
    cutAngleRange: { min: 15, max: 30 },
    cornerCutRatio: 0,
  };

  const pane = new Pane({
    title: 'Config',
    expanded: true,
  });
  pane.registerPlugin(EssentialsPlugin);

  // Grid config
  const gridFolder = pane.addFolder({
    title: 'Grid',
    expanded: true,
  });

  gridFolder.addBinding(gridConfig, 'size', {
    x: { step: 1, min: 1, max: 100 },
    y: { step: 1, min: 1, max: 100, inverted: true },
  });

  // Block folder
  const blockFolder = pane.addFolder({
    title: 'Block',
    expanded: true,
  });

  blockFolder.addBinding(blockConfig, 'baseHeightRange', {
    label: 'base height',
    min: 0,
    max: 2,
    step: 0.1,
  });

  blockFolder.addBinding(blockConfig, 'cutAngleRange', {
    label: 'cut angle',
    min: 0,
    max: 50,
    step: 5,
  });

  const configure = () => {
    renderer.configureGrid(
      {
        size: [gridConfig.size.x, gridConfig.size.y],
      },
      {
        baseHeightRange: [blockConfig.baseHeightRange.min, blockConfig.baseHeightRange.max],
        cutAngleRange: [blockConfig.cutAngleRange.min, blockConfig.cutAngleRange.max],
        cornerCutRatio: blockConfig.cornerCutRatio,
      },
    );
  };

  pane.addButton({ title: 'Configure' }).on('click', () => {
    configure();
  });

  // Set defaultConfig
  configure();
};

export { createConfigPanel };
