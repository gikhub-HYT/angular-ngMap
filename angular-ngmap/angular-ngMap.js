angular.module("ngMap", []).directive("ngMap", [
  function() {
    return {
      restrict: "EA",
      scope: {
        theme: "@?", //图表主题
        bgColor: "=?", //图表背景颜色，支持十六进制，八进制，参数类型：string
        colors: "=?", //柱或者线颜色，参数类型：字符串数组，例如:['red','green','#eeeeee']
        loading: "=?", //显示加载状态，参数类型:boolean
        title: "=?", //图表标题，参数类型:string
        titlePosition: "=?", //标题位置，参数类型：string array，例:['top','left']，默认居中
        titleColor: "=?", //标题颜色设置，支持十六进制，八进制，参数类型：string
        titleSize: "=?", //标题字体大小设置，参数类型:number
        legendIcon: "=?", //图例样式图标，参数类型:string,可选:circle
        legendPosition: "=?", //图例组件位置设置，参数类型：string array，例:['bottom','center']，默认居中
        legendVertical: "=?", //图例组件是否为纵向排布，参数类型:boolean，不传参时默认false,横向布局
        closeLegend: "=?", //关闭图例组件，参数类型:boolean，不传参时默认false，即开启图例组件
        closeTooltip: "=?", //关闭提示框，参数类型:boolean，不传该参数默认为false，即不关闭
        sData: "=?", //系列散点数据
        sType: "=?", //系列数据类型，默认散点图
        sName: "=?", //系列数据名称
        mapData: "=", //地图信息数据
        mapType: "=?", //对应地图名称
        mapLink: "=?", //是否设置为地图三级联动，参数类型:boolean，缺省默认为false，即散点地图
        mapSepara: "=?", //地图视图分割，参数类型:boolean,缺省为false，即单视图地图，设置为true即多视图
        layoutPosition0: "=?", //设置地图第一视图（单视图）位置
        layoutPosition1: "=?", //设置地图第二视图（多视图）位置
        layoutSize0: "=?", //设置地图第一视图（单视图）大小
        layoutSize1: "=?", //设置地图第二视图（多视图）大小
        events: "=?", //事件数组，参数类型:array
        clickEvent: "=?", //点击事件，参数类型:function
        mouseoverEvent: "=?" //鼠标滑动事件，参数类型:function
      },
      link: function(scope, element) {
        var geo = {
          map: "china",
          roam: false,
          scaleLimit: {
            min: 1,
            max: 5
          },
          itemStyle: {
            normal: {
              areaColor: "#CCCCCC",
              borderColor: "#111"
            },
            emphasis: {
              areaColor: "#FFD322"
            }
          },
          label: {
            normal: {
              show: true,
              color: "#000",
              position: [50, 50]
            },
            emphasis: {
              show: true,
              color: "#fff"
            }
          },
          layoutCenter: ["50%", "50%"],
          layoutSize: "100%",
          regions: [
            {
              name: "内蒙古",
              label: {
                normal: {
                  show: true,
                  color: "#000",
                  position: [50, 50]
                },
                emphasis: {
                  show: true,
                  color: "#fff",
                  position: "insideRight"
                }
              }
            }
          ],
          data: []
        }
        var seriesGeo = [
          {
            name: "",
            type: "scatter",
            coordinateSystem: "geo",
            data: [],
            symbolSize: 12,
            label: {
              normal: {
                show: false
              },
              emphasis: {
                show: false
              }
            },
            itemStyle: {
              emphasis: {
                color: "yellow",
                borderColor: "yellow",
                borderWidth: 2
              }
            }
          }
        ]
        var seriesMapLink = [
          {
            type: "map",
            mapType: "china",
            roam: false,
            scaleLimit: {
              min: 0.5,
              max: 2
            },
            geoIndex: 0,
            label: {
              normal: {
                show: false,
                color: "#000"
              },
              emphasis: {
                show: true,
                color: "#fff"
              }
            },
            itemStyle: {
              normal: {
                areaColor: "#CCCCCC",
                borderColor: "#111"
              },
              emphasis: {
                areaColor: "#FFD322"
              }
            },
            layoutCenter: ["30%", "50%"],
            layoutSize: "100%",
            data: []
          },
          {
            type: "map",
            mapType: "china",
            geoIndex: 0,
            label: {
              normal: {
                show: false,
                color: "#000"
              },
              emphasis: {
                show: true,
                color: "#fff"
              }
            },
            itemStyle: {
              normal: {
                areaColor: "#CCCCCC",
                borderColor: "#111"
              },
              emphasis: {
                areaColor: "#FFD322"
              }
            },
            layoutCenter: ["80%", "50%"],
            layoutSize: "60%",
            data: []
          }
        ]
        var option = {
          backgroundColor: "#fff",
          title: {
            text: "",
            left: "center",
            top: "10",
            textStyle: {
              color: "#000",
              fontSize: "16"
            }
          },
          legend: {
            data: []
          },
          tooltip: {
            trigger: "item",
            formatter: function(params) {
              return params.name
            }
          },
          textStyle: {
            fontSize: 12
          },
          series: []
        }

        //监听系列数据变化
        scope.$watch(
          function() {
            return scope.sData
          },
          function() {
            refreshChart(scope, option)
          },
          true
        )
        //监听地图数据变化
        scope.$watch(
          function() {
            return scope.mapData
          },
          function() {
            refreshChart(scope, option)
          },
          true
        )

        //参数初始化
        function paramInit(scope) {
          //默认为非联动模式
          scope.mapLink = scope.mapLink ? scope.mapLink : false
          //默认为不显示加载动画
          scope.loading = scope.loading ? scope.loading : false
          //联动模式下，默认省市分离
          scope.mapSepara = scope.mapSepara ? scope.mapSepara : false
        }
        //注册地图信息
        function registerMap(scope, mapType) {
          if (scope.mapData) {
            // console.log('注册地图信息',mapType,scope.mapData);
            echarts.registerMap(mapType, scope.mapData)
          }
        }
        //三级联动数据处理
        function mapLinkHandle(option, scope) {
          //改变地图类型,三级联动时启用
          if (scope.mapType && scope.mapLink) {
            if (scope.mapSepara) {
              option.series[0].mapType = "china"
              option.series[1].mapType = scope.mapType
            } else {
              option.series[0].mapType = scope.mapType
              option.series[1].mapType = null
            }
          }
          //处理传递过来的地图数据，三级联动时启用
          if (scope.mapData && scope.mapLink) {
            var features = scope.mapData.features
            var length = features.length
            if (scope.mapSepara) {
              option.series[1].data = []
            } else {
              option.series[0].data = []
            }
            if (length == 34) {
              angular.forEach(features, function(item) {
                var obj = {
                  value: "",
                  name: "",
                  id: ""
                }
                obj.id = item.properties.id
                obj.name = item.properties.name
                option.series[0].data.push(obj)
              })
            } else {
              if (scope.mapSepara) {
                angular.forEach(features, function(item) {
                  var obj = {
                    value: "",
                    name: "",
                    id: ""
                  }
                  obj.id = item.properties.id + "00"
                  obj.name = item.properties.name
                  option.series[1].data.push(obj)
                })
              } else {
                angular.forEach(features, function(item) {
                  var obj = {
                    value: "",
                    name: "",
                    id: ""
                  }
                  obj.id = item.properties.id + "00"
                  obj.name = item.properties.name
                  option.series[0].data.push(obj)
                })
              }
            }
          }
        }
        //非三级联动,即设置geo配套散点数据等
        function geoDrawChart(scope) {
          //设置图表类型,默认散点图
          if (scope.sType && !scope.mapLink) {
            option.series[0].type = scope.sType
          }
          //设置图表名称,默认散点图
          if (scope.sName && !scope.mapLink) {
            option.series[0].name = scope.sName
          }
          //在地图设置系列数据
          if (scope.sData && !scope.mapLink) {
            option.series[0].data = scope.sData
          }
        }
        //通过判断地图类型是否为联动,选择配置
        function setMapOption(option, scope) {
          //判断是否启用三级联动
          if (scope.mapLink) {
            delete option.geo
            option.series = seriesMapLink
            mapLinkHandle(option, scope)
          } else {
            option.geo = geo
            option.series = seriesGeo
            geoDrawChart(scope)
          }
        }
        //设置title
        function setTitle(option, scope) {
          //设置标题
          if (scope.title) {
            option.title.text = scope.title
          }
          //设置标题位置
          if (scope.titlePosition) {
            option.title.top = scope.titlePosition[0]
            option.title.left = scope.titlePosition[1]
          }
          //设置标题样式
          if (scope.titleColor) {
            option.title.textStyle.color = scope.titleColor
          }
          if (scope.titleSize) {
            option.title.textStyle.fontSize = scope.titleSize
          }
        }
        //设置颜色
        function setColors(option, scope) {
          //设置背景
          if (scope.bgColor) {
            option.backgroundColor = scope.bgColor || option.backgroundColor
          }
          //自定义数据颜色
          if (scope.colors) {
            option.color = scope.colors
          }
        }
        //设置图例组件
        function setLegend(option, scope) {
          //设置图例组件位置
          if (scope.legendPosition) {
            option.legend.top = scope.legendPosition[0]
            option.legend.left = scope.legendPosition[1]
          }
          //设置图例组件icon
          if (scope.legendIcon) {
            angular.forEach(seriesData, function(data, index) {
              var length = seriesData.length
              for (var i = 0; i < length; i++) {
                var obj = {
                  name: ""
                }
                obj.name = data.name
                legendData.push(obj)
              }
            })
          }
          //图例组件是否为纵向布局，默认横向
          if (scope.legendVertical) {
            option.legend.orient = "vertical"
          }
        }
        //设置tooltip
        function setTooltip(option, scope) {
          //是否关闭鼠标移入时的提示框，默认开启
          if (scope.closeTooltip) {
            option.tooltip.show = false
          }
        }
        //设置地图布局与大小
        function setLayout(option, scope) {
          if (scope.mapLink) {
            if (scope.layoutSize0) {
              option.series[0].layoutSize = scope.layoutSize0
            }
            if (scope.layoutPosition0) {
              option.series[0].layoutCenter = scope.layoutPosition0
            }
            if (scope.layoutSize1) {
              option.series[1].layoutSize = scope.layoutSize0
            }
            if (scope.layoutPosition1) {
              option.series[1].layoutCenter = scope.layoutPosition1
            }
          } else {
            if (scope.layoutSize0) {
              option.geo.layoutSize = scope.layoutSize0
            }
            if (scope.layoutPosition0) {
              option.geo.layoutCenter = scope.layoutPosition0
            }
          }
        }
        //注册事件
        function registerEvent(chart, scope) {
          //注册事件队列
          if (scope.events) {
            if (angular.isArray(scope.events)) {
              angular.forEach(scope.events, function(value, key) {
                for (var e in value) {
                  chart.on(e, value[e])
                }
              })
            }
          }
          if (scope.clickEvent) {
            chart.on("click", scope.clickEvent)
          }
          if (scope.mouseoverEvent) {
            chart.on("mouseover", scope.mouseoverEvent)
          }
        }
        //图表更新，当监测的数据发生更改，执行该方法
        function refreshChart(scope, option) {
          var theme = scope.theme ? scope.theme : "default"
          var mapType = scope.mapType ? scope.mapType : "china"
          var chart = echarts.init(element[0], theme)
          //初始化参数
          paramInit(scope)
          //注册地图信息
          registerMap(scope, mapType)
          //判断地图是否为联动类型，进行对应数据配置
          setMapOption(option, scope)
          //设置标题
          setTitle(option, scope)
          //设置颜色
          setColors(option, scope)
          //设置图例组件
          setLegend(option, scope)
          //设置地图布局
          setLayout(option, scope)
          //注册事件
          registerEvent(chart, scope)
          //设置tooltip
          setTooltip(option, scope)
          //是否显示鼠标移入的动画效果
          if (scope.hoverAnimation) {
            option.series[0].hoverAnimation = true
          }
          //是否显示数据加载时的动画
          if (scope.loading) {
            chart.showLoading()
          }
          //为true时为数据加载完毕，渲染界面
          if (!scope.loading) {
            chart.setOption(option)
            chart.resize()
            chart.hideLoading()
          }
        }
      }
    }
  }
])
