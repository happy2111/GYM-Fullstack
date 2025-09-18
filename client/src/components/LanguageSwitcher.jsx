import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

const languages = {
  en: "EN",
  ru: "RU",
  uz: "UZ",
};

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const toggleDropdown = () => setOpen((prev) => !prev);

  const handleChange = (lang) => {
    i18n.changeLanguage(lang);
    setOpen(false);
  };

  // закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative z-20" ref={ref}>
      {/* Кнопка */}
      <button
        onClick={toggleDropdown}
        className="px-3 py-1 rounded-lg h-[49px] bg-dark-12 text-gray-70 hover:bg-dark-15 hover:scale-103 flex items-center gap-1 transition"
      >
        {languages[i18n.language] || "EN"}
        <svg
          className={`w-4 h-4 transform transition-transform ${
            open ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Выпадающее меню */}
      {open && (
        <div className="absolute mt-2 w-24 bg-dark-12 rounded-lg shadow-lg overflow-hidden">
          {Object.entries(languages).map(([code, label]) => (
            <button
              key={code}
              onClick={() => handleChange(code)}
              className={`w-full px-3 py-2 text-left text-sm transition ${
                i18n.language === code
                  ? "bg-brown-60 text-white"
                  : "text-gray-70 hover:bg-dark-30 hover:text-brown-70"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
