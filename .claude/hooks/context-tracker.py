#!/usr/bin/env python3
"""
Context Usage Tracker - Tracks token consumption per request.

Uses UserPromptSubmit as "pre-message" hook and Stop as "post-response" hook
to calculate the delta in token usage for each request.

This version uses character-based estimation (no dependencies), so every
figure it prints is an estimate against an ASSUMED window, and says so.

Usage:
    Configure both hooks to use the same script:
    - UserPromptSubmit: saves current token count
    - Stop: calculates delta and reports usage
"""
import json
import os
import sys
import tempfile

# THE WINDOW IS NOT IN THE HOOK PAYLOAD, so it is assumed. It was a bare 128,000
# here, printed as fact beside a percentage, and the closing rule in CLAUDE.md
# ("context genuinely near exhaustion") is the one decision that percentage feeds.
# Set CLAUDE_CONTEXT_LIMIT to the model's window; the output names the figure used.
try:
    CONTEXT_LIMIT = int(os.environ.get("CLAUDE_CONTEXT_LIMIT", "200000"))
except ValueError:
    CONTEXT_LIMIT = 200000


def get_state_file(session_id: str) -> str:
    """Get temp file path for storing pre-message token count, isolated by session."""
    return os.path.join(tempfile.gettempdir(), f"claude-context-{session_id}.json")


def count_tokens_estimate(text: str) -> int:
    """
    Estimate token count using character-based approximation.

    Uses ~4 characters per token ratio, which provides ~80-90% accuracy
    for English text. Less accurate for code and non-English text.
    """
    return len(text) // 4


def read_transcript(transcript_path: str) -> str:
    """Read and concatenate all content from transcript file."""
    if not transcript_path or not os.path.exists(transcript_path):
        return ""

    content = []
    # The transcript is UTF-8; the locale default here is GBK and failed on
    # every prompt (2026-09-23). Replacement keeps a stray byte from ending the count.
    with open(transcript_path, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
            try:
                entry = json.loads(line.strip())
                # Extract text content from various message formats
                if "message" in entry:
                    msg = entry["message"]
                    if isinstance(msg.get("content"), str):
                        content.append(msg["content"])
                    elif isinstance(msg.get("content"), list):
                        for block in msg["content"]:
                            if isinstance(block, dict) and block.get("type") == "text":
                                content.append(block.get("text", ""))
            except json.JSONDecodeError:
                continue

    return "\n".join(content)


def handle_user_prompt_submit(data: dict) -> None:
    """Pre-message hook: Save current token count before request."""
    session_id = data.get("session_id", "unknown")
    transcript_path = data.get("transcript_path", "")

    transcript_content = read_transcript(transcript_path)
    current_tokens = count_tokens_estimate(transcript_content)

    # Save to temp file for later comparison
    state_file = get_state_file(session_id)
    with open(state_file, "w", encoding="utf-8") as f:
        json.dump({"pre_tokens": current_tokens}, f)


def handle_stop(data: dict) -> None:
    """Post-response hook: Calculate and report token delta."""
    session_id = data.get("session_id", "unknown")
    transcript_path = data.get("transcript_path", "")

    transcript_content = read_transcript(transcript_path)
    current_tokens = count_tokens_estimate(transcript_content)

    # Load pre-message count
    state_file = get_state_file(session_id)
    pre_tokens = 0
    if os.path.exists(state_file):
        try:
            with open(state_file, "r", encoding="utf-8") as f:
                state = json.load(f)
                pre_tokens = state.get("pre_tokens", 0)
        except (json.JSONDecodeError, IOError):
            pass

    # Calculate delta
    delta_tokens = current_tokens - pre_tokens
    remaining = CONTEXT_LIMIT - current_tokens
    percentage = (current_tokens / CONTEXT_LIMIT) * 100

    # Report usage (stderr so it doesn't interfere with hook output)
    print(
        f"Context (estimated): ~{current_tokens:,} tokens "
        f"({percentage:.1f}% of an assumed {CONTEXT_LIMIT:,}, ~{remaining:,} remaining)",
        file=sys.stderr,
    )
    if delta_tokens > 0:
        print(f"This request: ~{delta_tokens:,} tokens", file=sys.stderr)


def main():
    # The payload is UTF-8 bytes; json.load(sys.stdin) decoded it as GBK and a
    # prompt carrying Chinese failed to parse (2026-09-23). Read the bytes.
    try:
        sys.stderr.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass
    data = json.loads(sys.stdin.buffer.read().decode("utf-8-sig"))
    event = data.get("hook_event_name", "")

    if event == "UserPromptSubmit":
        handle_user_prompt_submit(data)
    elif event == "Stop":
        handle_stop(data)

    sys.exit(0)


if __name__ == "__main__":
    main()
