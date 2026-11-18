<template>
  <Screen>
    <h2>Final Questionnaire</h2>

    <!-- Step 1: Rules summary -->
    <div v-if="step === 1" class="question">
      <p>
        Please summarize the rules of the game in bullet points for the next participant.
      </p>

      <textarea
        v-model="strategyExplanation"
        class="rules-summary"
        aria-label="Summary of the game rules"
      ></textarea>

      <button
        :disabled="!strategyExplanation.trim()"
        @click="step = 2"
      >
        Next
      </button>
    </div>

    <!-- Step 2: Peculiar events -->
    <div v-if="step === 2" class="question">
      <p>Did you notice anything peculiar while playing the game?</p>

      <div class="radio-container">
        <label>
          <input type="radio" value="yes" v-model="peculiar" />
          Yes
        </label>

        <label>
          <input type="radio" value="no" v-model="peculiar" />
          No
        </label>
      </div>

      <button
        :disabled="!peculiar"
        @click="step = peculiar === 'yes' ? 3 : 4"
      >
        Next
      </button>
    </div>

    <!-- Step 3: Follow-up only for a yes response -->
    <div v-if="step === 3" class="question">
      <p>What did you notice?</p>

      <textarea
        v-model="peculiarExplanation"
        aria-label="What you noticed"
      ></textarea>

      <button
        :disabled="!peculiarExplanation.trim()"
        @click="step = 4"
      >
        Next
      </button>
    </div>

    <!-- Step 4: Suspicion -->
    <div v-if="step === 4" class="question">
      <p>
        Did you ever suspect that the instructions you received were
        somehow defective and that your opponent knew more about
        the game than you did?
      </p>

      <div class="radio-container">
        <label>
          <input type="radio" value="yes" v-model="suspicion" />
          Yes
        </label>

        <label>
          <input type="radio" value="no" v-model="suspicion" />
          No
        </label>
      </div>

      <button :disabled="!suspicion" @click="step = 5">
        Next
      </button>
    </div>

    <!-- Step 5: Suspicion explanation -->
    <div v-if="step === 5" class="question">
      <div v-if="suspicion === 'yes'">
        <p>
          Please explain why and give examples from the game.
        </p>

        <textarea
          v-model="suspicionYesExplanation"
          aria-label="Reasons for your suspicion and examples"
        ></textarea>
      </div>

      <div v-else-if="suspicion === 'no'">
        <p>Please explain why.</p>

        <textarea
          v-model="suspicionNoExplanation"
          aria-label="Reasons for not suspecting this"
        ></textarea>
      </div>

      <button :disabled="!canContinueFromStep5" @click="step = 6">
        Next
      </button>
    </div>

    <!-- Step 6: Demographics and preferences -->
    <div v-if="step === 6" class="question">
      <h3>A few questions about you</h3>

      <label for="participant-age">How old are you?</label>
      <input
        id="participant-age"
        v-model.number="age"
        type="number"
        min="1"
        max="70"
        step="1"
        class="text-input"
      />

      <label for="participant-gender">What is your gender?</label>
      <input
        id="participant-gender"
        v-model="gender"
        type="text"
        class="text-input"
      />

      <fieldset class="yes-no-question">
        <legend>Do you consider yourself a competitive person?</legend>

        <div class="radio-container">
          <label>
            <input
              v-model="competitive"
              type="radio"
              name="competitive"
              value="yes"
            />
            Yes
          </label>
          <label>
            <input
              v-model="competitive"
              type="radio"
              name="competitive"
              value="no"
            />
            No
          </label>
        </div>
      </fieldset>

      <fieldset class="yes-no-question">
        <legend>Do you enjoy playing games?</legend>

        <div class="radio-container">
          <label>
            <input
              v-model="likesGames"
              type="radio"
              name="likes-games"
              value="yes"
            />
            Yes
          </label>
          <label>
            <input
              v-model="likesGames"
              type="radio"
              name="likes-games"
              value="no"
            />
            No
          </label>
        </div>
      </fieldset>

      <fieldset class="yes-no-question">
        <legend>Do you like Math?</legend>

        <div class="radio-container">
          <label>
            <input
              v-model="likesMath"
              type="radio"
              name="likes-math"
              value="yes"
            />
            Yes
          </label>
          <label>
            <input
              v-model="likesMath"
              type="radio"
              name="likes-math"
              value="no"
            />
            No
          </label>
        </div>
      </fieldset>

      <button :disabled="!canContinueFromStep6" @click="step = 7">
        Next
      </button>
    </div>

    <!-- Step 7: Perceived purpose and feedback -->
    <div v-if="step === 7" class="question">
      <h3>Your thoughts on the experiment</h3>

      <label for="experiment-purpose">
        What do you think this experiment was about?
      </label>
      <textarea
        id="experiment-purpose"
        v-model="experimentPurpose"
        class="final-response"
      ></textarea>

      <label for="experiment-feedback">
        Do you have any feedback on the experiment? For example,
        was anything unclear, or is there anything you think could
        be improved? (Optional)
      </label>
      <textarea
        id="experiment-feedback"
        v-model="experimentFeedback"
        class="final-response"
      ></textarea>

      <p v-if="saveError" role="alert">{{ saveError }}</p>

      <button
        :disabled="!canSubmit || submitting"
        @click="submitQuestionnaire"
      >
        {{ submitting ? "Saving…" : "Finish questionnaire" }}
      </button>
    </div>
  </Screen>
