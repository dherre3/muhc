angular.module('ui.bootstrap.demo', ['checklist-model','ui.bootstrap']);
angular.module('ui.bootstrap.demo').controller('ModalDemoCtrl', function ($scope, $modal, $log, $http) {

  $scope.$parent.user = {
  };

  $http.get("http://172.26.66.41/devDocuments/screens/php/getResources.php").success(function (data) {
        $scope.Resources = data; // must be within success function to automatically call $apply
    });

  $scope.animationsEnabled = true;

  $scope.open = function (size) {

    var modalInstance = $modal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
        Resources: function () {
          return $scope.Resources;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.user = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  $scope.toggleAnimation = function () {
    $scope.animationsEnabled = !$scope.animationsEnabled;
  };

});

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

angular.module('ui.bootstrap.demo').controller('ModalInstanceCtrl', function ($scope, $modalInstance, Resources) {

  $scope.Resources = Resources; // get the list of resources from the main controller above and provide 
				// it to the scope

  // User clicks ok - return the list of selected Resources
  $scope.ok = function () {
    $modalInstance.close($scope.user);
  };

  // User clicks cancel - return nothing
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  // Initially selected resource - even if nothing is initially selected we should initial the array here
  $scope.user = $scope.$parent.user;

  $scope.allChecked = false;

  $scope.checkAll = function() {
    if(!$scope.allChecked) {
      $scope.user.Resources = angular.copy($scope.Resources);
      $scope.allChecked = true;
    } else {
      $scope.user.Resources = [];
      $scope.allChecked = false;
    }
  };

  $scope.uncheckAll = function() {
    $scope.user.Resources = [];
  };



});
