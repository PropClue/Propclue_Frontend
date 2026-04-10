import Cookies from "js-cookie";

export const CK = {
  ID: "user_id",
  ACCESS: "access_token",
};

export const getCookie = (name: string) => {
  return Cookies.get(name);
};
