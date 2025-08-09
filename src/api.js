import axios from "axios";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: BACKEND,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Users
export async function createUser(payload) {
  const res = await api.post("/users/", payload);
  return res.data;
}
export async function getUsers() {
  const res = await api.get("/users/");
  return res.data;
}

// Messages
export async function sendMessage(payload) {
  const res = await api.post("/messages/", payload);
  return res.data;
}
// Note: backend route: GET /messages/{sender_id}/{receiver_id}
export async function getMessages(sender_id, receiver_id) {
  const res = await api.get(`/messages/${sender_id}/${receiver_id}`);
  return res.data;
}
