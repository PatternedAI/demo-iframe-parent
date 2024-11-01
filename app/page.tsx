"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export default function Child() {
  const [isMounted, setIsMounted] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null); // State to store the access token
  const [accessTokenError, setAccessTokenError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const sendAccessToken = useCallback((token: string | null) => {
    if (iframeRef.current && token) {
      iframeRef.current.contentWindow?.postMessage(
        { message: "accessToken", token },
        process.env.NEXT_PUBLIC_PARENT_SITE_URL!,
      );
      console.log("Access token sent to parent:", token);
    }
  }, []);

  // Function to handle iframe load event
  const handleIframeLoad = () => {
    console.log("Iframe loaded");
    sendAccessToken(accessToken);
  };

  const getAccessToken = useCallback(async () => {
    const response = await fetch("/api/get-access-token");

    const data = await response.json();

    console.log({ data });

    if (data.error) {
      setAccessTokenError(data.error);
      return;
    }

    if (data.accessToken) {
      setAccessToken(data.accessToken);
      sendAccessToken(data.accessToken);
      setAccessTokenError(null);
      return;
    }
  }, [sendAccessToken]);

  useEffect(() => {
    getAccessToken();
  }, []);

  // Listener to any event from the iframe
  useEffect(() => {
    // Handler for messages from the child iframe
    const handleChildMessage = (event: MessageEvent) => {
      // Ensure the message is from the expected origin
      if (event.origin === process.env.NEXT_PUBLIC_PARENT_SITE_URL) {
        console.log("Message received from child:", event.data);

        // Check the message structure
        if (
          event.data &&
          typeof event.data === "object" &&
          event.data.message
        ) {
          const { message } = event.data;

          if (message === "tokenExpired") {
            console.log("Token has expired, refreshing required.");
            setAccessToken(null);
            setAccessTokenError("Token has expired, refreshing required.");
          } else {
            console.log("Unknown message received:", message);
          }
        }
      }
    };

    // Attach the message event listener
    window.addEventListener("message", handleChildMessage);

    // Clean up the event listener on component unmount
    return () => window.removeEventListener("message", handleChildMessage);
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

      <div>
        <button
          onClick={() => {
            setTimeout(() => {
              sendAccessToken(accessToken);
            }, 6000);
          }}
        >
          Send Access Token (test after 5s)
        </button>

        <button onClick={getAccessToken}>Request new access token</button>
      </div>

      <iframe
        ref={iframeRef}
        src={process.env.NEXT_PUBLIC_PARENT_SITE_URL}
        className="w-full h-screen border-2 border-black"
        onLoad={handleIframeLoad}
      />
    </main>
  );
}
