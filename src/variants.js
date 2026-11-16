// One immutable configuration per visit. Unknown version IDs fail closed.
export const variants = [
  { id: '1', finalTask: 'summary', slider: true, explainTest: false },
  { id: '2', finalTask: 'examples', slider: true, explainTest: false },
  { id: '3', finalTask: 'summary', slider: false, explainTest: false },
  { id: '4', finalTask: 'examples', slider: false, explainTest: false },
  { id: '5', finalTask: 'summary', slider: true, explainTest: true },
  { id: '6', finalTask: 'examples', slider: true, explainTest: true }
];
const params = new URLSearchParams(window.location.search);
export const variant = variants.find(v => v.id === (params.get('version') || '1'));
if (!variant) throw new Error('Unknown experiment version. Use a link with version=1 through version=6.');
export const preview = params.get('preview') === '1';
// Bare/original links preserve Prolific mode. Friend links explicitly use mode=directLink.
export const mode = preview ? 'debug' : params.get('mode') === 'directLink' ? 'directLink' : 'prolific';
export const metadata = {
  experiment_version: variant.id,
  final_task: variant.finalTask,
  awareness_slider_enabled: variant.slider,
  test_explanation_required: variant.explainTest,
  preview_mode: preview,
  collection_mode: mode,
  code_revision: process.env.VUE_APP_BUILD_SHA || 'six-variants-2026-11-16',
  logging_schema: '2',
  session_key: window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2)
};
