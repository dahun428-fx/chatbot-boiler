import { Link } from '@tanstack/react-router';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ErrorPage = ({ error }: { error: any }) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 text-gray-800">
      <h1 className="mb-4 text-6xl font-bold text-red-500">오류 발생</h1>
      <p className="mb-8 text-xl">예상치 못한 오류가 발생했습니다.</p>
      {process.env.NODE_ENV === 'development' && (
        <pre className="rounded-lg bg-gray-200 p-4 text-sm text-gray-700">
          {error?.message || '알 수 없는 오류'}
        </pre>
      )}
      <Link to="/" className="mt-8 rounded-lg bg-blue-500 px-6 py-3 text-white hover:bg-blue-600">
        홈으로 돌아가기
      </Link>
    </div>
  );
};

export default ErrorPage;
