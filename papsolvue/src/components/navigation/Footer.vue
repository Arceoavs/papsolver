<template lang="pug">
v-footer(padless elevation="2")
  v-card.flex(flat tile color="dp1")
    v-card-text.py-2.text-center
      v-btn(dark
        text
        small
        href="https://github.com/Arceoavs/papsolver")
        | GitHub

      v-btn(dark
        text
        small
        href="mailto:info@vgr.best")
        | Mail

      v-btn(dark
        text
        small
        :to="{name: 'Imprint'}")
        | Imprint

      v-btn(dark
        text
        small
        :to="{name: 'Privacy'}")
        | Privacy

      v-btn(dark
        text
        small
        :to="{name: 'Terms'}")
        | Terms

      span.ml-1
        |&copy; {{new Date().getFullYear()}} - Arnold Arz
</template>

<script>
export default {
  name: "Footer"
};
</script>
