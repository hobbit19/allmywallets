const AbstractExchangeExplorer = require('./AbstractExchangeExplorer')
const NotSupportedCurrencyError = require('../errors/NotSupportedCurrencyError')

const crypto = require('crypto')
const queryStringLib = require('querystring')
const nonce = require('nonce')()
const URLSearchParams = require('url-search-params')

const PRIVATE_API = 'https://poloniex.com/tradingApi'

/**
 * Poloniex exchange https://poloniex.com/
 */
class Poloniex extends AbstractExchangeExplorer {
  async _poloniexPrivateApiRequest (command, queryObject, apiKey, secret, method = 'POST') {
    queryObject.command = command
    queryObject.nonce = nonce()
    const queryString = queryStringLib.stringify(queryObject)
    const headers = {
      'Key': apiKey,
      'Sign': this._sign(queryString, secret),
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
    }
    const res = await this.constructor._fetchJson(PRIVATE_API, {
      method,
      headers,
      body: new URLSearchParams(queryString)
    })
    return res
  }

  static async getSupportedCurrencies () {
  }

  async _checkApiKeyPermission ({secret, apiKey}) {
  }

  async _getAllNonZeroBalances ({secret, apiKey}) {
    const resBalances = await this._poloniexPrivateApiRequest('returnBalances', {}, apiKey, secret)

    const nonZeroBalanceTickers = []
    const balances = []
    Object.keys(resBalances).forEach(ticker => {
      const amount = resBalances[ticker]
      if (amount > 0) {
        balances.push(amount)
        nonZeroBalanceTickers.push(ticker)
      }
    })

    return {balances, nonZeroBalanceTickers}
  }

  async _getBalances ({secret, apiKey}) {
  }

  _sign (queryString, secret) {
    return crypto.createHmac('sha512', secret).update(queryString).digest('hex')
  }

  static getAddressParam () {
    return [{
      type: 'input',
      inputType: 'text',
      label: 'Poloniex Api Key',
      model: 'wallets.apiKey',
      required: true
    },
    {
      type: 'input',
      inputType: 'text',
      label: 'Poloniex secret',
      model: 'wallets.secret',
      required: true
    }]
  }
}

module.exports = Poloniex