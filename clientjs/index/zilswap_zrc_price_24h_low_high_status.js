/** A class to represent Zilswap Zrc token price 24h low and high.  */
class ZilswapZrcPrice24hLowHighStatus {

    constructor(
        zrcTokenPropertiesListMap,
        /* nullable= */
        zilswapDexStatus,
        /* nullable= */
        zrcTokenPrice24hLowData,
        /* nullable= */
        zrcTokenPrice24hHighData,
        /* nullable= */
        xcadDexZrcTokenPriceInXcad24hLowData,
        /* nullable= */
        xcadDexZrcTokenPriceInXcad24hHighData) {

        // Private variable
        this.zrcTokenPropertiesListMap_ = zrcTokenPropertiesListMap; // Refer to constants.js for definition
        this.zilswapDexStatus_ = zilswapDexStatus;

        // Private variable
        this.zrcTokenPrice24hLowMap_ = {};
        if (zrcTokenPrice24hLowData) {
            this.zrcTokenPrice24hLowMap_ = zrcTokenPrice24hLowData;
            if (xcadDexZrcTokenPriceInXcad24hLowData) {
                for (let ticker in xcadDexZrcTokenPriceInXcad24hLowData) {
                    if (getMainDexName(ticker) === 'xcaddex') {
                        this.zrcTokenPrice24hLowMap_[ticker] = xcadDexZrcTokenPriceInXcad24hLowData[ticker];
                    }
                }
            }
        }
        this.zrcTokenPrice24hHighMap_ = {};
        if (zrcTokenPrice24hHighData) {
            this.zrcTokenPrice24hHighMap_ = zrcTokenPrice24hHighData;
            if (xcadDexZrcTokenPriceInXcad24hHighData) {
                for (let ticker in xcadDexZrcTokenPriceInXcad24hHighData) {
                    if (getMainDexName(ticker) === 'xcaddex') {
                        this.zrcTokenPrice24hHighMap_[ticker] = xcadDexZrcTokenPriceInXcad24hHighData[ticker];
                    }
                }
            }
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

            if (getMainDexName(ticker) === 'xcaddex') {
                if (!this.zilswapDexStatus_) {
                    continue;
                }
                let xcadPriceInZil = this.zilswapDexStatus_.getZrcPriceInZil('XCAD');
                if (!xcadPriceInZil) {
                    continue;
                }
                zrcPrice24hLow *= xcadPriceInZil;
                zrcPrice24hHigh *= xcadPriceInZil;
            }

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
                let zrcTokenPriceInZil = this.zilswapDexStatus_.getZrcPriceInZilWithFallback(ticker);
                if (!zrcTokenPriceInZil) {
                    continue
                }

                let currentPricePercent = getNormalizedPercent(zrcTokenPriceInZil, zrcPrice24hLow, zrcPrice24hHigh);
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
            CONST_ZILWATCH_ROOT_URL + "/api/tokenprice/lowhigh?dex_name=zilswap&dex_base_token_symbol=zil&range=24h&requester=zilwatch_dashboard",
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

        // TODO: This is a hack for dXCAD. Fix this.
        queryUrlGetAjax(
            /* urlToGet= */
            CONST_ZILWATCH_ROOT_URL + "/api/tokenprice/lowhigh?dex_name=xcad&dex_base_token_symbol=xcad&range=24h&requester=zilwatch_dashboard",
            /* successCallback= */
            function (data) {
                let currZrcTokenPrice24hLowData = data['low'];
                if (currZrcTokenPrice24hLowData) {
                    for (let ticker in currZrcTokenPrice24hLowData) {
                        if (getMainDexName(ticker) === 'xcaddex') {
                            self.zrcTokenPrice24hLowMap_[ticker] = currZrcTokenPrice24hLowData[ticker];
                        }
                    }
                }
                let currZrcTokenPrice24hHighData = data['high'];
                if (currZrcTokenPrice24hHighData) {
                    for (let ticker in currZrcTokenPrice24hHighData) {
                        if (getMainDexName(ticker) === 'xcaddex') {
                            self.zrcTokenPrice24hHighMap_[ticker] = currZrcTokenPrice24hHighData[ticker];
                        }
                    }
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
        $('#' + ticker + '_price_past_range_low').text(zrcPrice24hLow);
    }
    // Exception, no need reset
    bindViewZrcPrice24hHigh(zrcPrice24hHigh, ticker) {
        $('#' + ticker + '_price_past_range_high').text(zrcPrice24hHigh);
    }
    // Exception, no need reset
    bindViewZrcPriceProgress24hPercent(currentPricePercent, ticker) {
        let currentPricePercentString = currentPricePercent.toString();
        $('#' + ticker + '_price_past_range_low_high_progress').attr('aria-valuenow', currentPricePercentString);
        $('#' + ticker + '_price_past_range_low_high_progress').width(currentPricePercentString + '%');
    }

}

if (typeof exports !== 'undefined') {
    if (typeof convertNumberQaToDecimalString === 'undefined') {
        FormattingUtils = require('./formatting_utils.js');
        commafyNumberToString = FormattingUtils.commafyNumberToString;
    }
    if (typeof getNormalizedPercent === 'undefined') {
        TokenUtils = require('./token_utils.js');
        getNormalizedPercent = TokenUtils.getNormalizedPercent;
    }
    if (typeof getMainDexName === 'undefined') {
        UtilsDex = require('../utils_dex.js');
        getMainDexName = UtilsDex.getMainDexName;
    }
    if (typeof $ === 'undefined') {
        $ = global.jQuery = require('jquery');
    }
    exports.ZilswapZrcPrice24hLowHighStatus = ZilswapZrcPrice24hLowHighStatus;
}