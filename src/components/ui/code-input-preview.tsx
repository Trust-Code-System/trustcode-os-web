"use client";

import { useState } from "react";
import { CodeInput, type CodeInputStatus } from "./code-input";

export function CodeInputPreview() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<CodeInputStatus>("idle");
  return <section className="code-preview"><div><h2>Animated code entry</h2><p>Interactive component preview. This does not sign in or verify an account.</p></div><CodeInput value={code} onChange={(next) => { setCode(next); setStatus("idle"); }} status={status} /><div className="code-preview-actions"><button type="button" onClick={() => setStatus("checking")} disabled={code.length !== 6 || status === "checking" || status === "success"}>Preview checking</button><button type="button" onClick={() => setStatus("error")} disabled={code.length !== 6 || status === "success"}>Preview error</button><button type="button" onClick={() => setStatus("success")} disabled={code.length !== 6 || status === "success"}>Preview success</button><button type="button" onClick={() => { setCode(""); setStatus("idle"); }}>Reset</button></div></section>;
}
