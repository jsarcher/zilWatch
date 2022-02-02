var constants = require('../constants.js');
var express = require('express');
var router = express.Router();

/* GET nft_explorer. */
router.get('/', function(req, res, next) {
    res.render('nft-explorer', {
        title: 'zilWatch - NFT Explorer',
        description: 'Explore NFTs in Zilliqa blockchain.',
        currencyMap: constants.currencyMap,
        nftTokenPropertiesListMap: constants.nftTokenPropertiesListMap,
      });
});

module.exports = router;
