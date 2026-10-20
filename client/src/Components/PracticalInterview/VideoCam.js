import React, { useEffect, useRef, useState } from 'react';

const VideoCam = ({ isRecording }) => {
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          // Add event listener to check when video metadata is loaded
          videoRef.current.addEventListener('loadedmetadata', () => {
            setVideoReady(true);
            videoRef.current.play().catch(error => {
              console.error('Error playing video:', error);
            });
          });
        }
      } catch (error) {
        console.error('Error accessing webcam:', error);
      }
    };

    startVideo();

    // Clean up function to stop video stream
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '50%',
        height: '100%',
        backgroundColor: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <video
        ref={videoRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',  // Ensures the video covers the whole container
          borderRadius: '0',
        }}
        muted
      />
      {isRecording && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'rgba(255, 0, 0, 0.7)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }}
        >
          Recording
        </div>
      )}
    </div>
  );
};

export default VideoCam;
