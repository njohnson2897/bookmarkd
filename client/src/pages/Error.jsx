import { useRouteError, Link } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div id="error-page" className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary2 mb-4">Oops!</h1>
        <p className="text-lg text-gray-700 mb-2">Sorry, an unexpected error has occurred.</p>
        <p className="text-gray-600 mb-6">
          <i>{error?.statusText || error?.message || "Unknown error"}</i>
        </p>
        <Link
          to="/"
          className="bg-primary1 text-white px-6 py-2 rounded hover:bg-accent transition"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}


