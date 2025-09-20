import authStore from "../store/authStore.js";
import membershipStore from "../store/membershipStore.js";
import Avatar from "./Avatar.jsx";
import { Link, useNavigate } from "react-router-dom";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

import "../css/swiper.css";
import {
  Star,
  Target
} from "lucide-react";
import React from "react";
import { observer } from "mobx-react-lite";
import MembershipSkeletonProfileInfo from "./Skeletons/MembershipSkeletonProfileInfo.jsx";
import { useTranslation } from "react-i18next";

const ProfileInfo = observer(({ isProfileRoot }) => {
  const { isLoading } = membershipStore;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getMembershipStatus = (membership) => {
    const now = new Date();
    const endDate = new Date(membership.end_date);

    if (membership.status === "cancelled") return "cancelled";
    if (endDate < now) return "expired";
    return membership.status;
  };

  const calculateRemainingDays = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const calculateTotalDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getProgressPercentage = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    const totalTime = end - start;
    const usedTime = now - start;

    if (totalTime <= 0) return 0;
    return Math.max(0, Math.min(100, (usedTime / totalTime) * 100));
  };

  return (
    <div className={"flex max-md:flex-col justify-between gap-6 w-full"}>
      <Link
        to={"account-preference"}
        className={`p-8 flex w-full md:!w-1/2 items-center gap-3 bg-dark-10 rounded-2xl  md:mb-6 ${
          isProfileRoot ? "" : "max-md:hidden"
        }`}
      >
        {/* Avatar */}
        <Avatar user={authStore.user} />

        {/* User info */}
        <div>
          <h2 className={"font-semibold text-xl"}>{authStore.user?.name}</h2>
          <p className={"text-gray-40 break-all"}>{authStore.user?.email}</p>
          <p className={"text-gray-40"}>{authStore.user?.phone}</p>
          <p className={"text-gray-40"}>{authStore.user?.google_id}</p>
          <p className={"text-gray-40"}>{authStore.user?.telegram_id}</p>
        </div>
      </Link>

      {isLoading ? (
        <MembershipSkeletonProfileInfo isProfileRoot={isProfileRoot} />
      ) : (
        <Swiper
          navigation={true}
          modules={[Navigation]}
          spaceBetween={15}
          className={`mySwiper cursor-pointer md:!w-1/2 md:!pb-6 max-md:mb-6 ${
            isProfileRoot ? "" : "max-md:!hidden"
          }`}
        >
          {membershipStore.acitiveMemberships.map((membership) => {
            const actualStatus = getMembershipStatus(membership);
            const remainingDays = calculateRemainingDays(membership.end_date);
            const totalDays = calculateTotalDays(
              membership.start_date,
              membership.end_date
            );

            return (
              <SwiperSlide
                onClick={() => navigate(`membership-history`)}
                key={membership.id}
                className={`p-6 flex flex-col  w-1/2 scale-99 rounded-xl transition-all duration-300 ${
                  actualStatus === "active" ? " " : ""
                }`}
                style={{
                  backgroundColor: "var(--color-dark-10)"
                }}
              >
                {/* Header */}
                <div className={"flex flex-col"}>
                  <div className="flex gap-3 items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold text-lg">
                          {membership?.tariff?.name || t("loading")}
                        </h3>
                        {actualStatus === "active" && (
                          <Star className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar (only for active memberships) */}
                {actualStatus === "active" && (
                  <div className="mb-4 w-5/6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">
                        {t("daysRemaining")}
                      </span>
                      <span className="text-sm font-medium text-white">
                        {remainingDays} / {totalDays} {t("days")}
                      </span>
                    </div>
                    <div className="w-full bg-dark-15 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${getProgressPercentage(
                            membership.start_date,
                            membership.end_date
                          )}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Visit Counter */}
                <div
                  className="mb-4 p-3 rounded-lg w-5/6"
                  style={{ backgroundColor: "var(--color-dark-15)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-brown-60" />
                      <span className="text-sm text-gray-400">
                        {t("visitsUsed")}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-white">
                      {membership.used_visits || 0}
                      {membership.max_visits
                        ? ` / ${membership.max_visits}`
                        : ` (${t("unlimited")})`}
                    </span>
                  </div>

                  {membership.max_visits ? (
                    // Limited visits - show progress bar
                    <div className="w-full bg-dark-30 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          membership.used_visits / membership.max_visits >= 0.9
                            ? "bg-red-500"
                            : membership.used_visits / membership.max_visits >=
                            0.7
                              ? "bg-yellow-500"
                              : "bg-brown-60"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (membership.used_visits / membership.max_visits) *
                            100
                          )}%`
                        }}
                      ></div>
                    </div>
                  ) : (
                    // Unlimited visits
                    <div className="w-full bg-dark-30 rounded-full h-2">
                      <div className="bg-gradient-to-r from-brown-60 via-yellow-500 to-brown-60 h-2 rounded-full animate-pulse"></div>
                    </div>
                  )}

                  {/* Visit status text */}
                  <div className="mt-2 text-xs text-gray-500">
                    {membership.max_visits ? (
                      <>
                        {membership.max_visits - (membership.used_visits || 0) >
                        0 ? (
                          <span className="text-green-400">
                            {membership.max_visits -
                              (membership.used_visits || 0)}{" "}
                            {t("visitsRemaining")}
                          </span>
                        ) : (
                          <span className="text-red-400">
                            {t("noVisitsRemaining")}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-brown-60">
                        {t("unlimitedAccess")}
                      </span>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      )}
    </div>
  );
});

export default ProfileInfo;
