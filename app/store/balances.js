import Vue from 'vue'
import database from '../database'
import * as HoldingsManager from '../manager/holdings-manager'
import { collapseBalances } from '../manager/balance-manager'

const state = {
  loading: {
    balances: true
  },
  balances: [],
  priceHistories: {} // Todo: holdings should be cached in database
}

const getters = {
  balances: (state, getters, rootState) => rootState.config.display.balances.collapsed ? collapseBalances(state.balances) : state.balances,
  priceHistories: state => state.priceHistories,
  holdingsHistory: state => HoldingsManager.computeAllHoldingsHistories(state.priceHistories, state.balances),
  currentHoldings: state => {
    const holdingsHistory = HoldingsManager.sumHoldingsHistories(getters.holdingsHistory(state))

    if (holdingsHistory.length === 0) {
      return 0
    }

    return holdingsHistory[holdingsHistory.length - 1]
  }
}

const mutations = {
  UPDATE_BALANCES (state, { balances }) {
    balances.forEach(updatedBalance => {
      const index = state.balances.findIndex(balance => updatedBalance.equals(balance))

      if (index === -1) {
        state.balances.push(updatedBalance)
      } else {
        state.balances.splice(index, 1, updatedBalance)
      }
    })

    state.loading.balances = false
  },
  BALANCES_LOADING (state) {
    state.loading.balances = true
  },
  UPDATE_PRICE_HISTORY (state, { ticker, priceHistory }) {
    Vue.set(state.priceHistories, ticker, priceHistory)
    state.loading.priceHistories = false
  }
}

const actions = {
  /**
   * Reloads all balances from database.
   */
  reloadAllBalances: async ({ commit }) => {
    const balances = await database.findAllBalances()

    commit('UPDATE_BALANCES', { balances })
  },

  /**
   * Reloads specified balances from database.
   */
  reloadBalances: async ({ commit }, { balanceIds }) => {
    const balances = await database.findBalances(balanceIds)

    commit('UPDATE_BALANCES', { balances })
  },

  /**
   * Tells the service worker to refresh balances of each wallet.
   */
  refreshBalances: ({ commit }, { wallets, serviceWorker }) => {
    wallets.forEach(wallet => {
      serviceWorker.controller.postMessage({
        action: 'balance-refresh',
        walletId: wallet.id,
        currencies: []
      })
    })

    commit('BALANCES_LOADING')
  },

  /**
   * Refreshes all the price histories
   */
  refreshPriceHistories: async ({ commit }) => {
    const balances = await database.findAllBalances()
    const amounts = HoldingsManager.getSummedAmounts(balances)

    for (const ticker in amounts) {
      if (!amounts.hasOwnProperty(ticker)) {
        continue
      }

      const priceHistory = await HoldingsManager.getPeriodPriceHistory(ticker) // Todo: commit UPDATE EXCHANGE VALUES

      commit('UPDATE_PRICE_HISTORY', { ticker, priceHistory })
    }
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
