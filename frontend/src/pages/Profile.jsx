import React from "react";
import Layout from "../components/Layout";

const Profile = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center w-full min-h-[50vh] px-4">
          <div className="text-center text-purple-200 text-lg bg-black/40 border border-purple-600/30 rounded-xl p-12 backdrop-blur-sm">
            No user data found.
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="max-w-md w-full">
          <h1 className="text-5xl font-extrabold text-center mb-8 bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent tracking-wide">
            My Profile
          </h1>

          <div className="bg-black/40 backdrop-blur-sm p-8 rounded-xl border border-purple-600/30 shadow-2xl space-y-4">
            <div className="flex flex-col gap-4">
              <div className="bg-white/5 rounded-full px-6 py-4 border border-purple-600/20 flex items-center justify-between">
                <span className="text-purple-300 text-sm font-semibold uppercase tracking-widest">Name</span>
                <span className="text-white font-bold">{user.name}</span>
              </div>
              <div className="bg-white/5 rounded-full px-6 py-4 border border-purple-600/20 flex items-center justify-between overflow-hidden">
                <span className="text-purple-300 text-sm font-semibold uppercase tracking-widest mr-2 shrink-0">Email</span>
                <span className="text-white font-bold text-sm truncate">{user.email}</span>
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
              }}
              className="w-full mt-4 py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-full font-semibold hover:scale-105 transition-all shadow-lg tracking-wide"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
