
import React, { useState } from 'react';
import { SearchIcon } from './icons';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask me anything..."
        disabled={isLoading}
        className="w-full pl-5 pr-14 py-4 text-lg bg-slate-800 border border-slate-700 rounded-full focus:ring-2 focus:ring-sky-500 focus:outline-none transition-shadow duration-200 placeholder-slate-500 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-sky-600 hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
        aria-label="Search"
      >
        <SearchIcon className="w-6 h-6 text-white" />
      </button>
    </form>
  );
};
