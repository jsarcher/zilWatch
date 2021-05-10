// Assumes zrcTokenPropertiesListMap is declared
// Assumes ssnListMap is declared

document.addEventListener("DOMContentLoaded", () => {
    // Get the user's theme preference from local storage, if it's available
    let currentTheme = localStorage.getItem("theme");
    if (currentTheme === "light") {
        setThemeLightMode();
    } else {
        setThemeDarkMode();
    }

    let currentCurrencyCode = localStorage.getItem("currency");
    if (!currentCurrencyCode) {
        currentCurrencyCode = "usd";
    }
    let currencySymbol = currencyMap[currentCurrencyCode];
    $("#currency_selector").val(currentCurrencyCode);
    $(".currency_symbol").text(currencySymbol);
    
    // Public information
    computeZilPriceInFiat(currentCurrencyCode, onZilFiatPriceLoaded);

    // This is unrelated to balance and the APIs used for personalized dashboard
    // So don't need to reload.
    computeZrcTokensPriceInZil(onZilswapDexStatusLoaded);
    compute24hLpTradeVolume(onLpTradeVolumeLoaded);

    computeLpEpochInfo(onLpCurrentEpochInfoLoaded);
});

window.addEventListener("load", async () => {
    let zilpayStatus = checkZilpayStatus();
    bindViewMainContainer(zilpayStatus);
    if (ZilpayStatus.connected !== zilpayStatus) {
        return;
    }

    // Subscribe if there are changes with the account
    window.zilPay.wallet.observableAccount().subscribe(account => {
        refreshMainContentData(account);
    });

    // Subscribe if there are changes with network
    window.zilPay.wallet.observableNetwork().subscribe(() => {
        bindViewMainContainer(checkZilpayStatus());
    });

    if (window.zilPay.wallet.isConnect) {
        refreshMainContentData(window.zilPay.wallet.defaultAccount);
    }
});

$("#wallet_connect").click(function () {
    window.zilPay.wallet.connect().then(
        function (isUnlockSuccessful) {
            console.log("Wallet connect unlock successful: " + isUnlockSuccessful);
            if (isUnlockSuccessful) {
                refreshMainContentData(window.zilPay.wallet.defaultAccount)
            }
        },
        function () {
            console.log("Wallet connect failed!");
        }
    );
});

$("#wallet_refresh").click(function () {
    window.location.reload();
});

$("#toggle_theme_btn").click(function() {
    let isCurrentDark = $("html").hasClass("dark-mode");
    let theme;
    if (isCurrentDark) {
        theme = "light";
        setThemeLightMode();
    } else {
        theme = "dark";
        setThemeDarkMode();
    }
    // Finally, let's save the current preference to localStorage to keep using it
    localStorage.setItem("theme", theme);
});

$( "#currency_selector" ).change(function() {
    let currencyCode = $(this).val();
    computeZilPriceInFiat( currencyCode, onZilFiatPriceLoaded);
    localStorage.setItem("currency", currencyCode);
});

function collapsePublicCards() {
    $('.card-header').addClass('collapsed');
    $('.card-body').removeClass('show');
}

function refreshMainContentData(account) {
    // (1) Collapse all public cards.
    collapsePublicCards();

    // (2) Refresh login button state
    bindViewLoggedInButton(censorBech32Address(account.bech32));

    // (3) Reset main content
    resetMainContainerContent();

    // (4) show main screen
    bindViewMainContainer(ZilpayStatus.connected);

    // (5) Get ZIL balance, async.
    computeZilBalance(account, onZilWalletBalanceLoaded);

    // (6) Get ZRC-2 tokens price & ZRC-2 tokens LP balances in Zilswap, async.
    // Do this together because they are one API call, using the same data.
    computeZrcTokensPriceAndZilswapLpBalance(onZilswapDexStatusLoaded, account);

    // (7) Get ZRC-2 tokens balances, async.
    computeZrcTokensBalance(account, zrcTokenPropertiesListMap, onZrcTokenWalletBalanceLoaded);

    // (8) Get Potential LP reward next epoch and time duration counter to the next epoch, async
    computeTotalLpRewardNextEpoch(account, onLpRewardNextEpochLoaded);

    // (9) Get ZIL staking balance, async
    computeZilStakingBalance(account, onZilStakingBalanceLoaded);
    computeZilStakingWithdrawalPendingBalance(account, onZilStakingWithdrawalPendingBalanceLoaded);

    // (10) Get CARBON stakin balance, async
    computeCarbonStakingBalance(account, onCarbonStakingBalanceLoaded);
}
