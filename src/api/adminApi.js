import API from "./api";

const adminApi = {
  getDashboard: () => API.get("/admin/dashboard"),
  getUsers: (params) => API.get("/admin/users", { params }),
  updateUser: (id, payload) => API.patch(`/admin/users/${id}`, payload),
  getQuizzes: (params) => API.get("/admin/quizzes", { params }),
  createQuiz: (payload) => API.post("/admin/quizzes", payload),
  updateQuiz: (id, payload) => API.put(`/admin/quizzes/${id}`, payload),
  deleteQuiz: (id) => API.delete(`/admin/quizzes/${id}`),
  getResults: (params) => API.get("/admin/results", { params }),
};

export default adminApi;
