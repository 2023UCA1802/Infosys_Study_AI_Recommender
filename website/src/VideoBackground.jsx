
import "./App.css";

const VideoBackground = ({ children }) => {
  return (
    <div className="video-container">
      <video autoPlay muted loop playsInline className="bg-video">
        <source src="/delhi_bg_slowed.mp4" type="video/mp4" />
      </video>

      <div className="content">
        {children}
      </div>
    </div>
  );
};

export default VideoBackground;
