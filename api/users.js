const L = require('./_lib');
module.exports = async (req, res) => {
  const a = await L.auth(req, res, { admin: true }); if (!a) return;
  const db = a.db;
  if (req.method === 'GET') return L.send(res, 200, { users: db.users.map(L.pub) });
  if (req.method !== 'POST') return L.send(res, 405, { error: 'Method not allowed' });
  const b = req.body || {}, id = String(b.id || '').trim().toLowerCase(), u = db.users.find(x => x.id === id);
  const admins = () => db.users.filter(x => x.role === 'admin' && !x.disabled).length;
  if (b.action === 'create') {
    if (!L.validId(id)) return L.send(res, 400, { error: 'ID: 2-40 chars, letters/digits/. _ -' });
    if (u) return L.send(res, 400, { error: 'ID already exists' });
    if (!L.strongEnough(b.password)) return L.send(res, 400, { error: 'Password must be 8-100 characters' });
    db.users.push({ id, name: String(b.name || id).slice(0, 80), role: b.role === 'admin' ? 'admin' : 'viewer', hash: L.hashPw(b.password), mustChange: true, disabled: false, projects: Array.isArray(b.projects) ? b.projects : [], fails: 0, lockUntil: 0 });
  } else if (!u) return L.send(res, 404, { error: 'User not found' });
  else if (b.action === 'update') {
    if (b.name !== undefined) u.name = String(b.name).slice(0, 80);
    if (b.projects !== undefined) u.projects = Array.isArray(b.projects) ? b.projects : [];
    if (b.role !== undefined) { if (u.id === a.u.id && b.role !== 'admin') return L.send(res, 400, { error: 'You cannot remove your own admin role' }); u.role = b.role === 'admin' ? 'admin' : 'viewer'; }
    if (b.disabled !== undefined) { if (u.id === a.u.id && b.disabled) return L.send(res, 400, { error: 'You cannot disable yourself' }); u.disabled = !!b.disabled; }
    if (u.role === 'admin' && admins() < 1) return L.send(res, 400, { error: 'At least one active admin is required' });
  } else if (b.action === 'reset') {
    if (!L.strongEnough(b.password)) return L.send(res, 400, { error: 'Password must be 8-100 characters' });
    u.hash = L.hashPw(b.password); u.mustChange = true; u.fails = 0; u.lockUntil = 0;
  } else if (b.action === 'delete') {
    if (u.id === a.u.id) return L.send(res, 400, { error: 'You cannot delete yourself' });
    db.users = db.users.filter(x => x.id !== id);
  } else return L.send(res, 400, { error: 'Unknown action' });
  await L.writeJSON('db/users.json', db); L.send(res, 200, { users: db.users.map(L.pub) });
};
