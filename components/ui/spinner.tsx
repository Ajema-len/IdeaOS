type SpinnerProps = {
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function Spinner({ size = "md" }: SpinnerProps) {
  return (
    <div className="inline-flex items-center justify-center">
      <div className={`${sizes[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`} />
    </div>
  );
}
