import {useEffect} from "react";
import authStore from "../store/authStore.js";
import { useNavigate } from "react-router-dom";
import { observer } from 'mobx-react-lite';


const GoogleAuthCallBack = observer(() => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        await authStore.refreshToken();
        navigate("/profile");
      } catch (error) {
        console.error("Google callback:", error);
        navigate("/login?error=google_auth_failed");
      }
    };

    handleGoogleCallback();
  }, [navigate]);
  return (
    <div>
      Loading Google login...
    </div>
  );
});

export default GoogleAuthCallBack;