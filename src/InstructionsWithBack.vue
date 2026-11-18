<template>
  <Screen>
    <div class="instructions">

      <!-- First screen: choose who presents the instructions. -->
      <div v-if="!instructorConfirmed" class="instructor-selection">
        <h2>Choose your instructor</h2>

        <p>
          Welcome! In this experiment, you will play a game against another participant.
        </p>

        <p>
          The participants that played this game before you are called Alice and Marie.
          After they played, the task we gave to each of them was to write down the
          instructions of the game in a very detailed way.
        </p>

        <p>
          <strong>You can now choose whether you want to read Alice's or Marie's explanation of the game's rules.</strong>
        </p>

        <p>
          <strong>Your opponent will read the instructions written by the person you didn't choose.</strong>
        </p> 
          
        

        <p v-if="variant.finalTask === 'summary'">
          <strong>
            At the end of the game, you will also be asked to write a summary of the
            rules of the game for the next participants.
          </strong>
          You won't need to be as detailed as Alice and Marie, but you will need to
          write in bullet points the main rules of the game.
        </p>

        <p>
          Click on Alice's or Marie's picture to select whose instructions you want
          to read, then click "Next" to continue.
        </p>

        <div class="instructor-options">
          <button
            v-for="person in instructors"
            :key="person.id"
            type="button"
            class="instructor-card"
            :class="{
              selected:
                selectedInstructor &&
                selectedInstructor.id === person.id
            }"
            :aria-pressed="
              selectedInstructor !== null &&
              selectedInstructor.id === person.id
            "
            @click="selectedInstructor = person"
          >
            <img :src="person.image" :alt="person.name" />

            <span>{{ person.name }}</span>
          </button>
        </div>

        <div class="button-container">
          <button
            type="button"
            :disabled="!selectedInstructor"
            @click="confirmInstructor"
          >
            Next
          </button>
        </div>
      </div>

      <!-- Following screens: your existing instruction pages. -->
      <div v-else>
        <div class="instructor-header">
          <img
            :src="selectedInstructor.image"
            :alt="selectedInstructor.name"
          />

          <span>
            {{ selectedInstructor.name }}'s explanation of the game
          </span>
        </div>

        <h2>{{ pages[page].title }}</h2>

        <div v-html="pages[page].text"></div>

        <div class="button-container">
          <button
            v-if="page > 0"
            type="button"
            @click="page--"
          >
            Previous
          </button>

          <button
            v-if="page < pages.length - 1"
            type="button"
            @click="page++"
          >
            Next
          </button>

          <button
            v-else
            type="button"
            @click="$magpie.nextScreen()"
          >
            Next
          </button>
        </div>
      </div>

    </div>
  </Screen>
</template>

