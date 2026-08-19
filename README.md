# Nexus Stabilization

NEXUS / PRISM — COMPLETE APPLICATION DEBUG + STABILIZATION

Repository: https://github.com/PixelAcE45/prism-ai-assistant

Perform a complete diagnostic and stabilization pass on the EXISTING application.

This is NOT a redesign and NOT a feature-building task.

The application currently has multiple possible issues across UI performance, authentication, AI integration, state management, database behavior, and previous implementations.

Your job is to inspect the existing codebase first, identify problems, then repair them systematically.

1. FULL CODEBASE AUDIT

Inspect the entire existing project before making major changes.

Review:

frontend components

routes

state management

authentication

Supabase integration

database queries

RLS/security policies

AI integration

API/server functions

conversation handling

task/action system

loading states

error handling

theme system

animations

responsive behavior

settings

dependencies

environment/secrets handling

Do NOT blindly rewrite working systems.

Reuse the existing architecture wherever possible.

2. UI PERFORMANCE

The UI currently feels noticeably choppy.

Find the causes rather than simply reducing animation quality.

Inspect for:

unnecessary re-renders

excessive state updates

expensive effects

duplicated components

unnecessary network requests

poorly optimized animations

layout-triggering animations

excessive blur/shadow computation

unnecessary JavaScript animation loops

components rendering when their data has not changed

Optimize for smooth interaction and stable frame pacing.

Prefer GPU-friendly animation properties such as:

transform

opacity

Avoid unnecessary animation of:

width

height

top

left

margin

padding

Do NOT remove the existing premium animations.

Make them smoother and more efficient.

3. EXISTING UI INTEGRITY

Preserve the current Nexus design.

Do NOT redesign:

layout

branding

navigation

typography

glassmorphism

light/dark themes

existing visual identity

Only repair visual bugs, broken states, layout issues, responsiveness problems, or performance problems.

The existing UI should remain recognizable.

4. AUTHENTICATION AUDIT

Completely test and repair authentication.

Verify:

sign up

login

logout

session persistence

refresh while logged in

refresh while logged out

protected routes

redirects

authentication errors

user identity propagation

Supabase session handling

profile/user initialization

Test both successful and failed authentication flows.

Do not create duplicate authentication systems.

Use the existing Supabase authentication architecture unless it is fundamentally broken.

5. USER DATA ISOLATION

Audit all user-specific database access.

Verify that authenticated users can only access their own:

profile

conversations

messages

tasks

memories

workspace data

Inspect and repair RLS policies where necessary.

Never solve a permissions problem by weakening security.

6. NEXUS AI

Audit the existing AI integration.

Verify the complete flow:

USER → authenticated session → AI request → secure backend/API layer → OpenRouter → response → Nexus UI

Check:

API request handling

authentication context

error handling

loading state

response parsing

failed requests

empty responses

timeout behavior

duplicate requests

conversation context

Do NOT replace the existing AI provider.

Do NOT create a second AI integration.

7. AI RESPONSE EXPERIENCE

Verify that the existing AI response UX works correctly.

The intended behavior is:

User sends message → subtle thinking state → minimum ~3 second thinking experience when appropriate → smooth response transition → progressive response appearance → properly formatted response

Responses should NOT suddenly appear as one giant block of text.

Preserve the existing response formatting improvements.

Fix any jerky transitions or layout jumps.

8. AI ACTION SYSTEM

Audit the existing AI action/tool system.

Verify:

create_task

list_tasks

update_task

delete_task

Each action must:

Receive valid arguments.

Execute securely for the authenticated user.

Return a reliable success/failure result.

Update the UI correctly.

Never claim success if the backend operation failed.

Do not create duplicate task systems.

9. PROGRESS SUMMARIZATION

Verify the existing Nexus progress-summary capability.

When the user asks:

"Catch me up."

"What is my progress?"

"What am I currently working on?"

Nexus should retrieve available user-owned information and summarize it.

It must NOT invent data.

If information is unavailable, say so naturally.

10. STATE MANAGEMENT

