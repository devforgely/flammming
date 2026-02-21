import { useState } from "react";
import "./Search.css";


interface SearchProps {
  onSearch: (term: string) => void;
}

export default function Search({ onSearch }: SearchProps) {
  const [term, setTerm] = useState('');

  const handleTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTerm(event.target.value);
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(term);
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSearch}>
        <input 
          placeholder="Enter A Song, Album, or Artist" 
          value={term}
          onChange={handleTermChange}
        />
        <button type="submit" className="search-btn">SEARCH</button>
      </form>
    </div>
  );
};