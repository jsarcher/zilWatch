function getLpRewardSection(dexName, totalRewardApr, htmlElementSubList) {
    let elementString = "<div class='mb-2'>"
    elementString += "<span class='font-weight-bold'>" + dexName + "</span>";
    elementString += "<br/>";
    elementString += "<span class='h5 font-weight-bold'>" + totalRewardApr + " %</span>";
    elementString += "<span class='ml-1 text-secondary'>(APR)</span>";
    elementString += "<br/>";
    elementString += htmlElementSubList;
    elementString += "</div>";
    return elementString;
}

function getIndividualLpRewardPriceChartHtmlTemplate(rewardAmountString, rewardTicker, rewardTokenLogoUrl, rewardApr, rewardPeriodFreq) {
    let elementString = "";
    elementString += getRewardLpHtmlTemplate(/* isElementEmpty= */ true, rewardAmountString, rewardTicker, rewardTokenLogoUrl);
    elementString += "<span class='ml-1 mr-1'>/ " + rewardPeriodFreq + "</span>";
    elementString += "<span class='mr-1 text-secondary'>(" + rewardApr + " %)</span>";
    elementString += "<br/>";
    return elementString;
}

function getStakingRewardPriceChartHtmlTemplate(stakingName, rewardApr, unbondingDays) {
    let elementString = "<div class='mb-2'>"
    elementString += "<span class='font-weight-bold'>" + stakingName + "</span>";
    elementString += "<br/>";
    elementString += "<span class='h5 font-weight-bold'>" + rewardApr + " %</span>";
    elementString += "<span class='ml-1 text-secondary'>(APR)</span>";
    elementString += "<br/>";
    elementString += "<span>" + unbondingDays + "</span>";
    elementString += "<span class='ml-1 text-secondary'>(unbonding days)</span>";
    elementString += "<br/>";
    elementString += "</div>";
    return elementString;
}

/**
 * A utility class to draw full price charts.
 * Requires lightweight charts library script src='https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js'.
 */
class PriceChartStatus {

    constructor(zrcTokenPropertiesListMap,
        zrcStakingTokenPropertiesListMap,
        /* nullable= */ defaultTokenSymbol,
        /* nullable= */ coinPriceStatus,
        /* nullable= */ zilswapDexStatus,
        /* nullable= */ xcadDexStatus,
        /* nullable= */ zilswapTradeVolumeStatus,
        /* nullable= */ zilswapDexRewardData, 
        /* nullable= */ xcadDexRewardData, 
        /* nullable= */ zrcStakingRewardData) {
        // Private variable
        this.zrcTokenPropertiesListMap_ = zrcTokenPropertiesListMap; // Refer to constants.js for definition
        this.zrcStakingTokenPropertiesListMap_ = zrcStakingTokenPropertiesListMap;

        this.coinPriceStatus_ = coinPriceStatus;
        this.zilswapDexStatus_ = zilswapDexStatus;
        this.xcadDexStatus_ = xcadDexStatus;
        this.zilswapTradeVolumeStatus_ = zilswapTradeVolumeStatus;
        this.zilswapDexRewardData_ = zilswapDexRewardData;
        this.xcadDexRewardData_ = xcadDexRewardData;
        this.zrcStakingRewardData_ = zrcStakingRewardData;

        let initTokenSymbol = 'gZIL';
        if (defaultTokenSymbol in this.zrcTokenPropertiesListMap_) {
            if (!('fixed_token_rate' in this.zrcTokenPropertiesListMap_[defaultTokenSymbol])) {
                initTokenSymbol = defaultTokenSymbol;
            }
        }

        this.lightweightChartData_ = {
            'ticker': null,
            'range': null,
            'series': null,
        }

        // Default to defaultTokenSymbol if set, else gZIL, 24h
        // This is subject to change for future logic
        this.historicalPriceData_ = {
            'ticker': initTokenSymbol,
            'range': '24h',
        };
        this.updateTokenUrlState(initTokenSymbol, /* isUserAction= */ false);
    }

    onCoinPriceStatusChange() {
        if (!this.historicalPriceData_) {
            return;
        }
        if (!('ticker' in this.historicalPriceData_)) {
            return;
        }
        if (!('range' in this.historicalPriceData_)) {
            return;
        }
        this.bindViewPriceTextInformation(this.historicalPriceData_.ticker);
        this.bindViewZilswapDexAndFiatInformation(this.historicalPriceData_.ticker, this.historicalPriceData_.range);
    }

    onZilswapDexStatusChange() {
        if (!this.historicalPriceData_) {
            return;
        }
        if (!('ticker' in this.historicalPriceData_)) {
            return;
        }
        if (!('range' in this.historicalPriceData_)) {
            return;
        }
        this.bindViewPriceTextInformation(this.historicalPriceData_.ticker);
        this.bindViewZilswapDexAndFiatInformation(this.historicalPriceData_.ticker, this.historicalPriceData_.range);
    }

