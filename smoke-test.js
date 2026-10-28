/* 图灵剧场 数据层冒烟测试：node smoke-test.js */
const fs = require('fs');

const store = {};
const localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; },
};
const el = () => ({
  style: {}, innerHTML: '', textContent: '', disabled: false,
  classList: { toggle() {}, add() {}, remove() {} },
  addEventListener() {},
  querySelectorAll: () => [],
  querySelector: () => null,
  closest: () => null,
});
const els = {};
global.document = {
  getElementById: id => (els[id] = els[id] || el()),
  querySelector: () => null,
  querySelectorAll: () => [],
};
global.localStorage = localStorage;
global.navigator = { userAgent: 'smoke', language: 'zh-CN' };
global.location = { hostname: 'localhost' };
global.screen = { width: 1920, height: 1080 };
global.window = global;
global.addEventListener = () => {};

const html = fs.readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
new Function(blocks[1] + '\n;globalThis.__T = { Store, passageStats, LocalStore, loadLocal, LKEY };')();
const { Store, passageStats, LocalStore, loadLocal, LKEY } = globalThis.__T;

(async () => {
  const passages = await Store.listPassages();
  console.log('seeds loaded:', passages.length);
  if (passages.length !== 10) throw new Error('seed count != 10');

  // 答对一题（human 题答 human）
  const human = passages.find(p => !p.is_ai);
  await Store.addGuess(human.id, 'human', true);
  let mine = await Store.listMine();
  if (mine[human.id] !== 'human') throw new Error('myAnswer not saved');

  // 答错一题（ai 题答 human）
  const ai = passages.find(p => p.is_ai);
  await Store.addGuess(ai.id, 'human', false);

  // 再答一次同一题 → myAnswer 不变（防重复以首次为准）
  await Store.addGuess(human.id, 'ai', false);
  mine = await Store.listMine();
  if (mine[human.id] !== 'human') throw new Error('repeat answer overwrote first');

  const guesses = await Store.listGuesses();
  const stats = passageStats(passages, guesses);
  const aiStats = stats[ai.id];
  if (aiStats.total !== 1 || aiStats.wrong !== 1) throw new Error('stats wrong: ' + JSON.stringify(aiStats));

  const n = await Store.myAnsweredCount();
  console.log('answered count:', n);

  // 出题 + 今日额度
  await Store.addPassage({ text: '这是一段测试用的献演文字，必须超过十五个字才行。', is_ai: true, source_label: 'GLM' });
  const after = await Store.listPassages();
  if (after.length !== 11) throw new Error('addPassage failed');

  // 举报 3 次自动隐藏
  const u = after.find(p => p.author_hash !== 'stage');
  await Store.addReport(u.id); await Store.addReport(u.id); await Store.addReport(u.id);
  const visible = await Store.listPassages();
  if (visible.some(p => p.id === u.id)) throw new Error('reported passage not hidden');

  // 重复启动不重复播种
  Store._d = null; localStorage.removeItem(LKEY);
  const again = await LocalStore.listPassages();
  if (again.length !== 10) throw new Error('re-seed mismatch: ' + again.length);

  console.log('SMOKE TEST PASSED');
})().catch(e => { console.error('SMOKE FAILED:', e.message); process.exit(1); });
