const https = require('https');
var tokens = ['QUIPU', 'USDS', 'tzBTC', 'STKR', 'USDtz', 'ETHtz', 'hDAO', 'WRAP', 'CRUNCH', 'wAAVE', 'wBUSD', 'wCEL', 'wCOMP', 'wCRO', 'wDAI', 'wFTT', 'wHT', 'wHUSD', 'wLEO', 'wLINK', 'wMATIC', 'wMKR', 'wOKB', 'wPAX', 'wSUSHI', 'wUNI', 'wUSDC', 'wUSDT', 'wWBTC', 'wWETH', 'PLENTY', 'KALAM', 'crDAO', 'SMAK', 'kDAO', 'uUSD', 'uDEFI', 'bDAO', 'YOU', 'RCKT', 'rkDAO', 'UNO', 'GIF', 'IDZ', 'EASY', 'INSTA', 'xPLENTY', 'ctez', 'PAUL', 'SPI', 'WTZ', 'PXL', 'sDAO', 'akaDAO', 'MIN', 'ENR', 'MCH', 'uBTC', 'MTRIA', 'DOGA', 'EURL', 'WETH.e', 'WBTC.e', 'USDC.e', 'USDT.e', 'MATIC.e', 'LINK.e', 'DAI.e', 'BUSD.e', 'USDt', 'SIRS', 'BTCtz', 'ABR', 'abBUSD', 'apUSDC', 'PLY', 'wTEZ', 'uXTZ', 'LYZI', 'Old TKEY', 'TKEY', 'STARtz', 'TCOIN', 'TEIA', 'dtez', 'dtzbtc']
const responses = []

tokens.forEach(token =>
https.request({
  method: 'GET',
  hostname: 'back.tzkt.io',
  path: `/v1/suggest/accounts/${token}`
}, res => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const responseData = JSON.parse(data);
    responses.push(responseData[0])
    // Perform actions with the retrieved data here
  });
})
  )
console.log(responses)

// Scrap prices on https://quipuswap.com/swap/tez-KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV
/*
var prices = {}
var tokens = ['QUIPU', 'USDS', 'tzBTC', 'STKR', 'USDtz', 'ETHtz', 'hDAO', 'WRAP', 'CRUNCH', 'wAAVE', 'wBUSD', 'wCEL', 'wCOMP', 'wCRO', 'wDAI', 'wFTT', 'wHT', 'wHUSD', 'wLEO', 'wLINK', 'wMATIC', 'wMKR', 'wOKB', 'wPAX', 'wSUSHI', 'wUNI', 'wUSDC', 'wUSDT', 'wWBTC', 'wWETH', 'PLENTY', 'KALAM', 'crDAO', 'SMAK', 'kDAO', 'uUSD', 'uDEFI', 'bDAO', 'YOU', 'RCKT', 'rkDAO', 'UNO', 'GIF', 'IDZ', 'EASY', 'INSTA', 'xPLENTY', 'ctez', 'PAUL', 'SPI', 'WTZ', 'PXL', 'sDAO', 'akaDAO', 'MIN', 'ENR', 'MCH', 'uBTC', 'MTRIA', 'DOGA', 'EURL', 'WETH.e', 'WBTC.e', 'USDC.e', 'USDT.e', 'MATIC.e', 'LINK.e', 'DAI.e', 'BUSD.e', 'USDt', 'SIRS', 'BTCtz', 'ABR', 'abBUSD', 'apUSDC', 'PLY', 'wTEZ', 'uXTZ', 'LYZI', 'Old TKEY', 'TKEY', 'STARtz', 'TCOIN', 'TEIA', 'dtez', 'dtzbtc']

function scrapPrices(tokens) {
    const button = document.querySelector("button[data-test-id=\"changeToken\"]")
    button.click()
    setTimeout(() => {
        const asset = Array.from(document.querySelectorAll(`.ModalCell_light__C5Ehb`)).filter(div => div.innerHTML.includes(tokens[0]))
        console.log(asset)
        asset[0].click()
        setTimeout(() => {
            prices[tokens[0]] = document.querySelector('.ComplexInput_item1__a8Oi-').innerText
            if (tokens.length > 1) scrapPrices(tokens.slice(1))
        },200)
    },200)
}

scrapPrices(tokens)
*/

