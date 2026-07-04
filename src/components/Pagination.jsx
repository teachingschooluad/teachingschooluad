import React from 'react';

export default function Pagination({ page, lastPage, onPageChange }) {
  if (lastPage <= 1) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
      <button 
        className="btn btn-outline" 
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        Prev
      </button>
      
      {Array.from({ length: lastPage }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          className={`btn ${page === p ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}
      
      <button 
        className="btn btn-outline" 
        disabled={page === lastPage}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
