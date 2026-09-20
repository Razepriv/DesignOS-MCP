chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'capturePage': {
      const data = {
        url: window.location.href,
        title: document.title,
        html: document.documentElement.outerHTML,
        metadata: {
          charset: document.characterSet,
          viewport: document.querySelector('meta[name=viewport]')?.getAttribute('content'),
          description: document.querySelector('meta[name=description]')?.getAttribute('content'),
        },
        capturedAt: new Date().toISOString(),
      };
      // Remove scripts for safety
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.html, 'text/html');
      doc.querySelectorAll('script').forEach(s => s.remove());
      data.html = doc.documentElement.outerHTML;
      chrome.storage.local.set({ lastCapture: data });
      sendResponse({ success: true, url: data.url });
      break;
    }
    case 'startElementPicker': {
      startElementPicker();
      break;
    }
    case 'extractDesignSystem': {
      const designSystem = extractDesignSystem();
      chrome.storage.local.set({ lastDesignSystem: designSystem });
      sendResponse({ success: true, designSystem });
      break;
    }
    case 'pickImages': {
      const images = [...document.querySelectorAll('img')].map(img => ({
        src: img.src, alt: img.alt, width: img.naturalWidth, height: img.naturalHeight,
      }));
      chrome.storage.local.set({ lastImages: images });
      sendResponse({ success: true, count: images.length });
      break;
    }
  }
  return true;
});

function startElementPicker() {
  let overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:999999;cursor:crosshair;';
  let highlight = document.createElement('div');
  highlight.style.cssText = 'position:fixed;border:2px solid #6366f1;background:rgba(99,102,241,0.1);z-index:999998;pointer-events:none;';
  document.body.appendChild(highlight);
  document.body.appendChild(overlay);

  overlay.addEventListener('mousemove', (e) => {
    overlay.style.pointerEvents = 'none';
    const el = document.elementFromPoint(e.clientX, e.clientY);
    overlay.style.pointerEvents = 'auto';
    if (el) {
      const rect = el.getBoundingClientRect();
      highlight.style.left = rect.left + 'px';
      highlight.style.top = rect.top + 'px';
      highlight.style.width = rect.width + 'px';
      highlight.style.height = rect.height + 'px';
    }
  });

  overlay.addEventListener('click', (e) => {
    overlay.style.pointerEvents = 'none';
    const el = document.elementFromPoint(e.clientX, e.clientY);
    overlay.style.pointerEvents = 'auto';
    if (el) {
      const rect = el.getBoundingClientRect();
      const computed = window.getComputedStyle(el);
      const data = {
        tag: el.tagName.toLowerCase(),
        selector: getSelector(el),
        html: el.outerHTML,
        size: { width: rect.width, height: rect.height },
        styles: {
          color: computed.color, backgroundColor: computed.backgroundColor,
          fontFamily: computed.fontFamily, fontSize: computed.fontSize,
          fontWeight: computed.fontWeight, padding: computed.padding,
          margin: computed.margin, borderRadius: computed.borderRadius,
        },
        url: window.location.href,
        capturedAt: new Date().toISOString(),
      };
      chrome.storage.local.set({ lastElement: data });
    }
    overlay.remove();
    highlight.remove();
  });
}

function getSelector(el) {
  if (el.id) return '#' + el.id;
  let path = [];
  while (el && el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.tagName.toLowerCase();
    if (el.className) selector += '.' + [...el.classList].join('.');
    path.unshift(selector);
    el = el.parentElement;
  }
  return path.join(' > ');
}

function extractDesignSystem() {
  const styles = new Set();
  const colors = new Set();
  const fonts = new Set();
  const spacing = new Set();
  const radii = new Set();
  const shadows = new Set();

  document.querySelectorAll('*').forEach(el => {
    const cs = window.getComputedStyle(el);
    if (cs.color) colors.add(cs.color);
    if (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') colors.add(cs.backgroundColor);
    if (cs.fontFamily) fonts.add(cs.fontFamily);
    if (cs.borderRadius && cs.borderRadius !== '0px') radii.add(cs.borderRadius);
    if (cs.boxShadow && cs.boxShadow !== 'none') shadows.add(cs.boxShadow);
  });

  // Extract CSS variables from :root
  const rootStyles = window.getComputedStyle(document.documentElement);
  const cssVars = {};
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule.selectorText === ':root') {
          for (const prop of rule.style) {
            if (prop.startsWith('--')) cssVars[prop] = rule.style.getPropertyValue(prop).trim();
          }
        }
      }
    } catch (e) { /* cross-origin */ }
  }

  return {
    url: window.location.href,
    colors: [...colors],
    fonts: [...fonts],
    radii: [...radii],
    shadows: [...shadows],
    cssVariables: cssVars,
    capturedAt: new Date().toISOString(),
  };
}
