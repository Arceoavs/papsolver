<template lang="pug">
v-app-bar(app dense color="dp1")
  v-row(justify="start" align="center" no-gutters)
    v-col.hidden-md-and-up(cols="8")
      v-app-bar-nav-icon(
        @click.stop="$emit('drawer', true)")
    v-col(cols="1")
      router-link(:to="{name: 'Home'}")
        v-img(src="@/assets/logo.svg"
          max-height="30px"
          contain)
  v-spacer
  v-divider.hidden-sm-and-down(vertical, inset)
  v-toolbar-items.hidden-sm-and-down
    v-btn(v-for="item in items"
      :key="item.tag"
      text
      :to="item.to")
      | {{item.tag}}
</template>

<script>
import navItems from "./navItems.json";
export default {
  data() {
    return {
      items: navItems
    };
  }
};
</script>
