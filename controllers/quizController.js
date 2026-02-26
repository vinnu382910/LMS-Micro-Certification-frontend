const QuestionSet = require("../models/Question");
const Result = require("../models/Result");
const User = require("../models/User"); 
const ExamSession = require("../models/ExamSession");
const { v4: uuidv4 } = require("uuid"); // for unique session IDs

const isSessionExpired = (session) => {
  if (!session?.expiresAt) return true;
  return new Date(session.expiresAt).getTime() <= Date.now();
};

// GET /quiz/list?level=Easy&type=Python&search=python
exports.getAllQuizzes = async (req, res) => {

  try {
    const { level, tech, search, page = 1, limit = 9 } = req.query;

    // 🧠 Build dynamic MongoDB filter
    const filter = { isActive: { $ne: false }, isPublished: { $ne: false } };

    // Filter by Level (case-insensitive)
    if (level && ["easy", "medium", "hard"].includes(level.toLowerCase())) {
      filter.level = new RegExp(`^${level}$`, "i");
    }

    // Filter by Technology (partial match inside array)
    if (tech && tech.trim() !== "") {
      filter.technologies = { $regex: new RegExp(tech, "i") };
    }

    // Keyword search (title or description)
    if (search && search.trim() !== "") {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageLimit = Math.max(parseInt(limit, 10) || 9, 1);
    const skip = (pageNumber - 1) * pageLimit;

    const totalQuizzes = await QuestionSet.countDocuments(filter);

    // Fetch quizzes (paginated)
    const quizzes = await QuestionSet.find(filter, {
      quizId: 1,
      title: 1,
      description: 1,
      level: 1,
      timeLimit: 1,
      passMarks: 1,
      technologies: 1,
      totalQuestions: 1,
      _id: 0,
    })
      .sort({ title: 1 })
      .skip(skip)
      .limit(pageLimit);

    // ✅ Return success even if no quizzes found
    if (!quizzes || quizzes.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No Quizzes Found",
        quizzes: [],
        pagination: {
          currentPage: pageNumber,
          totalPages: 0,
          totalQuizzes: 0,
          limit: pageLimit,
          hasNextPage: false,
          hasPrevPage: pageNumber > 1,
        },
      });
    }

    const totalPages = Math.ceil(totalQuizzes / pageLimit);

    return res.status(200).json({
      success: true,
      quizzes,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalQuizzes,
        limit: pageLimit,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching quiz list:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Server error. Please try again later." });
  }
};



// Fetch questions by quizId
// Controller: getQuizQuestions
exports.getQuizQuestions = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;
    const examSessionId =
      req.headers["x-exam-session"] || req.query.sessionId; // ✅ check both

    if (!examSessionId) {
      return res.status(403).json({ message: "No active exam session found" });
    }

    const session = await ExamSession.findOne({
      userId,
      quizId,
      examSessionId,
      isSubmitted: false,
    });
    if (!session) {
      return res.status(403).json({ message: "Invalid or expired session" });
    }
    if (isSessionExpired(session)) {
      session.isSubmitted = true;
      await session.save();
      return res.status(403).json({ message: "Exam session expired. Start again." });
    }

    const quiz = await QuestionSet.findOne({ quizId, isActive: { $ne: false }, isPublished: { $ne: false } });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const quizDetails = {
      title: quiz.title,
      description: quiz.description,
      level: quiz.level,
      timeLimit: quiz.timeLimit,
      totalQuestions: quiz.totalQuestions,
      passingMarks: quiz.passMarks,
    };

    const questions = quiz.questions.map((q) => ({
      questionText: q.questionText,
      options: q.options,
    }));

    res.status(200).json({ quiz: quizDetails, questions });
  } catch (err) {
    console.error("Error fetching quiz questions:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};




// Submit quiz answers

// POST /quiz/submit - Submit quiz answers
exports.submitQuiz = async (req, res) => {
  try {
    const { answers, quizId, examSessionId, timeTakenSeconds = 0, answeredQuestions } = req.body;
    const userId = req.user.id;

    const session = await ExamSession.findOne({ userId, quizId, examSessionId });
    if (!session || session.isSubmitted) {
      return res.status(403).json({ message: "Invalid or expired exam session" });
    }
    if (isSessionExpired(session)) {
      session.isSubmitted = true;
      await session.save();
      return res.status(403).json({ message: "Exam session expired. Start again." });
    }

    // Fetch quiz set
    const questionSet = await QuestionSet.findOne({ quizId, isActive: { $ne: false }, isPublished: { $ne: false } });
    if (!questionSet) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const user = await User.findById(userId);
    const userName = user ? user.name : "Unknown";

    let score = 0;
    const detailedResults = [];
    let correctCount = 0;
    let wrongCount = 0;

    questionSet.questions.forEach((question, index) => {
      const userAnswer = answers[index] || null;
      const isCorrect = question.correctAnswer === userAnswer;

      if (isCorrect) score++, correctCount++;
      else wrongCount++;

      detailedResults.push({
        questionText: question.questionText,
        options: question.options,
        correctAnswer: question.correctAnswer,
        userAnswer,
        isCorrect,
      });
    });

    const pass = score >= questionSet.passMarks;

    const normalizedAnsweredQuestions = Number.isFinite(answeredQuestions)
      ? Math.max(0, Math.min(answeredQuestions, questionSet.questions.length))
      : answers.filter((value) => value !== "").length;
    const normalizedTimeTakenSeconds = Math.max(0, Number(timeTakenSeconds) || 0);

    // Keep only one best-score result per user+quiz.
    const existingResult = await Result.findOne({ userId, quizId });
    let result = existingResult;

    if (!existingResult) {
      result = await Result.create({
        userId,
        userName,
        quizId,
        quizTitle: questionSet.title,
        level: questionSet.level,
        score,
        pass,
        correctCount,
        wrongCount,
        totalQuestions: questionSet.questions.length,
        technologies: questionSet.technologies,
        answeredQuestions: normalizedAnsweredQuestions,
        timeTakenSeconds: normalizedTimeTakenSeconds,
      });
    } else {
      const isBetterScore = score > existingResult.score;
      const isSameScoreFaster =
        score === existingResult.score &&
        normalizedTimeTakenSeconds > 0 &&
        (existingResult.timeTakenSeconds === 0 ||
          normalizedTimeTakenSeconds < existingResult.timeTakenSeconds);

      if (isBetterScore || isSameScoreFaster) {
        existingResult.userName = userName;
        existingResult.quizTitle = questionSet.title;
        existingResult.level = questionSet.level;
        existingResult.score = score;
        existingResult.pass = pass;
        existingResult.correctCount = correctCount;
        existingResult.wrongCount = wrongCount;
        existingResult.totalQuestions = questionSet.questions.length;
        existingResult.technologies = questionSet.technologies;
        existingResult.answeredQuestions = normalizedAnsweredQuestions;
        existingResult.timeTakenSeconds = normalizedTimeTakenSeconds;
        existingResult.date = new Date();
        result = await existingResult.save();
      }
    }

    // Mark session as submitted
    session.isSubmitted = true;
    await session.save();

    res.status(200).json({
      success: true,
      score,
      pass,
      resultId: result._id,
      totalQuestions: questionSet.questions.length,
      correctCount,
      wrongCount,
      detailedResults,
      technologies: questionSet.technologies
    });
  } catch (error) {
    console.error("Error submitting quiz:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};




// POST /quiz/start/:quizId
exports.startExam = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const quiz = await QuestionSet.findOne({ quizId, isActive: { $ne: false }, isPublished: { $ne: false } });
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    // check if already active session exists
    const existingSession = await ExamSession.findOne({ userId, quizId, isSubmitted: false });
    if (existingSession) {
      if (isSessionExpired(existingSession)) {
        existingSession.isSubmitted = true;
        await existingSession.save();
      } else {
        return res.status(200).json({
          success: true,
          message: "Existing active session found",
          examSessionId: existingSession.examSessionId,
          expiresAt: existingSession.expiresAt,
        });
      }
    }

    // Create new exam session
    const examSessionId = uuidv4();
    const expiresAt = new Date(Date.now() + quiz.timeLimit * 60 * 1000); // timeLimit in minutes

    await ExamSession.create({
      userId,
      quizId,
      examSessionId,
      expiresAt,
    });

    res.status(201).json({
      success: true,
      message: "Exam started successfully",
      examSessionId,
      expiresAt,
    });
  } catch (error) {
    console.error("Error starting exam:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /quiz/technologies
exports.getQuizTechnologies = async (req, res) => {
  try {
    const technologies = await QuestionSet.aggregate([
      { $unwind: "$technologies" },
      { $project: { tech: { $trim: { input: "$technologies" } } } },
      { $match: { tech: { $ne: "" } } },
      { $group: { _id: "$tech" } },
      { $sort: { _id: 1 } },
    ]);

    return res.status(200).json({
      success: true,
      technologies: technologies.map((item) => item._id),
    });
  } catch (error) {
    console.error("Error fetching technologies:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /quiz/leaderboard/:quizId
exports.getQuizLeaderboard = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await QuestionSet.findOne({ quizId }).select("quizId title totalQuestions");
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    const topResults = await Result.aggregate([
      { $match: { quizId, pass: true } },
      { $sort: { score: -1, timeTakenSeconds: 1, date: 1 } },
      {
        $group: {
          _id: "$userId",
          userName: { $first: "$userName" },
          score: { $first: "$score" },
          totalQuestions: { $first: "$totalQuestions" },
          timeTakenSeconds: { $first: "$timeTakenSeconds" },
          date: { $first: "$date" },
        },
      },
      { $sort: { score: -1, timeTakenSeconds: 1, date: 1 } },
      { $limit: 10 },
    ]);

    const leaderboard = topResults.map((item, index) => ({
      rank: index + 1,
      userName: item.userName,
      score: item.score,
      totalQuestions: item.totalQuestions || quiz.totalQuestions,
      percentage:
        (item.totalQuestions || quiz.totalQuestions)
          ? Number((((item.score || 0) / (item.totalQuestions || quiz.totalQuestions)) * 100).toFixed(2))
          : 0,
      timeTakenSeconds: item.timeTakenSeconds || 0,
      date: item.date,
    }));

    return res.status(200).json({
      success: true,
      quiz: { quizId: quiz.quizId, title: quiz.title },
      leaderboard,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// GET /quiz/info/:quizId - basic quiz info (no questions)
exports.getQuizInfo = async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const questionSet = await QuestionSet.findOne({ quizId, isActive: { $ne: false }, isPublished: { $ne: false } })
      .select("title description level timeLimit totalQuestions passMarks");

    if (!questionSet) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.status(200).json({
      success: true,
      quiz: questionSet,
    });
  } catch (err) {
    console.error("Error fetching quiz info:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
