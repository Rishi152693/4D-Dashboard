const L = require('./_lib');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return L.send(res, 405, { error: 'POST only' });
  const a = await L.auth(req, res); if (!a) return;
  const b = req.body || {};
  if (!L.checkPw(String(b.current || ''), a.u.hash)) return L.send(res, 400, { error: 'Current password is wrong' });
  if (!L.strongEnough(b.next)) return L.send(res, 400, { error: 'New password must be 8-100 characters' });
  if (b.next === b.current) return L.send(res, 400, { error: 'Choose a different password' });
  a.u.hash = L.hashPw(b.next); a.u.mustChange = false; await L.writeJSON('db/users.json', a.db);
  L.setSession(res, a.u); L.send(res, 200, { user: L.pub(a.u) });
};
