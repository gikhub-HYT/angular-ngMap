angular.module("app", ["ngMap"]).controller("mapCtrl", [
  "$scope",
  "$http",
  function($scope, $http) {
    var mapDataUrl = "data/mapdata/"
    //散点数据
    var sData = [
      {
        name: "青岛",
        value: [120.33, 36.07, 80]
      },
      {
        name: "泉州",
        value: [118.58, 24.93, 20]
      },
      {
        name: "东莞",
        value: [113.75, 23.04, 40]
      }
    ]
    var testData = {
      name: "齐齐哈尔",
      value: [123.97, 47.33]
    }

    $scope.data = sData

    $scope.add = function() {
      $scope.data.push(testData)
    }

    

    //获取中国地图信息，这一步为必须
    $http.get(mapDataUrl + "china.json").then(function(data) {
      $scope.mapData0 = data.data
      $scope.mapData1 = data.data
      $scope.mapData2 = data.data
      console.log("地图数据", data.data)
    })

    //定义点击事件回调函数
    $scope.click0 = function(param) {
      console.log("散点分布", param)
      $scope.data.push(testData)
      console.log("数据", $scope.data)
    }

    $scope.click1 = function(param) {
      console.log("同图显示", param)
      var target = param.data.id
      $scope.mapType1 = param.data.name
      $http
        .get(mapDataUrl + "geometryProvince/" + target + ".json")
        .then(function(data) {
          console.log("回调数据", data.data)
          $scope.mapData1 = data.data
        })
    }

    $scope.click2 = function(param) {
      console.log("省市分离", param)
      var target = param.data.id
      $scope.mapType2 = param.data.name
      $http
        .get(mapDataUrl + "geometryProvince/" + target + ".json")
        .then(function(data) {
          console.log("回调数据", data.data)
          $scope.mapData2 = data.data
        })
    }
  }
])
