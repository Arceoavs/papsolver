<template lang="pug">
v-navigation-drawer(app v-model="visible" temporary color="dp1")
  v-list-item
    v-list-item-content
      v-list-item-title(class="title")
        //- v-img(src="@/assets/logos/vgrlogo_white.svg"
          max-height="30px"
          contain)
      v-list-item-subtitle.mt-3.text-center.title.white--text
        | PapSolver
  v-divider
  v-list(dense, nav)
    v-list-item(v-for="item in items"
      :key="item.tag"
      link
      :to="item.to")
      v-list-item-icon
        v-icon {{item.icon}}
      v-list-item-content
        v-list-item-title {{item.tag}}
</template>

<script>
import navItems from "./navItems.json";

export default {
  props: {
    value: { type: Boolean, default: false }
  },
  data() {
    return {
      visible: this.value,
      items: navItems,
      right: null
    };
  },
  watch: {
    value() {
      this.visible = this.value;
    },
    visible() {
      this.$emit("input", this.visible);
    }
  }
};
</script>
