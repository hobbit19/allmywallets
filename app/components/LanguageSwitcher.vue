<template>
  <span>
    <select name="language" @change="changeLanguage" title="Change language" class="language">
      <option v-for="(language, key) in $language.available" :value="key" :selected="key === $language.current">{{ language }}</option>
    </select>
  </span>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: 'language-switcher',
    computed: {
      ...mapGetters([
        'config'
      ])
    },
    methods: {
      changeLanguage (event) {
        return this.$store.dispatch('changeLanguage', {
          language: event.target.value
        })
      }
    }
  }
</script>

<style scoped lang="scss">
  @import '../scss/vars';

  select {
    width: 75px;
  }
</style>