<script>
import { variant } from "./variants";
export default {
  name: "InstructionsWithBack",

  computed: {
    timingPhase() { return this.instructorConfirmed ? 'instructions_' + this.page : 'instructor_choice'; },
  },
  data() {
    return {
      page: 0,

      selectedInstructor: null,
      instructorConfirmed: false,

      instructors: [
        {
          id: "alice",
          name: "Alice",
          image: "instructions/alice_picture.png"
        },
        {
          id: "marie",
          name: "Marie",
          image: "instructions/Marie_picture.jpg"
        }
      ],

      pages: [
        {
          title: "Welcome!",
          text: `
            <p>
              In this experiment, you will play a game against another participant.
              <strong>The player with the most points at the end wins.</strong>
            </p>

            <p>
              In each round, you will see a <strong>4 × 4 grid</strong>. 
              In the grid, <strong>one cell will be green</strong>, and that is the cell you must start from. 
              <strong>Another cell will be yellow</strong>, and that is the cell you must reach. 
              
            </p>

            <div class="instruction-figure">
              <img
                src="instructions/instr_minimal_before_adding_orange_empty.png"
                alt="A grid with a green starting cell and a yellow destination cell."
                class="example-image small-image"
              />
            </div>

            <p>
              Your goal is to reach the yellow cell while <strong>earning as many points as possible</strong>.
            </p>
          `
        },

        {
          title: "Legal moves",
          text: `
            <p>
              <strong>Click on the green cell to start</strong>, then click on each
              cell you want to visit until you reach the yellow cell.
              A <strong>black dot</strong> will mark each selected cell.
            </p>

            <p>
              Each move must take you to a cell immediately <strong>above, below, to the left, or to the right</strong> of your current cell.
              <strong>Diagonal moves are not allowed</strong>, and you <strong>cannot visit the same cell twice</strong>.
            </p>

            <p>
              In the example below, the <strong>first two paths from the left are valid</strong>, while the <strong>third path is invalid</strong>.
            </p>

            <div class="instruction-figure">
              <img
                src="instructions/correct_and_wrong_movements.png"
                alt="Two valid paths and one invalid path with a diagonal move."
                class="example-image"
              />
            </div>

            <p>
              If you try to make an invalid move, an error message will appear.
              That cell will not be selected, and you will have to click on another one. 
            </p>
          `
        },

        {
          title: "Points: extra cells",
          text: `

            <p>
              In every grid, there are many possible paths of different lengths that connect the green cell to the yellow cell.
            </p>
            <p>
              <strong>You lose 1 point for every extra cell you visit beyond the shortest possible path from green to yellow</strong>. 
              For example, a path with <strong>one extra cell costs 1 point</strong>, a path with <strong>two extra cells costs 2 points</strong>, and so on.
            </p>

            <p>
              In the grids below, the minimum number of cells from green to yellow (excluding the green and the yellow cells themselves) is 5. 
            </p>

            <p>
              The <strong>first two paths from the left are both shortest paths</strong>, so neither receives an extra-cell penalty.
              The <strong>third path however uses four extra cells</strong>, so it would cost <strong> -4 points</strong>.
            </p>

            <div class="instruction-figure">
              <img
                src="instructions/points_for_minimal_path.png"
                alt="Two shortest paths and a longer path with four extra cells."
                class="example-image"
              />
            </div>

          `
        },

        {
          title: "Points: orange cells",
          text: `
            <p>
              In the grids, apart from the green and the yellow cells, there will also be other colored cells. <strong>You gain 2 points for every orange cell you visit.</strong>
            </p>

            <p>
              Below, you can see two possible paths with 3 cells selected. Both paths are shortest paths, so neither receives an extra-cell penalty.
              However, the <strong>first path contains no orange cells and thus earns 0 points</strong>.
              The <strong>second one, on the other hand, includes one orange cell and thus earns 2 points</strong>.
            </p>

            <div class="instruction-figure">
              <img
                src="instructions/orange_points_example.png"
                alt="Two shortest paths: one earns zero points and the other earns two."
                class="example-image"
              />
            </div>

          `
        },

        {
          title: "First practice",
          text: `
            <p>
              You will now complete <strong>two practice rounds</strong>.
              In each round, you will see two possible paths: <strong>Option A</strong> and <strong>Option B</strong>. Click on the path that earns
              <strong>more points</strong>.
            </p>

            <div class="instruction-figure">
              <img
                src="instructions/forced_choice_possible_paths.png"
                alt="Option A earns zero points; Option B earns two points."
                class="example-image"
              />
            </div>

            <p>
              In this example, <strong>Option B is correct</strong>, as
              it earns <strong>2 points</strong>, while Option A earns
              <strong>0 points</strong>.
            </p>

            <p>
              Once you select an option, you will read an explanation of
              why the path you selected was the correct choice or not. 
            </p>

            ${variant.finalTask === 'examples' ? `
            
            <p>
              <strong>
                At the end of the game, you will also be asked to write explanations of two
                practice rounds for the people who play after you.
              </strong>
            </p>  

            <p>
              For each example, you will select the path you think earns
              more points and explain why.
              Use the practice explanations as examples of how to explain
              your choices to the next players.
            </p>
          ` : ''}

          `
        },
      ],
    };
  },
  methods: {
      confirmInstructor() {
        if (!this.selectedInstructor || this.instructorConfirmed) {
          return;
        }

        // Save the chosen instructor as experiment-level information.
        this.$magpie.addExpData({
          instructor_id: this.selectedInstructor.id,
          instructor_name: this.selectedInstructor.name,
          instructor_image: this.selectedInstructor.image
        });

        this.$emit("instructor-selected", this.selectedInstructor);
        this.instructorConfirmed = true;
        this.page = 0;
      }
    }
};
</script>


<style scoped>

.instructor-selection p {
  margin: 0 0 1.2em;
  line-height: 1.6;
}

.instructor-options {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin: 28px auto;
}

.instructor-card {
  width: 220px;
  max-width: 44%;
  padding: 12px;
  border: 3px solid #ccc;
  border-radius: 8px;
  background: white;
  color: #222;
  font: inherit;
  cursor: pointer;
}

.instructor-card img {
  display: block;
  width: 100%;
  height: 230px;
  object-fit: contain;
  margin-bottom: 12px;
}

.instructor-card span {
  display: block;
  font-size: 20px;
  font-weight: bold;
}

.instructor-card.selected {
  border-color: #1565c0;
  background: #edf5ff;
}

.instructor-card:focus-visible {
  outline: 3px solid #1565c0;
  outline-offset: 3px;
}

.instructor-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-bottom: 24px;
}

.instructor-header img {
  width: 65px;
  height: 80px;
  object-fit: contain;
}

.button-container button:disabled {
  opacity: 0.5;
  cursor: default;
}

.instructions {
  width: 700px;
  max-width: 95vw;
  margin: 0 auto;
  text-align: justify;
}

.instructions h2 {
  text-align: center;
}

.instructions :deep(p) {
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 12px;
}

.instructions :deep(.instruction-figure) {
  width: 100%;
  margin: 24px auto;
  text-align: center;
}

.instructions :deep(.image-caption) {
  width: 100%;
  margin: 0 auto 10px;
  text-align: center;
  font-weight: bold;
}

.instructions :deep(.instruction-image) {
  display: block;
  max-width: 600px;
  width: auto;
  height: auto;
  margin: 0 auto;
}

.instructions :deep(.example-image) {
  display: block;
  width: auto;
  max-width: min(600px, 100%);
  height: auto;
  margin: 24px auto;
}

/* Only images explicitly marked as small-image are reduced. */
.instructions :deep(.example-image.small-image) {
  max-width: min(300px, 100%);
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

</style>