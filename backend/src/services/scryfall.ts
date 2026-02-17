const fetch = require('node-fetch');
async function fetchCardByName(name: string) {
    const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`,
        {
            headers: {
                'User-Agent': 'NAGO/1.0',
                'Accept': 'application/json'
            }
        });
    if (!response.ok) {
        throw new Error(`Failed to fetch card data: ${response.status} ${response.statusText}`);
    }
    
}

module.exports = { fetchCardByName };