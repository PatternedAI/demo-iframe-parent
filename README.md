# iFrame Parent Repository
This repository contains code for an iFrame parent application built with Next.js. It securely communicates with a backend to fetch an access token, which it sends to an embedded iFrame. The iFrame then uses this token for authentication.

## Features
- Fetches an access token from a backend server using an API.
- Embeds an iFrame and sends the access token securely.
- Listens for messages from the iFrame to handle token expiration and other events.

## Getting Started
### Prerequisites
To run this application, ensure you have:
- Node.js and npm installed.
- A .env file set up with the required environment variables (details below).

### Installation
1- Clone this repository:
```git
git clone https://github.com/PatternedAI/demo-iframe-parent.git
```
2- Navigate to the project directory:
```bash
cd demo-iframe-parent
```
3- Install dependencies:
```npm
npm install
```
4- Set up environment variables by creating a .env file with the following:
```env
NEXT_PUBLIC_CHILD_SITE_URL=https://demo-iframe-ten.vercel.app # or any link for the iframe repo (http://localhost:3001)
API_KEY_SECRET="hello-world"
```

#### Run the Application
```npm
npm run dev
```
2- Open http://localhost:3000 in your browser.

### Code Overview
#### API Route - Access Token Retrieval
The GET API route at /api/get-access-token connects to the backend and fetches an access token.
```ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const AUTH_SECRET = process.env.API_KEY_SECRET!;

    const accessTokenResponse = await fetch(
      `${process.env.NEXT_PUBLIC_CHILD_SITE_URL!}/api/get-jwt`,
      {
        method: "POST",
        body: JSON.stringify({ auth_secret: AUTH_SECRET }),
        headers: { "Content-Type": "application/json" },
      },
    );

    const accessTokenData = await accessTokenResponse.json();

    if (accessTokenData.error) {
      return NextResponse.json(
        { error: accessTokenData.error },
        { status: accessTokenData.status },
      );
    }

    return NextResponse.json(
      { accessToken: accessTokenData.accessToken },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error!" },
      { status: 500 },
    );
  }
}
```

Page - Displaying the iFrame and Sending the Token
The page is responsible for:

- Fetching the access token when the component mounts.
- Embedding an iFrame and sending the token to it once available.
- Handling messages from the iFrame for token expiration.

#### Configuration
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors 'self' ${process.env.NEXT_PUBLIC_CHILD_SITE_URL}`,
          },
        ],
      },
    ];
  },
};
export default nextConfig;
```

#### Additional Notes
- Token Expiration Handling: If the token expires, the child iFrame will send a tokenExpired message to the parent, triggering a token refresh.
- Debugging: Console logs in both the parent and iFrame will display token activity for easier debugging.
