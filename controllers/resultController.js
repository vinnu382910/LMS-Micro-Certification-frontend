const QuestionSet = require("../models/Question");
const Result = require("../models/Result");
const mongoose = require("mongoose");

const SORT_MAP = {
  "date-desc": { date: -1, score: -1 },
  "date-asc": { date: 1, score: -1 },
  "score-desc": { score: -1, date: -1 },
  "score-asc": { score: 1, date: -1 },
};

exports.getUserResults = async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = { userId };
    const {
      pass,
      quizId,
      level,
      startDate,
      endDate,
      minScore,
      maxScore,
      sortBy = "date-desc",
      page = 1,
      limit = 10,
    } = req.query;

    if (pass === "true") filters.pass = true;
    if (pass === "false") filters.pass = false;
    if (quizId) filters.quizId = quizId;
    if (level) filters.level = level;

    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }

    if (minScore || maxScore) {
      filters.score = {};
      if (minScore) filters.score.$gte = Number(minScore);
      if (maxScore) filters.score.$lte = Number(maxScore);
    }

    const totalAttempts = await Result.countDocuments({ userId });
    const passedCount = await Result.countDocuments({ userId, pass: true });
    const failedCount = totalAttempts - passedCount;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageLimit = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNumber - 1) * pageLimit;
    const sort = SORT_MAP[sortBy] || SORT_MAP["date-desc"];

    const aggregateFilters = { ...filters };
    if (mongoose.Types.ObjectId.isValid(userId)) {
      aggregateFilters.userId = new mongoose.Types.ObjectId(userId);
    }

    const [totalResults, results, aggregate] = await Promise.all([
      Result.countDocuments(filters),
      Result.find(filters).sort(sort).skip(skip).limit(pageLimit).lean(),
      Result.aggregate([
        { $match: aggregateFilters },
        {
          $group: {
            _id: null,
            averageScore: { $avg: "$score" },
            averageTimeTakenSeconds: { $avg: "$timeTakenSeconds" },
            passCount: { $sum: { $cond: ["$pass", 1, 0] } },
            total: { $sum: 1 },
          },
        },
      ]),
    ]);

    if (!results.length) {
      return res.status(200).json({
        success: true,
        message: "No results found for given filters.",
        stats: { totalAttempts, passedCount, failedCount },
        performance: {
          averageScore: 0,
          passRate: 0,
          averageTimeTakenSeconds: 0,
        },
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(totalResults / pageLimit),
          totalResults,
          limit: pageLimit,
        },
        filtersApplied: filters,
        results: [],
      });
    }

    const quizzesById = new Map(
      (
        await QuestionSet.find({ quizId: { $in: [...new Set(results.map((item) => item.quizId))] } })
          .select("quizId title level")
          .lean()
      ).map((quiz) => [quiz.quizId, quiz])
    );

    const enrichedResults = results.map((item) => {
      const quiz = quizzesById.get(item.quizId);
      return {
        resultId: item._id,
        userName: item.userName,
        quizId: item.quizId,
        quizTitle: quiz?.title || item.quizTitle || "N/A",
        level: quiz?.level || item.level || "N/A",
        score: item.score,
        pass: item.pass,
        correctCount: item.correctCount,
        wrongCount: item.wrongCount,
        totalQuestions: item.totalQuestions,
        answeredQuestions: item.answeredQuestions || 0,
        timeTakenSeconds: item.timeTakenSeconds || 0,
        date: item.date,
      };
    });

    const metrics = aggregate[0] || {
      averageScore: 0,
      averageTimeTakenSeconds: 0,
      passCount: 0,
      total: 0,
    };
    const passRate = metrics.total ? (metrics.passCount / metrics.total) * 100 : 0;

    return res.status(200).json({
      success: true,
      stats: { totalAttempts, passedCount, failedCount },
      performance: {
        averageScore: Number((metrics.averageScore || 0).toFixed(2)),
        passRate: Number(passRate.toFixed(2)),
        averageTimeTakenSeconds: Math.round(metrics.averageTimeTakenSeconds || 0),
      },
      pagination: {
        totalResults,
        totalPages: Math.ceil(totalResults / pageLimit),
        currentPage: pageNumber,
        limit: pageLimit,
      },
      filtersApplied: filters,
      results: enrichedResults,
    });
  } catch (error) {
    console.error("Error fetching user results:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
