function onNftExplorerTickerChangeCallback(nftTicker) {
    if (typeof nftExplorerStatus === 'undefined') {
        return;
    }

    nftExplorerStatus.setNftTicker(nftTicker);
    nftExplorerStatus.computeDataRpc(
        /* beforeRpcCallback= */
        function () {},
        /* onSuccessCallback= */
        function () {},
        /* onErrorCallback= */
        function () {});
}

function onNftExplorerPageChangeCallback(selectedPage) {
    if (typeof nftExplorerStatus === 'undefined') {
        return;
    }
    nftExplorerStatus.updatePageNumberAndBindView(selectedPage);
}

function onNftExplorerPrevPageClickCallback() {
    if (typeof nftExplorerStatus === 'undefined') {
        return;
    }
    nftExplorerStatus.updatePrevPageNumberAndBindView();
}

function onNftExplorerNextPageClickCallback() {
    if (typeof nftExplorerStatus === 'undefined') {
        return;
    }
    nftExplorerStatus.updateNextPageNumberAndBindView();
}
