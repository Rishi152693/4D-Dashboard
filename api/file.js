const L = require('./_lib');
const { get } = require('@vercel/blob');
const { Readable } = require('stream');
const TYPES = { 'model.json': 'application/json', 'gmeta.json': 'application/json', 'geo.bin': 'application/octet-stream', 'hero.jpg': 'image/jpeg' };
module.exports = async (req, res) => {
  const a = await L.auth(req, res); if (!a) return;
  const p = String(req.query.p || ''), f = String(req.query.f || '');
  if (!TYPES[f] || !L.validId(p)) return L.send(res, 400, { error: 'Bad request' });
  if (!L.canSee(a.u, p)) return L.send(res, 403, { error: 'No access to this project' });
  let r; try { r = await get(`projects/${p}/${f}`, { access: 'private', useCache: false }); } catch (e) { r = null; }
  if (!r || r.statusCode !== 200) return L.send(res, 404, { error: 'Not uploaded yet' });
  res.setHeader('Content-Type', TYPES[f]); res.setHeader('Cache-Control', 'private, max-age=30');
  if (r.blob.size) res.setHeader('Content-Length', String(r.blob.size));
  Readable.fromWeb(r.stream).pipe(res);
};
