const ProgressBar = ({currentStep, totalSteps}) => {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span
          className="text-sm font-medium"
          style={{color: '#F2F2F2'}}
        >
          Step {currentStep} of {totalSteps}
        </span>
        <span
          className="text-sm"
          style={{color: '#B3B3B2'}}
        >
          {Math.round(percentage)}%
        </span>
      </div>
      <div
        className="w-full h-2 rounded-full"
        style={{backgroundColor: '#262626'}}
      >
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{
            backgroundColor: '#C33636',
            width: `${percentage}%`
          }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
