/**
 * ImageUpload Component
 * Handles image selection, preview, and upload to Cloudinary
 */

import { useState } from 'react';
import axios from 'axios';
import '../styles/ImageUpload.css';

export default function ImageUpload({ onImagesChange }) {
  const [selectedImages, setSelectedImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file count (max 3 images)
    if (selectedImages.length + files.length > 3) {
      alert('Maximum 3 images allowed per report');
      return;
    }

    // Validate file size (max 5MB per image)
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} exceeds 5MB size limit`);
        return false;
      }
      return true;
    });

    setSelectedImages([...selectedImages, ...validFiles]);

    // Generate previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, {
          id: Date.now() + Math.random(),
          src: reader.result,
          name: file.name,
          uploading: false,
          url: null
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (selectedImages.length === 0) {
      alert('Please select at least one image');
      return;
    }

    setUploading(true);
    const uploadedUrls = [];

    try {
      for (let i = 0; i < selectedImages.length; i++) {
        const formData = new FormData();
        formData.append('file', selectedImages[i]);
        formData.append('upload_preset', 'civic_reports'); // Configure in Cloudinary
        formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_NAME);

        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_NAME}/image/upload`,
          formData,
          {
            onUploadProgress: (progressEvent) => {
              const progress = Math.round(
                ((progressEvent.loaded * 100) / progressEvent.total) * (1 / selectedImages.length) +
                (i / selectedImages.length) * 100
              );
              setUploadProgress(progress);
            }
          }
        );

        uploadedUrls.push(response.data.secure_url);

        // Update preview with uploaded URL
        setPreviews(prev => prev.map((p, idx) => 
          idx === i ? { ...p, url: response.data.secure_url, uploading: false } : p
        ));
      }

      // Pass uploaded URLs to parent component
      onImagesChange(uploadedUrls);
      setUploadProgress(100);
      
      // Reset after 1 second
      setTimeout(() => {
        setSelectedImages([]);
        setPreviews([]);
        setUploadProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div className="image-upload-container">
      <h3>📸 Add Images (Optional)</h3>
      <p className="upload-hint">
        Up to 3 images, maximum 5MB each. JPEG, PNG, or WebP format.
      </p>

      {/* File Input */}
      <div className="file-input-wrapper">
        <label htmlFor="image-input" className="upload-button">
          <span>+ Select Images</span>
          <input
            id="image-input"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            disabled={selectedImages.length >= 3 || uploading}
            style={{ display: 'none' }}
          />
        </label>
        <span className="file-count">({selectedImages.length}/3)</span>
      </div>

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="preview-grid">
          {previews.map((preview, index) => (
            <div key={preview.id} className="preview-item">
              <img src={preview.src} alt={`Preview ${index + 1}`} />
              <button
                className="remove-button"
                onClick={() => removeImage(index)}
                disabled={uploading}
                type="button"
              >
                ✕
              </button>
              {preview.url && <span className="uploaded-badge">✓</span>}
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="progress-text">{uploadProgress}%</p>
        </div>
      )}

      {/* Upload Button */}
      {selectedImages.length > 0 && (
        <button
          className="upload-confirm-button"
          onClick={uploadImages}
          disabled={uploading}
        >
          {uploading ? '⏳ Uploading...' : `📤 Upload ${selectedImages.length} Image${selectedImages.length > 1 ? 's' : ''}`}
        </button>
      )}
    </div>
  );
}