    redrawChart() {
        this.bindViewPriceChart( /* isForceRedraw= */ true);
    }

    updateTokenUrlState(tokenSymbol, isUserAction) {
        let state = {
            'tokenSymbol': tokenSymbol
        };
        let title = "zilWatch - " + tokenSymbol;
        let queryAttr = "?token=" + tokenSymbol;

        if (isUserAction) {
            history.pushState(state, title, queryAttr);
        } else {
            history.replaceState(state, title, queryAttr);
        }
    }

    /**
     * Public method to change the current ticker being shown to user.
     * 
     * We need to reset the text information too because the token changes.
     */
    computePriceChartTicker(ticker) {
        if (!('range' in this.historicalPriceData_)) {
            return;
        }
        let currRange = this.historicalPriceData_.range;

        this.resetAtlAndAthTextInformation();
        this.resetPriceTextInformation();
        this.resetStaticLiquidityApr();
        this.resetStaticStakingApr();

        this.computePriceChart(ticker, currRange);
    }

    /**
     * Public method to change the current ticker being shown to user.
     * 
     * We need to reset token that's sensitive to the time range, but other information can be kept static (e.g., ATH, ATL, LP and staking APR).
     */
    computePriceChartRange(range) {
        if (!('ticker' in this.historicalPriceData_)) {
            return;
        }
        let currTicker = this.historicalPriceData_.ticker;
        
        this.resetZilswapDexAndFiatInformation();

        this.computePriceChart(currTicker, range);
    }

    computePriceChart(ticker, range) {
        this.historicalPriceData_ = {
            'ticker': ticker,
            'range': range,
        }
        this.computeDataRpc(
            /* beforeRpcCallback= */
            function () {
                incrementShowSpinnerFullPriceChart();
            },
            /* onSuccessCallback= */
            function () {
                decrementShowSpinnerFullPriceChart();
            },
            /* onErrorCallback= */
            function () {
                decrementShowSpinnerFullPriceChart();
            });
    }

    computeDataRpc(beforeRpcCallback, onSuccessCallback, onErrorCallback) {
        if (typeof queryZilliqaApiAjax === 'undefined') {
            // Skip if undefined, this is to cater for test.
            return;
        }
        if (!('ticker' in this.historicalPriceData_) || !('range' in this.historicalPriceData_)) {
            return;
        }
        if (!(this.historicalPriceData_.ticker in this.zrcTokenPropertiesListMap_)) {
            return;
        }
        beforeRpcCallback();

        // Still try to bindView all first to update the static information, to make the page doesn't look hanging.
        this.bindViewAllInformation();

        let self = this;

        // TODO: This is a hack for dXCAD. Fix this.
        if (this.historicalPriceData_.ticker !== 'dXCAD') {
            queryUrlGetAjax(
                /* urlToGet= */
                CONST_ZILWATCH_ROOT_URL + "/api/tokenprice?dex_name=zilswap&dex_base_token_symbol=zil&token_symbol=" + self.historicalPriceData_.ticker + "&range=" + self.historicalPriceData_.range + "&requester=zilwatch_dashboard",
                /* successCallback= */
                function (data) {
                    try {
                        if ('ticker' in data && 'range' in data) {
                            if (data.ticker === self.historicalPriceData_.ticker && data.range === self.historicalPriceData_.range) {
                                self.historicalPriceData_['zilswap'] = data;
                                self.bindViewAllInformation();
                                self.bindViewPriceChart( /* isForceRedraw= */ false);
                                onSuccessCallback();
                                return;
                            }
                        }
                    } catch {
                        // Do nothing
                    }
                    self.bindViewAllInformation();
                    onErrorCallback();
                },
                /* errorCallback= */
                function () {
                    self.bindViewAllInformation();
                    onErrorCallback();
                });
        } else {
            queryUrlGetAjax(
                /* urlToGet= */
                CONST_ZILWATCH_ROOT_URL + "/api/tokenprice?dex_name=xcad&dex_base_token_symbol=xcad&token_symbol=" + self.historicalPriceData_.ticker + "&range=" + self.historicalPriceData_.range + "&requester=zilwatch_dashboard",
                /* successCallback= */
                function (data) {
                    try {
                        if ('ticker' in data && 'range' in data) {
                            if (data.ticker === self.historicalPriceData_.ticker && data.range === self.historicalPriceData_.range) {
                                self.historicalPriceData_['xcaddex'] = data;
                                self.bindViewAllInformation();
                                self.bindViewPriceChart( /* isForceRedraw= */ false);
                                onSuccessCallback();
                                return;
                            }
                        }
                    } catch {
                        // Do nothing
                    }
                    self.bindViewAllInformation();
                    onErrorCallback();
                },
                /* errorCallback= */
                function () {
                    self.bindViewAllInformation();
                    onErrorCallback();
                });
        }
    }

