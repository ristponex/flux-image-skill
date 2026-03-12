# Flux Image Skill

## Overview

This project provides a CLI tool (`flux-image`) for generating images using Flux (Black Forest Labs) models via the Atlas Cloud API.

## Commands

### Generate an image
```bash
flux-image "your prompt here"
```

### Fast generation with Schnell
```bash
flux-image "prompt" --model schnell
```

### NSFW generation (disable safety checker)
```bash
flux-image "prompt" --nsfw
```

### LoRA fine-tuned generation
```bash
flux-image "prompt" --lora
```

### Image editing with mask
```bash
flux-image "edit instructions" --image ./source.png --mask ./mask.png --strength 0.75
```

### Kontext-aware generation
```bash
flux-image "prompt" --model kontext
```

### Model variants
- `--model dev` (default) — High quality, $0.012/image
- `--model schnell` — Ultra fast, $0.003/image
- `--model kontext` — Context-aware
- `--lora` flag — Switches to LoRA variant

### Common options
- `--size WxH` — Image dimensions (default: 1024x1024)
- `--steps N` — Inference steps (default: 28, schnell: 4)
- `--guidance N` — Guidance scale (default: 3.5)
- `--count N` — Number of images (default: 1)
- `--seed N` — Random seed
- `--output path` — Custom output path
- `--nsfw` — Disable safety checker

## Output

Images are saved to `./output/` directory by default.

## Setup

Requires `ATLAS_CLOUD_API_KEY` in `.env` file.
