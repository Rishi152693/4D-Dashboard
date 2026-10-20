const L = require('./_lib');
module.exports = async (req, res) => {
  const a = await L.tryAuth(req).catch(() => null);
  L.send(res, 200, { user: a ? L.pub(a.u) : null });
};
