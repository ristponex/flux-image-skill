# Flux Image Skill

An AI Agent Skill for generating images using Flux (Black Forest Labs) models via Atlas Cloud API.

Works with 15+ AI coding agents including Claude Code, Cursor, OpenAI Codex, GitHub Copilot, Gemini CLI, Windsurf, OpenCode, Kiro, and more.

Flux is Black Forest Labs' cutting-edge image generation model family, offering some of the most affordable and highest-quality text-to-image generation available. This skill integrates Flux directly into your AI coding workflow with support for multiple model variants, LoRA fine-tuning, and unrestricted NSFW generation.

---

## Features

- **Text-to-Image Generation** — High-quality image generation from text prompts
- **Image Editing / Inpainting** — Edit existing images with mask-based inpainting
- **LoRA Support** — Use custom fine-tuned models via Flux Dev LoRA
- **NSFW Mode** — Disable safety checker for unrestricted generation
- **Multiple Model Variants** — From ultra-fast Schnell to high-quality Dev
- **Kontext Models** — Advanced context-aware generation
- **Incredibly Affordable** — Starting at just from $0.003/image with Flux Schnell

---

## Model Variants

| Model | ID | Starting Price per Image | Description |
|-------|-----|--------------------------|-------------|
| Flux Dev | `black-forest-labs/flux-dev` | from $0.012/image | High-quality, balanced speed and detail |
| Flux Schnell | `black-forest-labs/flux-schnell` | from $0.003/image | Ultra-fast generation, great for prototyping |
| Flux Dev LoRA | `black-forest-labs/flux-dev-lora` | from $0.032/image | Dev model with LoRA fine-tuning support |
| Flux Kontext Dev | `black-forest-labs/flux-kontext-dev` | from $0.020/image | Context-aware generation |
| Flux Kontext Dev LoRA | `black-forest-labs/flux-kontext-dev-lora` | from $0.032/image | Kontext with LoRA support |

*Prices shown are starting prices. Higher resolution or additional features may cost more.*

---

## Input Parameters

### Text-to-Image (Generate Mode)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `prompt` | string | *(required)* | Text description of the desired image |
| `size` | string | `1024x1024` | Output image dimensions (e.g., `512x512`, `1024x1024`, `1280x720`) |
| `num_inference_steps` | number | `28` | Number of denoising steps (higher = better quality, slower) |
| `seed` | number | *random* | Random seed for reproducible results |
| `guidance_scale` | number | `3.5` | How closely to follow the prompt (higher = more faithful) |
| `num_images` | number | `1` | Number of images to generate |
| `enable_safety_checker` | boolean | `true` | Set to `false` for NSFW content |
| `enable_base64_output` | boolean | `false` | Return images as base64 instead of URLs |

### Image Editing (Edit Mode)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `prompt` | string | *(required)* | Text description of the desired edit |
| `image` | string | *(required)* | Base64-encoded image or URL of the source image |
| `mask_image` | string | — | Base64-encoded mask or URL (white = edit area, black = preserve) |
| `strength` | number | `0.75` | Edit strength (0.0 = no change, 1.0 = full regeneration) |
| `size` | string | *from source* | Output image dimensions |
| `num_inference_steps` | number | `28` | Number of denoising steps |
| `seed` | number | *random* | Random seed for reproducible results |
| `guidance_scale` | number | `3.5` | How closely to follow the prompt |
| `enable_safety_checker` | boolean | `true` | Set to `false` for NSFW content |

### LoRA Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `lora_url` | string | — | URL to the LoRA weights file |
| `lora_scale` | number | `1.0` | Scale factor for LoRA influence |

---

## Why Flux?

### The Cheapest Image Generation Available

Flux Schnell at **$0.003/image** is the most affordable high-quality image generation on the market. Even Flux Dev at **$0.012/image** undercuts most competitors while delivering superior results.

| Model | Price per Image |
|-------|----------------|
| Flux Schnell | $0.003 |
| Flux Dev | $0.012 |
| Flux Kontext Dev | $0.020 |
| Flux Dev LoRA | $0.032 |

### LoRA Fine-Tuning Support

Flux Dev LoRA and Kontext Dev LoRA support custom fine-tuned models, enabling:

