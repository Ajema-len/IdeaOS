import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email already in use" }, { status: 409 });
    }

    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        preferences: {
          create: {},
        },
      },
    });

    return NextResponse.json({
      message: "Account created successfully",
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Registration failed" }, { status: 500 });
  }
}
