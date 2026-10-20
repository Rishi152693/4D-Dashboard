const L = require('./_lib');
const { list, del } = require('@vercel/blob');
const FILES = ['model', 'gmeta', 'geo', 'hero'];
module.exports = async (req, res) => {
  const a = await L.auth(req, res); if (!a) return;
  const pdb = await L.loadProjects();
  if (req.method === 'GET') return L.send(res, 200, { projects: pdb.projects.filter(p => L.canSee(a.u, p.id)) });
  if (req.method !== 'POST') return L.send(res, 405, { error: 'Method not allowed' });
  if (a.u.role !== 'admin') return L.send(res, 403, { error: 'Admin only' });
  const b = req.body || {}, id = String(b.id || '').trim().toLowerCase(), p = pdb.projects.find(x => x.id === id);
  const clean = s => String(s || '').slice(0, 160);
  const loc = l => l && isFinite(+l.lat) && isFinite(+l.lon) && Math.abs(+l.lat) <= 90 && Math.abs(+l.lon) <= 180 ? { name: clean(l.name), lat: +l.lat, lon: +l.lon } : null;
  if (b.action === 'create') {
    if (!L.validId(id)) return L.send(res, 400, { error: 'Project ID: 2-40 chars, lowercase letters/digits/. _ -' });
    if (p) return L.send(res, 400, { error: 'Project ID already exists' });
    if (!b.name) return L.send(res, 400, { error: 'Project name required' });
    pdb.projects.push({ id, name: clean(b.name), client: clean(b.client), presentedBy: clean(b.presentedBy), location: loc(b.location), files: {}, summary: null, created: Date.now() });
  } else if (!p) return L.send(res, 404, { error: 'Project not found' });
  else if (b.action === 'update') {
    if (b.name !== undefined) p.name = clean(b.name); if (b.client !== undefined) p.client = clean(b.client);
    if (b.presentedBy !== undefined) p.presentedBy = clean(b.presentedBy); if (b.location !== undefined) p.location = loc(b.location);
  } else if (b.action === 'files') {
    p.files = p.files || {}; FILES.forEach(k => { if (b.files && b.files[k]) p.files[k] = Date.now(); });
    if (b.summary && typeof b.summary === 'object') p.summary = b.summary;
  } else if (b.action === 'delete') {
    pdb.projects = pdb.projects.filter(x => x.id !== id);
    const ud = a.db; ud.users.forEach(u => u.projects = (u.projects || []).filter(x => x !== id)); await L.writeJSON('db/users.json', ud);
    try { const r = await list({ prefix: 'projects/' + id + '/' }); if (r.blobs.length) await del(r.blobs.map(x => x.url)); } catch (e) { }
  } else return L.send(res, 400, { error: 'Unknown action' });
  await L.writeJSON('db/projects.json', pdb); L.send(res, 200, { projects: pdb.projects });
};
