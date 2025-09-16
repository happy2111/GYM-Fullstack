import React, { useState, useEffect } from 'react';
import { Settings, User, Shield, Eye, Database, Megaphone, Bell, Monitor, Smartphone, Tablet, Trash2, MapPin, Clock } from 'lucide-react';
import authStore from "../../store/authStore.js";
import toast from "react-hot-toast";
const Sessions = () => {

  const { loading } = authStore;

  useEffect(() => {
    authStore.getSessions();
  }, [])


  const [sessions, setSessions] = useState(authStore.sessions);

  // const [loading, setLoading] = useState(false);

  const getDeviceIcon = (device) => {
    if (device.toLowerCase().includes('iphone') || device.toLowerCase().includes('android')) {
      return <Smartphone className="w-5 h-5" />;
    } else if (device.toLowerCase().includes('ipad') || device.toLowerCase().includes('tablet')) {
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

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const handleDeleteSession = async (sessionId) => {
    setLoading(true);
    try {
      // Simulate API call
      const res = await authStore.revokeSession(sessionId)

      setSessions(prevSessions =>
        prevSessions.filter(session => session.id !== sessionId)
      );

      toast.success("Session deleted successfully")
      console.log(`Session ${sessionId} deleted successfully`);
    } catch (error) {
      console.error('Failed to delete session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllOtherSessions = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSessions(prevSessions =>
        prevSessions.filter(session => session.current)
      );

      console.log('All other sessions deleted successfully');
    } catch (error) {
      console.error('Failed to delete sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && sessions.length === 0) {
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
          <Shield className="w-5 h-5" style={{ color: 'var(--color-gray-70)' }} />
          <h1 className="text-xl font-medium text-white">Device Sessions</h1>
        </div>

        {/* Description */}
        <div className="mb-8">
          <p className="text-gray-300 mb-4">
            Manage your active sessions across all devices. You can sign out of specific devices or all devices at once.
          </p>
          <button
            onClick={handleDeleteAllOtherSessions}
            disabled={loading || sessions.filter(s => !s.current).length === 0}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--color-brown-60)',
              color: 'white'
            }}
          >
            {loading ? 'Signing out...' : 'Sign out of all other devices'}
          </button>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="p-6 rounded-lg border transition-colors"
              style={{
                backgroundColor: 'var(--color-dark-15)',
                borderColor: 'var(--color-dark-30)'
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Device Icon */}
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-dark-25)' }}>
                    {getDeviceIcon(session.device)}
                  </div>

                  {/* Session Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-white font-medium">{session.device}</h3>
                      {session.current && (
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: 'var(--color-brown-95)',
                            color: 'var(--color-brown-60)'
                          }}
                        >
                              Current session
                            </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span>IP: {session.ip}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>Last active: {formatDate(session.lastActive)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>Expires: {new Date(session.expiresAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {!session.current && (
                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    disabled={loading}
                    className="p-2 rounded-lg transition-colors hover:bg-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      color: 'var(--color-brown-70)',
                      border: `1px solid var(--color-dark-30)`
                    }}
                    title="Sign out from this device"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {sessions.length === 0 && (
          <div className="text-center py-12">
            <div className="p-4 rounded-full inline-block mb-4" style={{ backgroundColor: 'var(--color-dark-25)' }}>
              <Monitor className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No active sessions</h3>
            <p className="text-gray-400">You don't have any active sessions on other devices.</p>
          </div>
        )}

        {/* Security Notice */}
        <div
          className="mt-8 p-4 rounded-lg border-l-4"
          style={{
            backgroundColor: 'var(--color-dark-15)',
            borderLeftColor: 'var(--color-brown-70)'
          }}
        >
          <h4 className="text-white font-medium mb-2">Security Notice</h4>
          <p className="text-gray-300 text-sm">
            If you notice any unfamiliar devices or locations, sign out immediately and change your password.
            Sessions automatically expire after 30 days of inactivity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sessions;