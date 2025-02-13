// (I wrote a decent chunk of this code years ago and it's pretty awful in places. Please don't judge! 🙈)

// Constants

const objects = [],
  MAX_T = 3000, // Max object time in ms
  ICON_FREQUENCY = 50, // frequency
  LOVE_FRQUENCY = 0.03, // Odds of a love-letter
  aX = 0, // horizontal acceleration
  aY = 0, // vertical acceleration
  INIT_VELOCITY = 3, // Initial velocity
  ICON_SIZE = 0.1,
  interval = 1000 / ICON_FREQUENCY, // Time between icons
  tGrow = 1 / 10, // proportion of time spent growing
  tFade = 1 / 3; // proportion of time spent fading;

// State

let W,
  H,
  MAX_SIZE,
  oldT = 0,
  dt = 0,
  lastNewObj = 0,
  newObjOverflow = 0;

// Create Canvas

const canvas = document.createElement("canvas"),
  ctx = canvas.getContext("2d");

function onResizeCanvas() {
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;
  MAX_SIZE = ICON_SIZE * ((W + H) / 2); // Max object radius
}

onResizeCanvas();

window.addEventListener("resize", onResizeCanvas);

document.body.appendChild(canvas);

function resetCanvas() {
  ctx.clearRect(0, 0, W, H);
}

function createObject() {
  objects.push({
    origin: {
      // Random initial positions:
      x: (Math.random() - 0.5) * W * 2,
      y: (Math.random() - 0.5) * H * 2,
    },
    // Random initial velocities prior to gravity:
    velocity: {
      x: (Math.random() - 0.5) * INIT_VELOCITY,
      y: (Math.random() - 0.5) * INIT_VELOCITY,
    },
    size: MAX_SIZE / 3, // initial size
    text: Math.random() > LOVE_FRQUENCY ? "✉️" : "💌",
    alpha: 1, //opacity
    t: 0, // time since birth
  });
}

function drawIcon(x, y, fontSize, a, text) {
  ctx.save();
  ctx.globalAlpha = a;
  ctx.font = `${fontSize}px Arial`;
  ctx.fillText(text, x, y + fontSize);
  ctx.restore();
}

function animateDV(max, t) {
  var thisT = MAX_T * t;
  var thisDT = thisT / dt;
  return max / thisDT;
}

function updateTimer(now) {
  // Update time diff
  if (oldT === 0) {
    oldT = now;
  }
  dt = now - oldT;
  oldT = now;
}

function createObjects(firstRun, now) {
  var dtLastNewObj = now - lastNewObj; // Time since last object created
  if (firstRun) {
    dtLastNewObj = 0;
    lastNewObj = now;
    firstRun = false;
  }

  // Create new object
  if (dtLastNewObj > interval) {
    createObject();
    lastNewObj = now;
    newObjOverflow += dtLastNewObj - interval;
  }

  // Add extra objects to compensate where interval < framerate
  while (newObjOverflow > interval) {
    createObject();
    newObjOverflow -= interval;
  }
}

function updateObject(vGrow, vFade) {
  return (o) => {
    // Gravity acceleration constant (?)
    o.velocity.x += aX;
    o.velocity.y += aY;

    // Get previous velocity
    o.origin.x += o.velocity.x;
    o.origin.y += o.velocity.y;

    // Apply drag force coefficient to decelerate the object over time
    // o.velocity.x *= 0.98;
    // o.velocity.y *= 0.98;

    // Bounding box:
    // Prevent the balls escaping vertically
    if (o.origin.y < 0 || o.origin.y > H) {
      o.velocity.y = -o.velocity.y;
    }
    // Prevent the balls escaping horizontally
    if (o.origin.x < 0 || o.origin.x > W) {
      o.velocity.x = -o.velocity.x;
    }

    // Increase object timer
    o.t += dt;

    if (dt !== 0) {
      if (o.size < MAX_SIZE) {
        o.size = Math.min(o.size + vGrow, MAX_SIZE);
      } else if (o.t > MAX_T - MAX_T * tFade) {
        o.alpha = Math.max(o.alpha - vFade, 0);
      }
    }

    if (o.t < MAX_T) {
      var x = o.origin.x - o.size / 2;
      var y = o.origin.y - o.size / 2;
      drawIcon(x, y, o.size, o.alpha, o.text);
    } else {
      // Kill it
      o.dead = true;
    }
  };
}

function run(firstRun) {
  return (now) => {
    resetCanvas();

    updateTimer(now);

    createObjects(firstRun, now);

    var vGrow = animateDV(MAX_SIZE, tGrow);
    var vFade = animateDV(1, tFade);

    objects.forEach(updateObject(vGrow, vFade));

    objects.filter((d) => !d.dead);

    requestAnimationFrame(run(false));
  };
}

// Initialise canvas
requestAnimationFrame(run(true));
