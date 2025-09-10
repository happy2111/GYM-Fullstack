import authStore from "../store/authStore.js";

const ProfileInfo = ({isProfileRoot}) => {
  return (
    <section className={`p-8 flex items-center gap-3 bg-dark-10 rounded-2xl mb-6 ${isProfileRoot ? "" : "max-md:hidden"}` }>
      {/*avatar*/}
      <div
        className="min-w-16 h-16 font-semibold text-2xl flex items-center justify-center rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--color-dark-15)' }}
      >
        {authStore.user?.telegram_photo_url ? (
          <img
            src={authStore.user.telegram_photo_url}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          authStore.user?.name?.charAt(0)
        )}
      </div>


      {/*name  & email*/}
      <div>
        <h2 className={"font-semibold text-xl"}>{authStore.user?.name}</h2>
        <p className={"text-gray-40"}>{authStore.user?.email}</p>
      </div>

    </section>
  );
};

export default ProfileInfo;