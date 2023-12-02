import 'modern-normalize';
import './style.css';
import { Application, Sprite, Text, Texture } from 'pixi.js';
import { BIRD, GAME } from './consts';

declare global {
  interface Window {
    WebFontConfig: any;
  }
}

// Application
const app = new Application<HTMLCanvasElement>({
  resizeTo: window,
  backgroundColor: '#75A7F9',
});

document.body.appendChild(app.view);

// Fonts
window.WebFontConfig = {
  google: {
    families: ['Pixelify Sans'],
  },
  active() {
    setup();
  },
};

(function () {
  const wf = document.createElement('script');
  wf.src = `${
    document.location.protocol === 'https:' ? 'https' : 'http'
  }://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js`;
  wf.type = 'text/javascript';
  wf.async = true;
  const s = document.getElementsByTagName('script')[0];
  s.parentNode?.insertBefore(wf, s);
})();

// Assets
const birdTexture = Texture.from('./sprites/bird01.png');
let bird = Sprite.from(birdTexture);
let velocity = 0;
let time = 0;
let timeText: Text;

// Setup
const setup = () => {
  // Bird
  bird.width = BIRD.size;
  bird.height = BIRD.size;
  bird.anchor.set(0.5);
  bird.x = app.screen.width / 3;
  bird.y = app.screen.height / 2;

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

  // velocity based rotation
  bird.rotation = Math.atan(-velocity / 10);

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