    getMainDexName(ticker) {
        let supported_dex_length = this.zrcTokenPropertiesListMap_[ticker].supported_dex.length
        if (!supported_dex_length || supported_dex_length <= 0) {
            return null;
        }
        return this.zrcTokenPropertiesListMap_[ticker].supported_dex[0];
    }

    bindViewChartErrorDataNotAvailable() {
        let currContainer = document.getElementById('full_price_chart');
        currContainer.innerHTML = "";
        currContainer.innerHTML = "<p class='h4'>Sorry, data is not available!</p>";
    }

    bindViewAllInformation() {
        if (!this.historicalPriceData_) {
            return;
        }
        if (!('ticker' in this.historicalPriceData_)) {
            return;
        }
        if (!('range' in this.historicalPriceData_)) {
            return;
        }
        this.bindViewStaticInformation(this.historicalPriceData_.ticker);
        this.bindViewStaticLiquidityAndStakingApr(this.historicalPriceData_.ticker);
        this.bindViewAtlAndAthTextInformation(this.historicalPriceData_.ticker);
        this.bindViewPriceTextInformation(this.historicalPriceData_.ticker);
        this.bindViewZilswapDexAndFiatInformation(this.historicalPriceData_.ticker, this.historicalPriceData_.range);
    }

    bindViewStaticInformation(ticker) {
        if (!(ticker in this.zrcTokenPropertiesListMap_)) {
            return;
        }

        let address = this.zrcTokenPropertiesListMap_[ticker].address;

        let imgSrc = this.zrcTokenPropertiesListMap_[ticker].logo_url;
        if (isCurrentDarkMode()) {
            imgSrc = imgSrc + CONST_VIEWBLOCK_LOGO_DARK_SUFFIX;
        }
        $('#price_chart_token_logo').attr('src', imgSrc);
        $('#price_chart_token_name').text(this.zrcTokenPropertiesListMap_[ticker].name);
        // Do not trigger change() on purpose, this is just updating the value of the selector.
        $('#price_chart_token_ticker_selector').val(this.zrcTokenPropertiesListMap_[ticker].ticker);

        $('#price_chart_token_address_anchor').attr('href', 'https://viewblock.io/zilliqa/address/' + address);
        $('#price_chart_token_address_span').text(address);

        if ('website' in this.zrcTokenPropertiesListMap_[ticker]) {
            $('#price_chart_token_website_anchor').attr('href', this.zrcTokenPropertiesListMap_[ticker].website);
            $('#price_chart_token_website_anchor').show();
        } else {
            $('#price_chart_token_website_anchor').hide();
        }

        if ('telegram' in this.zrcTokenPropertiesListMap_[ticker]) {
            $('#price_chart_token_telegram_anchor').attr('href', this.zrcTokenPropertiesListMap_[ticker].telegram);
            $('#price_chart_token_telegram_anchor').show();
        } else {
            $('#price_chart_token_telegram_anchor').hide();
        }

        if ('whitepaper' in this.zrcTokenPropertiesListMap_[ticker]) {
            $('#price_chart_token_whitepaper_anchor').attr('href', this.zrcTokenPropertiesListMap_[ticker].whitepaper);
            $('#price_chart_token_whitepaper_anchor').show();
        } else {
            $('#price_chart_token_whitepaper_anchor').hide();
        }
    }

