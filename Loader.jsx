import React from 'react';

const Loader = ({ fullScreen = false }) => {
  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-700">
        <div className="w-full h-full rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-sm">
        {loaderContent}
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[200px] flex items-center justify-center">
      {loaderContent}
    </div>
  );
};

export default Loader;
