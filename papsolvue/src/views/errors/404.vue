<template lang="pug">
#404error
  v-container
    v-row(justify="start")
      v-col(align="center")
        h1.display-3.warning--text.font-weight-bold
          | 404 - Page not found
        h2.mt-4 You got lost! This page does not exist.
  v-parallax(dark
    src="@/assets/404.jpg"
    height="800")
    v-container(fluid)
      v-row(justify="start" align="center")
        v-col
          p.text-justify.headline.font-weight-bold.black--text
            | You always loved flying and you were so excited about your first flight as a co-pilot.
            | But then something went wrong and your plane crashed. Luckily you survived, 
            | but you crashed in the middle of a forest. Your phone died and you're lost.
      v-row(justify="start" align="center")
        v-col(align="center")
          v-btn(color="warning"
            :to="{name:'Home'}")
            | Take me back home
</template>

<script>
export default {
  name: "NotFound"
};
</script>