    bindViewStaticLiquidityAndStakingApr(ticker) {
        // We need to reset the view here before each update,
        // because it's appending to the element, not replacing
        this.resetStaticLiquidityApr();
        this.resetStaticStakingApr();

        if (this.zilswapDexRewardData_) {
            let totalApr = 0.0;
            if (ticker in this.zilswapDexRewardData_) {
                let htmlElementWeeklyRewardList = "";
                for (let rewardTicker in this.zilswapDexRewardData_[ticker]) {
                    try {
                        let rewardAmount = parseFloat(this.zilswapDexRewardData_[ticker][rewardTicker].reward_amount);
                        let rewardAmountString = convertNumberQaToDecimalString(rewardAmount, /* decimals= */ 0);
                        let rewardApr = parseFloat(this.zilswapDexRewardData_[ticker][rewardTicker].apr_percent);
                        let rewardTokenLogoUrl = this.zrcTokenPropertiesListMap_[rewardTicker].logo_url;

                        htmlElementWeeklyRewardList += getIndividualLpRewardPriceChartHtmlTemplate(rewardAmountString, rewardTicker, rewardTokenLogoUrl, rewardApr, "week");
                        
                        totalApr += rewardApr;
                    } catch (err) {
                        console.log("Failed to load reward " + rewardTicker + " from LP " + ticker);
                    }
                }
                if (totalApr > 0.0) {
                     $('#price_chart_liquidity_reward_list').append(getLpRewardSection('ZilSwap', totalApr.toFixed(1), htmlElementWeeklyRewardList));
                     $('#price_chart_liquidity_reward_container').show();
                }
            }
        }

        if (this.xcadDexRewardData_) {
            let totalApr = 0.0;
            if (ticker in this.xcadDexRewardData_) {
                let htmlElementWeeklyRewardList = "";
                for (let rewardTicker in this.xcadDexRewardData_[ticker]) {
                    try {
                        let rewardAmount = parseFloat(this.xcadDexRewardData_[ticker][rewardTicker].reward_amount);
                        let rewardAmountString = convertNumberQaToDecimalString(rewardAmount, /* decimals= */ 0);
                        let rewardApr = parseFloat(this.xcadDexRewardData_[ticker][rewardTicker].apr_percent);
                        let rewardTokenLogoUrl = this.zrcTokenPropertiesListMap_[rewardTicker].logo_url;

                        htmlElementWeeklyRewardList += getIndividualLpRewardPriceChartHtmlTemplate(rewardAmountString, rewardTicker, rewardTokenLogoUrl, rewardApr, "day");
                        
                        totalApr += rewardApr;
                    } catch (err) {
                        console.log("Failed to load reward " + rewardTicker + " from LP " + ticker);
                    }
                }
                if (totalApr > 0.0) {
                     $('#price_chart_liquidity_reward_list').append(getLpRewardSection('XCAD Dex', totalApr.toFixed(1), htmlElementWeeklyRewardList));
                     $('#price_chart_liquidity_reward_container').show();
                }
            }
        }

        if (this.zrcStakingRewardData_) {
            for (let tickerId in this.zrcStakingRewardData_) {
                try {
                    let rewardTicker =  this.zrcStakingTokenPropertiesListMap_[tickerId].ticker;
                    if (rewardTicker !== ticker) {
                        continue;
                    }
                    let stakingName = this.zrcStakingTokenPropertiesListMap_[tickerId].name;
                    let stakingApr = this.zrcStakingRewardData_[tickerId].reward_apr_percent;
                    let unbondingDays = this.zrcStakingRewardData_[tickerId].unbonding_period_days;
                    $('#price_chart_staking_list').append(getStakingRewardPriceChartHtmlTemplate(stakingName, stakingApr, unbondingDays));
                    $('#price_chart_staking_reward_container').show();
                } catch (err) {
                    console.log("Failed to load reward " + tickerId + " from staking " + ticker);
                }
            }
        }
    }

    bindViewAtlAndAthTextInformation(ticker) {
        let supported_dex_length = this.zrcTokenPropertiesListMap_[ticker].supported_dex.length
        for (let i = 0; i < supported_dex_length; i++) {
            let dexName = this.zrcTokenPropertiesListMap_[ticker].supported_dex[i];
            if (!(dexName in this.historicalPriceData_)) {
                continue;
            }

            if ('all_time_high' in this.historicalPriceData_[dexName]) {
                let ath_dict = this.historicalPriceData_[dexName].all_time_high;
                if ('value' in ath_dict) {
                    let athValue = ath_dict.value;
                    let athValueString = convertNumberQaToDecimalString(athValue, /* decimals= */ 0);
                    $('#price_chart_' + dexName + '_all_time_high').text(athValueString);

                    if ('time' in ath_dict) {
                        let athTimestampEpoch = ath_dict.time;
                        let dateTimestamp = new Date(athTimestampEpoch * 1000).toLocaleTimeString([], {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                        });
                        $('#price_chart_' + dexName + '_all_time_high_timestamp').text(dateTimestamp);
                    }
                    $('#price_chart_' + dexName + '_all_time_high_container').show();
                }
            }

            if ('all_time_low' in this.historicalPriceData_[dexName]) {
                let atl_dict = this.historicalPriceData_[dexName].all_time_low;
                if ('value' in atl_dict) {
                    let athValue = atl_dict.value;
                    let athValueString = convertNumberQaToDecimalString(athValue, /* decimals= */ 0);
                    $('#price_chart_' + dexName + '_all_time_low').text(athValueString);

                    if ('time' in atl_dict) {
                        let atlTimestampEpoch = atl_dict.time;
                        let dateTimestamp = new Date(atlTimestampEpoch * 1000).toLocaleTimeString([], {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                        });
                        $('#price_chart_' + dexName + '_all_time_low_timestamp').text(dateTimestamp);
                    }
                    $('#price_chart_' + dexName + '_all_time_low_container').show();
                }
            }
        }
    }

