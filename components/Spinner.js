export default function Spinner({ size = 'md', color = 'white' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colors = {
    white: 'border-white',
    primary: 'border-blue-600',
    red: 'border-red-600',
    gray: 'border-gray-600'
  };

  return (
    <div
      className={`${sizes[size]} border-2 ${colors[color]} border-t-transparent rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );
}
