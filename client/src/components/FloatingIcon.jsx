import React from "react";

const FloatingIcon = ({ icon: Icon, delay = 0, position }) => {
  return (
    <div
      className={`absolute ${position} animate-bounce`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: '3s'
      }}
    >
      <div className="bg-dark-15 border border-gray-700/30 rounded-full p-3 backdrop-blur-sm">
        <Icon className="w-6 h-6 text-brown-70" />
      </div>
    </div>
  );
};
export default FloatingIcon;
