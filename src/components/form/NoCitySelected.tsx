import type { NoCitySelectedProps } from "../../types/noCity";

export const NoCitySelected: React.FC<NoCitySelectedProps> = ({
  icon,
  title,
  message,
}) => {
  return (
    <div className="relative overflow-hidden rounded-lg p-8 bg-white dark:bg-gray-800 shadow-xl text-center">
      <div className="absolute inset-0 opacity-5 bg-[url('/pattern.svg')] bg-cover bg-center pointer-events-none" />
      <div className="flex justify-center mb-4">{icon}</div>
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
        {title}
      </h2>
      <p className="text-md text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
};
