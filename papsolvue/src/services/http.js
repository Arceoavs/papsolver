import axios from "axios";

export default axios.create({
  baseURL: process.env.VUE_API_URL || "/api"
});
