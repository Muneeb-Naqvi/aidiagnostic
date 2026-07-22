import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const targetUrl = searchParams.get("url")

    if (!targetUrl) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 })
    }

    const decodedUrl = decodeURIComponent(targetUrl)

    if (!decodedUrl.startsWith("http://") && !decodedUrl.startsWith("https://")) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
    }

    console.log(`[PROXY-PDF] Proxying PDF from: ${decodedUrl}`)

    const response = await fetch(decodedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MedPulse/1.0)",
        Accept: "application/pdf,application/octet-stream,*/*",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.error(`[PROXY-PDF] Upstream error: ${response.status} for ${decodedUrl}`)
      
      // If Cloudinary returns 401 (typically because PDF delivery is restricted on the account)
      if (response.status === 401 && (decodedUrl.includes("cloudinary.com") || decodedUrl.includes("res.cloudinary.com"))) {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cloudinary Configuration Required</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      margin: 0;
      padding: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .container {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 32px;
      max-width: 520px;
      width: 100%;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    .header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      color: #ef4444;
    }
    .icon {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      background: #fee2e2;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }
    p {
      font-size: 0.95rem;
      line-height: 1.6;
      color: #475569;
      margin: 0 0 16px 0;
    }
    .steps-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: #334155;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    ol {
      margin: 0 0 24px 0;
      padding-left: 20px;
    }
    li {
      font-size: 0.925rem;
      line-height: 1.6;
      color: #334155;
      margin-bottom: 10px;
    }
    strong {
      color: #0f172a;
    }
    .footer {
      border-top: 1px solid #f1f5f9;
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: #3b82f6;
      color: #ffffff;
      font-size: 0.875rem;
      font-weight: 600;
      padding: 10px 18px;
      border-radius: 8px;
      text-decoration: none;
      transition: background-color 0.2s;
    }
    .btn:hover {
      background-color: #2563eb;
    }
    .secondary-text {
      font-size: 0.75rem;
      color: #94a3b8;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <h1 class="title">Cloudinary Access Blocked (401)</h1>
    </div>
    
    <p>
      PDF files cannot be loaded because your Cloudinary account restricts PDF delivery by default. 
      To view patient uploaded reports, please enable delivery in your Cloudinary Console.
    </p>

    <div class="steps-title">How to enable PDF delivery:</div>
    <ol>
      <li>Log in to your <strong>Cloudinary Dashboard</strong>.</li>
      <li>Navigate to <strong>Settings</strong> (the gear icon, usually at bottom-left).</li>
      <li>Go to the <strong>Security</strong> settings tab.</li>
      <li>Scroll down to the <strong>PDF and ZIP files delivery</strong> section.</li>
      <li>Check the option to <strong>"Allow delivery of PDF and ZIP files"</strong>.</li>
      <li>Click <strong>Save</strong> at the bottom of the page to apply changes.</li>
    </ol>

    <div class="footer">
      <span class="secondary-text">Error: deny or ACL failure</span>
      <a href="https://cloudinary.com/console" target="_blank" rel="noopener noreferrer" class="btn">
        Open Cloudinary Console
      </a>
    </div>
  </div>
</body>
</html>
        `
        return new Response(html, {
          status: 200, // Return 200 so iframe renders it correctly without browser error intervention
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        })
      }

      return NextResponse.json(
        { error: `Upstream error: ${response.status}` },
        { status: response.status }
      )
    }

    const buf = Buffer.from(await response.arrayBuffer())

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=report.pdf",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Accept-Ranges": "bytes",
      },
    })
  } catch (err) {
    console.error("[PROXY-PDF]", err)
    return NextResponse.json(
      { error: err.message || "Proxy error" },
      { status: 500 }
    )
  }
}
