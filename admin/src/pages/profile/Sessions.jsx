import React, { useState, useEffect } from "react";
import {
  Shield,
  Smartphone,
  Tablet,
  Monitor,
  MapPin,
  Clock,
  Trash2,
} from "lucide-react";
import authStore from "../../store/authStore.js";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {observer} from "mobx-react-lite";

  const Sessions = observer(() => {
    const { t } = useTranslation();
    const { isLoading } = authStore;

    useEffect(() => {
      authStore.getSessions();
    }, []);
    const sessions = authStore.sessions

    const getDeviceIcon = (device) => {
      const lower = device.toLowerCase();
      if (lower.includes("iphone") || lower.includes("android")) {
        return <Smartphone className="w-5 h-5" />;
      } else if (lower.includes("ipad") || lower.includes("tablet")) {
        return <Tablet className="w-5 h-5" />;
      } else {
        return <Monitor className="w-5 h-5" />;
      }
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor(diff / (1000 * 60));

      if (days > 0) return t("sessions.ago.days", { count: days });
      if (hours > 0) return t("sessions.ago.hours", { count: hours });
      if (minutes > 0) return t("sessions.ago.minutes", { count: minutes });
      return t("sessions.ago.now");
    };

    const handleDeleteSession = async (sessionId) => {
      try {
        const res = await authStore.revokeSession(sessionId);
        authStore.getSessions()
        toast.success(t("sessions.delete_success"));
      } catch (error) {
        console.error("Failed to delete session:", error);
      }
    };

    const handleDeleteAllOtherSessions = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setSessions((prev) => prev.filter((s) => s.current));
      } catch (error) {
        console.error("Failed to delete sessions:", error);
      }
    };

    if (isLoading && sessions.length === 0) {
      return (
        <div className="flex-1 w-full p-8 bg-dark-10 rounded-2xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown-60"></div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 w-full p-8 bg-dark-10 rounded-2xl">
        <div className="max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-2 mb-8">
            <Shield className="w-5 h-5" style={{ color: "var(--color-gray-70)" }} />
            <h1 className="text-xl font-medium text-white">{t("sessions.title")}</h1>
          </div>

          {/* Description */}
          <div className="mb-8">
            <p className="text-gray-300 mb-4">{t("sessions.description")}</p>
            <button
              onClick={handleDeleteAllOtherSessions}
              disabled={isLoading || sessions.filter((s) => !s.current).length === 0}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--color-brown-60)",
                color: "white",
              }}
            >
              {isLoading ? t("sessions.signing_out") : t("sessions.sign_out_all")}
            </button>
          </div>

          {/* Sessions List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex-1 w-full p-8 bg-dark-10">
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-16 w-16 border-l-4 border-brown-60"></div>
                </div>
              </div>
            ): (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-6 rounded-lg border transition-colors"
                  style={{
                    backgroundColor: "var(--color-dark-15)",
                    borderColor: "var(--color-dark-30)",
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: "var(--color-dark-25)" }}
                      >
                        {getDeviceIcon(session.device)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-white font-medium">
                            {session.device}
                          </h3>
                          {session.current && (
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: "var(--color-brown-95)",
                                color: "var(--color-brown-60)",
                              }}
                            >
                            {t("sessions.current")}
                          </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <MapPin className="w-4 h-4" />
                            <span>
                            {t("sessions.ip")}: {session.ip}
                          </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>
                            {t("sessions.last_active")}:{" "}
                              {formatDate(session.lastActive)}
                          </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>
                            {t("sessions.expires")}:{" "}
                            {new Date(session.expiresAt).toLocaleDateString()}
                          </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {!session.current && (
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        disabled={isLoading}
                        className="p-2 rounded-lg transition-colors hover:bg-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          color: "var(--color-brown-70)",
                          border: `1px solid var(--color-dark-30)`,
                        }}
                        title={t("sessions.sign_out")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {sessions.length === 0 && (
            <div className="text-center py-12">
              <div
                className="p-4 rounded-full inline-block mb-4"
                style={{ backgroundColor: "var(--color-dark-25)" }}
              >
                <Monitor className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                {t("sessions.no_active_title")}
              </h3>
              <p className="text-gray-400">{t("sessions.no_active_description")}</p>
            </div>
          )}

          <div
            className="mt-8 p-4 rounded-lg border-l-4"
            style={{
              backgroundColor: "var(--color-dark-15)",
              borderLeftColor: "var(--color-brown-70)",
            }}
          >
            <h4 className="text-white font-medium mb-2">
              {t("sessions.security_notice")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("sessions.security_notice_text")}
            </p>
          </div>
        </div>
      </div>
    );
  });

export default Sessions;
