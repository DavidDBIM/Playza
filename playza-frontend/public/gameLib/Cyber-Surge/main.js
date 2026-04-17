import * as THREE from 'three';
import { GameEngine } from './src/core/GameEngine.js';

const container = document.getElementById('game-container');
const game = new GameEngine(container);
window.game = game; // Make accessible globally for debugging if needed
