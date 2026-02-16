import getDB from "@/config/database"
import { ObjectId } from "mongodb"
import { NextResponse } from "next/server"

export async function DELETE(req, context) {
  try {
    const params = await context.params;
    const db = await getDB()
    await db.collection("labReports").deleteOne({
      _id: new ObjectId(params.id),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DELETE ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
