// Use after `protect`. Only allows users whose token carries the admin role.
module.exports = function adminOnly(req, res, next) {
  if (req.user?.role === "admin") return next();
  res.status(403).json({ message: "Admin access required" });
};
