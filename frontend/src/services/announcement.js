import API from "./api";

export const getAnnouncements = () => API.get("/announcements");
