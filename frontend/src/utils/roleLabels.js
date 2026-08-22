export const roleLabels = {
  Client: "Usuario",
  Employee: "Empleado",
  SuperAdmin: "Super Admin",
};

export const roleMap = {
  Client: 1,
  Employee: 2,
  SuperAdmin: 3,
};

export const translateRole = (role) => roleLabels[role] || role;
