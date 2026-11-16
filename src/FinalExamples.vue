<template>
  <Screen>
    <div class="examples">
      <h2>Explain an example for the next players</h2>
      <p>Example {{ exampleIndex + 1 }} of 2</p>
      <p>Select the path you think earns the most points, from green to yellow.
        Then explain to the people who play after you why this path is optimal.
        Your explanation should help them understand which path to take and why,
        like the explanations you read in the practice examples.</p>
      <p>These examples do not change your game score.</p>
      <div class="example-grid">
        <button v-for="cell in cells" :key="cell.key" type="button"
          :style="{ backgroundColor: palette[cell.colour] }" :aria-label="cell.label"
          :aria-pressed="selected(cell.row, cell.col)" :disabled="stage !== 'path'"
          @click="choose(cell.row, cell.col)">
          <span v-if="selected(cell.row, cell.col)" class="example-dot"></span>
        </button>
      </div>
      <p role="status">{{ error || '\u00a0' }}</p>
      <div v-if="stage === 'path'">
        <button @click="reset">Reset</button>
        <button :disabled="!complete" @click="stage = 'explanation'">Explain this path</button>
      </div>
      <div v-else>
        <p><label for="example-explanation">Explain to the next players why the path you selected is optimal.</label></p>
        <textarea id="example-explanation" v-model="explanation" rows="10"></textarea>
        <button @click="returnToPath">Change path</button>
        <button :disabled="!explanation.trim() || saving" @click="save">{{ exampleIndex === 0 ? 'Next example' : 'Continue' }}</button>
      </div>
    </div>
  </Screen>
</template>
<script>
import examples from './finalExamples';
export default {
  name: 'FinalExamples',
  data() { return { exampleIndex: 0, stage: 'path', path: [], explanation: '', error: '', saving: false,
    palette: { white: '#ffffff', green: '#66ff00', yellow: '#ffff00', blue: '#36b0ef', purple: '#c761e9', orange: '#ffa500', red: '#ee0b20' } }; },
  computed: {
    timingPhase() { return 'final_example_' + (this.exampleIndex + 1) + '_' + this.stage; },
    example() { return examples[this.exampleIndex]; },
    cells() { return this.example.maze.flatMap((row,r) => row.map((colour,c) => ({ row:r, col:c, colour, key:r+'-'+c, label:'Row '+(r+1)+', column '+(c+1)+', '+colour }))); },
    complete() { const last = this.path[this.path.length-1]; return !!last && last[0] === this.example.end[0] && last[1] === this.example.end[1]; }
  },
  methods: {
    selected(r,c) { return this.path.some(p => p[0] === r && p[1] === c); },
    choose(r,c) {
      if (this.stage !== 'path') return;
      this.error = '';
      if (this.complete || this.selected(r,c)) { this.error = 'Use Reset to change your path. You cannot revisit a cell.'; return; }
      const last = this.path[this.path.length-1];
      if (!last && (r !== this.example.start[0] || c !== this.example.start[1])) { this.error = 'Start from green.'; return; }
      if (last && Math.abs(r-last[0])+Math.abs(c-last[1]) !== 1) { this.error = 'Select an adjacent cell.'; return; }
      this.path.push([r,c]);
      this.logEvent('cell_selected', { mode: 'final_example', example_id: this.example.id, row:r, col:c, colour:this.example.maze[r][c] });
    },
    reset() {
      this.logEvent('path_reset', { mode:'final_example', example_id:this.example.id, path_before_reset:JSON.stringify(this.path), colours_before_reset:JSON.stringify(this.path.map(([r,c])=>this.example.maze[r][c])), empty_path:this.path.length===0 });
      this.path=[]; this.error=''; this.explanation='';
    },
    returnToPath() {
      this.logEvent('example_explanation_returned_to_path', { example_id:this.example.id, explanation_draft:this.explanation });
      this.explanation=''; this.stage='path';
    },
    save() {
      if (this.saving || !this.complete || !this.explanation.trim()) return;
      this.saving=true;
      const colours=this.path.map(([r,c])=>this.example.maze[r][c]);
      const score=2*colours.filter(c=>c==='orange').length-4*colours.filter(c=>c==='purple').length-Math.max(0,this.path.length-this.example.min_cells);
      this.$magpie.addTrialData({ trial_type:'final_example', row_type:'example_response', example_id:this.example.id,
        selected_path:JSON.stringify(this.path), selected_colours:JSON.stringify(colours), min_cells:this.example.min_cells,
        selected_path_score:score, explanation:this.explanation.trim(), score_feedback_shown:false });
      if (this.exampleIndex === 1) { this.$magpie.nextScreen(); return; }
      this.closeTiming();
      this.exampleIndex++; this.path=[]; this.explanation=''; this.stage='path'; this.saving=false;
    }
  }
};
</script>
<style scoped>
.examples { max-width: 850px; margin: auto; }
.example-grid { display: grid; grid-template-columns: repeat(4,1fr); width: min(400px,90vw); aspect-ratio: 1; margin: 20px auto; border: 1px solid black; }
.example-grid button { position: relative; margin: 0; padding: 0; border: 1px solid black; border-radius: 0; display: flex; align-items: center; justify-content: center; opacity: 1; }
.example-grid button:focus-visible { outline: 4px solid black; outline-offset: -7px; }
.example-dot { display: block; width: 36%; height: 36%; border-radius: 50%; background: black; }
textarea { width: 100%; box-sizing: border-box; min-height: 230px; padding: 12px; font-size: 18px; }
</style>
