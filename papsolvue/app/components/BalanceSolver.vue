<template>
  <section class="solver-page">
    <div class="container page-heading">
      <p class="eyebrow">Exact balance solver</p>
      <h1>Use every last cent.</h1>
      <p>
        Enter your remaining balance, then use the built-in App Store catalogue
        or paste your own prices. We will find an exact combination when one exists.
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

        <fieldset class="field source-picker">
          <legend>Price source</legend>
          <div class="source-options">
            <label :class="{ selected: sourceMode === 'built-in' }">
              <input v-model="sourceMode" type="radio" value="built-in" />
              <span>
                <strong>Germany App Store</strong>
                <small>Use the bundled price-point catalogue</small>
              </span>
            </label>
            <label :class="{ selected: sourceMode === 'custom' }">
              <input v-model="sourceMode" type="radio" value="custom" />
              <span>
                <strong>My own prices</strong>
                <small>Paste a private, temporary list</small>
              </span>
            </label>
          </div>
        </fieldset>

        <div v-if="sourceMode === 'custom'" class="field custom-prices">
          <label for="custom-prices">Custom price list</label>
          <textarea
            id="custom-prices"
            v-model="customInput"
            name="custom-prices"
            rows="9"
            spellcheck="false"
            placeholder="0.99&#10;Coffee, 2.50&#10;Lunch — 7,25 €"
            aria-describedby="custom-prices-help custom-prices-status"
            :aria-invalid="customParse.errors.length > 0"
          ></textarea>
          <small id="custom-prices-help">
            One entry per line. A label is optional; the price can use a dot or
            comma. Labels may contain up to 120 characters.
          </small>
          <p class="privacy-note">
            Parsing happens in this browser. When you submit, only the resulting
            labels and prices are sent to the solver and they are not stored.
          </p>

          <div
            v-if="customParse.errors.length"
            id="custom-prices-status"
            class="parse-summary message message-warning"
            role="alert"
          >
            <strong>
              {{ customParse.errors.length }}
              {{ customParse.errors.length === 1 ? "line needs" : "lines need" }} attention.
            </strong>
            <ul>
              <li v-for="error in visibleParseErrors" :key="`${error.line}-${error.input}`">
                Line {{ error.line }}: {{ error.message }}
              </li>
            </ul>
            <small v-if="customParse.errors.length > visibleParseErrors.length">
              Plus {{ customParse.errors.length - visibleParseErrors.length }} more.
            </small>
          </div>
          <p v-else id="custom-prices-status" class="parse-status" role="status">
            <strong>{{ customParse.tiers.length }}</strong>
            {{ customParse.tiers.length === 1 ? "unique price" : "unique prices" }} ready.
            <span v-if="customParse.duplicateCount">
              {{ customParse.duplicateCount }}
              {{ customParse.duplicateCount === 1 ? "duplicate was" : "duplicates were" }} merged.
            </span>
          </p>
        </div>

        <fieldset class="field tier-picker">
          <legend>Allowed price points</legend>
          <div class="tier-actions">
            <input
              v-model="tierQuery"
              type="search"
              placeholder="Filter by label or price"
              aria-label="Filter price points"
              :disabled="availableTiers.length === 0"
            />
            <button
              type="button"
              class="button button-secondary"
              :disabled="availableTiers.length === 0"
              @click="selectAll"
            >
              Select all
            </button>
            <button
              type="button"
              class="text-button"
              :disabled="selectedTierIds.length === 0"
              @click="selectedTierIds = []"
            >
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
            :disabled="availableTiers.length === 0"
            @blur="tiersTouched = true"
          >
            <option v-for="tier in filteredTiers" :key="tier.id" :value="tier.id">
              {{ tierName(tier) ? `${tierName(tier)} — ` : "" }}{{ formatEuros(tier.priceCents) }}
            </option>
          </select>
          <small id="tiers-help">
            {{ selectedTierIds.length }} of {{ availableTiers.length }} selected.
            Hold Ctrl or Command to select individual values.
          </small>
          <small v-if="sourceMode === 'built-in'">
            German price-point snapshot as of {{ pricingMetadata.asOf }}.
            <a :href="pricingMetadata.sourceUrl" target="_blank" rel="noreferrer">Source details</a>
          </small>
          <p v-if="showTierError" id="tiers-error" class="field-error" role="alert">
            {{ sourceMode === "custom" && customParse.tiers.length === 0
              ? "Add at least one valid custom price."
              : "Choose at least one price point." }}
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
              <span class="purchase-description">
                <strong v-if="item.label">{{ item.label }}</strong>
                <span>{{ formatEuros(item.priceCents) }}</span>
              </span>
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
import { parseCustomPriceList } from "../utils/customPrices";
import { formatEuros, parseMoneyToCents } from "../utils/money";

