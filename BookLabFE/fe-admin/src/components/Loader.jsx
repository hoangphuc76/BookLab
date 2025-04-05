// src/components/Loader.jsx
import React from 'react';
import ClipLoader from 'react-spinners/ClipLoader';

const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <ClipLoader color="#ffffff" size={150} />
    </div>
  );
};

export default Loader;