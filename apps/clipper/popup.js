document.getElementById('capturePage').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  document.getElementById('status').textContent = 'Capturing page...';
  chrome.tabs.sendMessage(tab.id, { action: 'capturePage' }, (response) => {
    document.getElementById('status').textContent = response?.success ? 'Page captured!' : 'Capture failed';
  });
});

document.getElementById('captureScreenshot').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  document.getElementById('status').textContent = 'Capturing screenshot...';
  chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
    chrome.storage.local.set({ lastScreenshot: { url: tab.url, dataUrl, capturedAt: new Date().toISOString() } });
    document.getElementById('status').textContent = 'Screenshot captured!';
  });
});

document.getElementById('selectElement').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: 'startElementPicker' });
  document.getElementById('status').textContent = 'Click an element on the page...';
  window.close();
});

document.getElementById('extractDesignSystem').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  document.getElementById('status').textContent = 'Extracting design system...';
  chrome.tabs.sendMessage(tab.id, { action: 'extractDesignSystem' }, (response) => {
    document.getElementById('status').textContent = response?.success ? 'Design system extracted!' : 'Extraction failed';
  });
});

document.getElementById('pickImages').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: 'pickImages' });
  document.getElementById('status').textContent = 'Selecting images...';
  window.close();
});
