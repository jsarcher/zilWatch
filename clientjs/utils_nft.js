
class UtilsNft {

    constructor(nftTokenPropertiesListMap) {
        // Private variable
        this.nftTokenPropertiesListMap_ = nftTokenPropertiesListMap; // Refer to constants.js for definition
    }

    computeAndBindViewSingleNft(nftTicker, singleNftAttr, sessionUuidObj) {
        // Bind the card view first before loading the NFT image asset
        this.bindViewSingleNftCard(nftTicker, singleNftAttr);

        let imageDictPathArr = this.nftTokenPropertiesListMap_[nftTicker].image_dict_path;
        let isNeedUriCorsProxy = false;
        if ('is_need_uri_cors_proxy' in this.nftTokenPropertiesListMap_[nftTicker]) {
            isNeedUriCorsProxy = this.nftTokenPropertiesListMap_[nftTicker].is_need_uri_cors_proxy;
        }
        if (imageDictPathArr.length === 0) {
            this.bindViewSingleNftImage(nftTicker, singleNftAttr, singleNftAttr.uri);
        } else {
            this.computeSingleNftImageRpc(nftTicker, singleNftAttr, imageDictPathArr, isNeedUriCorsProxy, sessionUuidObj);
        }
    }

    bindViewSingleNftImage(nftTicker, singleNftAttr, nftImageSrc) {
        // First logic: if we want to replace the prefix image URL from blockchain to a CDN 
        if ('image_url_replace_from' in this.nftTokenPropertiesListMap_[nftTicker] && 'image_url_replace_to' in this.nftTokenPropertiesListMap_[nftTicker]) {
            nftImageSrc = nftImageSrc.replace(this.nftTokenPropertiesListMap_[nftTicker].image_url_replace_from, this.nftTokenPropertiesListMap_[nftTicker].image_url_replace_to);
            if ('image_url_replace_to_suffix' in this.nftTokenPropertiesListMap_[nftTicker]) {
                nftImageSrc += this.nftTokenPropertiesListMap_[nftTicker].image_url_replace_to_suffix;
            }
        }
        // Second logic: if we want to get the image URL using the ID of the nft using a CDN
        if ('image_url_by_id' in this.nftTokenPropertiesListMap_[nftTicker]) {
            nftImageSrc = this.nftTokenPropertiesListMap_[nftTicker].image_url_by_id + '/' + singleNftAttr.id;
            if ('image_url_by_id_suffix' in this.nftTokenPropertiesListMap_[nftTicker]) {
                nftImageSrc += this.nftTokenPropertiesListMap_[nftTicker].image_url_by_id_suffix;
            }
        }
        // Third logic: if there is no http in the starting of the image URL, it's an IPFS ID, we add the prefix.
        if (!nftImageSrc.startsWith('http')) {
            nftImageSrc = "https://gateway.ipfs.io/ipfs/" + nftImageSrc;
        }

        // Bind the NFT image asset to the img view
        $('#' + nftTicker + '_' + singleNftAttr.id).attr('src', nftImageSrc);
    }

    bindViewSingleNftCard(nftTicker, singleNftAttr) {
        let zilswapHref = CONST_ZILSWAP_ARK_ROOT_URL + '/' + this.nftTokenPropertiesListMap_[nftTicker].address + '/' + singleNftAttr.id;
        let viewblockHref = CONST_VIEWBLOCK_ROOT_URL + '/' + this.nftTokenPropertiesListMap_[nftTicker].address + '/?' + CONST_VIEWBLOCK_SUFFIX_PARAM_NFT_ID + singleNftAttr.id;
        let singleNftAttributesHref = null;
        let nftTokenLogo = null;
        if ('website_nft_attributes_prefix' in this.nftTokenPropertiesListMap_[nftTicker]) {
            singleNftAttributesHref = this.nftTokenPropertiesListMap_[nftTicker].website_nft_attributes_prefix + "/" + singleNftAttr.id;
            nftTokenLogo = this.nftTokenPropertiesListMap_[nftTicker].logo_url;
        }

        if (isCurrentDarkMode()) {
            zilswapHref += CONST_VIEWBLOCK_LOGO_DARK_SUFFIX;
            viewblockHref += CONST_VIEWBLOCK_LOGO_DARK_SUFFIX;
            if (singleNftAttributesHref && isContainsMetaViewBlock(singleNftAttributesHref)) {
                singleNftAttributesHref += CONST_VIEWBLOCK_LOGO_DARK_SUFFIX;
            }
            if (nftTokenLogo && isContainsMetaViewBlock(nftTokenLogo)) {
                nftTokenLogo += CONST_VIEWBLOCK_LOGO_DARK_SUFFIX;
            }
        }

        let isZilswapArkSupported = false;
        if ('is_zilswap_ark_supported' in this.nftTokenPropertiesListMap_[nftTicker]) {
            isZilswapArkSupported = this.nftTokenPropertiesListMap_[nftTicker].is_zilswap_ark_supported;
        }
        let singleNftTemplate = this.getSingleNftHtmlTemplate(nftTicker, singleNftAttr.id, viewblockHref, zilswapHref, singleNftAttributesHref, nftTokenLogo, isZilswapArkSupported);
        $('#' + nftTicker + '_content_list').append(singleNftTemplate)

        $('#empty_nft_container').hide();
        $('#' + nftTicker + '_container').show();
    }

