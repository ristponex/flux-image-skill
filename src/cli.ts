#!/usr/bin/env bun

import { parseArgs } from "util";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join, resolve, extname } from "path";

// Load environment variables
const envPath = join(import.meta.dir, "..", ".env");
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        process.env[key] = value;
      }
    }
  }
}

const API_KEY = process.env.ATLAS_CLOUD_API_KEY;
const API_BASE = "https://api.atlascloud.ai/api/v1/model";
const GENERATE_URL = `${API_BASE}/generateImage`;
const RESULT_URL = `${API_BASE}/result`;

// Model variant mapping
const MODEL_MAP: Record<string, string> = {
  dev: "black-forest-labs/flux-dev",
  schnell: "black-forest-labs/flux-schnell",
  lora: "black-forest-labs/flux-dev-lora",
  kontext: "black-forest-labs/flux-kontext-dev",
  "kontext-lora": "black-forest-labs/flux-kontext-dev-lora",
};

// Default steps per model
const DEFAULT_STEPS: Record<string, number> = {
  dev: 28,
  schnell: 4,
  lora: 28,
  kontext: 28,
  "kontext-lora": 28,
};

// Help text
function showHelp(): void {
  console.log(`
flux-image - Generate images using Flux (Black Forest Labs) models

Usage:
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

Examples:
  flux-image "A serene Japanese garden"
  flux-image "Robot portrait" --model schnell
  flux-image "Artistic figure" --nsfw
  flux-image "Custom style" --lora --steps 30
  flux-image "Replace object" --image ./photo.png --mask ./mask.png
  `);
}

// Parse command line arguments
function parseArguments() {
  const { values, positionals } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      model: { type: "string", default: "dev" },
      size: { type: "string", default: "1024x1024" },
      steps: { type: "string" },
      guidance: { type: "string", default: "3.5" },
      count: { type: "string", default: "1" },
      seed: { type: "string" },
      output: { type: "string" },
      image: { type: "string" },
      mask: { type: "string" },
      strength: { type: "string", default: "0.75" },
      nsfw: { type: "boolean", default: false },
      lora: { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
    allowPositionals: true,
  });

  return { values, positionals };
}

// Convert a local file to base64 data URI
function fileToBase64(filePath: string): string {
  const absPath = resolve(filePath);
  if (!existsSync(absPath)) {
    throw new Error(`File not found: ${absPath}`);
  }
  const buffer = readFileSync(absPath);
  const base64 = buffer.toString("base64");
  const ext = extname(absPath).toLowerCase().replace(".", "");
  const mimeType = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
  return `data:${mimeType};base64,${base64}`;
}

// Resolve image input — could be URL or file path
function resolveImageInput(input: string): string {
  if (input.startsWith("http://") || input.startsWith("https://") || input.startsWith("data:")) {
    return input;
  }
  return fileToBase64(input);
}

// Determine the model variant
function resolveModelVariant(model: string, useLora: boolean): string {
  // If --lora flag is set, override to lora variant
  if (useLora) {
    if (model === "kontext") {
      return "kontext-lora";
    }
    return "lora";
  }
  return model;
}

// Resolve the full model ID
function resolveModelId(variant: string): string {
  const modelId = MODEL_MAP[variant];
  if (!modelId) {
    throw new Error(
      `Unknown model variant: ${variant}. Available: ${Object.keys(MODEL_MAP).join(", ")}`
    );
  }
  return modelId;
}

// Determine if this is an edit request
function isEditMode(options: Record<string, any>): boolean {
  return !!options.image;
}

// Build the request payload
function buildPayload(prompt: string, options: Record<string, any>): Record<string, any> {
  const variant = options.variant;
  const steps = options.steps ? parseInt(options.steps) : DEFAULT_STEPS[variant] || 28;

  const payload: Record<string, any> = {
    prompt,
    image_size: options.size,
    num_inference_steps: steps,
    guidance_scale: parseFloat(options.guidance),
  };

  // Number of images
  const count = parseInt(options.count);
  if (count > 1) {
    payload.num_images = count;
  }

  // Seed
  if (options.seed) {
    payload.seed = parseInt(options.seed);
  }

  // NSFW mode — disable safety checker
  if (options.nsfw) {
    payload.enable_safety_checker = false;
  }

  // Edit mode parameters
  if (options.image) {
    payload.image = resolveImageInput(options.image);
    payload.strength = parseFloat(options.strength);

    if (options.mask) {
      payload.mask_image = resolveImageInput(options.mask);
    }
  }

  return payload;
}

