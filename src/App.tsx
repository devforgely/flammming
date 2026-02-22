import { useState } from 'react';
import './App.css';
import Header from './components/Header/Header';
import Search from './components/Search/Search';
import SearchResults from './components/SearchResults/SearchResults';
import PlayList from './components/PlayList/PlayList';
import { userAuthentication, getToken, searchTracks, createPlaylist } from './spotify/SpotifyApi';

function App() {
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [playlistName, setPlaylistName] = useState<string>('New Playlist');
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);

  const verifyUser = async () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
    const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || '';

    const spotifyAuth = localStorage.getItem('spotify_auth');
    
    // Already authenticated and not expired → done
    if (spotifyAuth) {
      const auth = JSON.parse(spotifyAuth);
      if (auth.expires_at && Date.now() < auth.expires_at) {
        return; // ✅ valid token, resolve immediately
      }
      // Token expired → clean up and continue
      localStorage.removeItem('spotify_auth');
    }

    const code = new URLSearchParams(window.location.search).get('code');

    // Have a code → exchange it and WAIT for the result
    if (code) {
      await getToken(code, clientId, redirectUri);          // ← await!
      window.history.replaceState({}, document.title, window.location.pathname);
      return; // ✅ token is now in localStorage
    }

    // No auth and no code → redirect to Spotify
    userAuthentication(clientId, redirectUri);
    // This redirect navigates away, but reject so callers don't continue
    return Promise.reject('Redirecting to Spotify for authentication.');
  };

  const search = (term: string) => {
    if (!term) {
      setSearchResults([]);
      return;
    }

    verifyUser().then(() => {
      const token = JSON.parse(localStorage.getItem('spotify_auth') || '{}').access_token;
      if (!token) {
        alert('Authentication failed. Please refresh the page and try again.');
        localStorage.removeItem("spotify_auth");
        return;
      }
      return searchTracks(term, token);
    })
    .then(results => {
      setSearchResults(results);
    })
    .catch(error => {
      console.warn('Warning during search:', error);
    });
  };
  
  const addTrack = (track: Track) => {
    if (playlistTracks.find(savedTrack => savedTrack.id === track.id)) {
      return; // Already in playlist
    }
    setPlaylistTracks([...playlistTracks, track]);
  };

  const removeTrack = (track: Track) => {
    setPlaylistTracks(playlistTracks.filter(savedTrack => savedTrack.id !== track.id));
  };

  const updatePlaylistName = (name: string) => {
    setPlaylistName(name);
  };

  const savePlaylist = () => {
    verifyUser().then(() => {
      const token = JSON.parse(localStorage.getItem('spotify_auth') || '{}').access_token;
      if (!token) {
        alert('Authentication failed. Please refresh the page and try again.');
        localStorage.removeItem("spotify_auth");
        return;
      }

      const trackUris = playlistTracks.map(track => track.uri);
      createPlaylist(playlistName, trackUris, token).then(() => {
        alert('Playlist saved successfully!');
      }).catch(error => {
        console.warn('Warning saving playlist:', error);
      });
      
      // Reset after saving
      setPlaylistName('New Playlist');
      setPlaylistTracks([]);
    });
  };

  return (
    <>
      <Header />
      <div className="container">
        <Search onSearch={search} />
        
        <div className="list-content">
          <SearchResults 
            searchResults={searchResults} 
            onAdd={addTrack} 
          />

          <PlayList 
            playlistName={playlistName}
            playlistTracks={playlistTracks}
            onRemove={removeTrack}
            onNameChange={updatePlaylistName}
            onSave={savePlaylist}
          />
        </div>
      </div>
    </>
  )
}

export default App
