var constants = require('../constants.js');
var redisClient = require('../libraries/redis_client.js');
var visitor = require('../libraries/universal_analytics_client.js');

var express = require('express');
var router = express.Router();

/* GET api for token price low-high with a given range (e.g., 24h). */
router.get('/lowhigh', function (req, res, next) {
  visitor.pageview("/api/tokenprice" + req.url, "https://zilwatch.io", "Token Price API").send();

  let dexName = req.query.dex_name;
  let dexBaseTokenSymbol = req.query.dex_base_token_symbol;
  let queryRange = req.query.range;
  if (!dexName || !dexBaseTokenSymbol || !queryRange) {
    res.send("Unsupported query parameters!");
    return;
  }
  dexName = dexName.toLowerCase();
  dexBaseTokenSymbol = dexBaseTokenSymbol.toLowerCase();

  let redis_key_low = dexName + "_dex_zrc_tokens_price_in_" + dexBaseTokenSymbol + "_" + queryRange + "_low";
  let redis_key_high = dexName + "_dex_zrc_tokens_price_in_" + dexBaseTokenSymbol + "_" + queryRange + "_high";

  redisClient.mget(
    [
      redis_key_low,
      redis_key_high,
    ],
    function (err, reply) {
      let data_low = null
      let data_high = null;
      if (!err && reply) {
        try {
          if (reply[0]) {
            data_low = JSON.parse(reply[0]);
          }
          if (reply[1]) {
            data_high = JSON.parse(reply[1]);
          }
        } catch (ex) {
          console.log(ex);
        }
      }
      if (!data_high || !data_low) {
        res.send("Data not available!");
        return;
      }
      let dataObject = {
        'range': queryRange,
        'low': data_low,
        'high': data_high,
      };
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(dataObject));
    });
});

/* GET api for individual token price, directly queried from redis. */
router.get('/', function (req, res, next) {
  visitor.pageview("/api/tokenprice" + req.url, "https://zilwatch.io", "Token Price API").send();

  let dexName = req.query.dex_name;
  let dexBaseTokenSymbol = req.query.dex_base_token_symbol;
  let tokenSymbol = req.query.token_symbol;
  let queryRange = req.query.range;
  if (!dexName || !dexBaseTokenSymbol || !tokenSymbol || !queryRange) {
    res.send("Unsupported query parameters!");
    return;
  }
  dexName = dexName.toLowerCase();
  dexBaseTokenSymbol = dexBaseTokenSymbol.toLowerCase();

  let redis_key = dexName + "_dex_zrc_tokens_price_in_" + dexBaseTokenSymbol + "_" + queryRange + "_" + tokenSymbol;
  let redis_key_low = dexName + "_dex_zrc_tokens_price_in_" + dexBaseTokenSymbol + "_" + queryRange + "_low";
  let redis_key_high = dexName + "_dex_zrc_tokens_price_in_" + dexBaseTokenSymbol + "_" + queryRange + "_high";
  let redis_key_atl = dexName + "_dex_zrc_tokens_price_in_" + dexBaseTokenSymbol + "_all_time_low";
  let redis_key_ath = dexName + "_dex_zrc_tokens_price_in_" + dexBaseTokenSymbol + "_all_time_high";
  let redis_key_zilswap_dex_zrc_tokens_price_in_zil = dexName + "_dex_zrc_tokens_price_in_" + dexBaseTokenSymbol;

  redisClient.mget(
    [redis_key,
      redis_key_low,
      redis_key_high,
      redis_key_atl,
      redis_key_ath,
      redis_key_zilswap_dex_zrc_tokens_price_in_zil,
    ],
    function (err, reply) {
      let data_arr = null;
      let data_low = null;
      let data_high = null;
      let data_atl = null;
      let data_ath = null;
      if (!err && reply) {
        try {
          if (reply[1]) {
            curr_data_low = JSON.parse(reply[1]);
            if (tokenSymbol in curr_data_low) {
              data_low = curr_data_low[tokenSymbol];
            }
          }
          if (reply[2]) {
            curr_data_high = JSON.parse(reply[2]);
            if (tokenSymbol in curr_data_high) {
              data_high = curr_data_high[tokenSymbol];
            }
          }
          if (reply[3]) {
            curr_data_atl = JSON.parse(reply[3]);
            if (tokenSymbol in curr_data_atl) {
              data_atl = curr_data_atl[tokenSymbol];
            }
          }
          if (reply[4]) {
            curr_data_ath = JSON.parse(reply[4]);
            if (tokenSymbol in curr_data_ath) {
              data_ath = curr_data_ath[tokenSymbol];
            }
          }
          if (reply[0]) {
            data_arr = JSON.parse(reply[0]);

            // Only need to get current price (i.e., reply[5]), if there is historical data, else, do nothing.
            if (reply[5]) {
              zrc_price_in_zil = JSON.parse(reply[5]);
              // Add the current (latest) price to the back of the historical price
              // to show most up to date data point
              if (tokenSymbol in zrc_price_in_zil) {
                let currentDate = new Date();
                let currentTimeSeconds = Math.round(currentDate.getTime() / 1000);
                data_arr.push({
                  'time': currentTimeSeconds,
                  'value': zrc_price_in_zil[tokenSymbol],
                });
              }
            }
          }
        } catch (ex) {
          console.log(ex);
        }
      }
      if (!data_arr) {
        console.log("[%s] Price chart data not available: %s: %s: %s", tokenSymbol, dexName, dexBaseTokenSymbol, queryRange);
        res.send("Data not available!");
        return;
      }
      let dataObject = {
        'ticker': tokenSymbol,
        'range': queryRange,
        'low': data_low,
        'high': data_high,
        'all_time_low': data_atl,
        'all_time_high': data_ath,
        'data': data_arr,
      };
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(dataObject));
    });
});


