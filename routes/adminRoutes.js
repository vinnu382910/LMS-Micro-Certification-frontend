const express = require("express");
const router = express.Router();
const { verifyToken, adminOnly } = require("../middleware/authMiddleware");
const {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getResults,
} = require("../controllers/adminController");

router.use(verifyToken, adminOnly);

router.get("/dashboard", getDashboardStats);

router.get("/users", getUsers);
router.patch("/users/:id", updateUserStatus);

router.get("/quizzes", getQuizzes);
router.post("/quizzes", createQuiz);
router.put("/quizzes/:id", updateQuiz);
router.delete("/quizzes/:id", deleteQuiz);

router.get("/results", getResults);

module.exports = router;
