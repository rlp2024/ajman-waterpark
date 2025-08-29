// File: /api/get-prices.js
// FINAL VERSION - AS OF AUGUST 29, 2025

// NOTE: This code requires 'axios' and 'cheerio'. Vercel automatically installs them
// if you have a package.json file. If not, it might handle it automatically, but
// it's best practice to add a package.json by running 'npm init -y' and 'npm install axios cheerio'.

const axios = require('axios');
const cheerio = require('cheerio');

// This is the main function Vercel will run
module.exports = async (req, res) => {
    // ================== MAHALAGA: PALITAN ANG URL DITO ==================
    const ticketingUrl = 'https://ticket.ajmanwaterpark.com/'; // <-- PALITAN ITO NG TAMANG LIVE URL
    // ====================================================================

    try {
        const { data } = await axios.get(ticketingUrl);
        const $ = cheerio.load(data);
        const prices = [];

        // ================== MAHALAGA: PALITAN ANG SELECTORS DITO ==================
        // Kailangan itong itugma sa HTML structure ng inyong live ticketing website.
        // Halimbawa, kung ang bawat package ay nasa loob ng <div class="product">,
        // at ang pangalan ay nasa <h4> at presyo ay nasa <span class="price">,
        // ganito ang magiging itsura:
        //
        // $('.product').each((index, element) => {
        //     const name = $(element).find('h4').text().trim();
        //     const price = $(element).find('.price').text().trim();
        //     ...
        // });
        //
        // Ang nasa baba ay isang halimbawa lamang.
        $('.package-item').each((index, element) => {
            const name = $(element).find('.package-name').text().trim();
            const price = $(element).find('.package-price').text().trim();

            if (name && price) {
                prices.push({ name, price });
            }
        });
        // =========================================================================

        if (prices.length === 0) {
             // If scraper fails to find anything, return a helpful message
             return res.status(404).json({ error: 'Could not find any packages on the page. The website structure may have changed.' });
        }

        // Send the successful response
        res.status(200).json(prices);

    } catch (error) {
        console.error('Error scraping prices:', error);
        // Send an error response if something fails
        res.status(500).json({ error: 'Failed to fetch ticket prices from the source website.' });
    }
};