// middleware/roleMiddleware.js
export const canAssign = (req, res, next) => {
  const allowedRoles = [
    "it",
    "front office manager",
    "general manager",
    "duty manager",
    "supervisor", // ✅ Add supervisor
  ];

  const userRole = req.user.role?.toLowerCase().trim();

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({
      message: "Access denied: Not authorized to assign tasks",
    });
  }

  next();
};
