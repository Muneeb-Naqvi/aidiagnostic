"use client"

export default function PDFViewer({ url }) {
  const proxyUrl = `/api/proxy-pdf?url=${encodeURIComponent(url)}`
  return (
    <iframe
      src={proxyUrl}
      width="100%"
      height="600px"
      style={{ border: "none" }}
    />
  )
}