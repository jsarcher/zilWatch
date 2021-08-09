/** A class to represent Zilswap Zrc token price 24h low and high.  */
class ZilswapZrcPrice24hLowHighStatus {

    constructor(zrcTokenPropertiesListMap, /* nullable= */ zilswapDexStatus, /* nullable= */ zrcTokenPrice24hLowData, /* nullable= */ zrcTokenPrice24hHighData) {
        // Private variable
        this.zrcTokenPropertiesListMap_ = zrcTokenPropertiesListMap; // Refer to constants.js for definition
        this.zilswapDexStatus_ = zilswapDexStatus;

        // Private variable
        this.zrcTokenPrice24hLowMap_ = {};
        if (zrcTokenPrice24hLowData) {
            this.zrcTokenPrice24hLowMap_ = zrcTokenPrice24hLowData;
        }
        this.zrcTokenPrice24hHighMap_ = {};
        if (zrcTokenPrice24hHighData) {
            this.zrcTokenPrice24hHighMap_ = zrcTokenPrice24hHighData;
        }

        this.bindViewZrcPrice24hLowHigh();
    }

    /**
     * Callback method to be executed if any properties in zilswapDexStatus_ is changed.
     */
    onZilswapDexStatusChange() {
        this.bindViewZrcPrice24hLowHigh();
    }

    bindViewZrcPrice24hLowHigh() {
        for (let ticker in this.zrcTokenPropertiesListMap_) {
            let zrcPrice24hLow = parseFloat(this.zrcTokenPrice24hLowMap_[ticker]);
            let zrcPrice24hHigh = parseFloat(this.zrcTokenPrice24hHighMap_[ticker]);
            if (zrcPrice24hLow && zrcPrice24hHigh) {
                // Set 24h low text
                let zrcTokenPrice24hLowString = commafyNumberToString(zrcPrice24hLow, /* decimals= */ 2);
                this.bindViewZrcPrice24hLow(zrcTokenPrice24hLowString, ticker);

                // Set 24h high text
                let zrcTokenPrice24hHighString = commafyNumberToString(zrcPrice24hHigh, /* decimals= */ 2);
                this.bindViewZrcPrice24hHigh(zrcTokenPrice24hHighString, ticker);

                // Set progress bar based on current price
                if (!this.zilswapDexStatus_) {
                    continue;
                }
                let zrcTokenPriceInZil = this.zilswapDexStatus_.getZrcPriceInZil(ticker);
                if (!zrcTokenPriceInZil) {
                    continue
                }

                let normalizedCurrentPrice = zrcTokenPriceInZil - zrcPrice24hLow;
                if (normalizedCurrentPrice < 0) {
                    normalizedCurrentPrice = 0;
                }
                let normalizedMaxPrice = zrcPrice24hHigh - zrcPrice24hLow;
                if (normalizedCurrentPrice > normalizedMaxPrice) {
                    normalizedCurrentPrice = normalizedMaxPrice;
                }

                let currentPricePercent = 100.0 * normalizedCurrentPrice / normalizedMaxPrice;

                // Special case, if there is no price change, set progress as 50%
                if (zrcPrice24hHigh === zrcPrice24hLow) {
                    currentPricePercent = 50.0;
                }
                this.bindViewZrcPriceProgress24hPercent(currentPricePercent, ticker);
            }
        }
    }

    computeDataRpcIfDataNoExist(beforeRpcCallback, onSuccessCallback, onErrorCallback) {
        // Checking for gZIL is the indicator if the map is already loaded
        if (this.zrcTokenPrice24hLowMap_['gZIL'] && this.zrcTokenPrice24hHighMap_['gZIL']) {
            beforeRpcCallback();
            this.bindViewZrcPrice24hLowHigh();
            onSuccessCallback();
            return;
        }
        this.computeDataRpc(beforeRpcCallback, onSuccessCallback, onErrorCallback);
    }

    computeDataRpc(beforeRpcCallback, onSuccessCallback, onErrorCallback) {
        beforeRpcCallback();

        let self = this;
        queryUrlGetAjax(
            /* urlToGet= */
            "https://zilwatch.io/api/tokenprice/lowhigh?range=24h&requester=zilwatch_dashboard",
            /* successCallback= */
            function (data) {
                let currZrcTokenPrice24hLowData = data['low'];
                if (currZrcTokenPrice24hLowData) {
                    self.zrcTokenPrice24hLowMap_ = currZrcTokenPrice24hLowData;
                }
                let currZrcTokenPrice24hHighData = data['high'];
                if (currZrcTokenPrice24hHighData) {
                    self.zrcTokenPrice24hHighMap_ = currZrcTokenPrice24hHighData;
                }
                self.bindViewZrcPrice24hLowHigh();
                onSuccessCallback();
            },
            /* errorCallback= */
            function () {
                onErrorCallback();
            });
    }

    // Exception, no need reset
    bindViewZrcPrice24hLow(zrcPrice24hLow, ticker) {
        $('#' + ticker + '_price_24h_low').text(zrcPrice24hLow);
    }
    // Exception, no need reset
    bindViewZrcPrice24hHigh(zrcPrice24hHigh, ticker) {
        $('#' + ticker + '_price_24h_high').text(zrcPrice24hHigh);
    }
    // Exception, no need reset
    bindViewZrcPriceProgress24hPercent(currentPricePercent, ticker) {
        let currentPricePercentString = currentPricePercent.toString();
        $('#' + ticker + '_price_24h_low_high_progress').attr('aria-valuenow', currentPricePercentString);
        $('#' + ticker + '_price_24h_low_high_progress').width(currentPricePercentString + '%');
    }

}

if (typeof exports !== 'undefined') {
    if (typeof convertNumberQaToDecimalString === 'undefined') {
        FormattingUtils = require('./formatting_utils.js');
        commafyNumberToString = FormattingUtils.commafyNumberToString;
    }
    if (typeof $ === 'undefined') {
        $ = global.jQuery = require('jquery');
    }
    exports.ZilswapZrcPrice24hLowHighStatus = ZilswapZrcPrice24hLowHighStatus;
}