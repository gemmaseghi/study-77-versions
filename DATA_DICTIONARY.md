# Added fields and analysis recipes

## Version identity (all rows)

`experiment_version`: string 1–6; `final_task`: summary/examples;
`awareness_slider_enabled`, `test_explanation_required`, `preview_mode`:
booleans; `collection_mode`: prolific/directLink/debug;
`code_revision`: deployed Git SHA or local release label;
`logging_schema`: 2; `session_key`: unique per page visit;
`event_sequence`: increasing row order within the session.

Retain the server's participant/submission identifier when merging exports.
The session key distinguishes separate visits and is not a stable person ID.

## Phase timing rows

Select `row_type = phase_timing`.

- `phase`: activity below.
- `component`, `trial_id`, `round_number`: context (null when not a main trial).
- `test_attempt`: attempt number for test phases; otherwise null.
- `phase_started_at_ms`, `phase_ended_at_ms`: wall-clock timestamps.
- `duration_ms`: elapsed monotonic time for this interval.
- `visible_duration_ms`: part of that interval while the tab was visible.

| Phase | Interpretation |
|---|---|
| instructor_choice | Initial instructor/task announcement screen |
| instructions_N | Instructor instruction page, zero-based index |
| pregame_instructions_N | Main-game instruction page |
| practice_N_loading / choice / feedback | Practice image loading, choosing, and feedback reading |
| maze_loading | Initial main-maze image loading |
| main_path | Main-path interface only; pauses for help/test screens |
| instructions_help | Rereading the rules |
| test_path | Constructing/editing a test path |
| test_explanation | Writing the pre-evaluation test explanation |
| test_result | Reviewing the tested path's score |
| opponent_loading | Waiting for the opponent image |
| opponent_review | Opponent path and score display, after the image load event |
| awareness_slider | Slider display to submission; excludes opponent review |
| final_example_N_path | Selecting/revising final example N |
| final_example_N_explanation | Writing its explanation |
| questionnaire_1 | Rules summary (summary variants only) |
| questionnaire_2 / 3 | Peculiar yes/no / yes-only explanation |
| questionnaire_4 / 5 | Suspicion yes/no / corresponding explanation |

Phases can have multiple intervals when revisited. Sum intervals for the desired
participant/trial/phase. Do not average individual intervals as if they were
separate participants. Opponent review is time on the display, not direct evidence
of the amount of cognitive analysis performed.

**Path completion including help:** `path_elapsed_including_help_ms` on the
`row_type = path` row, from initial maze availability to confirming the final path.
**Path interface only:** sum `main_path` timing rows. Those two measures answer
different questions; a trial with help can have a much longer inclusive duration.
Snapshot generation is excluded from the main-path interval after confirmation.

## Confidence rows

The existing `row_type = confidence` rows remain, one per trial.
`confidence_presented` indicates whether a slider was shown. In no-slider versions,
`confidence`, `confidence_initial` and `confidence_rt_ms` are null, not zero.
`confidence_rt_ms` measures slider DOM-update onset to the submit handler.
`confidence_first_input_rt_ms` is onset to first adjustment (null if unchanged).
`confidence_touched` distinguishes an unchanged response from an adjusted one.
The `awareness_slider` phase row also provides visible-tab duration.

## Reset and selection events

`row_type = event`, `event = path_reset`:

- `mode`: main, test, or final_example.
- `path_before_reset`, `colours_before_reset`: JSON arrays of the removed path.
- `empty_path`: whether there was nothing selected.
- `test_attempt`: test attempt identifier when applicable.
- `reset_main_count`, `reset_test_count`: running trial counts on main/test events.
- `timestamp_ms`, `session_elapsed_ms`: wall and monotonic event time.

Main path response rows also contain `reset_main_count` and `reset_test_count`.
The test count includes cancelled attempts. It is not limited to evaluated tests.
To count resets that removed selections, filter `empty_path = false`.
Automatic clearing after test feedback generates no reset event.

`cell_selected` logs each valid selected cell, colour, mode and timestamp;
`visibility_change` records tab visibility changes. Invalid clicks are not steps.
Main paths preserve the original help behavior: entering a test starts with the
current selection, cancelling retains that selection, and closing a scored test
clears it for final selection.

## Help rows

Existing `row_type = help_event` records remain, including instructions_opened,
instructions_closed, score_test_started, score_test_cancelled, score_checked,
and score_result_closed. `test_attempt` numbers distinguish repeated attempts in
a trial. `score_checked` is the evaluated-help event: count it when analysing help
usage/cost; do not count merely opening/cancelling the test interface as paid help.

`score_checked.test_explanation` contains the required reason in versions 5/6 and
an empty string otherwise. Tested path colours, points and costs remain available.
Returning from the explanation screen to path selection logs the draft and clears
it; cancelling records the draft and path at cancellation without charging points.

## Final examples and questionnaire

`trial_type = final_example`, `row_type = example_response`:
`example_id`, `selected_path`, `selected_colours`, `min_cells`,
`selected_path_score`, `explanation`, `score_feedback_shown` (false).
Coordinates are zero-based [row, column]. Scores are recorded for analysis only.

`trial_type = questionnaire` retains `strategy_explanation` for the rule-summary
text; it is empty for example variants. Peculiar and suspicion fields are unchanged.
Explanations preserve newlines; use a CSV parser supporting quoted multiline text.

## Important distinction

Magpie's auto-generated `responseTime` is still cumulative from screen activation.
It is not the duration of an individual help event, opponent review, or slider
response. Use the fields above. Events are accumulated locally and submitted at
completion; they are not streamed to the server by this instrumentation.
