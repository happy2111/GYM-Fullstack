import React from 'react';

const MembershipSkeletonProfileInfo = ({isProfileRoot}) => {
  return (
    <div
      className={`flex items-center justify-center pt-4  !mb-6 flex-col   md:!w-1/2 scale-99 rounded-xl transition-all duration-300 animate-pulse ${isProfileRoot ? "" : "max-md:!hidden"}}`}
      style={{
        backgroundColor: 'var(--color-dark-10, #1a1a1a)',
      }}
    >
      <div className="flex flex-col">
        {/* Header Skeleton */}
        <div className="flex gap-3 items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {/* Title skeleton */}
              <div className="h-6 bg-dark-20 rounded w-32 animate-pulse"></div>
              {/* Star icon placeholder */}
              <div className="w-4 h-4 bg-dark-20 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar Skeleton */}
      <div className="mb-4 w-5/6">
        <div className="flex justify-between items-center mb-2">
          {/* Days remaining text skeleton */}
          <div className="h-3 bg-dark-30 rounded w-20 animate-pulse"></div>
          {/* Days count skeleton */}
          <div className="h-3 bg-dark-30 rounded w-16 animate-pulse"></div>
        </div>
        {/* Progress bar skeleton */}
        <div className="w-full bg-dark-12 rounded-full h-2">
          <div className="bg-dark-20 h-2 rounded-full w-1/3 animate-pulse"></div>
        </div>
      </div>

      {/* Visit Counter Skeleton */}
      <div
        className="mb-4 p-3 rounded-lg w-5/6"
        style={{ backgroundColor: 'var(--color-dark-15, #2a2a2a)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* Target icon skeleton */}
            <div className="w-4 h-4 bg-dark-20 rounded animate-pulse"></div>
            {/* Visits Used text skeleton */}
            <div className="h-3 bg-dark-30 rounded w-16 animate-pulse"></div>
          </div>
          {/* Visit count skeleton */}
          <div className="h-3 bg-dark-30 rounded w-20 animate-pulse"></div>
        </div>

        {/* Visit progress bar skeleton */}
        <div className="w-full bg-dark-12 rounded-full h-2">
          <div className="bg-dark-20 h-2 rounded-full w-2/3 animate-pulse"></div>
        </div>

        {/* Visit status text skeleton */}
        <div className="mt-2">
          <div className="h-3 bg-dark-30 rounded w-24 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default MembershipSkeletonProfileInfo;