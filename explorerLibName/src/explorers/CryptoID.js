const AbstractExplorer = require('./AbstractExplorer')
const NotSupportedCurrencyError = require('../errors/NotSupportedCurrencyError')

// TODO : cors
const API_URL = 'https://cors-anywhere.herokuapp.com/https://chainz.cryptoid.info/'

/**
 *  CryptoID blockchain explorers https://chainz.cryptoid.info/
 */
class CryptoID extends AbstractExplorer {
  constructor (params) {
    super()

    this.params = params || {}
    if (!this.params.apiKey) {
      throw new Error('Api key is required for CryptoID, request it here https://chainz.cryptoid.info/api.key.dws')
    }

    this.dynamicSupportedCurrencies = true
    this.supportedCurrencies = {BTC: {name: 'Bitcoin', ticker: 'BTC'}}
  }

  static getDefaultTicker () {
    return 'BTC'
  }

  async _getBalances (address, wallet) {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'origin': '.',
      'x-requested-with': '.'
    }

    wallet.balances = []
    const promises = []
    this.tickers.forEach(async ticker => {
      promises.push(this.constructor._fetchJson(`${API_URL}/${ticker.toLowerCase()}/api.dws?q=getbalance&a=${address}&key=${this.params.apiKey}`, {headers})
                                    .catch(() => { throw new NotSupportedCurrencyError(`${ticker} is not supported`) }))
    })
    let balances = await Promise.all(promises)
    balances.forEach(balance => {
      wallet.balances.push(balance)
    })
  }

  async _getTransactions (address, wallet) {
    wallet.transactions = []
    this.tickers.forEach(ticker => {
      wallet.transactions.push([])
    })
  }

  static getExplorerParams () {
    return [{
      type: 'input',
      inputType: 'text',
      label: 'CryptoID api key, redeem it here https://chainz.cryptoid.info/api.key.dws',
      model: 'apiKey',
      required: true
    }]
  }
}

module.exports = CryptoID