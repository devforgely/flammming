type artist = {
  name: string;
};

type album = {
  name: string;
};

type Track = {
  id: string;
  name: string;
  artists: artist[];
  album: album;
  uri: string;
};

type SearchProps = {
  onSearch: (term: string) => void;
};

type TrackProps = {
  track: Track;
  onAdd: (track: Track) => void;
  onRemove: (track: Track) => void;
  isRemoval: boolean;
};

type TrackListProps = {
  tracks: Track[];
  onAdd?: (track: Track) => void;
  onRemove?: (track: Track) => void;
  isRemoval: boolean;
};

type SearchResultsProps = {
  searchResults: Track[];
  onAdd: (track: Track) => void;
};

type PlaylistProps = {
  playlistName: string;
  playlistTracks: Track[];
  onRemove: (track: Track) => void;
  onNameChange: (name: string) => void;
  onSave: () => void;
};

type SpotifyAuth = {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number; // timestamp in ms 
};