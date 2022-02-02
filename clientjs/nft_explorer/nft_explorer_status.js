/** A class to obtain NFT related status.  */
class NftExplorerStatus {

    constructor(nftTokenPropertiesListMap, utilsNft) {
        // Private variable
        this.nftTokenPropertiesListMap_ = nftTokenPropertiesListMap; // Refer to constants.js for definition
        this.utilsNft_ = utilsNft;

        // Static var
        this.pageSize_ = 20;
        this.currPageNum_ = null;

        // private variable
        this.currNftTicker_ = null;
        this.nftUrisArr_ = null;

        this.sessionUuid_ = {};
        this.updateSessionUuid();
    }

    updateSessionUuid() {
        this.sessionUuid_.uuid = (Math.round(new Date().getTime())).toString();
    }

    setNftTicker(nftTicker) {
        // Need to reset the attributes when wallet is changed.
        this.reset();
        this.currNftTicker_ = nftTicker;
    }

    reset() {
        this.currPageNum_ = null;
        this.nftUrisArr_ = null;
        $('#' + this.currNftTicker_ + '_content_list').empty();
        $('#' + this.currNftTicker_ + '_container').hide();

        $('.nft-page-selector').empty();
        $('.nft-total-count').text('');
        $('.total-page-number').text('');
        $('.curr-page-number').text('');
        $('.nft-next-page-button').addClass('disabled');
        $('.nft-prev-page-button').addClass('disabled');
    }

    computeAndBindViewLoadedNft() {
        if (!this.currNftTicker_) {
            return;
        }
        if (!this.nftUrisArr_) {
            return;
        }
        let nftTotalCount = this.nftUrisArr_.length;
        let totalPage = Math.ceil(nftTotalCount / this.pageSize_);
        $('.nft-total-count').text(nftTotalCount);
        $('.total-page-number').text(totalPage);
        for (let i = 1; i <= totalPage; i++) {
            $('.nft-page-selector').append('<option value="' + i + '">' + i + '</option>')
        }
        this.updatePageNumberAndBindView(/* pageNumber= */ 1); // always start with page 1
    }

    updatePageNumberAndBindView(pageNumber) {
        if (!this.currNftTicker_) {
            return;
        }
        if (!this.nftUrisArr_) {
            return;
        }
        if (pageNumber < 1) {
            return;
        }
        let startIdx = (pageNumber - 1) * this.pageSize_;
        let endIdx = Math.min(startIdx + this.pageSize_, this.nftUrisArr_.length);

        if (startIdx >= this.nftUrisArr_.length) {
            console.log("Page number is invalid! Index out of bounds!");
            return;
        }
        this.currPageNum_ = pageNumber;
        $('.curr-page-number').text(pageNumber);
        this.enableDisablePrevNextButton();
        this.updateActivePageSelector();

        // Need to clear the current page first before appending on the same page
        this.updateSessionUuid();
        $('#' + this.currNftTicker_ + '_content_list').empty();
        for (let i = startIdx; i < endIdx; i++) {
            let singleNftAttr = this.nftUrisArr_[i];
            this.utilsNft_.computeAndBindViewSingleNft(this.currNftTicker_, singleNftAttr, this.sessionUuid_);
        }
    }

    updatePrevPageNumberAndBindView() {
        this.updatePageNumberAndBindView(this.currPageNum_ - 1);
    }

    updateNextPageNumberAndBindView() {
        this.updatePageNumberAndBindView(this.currPageNum_ + 1);
    }

    updateActivePageSelector() {
        $(".nft-page-selector").val(this.currPageNum_);
    }

    enableDisablePrevNextButton() {
        if (!this.nftUrisArr_) {
            $('.nft-prev-page-button').addClass('disabled');
            $('.nft-next-page-button').addClass('disabled');
            return;
        }

        let nftTotalCount = this.nftUrisArr_.length;
        let totalPage = Math.ceil(nftTotalCount / this.pageSize_);
        
        $('.nft-next-page-button').removeClass('disabled');
        $('.nft-prev-page-button').removeClass('disabled');

        if (this.currPageNum_ === 1) {
            $('.nft-prev-page-button').addClass('disabled');
        } 
        if (this.currPageNum_ >= totalPage) {
            $('.nft-next-page-button').addClass('disabled');
        }
    }

    computeDataRpc(beforeRpcCallback, onSuccessCallback, onErrorCallback) {
        if (!this.currNftTicker_) {
            return;
        }
        let nftTickerToQuery = this.currNftTicker_;

        beforeRpcCallback();
        let self = this;
        queryUrlGetAjax(
            /* urlToGet= */
            CONST_ZILWATCH_ROOT_URL + "/api/nft/uris" + "?nft_ticker=" + nftTickerToQuery + "&requester=zilwatch_dashboard",
            /* successCallback= */
            function (data) {
                if (!data) {
                    onErrorCallback();
                    return;
                }
                self.nftUrisArr_ = data;
                self.computeAndBindViewLoadedNft();

                onSuccessCallback();
            },
            /* errorCallback= */
            function () {
                onErrorCallback();
            });
    }
}