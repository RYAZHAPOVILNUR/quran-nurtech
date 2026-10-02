export function mushafOfflineTasks() {
  const tasks = [];
  for (let page = 1; page <= 604; page++) {
    tasks.push({ type: 'page', url: '/mushaf/' + page });
    tasks.push({ type: 'font', url: 'https://verses.quran.foundation/fonts/quran/hafs/v4/colrv1/woff2/p' + page + '.woff2' });
  }
  for (let surah = 1; surah <= 114; surah++) tasks.push({ type: 'surah', url: '/surah/' + surah });
  return tasks;
}

function waitForController(serviceWorker, timeoutMs) {
  return new Promise((resolve, reject) => {
    if (serviceWorker.controller) { resolve(serviceWorker.controller); return; }
    const timeout = setTimeout(() => finish(new Error('Worker unavailable')), timeoutMs);
    function changed() { if (serviceWorker.controller) finish(); }
    function finish(error) {
      clearTimeout(timeout);
      serviceWorker.removeEventListener('controllerchange', changed);
      if (error) reject(error); else resolve(serviceWorker.controller);
    }
    serviceWorker.addEventListener('controllerchange', changed);
    changed();
  });
}

export async function readMushafOfflineStatus(serviceWorker, origin, timeoutMs = 15000) {
  const controller = await waitForController(serviceWorker, timeoutMs);
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const timeout = setTimeout(() => finish(new Error('Cache check timed out')), timeoutMs);
    function finish(error, data) {
      clearTimeout(timeout);
      channel.port1.close();
      serviceWorker.removeEventListener('controllerchange', changed);
      if (error) reject(error); else resolve(data);
    }
    function changed() { if (serviceWorker.controller !== controller) finish(new Error('Worker changed')); }
    serviceWorker.addEventListener('controllerchange', changed);
    channel.port1.onmessage = (event) => {
      const result = event.data;
      if (!result || result.error || !Array.isArray(result.missing)) finish(new Error('Cache unavailable'));
      else finish(null, result);
    };
    try {
      controller.postMessage({
        type: 'MUSHAF_CACHE_STATUS',
        urls: mushafOfflineTasks().map((task) => new URL(task.url, origin).href),
      }, [channel.port2]);
    } catch (error) { finish(error); }
  });
}
