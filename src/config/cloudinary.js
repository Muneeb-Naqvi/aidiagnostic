import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadFile(file, folder = "medical-reports") {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: `medicare/${folder}`,
      resource_type: "auto",
    })
    console.log("[CLOUDINARY] File uploaded successfully:", result.public_id)
    return {
      url: result.secure_url,
      publicId: result.public_id,
      size: result.bytes,
    }
  } catch (error) {
    console.error("[CLOUDINARY] Upload failed:", error)
    throw error
  }
}

export async function deleteFile(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    console.log("[CLOUDINARY] File deleted successfully:", publicId)
    return result
  } catch (error) {
    console.error("[CLOUDINARY] Delete failed:", error)
    throw error
  }
}

export default { uploadFile, deleteFile }
