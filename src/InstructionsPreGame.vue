<template>
  <Screen>
    <div class="instructions">
      <h2>{{ pages[page].title }}</h2>

      <div v-html="pages[page].text"></div>

      <div class="button-container">
        <button v-if="page > 0" @click="previousPage">
          Previous
        </button>

        <button
          v-if="page < pages.length - 1"
          @click="pageForward"
        >
          Next
        </button>

        <button
          v-else
          @click="pageForward"
        >
          Next
        </button>
      </div>
    </div>
  </Screen>
</template>

<script>
import { variant } from "./variants";
export default {
  name: "InstructionsPreGame",
  computed: {
    timingPhase() { return 'pregame_instructions_' + this.page; },
  },
  data() {
    return {
      page: 0,
      pages: [
      {
        title: "Rules recap",
          text: `
            <p>
              Here is a <strong>short summary of the rules of the game</strong>:
            </p>

            <ul>
              <li>Start at the green cell and finish at the yellow cell.</li>
              <li>No diagonal moves are allowed</li>
              <li>You cannot visit a cell more than once.</li>
              <li>Each cell beyond the shortest path costs 1 point.</li>
              <li>Each orange cell you visit makes you gain 2 points.</li>
            </ul>
          `
        },
        {
          title: "Help during the game",
          text: `
            <p>You will start the game with <strong>two separate free tokens</strong> to get some help if you need it:</p>
            <ul>
              <li><strong>One token to read a summary of the rules.</strong></li>
              <li><strong>One token to test a path's score before submitting your final path.</strong></li>
            </ul>
            <p><strong>After the free token is used, each further use of that type of help will cost you 1 point</strong>. The cost of help will be deducted from your score at the end of that round.</p>

            <p> Click on the <strong>green box on the left</strong> of the grid to see a <strong>summary of the rules</strong>, and on the <strong>green box on the right</strong> of the grid to <strong>test a path's score</strong>.</p>

            <div class="instruction-figure">
              <img
                src="instructions/help_buttons.png"
                class="example-image"
              />
            </div>

            
          `
        },
        {
          title: "Final instructions",
          text: `
            <p>
              The game consists of <strong>16 rounds</strong>. In each round, if you make a mistake or want to change your path, click
              <strong>Reset</strong> to clear your selections and start again.
            </p>

            <p>
              When you are satisfied with your path, click <strong>Next</strong>
              to confirm it. <strong>You cannot change your path after confirming it.</strong>
            </p>

            <p>
              After confirming your path, you will see <strong>your path and the other participant's chosen path side by side</strong>,
              together with the points each of you earned or lost in that round.
            </p>

            <p>
              Below the images, two bars will show the <strong>total points so far</strong>:
              the <strong>top bar, in red, shows the other participant's total</strong>,
              while the <strong>bottom bar, in blue, shows your total</strong>.
              Each round's points are added to or subtracted from the previous total.
            </p>

            <p>
              At the end of the game, you will see who won and complete a short questionnaire. 
            </p>

            <p>
              Have fun and good luck!
            </p>


          `
        },
      ]
    };
  },

  methods: {

    previousPage() {
      this.page--;
    },

    pageForward() {
      if (this.page < this.pages.length - 1) {
        this.page++;
      } else {
        this.$magpie.nextScreen();
      }
    }
  },
};
</script>

<style scoped>
.instructions {
  width: 700px;
  max-width: 95vw;
  margin: 0 auto;
  text-align: justify;
}

.instructions h2 {
  text-align: center;
}

.instructions p {
  font-size: 24px;
  line-height: 1.6;
  margin-bottom: 12px;
}


.button-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
}

.button-container button {
  width: auto;
  margin: 0 5px;
}


.image-caption {
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
}


.instructions :deep(.instruction-figure) {
  text-align: center;
  margin: 8px 0;
}

.instructions :deep(.example-image) {
  display: block;
  width: auto;
  max-width: 100%;
  max-height: 500px;
  height: auto;
  margin: 24px auto;
  object-fit: contain;
}

.instructions :deep(.instruction-figure) {
  width: 60%;
  margin: 24px auto;
  text-align: center;
}


</style>