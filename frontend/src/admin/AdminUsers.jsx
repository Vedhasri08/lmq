import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import {
  Mail,
  ArrowLeft,
  Search,
  MoreHorizontal,
  X,
  Trash2,
  SlidersHorizontal,
  ShieldCheck,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const actionMenuRef = useRef(null);
  const roleMenuRef = useRef(null);

  const openDeleteModal = (user) => {
    setDeleteUser(user);
    setIsDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, role, created_at")
        .order("created_at", { ascending: false });

      if (!error) setUsers(data);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }

      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target)) {
        setIsRoleMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.email
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleReinvite = async (user) => {
    setOpenMenuId(null);

    const { error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: user.email,
    });

    if (!error) {
      toast.success("Re-invitation sent ✨");
    } else {
      toast.error(error.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteUser) return;

    setDeleting(true);

    try {
      const res = await fetch(
        `http://localhost:8000/api/users/${deleteUser.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await res.json();
      console.log("📡 Delete API response:", data);

      if (!res.ok) throw new Error(data.error || "Delete failed");

      setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
      toast.success("User deleted successfully");
    } catch (err) {
      console.error("🔥 Delete failed:", err);
      toast.error(err.message);
    }

    setDeleting(false);
    setIsDeleteModalOpen(false);
    setDeleteUser(null);
  };

  if (loading) {
    return (
      <div className="p-10">
        <p className="text-zinc-400 animate-pulse">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] px-10 py-8">
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft size={16} />
        Back
      </button>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            User Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Control access, roles, and permissions across your platform.
          </p>
        </div>

        <button className="flex items-center gap-2 bg-[#0F172A] hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition">
          <User size={16} />
          Add New User
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 mb-5 shadow-sm">
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative w-full max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          {/* Role Filter */}
          <div className="relative" ref={roleMenuRef}>
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white hover:bg-slate-50"
            >
              <SlidersHorizontal size={15} className="text-slate-500" />
              {roleFilter === "all"
                ? "All Roles"
                : roleFilter === "admin"
                  ? "Admin"
                  : "User"}
            </button>

            {isRoleMenuOpen && (
              <div className="absolute mt-2 w-40 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20">
                <button
                  onClick={() => {
                    setRoleFilter("all");
                    setIsRoleMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                >
                  All Roles
                </button>
                <button
                  onClick={() => {
                    setRoleFilter("admin");
                    setIsRoleMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                >
                  Admin
                </button>
                <button
                  onClick={() => {
                    setRoleFilter("user");
                    setIsRoleMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                >
                  User
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Export */}
        <button className="text-sm text-slate-500 hover:text-slate-700">
          Export
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-xs text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4 text-left">User Email</th>
              <th className="px-6 py-4 text-left">Role</th>
              <th className="px-6 py-4 text-left">Joined Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/60 transition">
                {/* Email */}
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-800">{user.email}</div>
                </td>

                {/* Role */}
                <td className="px-6 py-4">
                  {user.role === "admin" ? (
                    <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-slate-900 text-white">
                      ADMIN
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-slate-100 text-slate-600">
                      USER
                    </span>
                  )}
                </td>

                {/* Joined */}
                <td className="px-6 py-4 text-slate-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right relative">
                  <button
                    onClick={() =>
                      setOpenMenuId(openMenuId === user.id ? null : user.id)
                    }
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <MoreHorizontal size={18} />
                  </button>

                  {openMenuId === user.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30">
                      <button
                        onClick={() => handleReinvite(user)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
                      >
                        Send Re-Invitation
                      </button>
                      <button
                        onClick={() => openDeleteModal(user)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete User
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
          <span>
            Showing 1–{filteredUsers.length} of {users.length} users
          </span>

          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-100">
              Previous
            </button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-100">
              Next
            </button>
          </div>
        </div>
      </div>
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200">
            <div className="p-6">
              <div className="flex justify-between mb-3">
                <h2 className="text-lg font-semibold text-slate-900">
                  Confirm Delete
                </h2>

                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-sm text-slate-600">
                Are you sure you want to delete "{deleteUser.email}"?
              </p>

              <p className="text-xs text-slate-500 mt-3 bg-slate-50 p-3 rounded-md border-l-2 border-[#4F9CF9]">
                This action cannot be undone.
              </p>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-lg text-sm font-semibold shadow-sm transition"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminUsers;
