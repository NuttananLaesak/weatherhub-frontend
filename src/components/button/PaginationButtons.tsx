import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import type { PaginationButtonsProps } from "../../types/pagination";

export const PaginationButtons: React.FC<PaginationButtonsProps> = ({
  onPrev,
  onNext,
  disabledPrev,
  disabledNext,
}) => {
  return (
    <div className="space-x-4">
      <button
        onClick={() => {
          onPrev();
        }}
        disabled={disabledPrev}
        className="px-2 lg:px-3 py-1 lg:py-2 bg-gray-300 dark:bg-gray-700 rounded disabled:opacity-50"
      >
        <HiChevronLeft className="text-xl" />
      </button>
      <button
        onClick={() => {
          onNext();
        }}
        disabled={disabledNext}
        className="px-2 lg:px-3 py-1 lg:py-2 bg-gray-300 dark:bg-gray-700 rounded disabled:opacity-50"
      >
        <HiChevronRight className="text-xl" />
      </button>
    </div>
  );
};
