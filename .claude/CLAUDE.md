See @README for the overall vision of this project and @package.json for available npm commands.

# IMPORTANT

For now, ignore the web app. The mobile app is the primary focus. We should still put functionality that can be used by both projects in the shared folder but when adding features to the mobile app, don't bother making changes to the web to keep parity with mobile.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## Project Structure

This repository is a Yarn workspaces monorepo containing a React web application and a React Native mobile application (that can run on both iOS and Android). The project uses React Native for Web to write components that work on both web and mobile. TypeScript is used across the repository.

The web app uses Vite + SWC. The web app dev server runs at http://127.0.0.1:3000/.

The mobile app uses Expo Go.

There is a Neon serverless database storing journal entries for shared persistence between the web and mobile apps.

## Folder Layout

- `mobile`
    - `package.json`
    - `metro.config.js`
    - `app.config.js`
    - `index.js`
    - `.env`
    - `src` (mobile app specific code)
- `web`
    - `package.json`
    - `metro.config.js`
    - `vite.config.ts`
    - `index.html`
    - `.env`
    - `src` (web app specific code)
- `shared`
    - `package.json`
    - `tsconfig.json`
    - `src` (put all shared components, hooks, utils, DB code, and other shared logic here)

## Database Schema

There is currently 1 table:

journal_entries

It has 4 columns:

- id (serial)
- entry_key (varchar(20))
- content (text)
- created_at (timestamp with time zone)

## Code Guidelines

- Use React Native primitives (View, Text, TextInput, etc.) in both mobile and web (enabled via React Native for Web) instead of HTML elements for mobile compatibility.
- Create React custom hooks liberally. Keep the main components lean. Abstract shared functionality to custom hooks. Move complex React functionality to custom hooks as well.
- Add other generalized logic that doesn't have to do with React functionality to util functions.
- Components, hooks, utils, and other logic that is shared between the web and mobile apps should go in the `shared` folder.

## Avoid

- Don't set up a backend yet; we are using a serverless database for now with the connection string in .env files
- Don't use CSS files; use StyleSheet API only
- We won't add authentication until multi-user support is needed
