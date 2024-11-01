"use client";

import { useEffect, useRef, useState } from "react";

export default function Child() {
  const [isMounted, setIsMounted] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null); // State to store the access token
  const [accessTokenError, setAccessTokenError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const sendAccessToken = () => {
    if (iframeRef.current && accessToken) {
      iframeRef.current.contentWindow?.postMessage(
        { accessToken },
        process.env.NEXT_PUBLIC_PARENT_SITE_URL!,
      );
      console.log("Access token sent to parent:", accessToken);
    }
  };

  // Function to handle iframe load event
  const handleIframeLoad = () => {
    console.log("Iframe loaded");
    sendAccessToken();
  };

  useEffect(() => {
    const getAccessToken = async () => {
      const response = await fetch("/api/get-access-token");

      const data = await response.json();

      if (data.error) {
        setAccessTokenError(data.error);
        return;
      }

      if (data.accessToken) {
        setAccessToken(data.accessToken);
        return;
      }
    };

    getAccessToken();
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <main className="max-w-7xl mx-auto py-10">
      <div className="flex items-center justify-center text-3xl font-bold">
        <h1>Parent</h1>
      </div>

      <iframe
        ref={iframeRef}
        src={process.env.NEXT_PUBLIC_PARENT_SITE_URL}
        className="w-full h-screen border-2 border-black"
        onLoad={handleIframeLoad}
      />

      {/* Optional: Button to send a message to the parent */}
      <button
      // onClick={sendAccessToken}
      >
        Send Access Token
      </button>
    </main>
  );
}
