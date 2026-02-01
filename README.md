<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1UgOpiRKpHSlMnHZcPfXKz-8SAo38dHZJ

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set up Convex:
   - Run `npx convex dev` to create a new project and generate types.
3. Set up Clerk:
   - Create a Clerk project and add `VITE_CLERK_PUBLISHABLE_KEY` to your `.env.local`.
4. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key.
5. Run the app:
   `npm run dev`
