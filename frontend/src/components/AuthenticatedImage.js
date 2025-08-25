import React, { useState, useEffect } from 'react';

/**
 * A component to display an image from a protected API endpoint.
 * It fetches the image data as a blob using an authenticated API call
 * and then renders it, handling loading, error, and memory cleanup.
 * @param {object} props
 * @param {() => Promise<any>} props.fetchImage - The async function that fetches the image.
 * @param {string} props.alt - The alt text for the image.
 * @param {object} props.style - The style object for the image tag.
 */
function AuthenticatedImage({ fetchImage, alt, style }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // A flag to prevent state updates if the component unmounts during the fetch
    let isMounted = true;
    // We store the object URL here so the cleanup function can access it
    let objectUrl = null;

    const loadImage = async () => {
      try {
        const response = await fetchImage();
        objectUrl = URL.createObjectURL(response.data);
        if (isMounted) {
          setImageSrc(objectUrl);
        }
      } catch (err) {
        console.error("Failed to load authenticated image:", err);
        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadImage();

    // This is the cleanup function that runs when the component is removed
    return () => {
      isMounted = false;
      // If the object URL was created, we revoke it to free up browser memory
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fetchImage]); // The effect re-runs if the fetchImage function changes

  if (loading) {
    return <span>Loading...</span>;
  }

  if (error || !imageSrc) {
    return <span>Error</span>;
  }
  
  return <img src={imageSrc} alt={alt} style={style} />;
}

export default AuthenticatedImage;