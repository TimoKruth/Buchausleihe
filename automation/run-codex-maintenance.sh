#!/bin/zsh

set -eu
setopt pipefail

export PATH="/opt/homebrew/bin:/opt/homebrew/opt/node/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

readonly REPO_ROOT="$(cd -- "$(dirname -- "$0")/.." && pwd)"
readonly PROMPT_FILE="$REPO_ROOT/automation/codex-maintenance-prompt.md"
readonly LOG_DIR="$HOME/Library/Logs"
readonly LOG_FILE="$LOG_DIR/Buchausleihe-codex-maintenance.log"
readonly LOCK_DIR="${TMPDIR:-/tmp}/buchausleihe-codex-maintenance.lock"

mkdir -p "$LOG_DIR"

if [[ -f "$LOG_FILE" ]] && (( $(stat -f %z "$LOG_FILE") > 5242880 )); then
  mv -f "$LOG_FILE" "$LOG_FILE.1"
fi

{
  print -- "[$(date '+%Y-%m-%d %H:%M:%S %Z')] Starting daily Codex maintenance"

  if ! mkdir "$LOCK_DIR" 2>/dev/null; then
    lock_pid=""
    if [[ -f "$LOCK_DIR/pid" ]]; then
      lock_pid="$(sed -n '1p' "$LOCK_DIR/pid")"
    fi

    if [[ -n "$lock_pid" ]] && kill -0 "$lock_pid" 2>/dev/null; then
      print -- "Another maintenance run is active (PID $lock_pid); skipping."
      exit 0
    fi

    rm -f "$LOCK_DIR/pid"
    rmdir "$LOCK_DIR" 2>/dev/null || {
      print -- "Unable to clear stale lock: $LOCK_DIR"
      exit 1
    }
    mkdir "$LOCK_DIR"
  fi

  print -- "$$" > "$LOCK_DIR/pid"

  cleanup_lock() {
    rm -f "$LOCK_DIR/pid"
    rmdir "$LOCK_DIR" 2>/dev/null || true
  }
  trap cleanup_lock EXIT INT TERM

  if [[ ! -r "$PROMPT_FILE" ]]; then
    print -- "Prompt file is missing or unreadable: $PROMPT_FILE"
    exit 1
  fi

  if ! codex_bin="$(command -v codex)"; then
    print -- "Codex CLI was not found in PATH: $PATH"
    exit 1
  fi

  cd "$REPO_ROOT"

  if [[ "${CODEX_MAINTENANCE_VALIDATE_ONLY:-0}" == "1" ]]; then
    print -- "Validation succeeded; Codex executable: $codex_bin"
    exit 0
  fi

  set +e
  "$codex_bin" \
    --ask-for-approval never \
    exec \
    --sandbox workspace-write \
    --config 'sandbox_workspace_write.network_access=true' \
    --config 'model_reasoning_effort="high"' \
    --cd "$REPO_ROOT" \
    --ephemeral \
    --ignore-user-config \
    - < "$PROMPT_FILE"
  exit_status=$?
  set -e

  print -- "[$(date '+%Y-%m-%d %H:%M:%S %Z')] Codex maintenance finished with status $exit_status"
  exit "$exit_status"
} >> "$LOG_FILE" 2>&1
