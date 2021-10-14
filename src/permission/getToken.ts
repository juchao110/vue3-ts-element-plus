export default function getToken() {
  if (localStorage["phm_userInfo"])
    return JSON.parse(localStorage["phm_userInfo"]).token;
  else return "";
}
