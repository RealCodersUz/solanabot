// GET https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd

const { default: axios } = require("axios");

let solToUsd = async (count) => {
  const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd`;
  try {
    const response = await axios.get(apiUrl);
    const price = response.data;
    // console.log(response.data);
    console.log(price.solana.usd * count);
    return price.solana.usd * count;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};
async function getPairs() {
  const url = "https://api.dexscreener.com/latest/dex/search/?q=solana";
  const response = await axios.get(url);
  console.log(response.data);
}

// () => {
//   fetch("https://api.coingecko.com/api/v3/simple/price?ids=&vs_currencies=usd")
//     .then((response) => {
//       response.json();
//       console.log(response, "response");
//     })
//     .then((data) => {
//       //   let priceInUsd = data.solana.usd;
//       //   console.log(priceInUsd, "priceInUsd");
//       console.log(data, "data");
//       //   document.getElementById(
//       //     "sol-to-usd"
//       //   ).innerHTML = `1 SOL  = $${priceInUsd}`;
//     });
//};

module.exports = { solToUsd, getPairs };
// Call the function initially to display the price when the page loads
// solToUsd();

// Update every minute in case prices change
// setInterval(solToUsd
// };
