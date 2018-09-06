// Description:
//   Allows instant searching for electronic component datasheets through Octopart
//
// Dependencies:
//   None
//
// Configuration:
//   HUBOT_OCTOPART_API_KEY - The API key of your Octopart application (https://octopart.com/api/register)
//
// Commands:
//   hubot datasheet <part number> - Link to the datasheet of an electronic part
//
// Examples:
//   hubot datasheet stm32f103rb
//   hubot datasheet LM741
//   hubot datasheet 555
//   hubot datasheet 5V regulator
//
// Author:
//   kongr45gpen
// The list of acceptable currencies that will be shown for the component's price. First is higher priority.
const currencies = {
    'EUR': '€',
    'USD': '$'
};

const apikey = process.env.HUBOT_OCTOPART_API_KEY;
if (apikey == null) {
    console.error("Missing HUBOT_OCTOPART_API_KEY in environment: please set and try again");
    process.exit(1);
}

module.exports = robot =>
    robot.respond(/datasheet (.*)/i, function(res) {
        const part = res.match[1].toLowerCase().replace(/^\s+|\s+$/g, ""); // trim/strip

        if ((robot.adapter !== undefined) && (robot.adapter.client !== undefined) && (robot.adapter.client.react !== undefined)) {
            // If the adapter supports it, add an hourglass reaction to the message, to show that the
            // request is begin processed
            robot.adapter.client.react(res.message.id, 'hourglass');
        }

        const query = {
            apikey,
            q: part,
            sortby: "score desc",
            include: ['datasheets']
        };

        const respond = function(body) {
            // Octopart sends the data as JSON. Parse it.
            let data = JSON.parse(body);
            robot.logger.debug(`Found ${data.hits} parts`);

            if (!data.results.length) {
                res.reply("No parts found for query");
                return;
            }

            // The first part that we received
            const {
                item
            } = data.results[0];

            // Make sure we return the most recent datasheet
            // FIXME: This could be made much faster
            const datasheets = item.datasheets.sort(function(a, b) {
                const a_metadata = a.metadata || {};
                const b_metadata = b.metadata || {};
                // We don't need to parse the dates, as they are provided in a sortable string format
                if (a_metadata.last_updated < b_metadata.last_updated) {
                    return +1;
                }
                if (a_metadata.last_updated > b_metadata.last_updated) {
                    return -1;
                }
                return 0;
            });

            if (!datasheets.length) {
                res.reply(`No datasheets found for ${item.mpn}`);
                return;
            }

            robot.logger.debug(`Most recent datasheet: ${(item.datasheets[0].metadata || {}).last_updated}`);

            // Set up the price calculation
            let price = undefined;
            let price_currency = undefined;

            // Calculate for every currency, so that the preferred currency shows up first
            for (let currency of Array.from(Object.keys(currencies))) {
                const arr = [];

                for (let offer of Array.from(item.offers)) {
                    // Do not list prices that may be too high or low from unauthorized resellers
                    if (!offer.is_authorized) {
                        continue;
                    }

                    if (offer.prices[currency] !== undefined) {
                        // Add the first (minimum order quantity) option
                        arr.push(parseFloat(Object.values(offer.prices[currency])[0][1]));
                    }
                }

                if (arr.length !== 0) {
                    // A price has been found!
                    // Sort the prices so that the median can be easily calculated
                    arr.sort();

                    // Calculate median
                    const half = parseInt(Math.floor(arr.length / 2.0));
                    price = arr.length % 2 ? arr[half] : (arr[half - 1] + arr[half]) / 2.0;

                    // Store the found currency so we can display the correct symbol later
                    price_currency = currency;
                    break;
                }
            }

            // Show nothing if no price has been found
            const price_string = (price === undefined) ? '' : ` (${price.toFixed(2)}${currencies[price_currency]})`;

            // String formatted in Markdown
            return res.reply(`${item.datasheets[0].__class__} for **${item.mpn}**${price_string}: ${item.datasheets[0].url}`);
        };

        return res.http("https://octopart.com/api/v3/parts/search")
            .header('Accept', 'application/json')
            .query(query)
            .get()(function(err, response, body) {
                if ((response.statusCode !== 200) || err) {
                    // Error handling
                    res.send(`Unable to request. ${err}`);
                    robot.logger.error(`An error occurred. [${response.statusCode}] ${err}`);
                    robot.logger.debug(body);
                } else {
                    // Successful response, parse it
                    respond(body);
                }

                // Remove the Searching... reaction
                if ((robot.adapter !== undefined) && (robot.adapter.client !== undefined) && (robot.adapter.client.unreact !== undefined)) {
                    return robot.adapter.client.unreact(res.message.id, 'hourglass');
                }
            });
    });