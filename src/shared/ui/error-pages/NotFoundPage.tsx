import React from 'react';
import { Link } from '@tanstack/react-router';

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 text-gray-800">
      <h1 className="mb-4 text-6xl font-bold text-red-500">404</h1>
      <p className="mb-8 text-xl">페이지를 찾을 수 없습니다.</p>
      <Link to="/" className="rounded-lg bg-blue-500 px-6 py-3 text-white hover:bg-blue-600">
        홈으로 돌아가기
      </Link>
    </div>
  );
};

export default NotFoundPage;
