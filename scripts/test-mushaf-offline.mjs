import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';
import { mushafOfflineTasks, readMushafOfflineStatus } from '../src/client/mushaf-offline.js';

const source = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
const origin = 'https://quran.test';
const urls = mushafOfflineTasks().map(({ url }) => new URL(url, origin).href);

function harness({ stores = new Map(), version, gate, rejectWrites = false, networkFailure = false } = {}) {
  const handlers = new Map();
  const requests = [];
  const caches = {
    keys: async () => [...stores.keys()],
    delete: async (name) => stores.delete(name),
    open: async (name) => {
      if (!stores.has(name)) stores.set(name, new Map());
      const entries = stores.get(name);
      return {
        keys: async () => [...entries.keys()].map((url) => new Request(url)),
        match: async (request) => entries.get(new URL(request.url || request, origin).href)?.clone(),
        put: async (request, response) => {
          if (gate) await gate;
          if (rejectWrites) throw new Error('Quota exceeded');
          entries.set(request.url, response.clone());
        },
      };
    },
  };
  const context = vm.createContext({
    URL, Response, Request, Set, Promise, caches,
    self: {
      location: { origin },
      addEventListener: (name, handler) => handlers.set(name, handler),
      skipWaiting() {},
      clients: { claim: async () => {} },
    },
    fetch: async (request) => {
      requests.push(request.url);
      if (networkFailure) throw new Error('Network unavailable');
      return new Response('saved resource');
    },
  });
  vm.runInContext(version ? source.replace("'quran-v6-mushaf-sajda-flow'", JSON.stringify(version)) : source, context);
  const serviceWorker = new EventTarget();
  serviceWorker.controller = {
    postMessage: (data, ports) => handlers.get('message')({ data, ports, waitUntil: (promise) => promise.catch(() => {}) }),
  };
  return {
    stores, requests, serviceWorker,
    status: () => readMushafOfflineStatus(serviceWorker, origin, 1000),
    async fetch(url, wait = true) {
      let response;
      const writes = [];
      handlers.get('fetch')({
        request: new Request(url),
        respondWith: (value) => { response = value; },
        waitUntil: (value) => writes.push(value),
      });
      const result = await response;
      if (wait) await Promise.all(writes);
      return result;
    },
    async activate() {
      let result;
      handlers.get('activate')({ waitUntil: (value) => { result = value; } });
      await result;
    },
  };
}

test('manifest contains every page, font and surah exactly once', () => {
  const tasks = mushafOfflineTasks();
  assert.equal(new Set(urls).size, 1322);
  assert.equal(tasks.filter((task) => task.type === 'page').length, 604);
  assert.equal(tasks.filter((task) => task.type === 'font').length, 604);
  assert.equal(tasks.filter((task) => task.type === 'surah').length, 114);
});

test('cold cache, complete download, reload and repair only missing resources', async () => {
  const app = harness();
  assert.equal((await app.status()).missing.length, 1322);
  for (const url of urls) await app.fetch(url);
  assert.equal((await app.status()).missing.length, 0);
  const reloaded = harness({ stores: app.stores });
  assert.equal((await reloaded.status()).missing.length, 0);
  assert.equal(reloaded.requests.length, 0);
  const lost = [urls[0], urls[1], urls.at(-1)];
  for (const entries of app.stores.values()) for (const url of lost) entries.delete(url);
  const status = await reloaded.status();
  assert.deepEqual(status.missing.sort(), lost.sort());
  for (const url of status.missing) await reloaded.fetch(url);
  assert.deepEqual(reloaded.requests.sort(), lost.sort());
  assert.equal((await reloaded.status()).missing.length, 0);
});

test('a new worker cache version does not inherit readiness', async () => {
  const old = harness();
  await old.fetch(urls[0]);
  const updated = harness({ stores: old.stores, version: 'quran-next-test' });
  await updated.activate();
  assert.equal((await updated.status()).missing.length, 1322);
  assert.deepEqual([...updated.stores.keys()], ['quran-next-test']);
});

test('network and storage failures never report saved resources', async () => {
  for (const options of [{ networkFailure: true }, { rejectWrites: true }]) {
    const app = harness(options);
    await app.fetch(urls[0]);
    assert.equal((await app.status()).missing.length, 1322);
  }
});

test('inventory waits for pending cache writes', async () => {
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const app = harness({ gate });
  await app.fetch(urls[0], false);
  let settled = false;
  const status = app.status().then((value) => { settled = true; return value; });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(settled, false);
  release();
  assert.equal((await status).missing.length, 1321);
});

test('first installation waits for a controlling worker', async () => {
  const app = harness();
  const worker = app.serviceWorker.controller;
  app.serviceWorker.controller = null;
  const pending = app.status();
  app.serviceWorker.controller = worker;
  app.serviceWorker.dispatchEvent(new Event('controllerchange'));
  assert.equal((await pending).missing.length, 1322);
});

test('missing or outdated workers fail explicitly instead of reporting ready', async () => {
  const absent = new EventTarget();
  await assert.rejects(readMushafOfflineStatus(absent, origin, 10), /Worker unavailable/);
  absent.controller = { postMessage() {} };
  await assert.rejects(readMushafOfflineStatus(absent, origin, 10), /Cache check timed out/);
});

test('a controller update releases the old pending check for an immediate retry', async () => {
  const app = harness();
  const updatedController = app.serviceWorker.controller;
  app.serviceWorker.controller = { postMessage() {} };
  const pending = app.status();
  await new Promise((resolve) => setImmediate(resolve));
  const rejected = assert.rejects(pending, /Worker changed/);
  app.serviceWorker.controller = updatedController;
  app.serviceWorker.dispatchEvent(new Event('controllerchange'));
  await rejected;
  assert.equal((await app.status()).missing.length, 1322);
});
