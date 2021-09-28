// Constants for this class
const WHITE_TRANSPARENT_RGBA = 'rgba(255, 255, 255, 0)';
const BLACK_TRANSPARENT_RGBA = 'rgba(0, 0, 0, 0)';

const GREEN_LINE_RGBA = 'rgba(83, 165, 81, 1.0)';
const RED_LINE_RGBA = 'rgba(203, 68, 74, 1.0)';

const GREEN_TOP_GRADIENT_RGBA = 'rgba(83, 255, 81, 1.0)';
const RED_TOP_GRADIENT_RGBA = 'rgba(255, 68, 74, 1.0)';

/**
 * A utility class to draw price charts on the sidebar.
 * Requires lightweight charts library script src='https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js'.
 */
class SimpleChartStatus {

    constructor(zrcTokenPropertiesListMap, simpleAllTokensData) {
        // Private variable
        this.zrcTokenPropertiesListMap_ = zrcTokenPropertiesListMap; // Refer to constants.js for definition

        this.chartSeriesList_ = [];
        this.simpleAllTokensData_ = {};

        // Bindview immediately if data is provided or retrieve ajax if data is not provided.
        if (simpleAllTokensData) {
            this.simpleAllTokensData_ = simpleAllTokensData;
            this.bindViewAllTokens();
        } else {
            this.computeDataRpc();
        }
    }

    refreshChartTheme() {
        let currThemeBottomColor = $("html").hasClass("dark-mode") ? BLACK_TRANSPARENT_RGBA : WHITE_TRANSPARENT_RGBA;
        for (let i = 0; i < this.chartSeriesList_.length; i++) {
            this.chartSeriesList_[i].applyOptions({
                bottomColor: currThemeBottomColor,
            });
        }
    }

    computeDataRpc() {
        if (typeof queryZilliqaApiAjax === 'undefined') {
            // Skip if undefined, this is to cater for test.
            return;
        }
        let self = this;
        queryUrlGetAjax(
            /* urlToGet= */
            "https://zilwatch.io/api/tokenprice/24h_simple_all_tokens?requester=zilwatch_dashboard",
            /* successCallback= */
            function (data) {
                self.simpleAllTokensData_ = data;
                self.bindViewAllTokens();
            },
            /* errorCallback= */
            function () {});
    }

    bindViewAllTokens() {
        if (!this.simpleAllTokensData_ || !('data' in this.simpleAllTokensData_)) {
            return;
        }
        this.chartSeriesList_ = [];
        let currSimpleAllTokensData = this.simpleAllTokensData_.data;
        for (let ticker in this.zrcTokenPropertiesListMap_) {
            if (!(ticker in currSimpleAllTokensData)) {
                continue;
            }
            let currContainer = document.getElementById('simple_chart_' + ticker);
            currContainer.innerHTML = "";
            let series = this.bindViewSimpleChart(currContainer, currSimpleAllTokensData[ticker]);
            if (series) {
                this.chartSeriesList_.push(series);
            }
        }
    }

    bindViewSimpleChart(container, data) {
        if (typeof LightweightCharts === 'undefined') {
            // Skip if undefined, this is to cater for test.
            // LightweightCharts are not testable because it's 3rd party library.
            return null;
        }

        let chart = LightweightCharts.createChart(container, {
            width: 70,
            height: 30,
            priceLineVisible: false,
            layout: {
                backgroundColor: WHITE_TRANSPARENT_RGBA,
            },
            rightPriceScale: {
                mode: LightweightCharts.PriceScaleMode.Normal, // Can be .Logarithmic or .Percentage
                borderVisible: false,
                visible: false,
            },
            grid: {
                vertLines: {
                    visible: false,
                },
                horzLines: {
                    visible: false
                }
            },
            timeScale: {
                borderVisible: false,
                timeVisible: false,
                visible: false,
            },
            crosshair: {
                horzLine: {
                    visible: false,
                },
                vertLine: {
                    visible: false,
                },
            },
            handleScroll: false,
            handleScale: false,
        });

        chart.timeScale().setVisibleLogicalRange({
            from: 0,
            to: data.length,
        });

        let priceDifference = data[data.length - 1].value - data[0].value;
        let series = chart.addAreaSeries({
            topColor: priceDifference >= 0 ? GREEN_TOP_GRADIENT_RGBA : RED_TOP_GRADIENT_RGBA,
            bottomColor: $("html").hasClass("dark-mode") ? BLACK_TRANSPARENT_RGBA : WHITE_TRANSPARENT_RGBA,
            lineColor: priceDifference >= 0 ? GREEN_LINE_RGBA : RED_LINE_RGBA,
            lineWidth: 2,
            priceLineVisible: false,
        });
        series.setData(data);

        return series;
    }
}


if (typeof exports !== 'undefined') {

    if (typeof $ === 'undefined') {
        $ = global.jQuery = require('jquery');
    }

    exports.SimpleChartStatus = SimpleChartStatus;
}