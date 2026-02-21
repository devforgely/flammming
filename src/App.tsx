import { useState } from 'react';
import './App.css';
import Header from './components/Header/Header';
import Search from './components/Search/Search';

interface Song {
  id: string;
  name: string;
  artist: string;
  album: string;
  uri: string;
}

function App() {
  const [searchResults, setSearchResults] = useState<Song[]>([]);

  const search = (term: string) => {
    if (!term) {
      setSearchResults([]);
      return;
    }
    // TODO: implement search functionality using Spotify API
    const results: Song[] = []; // Replace with actual search results from Spotify API
    setSearchResults(results);
  };

  return (
    <>
      <Header />
      <div className="container">
        <Search onSearch={search} />
      </div>
    </>
  )
}

export default App
