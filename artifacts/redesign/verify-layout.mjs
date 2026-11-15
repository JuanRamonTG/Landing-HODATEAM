import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const outputDir = resolve('artifacts/redesign');
const widths = [320, 375, 430, 768, 1024, 1440, 1920];
const targetUrl = process.env.LANDING_URL ?? 'http://127.0.0.1:4200/';
const debugEndpoint = process.env.CHROME_DEBUG_ENDPOINT ?? 'http://127.0.0.1:9222/json/list';

async function getPageTarget() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const targets = await (await fetch(debugEndpoint)).json();
      const page = targets.find((target) => target.type === 'page' && target.url.startsWith(targetUrl));
      if (page) return page;
    } catch {
      // Chrome's debugging endpoint can take a moment to start.
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
  }
  throw new Error('Chrome did not expose the local page on its debugging endpoint.');
}

const page = await getPageTarget();
const socket = new WebSocket(page.webSocketDebuggerUrl);
const pending = new Map();
const consoleErrors = [];
let nextId = 0;

await new Promise((resolveOpen, rejectOpen) => {
  socket.addEventListener('open', resolveOpen, { once: true });
  socket.addEventListener('error', rejectOpen, { once: true });
});

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.method === 'Runtime.exceptionThrown') {
    consoleErrors.push(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text);
  }
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
    consoleErrors.push(message.params.args.map((argument) => argument.value ?? argument.description ?? '').join(' '));
  }
  if (message.id && pending.has(message.id)) {
    const { resolve: resolveMessage, reject: rejectMessage } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) rejectMessage(new Error(message.error.message));
    else resolveMessage(message.result);
  }
});

function send(method, params = {}) {
  const id = ++nextId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolveMessage, rejectMessage) => {
    pending.set(id, { resolve: resolveMessage, reject: rejectMessage });
  });
}

async function evaluate(expression, awaitPromise = false) {
  const response = await send('Runtime.evaluate', {
    expression,
    awaitPromise,
    returnByValue: true,
  });
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text ?? 'Runtime evaluation failed.');
  }
  return response.result.value;
}

await mkdir(outputDir, { recursive: true });
await send('Page.enable');
await send('Runtime.enable');
await send('Page.navigate', { url: targetUrl });
await evaluate(`new Promise((resolve) => {
  if (document.readyState === 'complete') resolve(true);
  else window.addEventListener('load', () => resolve(true), { once: true });
})`, true);

const results = [];

for (const width of widths) {
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height: 950,
    screenWidth: width,
    screenHeight: 950,
    deviceScaleFactor: 1,
    mobile: true,
  });

  const dimensions = await evaluate(`({
    width: window.innerWidth,
    height: document.documentElement.scrollHeight,
  })`);

  await evaluate(`(async () => {
    const scrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    const step = Math.max(280, Math.floor(window.innerHeight * 0.7));
    for (let top = 0; top < document.documentElement.scrollHeight; top += step) {
      window.scrollTo(0, top);
      await new Promise((resolve) => setTimeout(resolve, 90));
    }
    const steps = [...document.querySelectorAll('.project-step')];
    if (steps.length > 2) {
      steps[2].click();
      await new Promise((resolve) => setTimeout(resolve, 460));
      steps[1].click();
      await new Promise((resolve) => setTimeout(resolve, 460));
    }
    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 850));
    document.documentElement.style.scrollBehavior = scrollBehavior;
    return true;
  })()`, true);

  const metrics = await evaluate(`(() => {
    const root = document.documentElement;
    const images = [...document.images];
    const anchors = [...document.querySelectorAll('a[href^="#"]')];
    return {
      viewport: window.innerWidth,
      pageWidth: root.scrollWidth,
      pageHeight: root.scrollHeight,
      horizontalOverflow: root.scrollWidth > window.innerWidth,
      brokenImages: images.filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src),
      pendingImages: images.filter((image) => !image.complete).map((image) => image.src),
      missingAnchors: anchors.filter((anchor) => !document.getElementById(anchor.hash.slice(1))).map((anchor) => anchor.href),
      sections: document.querySelectorAll('main section').length,
      navigationLinks: document.querySelectorAll('.site-header__nav a').length,
      ctas: [...document.querySelectorAll('.button')].map((button) => button.getAttribute('href')),
      revealItems: document.querySelectorAll('[data-motion-reveal]').length,
      revealedItems: document.querySelectorAll('[data-motion-reveal].is-visible').length,
      activeProjectScreen: document.querySelector('.project-step[aria-pressed="true"] .project-step__copy strong')?.textContent.trim(),
    };
  })()`);

  const screenshot = await send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: true,
    clip: {
      x: 0,
      y: 0,
      width: dimensions.width,
      height: Math.min(dimensions.height, 12000),
      scale: 1,
    },
  });
  const screenshotPath = resolve(outputDir, `responsive-${width}.png`);
  await writeFile(screenshotPath, Buffer.from(screenshot.data, 'base64'));
  results.push({ ...metrics, screenshot: screenshotPath });
}

