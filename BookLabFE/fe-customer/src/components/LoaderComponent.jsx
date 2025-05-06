import React from 'react';
import { ClipLoader } from 'react-spinners';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <ClipLoader
        color="#818CF8" 
        size={50}
        aria-label="Loading..."
      />
    </div>
  );
};

export default Loader;