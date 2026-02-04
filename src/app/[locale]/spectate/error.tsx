'use client';

export default function SpectateError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-4">
      <div className="max-w-md text-center space-y-4">
        <h2 className="text-xl font-bold">⚠️ Spectate Error</h2>
        <p className="text-sm text-gray-400 break-all">
          {error.message || 'Unknown error'}
        </p>
        {error.digest && (
          <p className="text-xs text-gray-500">Digest: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 text-sm"
        >
          Try Again
        </button>
        <p className="text-xs text-gray-500 mt-4">
          If the error persists, try clearing your browser cache or using a different browser.
        </p>
      </div>
    </div>
  );
}
