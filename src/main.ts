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
  BOUNDARY_BOTTOM,
  BOUNDARY_TOP,
  GAME_SPEED,
  GRAVITY,
  TUBE_OPENING,
  TUBE_WIDTH,
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
const birdImages = [
  './sprites/bird01.png',
  './sprites/bird02.png',
  './sprites/bird03.png',
  './sprites/bird04.png',
];

// State
let bird: AnimatedSprite;
let upperTubes: TilingSprite[] = [];
let lowerTubes: TilingSprite[] = [];
let background: TilingSprite;
let ground: TilingSprite;
let velocity = 0;
let time = 0;
let score: Text;

// Setup
const setup = () => {
  // Background
  const backgroundTexture = Texture.from('./sprites/background.png');
  background = new TilingSprite(
    backgroundTexture,
    app.screen.width,
    app.screen.height
  );
  background.alpha = 0.5;
  const backgroundScale = app.screen.height / 480;
  background.tileScale.x = backgroundScale;
  background.tileScale.y = backgroundScale;

  // Ground
  const groundTexture = Texture.from('./sprites/ground.png');
  ground = new TilingSprite(groundTexture, app.screen.width, 70);
  ground.y = app.screen.height - 70;

  // Bird
  const birdTextures = birdImages.map((image) => Texture.from(image));
  bird = new AnimatedSprite(birdTextures);
  bird.width = BIRD_SIZE;
  bird.height = BIRD_SIZE;
  bird.anchor.set(0.5);
  bird.animationSpeed = 0.1;
  bird.x = app.screen.width / 3;
  bird.y = app.screen.height / 2;
  bird.play();

  // Score
  score = new Text(`${time}s`, {
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
  score.anchor.set(0.5);
  score.position.set(app.screen.width / 2, app.screen.height / 2);
  score.skew.set(0.2, 0);

  // Add
  app.stage.addChild(background);
  app.stage.addChild(ground);
  app.stage.addChild(bird);
  app.stage.addChild(score);
  addTube();

  // Events
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('pointerdown', handlePointer);

  // Start
  app.ticker.add(gameLoop);
};

const addTube = () => {
  const tubeTexture = Texture.from('./sprites/tile.png');
  const x = app.screen.width + TUBE_WIDTH;
  const padding = 80;
  const min = padding;
  const max = app.screen.height - padding - TUBE_OPENING;

  const lowerTube = new TilingSprite(
    tubeTexture,
    TUBE_WIDTH,
    app.screen.height
  );
  lowerTube.x = x;
  lowerTube.y = Math.random() * (max - min) + min;
  lowerTubes.push(lowerTube);

  const upperTube = new TilingSprite(
    tubeTexture,
    TUBE_WIDTH,
    app.screen.height
  );
  upperTube.x = x;
  upperTube.y = lowerTube.y - TUBE_OPENING - app.screen.height;
  upperTubes.push(upperTube);

  app.stage.addChild(upperTube);
  app.stage.addChild(lowerTube);
};

const reset = () => {
  // Bird
  bird.x = app.screen.width / 3;
  bird.y = app.screen.height / 2;
  velocity = 0;

  // Score
  time = 0;

  // Tubes
  upperTubes.forEach((tube) => {
    app.stage.removeChild(tube);
  });
  lowerTubes.forEach((tube) => {
    app.stage.removeChild(tube);
  });
  upperTubes = [];
  lowerTubes = [];
  addTube();

  // Background
  background.tilePosition.x = 0;
  ground.tilePosition.x = 0;
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
  if (bird.y < BOUNDARY_TOP) {
    bird.y = BOUNDARY_TOP;
  }

  if (bird.y > app.screen.height - BOUNDARY_BOTTOM) {
    reset();
    return;
  }

  // check if bird collides with any upper tube
  upperTubes.forEach((tube) => {
    if (bird.x > tube.x && bird.x < tube.x + tube.width) {
      if (bird.y > tube.y && bird.y < tube.y + tube.height) {
        reset();
        return;
      }
    }

    // move tube along
    tube.x -= delta * ((GAME_SPEED * app.screen.width) / 360 + 0.5);
  });

  // check if bird collides with any lower tube
  lowerTubes.forEach((tube) => {
    if (bird.x > tube.x && bird.x < tube.x + tube.width) {
      if (bird.y > tube.y && bird.y < tube.y + tube.height) {
        reset();
        return;
      }
    }

    // move tube along
    tube.x -= delta * ((GAME_SPEED * app.screen.width) / 360 + 0.5);
  });

  // check if tube has exited left screen
  if (lowerTubes.length && lowerTubes[0].x < -lowerTubes[0].width) {
    app.stage.removeChild(upperTubes[0]);
    app.stage.removeChild(lowerTubes[0]);
    upperTubes.shift();
    lowerTubes.shift();
    addTube();
  }

  // score
  time += delta;
  score.text = `${Math.floor(time / 60)}s`;

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
