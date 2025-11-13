'use client';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePagination, DOTS } from '@/hooks/usePagination';

interface GenericPaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function GenericPagination({
  currentPage,
  lastPage,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
}: GenericPaginationProps) {
  const paginationRange = usePagination({
    currentPage,
    totalPageCount: lastPage,
  });

  // Si solo hay una página, no renderizamos nada
  if (currentPage === 0 || paginationRange.length < 2) {
    return null;
  }

  const onNext = () => {
    if (currentPage < lastPage) {
      onPageChange(currentPage + 1);
    }
  };

  const onPrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  return (
    <div className='flex items-center justify-between'>
      <div className="flex items-center space-x-2">
        <span className='whitespace-nowrap text-sm'>Items per page:</span>
        <Select
          value={pageSize.toString()}
          onValueChange={(value: string) => onPageSizeChange?.(Number(value))}
        >
          <SelectTrigger className="w-[70px]">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={onPrevious}
              className={
                currentPage === 1
                  ? 'opacity-50 pointer-events-none' // Disabled
                  : 'cursor-pointer' // Enabled
              }
            />
          </PaginationItem>

          {/* Number of pages and DOTS */}
          {paginationRange.map((pageNumber, index) => {
            // If it's DOTS...
            if (pageNumber === DOTS) {
              return (
                <PaginationItem key={`${DOTS}-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            // If it's a page number
            return (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  isActive={pageNumber === currentPage}
                  onClick={() => onPageChange(pageNumber as number)}
                  className="cursor-pointer"
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              onClick={onNext}
              className={
                currentPage === lastPage
                  ? 'opacity-50 pointer-events-none' // Disabled
                  : 'cursor-pointer' // Enabled
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}