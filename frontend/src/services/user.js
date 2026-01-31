import API from "./api";

// GET PROFILE
export const getUserProfile = () => API.get("/auth/profile");

// UPDATE PROFILE
export const updateUserProfile = (data) => API.put("/auth/profile", data);
