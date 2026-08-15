#!/usr/bin/env bash
# Sets up the Python environment for the parent-teacher-guardian project.
# Safe to re-run: updates the env if it already exists.
set -euo pipefail

ENV_NAME="ptg"
MINICONDA_DIR="$HOME/miniconda3"

# ── 1. Install Miniconda if conda isn't available ────────────────────────────
if ! command -v conda &>/dev/null; then
  echo "conda not found — installing Miniconda..."
  case "$(uname -s)-$(uname -m)" in
    Darwin-arm64)  INSTALLER="Miniconda3-latest-MacOSX-arm64.sh"  ;;
    Darwin-x86_64) INSTALLER="Miniconda3-latest-MacOSX-x86_64.sh" ;;
    Linux-x86_64)  INSTALLER="Miniconda3-latest-Linux-x86_64.sh"  ;;
    Linux-aarch64) INSTALLER="Miniconda3-latest-Linux-aarch64.sh"  ;;
    *) echo "Unsupported OS/arch: $(uname -s)-$(uname -m)"; exit 1 ;;
  esac
  TMP_INSTALLER="/tmp/$INSTALLER"
  curl -fsSL "https://repo.anaconda.com/miniconda/$INSTALLER" -o "$TMP_INSTALLER"
  bash "$TMP_INSTALLER" -b -p "$MINICONDA_DIR"
  rm "$TMP_INSTALLER"
  eval "$("$MINICONDA_DIR/bin/conda" shell.bash hook)"
  conda init --all --quiet
  echo "Miniconda installed at $MINICONDA_DIR"
else
  eval "$(conda shell.bash hook)"
fi

# ── 2. Create or update the conda environment ────────────────────────────────
if conda env list | grep -qE "^${ENV_NAME}\s"; then
  echo "Updating existing '${ENV_NAME}' environment..."
  conda env update --name "$ENV_NAME" --file environment.yml --prune
else
  echo "Creating '${ENV_NAME}' environment..."
  conda env create --file environment.yml
fi

# ── 3. Verify the install ────────────────────────────────────────────────────
echo ""
echo "Verifying installation..."
conda run --name "$ENV_NAME" python - <<'PYEOF'
import sys
from google import genai  # noqa: F401
import numpy  # noqa: F401
import sounddevice  # noqa: F401
print(f"  Python {sys.version.split()[0]} ✓")
print(f"  google-genai ✓")
print(f"  numpy ✓")
print(f"  sounddevice ✓")
PYEOF

# ── 4. API key reminder ──────────────────────────────────────────────────────
if [ ! -f "api_key.env" ]; then
  echo ""
  echo "⚠  api_key.env not found."
  echo "   Create it with your Gemini API key:"
  echo "   echo 'YOUR_API_KEY' > api_key.env"
fi

echo ""
echo "Setup complete."
echo ""
echo "To run the message generator:"
echo "  conda activate ${ENV_NAME}"
echo "  python scripts/generate_messages.py"
echo ""
echo "To run the speech-to-text listener (raw STT, for testing):"
echo "  conda activate ${ENV_NAME}"
echo "  python stt_test_file.py"
echo ""
echo "To capture weekly teacher voice notes:"
echo "  conda activate ${ENV_NAME}"
echo "  python scripts/voice_notes.py"
echo ""
echo "  Speak freely about your students. The full recording is transcribed"
echo "  and an LLM pass splits it into per-student notes matched to the roster."
echo "  Press Ctrl+C when done speaking, then confirm to save."
echo ""
echo "  Optional flags:"
echo "    --threshold 0.02   raise if background noise triggers recording"
echo "    --silence 1.0      shorten pause needed to end an utterance"