- **Custom character consistency** across multiple generations
- **Brand-specific styling** for commercial applications
- **Specialized domains** like medical imaging, architecture, fashion
- **Personal likeness** generation from trained models
- **Artistic style transfer** from specific artists or movements

### NSFW Generation

Atlas Cloud provides unrestricted access to Flux models with the safety checker disabled:

```bash
flux-image "your prompt" --nsfw
```

Setting `--nsfw` passes `enable_safety_checker: false` to the API, allowing generation of adult content, artistic nudity, and other content that would normally be filtered.

### Speed vs Quality Tradeoff

- **Flux Schnell** — 4 steps, ~1 second, great for rapid prototyping and exploration
- **Flux Dev** — 28 steps, ~5 seconds, production-quality results
- **Flux Dev LoRA** — 28 steps with custom fine-tuning applied

Choose the right model for your use case:

| Use Case | Recommended Model |
|----------|-------------------|
| Rapid prototyping | Flux Schnell |
| Production images | Flux Dev |
| Custom fine-tuned | Flux Dev LoRA |
| Context-aware | Flux Kontext Dev |

---

## Installation

### Prerequisites

- [Bun](https://bun.sh) runtime installed
- An Atlas Cloud API key ([get one here](https://www.atlascloud.ai?ref=JPM683&utm_source=github&utm_campaign=flux-image-skill))

### Setup

```bash
# Clone the repository
git clone https://github.com/thoughtincode/flux-image-skill.git
cd flux-image-skill

# Install dependencies
bun install

# Set up your API key
cp .env.example .env
# Edit .env and add your ATLAS_CLOUD_API_KEY

# Link the CLI globally
bun link
```

### Verify Installation

```bash
flux-image --help
```

---

## Usage

### Basic Text-to-Image

```bash
flux-image "A serene Japanese garden with cherry blossoms"
```

### Ultra-Fast with Schnell

```bash
flux-image "Futuristic robot portrait" --model schnell
```

### High-Quality with Dev

```bash
flux-image "Photorealistic landscape of the Swiss Alps at golden hour" --model dev --steps 35 --guidance 4.0
```

### NSFW Mode

```bash
flux-image "Artistic figure study, Renaissance style" --nsfw
```

### With LoRA

```bash
flux-image "Portrait in custom style" --lora --steps 30
```

### Image Editing with Mask

```bash
flux-image "Replace with a golden retriever" --image ./photo.png --mask ./mask.png --strength 0.8
```

### Multiple Images

```bash
flux-image "Cute robot character" --count 4
```

### Kontext Model

```bash
flux-image "A product on a clean white background" --model kontext
```

### Full Parameter Control

```bash
flux-image "A cyberpunk street scene at night, neon lights reflecting on wet pavement" \
  --model dev \
  --size 1280x720 \
  --steps 35 \
  --guidance 4.5 \
  --seed 42 \
  --count 2 \
  --output ./cyberpunk.png
```

---

## CLI Reference

```
flux-image <prompt> [options]

Arguments:
  prompt                    Text description of the image to generate

Options:
  --model <variant>         Model: dev (default), schnell, lora, kontext, kontext-lora
  --size <WxH>              Image dimensions (default: 1024x1024)
  --steps <n>               Inference steps (default: 28, schnell: 4)
  --guidance <n>            Guidance scale (default: 3.5)
  --count <n>               Number of images to generate (default: 1)
  --seed <n>                Random seed for reproducibility
  --output <path>           Output file path (default: ./output/<timestamp>.png)
  --image <path>            Source image for editing (file path or URL)
  --mask <path>             Mask image for inpainting (file path or URL)
  --strength <n>            Edit strength 0.0-1.0 (default: 0.75)
  --nsfw                    Disable safety checker for NSFW content
  --lora                    Use LoRA model variant (Flux Dev LoRA)
  --help                    Show this help message
```

---

## Agent Skill Integration

This tool is designed to work as an AI agent skill across all major coding agents. Install it with a single command:

```bash
npx skills add flux-image-skill
```

This works with Claude Code, Cursor, OpenAI Codex, GitHub Copilot, Gemini CLI, Windsurf, OpenCode, Kiro, and any agent that supports skill installation.

### Add to your project's CLAUDE.md

```markdown
## Image Generation with Flux

Use the `flux-image` CLI to generate images:
- Basic: `flux-image "your prompt here"`
- Fast: `flux-image "prompt" --model schnell`
- NSFW: `flux-image "prompt" --nsfw`
- LoRA: `flux-image "prompt" --lora`
- Edit: `flux-image "edit instructions" --image ./source.png --mask ./mask.png`
- Models: dev (default), schnell, lora, kontext
```

### How It Works

1. Your AI agent reads the skill instructions
2. When asked to generate images, the agent invokes the `flux-image` CLI
3. The CLI sends requests to Atlas Cloud API
4. Images are downloaded and saved to the `./output` directory
5. The agent can reference the saved images in subsequent interactions

---

## API Details

### Authentication

Set your Atlas Cloud API key in the `.env` file or as an environment variable:

```bash
export ATLAS_CLOUD_API_KEY=your_api_key_here
```

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `https://api.atlascloud.ai/api/v1/model/generateImage` | POST | Submit image generation request |
| `https://api.atlascloud.ai/api/v1/model/result/{request_id}` | GET | Poll for generation result |

### Request Flow

1. **Submit** — POST to `/generateImage` with model ID and parameters
2. **Poll** — GET `/result/{request_id}` until status is `completed` or `failed`
3. **Download** — Retrieve generated image(s) from the response URLs

### Response Format

```json
{
  "request_id": "abc123",
  "status": "completed",
  "output": {
    "images": [
      {
        "url": "https://...",
        "content_type": "image/png"
      }
    ]
  }
}
```

---

## Output

Generated images are saved to the `./output` directory by default. Each file is named with a timestamp and sequence number:

```
output/
  flux-2026-03-12-143022-001.png
  flux-2026-03-12-143022-002.png
  ...
```

Use `--output <path>` to specify a custom output location.

---

## Examples

### Quick Concept Art

```bash
flux-image "Dark fantasy castle on a cliff, stormy sky" --model schnell
```

### Product Mockup

```bash
flux-image "Minimalist perfume bottle on marble surface, soft studio lighting" --model dev --size 1024x1024 --guidance 4.0
```

### Batch Character Exploration

```bash
flux-image "Anime character with blue hair, various expressions" --count 4 --model dev
```

### Inpainting

```bash
flux-image "A cat sitting on the chair" --image ./room.png --mask ./chair-mask.png --strength 0.85
```

### LoRA Custom Style

```bash
flux-image "Portrait of a woman in custom trained style" --lora --steps 30
```

---

## Pricing Comparison

Flux on Atlas Cloud offers the most competitive pricing in the market:

| Provider | Model | Price |
|----------|-------|-------|
| **Atlas Cloud** | **Flux Schnell** | **$0.003/image** |
| **Atlas Cloud** | **Flux Dev** | **$0.012/image** |
| Competitor A | DALL-E 3 | $0.040/image |
| Competitor B | Midjourney | $0.050/image |
| Competitor C | Stable Diffusion | $0.020/image |

Save **70-94%** compared to other providers.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ATLAS_CLOUD_API_KEY not set` | Set your API key in `.env` or environment |
| `Model not found` | Check model variant spelling: dev, schnell, lora, kontext |
| `Request timed out` | Increase poll timeout or try again |
| `Safety checker blocked` | Use `--nsfw` flag to disable safety checker |
| `LoRA weights not found` | Verify LoRA URL is accessible |
| `Rate limited` | Wait a moment and retry |

---

## License

MIT License. See [LICENSE](./LICENSE) for details.

---

## Take This to Production Today

This workflow is optimized for Atlas Cloud. Move from experiment to enterprise-ready scale.

- **Incredibly Affordable**: Flux Dev at only from $0.012/image, Schnell at from $0.003/image
- **NSFW Support**: Disable safety checker for unrestricted generation
- **LoRA Support**: Custom fine-tuned models via Flux Dev LoRA
- **Enterprise Security**: SOC I & II Certified | HIPAA Compliant

[Start Building on Atlas Cloud](https://www.atlascloud.ai?ref=JPM683&utm_source=github&utm_campaign=flux-image-skill)
