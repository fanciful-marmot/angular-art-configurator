import { Renderer } from './renderer';
import { createConfigPanel } from './ui/configPanel';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;

// Setup renderer
const renderer = new Renderer(canvas);
renderer.render();

// Config panel
createConfigPanel(renderer);
