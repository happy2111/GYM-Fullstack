const PricingPackagesSkeleton = () => {
  return (
    <div className="min-h-screen max-md:pt-20 bg-dark-06 text-gray-99 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          {/* Small text skeleton */}
          <div className="h-4 bg-dark-25 rounded w-20 mx-auto mb-4 animate-pulse"></div>

          {/* Main title skeleton */}
          <div className="h-12 bg-dark-25 rounded w-80 mx-auto mb-8 animate-pulse"></div>

          {/* Toggle Buttons Skeleton */}
          <div className="inline-flex bg-dark-15 rounded-full p-1 mb-8">
            <div className="h-10 bg-dark-25 rounded-full w-32 animate-pulse"></div>
            <div className="h-10 bg-dark-35 rounded-full w-32 ml-1 animate-pulse"></div>
          </div>
        </div>

        {/* Packages Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Skeleton cards */}
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-6 transition-all duration-300 ${
                index === 1 // Make second card "best offer" style
                  ? "bg-brown-60 transform lg:scale-110 lg:-mt-4"
                  : "bg-dark-15"
              }`}
            >
              {/* Best Offer Badge Skeleton */}
              {index === 1 && (
                <div className="absolute -top-3 -right-3 bg-dark-35 px-3 py-1 rounded-full text-xs transform rotate-12 animate-pulse">
                  <div className="h-3 bg-gray-600 rounded w-16"></div>
                </div>
              )}

              {/* Package Name Skeleton */}
              <div className="mb-6">
                <div className="h-5 bg-dark-35 rounded w-24 animate-pulse"></div>
              </div>

              {/* Price Skeleton */}
              <div className="mb-6">
                <div className="flex items-baseline mb-2">
                  <div className="h-12 bg-dark-35 rounded w-32 animate-pulse"></div>
                </div>
                <div className="h-4 bg-dark-35 rounded w-40 animate-pulse"></div>
              </div>

              {/* Features Skeleton */}
              <div className="space-y-3 mb-8">
                {[...Array(4)].map((_, featureIndex) => (
                  <div
                    key={featureIndex}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-dark-35 animate-pulse flex-shrink-0"></div>
                    <div className={`h-4 bg-dark-35 rounded animate-pulse ${
                      featureIndex === 0 ? 'w-32' :
                        featureIndex === 1 ? 'w-28' :
                          featureIndex === 2 ? 'w-36' : 'w-24'
                    }`}></div>
                  </div>
                ))}
              </div>

              {/* Register Button Skeleton */}
              <div className="w-full h-12 bg-dark-35 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPackagesSkeleton;