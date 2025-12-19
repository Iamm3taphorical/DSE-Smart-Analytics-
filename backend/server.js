const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

// Cache to prevent spamming DSE
let marketDataCache = {
    timestamp: 0,
    data: []
};
const CACHE_DURATION = 60 * 1000; // 1 minute

const fetchDSEData = async () => {
    try {
        console.log('Fetching data from DSE...');
        const url = 'https://www.dsebd.org/latest_share_price_scroll_l.php';
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        const stocks = [];

        // DSE Table Structure is often dynamic but usually inside .table
        // Iterate through rows.
        $('table tr').each((i, el) => {
            // Skip header usually
            const cols = $(el).find('td');
            if (cols.length > 5) {
                // Parse Columns: ID, Code, LTP, High, Low, Close, YCP, Change, Trade, Value, Volume
                // This index mapping is an estimate based on DSE structure
                const ticker = $(cols[1]).text().trim();
                if (!ticker || ticker === 'Trading Code') return;

                const ltp = parseFloat($(cols[2]).text().replace(/,/g, '')) || 0;
                const high = parseFloat($(cols[3]).text().replace(/,/g, '')) || 0;
                const low = parseFloat($(cols[4]).text().replace(/,/g, '')) || 0;
                const close = parseFloat($(cols[5]).text().replace(/,/g, '')) || 0;
                const ycp = parseFloat($(cols[6]).text().replace(/,/g, '')) || 0;
                const change = parseFloat($(cols[7]).text().replace(/,/g, '')) || 0;
                const trade = parseFloat($(cols[8]).text().replace(/,/g, '')) || 0;
                const value = parseFloat($(cols[9]).text().replace(/,/g, '')) || 0;
                const volume = parseFloat($(cols[10]).text().replace(/,/g, '')) || 0;

                stocks.push({
                    ticker,
                    price: ltp,
                    high,
                    low,
                    close,
                    ycp,
                    change,
                    changePercent: ycp > 0 ? parseFloat(((change / ycp) * 100).toFixed(2)) : 0,
                    volume,
                    trade,
                    value,
                    updatedAt: new Date().toISOString()
                });
            }
        });

        return stocks;
    } catch (error) {
        console.error('Scraping Error:', error.message);
        return [];
    }
};

app.get('/api/stocks', async (req, res) => {
    const now = Date.now();
    if (now - marketDataCache.timestamp < CACHE_DURATION && marketDataCache.data.length > 0) {
        return res.json(marketDataCache.data);
    }

    const data = await fetchDSEData();
    if (data.length > 0) {
        marketDataCache = {
            timestamp: now,
            data
        };
    }
    res.json(marketDataCache.data);
});

// Search Endpoint
app.get('/api/search', (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    const results = marketDataCache.data.filter(s =>
        s.ticker.toLowerCase().includes(q.toLowerCase())
    );
    res.json(results);
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`DSE Scraper Server running on port ${PORT}`);
});