Look for state synchronization problems between:

authentication

AI chat

conversations

tasks

settings

database state

UI state

Fix stale state, race conditions, duplicate requests, and inconsistent UI updates.

When backend data changes through Nexus AI, the relevant UI should update without unnecessary full-page reloads.

11. ERROR HANDLING

Replace silent failures with useful user-facing states.

Handle:

authentication failure

AI failure

network failure

database failure

unauthorized access

malformed AI responses

tool execution failure

missing configuration

Errors should be understandable without exposing technical secrets.

12. LOADING STATES

Audit all important loading states.

Avoid:

frozen-looking UI

sudden content jumps

duplicate loading indicators

infinite loading states

buttons appearing unresponsive

Use smooth transitions while preserving performance.

13. RESPONSIVE BEHAVIOR

Audit desktop, tablet and mobile layouts.

IMPORTANT:

Do not revive or recreate the previously faulty mobile implementation.

Preserve the current intended responsive architecture.

Fix only genuine responsive bugs.

Make sure the UI does not unexpectedly shrink, overlap, or render desktop content incorrectly on smaller screens.

14. SETTINGS

Verify existing settings functionality without redesigning the Settings page.

Check that existing preferences actually persist and are applied correctly.

Do not add unrelated settings.

15. SECURITY + SECRETS

Perform a security audit of secret handling.

IMPORTANT:

Never place API keys or private credentials in:

frontend source

README files

public repository files

client-side environment variables

database records accessible to users

Use the project's secure Secrets/environment mechanism.

If an exposed credential is found in the repository, DO NOT print it in logs or responses.

Flag it as compromised and remove the unsafe reference from the application.

Do not expose secrets while debugging.

16. DEPENDENCIES + BUILD

Check for:

broken imports

unused dependencies

dependency conflicts

TypeScript errors

lint errors

build errors

runtime console errors

failed Supabase functions

invalid environment references

Fix real errors that affect the application.

Do not perform unnecessary dependency upgrades.

17. PERFORMANCE VERIFICATION

After fixes, verify that:

navigation is smooth

tabs switch smoothly

AI responses don't cause UI freezes

scrolling remains smooth

glass effects remain performant

unnecessary renders are reduced

network requests are not duplicated

Do not sacrifice the visual quality of the UI just to improve performance.

18. DO NOT ADD NEW FEATURES

During this pass, DO NOT implement:

Gmail

Google Calendar

Google Drive

Firecrawl

Slack

Telegram

Notion

new AI agents

new connectors

new automation systems

Those come AFTER the existing application is stable.

19. WORK ORDER

Follow this order:

Inspect

Identify failures

Fix authentication/security foundation

Fix database/RLS issues

Fix AI request flow

Fix AI actions

Fix state synchronization

Fix UI performance

Fix loading/error states

Fix responsive issues

Verify build/runtime errors

Perform final regression testing

Do not repeatedly rebuild the same component.

20. FINAL REGRESSION TEST

Before considering the task complete, verify this complete flow:

SIGN UP → LOGIN → SESSION PERSISTS → OPEN NEXUS → SEND AI MESSAGE → RECEIVE AI RESPONSE → RESPONSE ANIMATES CORRECTLY → CREATE TASK THROUGH AI → TASK APPEARS IN UI → REFRESH → DATA PERSISTS → REQUEST PROGRESS SUMMARY → LOGOUT → LOGIN AGAIN → USER DATA REMAINS AVAILABLE → OTHER USERS CANNOT ACCESS IT

Also verify:

no major console errors

no broken routes

no authentication loops

no obvious UI jank

no duplicate AI requests

no exposed secrets

no major TypeScript/build errors

IMPORTANT:

Do NOT redesign the application.

Do NOT add new features.

Do NOT replace working architecture unnecessarily.

This is a COMPLETE DEBUGGING + STABILIZATION PASS.

The goal is to leave the existing Nexus application stable, secure, performant and internally consistent so that new connectors and features can safely be added afterward.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9a59d87a-f05b-497f-9891-81a78edc3f1f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
