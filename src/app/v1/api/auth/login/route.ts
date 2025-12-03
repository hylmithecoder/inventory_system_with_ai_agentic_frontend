import { NextRequest, NextResponse } from "next/server";
import { signToken, createAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, isAdmin, session_token } = body;

    if (!username) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Buat JWT token
    const token = signToken({ username, isAdmin, session_token });
    const cookie = createAuthCookie(token);

    const response = NextResponse.json(
      { success: true, user: { username } },
      { status: 200 }
    );
    
    // Set cookie in response
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "Please use POST method for login" },
    { status: 405 }
  );
}