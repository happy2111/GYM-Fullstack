import { useEffect } from "react";

export default function TelegramLoginButton() {
  useEffect(() => {
    // Глобальная функция, которую вызовет Telegram
    window.onTelegramAuth = (user) => {
      console.log("Telegram login success:", user);

      fetch(`${import.meta.env.VITE_API_BASE}/auth/telegram/widget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
        credentials: "include", // чтобы refreshToken попал в куки
      })
        .then(res => res.json())
        .then(data => {
          console.log("Backend response:", data);
          if (data.accessToken) {
            localStorage.setItem("token", data.accessToken);
            window.location.href = "/profile";
          } else {
            console.error("Нет accessToken в ответе:", data);
          }
        })
        .catch(err => console.error("Telegram login failed:", err));
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", "bullfituz_bot"); // ⚠️ username своего бота
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "onTelegramAuth(user)"); // ⚠️ без (user)!
    script.setAttribute("data-request-access", "write");
    script.async = true;

    document.getElementById("telegram-login-container").appendChild(script);
  }, []);

  return <div id="telegram-login-container" className="w-full mb-6 flex justify-center"></div>;
}