    bindViewPriceTextInformation(ticker) {
        // If the ticker supported dex is none, skip
        let mainDexName = this.getMainDexName(ticker);
        if (!mainDexName) {
            return;
        }

        // Get zil price in fiat
        let zilPriceInFiatFloat = null;
        if (this.coinPriceStatus_) {
            zilPriceInFiatFloat = this.coinPriceStatus_.getCoinPriceFiat('ZIL');
        }

        // Get price of token in ZIL first
        let currPriceInZil = null;
        if (this.zilswapDexStatus_) {
            currPriceInZil = this.zilswapDexStatus_.getZrcPriceInZil(ticker);
        }

        // Get price of token in XCAD
        let currPriceInXcad = null;
        let currPriceInZilViaXcad = null;
        if (this.xcadDexStatus_) {
            currPriceInXcad = this.xcadDexStatus_.getZrcPriceInXcad(ticker);
            if (this.zilswapDexStatus_) {
                let xcadPriceInZil = this.zilswapDexStatus_.getZrcPriceInZil('XCAD');
                if (currPriceInXcad && xcadPriceInZil) {
                    currPriceInZilViaXcad = currPriceInXcad * xcadPriceInZil;
                }
            }
        }

        let currPriceInBaseToken = null;
        let currBaseTokenTicker = null;
        let currHistoricalPriceData = null;
        if ('zilswap' === mainDexName && 'zilswap' in this.historicalPriceData_) {
            currHistoricalPriceData = this.historicalPriceData_['zilswap'];
            currPriceInBaseToken = currPriceInZil;
            currBaseTokenTicker = 'ZIL';

            if (currPriceInZil) {
                let userFriendlyZrcTokenPriceInZil = convertNumberQaToDecimalString(currPriceInZil, /* decimals= */ 0);
                $('#price_chart_current_token_price_in_base_token').text(userFriendlyZrcTokenPriceInZil);
                $('#price_chart_current_token_price_ticker').text('ZIL');

                if (zilPriceInFiatFloat) {
                    let currPriceInFiat = zilPriceInFiatFloat * currPriceInZil;
                    let currPriceInFiatString = commafyNumberToString(currPriceInFiat, /* decimals= */ 2);
                    $('#price_chart_current_token_price_fiat').text(currPriceInFiatString);
                }
            }

        } else if ('xcaddex' === mainDexName && 'xcaddex' in this.historicalPriceData_) {
            currHistoricalPriceData = this.historicalPriceData_['xcaddex'];
            currPriceInBaseToken = currPriceInXcad;
            currBaseTokenTicker = 'XCAD';

            if (currPriceInXcad) {
                let userFriendlyZrcTokenPriceInXcad = convertNumberQaToDecimalString(currPriceInXcad, /* decimals= */ 0);
                $('#price_chart_current_token_price_in_base_token').text(userFriendlyZrcTokenPriceInXcad);
                $('#price_chart_current_token_price_ticker').text('XCAD');

                if (zilPriceInFiatFloat && currPriceInZilViaXcad) {
                    let currPriceInFiat = zilPriceInFiatFloat * currPriceInZilViaXcad;
                    let currPriceInFiatString = commafyNumberToString(currPriceInFiat, /* decimals= */ 2);
                    $('#price_chart_current_token_price_fiat').text(currPriceInFiatString);
                }
            }
        } else {
            return;
        }

        if (currPriceInXcad && currPriceInZilViaXcad) {
            let userFriendlyZrcTokenPriceInXcad = convertNumberQaToDecimalString(currPriceInXcad, /* decimals= */ 0);
            $('#price_chart_xcaddex_current_token_price_xcad').text(userFriendlyZrcTokenPriceInXcad);

            let userFriendlyZrcTokenPriceInZil = convertNumberQaToDecimalString(currPriceInZilViaXcad, /* decimals= */ 0);
            $('#price_chart_xcaddex_current_token_price_zil').text(userFriendlyZrcTokenPriceInZil);
            $('#price_chart_xcaddex_current_token_price_zil_container').show();
        }

        if (!('data' in currHistoricalPriceData)) {
            return;
        }
        if (!('low' in currHistoricalPriceData)) {
            return;
        }
        if (!('high' in currHistoricalPriceData)) {
            return;
        }

        let currRange = currHistoricalPriceData.range;
        let currData = currHistoricalPriceData.data;
        let currLow = currHistoricalPriceData.low;
        let currHigh = currHistoricalPriceData.high;

        let currPriceInBaseTokenRangeAgo = parseFloat(currData[0].value);
        if (!currPriceInBaseToken) {
            currPriceInBaseToken = parseFloat(currData[currData.length - 1].value);
        }
        let userFriendlyZrcTokenPricePercentChange = getPercentChange(currPriceInBaseToken, currPriceInBaseTokenRangeAgo).toFixed(1);
        $('#price_chart_current_percent_change').text(userFriendlyZrcTokenPricePercentChange);
        bindViewPercentChangeColorContainer('#price_chart_current_percent_change_container', userFriendlyZrcTokenPricePercentChange);

        $('.price_chart_range').text(currRange);
        let userFriendlyLow = convertNumberQaToDecimalString(currLow, /* decimals= */ 0);
        $('#price_chart_range_low').text(userFriendlyLow);
        $('#price_chart_range_low_ticker').text(currBaseTokenTicker);
        let userFriendlyHigh = convertNumberQaToDecimalString(currHigh, /* decimals= */ 0);
        $('#price_chart_range_high').text(userFriendlyHigh);
        $('#price_chart_range_high_ticker').text(currBaseTokenTicker);

        let currentPricePercent = getNormalizedPercent(currPriceInBaseToken, currLow, currHigh);
        let currentPricePercentString = currentPricePercent.toString();
        $('#price_chart_low_high_progress').attr('aria-valuenow', currentPricePercentString);
        $('#price_chart_low_high_progress').width(currentPricePercentString + '%');
    }

