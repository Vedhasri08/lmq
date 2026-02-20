import { UserCircle } from "lucide-react";

const ProfileHeader = ({ user, profile }) => {
  return (
    <section
      className="
        bg-white
        rounded-2xl
        border border-slate-200
        shadow-sm
        px-6 py-5
        flex flex-col md:flex-row
        md:items-center md:justify-between
        gap-4
      "
    >
      {/* LEFT */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
          <UserCircle className="w-8 h-8 text-slate-400" />
        </div>

        {/* Name + Meta */}
        <div>
          <h1 className="text-lg font-semibold text-[#0F172A] tracking-tight">
            {profile.full_name || "User"}
          </h1>

          <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>

          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[11px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              Joined {new Date(user.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      {/*<div className="flex items-center gap-2">
        <button
          className="
            text-xs font-medium
            px-3 py-1.5
            rounded-lg
            border border-slate-200
            text-slate-600
            hover:bg-slate-50
            transition
          "
        >
          Share Profile
        </button>

        <button
          className="
            text-xs font-medium
            px-3 py-1.5
            rounded-lg
            bg-[#0F172A]
            text-white
            hover:bg-slate-800
            transition
          "
        >
          Edit Profile
        </button>
      </div>*/}
    </section>
  );
};

export default ProfileHeader;
