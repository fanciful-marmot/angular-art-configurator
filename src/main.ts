import { Renderer } from './renderer';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;

// Setup renderer
const renderer = new Renderer(canvas);
renderer.render();
