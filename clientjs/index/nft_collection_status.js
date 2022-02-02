/** A class to obtain NFT related status.  */
class NftCollectionStatus {

    constructor(nftTokenPropertiesListMap, utilsNft) {
        // Private variable
        this.nftTokenPropertiesListMap_ = nftTokenPropertiesListMap; // Refer to constants.js for definition
        this.utilsNft_ = utilsNft;

        // private variable
        this.walletAddressBase16_ = null;

        // A dict of NFTs that the wallet owns
        this.walletNftAttributesMap_ = null;

        this.sessionUuid_ = {};
        this.updateSessionUuid();
    }

    updateSessionUuid() {
        this.sessionUuid_.uuid = (Math.round(new Date().getTime())).toString();
    }

    setWalletAddressBase16(walletAddressBase16) {
        // Need to reset the attributes when wallet is changed.
        this.resetPersonal();
        this.walletAddressBase16_ = walletAddressBase16;
    }

    resetPersonal() {
        this.walletNftAttributesMap_ = null;
        for (let nftTicker in this.nftTokenPropertiesListMap_) {
            $('#' + nftTicker + '_content_list').empty();
            $('#' + nftTicker + '_container').hide();
        }
        $('#empty_nft_container').show();
    }

    computeAndBindViewAllNfts() {
        if (!this.walletNftAttributesMap_) {
            return;
        }
        this.updateSessionUuid();
        for (let nftTicker in this.walletNftAttributesMap_) {
            let currNftOwnedList = this.walletNftAttributesMap_[nftTicker];

            for (let i = 0; i < currNftOwnedList.length; i++) {
                let singleNftAttr = currNftOwnedList[i];
                this.utilsNft_.computeAndBindViewSingleNft(nftTicker, singleNftAttr, this.sessionUuid_);
            }
        }
    }

    computeDataRpc(beforeRpcCallback, onSuccessCallback, onErrorCallback) {
        if (!this.walletAddressBase16_) {
            return;
        }

        let walletAddressBase16Lower = this.walletAddressBase16_.toLowerCase();

        beforeRpcCallback();
        let self = this;
        queryUrlGetAjax(
            /* urlToGet= */
            CONST_ZILWATCH_ROOT_URL + "/api/nft" + "?wallet_address=" + walletAddressBase16Lower + "&requester=zilwatch_dashboard",
            /* successCallback= */
            function (data) {
                if (!data) {
                    onErrorCallback();
                    return;
                }
                self.walletNftAttributesMap_ = data;
                self.computeAndBindViewAllNfts();

                onSuccessCallback();
            },
            /* errorCallback= */
            function () {
                onErrorCallback();
            });
    }

}