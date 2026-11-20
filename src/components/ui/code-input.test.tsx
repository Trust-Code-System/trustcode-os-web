import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CodeInput, type CodeInputStatus } from "./code-input";

vi.mock("@/lib/hooks/use-motion-preference", () => ({ useMotionPreference: () => true }));
afterEach(cleanup);

function Harness({ complete, status = "idle" }: { complete?: (code: string) => void; status?: CodeInputStatus }) {
  const [value, setValue] = useState("");
  return <CodeInput value={value} onChange={setValue} {...(complete ? { onComplete: complete } : {})} status={status} />;
}

describe("animated code input", () => {
  it("accepts a pasted formatted code, strips non-digits and announces completion", async () => {
    const user = userEvent.setup();
    const complete = vi.fn();
    render(<Harness complete={complete} />);
    const input = screen.getByRole("textbox", { name: "Verification code" });
    await user.click(input);
    await user.paste("123 456");
    expect(input).toHaveValue("123456");
    expect(input).toHaveAttribute("autocomplete", "one-time-code");
    expect(complete).toHaveBeenCalledExactlyOnceWith("123456");
    expect(screen.getByText("6 of 6 digits entered")).toBeInTheDocument();
  });

  it("limits digits and keeps existing input through an error or success state", () => {
    const result = render(<Harness />);
    const input = screen.getByRole("textbox", { name: "Verification code" });
    fireEvent.change(input, { target: { value: "12ab345678" } });
    expect(input).toHaveValue("123456");
    result.rerender(<Harness status="error" />);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveValue("123456");
    result.rerender(<Harness status="success" />);
    expect(input).toHaveAttribute("readonly");
    expect(screen.getByText("Code accepted.")).toBeInTheDocument();
  });
});
