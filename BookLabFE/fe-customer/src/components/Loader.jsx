// src/components/Loader.jsx
import React from 'react';
import { createPortal } from "react-dom";
import ClipLoader from 'react-spinners/ClipLoader';

const Loader = () => {
  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <ClipLoader color="#ffffff" size={150} />
    </div>,
    document.body
  );
};

export default Loader;