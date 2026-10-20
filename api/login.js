const L = require('./_lib');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return L.send(res, 405, { error: 'POST only' });
  if (!L.sameOrigin(req)) return L.send(res, 403, { error: 'Bad origin' });
  const b = req.body || {}, id = String(b.id || '').trim().toLowerCase(), pw = String(b.password || '');
  const db = await L.loadUsers(), u = db.users.find(x => x.id === id);
  await L.sleep(350);
  const bad = () => L.send(res, 401, { error: 'Wrong ID or password' });
  if (!u || u.disabled) return bad();
  if (u.lockUntil && u.lockUntil > Date.now()) return L.send(res, 429, { error: 'Too many attempts. Try again in a few minutes.' });
  if (!L.checkPw(pw, u.hash)) {
    u.fails = (u.fails || 0) + 1; if (u.fails >= 5) { u.lockUntil = Date.now() + 10 * 60 * 1000; u.fails = 0; }
    await L.writeJSON('db/users.json', db); return bad();
  }
  if (u.fails || u.lockUntil) { u.fails = 0; u.lockUntil = 0; await L.writeJSON('db/users.json', db); }
  L.setSession(res, u); L.send(res, 200, { user: L.pub(u) });
};
