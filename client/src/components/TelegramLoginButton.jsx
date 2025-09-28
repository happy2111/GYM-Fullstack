import { useEffect } from "react";

export default function TelegramLoginButton() {
  useEffect(() => {
    // Создаём глобальную функцию для callback
    window.onTelegramAuth = (user) => {
      console.log("Telegram login success:", user);
      alert('Logged in as ' + user.first_name + ' ' + user.last_name + ' (' + user.id + (user.username ? ', @' + user.username : '') + ')');
    }
      // fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/auth/telegram`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(user),
      // })
      //   .then((res) => res.json())
      //   .then((data) => {
      //     console.log("Login success:", data);
      //     localStorage.setItem("token", data.token); // сохраняем JWT
      //     window.location.href = "/profile"; // редирект
      //   })
      //   .catch((err) => console.error("Telegram login failed:", err));
    // };

    // Вставляем Telegram widget script
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", "bullfituz_bot"); // ⚠️ замени на username своего бота без @
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;

    document.getElementById("telegram-login-container").appendChild(script);
  }, []);

  return <div id="telegram-login-container" className="w-full mb-6 flex justify-center"></div>;
}