</template>
<script>
import { variant } from "./variants";

export default {
  name: "Questionnaire",

  data() {
    return {
      step: variant.finalTask === "summary" ? 1 : 2,

      strategyExplanation: "",
      peculiar: "",
      peculiarExplanation: "",
      suspicion: "",
      suspicionYesExplanation: "",
      suspicionNoExplanation: "",

      age: "",
      gender: "",
      competitive: "",
      likesGames: "",
      likesMath: "",
      experimentPurpose: "",
      experimentFeedback: "",

      submitting: false,
      saveError: ""
    };
  },

  computed: {
    timingPhase() {
      return "questionnaire_" + this.step;
    },

    canContinueFromStep5() {
      const rulesComplete =
        variant.finalTask === "examples" ||
        this.strategyExplanation.trim().length > 0;

      const peculiarComplete =
        this.peculiar === "no" ||
        (this.peculiar === "yes" &&
          this.peculiarExplanation.trim().length > 0);

      const suspicionComplete =
        (this.suspicion === "yes" &&
          this.suspicionYesExplanation.trim().length > 0) ||
        (this.suspicion === "no" &&
          this.suspicionNoExplanation.trim().length > 0);

      return rulesComplete && peculiarComplete && suspicionComplete;
    },

    canContinueFromStep6() {
      const validAge =
        Number.isInteger(this.age) &&
        this.age >= 1 &&
        this.age <= 120;

      const isYesOrNo = value => ["yes", "no"].includes(value);

      return (
        validAge &&
        this.gender.trim().length > 0 &&
        isYesOrNo(this.competitive) &&
        isYesOrNo(this.likesGames) &&
        isYesOrNo(this.likesMath)
      );
    },

    canSubmit() {
      return (
        this.canContinueFromStep5 &&
        this.canContinueFromStep6 &&
        this.experimentPurpose.trim().length > 0
      );
    }
  },

  methods: {
    submitQuestionnaire() {
      if (this.step !== 7 || !this.canSubmit || this.submitting) return;

      this.submitting = true;
      this.saveError = "";

      try {
        this.$magpie.addTrialData({
          trial_type: "questionnaire",

          strategy_explanation: this.strategyExplanation.trim(),

          peculiar_answer: this.peculiar,
          peculiar_explanation: this.peculiarExplanation.trim(),

          suspicion_answer: this.suspicion,
          suspicion_yes_explanation:
            this.suspicionYesExplanation.trim(),
          suspicion_no_explanation:
            this.suspicionNoExplanation.trim(),

          // Examples are included in suspicion_yes_explanation.
          suspicion_examples: "",

          age: this.age,
          gender: this.gender.trim(),
          competitive: this.competitive,
          likes_games: this.likesGames,
          likes_math: this.likesMath,
          experiment_purpose: this.experimentPurpose.trim(),
          experiment_feedback: this.experimentFeedback.trim()
        });
      } catch (error) {
        this.submitting = false;
        this.saveError =
          "Your responses could not be saved. Please try again.";
        return;
      }

      this.$magpie.nextScreen();
    }
  }
};
</script>

<style scoped>
.question {
  margin-bottom: 25px;
  font-size: 18px;
}

label {
  display: block;
  margin: 8px 0;
}

textarea {
  width: 100%;
  max-width: 800px;
  min-height: 120px;
  box-sizing: border-box;
}

textarea.rules-summary {
  width: 100%;
  max-width: 900px;
  min-height: 350px;
  padding: 15px;
  font-size: 18px;
  line-height: 1.6;
  box-sizing: border-box;
  resize: vertical;
}

button {
  margin-top: 20px;
}

.radio-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 15px 0;
}

.radio-container label {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0;
}

.text-input {
  display: block;
  width: 100%;
  max-width: 400px;
  margin: 0 auto 24px;
  padding: 10px;
  font: inherit;
  box-sizing: border-box;
}

.yes-no-question {
  border: 0;
  padding: 0;
  margin: 28px 0;
  min-width: 0;
}

.yes-no-question legend {
  width: 100%;
  padding: 0;
  text-align: center;
}

textarea.final-response {
  display: block;
  min-height: 200px;
  margin: 12px auto 32px;
  padding: 12px;
  font: inherit;
  line-height: 1.5;
  resize: vertical;
}
</style>