import { Pane } from 'tweakpane';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import type { Renderer } from '../renderer';

const createConfigPanel = (renderer: Renderer) => {
  const gridConfig = {
    size: { x: 30, y: 40 },
    borderBlurDistance: 0.3,
    color1: 0x22c1c3,
    color2: 0x6fbf8f,
    color3: 0xaebd63,
    color4: 0xfdbb2d,
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
  gridFolder.addBinding(gridConfig, 'borderBlurDistance', {
    label: 'blur distance',
    min: 0,
    max: 1,
    step: 0.05,
  });
  gridFolder.addBinding(gridConfig, 'color1', { view: 'color' });
  gridFolder.addBinding(gridConfig, 'color2', { view: 'color' });
  gridFolder.addBinding(gridConfig, 'color3', { view: 'color' });
  gridFolder.addBinding(gridConfig, 'color4', { view: 'color' });

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
        borderBlurDistance: gridConfig.borderBlurDistance,
        // colorStops: [0x424242, 0x633f30, 0x827d7a, 0xe3e1e1, 0x827d7a, 0x633f30, 0x424242],
        // colorStops: [0x22c1c3, 0x6fbf8f, 0xaebd63, 0xfdbb2d],
        colorStops: [gridConfig.color1, gridConfig.color2, gridConfig.color3, gridConfig.color4],
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
