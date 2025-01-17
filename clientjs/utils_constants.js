const CONST_HTTPS_PREFIX = 'https://';
const CONST_HTTP_PREFIX = 'http://';

// This will load based on the current host (e.g., http://localhost:3000 for dev, and https://zilwatch.io for live)
// Please be careful if we want to change this to a static ROOT_URL in the future
const CONST_ZILWATCH_ROOT_URL = window.location.host.includes('localhost') ? CONST_HTTP_PREFIX + window.location.host : CONST_HTTPS_PREFIX + window.location.host;
const CONST_ZILSWAP_ARK_ROOT_URL = CONST_HTTPS_PREFIX + 'zilswap.io/ark/collections'; // e.g., https://zilswap.io/ark/collections/<nft_address>/<nft_id>
const CONST_STATS_ZILSWAP_ROOT_URL = CONST_HTTPS_PREFIX + 'stats.zilswap.org';
const CONST_STATS_XCAD_DEX_ROOT_URL = CONST_HTTPS_PREFIX + 'rewards-api.xcadnetwork.com';

const CONST_ZILSWAP_ARK_USER_PROFILE_URL = 'https://zilswap.io/ark/profile?address=<wallet_address_base_16>'
const CONST_ZILSWAP_ARK_USER_DETAILS = 'https://api-ark.zilswap.org/user/<wallet_address_base_16>/detail';
const CONST_ZILSWAP_ARK_WALLET_ADDRESS_REPLACE_TAG = '<wallet_address_base_16>';

const CONST_META_VIEWBLOCK_IO = 'meta.viewblock.io';
const CONST_ZILSWAP_REWARD_DISTRIBUTOR_ADDRESS_BASE16 = "0xea57c6b7b5475107688bc70aabefdd5352d0bed0";

// e.g., https://viewblock.io/zilliqa/address/zil167flx79fykulp57ykmh9gnf3curcnyux6dcj5e?txsType=nft&specific=5496
const CONST_VIEWBLOCK_ROOT_URL = CONST_HTTPS_PREFIX + 'viewblock.io/zilliqa/address';
const CONST_VIEWBLOCK_SUFFIX_PARAM_NFT_ID = 'txsType=nft&specific=';
const CONST_VIEWBLOCK_LOGO_DARK_SUFFIX = '?t=dark';

const CONST_ZIL_LOGO_URL = 'https://meta.viewblock.io/ZIL/logo';

const CONST_INTERNAL_CORS_PROXY_PREFIX = CONST_ZILWATCH_ROOT_URL + '/proxy/';

// For lightweight charts
const CONST_WHITE_TRANSPARENT_RGBA_STRING = 'rgba(255, 255, 255, 0)';
const CONST_BLACK_TRANSPARENT_RGBA_STRING = 'rgba(0, 0, 0, 0)';
const CONST_GREEN_LINE_RGBA_STRING = 'rgba(83, 165, 81, 1.0)';
const CONST_RED_LINE_RGBA_STRING = 'rgba(203, 68, 74, 1.0)';
const CONST_GREEN_TOP_GRADIENT_RGBA_STRING = 'rgba(83, 255, 81, 1.0)';
const CONST_RED_TOP_GRADIENT_RGBA_STRING = 'rgba(255, 68, 74, 1.0)';

if (typeof exports !== 'undefined') {
    exports.CONST_HTTPS_PREFIX = CONST_HTTPS_PREFIX;
    exports.CONST_HTTP_PREFIX = CONST_HTTP_PREFIX;

    exports.CONST_ZILWATCH_ROOT_URL = CONST_ZILWATCH_ROOT_URL;
    exports.CONST_ZILSWAP_ARK_ROOT_URL = CONST_ZILSWAP_ARK_ROOT_URL;
    exports.CONST_STATS_ZILSWAP_ROOT_URL = CONST_STATS_ZILSWAP_ROOT_URL;
    exports.CONST_STATS_XCAD_DEX_ROOT_URL = CONST_STATS_XCAD_DEX_ROOT_URL;

    exports.CONST_ZILSWAP_ARK_USER_PROFILE_URL = CONST_ZILSWAP_ARK_USER_PROFILE_URL;
    exports.CONST_ZILSWAP_ARK_USER_DETAILS = CONST_ZILSWAP_ARK_USER_DETAILS;
    exports.CONST_ZILSWAP_ARK_WALLET_ADDRESS_REPLACE_TAG = CONST_ZILSWAP_ARK_WALLET_ADDRESS_REPLACE_TAG;

    exports.CONST_META_VIEWBLOCK_IO = CONST_META_VIEWBLOCK_IO;
    exports.CONST_ZILSWAP_REWARD_DISTRIBUTOR_ADDRESS_BASE16 = CONST_ZILSWAP_REWARD_DISTRIBUTOR_ADDRESS_BASE16;

    exports.CONST_VIEWBLOCK_ROOT_URL = CONST_VIEWBLOCK_ROOT_URL;
    exports.CONST_VIEWBLOCK_SUFFIX_PARAM_NFT_ID = CONST_VIEWBLOCK_SUFFIX_PARAM_NFT_ID;
    exports.CONST_VIEWBLOCK_LOGO_DARK_SUFFIX = CONST_VIEWBLOCK_LOGO_DARK_SUFFIX;

    exports.CONST_ZIL_LOGO_URL = CONST_ZIL_LOGO_URL;

    exports.CONST_INTERNAL_CORS_PROXY_PREFIX = CONST_INTERNAL_CORS_PROXY_PREFIX;

    exports.CONST_WHITE_TRANSPARENT_RGBA_STRING = CONST_WHITE_TRANSPARENT_RGBA_STRING;
    exports.CONST_BLACK_TRANSPARENT_RGBA_STRING = CONST_BLACK_TRANSPARENT_RGBA_STRING;
    exports.CONST_GREEN_LINE_RGBA_STRING = CONST_GREEN_LINE_RGBA_STRING;
    exports.CONST_RED_LINE_RGBA_STRING = CONST_RED_LINE_RGBA_STRING;
    exports.CONST_GREEN_TOP_GRADIENT_RGBA_STRING = CONST_GREEN_TOP_GRADIENT_RGBA_STRING;
    exports.CONST_RED_TOP_GRADIENT_RGBA_STRING = CONST_RED_TOP_GRADIENT_RGBA_STRING;
}