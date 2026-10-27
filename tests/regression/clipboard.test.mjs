// T2 regression checks: mocked DOM/Clipboard API, executing the actual app.js
// listeners and club.js exports. This is not browser, permission or native-dialog proof.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { club, filterSessions, mapUrl, planText, validateClub } from '../../club.js';

const sourcePath = process.env.HAPPY_RUN_CLIPBOARD_APP_SOURCE || new URL('../../app.js', import.meta.url);
const source = readFileSync(sourcePath, 'utf8');
const importDeclaration = /^import \{ club, filterSessions, mapUrl, planText, validateClub \} from '\.\/club\.js';\r?\n/m;
assert.match(source, importDeclaration, 'the harness must remove only the real module import');
const script = new vm.Script(source.replace(importDeclaration, ''), { filename: 'app.js' });

class Node {
  constructor(tag, document) {
    this.tagName = tag;
    this.ownerDocument = document;
    this.children = [];
    this.parentNode = null;
    this.attributes = new Map();
    this.listeners = new Map();
    this.dataset = {};
    this.className = '';
    this.id = '';
    this.value = '';
    this.hidden = false;
    this.open = false;
    this.selectCount = 0;
    this._text = '';
    this.classList = {
      toggle: (name, active) => {
        const names = new Set(this.className.split(/\s+/).filter(Boolean));
        if (active) names.add(name);
        else names.delete(name);
        this.className = [...names].join(' ');
      },
    };
  }

  set textContent(value) {
    this.replaceChildren();
    this._text = String(value);
  }

  get textContent() { return this._text + this.children.map((child) => child.textContent).join(''); }
  get isConnected() { return this === this.ownerDocument || Boolean(this.parentNode?.isConnected); }

  append(...nodes) {
    for (const node of nodes) {
      node.remove();
      node.parentNode = this;
      this.children.push(node);
    }
  }

  replaceChildren(...nodes) {
    for (const child of this.children) child.parentNode = null;
    this.children = [];
    this._text = '';
    this.append(...nodes);
  }

  remove() {
    if (this.parentNode) {
      const index = this.parentNode.children.indexOf(this);
      this.parentNode.children.splice(index, 1);
      this.parentNode = null;
    }
  }

  after(...nodes) {
    assert.ok(this.parentNode, 'fallback insertion requires a connected status element');
    const parent = this.parentNode;
    let index = parent.children.indexOf(this) + 1;
    for (const node of nodes) {
      node.remove();
      node.parentNode = parent;
      parent.children.splice(index++, 0, node);
    }
  }

  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  addEventListener(name, listener) {
    if (!this.listeners.has(name)) this.listeners.set(name, []);
    this.listeners.get(name).push(listener);
  }

  emit(name, fields = {}) {
    return (this.listeners.get(name) || []).map((listener) => listener({ target: this, ...fields }));
  }

