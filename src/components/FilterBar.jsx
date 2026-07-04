import { useState, useEffect, useRef } from 'react';

export default function FilterBar({ onSearch, placeholder = "Cari data...", children }) {
  const [searchTerm, setSearchTerm] = useState('');
  const onSearchRef = useRef(onSearch);

  // Keep the ref up-to-date without triggering the effect
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onSearchRef.current(searchTerm);
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="filters" style={{ flexWrap: 'wrap' }}>
      <input
        type="text"
        className="form-input"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ minWidth: '250px' }}
      />
      {children}
    </div>
  );
}
