import React, { useMemo, useRef } from "react";
import "./OtpInput.css";

const OtpInput = ({ value = "", onChange, length = 6, disabled = false }) => {
  const refs = useRef([]);
  const digits = useMemo(
    () =>
      Array.from({ length }, (_, i) =>
        String(value || "")
          .replace(/\D/g, "")
          .slice(0, length)
          .charAt(i) || ""
      ),
    [value, length]
  );

  const emit = (nextDigits) => {
    onChange(nextDigits.join(""));
  };

  const handleChange = (index, raw) => {
    const clean = String(raw || "").replace(/\D/g, "");
    if (!clean) {
      const next = [...digits];
      next[index] = "";
      emit(next);
      return;
    }

    const next = [...digits];
    const values = clean.slice(0, length - index).split("");
    values.forEach((char, offset) => {
      next[index + offset] = char;
    });
    emit(next);

    const focusIndex = Math.min(index + values.length, length - 1);
    refs.current[focusIndex]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    const next = Array.from({ length }, (_, i) => pasted[i] || "");
    emit(next);
    refs.current[Math.min(pasted.length - 1, length - 1)]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < length - 1) refs.current[index + 1]?.focus();
  };

  return (
    <div className="otp-wrapper">
      <div className="otp-row" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              refs.current[index] = el;
            }}
            className="otp-cell"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
          />
        ))}
      </div>
    </div>
  );
};

export default OtpInput;