    bindViewZilswapDexAndFiatInformation(ticker, range) {
        this.resetZilswapDexAndFiatInformation();
        $('.price-chart-ticker').text(ticker);
        $('.price_chart_range').text(range);

        if (!this.zilswapDexStatus_) {
            return;
        }
        if (!this.coinPriceStatus_) {
            return;
        }
        let zrcPriceInZil = this.zilswapDexStatus_.getZrcPriceInZilWithFallback(ticker);
        if (!zrcPriceInZil) {
            return;
        }
        let zilPriceInFiatFloat = this.coinPriceStatus_.getCoinPriceFiat('ZIL');
        if (!zilPriceInFiatFloat) {
            return;
        }

        // ---- Circulating supply and market cap ----
        let zrcCirculatingSupply = this.zilswapDexStatus_.getCirculatingSupply(ticker);
        let zrcCirculatingSupplyInFiat = null;
        if (zrcCirculatingSupply) {
            // Circulating supply and market cap
            let zrcCirculatingSupplyString = convertNumberQaToDecimalString(zrcCirculatingSupply, /* decimals= */ 0);
            $('#price_chart_circulating_supply').text(zrcCirculatingSupplyString);

            zrcCirculatingSupplyInFiat = 1.0 * zrcCirculatingSupply * zrcPriceInZil * zilPriceInFiatFloat;
            let zrcCirculatingSupplyInFiatString = commafyNumberToString(zrcCirculatingSupplyInFiat, /* decimals= */ 0);
            $('#price_chart_market_cap').text(zrcCirculatingSupplyInFiatString);
        }

        // ---- Liquidity ----
        let totalLiquidityInZil = 0;

        let zilswapPairPublicStatus = this.zilswapDexStatus_.getZilswapPairPublicStatus(ticker);
        if (zilswapPairPublicStatus) {
            // ZRC token price in ZIL
            totalLiquidityInZil += 2.0 * zilswapPairPublicStatus.totalPoolZilAmount;

            let zrcPool = convertNumberQaToDecimalString(zilswapPairPublicStatus.totalPoolZrcTokenAmount, /* decimals= */ 0);
            let zilPool = convertNumberQaToDecimalString(zilswapPairPublicStatus.totalPoolZilAmount, /* decimals= */ 0);
            $("#price_chart_zilswap_liquidity_zrc").text(zrcPool);
            $("#price_chart_zilswap_liquidity_zil").text(zilPool);
            $("#price_chart_zilswap_liquidity_container").show();
        }
        let xcadPairPublicStatus = this.xcadDexStatus_.getXcadPairPublicStatus(ticker);
        if (xcadPairPublicStatus) {
            let xcadPriceInZil = this.zilswapDexStatus_.getZrcPriceInZil('XCAD');
            if (xcadPriceInZil) {
                totalLiquidityInZil += 2.0 * xcadPriceInZil * xcadPairPublicStatus.totalPoolXcadAmount;
            }

            // ZRC token price in ZIL
            let zrcPool = convertNumberQaToDecimalString(xcadPairPublicStatus.totalPoolZrcTokenAmount, /* decimals= */ 0);
            let xcadPool = convertNumberQaToDecimalString(xcadPairPublicStatus.totalPoolXcadAmount, /* decimals= */ 0);
            $("#price_chart_xcaddex_liquidity_zrc").text(zrcPool);
            $("#price_chart_xcaddex_liquidity_xcad").text(xcadPool);
            $("#price_chart_xcaddex_liquidity_container").show();
        }

        let totalLiquidityFiat = totalLiquidityInZil * zilPriceInFiatFloat;
        let totalLiquidityFiatString = commafyNumberToString(totalLiquidityFiat, /* decimals= */ 0);
        $("#price_chart_liquidity_fiat").text(totalLiquidityFiatString);

        if (zrcCirculatingSupplyInFiat) {
            // Liquidity to Market Cap ratio
            let liquidityMarketCapRatio = totalLiquidityFiat / zrcCirculatingSupplyInFiat;
            let liquidityMarketCapRatioString = convertNumberQaToDecimalString(liquidityMarketCapRatio, /* decimals= */ 0);
            $('#price_chart_liquidity_market_cap_ratio').text(liquidityMarketCapRatioString);
        }

        // ---- Trade Volume ----
        if (!this.zilswapTradeVolumeStatus_) {
            return;
        }
        let tradeVolumeInZil = this.zilswapTradeVolumeStatus_.getTradeVolumeInZil(ticker, range);
        let tradeVolumeInFiat = zilPriceInFiatFloat * tradeVolumeInZil;
        let tradeVolumeInFiatString = convertNumberQaToDecimalString(tradeVolumeInFiat, /* decimals= */ 0);
        if (!tradeVolumeInFiatString) {
            tradeVolumeInFiatString = 0;
        }
        $('#price_chart_trade_volume_fiat').text(tradeVolumeInFiatString);

        if (zrcCirculatingSupplyInFiat) {
            // Liquidity to Market Cap ratio
            let volumeMarketCapRatio = tradeVolumeInFiat / zrcCirculatingSupplyInFiat;
            let volumeMarketCapRatioString = convertNumberQaToDecimalString(volumeMarketCapRatio, /* decimals= */ 0);
            if (!volumeMarketCapRatioString) {
                volumeMarketCapRatioString = 0;
            }
            $('#price_chart_trade_volume_market_cap_ratio').text(volumeMarketCapRatioString);
        }
    }

