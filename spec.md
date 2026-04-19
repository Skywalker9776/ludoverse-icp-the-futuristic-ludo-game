# Specification

## Summary
**Goal:** Fix automatic Internet Identity login flow to restore authenticated sessions without user interaction.

**Planned changes:**
- Update useInternetIdentity.ts to automatically check and restore valid delegations on initialization
- Remove manual login prompts in App.tsx when valid delegation exists
- Fix delegation validation logic to properly verify expiry and chain validation
- Implement automatic delegation refresh timer to renew before expiry
- Add error handling for automatic login failures with manual fallback
- Update Header.tsx to hide login button when user is automatically authenticated

**User-visible outcome:** Users with valid Internet Identity delegations will be automatically logged in when they open the app, without needing to click a login button. The app will maintain seamless authenticated sessions by automatically refreshing delegations before they expire.
