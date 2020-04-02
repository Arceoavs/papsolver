import axios from "axios";

axios.defaults.headers.common["x-api-key"] =
  process.env.VUE_APP_API_KEY || null;

export default axios.create({
  baseURL: process.env.VUE_APP_API || ""
});
