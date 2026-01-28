See @README for the overall vision of this project and @package.json for available npm commands.

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