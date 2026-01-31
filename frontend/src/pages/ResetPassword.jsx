// import React, { useEffect, useState } from "react";
// import { getUser } from "../services/auth"; // helper to decode JWT or fetch user from backend

// const Profile = () => {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const data = getUser();
//     setUser(data);
//   }, []);

//   if (!user) return <p className="pt-24 text-center text-white">Loading...</p>;

//   return (
//     <div className="pt-24 min-h-screen px-6 bg-gradient-to-b from-black via-purple-950 to-black text-white">
//       <h1 className="text-4xl font-bold text-yellow-400 mb-8 text-center">👤 Profile</h1>
//       <div className="max-w-md mx-auto bg-black/30 p-6 rounded-xl border border-purple-700/30">
//         <p className="mb-2"><strong>Name:</strong> {user.name}</p>
//         <p className="mb-2"><strong>Email:</strong> {user.email}</p>
//         <p className="mb-2"><strong>User ID:</strong> {user.id}</p>
//       </div>
//     </div>
//   );
// };

// // export default Profile;
