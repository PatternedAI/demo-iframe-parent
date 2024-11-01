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

    console.log({ accessTokenData });

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
