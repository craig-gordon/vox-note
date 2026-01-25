See @README for the overall vision of this project and @package.json for available npm commands.

This project uses Vite + React Native for Web + TypeScript + SWC. I am developing solely for web right now to maximize initial speed of iteration but when MVP functionality is in place I will stand up a mobile app in this repository.

## Project Structure

- `src/components/` - React components
- `src/hooks/` - Custom hooks
- `src/types/` - TypeScript type definitions
- `src/utils/` - Helper functions

## Current State

- Basic Vite + RNW scaffolding is set up
- Dev server runs at http://127.0.0.1:3000/
- No routing, storage, or real features yet

## Next Up

- LocalStorage persistence for journal entries
- Basic list view of entries

## Technical Decisions

- Use React Native primitives (View, Text, TextInput, etc.) instead of HTML elements for future mobile compatibility
- Store data in localStorage for now; will migrate to a backend later
- No authentication until multi-user support is needed

## Code Guidelines

- Create React custom hooks liberally. Keep the main components lean. Abstract shared functionality to custom hooks. Move complex React functionality to custom hooks as well.
- Add other generalized logic that doesn't have to do with React functionality to util functions.

## Avoid

- Don't set up a backend yet
- Don't use CSS files; use StyleSheet API only