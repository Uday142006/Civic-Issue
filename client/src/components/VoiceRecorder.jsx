import { useState, useRef, useEffect } from 'react';
import '../styles/VoiceRecorder.css';

export default function VoiceRecorder({ onVoiceRecorded }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    return () => {
      // Clean up on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const duration = Math.round(mediaRecorder.duration || 0);

        const recording = {
          id: Date.now(),
          url,
          duration,
          blob,
          size: blob.size,
        };

        setRecordings([...recordings, recording]);

        if (onVoiceRecorded) {
          onVoiceRecorded(recording);
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Microphone access denied:', error);
      alert('Please allow microphone access to record voice notes');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const removeRecording = (id) => {
    const updated = recordings.filter(r => r.id !== id);
    setRecordings(updated);
  };

  const playRecording = (url) => {
    const audio = new Audio(url);
    audio.play();
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="voice-recorder-container">
      <h3>🎤 Add Voice Notes (Optional)</h3>
      <p className="recording-hint">Record voice explanations of the issue</p>

      {/* Recording Controls */}
      <div className="recording-controls">
        {!isRecording ? (
          <button
            className="record-button"
            onClick={startRecording}
          >
            🎙️ Start Recording
          </button>
        ) : (
          <button
            className="stop-button"
            onClick={stopRecording}
          >
            ⏹️ Stop Recording
          </button>
        )}
      </div>

      {/* Recordings List */}
      {recordings.length > 0 && (
        <div className="recordings-list">
          <h4>Recorded Voice Notes:</h4>
          {recordings.map((recording, index) => (
            <div key={recording.id} className="recording-item">
              <div className="recording-info">
                <span className="recording-number">#{index + 1}</span>
                <span className="recording-duration">
                  ⏱️ {formatDuration(recording.duration)}
                </span>
                <span className="recording-size">
                  {(recording.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <div className="recording-actions">
                <button
                  className="play-button"
                  onClick={() => playRecording(recording.url)}
                  title="Play recording"
                >
                  ▶️ Play
                </button>
                <button
                  className="remove-button"
                  onClick={() => removeRecording(recording.id)}
                  title="Remove recording"
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isRecording && (
        <div className="recording-indicator">
          <div className="pulse"></div>
          Recording...
        </div>
      )}
    </div>
  );
}
