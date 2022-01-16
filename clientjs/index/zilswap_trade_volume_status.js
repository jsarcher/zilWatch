/**
 * A class to represent Zilswap DEX trade volume status. 
 * WARNING: This now represents aggregated volume from all dexes. We need to change the Zilswap name into something generic.
 */
class ZilswapTradeVolumeStatus {

    constructor(zrcTokenPropertiesListMap, /* nullable= */ coinPriceStatus, /* nullable= */ aggregateDexTradeVolumeData) {
        // Private variable
        this.zrcTokenPropertiesListMap_ = zrcTokenPropertiesListMap; // Refer to constants.js for definition
        this.coinPriceStatus_ = coinPriceStatus;
        this.aggregateDexTradeVolumeData_ = aggregateDexTradeVolumeData;

        this.bindView24hTradeVolumeFiat();
    }

    /**
     * Callback method to be executed if any properties in coinPriceStatus_ is changed.
     */
    onCoinPriceStatusChange() {
        this.bindView24hTradeVolumeFiat();
    }

    getTradeVolumeAllDexInZil(coinSymbol, timeRange) {
        try {
            let totalVolumeInZil = 0.0;
            for (let dexName in this.aggregateDexTradeVolumeData_[timeRange][coinSymbol]) {
                totalVolumeInZil += parseFloat(this.aggregateDexTradeVolumeData_[timeRange][coinSymbol][dexName]);
            }
            return totalVolumeInZil;
        } catch (err) {
            // Do nothing
        }
        return null;
    }

    getTradeVolumeInZil(coinSymbol, timeRange, dexName) {
        try {
            return parseFloat(this.aggregateDexTradeVolumeData_[timeRange][coinSymbol][dexName]);
        } catch (err) {
            // Do nothing
        }
        return null;
    }

    bindView24hTradeVolumeFiat() {
        if (!this.coinPriceStatus_) {
            return;
        }
        let zilPriceInFiatFloat = this.coinPriceStatus_.getCoinPriceFiat('ZIL');
        if (!zilPriceInFiatFloat) {
            return;
        }

        for (let ticker in this.zrcTokenPropertiesListMap_) {
            let tradeVolumeInZil = this.getTradeVolumeAllDexInZil(ticker, '24h');
            if (!tradeVolumeInZil) {
                continue;
            }

            let totalVolumeFiat = (1.0 * zilPriceInFiatFloat * tradeVolumeInZil);
            let totalVolumeFiatString = commafyNumberToString(totalVolumeFiat, /* decimals= */ 0);
            this.bindView24hVolumeFiat(totalVolumeFiatString, ticker);
        }
    }

    computeDataRpcIfDataNoExist(beforeRpcCallback, onSuccessCallback, onErrorCallback) {
        if (this.aggregateDexTradeVolumeData_) {
            beforeRpcCallback();
            this.bindView24hTradeVolumeFiat();
            onSuccessCallback();
        }
        this.computeDataRpc(beforeRpcCallback, onSuccessCallback, onErrorCallback);
    }

    computeDataRpc(beforeRpcCallback, onSuccessCallback, onErrorCallback) {

        beforeRpcCallback();
        let self = this;
        queryUrlGetAjax(
            /* urlToGet= */
            CONST_ZILWATCH_ROOT_URL + "/api/volume" + "?requester=zilwatch_dashboard",
            /* successCallback= */
            function (data) {
                if (!data) {
                    onErrorCallback();
                    return;
                }
                self.aggregateDexTradeVolumeData_ = data;
                self.bindView24hTradeVolumeFiat();
                onSuccessCallback();
            },
            /* errorCallback= */
            function () {
                onErrorCallback();
            });
    }

    // Exception, no need reset
    bindView24hVolumeFiat(totalVolumeFiat, ticker) {
        $('#' + ticker + '_lp_past_range_volume_fiat').text(totalVolumeFiat);
    }
}

if (typeof exports !== 'undefined') {
    if (typeof convertNumberQaToDecimalString === 'undefined') {
        FormattingUtils = require('./formatting_utils.js');
        convertNumberQaToDecimalString = FormattingUtils.convertNumberQaToDecimalString;
        commafyNumberToString = FormattingUtils.commafyNumberToString;
    }
    if (typeof $ === 'undefined') {
        $ = global.jQuery = require('jquery');
    }
    exports.ZilswapTradeVolumeStatus = ZilswapTradeVolumeStatus;
}