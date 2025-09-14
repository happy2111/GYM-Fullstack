import authStore from "../store/authStore.js";
import Avatar from "./Avatar.jsx";
import { Link } from "react-router-dom";

const ProfileInfo = ({isProfileRoot}) => {
  return (
    <Link to={"account-preference"} className={`p-8 flex items-center gap-3 bg-dark-10 rounded-2xl mb-6 ${isProfileRoot ? "" : "max-md:hidden"}` }>
      {/*avatar*/}
      <Avatar user={authStore.user} />


      {/*name  & email*/}
      <div>
        <h2 className={"font-semibold text-xl"}>{authStore.user?.name}</h2>
        <p className={"text-gray-40 break-all"}>{authStore.user?.email}</p>
        <p className={"text-gray-40"}>{authStore.user?.phone}</p>
        <p className={"text-gray-40"}>{authStore.user?.google_id}</p>
        <p className={"text-gray-40"}>{authStore.user?.telegram_id}</p>
      </div>

    </Link>
  );
};

export default ProfileInfo;