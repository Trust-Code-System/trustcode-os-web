"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function WorkspaceUrl() {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  return <div><div className="settings-url-field"><span>https://</span><span>trustcode-os-web.vercel.app</span><button type="button" aria-label={copied ? "Workspace URL copied" : "Copy workspace URL"} onClick={async () => { try { await navigator.clipboard.writeText("https://trustcode-os-web.vercel.app"); setCopied(true); setFailed(false); } catch { setFailed(true); } }}>{copied ? <Check size={14} /> : <Copy size={14} />}</button></div><span className="settings-copy-status" role="status">{copied ? "Copied to clipboard" : failed ? "Select the URL to copy it manually." : ""}</span></div>;
}
