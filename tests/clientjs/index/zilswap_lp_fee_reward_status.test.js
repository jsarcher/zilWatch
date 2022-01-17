var indexJsdom = require('../../index.jsdom.js');
var fs = require('fs')
var $ = indexJsdom.$;

var assert = require('assert');
var ZilswapDexStatus = require('../../../clientjs/index/zilswap_dex_status.js');
var XcadDexStatus = require('../../../clientjs/index/xcad_dex_status.js');
var AggregateDexTradeVolumeStatus = require('../../../clientjs/index/aggregate_dex_trade_volume_status.js');
var ZilswapLpFeeRewardStatus = require('../../../clientjs/index/zilswap_lp_fee_reward_status.js');
var Constants = require('../../../constants.js');

describe('ZilswapLpFeeRewardStatus', function () {

    beforeEach(function (done) {
        indexJsdom.resetHtmlView(done);
    });

    describe('#constructor()', function () {

        it('create empty object', function () {
            let zilswapLpFeeRewardStatus = new ZilswapLpFeeRewardStatus.ZilswapLpFeeRewardStatus(Constants.zrcTokenPropertiesListMap, /* dexNameToStatusMap= */ null, /* aggregateDexTradeVolumeStatus= */ null);

            assert.strictEqual(zilswapLpFeeRewardStatus.zrcTokenPropertiesListMap_, Constants.zrcTokenPropertiesListMap);
            assert.strictEqual(zilswapLpFeeRewardStatus.dexNameToStatusMap_, null);
            assert.strictEqual(zilswapLpFeeRewardStatus.aggregateDexTradeVolumeStatus_, null);
            assert.deepStrictEqual(zilswapLpFeeRewardStatus.coinToFeeRewardMap_, {});
        });
    });

    describe('#method()', function () {
        var expectedEarnedFeeMap = {
            'CARB': {
                'xcaddex': 0.04113789095924563,
                'zilswap': 0.4502438847365122
            },
            'dXCAD': {
                'xcaddex': 0.11607016724709818
            },
            'PORT': {
                'xcaddex': 0.34006357140926446
            },
            'REDC': {
                'zilswap': 0.5175858905773656
            },
            'ZLP': {
                'zilswap': 0.006784245770583836
            },
            'ZWAP': {
                'zilswap': 0.012454121143659264
            }
        };

        var expectedEarnedFeeStringMap = {
            'CARB': {
                'xcaddex': '0.04114',
                'zilswap': '0.4502'
            },
            'dXCAD': {
                'xcaddex': '0.1161'
            },
            'PORT': {
                'xcaddex': '0.3401'
            },
            'REDC': {
                'zilswap': '0.5176'
            },
            'ZLP': {
                'zilswap': '0.006784'
            },
            'ZWAP': {
                'zilswap': '0.01245'
            }
        }

        let aggregateDexTradeVolumeData = JSON.parse(fs.readFileSync('./tests/testdata/zilwatch_aggregate_dex_trade_volume_20220116.txt', 'utf8'));
        let aggregateDexTradeVolumeStatus = new AggregateDexTradeVolumeStatus.AggregateDexTradeVolumeStatus(Constants.zrcTokenPropertiesListMap, /* coinPriceStatus= */ null, aggregateDexTradeVolumeData);

        let walletAddressBase16 = "0x278598f13A4cb142E44ddE38ABA8d8C0190bcB85".toLowerCase();
        let zilswapDexSmartContractStateData = JSON.parse(fs.readFileSync('./tests/testdata/zilswapdex_contractstate_20210602.txt', 'utf8'));
        let zilswapDexStatus = new ZilswapDexStatus.ZilswapDexStatus(Constants.zrcTokenPropertiesListMap, /* coinPriceStatus= */ null, /* xcadDexStatus= */ null, walletAddressBase16, zilswapDexSmartContractStateData, /* zilswapDexSmartContractStateData24hAgo= */ null);

        let xcadSmartContractStateData = JSON.parse(fs.readFileSync('./tests/testdata/xcaddex_contractstate_20220102.txt', 'utf8'));
        let xcadDexStatus = new XcadDexStatus.XcadDexStatus(Constants.zrcTokenPropertiesListMap, walletAddressBase16, xcadSmartContractStateData, /* xcadDexSmartContractState24hAgoData= */ null);

        let dexNameToStatusMap = {
            'zilswap': zilswapDexStatus,
            'xcaddex': xcadDexStatus,
        }
        let zilswapLpFeeRewardStatus;

        beforeEach(function () {
            for (let ticker in Constants.zrcTokenPropertiesListMap) {
                let length = Constants.zrcTokenPropertiesListMap[ticker].supported_dex.length;
                for (let i = 0; i < length; i++) {
                    let dexName = Constants.zrcTokenPropertiesListMap[ticker].supported_dex[i];
                    assert.strictEqual($('#' + dexName + '_' + ticker + '_lp_pool_fee_reward_zil_past_range_period').text(), "Loading...");
                }
            }
            zilswapLpFeeRewardStatus = new ZilswapLpFeeRewardStatus.ZilswapLpFeeRewardStatus(Constants.zrcTokenPropertiesListMap, dexNameToStatusMap, aggregateDexTradeVolumeStatus);
        });

        it('Data computed and binded', function () {

            assert.deepStrictEqual(zilswapLpFeeRewardStatus.coinToFeeRewardMap_, expectedEarnedFeeMap);

            for (let ticker in Constants.zrcTokenPropertiesListMap) {
                let length = Constants.zrcTokenPropertiesListMap[ticker].supported_dex.length;
                for (let i = 0; i < length; i++) {
                    let dexName = Constants.zrcTokenPropertiesListMap[ticker].supported_dex[i];
                    try {
                        // If value exists in the map, assert the value
                        assert.strictEqual($('#' + dexName + '_' + ticker + '_lp_pool_fee_reward_zil_past_range_period').text(), expectedEarnedFeeStringMap[ticker][dexName])
                    } catch (err) {
                        // If value doesn't exist, assert it's 0
                        assert.strictEqual($('#' + dexName + '_' + ticker + '_lp_pool_fee_reward_zil_past_range_period').text(), '0')
                    }
                }
            }
        });

        it('Reset, data and view cleared', function () {
            // Reset
            zilswapLpFeeRewardStatus.reset();

            // Assert Empty
            assert.deepStrictEqual(zilswapLpFeeRewardStatus.coinToFeeRewardMap_, {});
            for (let ticker in Constants.zrcTokenPropertiesListMap) {
                assert.strictEqual($('#zilswap_' + ticker + '_lp_pool_fee_reward_zil_past_range_period').text(), 'Loading...');
            }
        });

        it('Reset, onZilswapDexStatusChange, data computed and binded', function () {
            // Reset
            zilswapLpFeeRewardStatus.reset();

            // OnChange
            zilswapLpFeeRewardStatus.onZilswapDexStatusChange();

            // Assert
            assert.deepStrictEqual(zilswapLpFeeRewardStatus.coinToFeeRewardMap_, expectedEarnedFeeMap);
            for (let ticker in Constants.zrcTokenPropertiesListMap) {
                let length = Constants.zrcTokenPropertiesListMap[ticker].supported_dex.length;
                for (let i = 0; i < length; i++) {
                    let dexName = Constants.zrcTokenPropertiesListMap[ticker].supported_dex[i];
                    try {
                        // If value exists in the map, assert the value
                        assert.strictEqual($('#' + dexName + '_' + ticker + '_lp_pool_fee_reward_zil_past_range_period').text(), expectedEarnedFeeStringMap[ticker][dexName])
                    } catch (err) {
                        // If value doesn't exist, assert it's 0
                        assert.strictEqual($('#' + dexName + '_' + ticker + '_lp_pool_fee_reward_zil_past_range_period').text(), '0')
                    }
                }
            }
        });

        it('Reset, onAggregateDexTradeVolumeStatusChange, data computed and binded', function () {
            // Reset
            zilswapLpFeeRewardStatus.reset();

            // OnChange
            zilswapLpFeeRewardStatus.onAggregateDexTradeVolumeStatusChange();

            // Assert
            assert.deepStrictEqual(zilswapLpFeeRewardStatus.coinToFeeRewardMap_, expectedEarnedFeeMap);
            for (let ticker in Constants.zrcTokenPropertiesListMap) {
                let length = Constants.zrcTokenPropertiesListMap[ticker].supported_dex.length;
                for (let i = 0; i < length; i++) {
                    let dexName = Constants.zrcTokenPropertiesListMap[ticker].supported_dex[i];
                    try {
                        // If value exists in the map, assert the value
                        assert.strictEqual($('#' + dexName + '_' + ticker + '_lp_pool_fee_reward_zil_past_range_period').text(), expectedEarnedFeeStringMap[ticker][dexName])
                    } catch (err) {
                        // If value doesn't exist, assert it's 0
                        assert.strictEqual($('#' + dexName + '_' + ticker + '_lp_pool_fee_reward_zil_past_range_period').text(), '0')
                    }
                }
            }
        });
    });

    describe('bindViewPublic', function () {
        let zilswapLpFeeRewardStatus = new ZilswapLpFeeRewardStatus.ZilswapLpFeeRewardStatus(Constants.zrcTokenPropertiesListMap, /* dexNameToStatusMap= */ null, /* aggregateDexTradeVolumeStatus= */ null);

        describe('#bindViewLpFeeReward()', function () {

            beforeEach(function () {
                for (let ticker in Constants.zrcTokenPropertiesListMap) {
                    assert.strictEqual($('#zilswap_' + ticker + '_lp_pool_fee_reward_zil_past_range_period').text(), 'Loading...');
                }
            });

            it('bind view happy case', function () {
                for (let ticker in Constants.zrcTokenPropertiesListMap) {

                    let length = Constants.zrcTokenPropertiesListMap[ticker].supported_dex.length;
                    for (let i = 0; i < length; i++) {
                        let dexName = Constants.zrcTokenPropertiesListMap[ticker].supported_dex[i];
                        // Act
                        zilswapLpFeeRewardStatus.bindViewLpFeeReward('1234.4', ticker, dexName);

                        // Assert
                        assert.strictEqual($('#' + dexName + '_' + ticker + '_lp_pool_fee_reward_zil_past_range_period').text(), '1234.4');
                    }
                }
            });

            it('bind view random string', function () {
                for (let ticker in Constants.zrcTokenPropertiesListMap) {
                    let length = Constants.zrcTokenPropertiesListMap[ticker].supported_dex.length;
                    for (let i = 0; i < length; i++) {
                        let dexName = Constants.zrcTokenPropertiesListMap[ticker].supported_dex[i];
                        // Act
                        zilswapLpFeeRewardStatus.bindViewLpFeeReward('asdf', ticker, dexName);

                        // Assert
                        assert.strictEqual($('#' + dexName + '_' + ticker + '_lp_pool_fee_reward_zil_past_range_period').text(), 'asdf');
                    }
                }
            });
        });
    });
});