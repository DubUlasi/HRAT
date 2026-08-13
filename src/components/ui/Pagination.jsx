import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Select from './Select';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

// Pairs with usePagination — renders the "N per page" filter plus prev/next + "Showing X-Y of Z".
// Used on every list view in the app except the dashboard's small recent-complaints preview.
export default function Pagination({ page, pageCount, pageSize, totalItems, onPageChange, onPageSizeChange }) {
  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="pagination-bar">
      <div className="pagination-size">
        <span>Show</span>
        <Select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </Select>
        <span>per page</span>
      </div>

      <div className="pagination-status">
        <span>Showing {start}&ndash;{end} of {totalItems}</span>
        <div className="pagination-controls">
          <button
            type="button"
            className="pagination-btn"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="pagination-page-indicator">Page {page} of {pageCount}</span>
          <button
            type="button"
            className="pagination-btn"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
            aria-label="Next page"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
