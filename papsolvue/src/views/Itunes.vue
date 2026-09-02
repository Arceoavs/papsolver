<template>
  <section class="solver-page">
    <div class="container page-heading">
      <p class="eyebrow">Exact balance solver</p>
      <h1>Use every last cent.</h1>
      <p>
        Enter your remaining balance and choose the German App Store price points
        you are willing to buy. We will find an exact combination when one exists.
      </p>
    </div>

    <div class="container solver-grid">
      <form class="panel form-panel" novalidate @submit.prevent="submit">
        <div class="field">
          <label for="balance">Remaining balance</label>
          <div class="money-input">
            <span aria-hidden="true">€</span>
            <input
              id="balance"
              v-model="balance"
              name="balance"
              type="text"
              inputmode="decimal"
              autocomplete="off"
              placeholder="6.85"
              aria-describedby="balance-help balance-error"
              :aria-invalid="showBalanceError"
              @blur="balanceTouched = true"
            />
          </div>
          <small id="balance-help">
            Use a positive amount up to €1,000 with no more than two decimal places.
          </small>
          <p v-if="showBalanceError" id="balance-error" class="field-error" role="alert">
            Enter a valid balance between €0.01 and €1,000.00.
          </p>
        </div>

        <div class="field">
          <label for="country">Store country</label>
          <select id="country" v-model="country" name="country">
            <option value="de">Germany</option>
            <option value="gb" disabled>Great Britain — pricing unavailable</option>
            <option value="us" disabled>United States — pricing unavailable</option>
          </select>
        </div>

        <fieldset class="field tier-picker">
          <legend>Allowed price points</legend>
          <div class="tier-actions">
            <input
              v-model="tierQuery"
              type="search"
              placeholder="Filter price points"
              aria-label="Filter price points"
            />
            <button type="button" class="button button-secondary" @click="selectAll">
              Select all
            </button>
            <button type="button" class="text-button" @click="selectedTierIds = []">
              Clear
            </button>
          </div>
          <select
            id="tiers"
            v-model="selectedTierIds"
            name="tiers"
            multiple
            size="10"
            aria-describedby="tiers-help tiers-error"
            :aria-invalid="showTierError"
            @blur="tiersTouched = true"
          >
            <option v-for="tier in filteredTiers" :key="tier.id" :value="tier.id">
              {{ formatEuros(tier.priceCents) }}
            </option>
          </select>
          <small id="tiers-help">
            {{ selectedTierIds.length }} of {{ availableTiers.length }} selected.
            Hold Ctrl or Command to select individual values.
          </small>
          <small>
            German price-point snapshot as of {{ pricingMetadata.asOf }}.
            <a :href="pricingMetadata.sourceUrl" target="_blank" rel="noreferrer">Source details</a>
          </small>
          <p v-if="showTierError" id="tiers-error" class="field-error" role="alert">
            Choose at least one price point.
          </p>
        </fieldset>

        <button class="button button-primary submit-button" type="submit" :disabled="state === 'loading'">
          <span v-if="state === 'loading'" class="spinner" aria-hidden="true"></span>
          {{ state === "loading" ? "Finding a combination…" : "Find exact combination" }}
        </button>
      </form>

      <section class="panel result-panel" aria-live="polite" :aria-busy="state === 'loading'">
        <p class="eyebrow">Result</p>
        <h2>Required purchases</h2>

        <div v-if="state === 'idle'" class="empty-state">
          <span class="result-icon" aria-hidden="true">↗</span>
          <p>Your exact purchase combination will appear here.</p>
        </div>

        <div v-else-if="state === 'loading'" class="empty-state">
          <span class="spinner spinner-large" aria-hidden="true"></span>
          <p>Checking the selected price points…</p>
        </div>

        <div v-else-if="state === 'no-solution'" class="message message-warning" role="status">
          <strong>No exact combination found.</strong>
          <p>{{ statusMessage }}</p>
          <p>Try selecting more price points or changing the balance.</p>
        </div>

        <div v-else-if="state === 'error'" class="message message-error" role="alert">
          <strong>We could not contact the solver.</strong>
          <p>{{ statusMessage }}</p>
          <button type="button" class="text-button" @click="submit">Try again</button>
        </div>

        <div v-else class="solution">
          <p class="message message-success">
            Exact match for <strong>{{ formatEuros(targetCents ?? 0) }}</strong>
          </p>
          <ul class="purchase-list">
            <li v-for="item in purchases" :key="item.tierId">
              <span class="quantity">{{ item.quantity }}×</span>
              <span>{{ formatEuros(item.priceCents) }}</span>
              <span class="line-total">{{ formatEuros(item.priceCents * item.quantity) }}</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import pricing from "../data/de-prices.json";
