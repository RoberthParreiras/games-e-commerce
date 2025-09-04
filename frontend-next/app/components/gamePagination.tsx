"use client";

import { usePathname, useSearchParams } from "next/navigation";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/app/components/ui/pagination";

interface GamePaginationProps {
  totalPages: number;
}

export function GamePagination({ totalPages }: GamePaginationProps) {
  const DEFAULT_PAGE = 1;

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentPage = Number(searchParams.get("page")) || DEFAULT_PAGE;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <Pagination className="w-1/3">
      <PaginationContent className="flex w-full justify-between">
        <PaginationItem className="w-1/3">
          <PaginationPrevious
            href={createPageURL(currentPage - 1)}
            className={
              currentPage <= 1
                ? "pointer-events-none text-center opacity-50"
                : ""
            }
          />
        </PaginationItem>
        <PaginationItem className="w-1/3 text-center">
          <PaginationLink href="#" className="text-white">
            Page {currentPage} of {totalPages}
          </PaginationLink>
        </PaginationItem>
        <PaginationItem className="w-1/3 text-center">
          <PaginationNext
            href={createPageURL(currentPage + 1)}
            className={
              currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
