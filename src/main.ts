import 'modern-normalize';
import './style.css';
import './fonts';
import {
  AnimatedSprite,
  Application,
  Text,
  Texture,
  TilingSprite,
} from 'pixi.js';
import { MotionBlurFilter } from '@pixi/filter-motion-blur';
import {
  BIRD_FLAP_MAX_SPEED,
  BIRD_FLAP_SPEED,
  BIRD_SIZE,
  GAME_SPEED,
  GRAVITY,
} from './consts';

declare global {
  interface Window {
    WebFontConfig: any;
  }
}

window.WebFontConfig = {
  google: {
    families: ['Press Start 2P'],
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

let bird: AnimatedSprite;
let background: TilingSprite;
let ground: TilingSprite;
let velocity = 0;
let time = 0;
let timeText: Text;

// Setup
const setup = () => {
  // Background
  const backgroundTexture = Texture.from('./sprites/background.png');
  background = new TilingSprite(
    backgroundTexture,
    app.screen.width,
    app.screen.height
  );
  background.tileScale.x = app.screen.width / 800;
  background.tileScale.y = app.screen.height / 480;
  background.alpha = 0.5;

  // Ground
  const groundTexture = Texture.from('./sprites/ground.png');
  ground = new TilingSprite(groundTexture, app.screen.width, 70);
  ground.y = app.screen.height - 70;

  // Bird
  const birdTextures = images.map((image) => Texture.from(image));
  bird = new AnimatedSprite(birdTextures);
  bird.width = BIRD_SIZE;
  bird.height = BIRD_SIZE;
  bird.anchor.set(0.5);
  bird.animationSpeed = 0.1;
  bird.x = app.screen.width / 3;
  bird.y = app.screen.height / 2;
  bird.play();

  // Score
  timeText = new Text(`${time}s`, {
    fontFamily: 'Press Start 2P, sans-serif',
    fontSize: 48,
    fill: 'rgba(255, 255, 255, 0.6)',
    align: 'left',
    dropShadow: true,
    dropShadowBlur: 0,
    dropShadowColor: '#000000',
    dropShadowDistance: 4,
    dropShadowAlpha: 0.1,
    dropShadowAngle: Math.PI / 2,
  });
  timeText.anchor.set(0.5);
  timeText.position.set(app.screen.width / 2, app.screen.height / 2);
  timeText.skew.set(0.2, 0);

  // Add
  app.stage.addChild(background);
  app.stage.addChild(ground);
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
  velocity -= (GRAVITY / app.ticker.FPS) * delta;
  bird.y -= velocity;

  // velocity based animation
  bird.rotation = Math.atan(-velocity / 10);
  bird.animationSpeed = Math.max(0.1, Math.min(0.5, velocity * 0.5 + 0.1));
  let motionBlurFilter = new MotionBlurFilter([0, velocity], 32);
  bird.filters = [motionBlurFilter];

  // events
  if (bird.y > app.screen.height || bird.y < 0) {
    reset();
  }

  // score
  time += delta;
  timeText.text = `${Math.floor(time / 60)}s`;

  // background
  background.tilePosition.x -= delta * (GAME_SPEED / 12);
  ground.tilePosition.x -= delta * GAME_SPEED;
};

// Events
const flap = () => {
  velocity += BIRD_FLAP_SPEED;

  if (velocity > BIRD_FLAP_MAX_SPEED) {
    velocity = BIRD_FLAP_MAX_SPEED;
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === ' ' || event.key === 'Spacebar') {
    flap();
  }
};

const handlePointer = () => {
  flap();
};
