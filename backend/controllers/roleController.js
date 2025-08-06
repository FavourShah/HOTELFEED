// controllers/roleController.js
import { Role } from "../models/role.js";
import { Staff } from "../models/staff.js";
// GET: All roles
export const getRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ name: 1 });
    res.status(200).json(roles);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch roles." });
  }
};

// POST: Add new role
export const createRole = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Role name is required." });

    const exists = await Role.findOne({ name: name.toLowerCase().trim() });
    if (exists) return res.status(400).json({ message: "Role already exists." });

    const role = await Role.create({ name: name.toLowerCase().trim() });
    res.status(201).json(role);
  } catch (err) {
    res.status(500).json({ message: "Failed to create role." });
  }
};

// PUT: Update role name
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "New name is required." });

    const role = await Role.findById(id);
    if (!role) return res.status(404).json({ message: "Role not found." });

    role.name = name.toLowerCase().trim();
    await role.save();

    res.status(200).json({ message: "Role updated", role });
  } catch (err) {
    res.status(500).json({ message: "Failed to update role." });
  }
};

// DELETE: Remove role


export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the role to delete
    const role = await Role.findById(id);
    if (!role) return res.status(404).json({ message: "Role not found." });

    // Check if any staff member is using this role
    const isAssigned = await Staff.exists({ role: role.name });
    if (isAssigned) {
      return res.status(400).json({
        message: `Cannot delete role '${role.name}' because it is assigned to one or more staff.`,
      });
    }

    // Safe to delete
    await Role.findByIdAndDelete(id);
    res.status(200).json({ message: "Role deleted." });

  } catch (err) {
    res.status(500).json({ message: "Failed to delete role." });
  }
};

