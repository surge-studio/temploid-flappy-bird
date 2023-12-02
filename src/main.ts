import 'modern-normalize';
import './style.css';
import './fonts';
import { AnimatedSprite, Application, Text, Texture } from 'pixi.js';
import { BIRD, GAME } from './consts';

declare global {
  interface Window {
    WebFontConfig: any;
  }
}

window.WebFontConfig = {
  google: {
    families: ['Pixelify Sans'],
  },
  active() {
    setup();
  },
};

// Application
const app = new Application<HTMLCanvasElement>({
  resizeTo: window,
  backgroundColor: '#75A7F9',
});

document.body.appendChild(app.view);

// Assets
const images = [
  './sprites/bird01.png',
  './sprites/bird02.png',
  './sprites/bird03.png',
  './sprites/bird04.png',
];
const textures = images.map((image) => Texture.from(image));
let bird = new AnimatedSprite(textures);
let velocity = 0;
let time = 0;
let timeText: Text;

// Setup
const setup = () => {
  // Bird
  bird.width = BIRD.size;
  bird.height = BIRD.size;
  bird.anchor.set(0.5);
  bird.animationSpeed = 0.1;
  bird.x = app.screen.width / 3;
  bird.y = app.screen.height / 2;
  bird.play();

  // Score
  timeText = new Text(`${time}s`, {
    fontFamily: 'Pixelify Sans, sans-serif',
    fontSize: 32,
    fill: 'white',
    align: 'left',
  });
  timeText.position.set(32, 32);

  // Add
  app.stage.addChild(bird);
  app.stage.addChild(timeText);

  // Events
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('pointerdown', handlePointer);

  // Start
  app.ticker.add(gameLoop);
};

const reset = () => {
  // Bird
  bird.x = app.screen.width / 3;
  bird.y = app.screen.height / 2;
  velocity = 0;
  time = 0;
};

// Game
const gameLoop = (delta: number) => {
  if (!bird) return;

  // apply gravity and velocity
  velocity -= (GAME.gravity / app.ticker.FPS) * delta;
  bird.y -= velocity;

  // velocity based animation
  bird.rotation = Math.atan(-velocity / 10);
  bird.animationSpeed = Math.max(0.1, Math.min(0.5, velocity * 0.5 + 0.1));

  // events
  if (bird.y > app.screen.height || bird.y < 0) {
    reset();
  }

  // score
  time += delta;
  timeText.text = `${Math.floor(time / 60)}s`;
};

// Events
const flap = () => {
  velocity += BIRD.flapSpeed;
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === ' ' || event.key === 'Spacebar') {
    flap();
  }
};

const handlePointer = () => {
  flap();
};
