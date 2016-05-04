angular.module('ui.bootstrap.demo', ['checklist-model','ui.bootstrap']);
angular.module('ui.bootstrap.demo').controller('ExamRoomModalCrtl', function ($scope, $modal, $log, $http) {


//  $scope.items = ['item1', 'item2', 'item3'];

  $http({
	url: "http://172.26.66.41/devDocuments/screens/php/getExamRooms.php",
	method: "GET",
	params: {IntermediateVenue: "S1 CLINIC"} 
  }).success(function (data) {
        $scope.items = data; // must be within success function to automatically call $apply
  });


  $scope.open = function (size) {

    var modalInstance = $modal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'ExamRoomModal.html',
      controller: 'ExamRoomModalInstanceCtrl',
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
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

angular.module('ui.bootstrap.demo').controller('ExamRoomModalInstanceCtrl', function ($scope, $modalInstance, items) {

  $scope.items = items;
  $scope.selected = {
  };

  $scope.ok = function () {
    $modalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});