await send('Emulation.setDeviceMetricsOverride', {
  width: 375,
  height: 812,
  screenWidth: 375,
  screenHeight: 812,
  deviceScaleFactor: 1,
  mobile: true,
});
await send('Emulation.setEmulatedMedia', {
  media: 'screen',
  features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
});
const reducedMotion = await evaluate(`(() => ({
  active: matchMedia('(prefers-reduced-motion: reduce)').matches,
  hiddenRevealItems: [...document.querySelectorAll('[data-motion-reveal]')].filter((element) => getComputedStyle(element).opacity === '0').length,
  documentScrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
}))()`);

await send('Emulation.setEmulatedMedia', { media: 'screen', features: [] });
const motionScene = await evaluate(`(async () => {
  const scene = document.querySelector('[data-motion-scene]');
  const flow = scene.querySelector('.city-scene__flow');
  scene.scrollIntoView({ block: 'center', behavior: 'instant' });
  await new Promise((resolve) => setTimeout(resolve, 360));
  const whileVisible = {
    active: scene.classList.contains('is-active'),
    routeDrawn: scene.classList.contains('has-played'),
    flowAnimation: getComputedStyle(flow).animationName,
  };
  window.scrollTo(0, 0);
  await new Promise((resolve) => setTimeout(resolve, 240));
  const whileOffscreen = {
    active: scene.classList.contains('is-active'),
    flowAnimation: getComputedStyle(flow).animationName,
  };
  return { whileVisible, whileOffscreen };
})()`, true);
const prototypeSteps = await evaluate(`(async () => {
  const steps = [...document.querySelectorAll('.project-step')];
  steps[2].click();
  await new Promise((resolve) => setTimeout(resolve, 460));
  const selected = {
    pressedState: steps[2].getAttribute('aria-pressed'),
    imageMatches: document.querySelector('.project-gallery__open img')?.getAttribute('src') === '/assets/stellar-zoom.webp',
    detailUpdates: document.querySelector('.project__screen-detail strong')?.textContent.trim() === 'Leyenda de tráfico',
  };
  steps[1].click();
  await new Promise((resolve) => setTimeout(resolve, 460));
  return selected;
})()`, true);
const menu = await evaluate(`(async () => {
  const toggle = document.querySelector('.site-header__toggle');
  toggle.click();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const opened = toggle.getAttribute('aria-expanded') === 'true';
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const closedWithEscape = toggle.getAttribute('aria-expanded') === 'false';
  return { opened, closedWithEscape };
})()`, true);