/* GET api for 24h simple all token price, directly queried from redis. */
router.get('/24h_simple_all_tokens', function (req, res, next) {
  visitor.pageview("/api/tokenprice" + req.url, "https://zilwatch.io", "Token Price API").send();

  let dexName = req.query.dex_name;
  let dexBaseTokenSymbol = req.query.dex_base_token_symbol;
  if (!dexName || !dexBaseTokenSymbol) {
    res.send("Unsupported query parameters!");
    return;
  }
  dexName = dexName.toLowerCase();
  dexBaseTokenSymbol = dexBaseTokenSymbol.toLowerCase();

  let redis_key_zilswap_dex_zrc_tokens_price_in_zil = dexName + "_dex_zrc_tokens_price_in_" + dexBaseTokenSymbol;

  // First entry is the current (latest) ZRC token price
  let redis_key_arr = [redis_key_zilswap_dex_zrc_tokens_price_in_zil];
  let next_idx = 1;
  let ticker_to_index_map = {}

  for (let ticker in constants.zrcTokenPropertiesListMap) {
    ticker_to_index_map[ticker] = next_idx;
    redis_key_arr.push(dexName + "_dex_zrc_tokens_price_in_" + dexBaseTokenSymbol + "_24h_simple_" + ticker);
    next_idx++;
  }

  redisClient.mget(
    redis_key_arr,
    function (err, reply) {
      // Final result map
      let result_ticker_to_data_map = {};

      // Get the first entry, current (latest) zrc price in zil
      let zrc_price_in_zil = {};

      if (!err && reply) {
        try {
          if (reply[0]) {
            zrc_price_in_zil = JSON.parse(reply[0]);
          }
        } catch (ex) {
          console.log(ex);
        }

        let currentDate = new Date();
        let currentTimeSeconds = Math.round(currentDate.getTime() / 1000);
        for (let ticker in ticker_to_index_map) {
          try {
            let data_arr = null;
            let curr_idx = ticker_to_index_map[ticker];
            if (reply[curr_idx]) {
              data_arr = JSON.parse(reply[curr_idx]);
            }
            if (ticker in zrc_price_in_zil) {
              data_arr.push({
                'time': currentTimeSeconds,
                'value': zrc_price_in_zil[ticker],
              });
            }
            result_ticker_to_data_map[ticker] = data_arr;
          } catch (ex) {
            console.log(ex);
          }
        }
      }
      if (result_ticker_to_data_map.length <= 0) {
        console.log("Simple token price data not available: %s: %s", dexName, dexBaseTokenSymbol);
        res.send("Data not available!");
        return;
      }
      let dataObject = {
        'range': '24h_simple',
        'data': result_ticker_to_data_map,
      };
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(dataObject));
    });
});

module.exports = router;