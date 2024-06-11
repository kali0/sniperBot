require('dotenv').config();
const api = require('./api');

const SYMBOL = process.env.SYMBOL;
const PROFIT = parseFloat(process.env.PROFIT);
const BUY_QTY = parseFloat(process.env.BUY_QTY);

const WebSocket = require('ws');

const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${SYMBOL.toLowerCase()}@bookTicker`);

ws.on("error", (err) => {
    console.log(err);
    process.exit(1);
});

let buyPrice = 0;
let quantity = 0;
let targetPrice = 0;

ws.onmessage = async (event) => {
    console.clear();

    const obj = JSON.parse(event.data);
    console.log("Symbol: " + obj.s);
    console.log("Best Ask: " + obj.a);
    console.log("Best Bid: " + obj.b);
    console.log("Buy Price: " + buyPrice);
    console.log("Buy Quantity: " + quantity);
    console.log("Target Price: " + targetPrice);

    if(quantity === 0) {
        quantity = -1;

        const order = await api.buy(SYMBOL, BUY_QTY);
        if(order.status !== 'FILLED') {
            console.log(order);
            process.exit(1);
        }

        quantity = parseFloat(order.executedQty);
        buyPrice = parseFloat(order.fills[0].price);
        targetPrice = buyPrice * PROFIT;
        return;
    }
    else if(quantity > 0 && parseFloat(obj.b) >= targetPrice) {
        const order = await api.sell(SYMBOL, quantity);
        if(order.status !== 'FILLED') {
            console.log(order);
            process.exit(1);
        }
        else {
            console.log(`Sold at ${new Date()} by ${order.fills[0].price}`);
        }
        process.exit(1);
    }
};

ws.onopen = () => {
    console.log("Connection opened");
};

ws.onclose = () => { 
    console.log("Connection closed");
    process.exit(1);
};