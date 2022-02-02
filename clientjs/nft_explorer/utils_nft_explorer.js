// utils_currency.js to handle currency changes in zilwatch

document.addEventListener("DOMContentLoaded", () => {
    let currentNftTicker = localStorage.getItem("nft-explorer-last-ticker");
    if (!currentNftTicker) {
        currentNftTicker = "BEAR";
    }

    if (typeof onNftExplorerTickerChangeCallback === "function") {
        onNftExplorerTickerChangeCallback(currentNftTicker);
    }

    $("#nft_ticker_selector").val(currentNftTicker);
});

$("#nft_ticker_selector").on('change', function () {
    let currentNftTicker = $(this).val();
    localStorage.setItem("nft-explorer-last-ticker", currentNftTicker);

    if (typeof onNftExplorerTickerChangeCallback === "function") {
        onNftExplorerTickerChangeCallback(currentNftTicker);
    }
});


$(".nft-page-selector").on('change', function () {
    let selectedPageNumber = parseInt($(this).val());
    if (typeof onNftExplorerPageChangeCallback === "function") {
        onNftExplorerPageChangeCallback(selectedPageNumber);
    }
});

$(".nft-prev-page-button").on('click', function () {
    if (typeof onNftExplorerPrevPageClickCallback === "function") {
        onNftExplorerPrevPageClickCallback();
    }
});

$(".nft-next-page-button").on('click', function () {
    if (typeof onNftExplorerNextPageClickCallback === "function") {
        onNftExplorerNextPageClickCallback();
    }
});
