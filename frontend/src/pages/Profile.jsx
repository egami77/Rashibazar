import React from "react";

const Profile = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return (
      <div className="text-center text-white pt-32 text-2xl">
        No user data found.
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen px-6 text-white bg-gradient-to-b from-black via-purple-950 to-black">
      <h1 className="text-4xl font-bold text-yellow-400 text-center mb-6">
        👤 Profile
      </h1>

      <div className="max-w-md mx-auto bg-black/30 p-6 rounded-xl border border-purple-700/30 backdrop-blur-md">
        <p className="text-lg mb-3">
          <span className="font-bold text-yellow-400">Name:</span>{" "}
          {user.name}
        </p>
        <p className="text-lg mb-3">
          <span className="font-bold text-yellow-400">Email:</span>{" "}
          {user.email}
        </p>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
          className="w-full mt-6 bg-red-600 py-2 rounded-full font-semibold"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
