import { useMemo } from 'react';

// Helper function to create a range of numbers
const range = (start: number, end: number) => {
  let length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};

export const DOTS = '...';

interface UsePaginationProps {
  totalPageCount: number;
  currentPage: number;
  siblingCount?: number; // number of pages to show on each side of current page
}

export const usePagination = ({
  totalPageCount,
  currentPage,
  siblingCount = 1,
}: UsePaginationProps) => {
  const paginationRange = useMemo(() => {
    // 1. Fixed numbers that are always shown
    const totalPageNumbers = siblingCount + 5; // (current + 2*siblings + first + last + 2*DOTS)

    // Case 1: If the total number of pages is less than the numbers we want to show,
    // we show all pages.
    if (totalPageCount <= totalPageNumbers) {
      return range(1, totalPageCount);
    }

    // 2. Calculate the indices of the "siblings" (neighboring pages)
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      totalPageCount
    );

    // 3. Decide whether to show the DOTS
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPageCount;

    // Case 2: No DOTS on the left, but yes on the right
    // Example: [1, 2, 3, 4, 5, '...', 10]
    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = range(1, leftItemCount);
      return [...leftRange, DOTS, totalPageCount];
    }

    // Case 3: There are DOTS on the left, but not on the right
    // Example: [1, '...', 6, 7, 8, 9, 10]
    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = range(
        totalPageCount - rightItemCount + 1,
        totalPageCount
      );
      return [firstPageIndex, DOTS, ...rightRange];
    }

    // Case 4: There are DOTS on both sides
    // Example: [1, '...', 4, 5, 6, '...', 10]
    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    // Just in case, a fallback (shouldn't reach here)
    return range(1, totalPageCount);

  }, [totalPageCount, currentPage, siblingCount]);

  return paginationRange;
};