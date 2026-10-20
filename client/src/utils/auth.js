import { jwtDecode } from "jwt-decode";

export const getToken = () => {
  return localStorage.getItem("token");
};

export const setToken = (token) => {
  localStorage.setItem("token", token);
};

export const removeToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("Role");
  localStorage.removeItem("Subscribed");
  localStorage.removeItem("ProfileCompleted");
  localStorage.removeItem("linkedinAccessToken");
  localStorage.removeItem("UserId");
};

export const isAuthenticated = () => {
  const token = getToken();
  // Check if token exists and is not expired
  return token && !isTokenExpired(token);
};

export const isTokenExpired = (token) => {
  try {
    const decodedToken = jwtDecode(token);
    // console.log(decodedToken);

    if (decodedToken.exp < Date.now() / 1000) {
      // Token expired
      removeToken();
      window.location.href = '/'; 
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
};