interface DisplayTier extends Tier {
  description?: string;
}

interface PricingSnapshot {
  metadata: {
    asOf: string;
    sourceUrl: string;
  };
  prices: DisplayTier[];
}

type SourceMode = "built-in" | "custom";
type ViewState = "idle" | "loading" | "success" | "no-solution" | "error";

const builtInTiers = (pricing as PricingSnapshot).prices;
const pricingMetadata = (pricing as PricingSnapshot).metadata;
const balance = ref("");
const balanceTouched = ref(false);
const sourceMode = ref<SourceMode>("built-in");
const customInput = ref("");
const selectedTierIds = ref<string[]>([]);
const tiersTouched = ref(false);
const tierQuery = ref("");
const state = ref<ViewState>("idle");
const statusMessage = ref("");
const assignment = ref<Assignment[]>([]);
let activeRequest: AbortController | undefined;

const targetCents = computed(() => parseMoneyToCents(balance.value));
const customParse = computed(() => parseCustomPriceList(customInput.value));
const visibleParseErrors = computed(() => customParse.value.errors.slice(0, 6));
const availableTiers = computed(() =>
  sourceMode.value === "built-in" ? builtInTiers : customParse.value.tiers,
);
const showBalanceError = computed(
  () => balanceTouched.value && targetCents.value === null,
);
const showTierError = computed(
  () => tiersTouched.value && selectedTierIds.value.length === 0,
);
const filteredTiers = computed(() => {
  const query = tierQuery.value.trim().replace(",", ".").toLocaleLowerCase();
  if (!query) return availableTiers.value;
  return availableTiers.value.filter(
    (tier) =>
      (tier.priceCents / 100).toFixed(2).includes(query) ||
      tier.label?.toLocaleLowerCase().includes(query) ||
      tier.description?.toLocaleLowerCase().includes(query),
  );
});
const tiersById = computed(
  () => new Map(availableTiers.value.map((tier) => [tier.id, tier])),
);
const purchases = computed(() =>
  assignment.value
    .filter((item) => item.quantity > 0)
    .map((item) => ({
      ...item,
      label:
        item.label ??
        tiersById.value.get(item.tierId)?.label ??
        tiersById.value.get(item.tierId)?.description,
    })),
);

function selectAll(): void {
  selectedTierIds.value = availableTiers.value.map((tier) => tier.id);
}

function tierName(tier: DisplayTier): string | undefined {
  return tier.label ?? tier.description;
}

function resetResult(): void {
  activeRequest?.abort();
  activeRequest = undefined;
  state.value = "idle";
  assignment.value = [];
  statusMessage.value = "";
}

watch(sourceMode, () => {
  tierQuery.value = "";
  selectedTierIds.value = sourceMode.value === "custom"
    ? customParse.value.tiers.map((tier) => tier.id)
    : [];
  tiersTouched.value = false;
  resetResult();
});

watch(customInput, () => {
  if (sourceMode.value !== "custom") return;
  selectedTierIds.value = customParse.value.tiers.map((tier) => tier.id);
  resetResult();
});

watch([balance, selectedTierIds], resetResult, { deep: true });

async function submit(): Promise<void> {
  balanceTouched.value = true;
  tiersTouched.value = true;
  if (
    targetCents.value === null ||
    selectedTierIds.value.length === 0 ||
    (sourceMode.value === "custom" && customParse.value.errors.length > 0)
  ) {
    return;
  }

  activeRequest?.abort();
  activeRequest = new AbortController();
  state.value = "loading";
  assignment.value = [];
  statusMessage.value = "";

  const tiers: Tier[] = selectedTierIds.value.flatMap((id) => {
    const tier = tiersById.value.get(id);
    return tier
      ? [{
          id: tier.id,
          priceCents: tier.priceCents,
          ...(tier.label ? { label: tier.label } : {}),
        }]
      : [];
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