import {
  NoSolutionError,
  solveBalance,
  type Assignment,
  type Tier,
} from "../services/solver";
import { formatEuros, parseMoneyToCents } from "../utils/money";

interface PricePoint {
  id: string;
  priceCents: number;
}

interface PricingSnapshot {
  metadata: {
    asOf: string;
    sourceUrl: string;
  };
  prices: PricePoint[];
}

type ViewState = "idle" | "loading" | "success" | "no-solution" | "error";

const availableTiers = (pricing as PricingSnapshot).prices;
const pricingMetadata = (pricing as PricingSnapshot).metadata;
const balance = ref("");
const balanceTouched = ref(false);
const country = ref("de");
const selectedTierIds = ref<string[]>([]);
const tiersTouched = ref(false);
const tierQuery = ref("");
const state = ref<ViewState>("idle");
const statusMessage = ref("");
const assignment = ref<Assignment[]>([]);
let activeRequest: AbortController | undefined;

const targetCents = computed(() => parseMoneyToCents(balance.value));
const showBalanceError = computed(
  () => balanceTouched.value && targetCents.value === null,
);
const showTierError = computed(
  () => tiersTouched.value && selectedTierIds.value.length === 0,
);
const filteredTiers = computed(() => {
  const query = tierQuery.value.trim().replace(",", ".");
  if (!query) return availableTiers;
  return availableTiers.filter((tier) =>
    (tier.priceCents / 100).toFixed(2).includes(query),
  );
});
const tiersById = new Map(availableTiers.map((tier) => [tier.id, tier]));
const purchases = computed(() =>
  assignment.value
    .filter((item) => item.quantity > 0 && tiersById.has(item.tierId)),
);

function selectAll(): void {
  selectedTierIds.value = availableTiers.map((tier) => tier.id);
}

function resetResult(): void {
  activeRequest?.abort();
  activeRequest = undefined;
  state.value = "idle";
  assignment.value = [];
  statusMessage.value = "";
}

watch([balance, selectedTierIds], resetResult, { deep: true });

async function submit(): Promise<void> {
  balanceTouched.value = true;
  tiersTouched.value = true;
  if (targetCents.value === null || selectedTierIds.value.length === 0) return;

  activeRequest?.abort();
  activeRequest = new AbortController();
  state.value = "loading";
  assignment.value = [];
  statusMessage.value = "";

  const tiers: Tier[] = selectedTierIds.value.flatMap((id) => {
    const price = tiersById.get(id);
    return price ? [{ id, priceCents: price.priceCents }] : [];
  });

  try {
    const result = await solveBalance(
      { tiers, targetCents: targetCents.value },
      activeRequest.signal,
    );
    assignment.value = result.assignments;
    state.value = "success";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return;
    if (error instanceof NoSolutionError) {
      state.value = "no-solution";
      statusMessage.value = error.message;
      return;
    }
    state.value = "error";
    statusMessage.value =
      error instanceof Error ? error.message : "An unexpected error occurred.";
  }
}

onBeforeUnmount(() => activeRequest?.abort());
</script>
