// src/services/kundali.js
import API from "./api";

// Generate new kundali
export const generateKundali = (data) => {
  console.log("   Sending kundali data to API:", data);
  return API.post("/kundali/generate", data);
};

// Check compatibility (Guna Milan)
export const checkCompatibility = (data) => {
  console.log("   Sending compatibility data to API:", data);
  return API.post("/kundali/compatibility", data);
};

// Save compatibility result
export const saveCompatibility = (data) => {
  console.log("   Saving compatibility data to API:", data);
  return API.post("/kundali/compatibility", { ...data, save: true });
};

// Get compatibility history
export const getCompatibilityHistory = () => {
  console.log("   Fetching compatibility history");
  return API.get("/kundali/compatibility/history");
};

// Delete compatibility record
export const deleteCompatibility = (id) => {
  console.log(` Deleting compatibility record with ID: ${id}`);
  return API.delete(`/kundali/compatibility/${id}`);
};

// Get user's kundali history
export const getKundaliHistory = () => {
  console.log("   Fetching kundali history");
  return API.get("/kundali/history");
};

// Get single kundali by ID
export const getKundaliById = (id) => {
  console.log(`   Fetching kundali with ID: ${id}`);
  return API.get(`/kundali/${id}`);
};

// Delete kundali
export const deleteKundali = (id) => {
  console.log(` Deleting kundali with ID: ${id}`);
  return API.delete(`/kundali/${id}`);
};

// Nepal districts for dropdown
// export const NEPAL_CITIES = [
//   'Achham', 'Arghakhanchi', 'Baglung', 'Baitadi', 'Bajhang', 'Bajura',
//   'Banke', 'Bara', 'Bardiya', 'Bhaktapur', 'Bhojpur', 'Chitwan',
//   'Dadeldhura', 'Dailekh', 'Dang', 'Darchula', 'Dhading', 'Dhankuta',
//   'Dhanusha', 'Dolakha', 'Dolpa', 'Doti', 'Rukum East', 'Gorkha',
//   'Gulmi', 'Humla', 'Ilam', 'Jajarkot', 'Jhapa', 'Jumla', 'Kailali',
//   'Kalikot', 'Kanchanpur', 'Kapilvastu', 'Kaski', 'Kathmandu',
//   'Kavrepalanchok', 'Khotang', 'Lalitpur', 'Lamjung', 'Mahottari',
//   'Makwanpur', 'Manang', 'Morang', 'Mugu', 'Mustang', 'Myagdi',
//   'Nawalparasi East', 'Nawalparasi West', 'Nuwakot', 'Okhaldhunga',
//   'Palpa', 'Panchthar', 'Parbat', 'Parsa', 'Pyuthan', 'Ramechhap',
//   'Rasuwa', 'Rautahat', 'Rolpa', 'Rupandehi', 'Salyan', 'Sankhuwasabha',
//   'Saptari', 'Sarlahi', 'Sindhuli', 'Sindhupalchok', 'Siraha',
//   'Solukhumbu', 'Sunsari', 'Surkhet', 'Syangja', 'Tanahun',
//   'Taplejung', 'Terhathum', 'Udayapur', 'Rukum West'
// ];
