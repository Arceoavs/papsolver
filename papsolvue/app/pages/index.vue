<template>
  <section class="hero">
    <div class="container hero-content">
      <p class="eyebrow">Exact balance matching</p>
      <h1>Make the balance<br />land on zero.</h1>
      <p class="hero-copy">
        Enter what is left, choose the prices you can use, and CentMatch finds
        the shortest shopping list that spends the balance exactly.
      </p>
      <div class="hero-actions">
        <NuxtLink class="button button-primary" to="/solve">
          Match my balance
        </NuxtLink>
        <NuxtLink class="button button-secondary" to="/about">
          How it works
        </NuxtLink>
      </div>
      <div class="balance-sequence" aria-label="Example balance reduced to zero">
        <span>€6.85</span><span>€4.56</span><span>€3.27</span><span>€1.98</span><strong>€0.00</strong>
      </div>
    </div>
  </section>

  <section class="landing-section">
    <div class="container">
      <div class="section-heading">
        <p class="eyebrow">One target, two ways to start</p>
        <h2>Use the App Store list or bring your own.</h2>
        <p>
          CentMatch repeats the prices you allow until it finds the shortest
          combination that reaches your balance exactly.
        </p>
      </div>

      <div class="feature-grid">
        <article class="panel feature-card">
          <span class="feature-number">01</span>
          <h3>Germany App Store</h3>
          <p>
            Search 800 current price points, with practical descriptions on the
            commonly used tiers.
          </p>
        </article>
        <article class="panel feature-card">
          <span class="feature-number">02</span>
          <h3>Your own price list</h3>
          <p>
            Paste item names and prices for another store, gift card, or prepaid
            account. Nothing is saved.
          </p>
        </article>
        <article class="panel feature-card">
          <span class="feature-number">03</span>
          <h3>An exact answer</h3>
          <p>
            Get the fewest purchases needed to reach zero—or a clear answer when
            no exact combination exists.
          </p>
        </article>
      </div>

      <div class="privacy-callout">
        <p><strong>No account. No cookies. No analytics.</strong></p>
        <p>Your balance and price list are used only to calculate the answer.</p>
        <NuxtLink to="/privacy">Read the privacy note</NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
useHead({ title: "CentMatch — Spend a balance exactly" });
</script>
