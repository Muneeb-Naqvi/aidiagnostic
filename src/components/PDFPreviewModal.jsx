"use client"

import { useState, useEffect, useCallback } from "react"

export default function PDFPreviewModal({ url, reportId, onClose }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [useDirect, setUseDirect] = useState(true)
  const [fileName, setFileName] = useState("report.pdf")

  const isValidCloudinaryUrl = useCallback((u) => {
    if (!u) return false
    return u.includes("res.cloudinary.com") || u.includes("cloudinary.com")
  }, [])

  const getProxyUrl = useCallback(
    (originalUrl) => {
      try {
        return `/api/proxy-pdf?url=${encodeURIComponent(originalUrl)}`
      } catch {
        return originalUrl
      }
    },
    []
  )

  const displayUrl = useDirect ? url : getProxyUrl(url)

  useEffect(() => {
    if (!url) return
    try {
      const parts = url.split("/")
      const name = parts[parts.length - 1] || "report.pdf"
      setFileName(decodeURIComponent(name))
    } catch {
      setFileName("report.pdf")
    }
  }, [url])

  const handleLoad = () => {
    setLoading(false)
    setError(false)
  }

  const handleError = () => {
    setLoading(false)
    setError(true)
  }

  const handleRetry = () => {
    setError(false)
    setLoading(true)
    setUseDirect((prev) => !prev)
  }

  useEffect(() => {
    if (!url) {
      setError(true)
      setLoading(false)
    }
  }, [url])

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-black truncate">{fileName}</h3>
              <p className="text-xs text-black truncate">
                {isValidCloudinaryUrl(url) ? "Cloudinary" : "External"} PDF
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const link = document.createElement("a")
                link.href = url
                link.download = fileName
                link.target = "_blank"
                link.rel = "noopener noreferrer"
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-black hover:bg-slate-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-black hover:text-black hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 relative bg-slate-50">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium text-black">Loading PDF preview...</p>
            </div>
          )}

          {error ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-8">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-black">Unable to Load PDF</h3>
                <p className="text-sm text-black max-w-md">
                  The PDF could not be embedded. This may be due to CORS, network issues, or browser restrictions. You can still view or download the file.
                </p>
                <p className="text-xs font-mono text-black break-all max-w-lg">
                  {url}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in New Tab
                </a>
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-black text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try {useDirect ? "Proxy" : "Direct"}
                </button>
              </div>
            </div>
          ) : (
            <iframe
              src={displayUrl}
              className="w-full h-full border-none bg-white"
              title={`PDF Preview - ${fileName}`}
              onLoad={handleLoad}
              onError={handleError}
              allow="fullscreen"
              referrerPolicy="no-referrer"
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50 shrink-0">
          <p className="text-xs text-black">
            Mode: <span className="font-semibold text-black">{useDirect ? "Direct (Cloudinary)" : "Proxy"}</span>
          </p>
          <div className="flex items-center gap-2">
            {isValidCloudinaryUrl(url) && (
              <button
                onClick={handleRetry}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
              >
                Switch to {useDirect ? "Proxy" : "Direct"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
