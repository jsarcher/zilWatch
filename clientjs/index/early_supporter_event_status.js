/** A class to run early supporter event.  */
class EarlySupporterEventStatus {

    constructor() {
        this.earlySupporterAddressBech32_ = 'zil1lwehmckuqqqzzqrhll5wcqq8k7kdamgnsvn3sa';
        this.earlySupporterAddressBase16_ = '0xfbb37de2dc0000210077ffe8ec0007b7acdeed13';
        this.bindViewContract(this.earlySupporterAddressBech32_);

        this.defaultGasLimitZil_ = 10;
        this.defaultBlock_ = 99999999;
        this.endBlock_ = 1805231;

        this.currentBlock_ = this.defaultBlock_;

        // private variable
        this.scState_ = null;
        this.walletAddressBase16_ = null;
    }

    hasEnded() {
        if (this.currentBlock_ > this.endBlock_) {
            return true;
        }
        return false;
    }

    onNewBlockStatusChange(blockNum) {
        // Try to consume the block Num
        try {
            let blockNumInt = parseInt(blockNum);
            this.currentBlock_ = blockNumInt;
            this.computeAndBindViewTimer();
        } catch (err) {
            console.log(err);
        }
        // Just recompute for every new block status change
        this.computeDataRpc(function() {}, function() {}, function() {});
    }

    setWalletAddressBase16(walletAddressBase16) {
        // Need to reset the attributes when wallet is changed.
        this.reset();
        this.walletAddressBase16_ = walletAddressBase16.toLowerCase();
        this.computeDataRpc(
            /* beforeRpcCallback= */
            function () {},
            /* onSuccessCallback= */
            function () {},
            /* onErrorCallback= */
            function () {});
    }

    reset() {
        this.bindViewWalletCanRegister();
    }

    computeAndBindView() {
        if (this.hasEnded()) {
            this.bindViewEnded();
            return;
        }
        if (!this.scState_) {
            return;
        }
        // Check if current wallet is registered from sc state
        let isWalletRegistered = false;
        if (this.walletAddressBase16_) {
            try {
                let walletMap = this.scState_.result.map_wallets;
                if (this.walletAddressBase16_ in walletMap) {
                    isWalletRegistered = true;
                }
            } catch (err) {
                console.log(err);
            }
        }

        if (isWalletRegistered) {
            this.bindViewWalletAlreadyRegistered();
        } else {
            this.bindViewWalletCanRegister();
        }
    }

    computeAndBindViewTimer() {
        if (this.hasEnded()) {
            return;
        }
        // Still default, no need to do anything.
        if (this.endBlock_ === this.defaultBlock_) {
            return;
        }

        let blockNumDifference = this.endBlock_ - this.currentBlock_;
        let timeDiffDays = blockNumDifference / 2550.0; // Assuming 2550 blocks per day
        let timeDiffSeconds = timeDiffDays * 24 * 60 * 60;

        let timeDiffDuration = new Duration(timeDiffSeconds);

        this.bindViewTimerCountdown(timeDiffDuration.getUserFriendlyString());
    }

    computeDataRpc(beforeRpcCallback, onSuccessCallback, onErrorCallback) {
        if (!this.walletAddressBase16_) {
            return;
        }
        beforeRpcCallback();
        let self = this;
        queryZilliqaApiAjax(
            /* method= */
            "GetSmartContractSubState",
            /* params= */
            [this.earlySupporterAddressBase16_.substring(2), "map_wallets", [this.walletAddressBase16_]],
            /* successCallback= */
            function (data) {
                self.scState_ = data;
                self.computeAndBindView();
                onSuccessCallback();
            },
            /* errorCallback= */
            function () {
                onErrorCallback();
            });
    }

    bindViewContract(contractAddressBech32) {
        let viewblockHref = 'https://viewblock.io/zilliqa/address/' + contractAddressBech32;
        $('#early_supporter_event_contract_anchor').attr('href', viewblockHref);
        $('#early_supporter_event_contract_anchor').text(censorBech32Address(contractAddressBech32));
    }

    bindViewTimerCountdown(timeDurationString) {
        $('#early_supporter_event_timer_countdown').text(timeDurationString);
    }
    
    bindViewEnded() {
        $('#early_supporter_event_already_registered').hide();
        $('#early_supporter_event_register').hide();
        $('#early_supporter_event_ended').show();
    }

    bindViewWalletAlreadyRegistered() {
        $('#early_supporter_event_register').hide();
        $('#early_supporter_event_ended').hide();
        $('#early_supporter_event_already_registered').show();
    }

    bindViewWalletCanRegister() {
        $('#early_supporter_event_ended').hide();
        $('#early_supporter_event_already_registered').hide();
        $('#early_supporter_event_register').show();
    }

    registerWalletSendTxn() {
        let gasPriceInZil = 1.0 * GAS_PRICE / Math.pow(10, 12);
        let gasLimit = Math.ceil(this.defaultGasLimitZil_ / gasPriceInZil);

        this.registerWallet(gasLimit)
            .then(function (data) {
                let txnHash = 'unknown_hash';
                if (data.ID) {
                    txnHash = data.ID.toLowerCase();
                }
                txnHash = '0x'+ txnHash;
                let anchorTxn = '<a href="https://viewblock.io/zilliqa/tx/' + txnHash + '" target="_blank" style="color: var(--cyan);">View in viewblock.</a>';
                $('#early_supporter_event_register_button').hide();
                $('#early_supporter_event_register_message').html('Txn sent! ' + anchorTxn);
                $('#early_supporter_event_register_message').show();

                console.log("RegisterWallet completed! ", txnHash);
            })
            .catch(function (err) {
                console.warn("RegisterWallet failed! ", err);
            });
    }

    async registerWallet(customGasLimit){
        try {
          return window.zilPay.contracts.at(this.earlySupporterAddressBase16_).call(
            'RegisterWallet',
            [],
            {
              amount: 0,
              gasPrice: 2000000000,
              gasLimit: customGasLimit,
            }
          );
  
        } catch (err) {
            console.log('Failed to register wallet: ' + err);
        }
      }
}

$('#early_supporter_event_register_button').on('click', function () {
    // If this is true, means wallet is not connected
    if ($('.wallet_connect_button:first').css('display') !== 'none') {
        alert("Please connect your ZilPay wallet to register!");
    }
    earlySupporterEventStatus.registerWalletSendTxn();
});
