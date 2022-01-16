/** 
 * A class to represent Zilswap LP fee as reward status.
 * WARNING: This now represents fees from all dexes. We need to change the Zilswap name into something generic.
 */
class ZilswapLpFeeRewardStatus {

    constructor(zrcTokenPropertiesListMap, /* nullable= */ dexNameToStatusMap, /* nullable= */ zilswapTradeVolumeStatus) {
        // Private variable
        this.zrcTokenPropertiesListMap_ = zrcTokenPropertiesListMap; // Refer to constants.js for definition
        this.dexNameToStatusMap_ = dexNameToStatusMap;
        this.zilswapTradeVolumeStatus_ = zilswapTradeVolumeStatus;

        // private variable
        this.coinToFeeRewardMap_ = {};

        if (this.computeCoinToFeeRewardMap()) {
            this.bindViewAllLpFeeReward();
        }
    }

    onZilswapDexStatusChange() {
        if (this.computeCoinToFeeRewardMap()) {
            this.bindViewAllLpFeeReward();
        }
    }

    onZilswapTradeVolumeStatusChange() {
        if (this.computeCoinToFeeRewardMap()) {
            this.bindViewAllLpFeeReward();
        }
    }

    reset() {
        this.coinToFeeRewardMap_ = {};
        this.resetView();
    }

    getLpFeeRewardInZil(zrcSymbol, dexName) {
        try {
            return this.coinToFeeRewardMap_[zrcSymbol][dexName];
        } catch (err) {
            // Do nothing
        }
        return null;
    }

    /** Returns true if there is some data processed, false otherwise. */
    computeCoinToFeeRewardMap() {
        if (!this.dexNameToStatusMap_) {
            return false;
        }
        if (!this.zilswapTradeVolumeStatus_) {
            return false;
        }

        let isProcessed = false;
        for (let ticker in this.zrcTokenPropertiesListMap_) {

            let supported_dex_length = this.zrcTokenPropertiesListMap_[ticker].supported_dex.length
            for (let i = 0; i < supported_dex_length; i++) {
                let dexName = this.zrcTokenPropertiesListMap_[ticker].supported_dex[i];
                if (!(dexName in this.dexNameToStatusMap_)) {
                    continue;
                }

                let dexPairPersonalStatus = this.dexNameToStatusMap_[dexName].getDexPairPersonalStatus(ticker);
                if (!dexPairPersonalStatus) {
                    continue;
                }
                let shareRatio = dexPairPersonalStatus.shareRatio;
                if (!shareRatio) {
                    continue;
                }
                let tradeVolume24hInZil = this.zilswapTradeVolumeStatus_.getTradeVolumeInZil(ticker, '24h', dexName);
                if (!tradeVolume24hInZil) {
                    continue;
                }
                let lpFeeInZil = 0.003 * shareRatio * tradeVolume24hInZil;

                if (!(ticker in this.coinToFeeRewardMap_)) {
                    this.coinToFeeRewardMap_[ticker] = {};
                }
                this.coinToFeeRewardMap_[ticker][dexName] = lpFeeInZil;

                isProcessed = true;
            }
        }
        return isProcessed;
    }

    bindViewAllLpFeeReward() {
        for (let ticker in this.zrcTokenPropertiesListMap_) {
            let supported_dex_length = this.zrcTokenPropertiesListMap_[ticker].supported_dex.length
            for (let i = 0; i < supported_dex_length; i++) {
                let dexName = this.zrcTokenPropertiesListMap_[ticker].supported_dex[i];

                let currLpFeeReward = this.getLpFeeRewardInZil(ticker, dexName);

                if (!currLpFeeReward) {
                    this.bindViewLpFeeReward('0', ticker, dexName);
                    continue;
                }
                let currLpFeeRewardString = convertNumberQaToDecimalString(currLpFeeReward, /* decimals= */ 0);
                this.bindViewLpFeeReward(currLpFeeRewardString, ticker, dexName);
            }
        }
    }

    bindViewLpFeeReward(currLpFeeRewardString, ticker, dexName) {
        $('#' + dexName + '_' + ticker + '_lp_pool_fee_reward_zil_past_range_period').text(currLpFeeRewardString);
    }

    resetView() {
        for (let ticker in this.zrcTokenPropertiesListMap_) {
            let length = this.zrcTokenPropertiesListMap_[ticker].supported_dex.length;
            for (let i = 0; i < length; i++) {
                let dexName = this.zrcTokenPropertiesListMap_[ticker].supported_dex[i];
                $('#' + dexName + '_' + ticker + '_lp_pool_fee_reward_zil_past_range_period').text('Loading...');
            }
        }
    }
}

if (typeof exports !== 'undefined') {
    if (typeof convertNumberQaToDecimalString === 'undefined') {
        FormattingUtils = require('./formatting_utils.js');
        convertNumberQaToDecimalString = FormattingUtils.convertNumberQaToDecimalString;
    }
    if (typeof $ === 'undefined') {
        $ = global.jQuery = require('jquery');
    }
    exports.ZilswapLpFeeRewardStatus = ZilswapLpFeeRewardStatus;
}