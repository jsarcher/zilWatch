var indexJsdom = require('../../index.jsdom.js');
var fs = require('fs')
var $ = indexJsdom.$;

var assert = require('assert');
var CoinPriceStatus = require('../../../clientjs/index/coin_price_status.js');
var AggregateDexTradeVolumeStatus = require('../../../clientjs/index/aggregate_dex_trade_volume_status.js');
var Constants = require('../../../constants.js');

describe('AggregateDexTradeVolumeStatus', function () {

    describe('#constructor()', function () {

        it('create empty object', function () {
            let aggregateDexTradeVolumeStatus = new AggregateDexTradeVolumeStatus.AggregateDexTradeVolumeStatus(Constants.zrcTokenPropertiesListMap, /* coinPriceStatus= */ null, /* aggregateDexTradeVolumeData= */ null);

            assert.strictEqual(aggregateDexTradeVolumeStatus.zrcTokenPropertiesListMap_, Constants.zrcTokenPropertiesListMap);
            assert.strictEqual(aggregateDexTradeVolumeStatus.coinPriceStatus_, null);
            assert.strictEqual(aggregateDexTradeVolumeStatus.aggregateDexTradeVolumeData_, null);
        });

        it('create proper object', function () {
            let coinPriceCoingeckoData = JSON.parse('{"zilliqa":{"usd":0.11819,"idr":1612}}');
            let coinPriceCoingecko24hAgoData = JSON.parse('{"zilliqa":{"usd":0.10519,"idr":1498}}');
            let coinPriceStatus = new CoinPriceStatus.CoinPriceStatus(Constants.coinMap, Constants.currencyMap, /* activeCurrencyCode= */ 'usd', coinPriceCoingeckoData, coinPriceCoingecko24hAgoData);

            let aggregateDexTradeVolumeData = JSON.parse(fs.readFileSync('./tests/testdata/zilwatch_aggregate_dex_trade_volume_20220116.txt', 'utf8'));

            let aggregateDexTradeVolumeStatus = new AggregateDexTradeVolumeStatus.AggregateDexTradeVolumeStatus(Constants.zrcTokenPropertiesListMap, coinPriceStatus, aggregateDexTradeVolumeData);

            assert.strictEqual(aggregateDexTradeVolumeStatus.zrcTokenPropertiesListMap_, Constants.zrcTokenPropertiesListMap);
            assert.strictEqual(aggregateDexTradeVolumeStatus.coinPriceStatus_, coinPriceStatus);
            assert.deepStrictEqual(aggregateDexTradeVolumeStatus.aggregateDexTradeVolumeData_, aggregateDexTradeVolumeData);
        });
    });

    describe('#methods()', function () {

        let expectedTotalVolumeFiatUsdMap = {
            'ATHLETE': '1',
            'BLOX': '30,392',
            'BOLT': '267',
            'BUTTON': '7',
            'CARB': '172,194',
            'DMZ': '451,217',
            'DUCK': '23,862',
            'dXCAD': '937,535',
            'FEES': '568,630',
            'FRANC': '12',
            'GARY': '19,630',
            'GEMZ': '6,490',
            'gZIL': '253,208',
            'HODL': '1',
            'LUNR': '80,673',
            'MAMBO': '298',
            'OKI': '44,676',
            'PORT': '538,089',
            'PELE': '7,533',
            'PIL': '2',
            'RECAP': '1,220',
            'REDC': '90,712',
            'SCO': '66,082',
            'SHARDS': '67',
            'SPW': '67,496',
            'SRV': '1',
            'STREAM': '22,977',
            'SWTH': '61,877',
            'UNIDEX-V2': '51',
            'XCAD': '5,756,869',
            'XIDR': '12,830',
            'XSGD': '214,083',
            'YODA': '4',
            'ZAME': '176',
            'zBRKL': '278,827',
            'ZCH': '14',
            'zETH': '360,100',
            'ZLP': '3,005',
            'ZPAINT': '247',
            'zUSDT': '1,345,197',
            'ZWALL': '7,363',
            'ZWAP': '91,944',
            'zWBTC': '297,141',
            'ZYRO': '1,236',
        };

        let expectedTotalVolumeFiatIdrMap = {
            'ATHLETE': '12,874',
            'BLOX': '414,515,821',
            'BOLT': '3,647,838',
            'BUTTON': '92,347',
            'CARB': '2,348,570,165',
            'CONSULT': '1,655',
            'DMZ': '6,154,173,596',
            'DUCK': '325,455,359',
            'dXCAD': '12,787,093,743',
            'FEES': '7,755,579,989',
            'FRANC': '161,200',
            'GARY': '267,739,656',
            'GEMZ': '88,514,241',
            'gZIL': '3,453,515,075',
            'HODL': '15,235',
            'LUNR': '1,100,309,806',
            'MAMBO': '4,070,219',
            'OKI': '609,333,608',
            'PORT': '7,339,024,636',
            'PELE': '102,736,334',
            'PIL': '33,250',
            'RECAP': '16,641,156',
            'REDC': '1,237,221,096',
            'SCO': '901,291,677',
            'SHARDS': '908,828',
            'SPW': '920,581,319',
            'SRV': '13,360',
            'STREAM': '313,383,065',
            'SWTH': '843,943,522',
            'UNIDEX-V2': '690,414',
            'XCAD': '78,518,259,894',
            'XIDR': '174,986,515',
            'XSGD': '2,919,893,850',
            'YODA': '50,469',
            'ZAME': '2,403,299',
            'zBRKL': '3,802,936,669',
            'ZCH': '193,440',
            'zETH': '4,911,419,901',
            'ZLP': '40,982,174',
            'ZPAINT': '3,372,629',
            'zUSDT': '18,347,211,405',
            'ZWALL': '100,418,393',
            'ZWAP': '1,254,036,053',
            'zWBTC': '4,052,716,752',
            'ZYRO': '16,860,426',
        };

        // If token not in the list, i.e., new token, we add default value into the list
        for (let ticker in Constants.zrcTokenPropertiesListMap) {
            if (!(ticker in expectedTotalVolumeFiatUsdMap)) {
                expectedTotalVolumeFiatUsdMap[ticker] = '0';
            }
            if (!(ticker in expectedTotalVolumeFiatIdrMap)) {
                expectedTotalVolumeFiatIdrMap[ticker] = '0';
            }
        }


        // if ($('#' + ticker + '_lp_past_range_volume_fiat').text() !== '0') {
        //     console.log("'" + ticker + "':'" + $('#' + ticker + '_lp_past_range_volume_fiat').text() + "',");
        // }
        it('set proper object. computed and binded to view.', function () {
            let coinPriceCoingeckoData = JSON.parse('{"zilliqa":{"usd":0.11819,"idr":1612}}');
            let coinPriceCoingecko24hAgoData = JSON.parse('{"zilliqa":{"usd":0.10519,"idr":1498}}');
            let coinPriceStatus = new CoinPriceStatus.CoinPriceStatus(Constants.coinMap, Constants.currencyMap, /* activeCurrencyCode= */ 'usd', coinPriceCoingeckoData, coinPriceCoingecko24hAgoData);

            let aggregateDexTradeVolumeData = JSON.parse(fs.readFileSync('./tests/testdata/zilwatch_aggregate_dex_trade_volume_20220116.txt', 'utf8'));

            let aggregateDexTradeVolumeStatus = new AggregateDexTradeVolumeStatus.AggregateDexTradeVolumeStatus(Constants.zrcTokenPropertiesListMap, coinPriceStatus, aggregateDexTradeVolumeData);

            // Assert
            assert.deepStrictEqual(aggregateDexTradeVolumeStatus.aggregateDexTradeVolumeData_, aggregateDexTradeVolumeData);
            for (let ticker in Constants.zrcTokenPropertiesListMap) {
                assert.strictEqual($('#' + ticker + '_lp_past_range_volume_fiat').text(), expectedTotalVolumeFiatUsdMap[ticker]);
            }

            // Change to IDR
            coinPriceStatus.setActiveCurrencyCode('idr');
            aggregateDexTradeVolumeStatus.onCoinPriceStatusChange();

            for (let ticker in Constants.zrcTokenPropertiesListMap) {
                assert.strictEqual($('#' + ticker + '_lp_past_range_volume_fiat').text(), expectedTotalVolumeFiatIdrMap[ticker]);
            }
        });

        it('set proper object. multi-dex value supported.', function () {
            let coinPriceCoingeckoData = JSON.parse('{"zilliqa":{"usd":0.11819,"idr":1612}}');
            let coinPriceCoingecko24hAgoData = JSON.parse('{"zilliqa":{"usd":0.10519,"idr":1498}}');
            let coinPriceStatus = new CoinPriceStatus.CoinPriceStatus(Constants.coinMap, Constants.currencyMap, /* activeCurrencyCode= */ 'usd', coinPriceCoingeckoData, coinPriceCoingecko24hAgoData);

            let aggregateDexTradeVolumeData = JSON.parse(fs.readFileSync('./tests/testdata/zilwatch_aggregate_dex_trade_volume_20220116.txt', 'utf8'));

            let aggregateDexTradeVolumeStatus = new AggregateDexTradeVolumeStatus.AggregateDexTradeVolumeStatus(Constants.zrcTokenPropertiesListMap, coinPriceStatus, aggregateDexTradeVolumeData);

            let gzilZilswapTradeVolumeInZil = aggregateDexTradeVolumeStatus.getTradeVolumeInZil('gZIL', '24h', 'zilswap');
            let gzilXcadTradeVolumeInZil = aggregateDexTradeVolumeStatus.getTradeVolumeInZil('gZIL', '24h', 'xcaddex');

            let gzilAllDexTradeVolumeInZil = gzilZilswapTradeVolumeInZil + gzilXcadTradeVolumeInZil;
            let gzilAllDexTradeVolumeInFiat = gzilAllDexTradeVolumeInZil * 0.11819;

            // Assert
            assert.strictEqual(gzilZilswapTradeVolumeInZil, 1460487.5536335502);
            assert.strictEqual(gzilXcadTradeVolumeInZil, 681891.5250238057);

            assert.strictEqual(gzilAllDexTradeVolumeInFiat.toFixed(0), expectedTotalVolumeFiatUsdMap['gZIL'].replace(',',''));
        });
    });

    describe('bindViewPublic', function () {
        var aggregateDexTradeVolumeStatus;

        beforeEach(function (done) {
            indexJsdom.resetHtmlView(done);
            aggregateDexTradeVolumeStatus = new AggregateDexTradeVolumeStatus.AggregateDexTradeVolumeStatus(Constants.zrcTokenPropertiesListMap, /* coinPriceStatus= */ null, /* aggregateDexTradeVolumeData= */ null);
        });

        describe('#bindView24hVolumeFiat()', function () {

            beforeEach(function () {
                for (let ticker in Constants.zrcTokenPropertiesListMap) {
                    assert.strictEqual($('#' + ticker + '_lp_past_range_volume_fiat').text(), '0');
                }
            });

            it('bind view happy case', function () {
                for (let ticker in Constants.zrcTokenPropertiesListMap) {
                    // Act
                    aggregateDexTradeVolumeStatus.bindView24hVolumeFiat('1234.4', ticker);

                    // Assert
                    assert.strictEqual($('#' + ticker + '_lp_past_range_volume_fiat').text(), '1234.4');
                }
            });

            it('bind view random string', function () {
                for (let ticker in Constants.zrcTokenPropertiesListMap) {
                    // Act
                    aggregateDexTradeVolumeStatus.bindView24hVolumeFiat('asdf', ticker);

                    // Assert
                    assert.strictEqual($('#' + ticker + '_lp_past_range_volume_fiat').text(), 'asdf');
                }
            });
        });
    });
});