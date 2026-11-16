# Maze experiment — six pilot versions

This project is based on the supplied study-77 ZIP. It keeps the existing 16 mazes,
practice trials, scoring, opponent paths and server configuration. All six versions
share the same code. A URL parameter selects a fixed version for that visit.

## Versions and links

| Version | Final task before the remaining questionnaire | Awareness slider | Explain every tested path before scoring |
|---|---|---|---|
| 1 | Bullet-point rules summary | Yes | No |
| 2 | Choose and explain two example paths | Yes | No |
| 3 | Bullet-point rules summary | No | No |
| 4 | Choose and explain two example paths | No | No |
| 5 | Bullet-point rules summary | Yes | Yes |
| 6 | Choose and explain two example paths | Yes | Yes |

Versions 5 and 6 retain the slider. Six versions do not constitute the full eight
combinations of three binary factors: explanation + no slider is not included.

After publication, open `versions.html` under your site's address. It lists
preview links and participant links for every version. Send friends a participant
link for the assigned version, rather than the comparison page.

For example, if the site is `https://YOUR-USERNAME.github.io/maze-pilot-variants/`:

- Preview version 1: `https://YOUR-USERNAME.github.io/maze-pilot-variants/?version=1&preview=1`
- Participant version 1: `https://YOUR-USERNAME.github.io/maze-pilot-variants/?version=1&mode=directLink`
- Replace `version=1` with `version=2`, through `version=6`, for the other versions.
- Comparison page: `https://YOUR-USERNAME.github.io/maze-pilot-variants/versions.html`

These are address patterns, not published links. No GitHub repository or deployment
has been created by preparing this ZIP.

`preview=1` uses Magpie debug mode and disables its socket URL. At the end it shows
debug results instead of submitting. `mode=directLink` submits without Prolific
recruitment or a Prolific completion redirect. A bare/original link retains
Prolific mode and defaults to version 1; a Prolific link can include `version=N`
plus the usual Prolific parameters. Unknown version IDs fail rather than silently
assigning another version. Assignment is explicit, not random.

## Publish while preserving the existing study

Recommended: create **one new repository**, such as `maze-pilot-variants`, for
this pilot. The existing `study-77` deployment can remain as it is. Six separate
repositories would require copying every scoring/logging fix six times.

1. Create/clone the new repository on your computer, using GitHub Desktop or Git.
2. Extract this ZIP. Copy the **contents of its project folder** into the repository
   root. Include the hidden `.github` folder. Do not upload the ZIP itself as the
   experiment, and do not nest the project inside another folder.
3. Commit and push the files to `main` (or `master`). Do not commit `node_modules`.
4. In the GitHub repository, open **Settings → Pages → Build and deployment →
   Source**, and select **GitHub Actions**.
5. Open **Actions → Build and deploy experiment**. If the first run failed before
   Pages was enabled, select **Run workflow** after step 4. Wait for a successful
   build and deployment.
6. Open the published address shown under Pages or in the workflow deployment.
   Append `versions.html` to open the comparison page.
7. Complete a preview first. Then complete one labelled pilot submission using a
   participant link and check the server export before sending links to friends.

The workflow builds `src` and `public` into `dist`, then publishes `dist` to Pages.
It derives the asset base path from GitHub Pages, so renaming the new repository
does not require changing image paths. The code lives on `main`; the six versions
are settings in `src/variants.js`, not branches. Version-specific participant URLs
remain distinct even though they use the same compiled application.

The `docs` folder is a rebuilt static snapshot for the original `/study-77/` path.
The supplied Actions workflow does **not** publish `docs`. Do not select the old
branch/docs publishing method for a newly named repository: use Actions above.

Official deployment reference:
https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## Server and data collection

The existing configuration remains:

- Server: `https://magpie-cogsciprag.fly.dev`
- Experiment ID: **76** (this is independent of the repository name `study-77`).
- Existing Prolific completion code retained for Prolific mode.

