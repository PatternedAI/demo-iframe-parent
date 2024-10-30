"use client";

import { useEffect, useRef, useState } from "react";

export default function Child() {
  const [isMounted, setIsMounted] = useState(false);
  const [accessToken, setAccessToken] = useState(null); // State to store the access token
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sendAccessToken = () => {
    if (iframeRef.current && accessToken) {
      iframeRef.current.contentWindow?.postMessage(
        { accessToken },
        process.env.PARENT_SITE_URL || "http://localhost:3001",
      );
      console.log("Access token sent to parent:", accessToken);
    }
  };

  useEffect(() => {
    // Function to fetch JWT
    const getJwtToken = async () => {
      try {
        const response = await fetch(
          `${process.env.PARENT_SITE_URL}/api/get-jwt`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: "exampleUserId" }),
          },
        );

        if (!response.ok) throw new Error("Failed to authenticate");

        const data = await response.json();
        const token = data.accessToken;

        // Store the access token in state
        setAccessToken(token);
        console.log("Access token fetched:", token);
      } catch (error) {
        console.error("Error fetching JWT token:", error);
      }
    };

    // Fetch JWT token after mounting
    getJwtToken();
  }, []);

  // Function to handle iframe load event
  const handleIframeLoad = () => {
    console.log("Iframe loaded");
    sendAccessToken(); // Send access token when iframe is ready
  };

  if (!isMounted) return null;

  return (
    <main className="max-w-7xl mx-auto py-10">
      <div className="flex items-center justify-center text-3xl font-bold">
        <h1>Child</h1>
      </div>

      <iframe
        ref={iframeRef}
        src={process.env.PARENT_SITE_URL}
        className="w-full h-screen border-2 border-black"
        onLoad={handleIframeLoad} // Call onLoad event to handle iframe load
      />

      {/* Optional: Button to send a message to the parent */}
      <button onClick={sendAccessToken}>Send Access Token</button>
    </main>
  );
}
