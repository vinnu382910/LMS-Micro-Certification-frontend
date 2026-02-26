const crypto = require("crypto");

const createRawToken = (size = 32) => crypto.randomBytes(size).toString("hex");

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

module.exports = {
  createRawToken,
  hashToken,
};