    getSingleNftHtmlTemplate(nftTicker, nftId, viewblockHref, zilswapHref, singleNftAttributesHref, nftTokenLogo, isZilswapArkSupported) {
        let viewblockLogo = "https://cdn.viewblock.io/viewblock-light.png";
        if (isCurrentDarkMode()) {
            viewblockLogo = "https://cdn.viewblock.io/viewblock-dark.png";
        }

        let htmlTemplate = "<div class='col-6 col-lg-4 col-xl-3' style='padding: 0.35rem;' >" +
            "<div class='card' >" +
            "<img id='" + nftTicker + "_" + nftId + "' class='card-img-top' src='/images/image_placeholder_shimmer.gif' alt='NFT " + nftTicker + " " + nftId + "' loading='lazy' />" +
            "<div class='card-body'>" +
            "<div class='card-title'>" +
            "<span class='h5 font-weight-bold'>" + nftTicker + " #" + nftId + "</span>" +
            "</div>" +
            "<a class='mini-button-box mr-1' href='" + viewblockHref + "' target='_blank' >" +
            "<img height='20' src='" + viewblockLogo + "' alt='ViewBlock logo' />" +
            "<i class='fa fa-external-link ml-2 mr-1'></i>" +
            "</a>";
        if (isZilswapArkSupported) {
            htmlTemplate += "<a class='mini-button-box mr-1' href='" + zilswapHref + "' target='_blank' >" +
                "<img height='20' src='https://meta.viewblock.io/ZIL.zil1p5suryq6q647usxczale29cu3336hhp376c627/logo' alt='ZilSwap logo' />" +
                "<i class='fa fa-external-link ml-2 mr-1'></i>" +
                "</a>";
        }
        if (singleNftAttributesHref && nftTokenLogo) {
            htmlTemplate += "<a class='mini-button-box mr-1' href='" + singleNftAttributesHref + "' target='_blank' >" +
                "<img height='20' src='" + nftTokenLogo + "' alt='" + nftTicker + " logo' />" +
                "<i class='fa fa-external-link ml-2 mr-1'></i>" +
                "</a>";
        }
        "</div>" +
        "</div>" +
        "</div>";
        return htmlTemplate;
    }

    computeSingleNftImageRpc(nftTicker, singleNftAttr, imageDictPathArr, isNeedUriCorsProxy, sessionUuidObj) {
        // Copy the unique UUID here to make sure when the Ajax finishes, it's from the same Id
        let beforeAjaxSessionUuid = sessionUuidObj.uuid;

        // If URL doesn't start with http, it's an IPFS ID, we add the prefix.
        let currUri = singleNftAttr.uri;
        if (!currUri.startsWith('http')) {
            currUri = "https://gateway.ipfs.io/ipfs/" + currUri;
        }
        // Only add CORS rerouting only for certain NFTs with custom API endpoints.
        if (isNeedUriCorsProxy) {
            currUri = CONST_INTERNAL_CORS_PROXY_PREFIX + currUri;
        }
        let self = this;
        queryUrlGetAjax(
            /* urlToGet= */
            currUri,
            /* successCallback= */
            function (data) {
                let afterAjaxSessionUuid = sessionUuidObj.uuid;
                // If UUID is not the same, means the query is stale, do nothing.
                if (beforeAjaxSessionUuid !== afterAjaxSessionUuid) {
                    return;
                }
                if (!data) {
                    return;
                }
                let tempDict = data;
                for (let i = 0; i < imageDictPathArr.length; i++) {
                    tempDict = tempDict[imageDictPathArr[i]];
                }
                self.bindViewSingleNftImage(nftTicker, singleNftAttr, tempDict);
            },
            /* errorCallback= */
            function () {});
    }
}
