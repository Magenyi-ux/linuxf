# Examply Private Video Generator — NVIDIA NIM deployment

This feature intentionally uses NVIDIA NIM only. Do not point it at a third-party video provider.

## Current status

The Vercel Preview API route expects an OpenAI-compatible NVIDIA NIM Video Generation API at `NVIDIA_VIDEO_API_URL`. WAN 2.2's documented route is `POST /v1/videos/generations`, with model `wan-ai/wan2.2`.

NVIDIA's current model catalogue lists WAN 2.2 as a downloadable NIM container rather than a hosted API endpoint. An ordinary NVIDIA API Catalog key for chat does not by itself create a hosted WAN 2.2 endpoint. A GPU host running the WAN 2.2 NIM container is therefore required unless NVIDIA enables a hosted WAN 2.2 endpoint for this account.

## Required GPU service

Provision a GPU VM/service that supports NVIDIA NIM Visual Generative AI and the WAN 2.2 container. The host must satisfy the current NVIDIA NIM support matrix and model licensing prerequisites. Do not attempt to run this model on Vercel Functions or a low-memory CPU instance.

Container image documented by NVIDIA:
`nvcr.io/nim/wan-ai/wan2.2:1.0.0`

For text-to-video set:
`NIM_MODEL_VARIANT=t2v`

For image-to-video set:
`NIM_MODEL_VARIANT=i2v`

NVIDIA's documented OpenAI-compatible endpoint:
`POST http://<nim-host>:8000/v1/videos/generations`

WAN 2.2 requires shared memory configured to 16 GB for sustained requests. Follow the latest NVIDIA container startup guide and hardware/support matrix before deploying. Use TLS and restrict ingress; do not expose an unauthenticated NIM endpoint to the public internet.

## Vercel Preview variables

Set these only after the GPU service is running and protected:

- `NVIDIA_VIDEO_API_URL`: the HTTPS URL of the protected NIM endpoint, ending in `/v1/videos/generations`.
- `NVIDIA_VIDEO_API_KEY`: a dedicated gateway/service credential accepted by that endpoint. The current Vercel handler sends it as a Bearer token. If the NIM host itself does not implement Bearer authentication, put an authenticated HTTPS gateway in front of it; do not leave the endpoint public.
- `NVIDIA_VIDEO_MODEL`: `wan-ai/wan2.2` (optional; this is already the default).
- `VIDEO_GENERATOR_TOKEN`: existing private studio token, Preview scope only.

Keep the NVIDIA/NGC container-pull credential and Hugging Face credential (if required by the current model setup) on the GPU host only. Do not put either in browser variables or Git.

## Verification

1. Check the protected host's health/readiness endpoint according to the NIM version's docs.
2. From a secure server-side test, POST a four-second 832x480 prompt to `/v1/videos/generations` using model `wan-ai/wan2.2`.
3. Confirm the response includes `data[0].b64_json` as documented.
4. Add the service URL and dedicated gateway credential to Vercel Preview only, redeploy Preview, and test through `/private-video`.
5. Do not add Production environment variables or merge the feature PR until the user explicitly approves a production release.

## References

- NVIDIA OpenAI-compatible Video Generation API: https://docs.nvidia.com/nim/visual-genai/latest/api/openai-video-generation.html
- NVIDIA NIM Visual GenAI Getting Started and hardware prerequisites: https://docs.nvidia.com/nim/visual-genai/latest/getting-started.html
- NVIDIA NGC WAN 2.2 container: https://catalog.ngc.nvidia.com/orgs/nim/wan-ai/containers/wan2.2
