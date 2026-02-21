import { useState } from 'react';
import './App.css';
import Header from './components/Header/Header';
import Search from './components/Search/Search';
import SearchResults from './components/SearchResults/SearchResults';
import PlayList from './components/PlayList/PlayList';
import { userAuthentication, getToken, refreshToken, searchTracks, createPlaylist } from './spotify/SpotifyApi';

function App() {
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [playlistName, setPlaylistName] = useState<string>('New Playlist');
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);

  const verifyUser = async () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
    const spotifyAuth = localStorage.getItem('spotify_auth');

    if (!spotifyAuth) {
      const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || '';
      await userAuthentication(clientId, redirectUri);
      await getToken(new URLSearchParams(window.location.search).get('code') || '', clientId, redirectUri);
      return;
    }

    const spotifyAuthParsed: SpotifyAuth = JSON.parse(localStorage.getItem('spotify_auth') || '{}');
    // If token still valid → nothing to do
    // At least 5 seconds before expiration to avoid edge cases where token expires during an API call
    if (spotifyAuthParsed.expires_at && Date.now() < spotifyAuthParsed.expires_at - 5000) {
      return;
    }

    // Token expired → refresh it
    if (spotifyAuthParsed.refresh_token) {
      await refreshToken(spotifyAuthParsed.refresh_token, clientId);
    }
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

      searchTracks(term, token).then(results => setSearchResults(results)).catch(error => {
        console.error('Error searching tracks:', error);
        alert('An error occurred while searching for tracks. Please try again.');
      })
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
        console.error('Error saving playlist:', error);
        alert('An error occurred while saving the playlist. Please try again.');
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