  matches(selector) {
    if (selector.startsWith('#')) return this.id === selector.slice(1);
    if (selector.startsWith('.')) return this.className.split(/\s+/).includes(selector.slice(1));
    const filter = selector.match(/^\[data-filter(?:="([^"]+)")?\]$/);
    if (filter) return filter[1] ? this.dataset.filter === filter[1] : this.dataset.filter !== undefined;
    return this.tagName === selector;
  }

  closest(selector) {
    return this.matches(selector) ? this : this.parentNode?.closest(selector) || null;
  }

  querySelectorAll(selector) {
    const parts = selector.split(/\s+/);
    const found = [];
    const visit = (node) => {
      for (const child of node.children) {
        if (child.matches(parts.at(-1))) {
          let ancestor = child.parentNode;
          let part = parts.length - 2;
          while (part >= 0 && ancestor) {
            if (ancestor.matches(parts[part])) part--;
            ancestor = ancestor.parentNode;
          }
          if (part < 0) found.push(child);
        }
        visit(child);
      }
    };
    visit(this);
    return found;
  }

  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  focus(options) {
    this.ownerDocument.activeElement = this;
    this.ownerDocument.focusLog.push({ node: this, options });
  }
  select() {
    this.selectCount++;
    this.ownerDocument.selectionLog.push(this);
  }
  getBoundingClientRect() { return { left: 0, right: 500, top: 0, bottom: 500 }; }
}

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function harness({ write = () => Promise.resolve(), unavailable = false } = {}) {
  const document = new Node('#document');
  document.ownerDocument = document;
  document.focusLog = [];
  document.selectionLog = [];
  document.createElement = (tag) => new Node(tag, document);
  document.createElementNS = (namespace, tag) => Object.assign(new Node(tag, document), { namespaceURI: namespace });
  document.createTextNode = (text) => Object.assign(new Node('#text', document), { textContent: text });
  const add = (tag, id, parent = document) => {
    const node = document.createElement(tag);
    node.id = id;
    parent.append(node);
    return node;
  };
  const list = add('div', 'run-list');
  const dialog = add('dialog', 'run-dialog');
  for (const id of ['dialog-status', 'dialog-title', 'dialog-description', 'dialog-detail', 'dialog-notice', 'dialog-facts', 'dialog-map']) add('div', id, dialog);
  const status = add('p', 'copy-status', dialog);
  const copyButton = add('button', 'copy-plan', dialog);
  const closeButton = add('button', '', dialog);
  closeButton.className = 'dialog-close';
  const menu = add('button', '');
  menu.className = 'menu-toggle';
  menu.setAttribute('aria-expanded', 'false');
  const navigation = add('nav', 'mobile-nav');
  navigation.hidden = true;
  add('p', 'filter-status');
  add('span', 'year');
  const filter = add('button', '');
  filter.dataset.filter = 'all';
  add('span', '', filter);
  add('p', '', add('section', 'schedule-notice'));
  add('p', 'community-message');
  add('div', 'community-links');
  const closeEvents = [];
  dialog.showModal = () => {
    assert.equal(dialog.open, false, 'the actual listener must not open an already open dialog');
    dialog.open = true;
  };
  dialog.close = () => {
    if (!dialog.open) return;
    dialog.open = false;
    closeEvents.push(() => dialog.emit('close'));
  };
  const writes = [];
  const errors = [];
  const navigator = unavailable ? {} : { clipboard: { writeText: (text) => {
    writes.push(text);
    return write(text, writes.length - 1);
  } } };
  const context = vm.createContext({
    document, navigator, club: structuredClone(club), filterSessions, mapUrl, planText, validateClub,
    console: { error: (...args) => errors.push(args) },
    matchMedia: () => ({ addEventListener() {} }),
  });
  script.runInContext(context);
  assert.deepEqual(errors, [], 'booting the actual app must succeed');
  assert.equal(list.children.length, club.sessions.length, 'click real rendered session cards');
  const cards = list.children;
  return {
    document, dialog, status, writes, cards,
    open(index = 0) { cards[index].emit('click'); },
    copy() {
      const listeners = copyButton.emit('click');
      assert.equal(listeners.length, 1, 'exercise the actual registered copy listener');
      return listeners[0];
    },
    close({ deferEvent = false } = {}) {
      closeButton.emit('click');
      if (!deferEvent) this.flushCloseEvents();
    },
    flushCloseEvents() { while (closeEvents.length) closeEvents.shift()(); },
    fallback() { return dialog.querySelector('.copy-fallback'); },
    label() { return dialog.querySelector('.copy-fallback-label'); },
  };
}

const copied = 'Plan copiado. ¡Compártelo con quien te apetezca!';
const failed = 'No se ha podido copiar automáticamente. Selecciona y copia el texto de abajo.';

function assertPayload(text, index = 0) {
  assert.equal(text, planText(club.sessions[index]));
  assert.match(text, /PLAN PROPUESTO — no es una convocatoria confirmada/);
  assert.match(text, /Espera la confirmación del club antes de acudir\./);
}

function assertFallback(app, index = 0) {
  assert.equal(app.status.textContent, failed);
  const fallback = app.fallback();
  assert.ok(fallback);
  assertPayload(fallback.value, index);
  assert.equal(fallback.readOnly, true);
  assert.equal(app.label().htmlFor, fallback.id);
  assert.equal(app.label().textContent, 'Texto del plan para copiar');
  assert.equal(app.document.activeElement, fallback);
  assert.equal(fallback.selectCount, 1);
}

function snapshot(app) {
  return {
    status: app.status.textContent,
    fallback: Boolean(app.fallback()),
    value: app.fallback()?.value,
    focusCount: app.document.focusLog.length,
    selectionCount: app.document.selectionLog.length,
  };
}

test('current copy success reports the actual proposed plan and creates no fallback', async () => {
  const app = harness();
  app.open();
  await app.copy();
  assertPayload(app.writes[0]);
  assert.equal(app.status.textContent, copied);
  assert.equal(app.fallback(), null);
  assert.equal(app.document.focusLog.length, 0);
});

for (const [name, options] of [
  ['rejected promise', { write: () => Promise.reject(new Error('denied')) }],
  ['unavailable Clipboard API', { unavailable: true }],
  ['synchronously throwing Clipboard API', { write: () => { throw new Error('denied synchronously'); } }],
]) {
  test(`current ${name} presents selectable exact manual fallback`, async () => {
    const app = harness(options);
    app.open();
    await app.copy();
    assertFallback(app);
    assert.equal(app.document.focusLog.length, 1);
    assert.equal(app.document.selectionLog.length, 1);
  });
}

for (const outcome of ['resolve', 'reject']) {
  for (const reopened of [0, 1]) {
    test(`late ${outcome} cannot affect ${reopened ? 'plan B' : 'the same plan A reopened (ABA)'}`, async () => {
      const pending = deferred();
      const app = harness({ write: () => pending.promise });
      app.open();
      const copying = app.copy();
      assertPayload(app.writes[0]);
      app.close();
      app.open(reopened);
      const before = snapshot(app);
      pending[outcome](new Error('late result'));
      await copying;
      assert.deepEqual(snapshot(app), before);
      assert.equal(app.status.textContent, '');
      assert.equal(app.fallback(), null);
      assert.equal(app.dialog.querySelector('#dialog-title').textContent, club.sessions[reopened].title);
    });
  }

  test(`late ${outcome} after close is inert even before the queued close event`, async () => {
    const pending = deferred();
    const app = harness({ write: () => pending.promise });
    app.open();
    const copying = app.copy();
    app.close({ deferEvent: true });
    const before = snapshot(app);
    pending[outcome](new Error('late result'));
    await copying;
    assert.deepEqual(snapshot(app), before);
    assert.equal(app.fallback(), null);
    app.flushCloseEvents();
    assert.equal(app.document.focusLog.length, 1);
    assert.equal(app.document.focusLog[0].node, app.cards[0]);
  });

  test(`stale plan A ${outcome} cannot replace an existing plan B fallback or refocus it`, async () => {
    const pending = deferred();
    const app = harness({ write: (_text, index) => index === 0 ? pending.promise : Promise.reject(new Error('B denied')) });
    app.open();
    const copyingA = app.copy();
    app.close();
    app.open(1);
    await app.copy();
    assertFallback(app, 1);
    const before = snapshot(app);
    pending[outcome](new Error('late A result'));
    await copyingA;
    assert.deepEqual(snapshot(app), before);
  });

  test(`queued close A after opening B cannot steal focus or invalidate B's ${outcome}`, async () => {
    const pending = deferred();
    const app = harness({ write: () => pending.promise });
    app.open();
    app.close({ deferEvent: true });
    app.open(1);
    const copying = app.copy();
    const before = snapshot(app);
    app.flushCloseEvents();
    assert.deepEqual(snapshot(app), before);
    assert.equal(app.dialog.open, true);
    pending[outcome](new Error('B result'));
    await copying;
    assertPayload(app.writes[0], 1);
    if (outcome === 'resolve') assert.equal(app.status.textContent, copied);
    else assertFallback(app, 1);
    assert.equal(app.document.focusLog.filter(({ node }) => node === app.cards[0] || node === app.cards[1]).length, 0);
  });
}

for (const newestOutcome of ['resolve', 'reject']) {
  for (const firstToFinish of ['older', 'newer']) {
    test(`same-open repeated copies: newest ${newestOutcome} owns feedback when ${firstToFinish} finishes first`, async () => {
      const pending = [deferred(), deferred()];
      const app = harness({ write: (_text, index) => pending[index].promise });
      app.open();
      const completions = [app.copy(), app.copy()];
      const olderOutcome = newestOutcome === 'resolve' ? 'reject' : 'resolve';
      const order = firstToFinish === 'older' ? [0, 1] : [1, 0];
      let latestSnapshot;
      for (const index of order) {
        pending[index][index === 0 ? olderOutcome : newestOutcome](new Error('controlled clipboard result'));
        await completions[index];
        if (index === 1) latestSnapshot = snapshot(app);
        else if (latestSnapshot) assert.deepEqual(snapshot(app), latestSnapshot);
        else {
          assert.equal(app.status.textContent, '');
          assert.equal(app.fallback(), null);
          assert.equal(app.document.focusLog.length, 0);
        }
      }
      for (const payload of app.writes) assertPayload(payload);
      if (newestOutcome === 'resolve') {
        assert.equal(app.status.textContent, copied);
        assert.equal(app.fallback(), null);
        assert.equal(app.document.focusLog.length, 0);
      } else {
        assertFallback(app);
        assert.equal(app.document.focusLog.length, 1);
      }
    });
  }
}

test('starting a fresh copy clears the previous fallback and status while pending', async () => {
  const pending = deferred();
  const app = harness({ write: (_text, index) => index === 0 ? Promise.reject(new Error('first denied')) : pending.promise });
  app.open();
  await app.copy();
  assertFallback(app);
  const copying = app.copy();
  assert.equal(app.status.textContent, '');
  assert.equal(app.fallback(), null);
  assert.equal(app.label(), null);
  pending.resolve();
  await copying;
  assert.equal(app.status.textContent, copied);
});

test('closing clears old feedback and returns focus to the latest connected card once', async () => {
  const app = harness({ write: () => Promise.reject(new Error('denied')) });
  app.open(1);
  await app.copy();
  assertFallback(app, 1);
  app.close();
  assert.equal(app.status.textContent, '');
  assert.equal(app.fallback(), null);
  assert.equal(app.label(), null);
  const cardFocus = app.document.focusLog.filter(({ node }) => app.cards.includes(node));
  assert.equal(cardFocus.length, 1);
  assert.equal(cardFocus[0].node, app.cards[1]);
  assert.equal(cardFocus[0].options.preventScroll, true);
  assert.deepEqual(Object.keys(cardFocus[0].options), ['preventScroll']);
});

test('closing skips a disconnected trigger and copy clicks on a closed dialog are inert', async () => {
  const app = harness();
  app.open();
  app.cards[0].remove();
  app.close();
  assert.equal(app.document.focusLog.length, 0);
  await app.copy();
  assert.deepEqual(app.writes, []);
  assert.equal(app.status.textContent, '');
  assert.equal(app.fallback(), null);
});
