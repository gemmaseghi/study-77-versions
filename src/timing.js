// Browser timing: DOM-update onset (not a calibrated physical display onset).
// Each timed component is mounted only when selected by Magpie's Experiment.
import { metadata, variant } from './variants';
let active = null;
let sequence = 0;
export default {
  computed: { variant() { return variant; } },
  mounted() {
    if (!this.$options.computed || !this.$options.computed.timingPhase) return;
    const magpie = this.$magpie;
    if (!magpie._instrumented) {
      magpie._instrumented = true;
      const add = magpie.addTrialData.bind(magpie);
      magpie.addTrialData = data => add({ ...metadata, event_sequence: ++sequence, ...data });
      const next = magpie.nextScreen.bind(magpie);
      magpie.nextScreen = (...args) => { if (active) active.closeTiming(); return next(...args); };
      magpie.addExpData(metadata);
    }
    this._timingContext = { component: this.$options.name, trial_id: this.trial ? this.trial.trial_id : null, round_number: this.roundNumber || null };
    this._timingGeneration = 0;
    this._visibilityListener = () => {
      this.accountVisible();
      this.logEvent('visibility_change', { visibility: document.visibilityState, phase: this.timingPhase });
    };
    document.addEventListener('visibilitychange', this._visibilityListener);
    this.$watch('timingPhase', () => { this.closeTiming(); this.beginTiming(); }, { sync: true });
    this.beginTiming();
  },
  beforeDestroy() {
    if (this._visibilityListener) document.removeEventListener('visibilitychange', this._visibilityListener);
    this.closeTiming();
  },
  methods: {
    logEvent(event, extra = {}) {
      this.$magpie.addTrialData({ trial_type: 'instrumentation', row_type: 'event', ...this._timingContext,
        event, timestamp_ms: Date.now(), session_elapsed_ms: performance.now(), ...extra });
    },
    beginTiming() {
      const generation = ++this._timingGeneration;
      this.$nextTick(() => {
        if (this._isDestroyed || generation !== this._timingGeneration) return;
        this._phaseClock = { name: this.timingPhase, start: performance.now(), epoch: Date.now(), last: performance.now(), visible: 0, wasVisible: !document.hidden, attempt: this.timingPhase.startsWith('test_') ? this.testAttempt || null : null };
        if (this.timingPhase === 'awareness_slider') this.confidenceStarted = this._phaseClock.start;
        active = this;
        this.logEvent('phase_started', { phase: this.timingPhase, test_attempt: this._phaseClock.attempt });
      });
    },
    accountVisible() {
      const clock = this._phaseClock;
      if (!clock) return;
      const now = performance.now();
      if (clock.wasVisible) clock.visible += now - clock.last;
      clock.last = now;
      clock.wasVisible = !document.hidden;
    },
    closeTiming() {
      ++this._timingGeneration;
      const clock = this._phaseClock;
      if (!clock) return;
      this.accountVisible();
      this.$magpie.addTrialData({ trial_type: 'instrumentation', row_type: 'phase_timing', ...this._timingContext,
        phase: clock.name, test_attempt: clock.attempt, phase_started_at_ms: clock.epoch, phase_ended_at_ms: Date.now(),
        duration_ms: performance.now() - clock.start, visible_duration_ms: clock.visible });
      this._phaseClock = null;
      if (active === this) active = null;
    }
  }
};
