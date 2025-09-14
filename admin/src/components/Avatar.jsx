import { useState } from "react";
import authStore from "../store/authStore.js";

function Avatar({ user }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const photoUrl = user?.telegram_photo_url;
  const fallback = user?.name?.charAt(0) || "?";

  return (
    <div
      className="min-w-16 h-16 font-semibold text-2xl flex items-center justify-center rounded-full overflow-hidden"
      style={{ backgroundColor: "var(--color-dark-15)" }}
    >
      {photoUrl && !error ? (
        <>
          {loading && (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-400 animate-pulse">
              Loading...
            </div>
          )}
          <img
            src={photoUrl}
            alt="avatar"
            className={`w-full h-full object-cover ${loading ? "hidden" : "block"}`}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          />
        </>
      ) : (
        user?.name?.charAt(0)
      )}
    </div>
  );
}

export default Avatar;
