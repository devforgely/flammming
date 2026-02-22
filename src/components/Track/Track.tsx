import './Track.css'


export default function Track({ track, onAdd, onRemove, isRemoval }: TrackProps) {
  const handleAction = () => {
    if (isRemoval) {
      onRemove(track);
    } else {
      onAdd(track);
    }
  };

  return (
    <div className="track">
      <div className="track-info-container">
        <div className="track-artwork">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
        </div>
        <div className="track-info">
          <h3>{track.name}</h3>
          <p>{track.artists[0].name} <span className="dot">•</span> {track.album.name}</p>
        </div>
      </div>
      <button className={`track-action-btn ${isRemoval ? 'remove' : 'add'}`} onClick={handleAction}>
        {isRemoval ? (
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        )}
      </button>
    </div>
  );
};