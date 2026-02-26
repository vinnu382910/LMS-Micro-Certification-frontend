const TOKEN_COOKIE_NAME = "token";

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
};

const setAuthCookie = (res, token) => {
  res.cookie(TOKEN_COOKIE_NAME, token, getCookieOptions());
};

const clearAuthCookie = (res) => {
  res.clearCookie(TOKEN_COOKIE_NAME, {
    ...getCookieOptions(),
    maxAge: 0,
  });
};

module.exports = {
  TOKEN_COOKIE_NAME,
  getCookieOptions,
  setAuthCookie,
  clearAuthCookie,
};
