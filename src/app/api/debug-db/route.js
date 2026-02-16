// src/app/api/debug-db/route.js
import connectDB from "@/lib/db";           // mongoose
// OR import { connectDB } from "@/config/database";   // raw

export async function GET() {
  try {
    await connectDB();
    return Response.json({ ok: true, message: "Connection successful" });
  } catch (err) {
    return Response.json(
      { ok: false, error: err.message, stack: err.stack },
      { status: 500 }
    );
  }
}