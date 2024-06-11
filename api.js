const axios = require('axios');
const crypto = require('crypto');

const apiUrl = process.env.API_URL;
const apiKey = process.env.API_KEY;
const apiSecret = process.env.SECRET_KEY;

async function newOrder(data) {
    if(!apiKey || !apiSecret)
        throw new Error("API Key and Secret are required");
    
    data.type = "MARKET";
    data.timestamp = Date.now();
    data.recvWindow = 60000;

    const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(`${new URLSearchParams(data)}`)
        .digest('hex');

    const qs = `?${new URLSearchParams({ ...data, signature })}`;

    try {
        const result = await axios({
            method: 'POST',
            url: `${apiUrl}/v3/order${qs}`,
            headers: {
                'X-MBX-APIKEY': apiKey
            }
        })
        return result.data;       
    } catch (error) {
        console.error(error);
    }
}

function buy(symbol, quoteOrderQty) {
    return newOrder({
        symbol,
        quoteOrderQty,
        side: 'BUY'
    });
}

function sell(symbol, quantity) {
    return newOrder({
        symbol,
        quantity,
        side: 'SELL'
    });
}

module.exports = { buy, sell };