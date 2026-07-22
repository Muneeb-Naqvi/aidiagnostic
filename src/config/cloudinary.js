import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadFile(file, folder = "medical-reports", fileType = "application/octet-stream") {
  try {
    let fileToUpload = file
    if (Buffer.isBuffer(file)) {
      const base64 = file.toString("base64")
      fileToUpload = `data:${fileType};base64,${base64}`
    }
  const result = await cloudinary.uploader.upload(fileToUpload, {
    folder: `medicare/${folder}`,
    resource_type: "auto",
    type: "upload",
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    access_mode: "public",
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
