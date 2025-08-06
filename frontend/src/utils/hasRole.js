const hasRole = (user, roles = []) => {
  const role = user?.role?.toLowerCase().trim();
  return roles.includes(role);
};