All variants send to the same experiment ID. Separate them using
`experiment_version` in the export. A different repository does not create a
separate server experiment. Hosting the web page and storing responses are two
different services. The server must accept the new site's origin; check a real
pilot submission after deployment. No live submission was made during validation.

Every recorded row includes version, final task, slider flag, test-explanation
flag, mode, logging schema, a session key, and code revision (Git commit SHA in
an Actions build). Event rows are logged in memory as they happen and submitted
by Magpie at the end. This does not add recovery of abandoned/refreshed sessions.

## Final examples

The two grids are recreated directly from the supplied pictures, with selectable
orthogonal paths, no revisits, green start and yellow finish. Participants choose
any valid path, then explain why they consider it optimal for future players.
They can return to revise a path; changing it clears the explanation to avoid
attaching an old explanation to a different path. No correct answer or score
feedback is shown, and these examples do not affect the game score.

The initial instruction announcement describes the assigned final task. The
practice examples remain unchanged. The remaining peculiar-event and suspicion
questions are retained in all versions. Only the rules-summary question is
replaced in versions 2, 4 and 6.

Counting conventions:

| Example | Intermediate cells on shortest path | Moves | Total cells including green/yellow | Maximum score | Number of optimal paths |
|---|---:|---:|---:|---:|---:|
| Left / 1 | 4 | 5 | 6 | +2 | 3 |
| Right / 2 | 2 | 3 | 4 | +2 | 2 |

The existing scorer uses **total cells**, so `min_cells` is 6 and 4. All legal
non-revisiting paths were enumerated to verify the maxima. In the second example,
optimal paths take a detour to collect both orange cells while avoiding purple.
The correct values are stored for analysis but are not shown to participants.

## Logs and timing

See `DATA_DICTIONARY.md` for analysis fields and definitions. Use the explicit
phase durations instead of Magpie's generic `responseTime`, which remains
cumulative from screen start.

The timing clock is `performance.now()`; wall timestamps are also stored for
ordering. Phase onset is recorded after Vue's DOM update, with image loading
separated for main mazes, opponent paths, and practice choices. This is browser
software timing, not a calibrated physical screen-onset measurement. Visible-tab
time is recorded separately; a visible tab does not prove the person is attending.

All Reset button presses are logged, including presses on an empty path. Automatic
clearing after a scored test is not a reset. Main, test, and final-example modes
are separate. A cancelled test does not consume a token or cost a point. In
versions 5/6 the explanation is required before the score is revealed; returning
to edit the path clears the explanation. Free-text line breaks are preserved.
If importing CSV into Excel, use its CSV importer with quoted multiline fields;
do not split response text manually at line breaks or tabs.

## Local development and checks

Use Node 20 and npm 7 or later (the workflow selects Node 20).

```sh
npm ci
npm run serve
```

Open the local address printed by Vue, with `?version=1&preview=1`, or open
`/versions.html`. Always use preview mode for local development.

```sh
node scripts/check-components.cjs
npm run build
```

For a manual production build for another path, set `VUE_APP_BASE_PATH` to that
path including leading/trailing slashes (for example `/maze-pilot-variants/`).
The default manual production build path is `/study-77/`.

Validation performed: production compilation; component integration checks for
all six versions across all 16 trials; both final task types; yes/no questionnaire
branches; slider presence/absence; free and cancelled help; main/test resets;
phase timing and version metadata; exhaustive scoring of both final grids.
Component checks mock canvas/images and do not test pixel layout or the server.
Automated browser execution was blocked by the workspace's browser restrictions.

Before collecting pilot responses, check each version in a real browser:

- Correct final-task announcement and slider instructions.
- All images load and selected cell dots align with the grid.
- A main reset and test reset appear as separate exported events.
- First and subsequent help uses have the correct free/paid cost.
- Versions 5/6 block scoring until a nonempty explanation is submitted.
- Versions 3/4 go directly from opponent review to the next trial/final task.
- Both final example grids accept multiple valid paths and save explanations.
- Preview does not submit; participant mode completes a real server submission.
- The exported version, path, phase timing, and text fields appear correctly.

No live repository, server data, or published experiment was modified.
