import { useEffect, useMemo, useState } from 'react';

const DEFAULT_PAGE_SIZE = 10;

// Slices `items` into pages entirely client-side (consistent with the rest of this app's
// mock-data architecture). `items` is expected to be a new array each render (the usual
// filter/search/derive pattern), so page reset can't key off its identity — pass `resetKey` as
// a primitive summarizing whatever search/filter state produced `items` (e.g. `${search}|${filter}`)
// and the page snaps back to 1 whenever that actually changes. `safePage` also clamps down on
// its own once the current page no longer exists, e.g. right after a filter shrinks the results.
export function usePagination(items, initialPageSize = DEFAULT_PAGE_SIZE, resetKey) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, pageCount);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  return {
    page: safePage,
    setPage,
    pageSize,
    setPageSize: (size) => {
      setPageSize(size);
      setPage(1);
    },
    pageItems,
    pageCount,
    totalItems: items.length,
  };
}
