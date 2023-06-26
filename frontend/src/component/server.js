import axios from "axios";

const server = axios.create({
  baseURL: "https://todoapp-production-185c.up.railway.app/",
});

export default server;