    bindViewPriceChart(isForceRedraw) {
        if (typeof LightweightCharts === 'undefined') {
            // Skip if undefined, this is to cater for test.
            // LightweightCharts are not testable because it's 3rd party library.
            this.bindViewChartErrorDataNotAvailable();
            return;
        }

        let mainDexName = this.getMainDexName(this.historicalPriceData_.ticker);
        if (!mainDexName) {
            this.bindViewChartErrorDataNotAvailable();
            return;
        }

        let data = null;
        try {
            data = this.historicalPriceData_[mainDexName]['data'];
        } catch (err) {
            // Do nothing, expected for certain tokens.
            // console.log("Data not available for price chart : " + mainDexName + " : " + this.historicalPriceData_.ticker);
        }
        if (!data) {
            this.bindViewChartErrorDataNotAvailable();
            return;
        }

        let dataPrecision = 2;
        try {
            let latestPrice = data[data.length - 1].value;
            let userFriendlyPrecision = getAutoPrecisionFromNumberDecimal(latestPrice);
            if (userFriendlyPrecision >= 0) {
                dataPrecision = userFriendlyPrecision + 1; // Want to be more precise in price chart
            }
        } catch (ex) {
            console.log(ex);
        }

        // If not force redraw, and ticker and range are the same, means it's just data update.
        // Hence we just setData not to reset the view (e.g., if user is already scrolling and zooming on the graph)
        if (!isForceRedraw) {
            if (this.lightweightChartData_.ticker === this.historicalPriceData_.ticker && this.lightweightChartData_.range === this.historicalPriceData_.range) {
                if (this.lightweightChartData_.series) {
                    this.lightweightChartData_.series.setData(data);
                    return;
                }
            }
        }

        let container = document.getElementById('full_price_chart');
        container.innerHTML = "";

        let chart = LightweightCharts.createChart(container, {
            // Use #main_content_tabs_container instead of #full_price_chart because when the view is hidden/gone
            // the width becomes 0px and it will be invisible
            width: $('#main_content_tabs_container').width(),
            height: 400,
            priceLineVisible: false,
            layout: {
                backgroundColor: CONST_WHITE_TRANSPARENT_RGBA_STRING,
                textColor: isCurrentDarkMode() ? '#d5d9dd' : '#212529',
            },
            rightPriceScale: {
                mode: LightweightCharts.PriceScaleMode.Normal, // Can be .Logarithmic or .Percentage
            },
            timeScale: {
                borderVisible: true,
                timeVisible: true,
                visible: true,
            },
            grid: {
                vertLines: {
                    color: isCurrentDarkMode() ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                },
                horzLines: {
                    color: isCurrentDarkMode() ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                },
            },
        });

        chart.timeScale().setVisibleLogicalRange({
            from: 0,
            to: data.length,
        });

        let priceDifference = data[data.length - 1].value - data[0].value;
        let series = chart.addAreaSeries({
            topColor: priceDifference >= 0 ? CONST_GREEN_TOP_GRADIENT_RGBA_STRING : CONST_RED_TOP_GRADIENT_RGBA_STRING,
            bottomColor: isCurrentDarkMode() ? CONST_BLACK_TRANSPARENT_RGBA_STRING : CONST_WHITE_TRANSPARENT_RGBA_STRING,
            lineColor: priceDifference >= 0 ? CONST_GREEN_LINE_RGBA_STRING : CONST_RED_LINE_RGBA_STRING,
            lineWidth: 2,
            priceFormat: {
                type: 'custom',
                minMove: Math.pow(10, (-1 * dataPrecision)),
                formatter: price => parseFloat(price).toFixed(dataPrecision),
            },
        });
        series.setData(data);

        this.lightweightChartData_.ticker = this.historicalPriceData_.ticker;
        this.lightweightChartData_.range = this.historicalPriceData_.range;
        this.lightweightChartData_.series = series;
    }

