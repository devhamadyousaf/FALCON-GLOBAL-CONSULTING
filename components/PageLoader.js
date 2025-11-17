export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-6 animate-pulse">
          <img
            src="/klaus_logo.jpeg"
            alt="Falcon Global Consulting"
            className="h-20 w-auto mx-auto"
          />
        </div>

        {/* Spinner */}
        <div className="flex justify-center mb-4">
          <div
            className="w-12 h-12 border-4 rounded-full animate-spin"
            style={{
              borderColor: 'rgba(187, 40, 44, 0.2)',
              borderTopColor: 'rgba(187, 40, 44, 1)'
            }}
          />
        </div>

        {/* Loading Text */}
        <p className="text-sm font-medium" style={{ color: 'rgba(0, 50, 83, 0.7)' }}>
          Loading...
        </p>
      </div>
    </div>
  );
}
