import { generateRandomString, codeChallenge } from './CodeChallenge';

export const userAuthentication = async (
    clientId: string,
    redirectUri: string,
    scope: string = "user-read-private user-read-email playlist-modify-public",
    authUrl: URL = new URL("https://accounts.spotify.com/authorize")
) => {
    const codeVerifier = generateRandomString(64);
    window.localStorage.setItem('code_verifier', codeVerifier);

    const code_challenge = await codeChallenge(codeVerifier);

    const params = {
        response_type: 'code',
        client_id: clientId,
        scope,
        code_challenge_method: 'S256',
        code_challenge,
        redirect_uri: redirectUri,
    };

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
}

export const getToken = async (code: string, clientId: string, redirectUri: string) => {
  // stored in the previous step
  const codeVerifier = window.localStorage.getItem('code_verifier');

  if (!codeVerifier) {
    throw new Error('Code verifier not found in localStorage.');
  }

  const url = "https://accounts.spotify.com/api/token";
  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }).toString(),
  }

  const body = await fetch(url, payload);
  if (body.ok) {
    const response = await body.json();

    localStorage.setItem('spotify_auth', JSON.stringify({
      access_token: response.access_token,
      expires_at: Date.now() + response.expires_in * 1000
    }));
    return;
  }
  return Promise.reject("Failed to exchange code for token");
}

const handleResponseErrors = (response: Response) => {
  if (response.status === 401) {
    alert("Unauthorized (401): Access token is invalid or expired.");
  }
  else if (response.status === 403) {
    alert("Forbidden (403): You do not have permission to access this resource.");
  }
  else if (response.status === 429) {
    alert("Too Many Requests (429): You have exceeded the rate limit. Please try again later.");
  }
}

export const searchTracks = async (term: string, token: string) => {
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(term)}&type=track&limit=10`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    handleResponseErrors(response);
    if (response.ok) {
      const jsonResponse = await response.json();
      if (jsonResponse.tracks.items) {
        return jsonResponse.tracks.items.map((track: Track) => {
          return {
            id: track.id,
            name: track.name,
            artists: track.artists,
            album: track.album,
            uri: track.uri
          };
        });
      }
    }
    return [];
}

export const createPlaylist = async (name: string, trackUris: string[], token: string) => {
  if (Array.isArray(trackUris) && trackUris.length) {
    const createPlaylistUrl = `https://api.spotify.com/v1/me/playlists`
    const response = await fetch(createPlaylistUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body : JSON.stringify({
        name: name,
        public: true
      })
    });

    handleResponseErrors(response);
    if (response.ok) {
      const jsonResponse = await response.json();
      const playlistId = jsonResponse.id;
      
      if (playlistId) {
        const addPlaylistitemsUrl = `https://api.spotify.com/v1/playlists/${playlistId}/items`;
        const addResponse = await fetch(addPlaylistitemsUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body : JSON.stringify({uris: trackUris, position: 0})
        });
        handleResponseErrors(addResponse);
        return;
      }
    }
  }
  return Promise.reject("Empty track list");
}