const API_KEY = process.env.VUE_APP_CRYPTO_KEY;
const SOCKET_URL = process.env.VUE_APP_SOCKET_URL;

const AGGREGATE_INDEX = "5";
const TO_MANY_SOCKETS_CLIENT = "429";

const tickersHandlers = new Map();
const socket = new WebSocket(`${SOCKET_URL}/v2?api_key=${API_KEY}`);

const bc = new BroadcastChannel("tickers");

function setTickers(currency, newPrice) {
  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach(fn => fn(newPrice));
}
socket.addEventListener("message", e => {
  const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(e.data);
  if (type === AGGREGATE_INDEX && newPrice !== undefined) {
    setTickers(currency, newPrice);
    bc.postMessage(JSON.stringify({ currency, newPrice }));
  }
  if (type === TO_MANY_SOCKETS_CLIENT) {
    bc.onmessage = e => {
      const { currency, newPrice } = JSON.parse(e.data);
      setTickers(currency, newPrice);
    };
  }
});

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message);
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
}

function subscribeToTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`]
  });
}

function unsubscribeToTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`]
  });
}

export const subscribeToTickers = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  subscribeToTickerOnWs(ticker);
};

export const unsubscribeToTicker = ticker => {
  tickersHandlers.delete(ticker);
  unsubscribeToTickerOnWs(ticker);
};

// setInterval(loadTickers, 5000);

window.tickers = tickersHandlers;

// const loadTickers = () => {
//   if (tickersHandlers.size === 0) {
//     return;
//   }

//   fetch(
//     `${BASE_URL}pricemulti?fsyms=${[...tickersHandlers.keys()].join(
//       ","
//     )}&tsyms=USD&api_key=${API_KEY}`
//   )
//     .then(res => res.json())
//     .then(rawData => {
//       const updatedPrices = Object.fromEntries(
//         Object.entries(rawData).map(([key, value]) => [key, value.USD])
//       );

//       Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
//         const handlers = tickersHandlers.get(currency) ?? [];
//         handlers.forEach(fn => fn(newPrice));
//       });
//     });
// };
