// theme-toggle.tsx
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const [dark, setDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  )

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [dark])

  return (
    <button
      onClick={() => setDark(!dark)}
      className="rounded-md hidden border px-3 py-1 bg-primary text-primary-foreground"
    >
      {dark ? "🌙 Dark" : "☀️ Light"}
    </button>
  )
}
