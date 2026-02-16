import { extractTextFromImage } from "@/lib/ocr"
import { getDB } from "@/config/database"

export async function POST(req) {
  const { reportId, imagePath } = await req.json()
  const text = await extractTextFromImage(imagePath)

  const db = getDB()
  await db.collection("reports").updateOne(
    { _id: reportId },
    { $set: { extractedText: text, aiStatus: "processing" } }
  )

  return Response.json({ success: true })
}