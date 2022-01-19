
function getMainDexName(ticker) {
    try {
        let supported_dex_length = zrcTokenPropertiesListMap[ticker].supported_dex.length;
        if (!supported_dex_length || supported_dex_length <= 0) {
            return null;
        }
        return zrcTokenPropertiesListMap[ticker].supported_dex[0];
    } catch (err) {
        // Do nothing
    }
}

if (typeof exports !== 'undefined') {
    if (typeof zrcTokenPropertiesListMap === 'undefined') {
        Constants = require('../constants.js');
        zrcTokenPropertiesListMap = Constants.zrcTokenPropertiesListMap;
    }

    exports.getMainDexName = getMainDexName;
}