// Submit generation request to Atlas Cloud API
async function submitRequest(modelId: string, payload: Record<string, any>): Promise<string> {
  console.log(`Submitting request to model: ${modelId}`);

  const response = await fetch(GENERATE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model_id: modelId,
      input: payload,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as { request_id: string };
  console.log(`Request submitted. ID: ${data.request_id}`);
  return data.request_id;
}

// Poll for result until completion
async function pollResult(requestId: string, maxAttempts = 120, intervalMs = 2000): Promise<any> {
  console.log("Waiting for generation to complete...");

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await fetch(`${RESULT_URL}/${requestId}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Poll request failed (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as { status: string; output?: any; error?: string };

    if (data.status === "completed") {
      console.log("\nGeneration completed!");
      return data.output;
    }

    if (data.status === "failed") {
      throw new Error(`Generation failed: ${data.error || "Unknown error"}`);
    }

    // Show progress indicator
    process.stdout.write(`\rPolling... attempt ${attempt}/${maxAttempts}`);
    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error("Generation timed out after maximum polling attempts");
}

// Download an image from URL and save to disk
async function downloadImage(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }
  const buffer = await response.arrayBuffer();
  writeFileSync(outputPath, Buffer.from(buffer));
}

// Generate output file path
function getOutputPath(basePath: string | undefined, index: number): string {
  if (basePath && index === 0) {
    return resolve(basePath);
  }

  const outputDir = resolve("./output");
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[T]/g, "-")
    .replace(/[:.]/g, "")
    .slice(0, 19)
    .replace(/-/g, "");
  const formattedTs = `${timestamp.slice(0, 4)}-${timestamp.slice(4, 6)}-${timestamp.slice(6, 8)}-${timestamp.slice(8, 14)}`;
  const paddedIndex = String(index + 1).padStart(3, "0");

  return join(outputDir, `flux-${formattedTs}-${paddedIndex}.png`);
}

// Main execution
async function main() {
  const { values, positionals } = parseArguments();

  if (values.help || positionals.length === 0) {
    showHelp();
    process.exit(0);
  }

  if (!API_KEY) {
    console.error("Error: ATLAS_CLOUD_API_KEY is not set.");
    console.error("Set it in .env file or as an environment variable.");
    process.exit(1);
  }

  const prompt = positionals.join(" ");
  const variant = resolveModelVariant(values.model as string, values.lora as boolean);
  const modelId = resolveModelId(variant);
  const editMode = isEditMode(values);
  const defaultSteps = DEFAULT_STEPS[variant] || 28;
  const steps = values.steps || String(defaultSteps);

  console.log(`\nFlux Image Generator`);
  console.log(`====================`);
  console.log(`Prompt: ${prompt}`);
  console.log(`Model: ${variant} (${modelId})`);
  console.log(`Mode: ${editMode ? "edit" : "generate"}`);
  console.log(`Size: ${values.size}`);
  console.log(`Steps: ${steps}`);
  console.log(`Guidance: ${values.guidance}`);
  if (values.nsfw) console.log(`NSFW: enabled (safety checker disabled)`);
  if (values.lora) console.log(`LoRA: enabled`);
  if (parseInt(values.count as string) > 1) console.log(`Count: ${values.count}`);
  console.log();

  try {
    // Build payload
    const payload = buildPayload(prompt, {
      variant,
      size: values.size,
      steps: values.steps || undefined,
      guidance: values.guidance,
      count: values.count,
      seed: values.seed,
      nsfw: values.nsfw,
      image: values.image,
      mask: values.mask,
      strength: values.strength,
    });

    // Submit request
    const requestId = await submitRequest(modelId, payload);

    // Poll for result
    const output = await pollResult(requestId);

    // Download and save images
    const images = output?.images || [];
    if (images.length === 0) {
      console.error("No images returned from the API.");
      process.exit(1);
    }

    console.log(`\nDownloading ${images.length} image(s)...`);

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const outputPath = getOutputPath(values.output as string | undefined, i);
      await downloadImage(img.url, outputPath);
      console.log(`Saved: ${outputPath}`);
    }

    console.log(`\nDone! Generated ${images.length} image(s).`);
  } catch (error) {
    console.error(`\nError: ${(error as Error).message}`);
    process.exit(1);
  }
}

main();
