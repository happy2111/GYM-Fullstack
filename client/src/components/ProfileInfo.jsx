import authStore from "../store/authStore.js";
import Avatar from "./Avatar.jsx";

const ProfileInfo = ({isProfileRoot}) => {
  return (
    <section className={`p-8 flex items-center gap-3 bg-dark-10 rounded-2xl mb-6 ${isProfileRoot ? "" : "max-md:hidden"}` }>
      {/*avatar*/}
      <Avatar user={authStore.user} />


      {/*name  & email*/}
      <div>
        <h2 className={"font-semibold text-xl"}>{authStore.user?.name}</h2>
        <p className={"text-gray-40"}>{authStore.user?.email}</p>
      </div>

    </section>
  );
};

export default ProfileInfo;