    resetStaticLiquidityApr() {
        $('#price_chart_liquidity_reward_container').hide();
        $('#price_chart_liquidity_reward_list').empty();
    }

    resetStaticStakingApr() {
        $('#price_chart_staking_reward_container').hide();
        $('#price_chart_staking_list').empty();
    }

    resetAtlAndAthTextInformation() {
        $('#price_chart_zilswap_all_time_high').text('-');
        $('#price_chart_zilswap_all_time_high_ticker').text('ZIL');
        $('#price_chart_zilswap_all_time_high_timestamp').text('-');
        $('#price_chart_zilswap_all_time_high_container').hide();
        $('#price_chart_zilswap_all_time_low').text('-');
        $('#price_chart_zilswap_all_time_low_ticker').text('ZIL');
        $('#price_chart_zilswap_all_time_low_timestamp').text('-');
        $('#price_chart_zilswap_all_time_low_container').hide();

        $('#price_chart_xcaddex_all_time_high').text('-');
        $('#price_chart_xcaddex_all_time_high_ticker').text('ZIL');
        $('#price_chart_xcaddex_all_time_high_timestamp').text('-');
        $('#price_chart_xcaddex_all_time_high_container').hide();
        $('#price_chart_xcaddex_all_time_low').text('-');
        $('#price_chart_xcaddex_all_time_low_ticker').text('ZIL');
        $('#price_chart_xcaddex_all_time_low_timestamp').text('-');
        $('#price_chart_xcaddex_all_time_low_container').hide();
    }

    resetPriceTextInformation() {
        $('#price_chart_xcaddex_current_token_price_xcad').text('-');
        $('#price_chart_xcaddex_current_token_price_zil').text('-');
        $('#price_chart_xcaddex_current_token_price_zil_container').hide();
        $('#price_chart_current_token_price_in_base_token').text('-')
        $('#price_chart_current_token_price_ticker').text('ZIL');
        $('#price_chart_current_token_price_fiat').text('-');
        $('#price_chart_current_percent_change').text('-');
        $('#price_chart_range_low').text('-');
        $('#price_chart_range_high').text('-');
        $('#price_chart_low_high_progress').attr('aria-valuenow', "0");
        $('#price_chart_low_high_progress').width('0%');
    }

    resetZilswapDexAndFiatInformation() {
        $("#price_chart_zilswap_liquidity_container").hide();
        $("#price_chart_xcaddex_liquidity_container").hide();
        $('#price_chart_circulating_supply').text('-')
        $('#price_chart_market_cap').text('-');
        $('#price_chart_zilswap_liquidity_zrc').text('-');
        $('#price_chart_zilswap_liquidity_zil').text('-');
        $('#price_chart_liquidity_fiat').text('-');
        $('#price_chart_liquidity_market_cap_ratio').text('-');
        $('#price_chart_trade_volume_fiat').text('-');
        $('#price_chart_trade_volume_market_cap_ratio').text('-');
    }
}


if (typeof exports !== 'undefined') {

    if (typeof $ === 'undefined') {
        $ = global.jQuery = require('jquery');
    }
    if (typeof getNormalizedPercent === 'undefined') {
        TokenUtils = require('./token_utils.js');
        getNormalizedPercent = TokenUtils.getNormalizedPercent;
    }

    if (typeof isCurrentDarkMode === 'undefined') {
        UtilsTheme = require('../utils_theme.js');
        isCurrentDarkMode = UtilsTheme.isCurrentDarkMode;
    }
    if (typeof CONST_VIEWBLOCK_LOGO_DARK_SUFFIX === 'undefined') {
        UtilsConstants = require('../utils_constants.js');
        CONST_VIEWBLOCK_LOGO_DARK_SUFFIX = UtilsConstants.CONST_VIEWBLOCK_LOGO_DARK_SUFFIX;
    }

    exports.PriceChartStatus = PriceChartStatus;
}