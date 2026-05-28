import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { changePassword } from "../services/auth";

const validatePassword = (password) =>
  /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/.test(password);

const ChangePasswordForm = ({ className = "" }) => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmNewPassword } = form;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error("All fields are required");
      return;
    }
    if (!validatePassword(newPassword)) {
      toast.error("Password must be at least 8 characters with a number and special character");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword, confirmNewPassword });
      setForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch {
      // toast handled in service
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    "w-full bg-white/5 border border-purple-600/30 rounded-full pl-12 pr-12 py-3 text-white text-sm outline-none focus:border-purple-500 transition-all";

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Lock className="h-4 w-4 text-purple-400" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-purple-300">
          Change Password
        </h2>
      </div>

      {[
        { name: "currentPassword", label: "Current password", key: "current" },
        { name: "newPassword", label: "New password", key: "new" },
        { name: "confirmNewPassword", label: "Confirm new password", key: "confirm" },
      ].map(({ name, label, key }) => (
        <div key={name} className="space-y-1.5">
          <label className="text-xs text-gray-400 font-medium ml-2">{label}</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type={show[key] ? "text" : "password"}
              name={name}
              value={form[name]}
              onChange={handleChange}
              className={fieldClass}
              autoComplete={name === "currentPassword" ? "current-password" : "new-password"}
              required
            />
            <button
              type="button"
              onClick={() => setShow((s) => ({ ...s, [key]: !s[key] }))}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              aria-label={`Toggle ${label}`}
            >
              {show[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      ))}

      <p className="text-[10px] text-gray-500 ml-2">
        At least 8 characters, one number, and one special character (!@#$%^&*)
      </p>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-black rounded-full font-semibold hover:scale-[1.02] transition-all shadow-lg disabled:opacity-50 disabled:hover:scale-100"
      >
        {loading ? "Updating…" : "Update Password"}
      </button>
    </form>
  );
};

export default ChangePasswordForm;
