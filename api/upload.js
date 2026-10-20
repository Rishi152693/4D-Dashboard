const L = require('./_lib');
const { handleUpload } = require('@vercel/blob/client');
const OK = /^projects\/[a-z0-9][a-z0-9._-]{1,39}\/(model\.json|gmeta\.json|geo\.bin|hero\.jpg|source\.xer)$/;
module.exports = async (req, res) => {
  if (req.method !== 'POST') return L.send(res, 405, { error: 'POST only' });
  const a = await L.auth(req, res, { admin: true }); if (!a) return;
  try {
    const out = await handleUpload({
      body: req.body, request: req,
      onBeforeGenerateToken: async (pathname) => {
        if (!OK.test(pathname)) throw new Error('Path not allowed');
        const pdb = await L.loadProjects(); if (!pdb.projects.some(p => pathname.startsWith('projects/' + p.id + '/'))) throw new Error('Create the project first');
        return { maximumSizeInBytes: 120 * 1024 * 1024, addRandomSuffix: false, allowOverwrite: true };
      },
      onUploadCompleted: async () => { }
    });
    L.send(res, 200, out);
  } catch (e) { L.send(res, 400, { error: e.message }); }
};
