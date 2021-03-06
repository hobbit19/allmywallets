<template>
  <collapsible-section icon="user-md" :class="{ 'warning': needsUpdate }">
    <translate slot="title">Expert mode</translate>
    <p slot="intro">
      <translate>Expert mode allows you to update your raw configuration directly.</translate>
      <strong v-if="needsUpdate" v-translate>Configuration needs to be updated!</strong>
    </p>
    <p>
      <strong v-translate>Beware! Editing this configuration may break the application.</strong>
      <translate>Be sure to know what you are doing...</translate>
    </p>
    <p v-translate>Example:</p>
    <pre>
{
  "profiles": [{
    "wallets": [{
        "id": "random id (20 chars)",
        "network": "bitcoin",
        "provider": "blockexplorer",
        "name": "My Bitcoin wallet",
        "parameters": {
          "addresses": [
            "ADDRESS"
          ]
        }
      },
      {
        "id": "random id (20 chars)",
        "network": "ethereum",
        "provider": "etherscan",
        "name": "My Ethereum wallet",
        "parameters": {
          "addresses": [
            "ADDRESS"
          ],
          "currencies": [
            "ETH",
            "BAT",
            "IND"
          ],
          "customTokens": {
            "IND": {
              "name": "Indorse",
              "ticker": "IND",
              "decimals": 18,
              "contractAddress": "0xf8e386eda857484f5a12e4b5daa9984e06e73705"
            }
          }
        }
      },
      {
        "id": "random id (20 chars)",
        "network": "iota",
        "provider": "native",
        "name": "My IOTA wallet",
        "parameters": {
          "address": "ADDRESS",
          "node": "https://iota.thathost.net"
        }
      }
    ],
    "application": {
      "currencies": {
        "primary": "USD",
        "secondary": "BTC"
      }
    }
  }],
  "application": {
    "version": "X.X.X",
    "language": "fr"
  }
}
  </pre>
    <p>
      <translate>
        The configuration require unique ids of 20 characters for each wallet to be generated. You can use the following
        ones if you are not inspired:
      </translate>
      <template v-for="n in 3"><span class="badge">{{ generateId() }}</span>&nbsp;</template>
    </p>
    <p v-translate>Current editable configuration:</p>
    <p class="error" v-if="error !== ''">{{ error }}</p>
    <textarea title="Edit your configuration" v-model="config"></textarea>
  </collapsible-section>
</template>

<script>
  import { mapGetters } from 'vuex'
  import Configurator from '../configurator'
  import { generateId } from '../helper/string'
  import CollapsibleSection from './CollapsibleSection.vue'

  export default {
    components: {
      CollapsibleSection
    },
    name: 'config-expert',
    data () {
      return {
        error: '',
        timeout: 0
      }
    },
    computed: {
      config: {
        get () {
          return JSON.stringify(this.$store.state.config.config, null, 2)
        },
        async set (config) {
          clearTimeout(this.timeout)
          this.timeout = setTimeout(async () => {
            this.error = ''
            try {
              return this.$store.dispatch('init', {
                serviceWorker: this.$serviceWorker,
                config: JSON.parse(config)
              })
            } catch (e) {
              this.error = e.message
            }
          }, 500)
        }
      },
      needsUpdate () {
        return !Configurator.validateConfig(this.$store.state.config.config)
      }
    },
    methods: {
      generateId () {
        return generateId(20)
      }
    }
  }
</script>

<style scoped lang="scss">
  textarea {
    width: 100%;
    height: 300px;
  }

  pre {
    font-size: 0.8em;
    width: 100%;
    overflow: scroll;
  }
</style>
