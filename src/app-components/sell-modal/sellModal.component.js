(function () {
    'use strict';

    angular
        .module('app')
        .component('sellModal', {
            templateUrl: 'app-components/sell-modal/sellModal.html',
            bindings: {
                modalInstance: "<",
                resolve: "<"
            },
            controller: SellModalController
        });

    SellModalController.$inject = ['UserService', 'FlashService', 'blockUI']

    function SellModalController(UserService, FlashService, blockUI) {
        const vm = this;

        vm.user = null;
        vm.modalData = null;
        vm.summary = null;
        vm.isDisabled = null;
        vm.close = close;
        vm.dismiss = dismiss;
        vm.sellCurrency = sellCurrency;
        vm.updateCurrencyCount = updateCurrencyCount;

        vm.$onInit = init;

        function init() {
            vm.modalData = vm.resolve.modalData;

            UserService.GetCurrent()
                .then(function (user) {
                    vm.user = user;
                    blockUI.stop();
                })
                .catch(function (err) {
                    console.log(err);
                    blockUI.start();
                });
        }

        function updateCurrencyCount() {  
            vm.summary = vm.modalData.count * vm.modalData.price;
            
            ((vm.user.user[vm.modalData.code.toLowerCase()] - vm.modalData.count) < 0 || vm.modalData.count < 1) ?
                vm.isDisabled = true :
                vm.isDisabled = false;  
        }

        function sellCurrency() {
            if(vm.modalData.count > 0) {
                vm.user.value = vm.user.value + vm.summary;
                vm.user.user[vm.modalData.code.toLowerCase()] = vm.user.user[vm.modalData.code.toLowerCase()] - vm.modalData.count;
                vm.user.currencyExchange[vm.modalData.code.toLowerCase()] = vm.user.currencyExchange[vm.modalData.code.toLowerCase()] + vm.modalData.count;
                
                UserService.Update(vm.user)
                    .then(function () {
                        FlashService.Success('Data updated');
                        vm.modalInstance.close();
                    })
                    .catch(function (error) {
                        FlashService.Error(error);
                    });
            } else {
                FlashService.Error('Enter a valid data');
            }
        }

        function close() {
            blockUI.stop();
            vm.modalInstance.close(vm.modalData);
        }

        function dismiss() {
            vm.modalInstance.dismiss('cancel');
        }
    }
})();