// Result
 /*
{
  "QUIPU": "= $ 0.14",
  "USDS": "= $ 1.06",
  "tzBTC": "= $ 35,882.04",
  "STKR": "= $ 0",
  "USDtz": "= $ 0.99",
  "ETHtz": "= $ 1,612.24",
  "hDAO": "= $ 0.04",
  "WRAP": "= $ 0.01",
  "CRUNCH": "= $ 0",
  "wAAVE": "= $ 80.43",
  "wBUSD": "= $ 1.06",
  "wCEL": "",
  "wCOMP": "",
  "wCRO": "= $ 0.09",
  "wDAI": "= $ 0.99",
  "wFTT": "",
  "wHT": "",
  "wHUSD": "= $ 0.03",
  "wLEO": "",
  "wLINK": "= $ 14.16",
  "wMATIC": "= $ 0.88",
  "wMKR": "",
  "wOKB": "",
  "wPAX": "= $ 0.43",
  "wSUSHI": "= $ 0.43",
  "wUNI": "= $ 3.09",
  "wUSDC": "= $ 1.01",
  "wUSDT": "= $ 1.16",
  "wWBTC": "= $ 37,070.01",
  "wWETH": "= $ 1,982.78",
  "PLENTY": "= $ 0.01",
  "KALAM": "= $ 0",
  "crDAO": "= $ 0",
  "SMAK": "= $ 0",
  "kDAO": "= $ 0.19",
  "uUSD": "= $ 1",
  "uDEFI": "= $ 0.22",
  "bDAO": "= $ 0",
  "YOU": "= $ 0.77",
  "RCKT": "= $ 0",
  "rkDAO": "",
  "UNO": "= $ 0.18",
  "GIF": "= $ 0",
  "IDZ": "= $ 0",
  "EASY": "= $ 0",
  "INSTA": "= $ 0",
  "xPLENTY": "",
  "ctez": "= $ 0.98",
  "PAUL": "= $ 0",
  "SPI": "= $ 0",
  "WTZ": "= $ 0.95",
  "PXL": "= $ 0",
  "sDAO": "= $ 0",
  "akaDAO": "= $ 0.06",
  "MIN": "= $ 0",
  "ENR": "= $ 0",
  "MCH": "= $ 0",
  "uBTC": "= $ 36,523.94",
  "MTRIA": "= $ 0.03",
  "DOGA": "= $ 0.02",
  "EURL": "= $ 1.06",
  "WETH.e": "= $ 1,967.33",
  "WBTC.e": "= $ 36,472.63",
  "USDC.e": "= $ 1",
  "USDT.e": "= $ 1",
  "MATIC.e": "= $ 0.87",
  "LINK.e": "= $ 13.96",
  "DAI.e": "= $ 0.98",
  "BUSD.e": "= $ 0.85",
  "USDt": "= $ 0.99",
  "SIRS": "= $ 0.06",
  "BTCtz": "= $ 32,763.39",
  "ABR": "= $ 0.15",
  "abBUSD": "= $ 1.04",
  "apUSDC": "= $ 1.09",
  "PLY": "= $ 0",
  "wTEZ": "= $ 0.84",
  "uXTZ": "= $ 0.84",
  "LYZI": "= $ 0.03",
  "Old TKEY": "= $ 0",
  "TKEY": "= $ 0.03",
  "STARtz": "= $ 0",
  "TCOIN": "= $ 0.02",
  "TEIA": "= $ 0.03",
  "dtez": "= $ 0.89",
  "dtzbtc": ""
}
*/

