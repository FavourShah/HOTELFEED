// Block guest users from accessing certain routes
export const notGuest = (req, res, next) => {
  if (req.user.role === "guest") {
    return res.status(403).json({ message: "Access denied for guest users" });
  }
  next();
};
