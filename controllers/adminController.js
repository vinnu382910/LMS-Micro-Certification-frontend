const User = require("../models/User");
const QuestionSet = require("../models/Question");
const Result = require("../models/Result");

const parsePaging = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.max(parseInt(query.limit, 10) || 10, 1);
  return { page, limit, skip: (page - 1) * limit };
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, verifiedUsers, activeUsers, suspendedUsers, totalQuizzes, totalAttempts] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isVerified: true }),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ isSuspended: true }),
        QuestionSet.countDocuments(),
        Result.countDocuments(),
      ]);

    const [passAgg, quizAttemptAgg, failByQuizAgg] = await Promise.all([
      Result.aggregate([
        {
          $group: {
            _id: null,
            passCount: { $sum: { $cond: ["$pass", 1, 0] } },
            total: { $sum: 1 },
          },
        },
      ]),
      Result.aggregate([
        { $group: { _id: "$quizId", attempts: { $sum: 1 } } },
        { $sort: { attempts: -1 } },
        { $limit: 1 },
      ]),
      Result.aggregate([
        { $match: { pass: false } },
        { $group: { _id: "$quizId", fails: { $sum: 1 } } },
        { $sort: { fails: -1 } },
        { $limit: 1 },
      ]),
    ]);

    const passRate = passAgg[0]?.total
      ? Number(((passAgg[0].passCount / passAgg[0].total) * 100).toFixed(2))
      : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        verifiedUsers,
        activeUsers,
        suspendedUsers,
        totalQuizzes,
        totalAttempts,
        passRate,
        mostAttemptedQuizId: quizAttemptAgg[0]?._id || null,
        mostFailedQuizId: failByQuizAgg[0]?._id || null,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { search, role, isActive, isSuspended, isVerified } = req.query;
    const { page, limit, skip } = parsePaging(req.query);

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role && ["USER", "ADMIN"].includes(role)) filter.role = role;
    if (isActive === "true" || isActive === "false") filter.isActive = isActive === "true";
    if (isSuspended === "true" || isSuspended === "false") {
      filter.isSuspended = isSuspended === "true";
    }
    if (isVerified === "true" || isVerified === "false") {
      filter.isVerified = isVerified === "true";
    }

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select("name email role isActive isSuspended isVerified lastLogin createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        limit,
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, isSuspended } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (typeof isActive === "boolean") user.isActive = isActive;
    if (typeof isSuspended === "boolean") user.isSuspended = isSuspended;

    await user.save();
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isSuspended: user.isSuspended,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Update user status error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getQuizzes = async (req, res) => {
  try {
    const { page, limit, skip } = parsePaging(req.query);
    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { quizId: { $regex: req.query.search, $options: "i" } },
      ];
    }
    if (req.query.status && ["DRAFT", "PUBLISHED"].includes(req.query.status)) {
      filter.status = req.query.status;
    }
    if (req.query.isActive === "true" || req.query.isActive === "false") {
      filter.isActive = req.query.isActive === "true";
    }

    const [total, quizzes] = await Promise.all([
      QuestionSet.countDocuments(filter),
      QuestionSet.find(filter)
        .select(
          "quizId title description level timeLimit passMarks totalQuestions technologies status isPublished isActive createdBy createdAt updatedAt"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      quizzes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        limit,
      },
    });
  } catch (error) {
    console.error("Get admin quizzes error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      createdBy: req.user.id,
    };

    if (payload.status === "PUBLISHED") payload.isPublished = true;
    if (payload.isPublished) payload.status = "PUBLISHED";
    if (!payload.status) payload.status = "DRAFT";

    const quiz = await QuestionSet.create(payload);
    return res.status(201).json({ success: true, quiz });
  } catch (error) {
    console.error("Create quiz error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.status === "PUBLISHED") updates.isPublished = true;
    if (typeof updates.isPublished === "boolean") {
      updates.status = updates.isPublished ? "PUBLISHED" : "DRAFT";
    }

    const quiz = await QuestionSet.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    return res.status(200).json({ success: true, quiz });
  } catch (error) {
    console.error("Update quiz error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await QuestionSet.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
    return res.status(200).json({ success: true, message: "Quiz deleted" });
  } catch (error) {
    console.error("Delete quiz error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getResults = async (req, res) => {
  try {
    const { page, limit, skip } = parsePaging(req.query);
    const filter = {};

    if (req.query.quizId) filter.quizId = req.query.quizId;
    if (req.query.pass === "true" || req.query.pass === "false") filter.pass = req.query.pass === "true";
    if (req.query.userId) filter.userId = req.query.userId;
    if (req.query.minScore || req.query.maxScore) {
      filter.score = {};
      if (req.query.minScore) filter.score.$gte = Number(req.query.minScore);
      if (req.query.maxScore) filter.score.$lte = Number(req.query.maxScore);
    }
    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) filter.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.date.$lte = new Date(req.query.endDate);
    }

    const [total, results] = await Promise.all([
      Result.countDocuments(filter),
      Result.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      results,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        limit,
      },
    });
  } catch (error) {
    console.error("Admin results error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
