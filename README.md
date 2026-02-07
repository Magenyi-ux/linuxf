

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
