const crypto = require('crypto');
const { put, get } = require('@vercel/blob');
const SECRET = process.env.SESSION_SECRET || '';
const TTL = 8 * 3600 * 1000;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b64u = s => Buffer.from(s).toString('base64url');
function sign(p) { const body = b64u(JSON.stringify(p)); return body + '.' + crypto.createHmac('sha256', SECRET).update(body).digest('base64url'); }
function verify(tok) {
  if (!tok || !SECRET) return null; const [body, mac] = tok.split('.'); if (!body || !mac) return null;
  const m = crypto.createHmac('sha256', SECRET).update(body).digest('base64url'), a = Buffer.from(mac), b = Buffer.from(m);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try { const p = JSON.parse(Buffer.from(body, 'base64url').toString()); return p.exp > Date.now() ? p : null; } catch (e) { return null; }
}
function hashPw(pw, salt = crypto.randomBytes(16).toString('hex')) { return salt + ':' + crypto.scryptSync(pw, salt, 64).toString('hex'); }
function checkPw(pw, stored) {
  const [salt, h] = String(stored).split(':'); if (!salt || !h) return false;
  const c = crypto.scryptSync(pw, salt, 64), hb = Buffer.from(h, 'hex'); return hb.length === c.length && crypto.timingSafeEqual(hb, c);
}
async function readJSON(path, def) {
  try { const r = await get(path, { access: 'private', useCache: false }); if (!r || r.statusCode !== 200) return def; return JSON.parse(await new Response(r.stream).text()); } catch (e) { return def; }
}
async function writeJSON(path, obj) { await put(path, JSON.stringify(obj), { access: 'private', allowOverwrite: true, addRandomSuffix: false, contentType: 'application/json' }); }
async function loadUsers() {
  let db = await readJSON('db/users.json', null);
  if (!db) {
    const pw = process.env.ADMIN_PASSWORD || crypto.randomBytes(9).toString('hex');
    db = { users: [{ id: (process.env.ADMIN_ID || 'admin').toLowerCase(), name: 'Administrator', role: 'admin', hash: hashPw(pw), mustChange: true, disabled: false, projects: [], fails: 0, lockUntil: 0 }] };
    await writeJSON('db/users.json', db);
  }
  return db;
}
const loadProjects = async () => (await readJSON('db/projects.json', { projects: [] }));
function cookie(req, name) { const c = req.headers.cookie || ''; const m = c.split(';').map(s => s.trim()).find(s => s.startsWith(name + '=')); return m ? decodeURIComponent(m.slice(name.length + 1)) : null; }
function setSession(res, u) {
  const tok = sign({ u: u.id, pv: u.hash.slice(-8), exp: Date.now() + TTL });
  res.setHeader('Set-Cookie', `sid=${encodeURIComponent(tok)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${TTL / 1000}`);
}
function clearSession(res) { res.setHeader('Set-Cookie', 'sid=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'); }
const send = (res, code, obj) => { res.status(code).setHeader('Cache-Control', 'no-store'); res.json(obj); };
function sameOrigin(req) { const o = req.headers.origin; if (!o) return true; try { return new URL(o).host === req.headers.host; } catch (e) { return false; } }
async function tryAuth(req) {
  if (!SECRET) return null; const p = verify(cookie(req, 'sid')); if (!p) return null;
  const db = await loadUsers(), u = db.users.find(x => x.id === p.u);
  if (!u || u.disabled || u.hash.slice(-8) !== p.pv) return null; return { u, db };
}
async function auth(req, res, opt = {}) {
  if (!SECRET) { send(res, 500, { error: 'Server not configured (SESSION_SECRET missing)' }); return null; }
  if (req.method !== 'GET' && !sameOrigin(req)) { send(res, 403, { error: 'Bad origin' }); return null; }
  const a = await tryAuth(req); if (!a) { send(res, 401, { error: 'Not logged in' }); return null; }
  if (opt.admin && a.u.role !== 'admin') { send(res, 403, { error: 'Admin only' }); return null; }
  return a;
}
const pub = u => ({ id: u.id, name: u.name, role: u.role, mustChange: !!u.mustChange, disabled: !!u.disabled, projects: u.projects || [] });
const canSee = (u, pid) => u.role === 'admin' || (u.projects || []).includes(pid);
const validId = s => /^[a-z0-9][a-z0-9._-]{1,39}$/.test(s || '');
const strongEnough = pw => typeof pw === 'string' && pw.length >= 8 && pw.length <= 100;
module.exports = { tryAuth, sleep, hashPw, checkPw, readJSON, writeJSON, loadUsers, loadProjects, setSession, clearSession, send, auth, pub, canSee, validId, strongEnough, cookie, verify, sign, sameOrigin };