await send('Page.navigate', { url: targetUrl });
await evaluate(`new Promise((resolve) => {
  if (document.readyState === 'complete') resolve(true);
  else window.addEventListener('load', () => resolve(true), { once: true });
})`, true);
await new Promise((resolve) => setTimeout(resolve, 250));
await send('Page.bringToFront');
await send('Input.dispatchKeyEvent', {
  type: 'keyDown',
  key: 'Tab',
  code: 'Tab',
  windowsVirtualKeyCode: 9,
  nativeVirtualKeyCode: 9,
});
await send('Input.dispatchKeyEvent', {
  type: 'keyUp',
  key: 'Tab',
  code: 'Tab',
  windowsVirtualKeyCode: 9,
  nativeVirtualKeyCode: 9,
});
const keyboard = await evaluate(`(() => {
  const active = document.activeElement;
  const rect = active.getBoundingClientRect();
  const style = getComputedStyle(active);
  return {
    firstTabFocusesSkipLink: active.matches('.skip-link'),
    focusedTag: active.tagName,
    focusedClass: active.className,
    focusedHref: active.getAttribute('href'),
    focusVisibleOnScreen: rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.bottom <= 64,
    focusBackground: style.backgroundColor,
    focusText: style.color,
  };
})()`);

await evaluate(`(() => {
  document.documentElement.style.scrollBehavior = 'auto';
  window.scrollTo(0, 0);
  return true;
})()`);
let tabsToGalleryButton = 0;
let galleryOpenerReachedByTab = false;
for (let attempt = 0; attempt < 24; attempt += 1) {
  await send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: 'Tab',
    code: 'Tab',
    windowsVirtualKeyCode: 9,
    nativeVirtualKeyCode: 9,
  });
  await send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: 'Tab',
    code: 'Tab',
    windowsVirtualKeyCode: 9,
    nativeVirtualKeyCode: 9,
  });
  tabsToGalleryButton += 1;
  galleryOpenerReachedByTab = await evaluate(`document.activeElement.matches('.project-gallery__open')`);
  if (galleryOpenerReachedByTab) break;
}
await send('Input.dispatchKeyEvent', {
  type: 'keyDown',
  key: 'Enter',
  code: 'Enter',
  text: '\r',
  unmodifiedText: '\r',
  windowsVirtualKeyCode: 13,
  nativeVirtualKeyCode: 13,
});
await send('Input.dispatchKeyEvent', {
  type: 'keyUp',
  key: 'Enter',
  code: 'Enter',
  windowsVirtualKeyCode: 13,
  nativeVirtualKeyCode: 13,
});
await new Promise((resolve) => setTimeout(resolve, 150));
const gallery = await evaluate(`(() => {
  const dialog = document.querySelector('.screen-dialog');
  return {
    opened: dialog.open,
    focusInsideDialog: dialog.contains(document.activeElement),
  };
})()`);
gallery.reachedByTab = galleryOpenerReachedByTab;
gallery.tabsToButton = tabsToGalleryButton;
gallery.openedWithEnter = gallery.opened;
await send('Input.dispatchKeyEvent', {
  type: 'keyDown',
  key: 'Escape',
  code: 'Escape',
  windowsVirtualKeyCode: 27,
  nativeVirtualKeyCode: 27,
});
await send('Input.dispatchKeyEvent', {
  type: 'keyUp',
  key: 'Escape',
  code: 'Escape',
  windowsVirtualKeyCode: 27,
  nativeVirtualKeyCode: 27,
});
await new Promise((resolve) => setTimeout(resolve, 50));
const galleryAfterEscape = await evaluate(`(() => ({
  closed: !document.querySelector('.screen-dialog').open,
  focusReturned: document.activeElement.matches('.project-gallery__open'),
}))()`);

const output = { responsive: results, reducedMotion, motionScene, prototypeSteps, menu, keyboard, gallery, galleryAfterEscape, consoleErrors };
await writeFile(resolve(outputDir, 'layout-validation.json'), `${JSON.stringify(output, null, 2)}\n`);
socket.close();
console.log(JSON.stringify(output, null, 2));
