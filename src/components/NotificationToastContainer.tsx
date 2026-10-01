'use client';

import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function NotificationToastContainer() {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
      toastClassName="!bg-[#231F20] !text-[#E5E0D8] !border !border-[#3D3531] !rounded-lg !font-mono !text-xs !shadow-2xl"
    />
  );
}

export { toast } from 'react-toastify';
