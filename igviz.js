(function () {

    var igviz = window.igviz || {};

    igviz.version = '1.0.0';

    igviz.val = 0;
    window.igviz = igviz;


    //Plots a chart in a given div specified by canvas
    igviz.plot = function (canvas, config, dataTable) {
        var chart = new Chart(canvas, config, dataTable);

        config = setDefault(config)

        if (config.chartType == "bar") {
            this.drawBarChart(chart, canvas, config, dataTable);
        } else if (config.chartType == "scatter") {
            this.drawScatterPlot(canvas, config, dataTable);
        } else if (config.chartType == "singleNumber") {
            this.drawSingleNumberDiagram(canvas, config, dataTable);
        } else if (config.chartType == "map") {
            this.drawMap(canvas, config, dataTable);
        } else if (config.chartType == "line") {
            this.drawLineChart(canvas, config, dataTable);
        } else if (config.chartType == "table") {
            this.drawTable(canvas, config, dataTable);
        } else if (config.chartType == "area") {
            this.drawAreaChart(chart);
        } else if (config.chartType == "arc") {
            this.drawArc(canvas, config, dataTable);
        }
        else if (config.chartType == "drill") {
            this.drillDown(0, canvas, config, dataTable, dataTable);
        }

        return chart;
        //return
    };

    igviz.setUp = function (canvas, config, dataTable) {
        var chart = new Chart(canvas, config, dataTable);

        config = setDefault(config)

        if (config.chartType == "bar") {
            this.drawBarChart(chart, canvas, config, dataTable);
        } else if (config.chartType == "scatter") {
            this.drawScatterPlot(canvas, config, dataTable);
        } else if (config.chartType == "singleNumber") {
            this.drawSingleNumberDiagram(canvas, config, dataTable);
        } else if (config.chartType == "map") {
            this.drawMap(canvas, config, dataTable);
        } else if (config.chartType == "line") {
            this.drawLineChart2(chart);
        } else if (config.chartType == "table") {
            this.drawTable(canvas, config, dataTable);
        } else if (config.chartType == "area") {
            this.drawAreaChart(chart);
        } else if (config.chartType == "arc") {
            this.drawArc(canvas, config, dataTable);
        }
        else if (config.chartType == "drill") {
            this.drillDown(0, canvas, config, dataTable, dataTable);
        }

        return chart;
        //return
    };

    igviz.drillDown = function drillDown(index, divId, chartConfig, dataTable, originaltable) {
        //	console.log(dataTable,chartConfig,divId);


        if (index == 0) {
            d3.select(divId).append('div').attr({id: 'links', height: 20, 'bgcolor': 'blue'})
            d3.select(divId).append('div').attr({id: 'chartDiv'})
            chartConfig.height = chartConfig.height - 20;
            divId = "#chartDiv";
        }
        var currentChartConfig = JSON.parse(JSON.stringify(chartConfig));
        var current_x = 0;
        if (index < chartConfig.xAxis.length)
            current_x = chartConfig.xAxis[index].index
        else
            current_x = chartConfig.xAxis[index - 1].child;

        var current_y = chartConfig.yAxis;
        var currentData = {
            metadata: {
                names: [dataTable.metadata.names[current_x], dataTable.metadata.names[current_y]],
                types: [dataTable.metadata.types[current_x], dataTable.metadata.types[current_y]]
            },
            data: []
        }

        var tempData = [];
        for (i = 0; i < dataTable.data.length; i++) {
            name = dataTable.data[i][current_x];
            currentYvalue = dataTable.data[i][current_y];
            isFound = false;
            var j = 0;
            for (; j < tempData.length; j++) {
                if (tempData[j][0] === name) {
                    isFound = true;
                    break;
                }
            }
            if (isFound) {
                tempData[j][1] += currentYvalue;
                console.log(name, currentYvalue, tempData[j][1]);
            } else {
                console.log("create", name, currentYvalue);
                tempData.push([name, currentYvalue])
            }
        }

        currentData.data = tempData;
        currentChartConfig.xAxis = 0;
        currentChartConfig.yAxis = 1;
        currentChartConfig.chartType = 'bar';


        var x = this.plot(divId, currentChartConfig, currentData);
        setTimeout(function () {

            var filters = d3.select('#links .root').on('click', function () {
                d3.select("#links").html('');
                igviz.drillDown(0, divId, chartConfig, originaltable, originaltable);

            })


            var filters = d3.select('#links').selectAll('.filter');
            filters.on('click', function (d, i) {

                filtersList = filters.data();

                console.log(filtersList)
                var filterdDataset = [];
                var selectionObj = JSON.parse(JSON.stringify(originaltable));
                itr = 0;
                for (l = 0; l < originaltable.data.length; l++) {
                    isFiltered = true;
                    for (k = 0; k <= i; k++) {

                        if (originaltable.data[l][filtersList[k][0]] !== filtersList[k][1]) {
                            isFiltered = false;
                            break;
                        }
                    }
                    if (isFiltered) {
                        filterdDataset[itr++] = originaltable.data[l];
                    }

                }

                d3.selectAll('#links g').each(function (d, indx) {
                    if (indx > i) {
                        this.remove();
                    }
                })


                selectionObj.data = filterdDataset;

                igviz.drillDown(i + 1, divId, chartConfig, selectionObj, originaltable, true);


            });


            if (index < chartConfig.xAxis.length) {
                console.log(x);
                d3.select(x.chart._el).selectAll('g.type-rect rect').on('click', function (d, i) {
                    // console.log(d, i, this);
                    console.log(d, i);
                    var selectedName = d.datum.data.x;
                    //  console.log(selectedName);
                    var selectedCurrentData = JSON.parse(JSON.stringify(dataTable));
                    var innerText;

                    var links = d3.select('#links').append('g').append('text').text(dataTable.metadata.names[current_x] + " : ").attr({

                        "font-size": "10px",
                        "x": 10,
                        "y": 20

                    });

                    d3.select('#links:first-child').selectAll('text').attr('class', 'root');

                    d3.select('#links g:last-child').append('span').data([[current_x, selectedName]]).attr('class', 'filter').text(selectedName + "  >  ")

                    var l = selectedCurrentData.data.length;
                    var newdata = [];
                    b = 0;
                    for (a = 0; a < l; a++) {
                        if (selectedCurrentData.data[a][current_x] === selectedName) {
                            newdata[b++] = selectedCurrentData.data[a];
                        }
                    }


                    selectedCurrentData.data = newdata;


                    igviz.drillDown(index + 1, divId, chartConfig, selectedCurrentData, originaltable, true);


                });

            }
        }, 10);


    }


    igviz.drillDownRoot = function (divId, chartConfig, dataTable) {
        var datasets = [
            {"category": "A", "position": 0, "value": 0.1},
            {"category": "A", "position": 1, "value": 0.6},
            {"category": "A", "position": 2, "value": 0.9},
            {"category": "A", "position": 3, "value": 0.4},
            {"category": "B", "position": 0, "value": 0.7},
            {"category": "B", "position": 1, "value": 0.2},
            {"category": "B", "position": 2, "value": 1.1},
            {"category": "B", "position": 3, "value": 0.8},
            {"category": "C", "position": 0, "value": 0.6},
            {"category": "C", "position": 1, "value": 0.1},
            {"category": "C", "position": 2, "value": 0.2},
            {"category": "C", "position": 3, "value": 0.7}
        ]

        var spec = {
            "width": 400,
            "height": 60,
            "data": [
                {
                    "name": "mydata"
                },
                {
                    "name": "table",
                    "source": 'mydata',
                    "transform": [
                        {
                            "type": "aggregate",
                            "groupby": ["data.category"],
                            "fields": [
                                {"op": "sum", "field": "data.value"}
                            ]
                        }
                    ]
                }
            ],
            "scales": [
                {
                    "name": "x",
                    "range": "width",
                    "nice": true,
                    "round": true,
                    "domain": {"data": "table", "field": "data.sum_value"}
                },
                {
                    "name": "y",
                    "type": "ordinal",
                    "range": "height",
                    "round": true,
                    "domain": {"data": "table", "field": "data.category"}
                }
            ],
            "axes": [
                {"type": "x", "scale": "x"},
                {"type": "y", "scale": "y"}
            ],
            "marks": [
                {
                    "type": "rect",
                    "from": {"data": "table"},
                    "properties": {
                        "enter": {
                            "x": {"scale": "x", "field": "data.sum_value"},
                            "x2": {"scale": "x", "value": 0},
                            "y": {"scale": "y", "field": "data.category"},
                            "height": {"scale": "y", "band": true, "offset": -1}
                        },
                        "update": {
                            "fill": {"value": "steelblue"}
                        },
                        "hover": {
                            "fill": {"value": "red"}
                        }
                    }
                }
            ]
        }

        igviz.drilling(0, divId, spec, datasets);

    }


    igviz.drilling = function (index, divId, spec, datasets) {


//        spec.
        vg.parse.spec(spec, function (chart) {
            // d3.select().selectAll("*").remove();
            var view = chart({
                el: divId,
                data: {mydata: datasets},
                renderer: 'svg'
            }).update();


            d3.select(view._el).selectAll('g.type-rect rect').on('click', function (d, i) {
                console.log(d, i, this);

            });
//            self.view=view.update();
        });
    }


    function setDefault(chartConfig) {
        var tickObj = {
            "textAngle": -60,
            "x": 0,
            "y": 9,
            "dy": ".15em",
            "dx": "-.8em",
            "tickHeight": 6,
            "tickWidth": 0
        }
        var xaxisObj = {
            "fontSize": "20px",
            "rotate": "",
            "x": 0,
            "y": 20,
            "dx": 0,
            "dy": ".71em"

        }

        var yaxisObj = {
            "fontSize": "20px",
            "rotate": -90,
            "x": -10,
            "y": 6,
            "dy": ".71em",
            "dx": 0
        }
        if (!chartConfig.hasOwnProperty("xAxisLabelConfig")) {
            chartConfig.xAxisLabelConfig = xaxisObj;
        } else {
            if (!chartConfig.xAxisLabelConfig.hasOwnProperty("fontSize"))
                chartConfig.xAxisLabelConfig.fontSize = xaxisObj.fontSize;

            if (!chartConfig.xAxisLabelConfig.hasOwnProperty("rotate"))
                chartConfig.xAxisLabelConfig.rotate = xaxisObj.rotate;

            if (!chartConfig.xAxisLabelConfig.hasOwnProperty("x"))
                chartConfig.xAxisLabelConfig.x = xaxisObj.x;

            if (!chartConfig.xAxisLabelConfig.hasOwnProperty("y"))
                chartConfig.xAxisLabelConfig.y = xaxisObj.y;

            if (!chartConfig.xAxisLabelConfig.hasOwnProperty("dx"))
                chartConfig.xAxisLabelConfig.dx = xaxisObj.dx;

            if (!chartConfig.xAxisLabelConfig.hasOwnProperty("dy"))
                chartConfig.xAxisLabelConfig.dx = xaxisObj.dy;
        }


        if (!chartConfig.hasOwnProperty("yAxisLabelConfig")) {
            chartConfig.yAxisLabelConfig = yaxisObj;
        } else {
            if (!chartConfig.yAxisLabelConfig.hasOwnProperty("fontSize"))
                chartConfig.yAxisLabelConfig.fontSize = yaxisObj.fontSize;

            if (!chartConfig.yAxisLabelConfig.hasOwnProperty("rotate"))
                chartConfig.yAxisLabelConfig.rotate = yaxisObj.rotate;

            if (!chartConfig.yAxisLabelConfig.hasOwnProperty("x"))
                chartConfig.yAxisLabelConfig.x = yaxisObj.x;

            if (!chartConfig.yAxisLabelConfig.hasOwnProperty("y"))
                chartConfig.yAxisLabelConfig.y = yaxisObj.y;

            if (!chartConfig.yAxisLabelConfig.hasOwnProperty("dx"))
                chartConfig.yAxisLabelConfig.dx = yaxisObj.dx;

            if (!chartConfig.yAxisLabelConfig.hasOwnProperty("dy"))
                chartConfig.yAxisLabelConfig.dx = yaxisObj.dy;
        }


        if (!chartConfig.hasOwnProperty("tickLabelConfig")) {
            chartConfig.tickLabelConfig = tickObj;
        } else {
            if (!chartConfig.tickLabelConfig.hasOwnProperty("textAngle"))
                chartConfig.tickLabelConfig.textAngle = tickObj.textAngle;

            if (!chartConfig.tickLabelConfig.hasOwnProperty("tickHeight"))
                chartConfig.tickLabelConfig.tickHeight = tickObj.tickHeight;

            if (!chartConfig.tickLabelConfig.hasOwnProperty("tickWidth"))
                chartConfig.tickLabelConfig.tickWidth = tickObj.tickWidth;

            if (!chartConfig.tickLabelConfig.hasOwnProperty("x"))
                chartConfig.tickLabelConfig.x = tickObj.x;

                                                                                                           if (!chartConfig.tickLabelConfig.hasOwnProperty("y"))
                chartConfig.tickLabelConfig.y = tickObj.y;

            if (!chartConfig.tickLabelConfig.hasOwnProperty("dx"))
                chartConfig.tickLabelConfig.dx = tickObj.dx;

            if (!chartConfig.tickLabelConfig.hasOwnProperty("dy"))
                chartConfig.tickLabelConfig.dx = tickObj.dy;
        }
        return chartConfig;
    }

    //TODO Fix x scale problems
    //TODO Add a grid if possible



    igviz.drawLineChart2=function(chartObj){
        divId=chartObj.canvas;
        chartConfig=chartObj.config;
        dataTable=chartObj.dataTable;
        table=setData(dataTable,chartConfig)

        xString="data."+createAttributeNames(dataTable.metadata.names[chartConfig.xAxis])
        yStrings=[];
        for(i=0;i<chartConfig.yAxis.length;i++){
            yStrings[i]="data."+createAttributeNames(dataTable.metadata.names[chartConfig.yAxis[i]])

        }


        xScaleConfig={
            "index":chartConfig.xAxis,
            "schema":dataTable.metadata,
            "name": "x",
            "range": "width",
            "clamp":false,
            "field": xString,
        }

        yScaleConfig= {
            "index":chartConfig.yAxis[0],
            "schema":dataTable.metadata,
            "name": "y",
            "range": "height",
            "nice": true,
            "field": yStrings[0]
        }

        var xScale=setScale(xScaleConfig)
        var yScale=setScale(yScaleConfig);

        var xAxisConfig= {"type": "x", "scale":"x","angle":10, "title": dataTable.metadata.names[chartConfig.xAxis] ,"grid":true ,"dx":-10,"dy":10,"align":"left","titleDy":10,"titleDx":0}
        var yAxisConfig= {"type": "y", "scale":"y","angle":0, "title": "values" ,"grid":true,"dx":0,"dy":0  ,"align":"right","titleDy":-10,"titleDx":0}
        var xAxis=setAxis(xAxisConfig);
        var yAxis=setAxis(yAxisConfig);

        var spec=        {
            "width": chartConfig.width-200,
            "height": chartConfig.height,
            "padding":{"top":40,"bottom":60,'left':90,"right":20},
            "data": [
                {
                    "name": "table"

                }
            ],
            "scales": [
                xScale,yScale,
                {
                    "name": "color", "type": "ordinal", "range": "category10"
                }
            ],
            "axes": [xAxis,yAxis
            ],

            "marks": [
                {
                    "type": "line",
                    "key":xString,

                    "from": {"data": "table"},
                    "properties": {
                        "enter": {
                            "x": {"value": 400},
                            "interpolate": {"value": "monotone"},
                            "y": {"scale": "y:prev", "field": yStrings[0]},
                            "stroke": {"value": "steelblue"}
                        },
                        "update": {
                            "x": {"scale": "x", "field": xString},
                            "y": {"scale": "y", "field": yStrings[0]}
                        },
                        "exit": {
                            "x": {"value": -20},
                            "y": {"scale": "y", "field": yStrings[0]}
                        }
                    }
                }
                ,
                {
                    "type": "line",
                    "key":xString,

                    "from": {"data": "table"},
                    "properties": {
                        "enter": {
                            "x": {"value": 400},
                            "interpolate": {"value": "monotone"},
                            "y": {"scale": "y:prev", "field": yStrings[1]},
                            "stroke": {"value": "yellow"}
                        },
                        "update": {
                            "x": {"scale": "x", "field": xString},
                            "y": {"scale": "y", "field": yStrings[1]}
                        },
                        "exit": {
                            "x": {"value": -20},
                            "y": {"scale": "y", "field": yStrings[1]}
                        }
                    }
                }
            ]
        }

        for(i=0;i<chartConfig.yAxis.length;i++) {
            markObj = {
                "type": "line",
                "key": xString,

                "from": {"data": "table"},
                "properties": {
                    "enter": {
                        "x": {"value": 400},
                        "interpolate": {"value": "monotone"},
                        "y": {"scale": "y:prev", "field": yStrings[i]},
                        "stroke": {"scale":"color","value" : i}
                    },
                    "update": {
                        "x": {"scale": "x", "field": xString},
                        "y": {"scale": "y", "field": yStrings[i]}
                    },
                    "exit": {
                        "x": {"value": -20},
                        "y": {"scale": "y", "field": yStrings[i]}
                    }
                }
            }
            spec.marks.push(markObj);
        }
        console.log(spec)
        chartObj.spec = spec;

    }







    igviz.drawLineChart = function (chartObj) {
        divId=chartObj.canvas;
        chartConfig=chartObj.config;

        dataTable=chartObj.dataTable;

        var xAxisName = dataTable.metadata.names[chartConfig.xAxis];

        //TODO need a common default margin configuration for all charts
        var margin = {
                top: 20,
                right: 80,
                bottom: 30,
                left: 50
            },
            width = chartConfig.width - margin.left - margin.right,
            height = chartConfig.height - margin.top - margin.bottom;

        //Preparing the data according to the way that chart expects
        var data = dataTable.data.map(function (d, i) {
            var o = {};
            d.forEach(function (element, index) {
                var fieldName = dataTable.metadata.names[index];
                if (fieldName === xAxisName) {
                    fieldName = "x";
                }
                Object.defineProperty(o, fieldName, {
                    value: element,
                    writable: true,
                    enumerable: true,
                    configurable: true
                });

            });
            return o;
        });
        var x = d3.scale.linear()
            .domain(d3.extent(data, function (d) {
                return d.x;
            }))
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var color = d3.scale.category10();
        var columns = chartConfig.yAxis.map(function (d) {
            return dataTable.metadata.names[d];
        });
        color.domain(columns);

        var dimensions = color.domain().map(function (name) {
            return {
                name: name,
                values: data.map(function (d) {
                    return {
                        x: d.x,
                        value: +d[name]
                    };
                })
            };
        });

        y.domain([
            d3.min(dimensions, function (c) {
                return d3.min(c.values, function (v) {
                    return v.value;
                });
            }),
            d3.max(dimensions, function (c) {
                return d3.max(c.values, function (v) {
                    return v.value;
                });
            })
        ]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        //let the drawing begin
        //TODO Remove svg if it is there already
        var svg = d3.select(divId).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Value");

        var line = d3.svg.line()
            .interpolate("linear")
            .x(function (d) {
                return x(d.x);
            })
            .y(function (d) {
                return y(d.value);
            });

        var dimension = svg.selectAll(".dimension")
            .data(dimensions)
            .enter().append("g")
            .attr("class", "dimension")


        dimension.append("path")
            .attr("class", "line")
            .attr("d", function (d) {
                return line(d.values);
            })
            .style("stroke", function (d) {
                return color(d.name);
            });

        dimension.append("text")
            .datum(function (d) {
                return {
                    name: d.name,
                    value: d.values[d.values.length - 1]
                };
            })
            .attr("transform", function (d) {
                return "translate(" + x(d.value.x) + "," + y(d.value.value) + ")";
            })
            .attr("x", 3)
            .attr("dy", ".35em")
            .text(function (d) {
                return d.name;
            });
    };



    function sortDataSet(dataset,fun){
        if(fun==null) {
            fun = function (a, b) {
                if (a.x - b.x < 0) {
                    return -1;
                }
                if (a.x - b.x > 0) {
                    return 1;
                }
                // a must be equal to b
                return 0;
            };
        }
        dataset.sort(fun);
    }
    igviz.drawAreaChart = function (chartObj) {

       // var padding = chartConfig.padding;
        var chartConfig=chartObj.config;
        var dataTable=chartObj.dataTable;
        ///var table = setData(dataTable.data,chartConfig);

       // sortDataSet(table);
        var spec ={
            "width": chartConfig.width,
            "height": chartConfig.height,
            "padding": {"top": 10, "left": 30, "bottom": 30, "right": 10},
            "data": [
            {
                "name": "table"
            }
        ],
            "scales": [
            {
                "name": "x",
                "type": "linear",
                "range": "width",
                "zero": false,
                "domain": {"data": "table", "field": "data.x"}
            },
            {
                "name": "y",
                "type": "linear",
                "range": "height",
                "nice": true,
                "domain": {"data": "table", "field": "data.y"}
            }
        ],
            "axes": [
            {"type": "x", "scale": "x", "ticks": 20},
            {"type": "y", "scale": "y"}
        ],
            "marks": [
            {
                "type": "area",
                "from": {"data": "table"},
                "properties": {
                    "enter": {
                        "interpolate": {"value": "monotone"},
                        "x": {"scale": "x", "field": "data.x"},
                        "y": {"scale": "y", "field": "data.y"},
                        "y2": {"scale": "y", "value": 0},
                        "fill": {"value": "steelblue"}
                    },
                    "update": {
                        "fillOpacity": {"value": 1}
                    },
                    "hover": {
                        "fillOpacity": {"value": 0.5}
                    }
                }
            }
        ]
        }

        //var data = {table: table}

        chartObj.spec = spec;
       // chart.data = data;
      //  chart.table = table;
            //self.counter=0;
            //console.log('abc');
            //setInterval(updateTable,1500);

    };

    igviz.drawArc = function (divId, chartConfig, dataTable) {

        function radialProgress(parent) {
            var _data = null,
                _duration = 1000,
                _selection,
                _margin = {
                    top: 0,
                    right: 0,
                    bottom: 30,
                    left: 0
                },
                __width = chartConfig.width,
                __height = chartConfig.height,
                _diameter,
                _label = "",
                _fontSize = 10;


            var _mouseClick;

            var _value = 0,
                _minValue = 0,
                _maxValue = 100;

            var _currentArc = 0,
                _currentArc2 = 0,
                _currentValue = 0;

            var _arc = d3.svg.arc()
                .startAngle(0 * (Math.PI / 180)); //just radians

            var _arc2 = d3.svg.arc()
                .startAngle(0 * (Math.PI / 180))
                .endAngle(0); //just radians


            _selection = d3.select(parent);


            function component() {

                _selection.each(function (data) {

                    // Select the svg element, if it exists.
                    var svg = d3.select(this).selectAll("svg").data([data]);

                    var enter = svg.enter().append("svg").attr("class", "radial-svg").append("g");

                    measure();

                    svg.attr("width", __width)
                        .attr("height", __height);


                    var background = enter.append("g").attr("class", "component")
                        .attr("cursor", "pointer")
                        .on("click", onMouseClick);


                    _arc.endAngle(360 * (Math.PI / 180))

                    background.append("rect")
                        .attr("class", "background")
                        .attr("width", _width)
                        .attr("height", _height);

                    background.append("path")
                        .attr("transform", "translate(" + _width / 2 + "," + _width / 2 + ")")
                        .attr("d", _arc);

                    background.append("text")
                        .attr("class", "label")
                        .attr("transform", "translate(" + _width / 2 + "," + (_width + _fontSize) + ")")
                        .text(_label);

                    //outer g element that wraps all other elements
                    var gx = chartConfig.width / 2 - _width / 2;
                    var gy = chartConfig.height / 2 - _height / 2;
                    var g = svg.select("g")
                        .attr("transform", "translate(" + gx + "," + gy + ")");


                    _arc.endAngle(_currentArc);
                    enter.append("g").attr("class", "arcs");
                    var path = svg.select(".arcs").selectAll(".arc").data(data);
                    path.enter().append("path")
                        .attr("class", "arc")
                        .attr("transform", "translate(" + _width / 2 + "," + _width / 2 + ")")
                        .attr("d", _arc);

                    //Another path in case we exceed 100%
                    var path2 = svg.select(".arcs").selectAll(".arc2").data(data);
                    path2.enter().append("path")
                        .attr("class", "arc2")
                        .attr("transform", "translate(" + _width / 2 + "," + _width / 2 + ")")
                        .attr("d", _arc2);


                    enter.append("g").attr("class", "labels");
                    var label = svg.select(".labels").selectAll(".label").data(data);
                    label.enter().append("text")
                        .attr("class", "label")
                        .attr("y", _width / 2 + _fontSize / 3)
                        .attr("x", _width / 2)
                        .attr("cursor", "pointer")
                        .attr("width", _width)
                        // .attr("x",(3*_fontSize/2))
                        .text(function (d) {
                            return Math.round((_value - _minValue) / (_maxValue - _minValue) * 100) + "%"
                        })
                        .style("font-size", _fontSize + "px")
                        .on("click", onMouseClick);

                    path.exit().transition().duration(500).attr("x", 1000).remove();


                    layout(svg);

                    function layout(svg) {

                        var ratio = (_value - _minValue) / (_maxValue - _minValue);
                        var endAngle = Math.min(360 * ratio, 360);
                        endAngle = endAngle * Math.PI / 180;

                        path.datum(endAngle);
                        path.transition().duration(_duration)
                            .attrTween("d", arcTween);

                        if (ratio > 1) {
                            path2.datum(Math.min(360 * (ratio - 1), 360) * Math.PI / 180);
                            path2.transition().delay(_duration).duration(_duration)
                                .attrTween("d", arcTween2);
                        }

                        label.datum(Math.round(ratio * 100));
                        label.transition().duration(_duration)
                            .tween("text", labelTween);

                    }

                });

                function onMouseClick(d) {
                    if (typeof _mouseClick == "function") {
                        _mouseClick.call();
                    }
                }
            }

            function labelTween(a) {
                var i = d3.interpolate(_currentValue, a);
                _currentValue = i(0);

                return function (t) {
                    _currentValue = i(t);
                    this.textContent = Math.round(i(t)) + "%";
                }
            }

            function arcTween(a) {
                var i = d3.interpolate(_currentArc, a);

                return function (t) {
                    _currentArc = i(t);
                    return _arc.endAngle(i(t))();
                };
            }

            function arcTween2(a) {
                var i = d3.interpolate(_currentArc2, a);

                return function (t) {
                    return _arc2.endAngle(i(t))();
                };
            }


            function measure() {
                _width = _diameter - _margin.right - _margin.left - _margin.top - _margin.bottom;
                _height = _width;
                _fontSize = _width * .2;
                _arc.outerRadius(_width / 2);
                _arc.innerRadius(_width / 2 * .85);
                _arc2.outerRadius(_width / 2 * .85);
                _arc2.innerRadius(_width / 2 * .85 - (_width / 2 * .15));
            }


            component.render = function () {
                measure();
                component();
                return component;
            }

            component.value = function (_) {
                if (!arguments.length) return _value;
                _value = [_];
                _selection.datum([_value]);
                return component;
            }


            component.margin = function (_) {
                if (!arguments.length) return _margin;
                _margin = _;
                return component;
            };

            component.diameter = function (_) {
                if (!arguments.length) return _diameter
                _diameter = _;
                return component;
            };

            component.minValue = function (_) {
                if (!arguments.length) return _minValue;
                _minValue = _;
                return component;
            };

            component.maxValue = function (_) {
                if (!arguments.length) return _maxValue;
                _maxValue = _;
                return component;
            };

            component.label = function (_) {
                if (!arguments.length) return _label;
                _label = _;
                return component;
            };

            component._duration = function (_) {
                if (!arguments.length) return _duration;
                _duration = _;
                return component;
            }

            component.onClick = function (_) {
                if (!arguments.length) return _mouseClick;
                _mouseClick = _;
                return component;
            }

            return component;

        };

        radialProgress(divId)
            .label("RADIAL 1")
            .diameter(chartConfig.diameter)
            .value(chartConfig.value)
            .render();

    };


    function setScale(scaleConfig){
        var scale={"name":scaleConfig.name};

        console.log(scaleConfig.schema,scaleConfig.index);

        switch (scaleConfig.schema.types[scaleConfig.index]){
            case 'T':
                scale["type"]='time'

                break;

            case 'C':
                scale["type"]='ordinal'

                break;
            case 'N':
                scale["type"]='linear'

                break;
        }

        scale.range=scaleConfig.range;
        scale.domain={"data":"table","field":scaleConfig.field}

        //optional attributes
        if (scaleConfig.hasOwnProperty("round")) {
            scale["round"] = scaleConfig.round;
        }

        if (scaleConfig.hasOwnProperty("nice")) {
            scale["nice"] = scaleConfig.nice;
        }

        if (scaleConfig.hasOwnProperty("reverse")) {
            scale["reverse"] = scaleConfig.reverse;
        }

        if (scaleConfig.hasOwnProperty("sort")) {
            scale["sort"] = scaleConfig.sort;
        }

        if (scaleConfig.hasOwnProperty("clamp")) {
            scale["clamp"] = scaleConfig.clamp;
        }


        if (scaleConfig.hasOwnProperty("zero")) {
            scale["zero"] = scaleConfig.zero;
        }
        return scale;

    }

    function setAxis(axisConfig){

        console.log(axisConfig);

      axis=  {
            "type": axisConfig.type,
            "scale": axisConfig.scale,
            'title': axisConfig.title,
          "grid":{"value":axisConfig.grid},

          "properties": {
                "ticks": {
                   // "stroke": {"value": "steelblue"}
                },
                "majorTicks": {
                    "strokeWidth": {"value": 2}
                },
                "labels": {
                   // "fill": {"value": "steelblue"},
                    "angle": {"value": axisConfig.angle},
                   // "fontSize": {"value": 14},
                    "align": {"value": axisConfig.align},
                    "baseline": {"value": "middle"},
                    "dx": {"value": axisConfig.dx},
                    "dy": {"value": axisConfig.dy}
                },
                "title": {
                    "fontSize": {"value": 16},
                    "dx":{'value':axisConfig.titleDx},
                    "dy":{'value':axisConfig.titleDy}
                },
                "axis": {
                    "stroke": {"value": "#333"},
                    "strokeWidth": {"value": 1.5}
                },

             }

        }
        return axis;
    }

    function setLegends(chartConfig,schema){

    }

    function setData(data,chartConfig){
        var table = [];
        for (i = 0; i < dataTable.data.length; i++) {
            var ptObj = {};
            namesArray=dataTable.metadata.names;
            for(j=0;j<namesArray.length;j++){
                if(dataTable.metadata.types[j]=='T'){
                    ptObj[createAttributeNames(namesArray[j])]=new Date(dataTable.data[i][j]);
                }else
                ptObj[createAttributeNames(namesArray[j])]=dataTable.data[i][j];
            }

            table[i] = ptObj;
        }

        return table;
    }

    function createAttributeNames(str){
        return str.replace(' ','_');
    }
    igviz.drawBarChart = function (mychart, divId, chartConfig, dataTable) {
        //  console.log(this);
        divId=mychart.canvas;
        chartConfig=mychart.config;
        dataTable=mychart.dataTable;
        var table = setData(dataTable,chartConfig);
        var xString="data."+createAttributeNames(dataTable.metadata.names[chartConfig.xAxis]);
        var yString="data."+createAttributeNames(dataTable.metadata.names[chartConfig.yAxis])

//        console.log(table)
     var spec = {
            "width": chartConfig.width - 200,
            "height": chartConfig.height,
            "data": [
                {
                    "name": "table"
                }
            ],
            "scales": [
                {
                    "name": "x",
                    "type": "ordinal",
                    "range": "width",
                    "round": true,
                    "domain": {"data": "table", "field": xString}
                },
                {
                    "name": "y",
                    "range": "height",
                    "nice": true,
                    "domain": {"data": "table", "field": yString}
                }
            ],
            "axes": [
                {
                    "type": "x",
                    "scale": "x",
                    'title': dataTable.metadata.names[chartConfig.xAxis],
                    "properties": {
                       
                    }
                },
                {
                    "type": "y",
                    "scale": "y",
                    'grid': true,
                    'title': dataTable.metadata.names[chartConfig.yAxis],
                    "properties": {
                        
                    }
                }


            ],
            "marks": [
                {
                    "key": xString,
                    "type": "rect",
                    "from": {"data": "table"},
                    "properties": {
                        "enter": {
                            "x": {"scale": "x", "field": xString},
                            "width": {"scale": "x", "band": true, "offset": -(100 / table.length)},
                            "y": {"scale": "y:prev", "field": yString, "duration": 2000},
                            "y2": {"scale": "y", "value": 0}

                        },
                        "update": {
                            "x": {"scale": "x", "field": xString},
                            "y": {"scale": "y", "field": yString},
                            "y2": {"scale": "y", "value": 0},
                            "fill": {"value": "steelblue"}
                        },
                        "exit": {
                            "x": {"value": 0},
                            "y": {"scale": "y:prev", "field": yString},
                            "y2": {"scale": "y", "value": 0}
                        },

                        "hover": {

                            "fill": {'value': 'orange'}
                        }

                    }
                }
            ]
        }


        var data = {table: table}

        mychart.spec = spec;
        mychart.data = data;
        mychart.table = table;
        vg.parse.spec(spec, function (chart) {
            mychart.chart = chart({
                el: divId,
                renderer: 'svg',
                data: data,
                hover: false

            }).update();

           // mychart.chart.data(data).update();
            //self.counter=0;
            //console.log('abc');
            //setInterval(updateTable,1500);

        });
    };

    igviz.drawScatterPlot = function (divId, chartConfig, dataTable) {
        //Width and height
        var w = chartConfig.width;
        var h = chartConfig.height;
        var padding = chartConfig.padding;

        //prepare the dataset (all plot methods should use { "data":dataLine, "config":chartConfig } format
        //so you can use util methods
        var dataset = dataTable.data.map(function (d) {
            return {
                "data": d,
                "config": chartConfig
            }
        });

        var plotCtx = createScales(dataset, chartConfig, dataTable);
        var xScale = plotCtx.xScale;
        var yScale = plotCtx.yScale;
        var rScale = plotCtx.rScale;
        var colorScale = plotCtx.colorScale;

        var svgID = divId + "_svg";
        //Remove current SVG if it is already there
        d3.select(svgID).remove();

        //Create SVG element
        var svg = d3.select(divId)
            .append("svg")
            .attr("id", svgID.replace("#", ""))
            .attr("width", w)
            .attr("height", h);
        svg.append("rect")
            .attr("x", 0).attr("y", 0)
            .attr("width", w).attr("height", h)
            .attr("fill", "rgba(222,235,247, 0.0)")

        createXYAxises(svg, plotCtx, chartConfig, dataTable);

        //Now we really drwa by creating circles. The layout is done such a way that (0,0)
        // starts from bottom left corner as usual.
        var group1 = svg.append("g")
            .attr("id", "circles")
            .selectAll("g")
            .data(dataset)
            .enter()
            .append("g");

        configurePoints(group1, xScale, yScale, rScale, colorScale);
        configurePointLabels(group1, xScale, yScale);
    };

    /**
     * By : Fawsan M. <--fawsanm@wso2.com-->
     * function to draw the Single Number Diagram
     * @param divId
     * @param chartConfig
     * @param dataTable
     */
    igviz.drawSingleNumberDiagram = function (divId, chartConfig, dataTable) {

        //Width and height
        var w = chartConfig.width;
        var h = chartConfig.height;
        var padding = chartConfig.padding;

        //configure font sizes
        var MAX_FONT_SIZE = 40;
        var AVG_FONT_SIZE = 70;
        var MIN_FONT_SIZE = 40;

        //div elements to append single number diagram components
        var minDiv = "minValue";
        var maxDiv = "maxValue";
        var avgDiv = "avgValue";


        //prepare the dataset (all plot methods should use { "data":dataLine, "config":chartConfig } format
        //so you can use util methods
        var dataset = dataTable.data.map(function (d) {
            return {
                "data": d,
                "config": chartConfig
            }
        });

        var svgID = divId + "_svg";
        //Remove current SVG if it is already there
        d3.select(svgID).remove();

        //Create SVG element
        var svg = d3.select(divId)
            .append("svg")
            .attr("id", svgID.replace("#", ""))
            .attr("width", w)
            .attr("height", h);


        //  getting a reference to the data
        var tableData = dataTable.data;

        //parse a column to calculate the data for the single number diagram
        var selectedColumn = parseColumnFrom2DArray(tableData, dataset[0].config.xAxis);

        //appending a group to the diagram
        var SingleNumberDiagram = svg
            .append("g");


        svg.append("rect")
            .attr("id", "rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", w)
            .attr("height", h)


        //Minimum value goes here
        SingleNumberDiagram.append("text")
            .attr("id", minDiv)
            .text("Max: " + d3.max(selectedColumn))
            //.text(50)
            .attr("font-size", MIN_FONT_SIZE)
            .attr("x", 3 * w / 4)
            .attr("y", h / 4)
            .style("fill", "black")
            .style("text-anchor", "middle")
            .style("lignment-baseline", "middle");

        //Average value goes here
        SingleNumberDiagram.append("text")
            .attr("id", avgDiv)
            .text(getAvg(selectedColumn))
            .attr("font-size", AVG_FONT_SIZE)
            .attr("x", w / 2)
            .attr("y", h / 2 + d3.select("#" + avgDiv).attr("font-size") / 5)
            .style("fill", "black")
            .style("text-anchor", "middle")
            .style("lignment-baseline", "middle");

        //Maximum value goes here
        SingleNumberDiagram.append("text")
            .attr("id", maxDiv)
            .text("Min: " + d3.min(selectedColumn))
            .attr("font-size", MAX_FONT_SIZE)
            .attr("x", 3 * w / 4)
            .attr("y", 3 * h / 4)
            .style("fill", "black")
            .style("text-anchor", "middle")
            .style("lignment-baseline", "middle");
    };

    igviz.drawLineChart = function (divId, chartConfig, dataTable) {
        var w = chartConfig.width; //Width and height and margins
        var h = chartConfig.height;
        var margin = {
            top: 20,
            right: 80,
            bottom: 50,
            left: 30
        };

        var dataSet = dataTable.data.map(function (d) {
            return {
                "data": d,
                "config": chartConfig
            }


        });

        var xAxis = chartConfig.xAxis; //Identifying the Column number corresponding to the selected fields from the form
        var yAxis = chartConfig.yAxis;


        var xAxisName = dataTable.metadata.names[xAxis]; //Identify Column Names of the columns selected from the form

        var yAxisNames = [];


        var columnNames = [xAxisName];
        for (var i = 0; i < yAxis.length; i++) {
            yAxisNames[i] = dataTable.metadata.names[yAxis[i]];
            columnNames.push(yAxisNames[i]);
        }

        //var yAxisName = dataTable.metadata.names[yAxis];


        dataSet.sort(function (a, b) { //sort the data set with respect to the x coordinates
            return a.data[xAxis] - b.data[xAxis];
        });


        var data = []; //empty array to load the selected data and organize in the required format
        for (var i = 0; i < dataSet.length; i++) {
            var obj = {};
            obj['key'] = dataSet[i].data[xAxis];
            for (var j = 0; j < yAxis.length; j++) {
                obj['y' + j] = dataSet[i].data[yAxis[j]];
            }


            data.push(obj);
        }

        var svgID = divId + "_svg"; //svg container in which the chart shall be drawn
        d3.select(svgID).remove(); //Remove current SVG if it is already there

        var svg = d3.select(divId) //Create SVG element
            .append("svg")
            .attr("id", svgID.replace("#", ""))
            .attr("width", w) //width
            .attr("height", h + margin.bottom)
            // /height
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); //move to the middle of the screen in given dimensions

        var interpolationMode = "cardinal"; //interpolation mode [linear, basis, step before, step after, cardinal]
        if (chartConfig.interpolationMode != undefined) {
            interpolationMode = chartConfig.interpolationMode;
        }

        var ordinal = d3.scale.ordinal(); //scale to map y coordinates

        var x = d3.scale.linear() //scale for x axis
            .range([0, w - 100]);

        var y = d3.scale.linear() //scale for y axis
            .range([h, 0]);

        var XAxis = d3.svg.axis() //define x axis
            .scale(x)
            .orient("bottom");

        var YAxis = d3.svg.axis() //define y axis
            .scale(y)
            .orient("left");

        var line = d3.svg.line() //svg element to connect the coordinates as a path
            .x(function (d) {
                return x(d.key); //scale x coordinates
            })
            .y(function (d) {
                return y(d.value); //scale y coordinates
            });

        ordinal.domain(d3.keys(data[0]).filter(function (d) {
            return d !== "key"; //get key list as the scale domain except the one which is exactly "key" as it should be the x variable set
        }));

        x.domain(d3.extent(data, function (d) {
            return d.key; //define the domain of x scale
        }));

        var graphs = ordinal.domain().map(function (name) { //organize data in the format, {name,{key,value}}, {key,value}-values
            return {
                name: name,
                values: data.map(function (d) {
                    return {
                        key: d.key,
                        value: +d[name]
                    };
                })
            };
        });

        y.domain([ //define the domain of y scale i.e- minimum value of all y coordinates to max of all y coordinates
            d3.min(graphs, function (c) {
                return d3.min(c.values, function (v) {
                    return v.value;
                });
            }),
            d3.max(graphs, function (c) {
                return d3.max(c.values, function (v) {
                    return v.value;
                });
            })
        ]);

        svg.append("g") //append x axis to the chart and move(translate to the bottom
            .attr("class", "x axis")
            .attr("transform", "translate(0," + h + ")")
            .call(XAxis)
            .append("text") //append the label for the x axis
            .attr("x", w - 40) //move to the right hand end
            .attr("y", 28) //set as -10 to move on top of the x axis
            .style("text-anchor", "end")
            .style("font-weight", "bold")
            .text(columnNames[0]);

        svg.append("g") //append y axis
            .attr("class", "y axis")
            .call(YAxis)
            .append("text") //y axis label
            .attr("transform", "rotate(-90)") //rotate 90 degrees
            .attr("y", 6)
            .attr("dy", ".71em") //distance from y axis to the label
            .style("text-anchor", "end")
            .style("font-weight", "bold")
            .text("Value");

        var graph = svg.selectAll(".graph") //create graphs for the data set
            .data(graphs)
            .enter().append("g")
            .attr("class", "label"); //change text style

        graph.append("path") //add path to the graphs
            .attr("class", "line")
            .attr("d", function (d) {
                return line.interpolate(interpolationMode)(d.values); //interpolate in given interpolationMode and render line
            })
            .style("stroke", function (d, i) {
                return chartConfig.lineColors[i];              //get different colors for each graph
            });

        graph.append("text")
            .datum(function (d) { //to bind data to a single svg element
                return {
                    name: d.name,
                    value: d.values[d.values.length - 1]
                };
            })
            .attr("transform", function (d) { //show the label of each graph at the end of each ones last value coordinate
                console.log(d);
                return "translate(" + (x(d.value.key)) + "," + y(d.value.value) + ")";
            })
            .attr("x", 3)
            .attr("dy", ".45em")
            .text(function (d, i) {
                return columnNames[i + 1];
            });
    };
    /**
     * By : Fawsan M. <--fawsanm@wso2.com-->
     * Function to draw the Table
     * @param divId
     * @param chartConfig
     * @param dataTable
     */
    igviz.drawTable = function (divId, chartConfig, dataTable) {
        var w = chartConfig.width;
        var h = chartConfig.height;
        var padding = chartConfig.padding;
        var dataSeries = chartConfig.dataSeries;
        var highlightMode = chartConfig.highlightMode;

        var dataset = dataTable.data.map(function (d) {
            return {
                "data": d,
                "config": chartConfig
            }
        });
        //remove the current table if it is already exist
        d3.select(divId).select("table").remove();

        var rowLabel = dataTable.metadata.names;
        var tableData = dataTable.data;

        //Using RGB color code to represent colors
        //Because the alpha() function use these property change the contrast of the color
        var colors = [{
            r: 255,
            g: 0,
            b: 0
        }, {
            r: 0,
            g: 255,
            b: 0
        }, {
            r: 200,
            g: 100,
            b: 100
        }, {
            r: 200,
            g: 255,
            b: 250
        }, {
            r: 255,
            g: 140,
            b: 100
        }, {
            r: 230,
            g: 100,
            b: 250
        }, {
            r: 0,
            g: 138,
            b: 230
        }, {
            r: 165,
            g: 42,
            b: 42
        }, {
            r: 127,
            g: 0,
            b: 255
        }, {
            r: 0,
            g: 255,
            b: 255
        }];

        //function to change the color depth
        //default domain is set to [0, 100], but it can be changed according to the dataset
        var alpha = d3.scale.linear().domain([0, 100]).range([0, 1]);

        //append the Table to the div
        var table = d3.select(divId).append("table").attr('class', 'table table-bordered');

        var colorRows = d3.scale.linear()
            .domain([2.5, 4])
            .range(['#F5BFE8', '#E305AF']);

        var fontSize = d3.scale.linear()
            .domain([0, 100])
            .range([15, 20]);

        //create the table head
        thead = table.append("thead");
        tbody = table.append("tbody")

        //Append the header to the table
        thead.append("tr")
            .selectAll("th")
            .data(rowLabel)
            .enter()
            .append("th")
            .text(function (d) {
                return d;
            });

        var isColorBasedSet = chartConfig.colorBasedStyle;
        var isFontBasedSet = chartConfig.fontBasedStyle;

        var rows = tbody.selectAll("tr")
            .data(tableData)
            .enter()
            .append("tr")

        var cells;

        if (isColorBasedSet == true && isFontBasedSet == true) {

            //adding the  data to the table rows
            cells = rows.selectAll("td")

                //Lets do a callback when we get each array from the data set
                .data(function (d, i) {
                    return d;
                })
                //select the table rows (<tr>) and append table data (<td>)
                .enter()
                .append("td")
                .text(function (d, i) {
                    return d;
                })
                .style("font-size", function (d, i) {


                    fontSize.domain([
                        d3.min(parseColumnFrom2DArray(tableData, i)),
                        d3.max(parseColumnFrom2DArray(tableData, i))
                    ]);
                    return fontSize(d) + "px";
                })
                .style('background-color', function (d, i) {

                    //This is where the color is decided for the cell
                    //The domain set according to the data set we have now
                    //Minimum & maximum values for the particular data column is used as the domain
                    alpha.domain([d3.min(parseColumnFrom2DArray(tableData, i)), d3.max(parseColumnFrom2DArray(tableData, i))]);

                    //return the color for the cell
                    return 'rgba(' + colors[i].r + ',' + colors[i].g + ',' + colors[i].b + ',' + alpha(d) + ')';

                });

        } else if (isColorBasedSet && !isFontBasedSet) {
            //adding the  data to the table rows
            cells = rows.selectAll("td")

                //Lets do a callback when we get each array from the data set
                .data(function (d, i) {
                    return d;
                })
                //select the table rows (<tr>) and append table data (<td>)
                .enter()
                .append("td")
                .text(function (d, i) {
                    return d;
                })
                .style('background-color', function (d, i) {

                    //This is where the color is decided for the cell
                    //The domain set according to the data set we have now
                    //Minimum & maximum values for the particular data column is used as the domain
                    alpha.domain([
                        d3.min(parseColumnFrom2DArray(tableData, i)),
                        d3.max(parseColumnFrom2DArray(tableData, i))
                    ]);

                    //return the color for the cell
                    return 'rgba(' + colors[i].r + ',' + colors[i].g + ',' + colors[i].b + ',' + alpha(d) + ')';

                });

        } else if (!isColorBasedSet && isFontBasedSet) {

            //adding the  data to the table rows
            cells = rows.selectAll("td")

                //Lets do a callback when we get each array from the data set
                .data(function (d, i) {
                    return d;
                })
                //select the table rows (<tr>) and append table data (<td>)
                .enter()
                .append("td")
                .text(function (d, i) {
                    return d;
                })
                .style("font-size", function (d, i) {

                    fontSize.domain([
                        d3.min(parseColumnFrom2DArray(tableData, i)),
                        d3.max(parseColumnFrom2DArray(tableData, i))
                    ]);
                    return fontSize(d) + "px";
                });

        } else {
            console.log("We are here baby!");
            //appending the rows inside the table body
            rows.style('background-color', function (d, i) {

                colorRows.domain([
                    d3.min(parseColumnFrom2DArray(tableData, chartConfig.xAxis)),
                    d3.max(parseColumnFrom2DArray(tableData, chartConfig.xAxis))
                ]);
                return colorRows(d[chartConfig.xAxis]);
            })
                .style("font-size", function (d, i) {

                    fontSize.domain([
                        d3.min(parseColumnFrom2DArray(tableData, i)),
                        d3.max(parseColumnFrom2DArray(tableData, i))
                    ]);
                    return fontSize(d) + "px";
                });

            //adding the  data to the table rows
            cells = rows.selectAll("td")
                //Lets do a callback when we get each array from the data set
                .data(function (d, i) {
                    return d;
                })
                //select the table rows (<tr>) and append table data (<td>)
                .enter()
                .append("td")
                .text(function (d, i) {
                    return d;
                })
        }

    };

    igviz.drawMap = function (divId, chartConfig, dataTable) { //add this
        //Width and height
        divId = divId.substr(1);
        var w = chartConfig.width;
        var h = chartConfig.height;

        var mode = chartConfig.mode;
        var regionO = chartConfig.region;


        //prepare the dataset (all plot methods should use { "data":dataLine, "config":chartConfig } format
        //so you can use util methods
        var dataset = dataTable.data.map(function (d, i) {
            return {
                "data": d,
                "config": chartConfig,
                "name": dataTable.metadata.names[i]
            }
        });

        var tempArray = [];
        var mainArray = [];

        var locIndex = dataset[0].config.mapLocation;
        var pColIndex = dataset[0].config.pointColor;
        var pSizIndex = dataset[0].config.pointSize;
        tempArray.push(dataset[locIndex].name, dataset[pColIndex].name, dataset[pSizIndex].name);
        mainArray.push(tempArray);

        for (var counter = 0; counter < dataset.length; counter++) {
            tempArray = [];
            tempArray.push(dataset[counter].data[locIndex], dataset[counter].data[pColIndex], dataset[counter].data[pSizIndex]);
            mainArray.push(tempArray);
        }

        var mainStrArray = [];

        for (var i = 0; i < mainArray.length; i++) {
            var tempArr = mainArray[i];
            var str = '';
            for (var j = 1; j < tempArr.length; j++) {
                str += mainArray[0][j] + ':' + tempArr[j] + ' , '
            }
            str = str.substring(0, str.length - 3);
            str = mainArray[i][0].toUpperCase() + "\n" + str;
            tempArray = [];
            tempArray.push(mainArray[i][0]);
            tempArray.push(str);
            mainStrArray.push(tempArray);
        }
        ;

        //hardcoded
        // alert(divId);
        document.getElementById(divId).setAttribute("style", "width: " + w + "px; height: " + h + "px;");


        update(mainStrArray, mainArray);

        function update(arrayStr, array) {

            //hardcoded options
            //            var dropDown = document.getElementById("mapType");        //select dropdown box Element
            //            var option = dropDown.options[dropDown.selectedIndex].text;     //get Text selected in drop down box to the 'Option' variable
            //
            //            var dropDownReg = document.getElementById("regionType");        //select dropdown box Element
            //            regionO = dropDownReg.options[dropDownReg.selectedIndex].value;     //get Text selected in drop down box to the 'Option' variable


            if (mode == 'satellite' || mode == "terrain" || mode == 'normal') {
                drawMap(arrayStr);
            }
            if (mode == 'regions' || mode == "markers") {

                drawMarkersMap(array);
            }

        }


        function drawMap(array) {
            var data = google.visualization.arrayToDataTable(array
                // ['City', 'Population'],
                // ['Bandarawela', 'Bandarawela:2761477'],
                // ['Jaffna', 'Jaffna:1924110'],
                // ['Kandy', 'Kandy:959574']
            );

            var options = {
                showTip: true,
                useMapTypeControl: true,
                mapType: mode
            };

            //hardcoded
            var map = new google.visualization.Map(document.getElementById(divId));
            map.draw(data, options);
        };

        function drawMarkersMap(array) {
            console.log(google)
            console.log(google.visualization);
            var data = google.visualization.arrayToDataTable(array);

            var options = {
                region: regionO,
                displayMode: mode,
                colorAxis: {
                    colors: ['red', 'blue']
                },
                magnifyingGlass: {
                    enable: true,
                    zoomFactor: 3.0
                },
                enableRegionInteractivity: true
                //legend:{textStyle: {color: 'blue', fontSize: 16}}
            };

            //hardcoded
            var chart = new google.visualization.GeoChart(document.getElementById(divId));
            chart.draw(data, options);
        };

    }

    /**
     * Util Methods
     */

    /**
     * Creates correct scales based on x,y axis data columns, this leaving padding space around in SVG.
     * @param dataset
     * @param chartConfig
     * @param dataTable
     * @returns {{xScale: *, yScale: *, rScale: *, colorScale: *}}
     */
    function createScales(dataset, chartConfig, dataTable) {
        //Create scale functions

        var xScale;
        var yScale;
        var colorScale;
        if (dataTable.metadata.types[chartConfig.xAxis] == 'N') {
            xScale = d3.scale.linear()
                .domain([0, d3.max(dataset, function (d) {
                    return d.data[d.config.xAxis];
                })])
                .range([chartConfig.padding, chartConfig.width - chartConfig.padding]);
        } else {
            xScale = d3.scale.ordinal()
                .domain(dataset.map(function (d) {
                    return d.data[chartConfig.xAxis];
                }))
                .rangeRoundBands([chartConfig.padding, chartConfig.width - chartConfig.padding], .1)
        }

        //TODO hanle case r and color are missing

        if (dataTable.metadata.types[chartConfig.yAxis] == 'N') {
            yScale = d3.scale.linear()
                .domain([0, d3.max(dataset, function (d) {
                    return d.data[d.config.yAxis];
                })])
                .range([chartConfig.height - chartConfig.padding, chartConfig.padding]);
            //var yScale = d3.scale.linear()
            //    .range([height, 0])
            //    .domain([0, d3.max(dataset, function(d) { return d.data[d.config.yAxis]; })])
        } else {
            yScale = d3.scale.ordinal()
                .rangeRoundBands([0, chartConfig.width], .1)
                .domain(dataset.map(function (d) {
                    return d.data[chartConfig.yAxis];
                }))
        }


        //this is used to scale the size of the point, it will value between 0-20
        var rScale = d3.scale.linear()
            .domain([0, d3.max(dataset, function (d) {
                return d.config.pointSize ? d.data[d.config.pointSize] : 20;
            })])
            .range([0, 20]);

        //TODO have to handle the case color scale is categorical : Done
        //http://synthesis.sbecker.net/articles/2012/07/16/learning-d3-part-6-scales-colors
        // add color to circles see https://www.dashingd3js.com/svg-basic-shapes-and-d3js
        //add legend http://zeroviscosity.com/d3-js-step-by-step/step-3-adding-a-legend
        if (dataTable.metadata.types[chartConfig.pointColor] == 'N') {
            colorScale = d3.scale.linear()
                .domain([-1, d3.max(dataset, function (d) {
                    return d.config.pointColor ? d.data[d.config.pointColor] : 20;
                })])
                .range([chartConfig.minColor, chartConfig.maxColor]);
        } else {
            colorScale = d3.scale.category20c();
        }

        //TODO add legend


        return {
            "xScale": xScale,
            "yScale": yScale,
            "rScale": rScale,
            "colorScale": colorScale
        }
    }


    /**
     * Create XY axis and axis labels
     * @param svg
     * @param plotCtx
     * @param chartConfig
     * @param dataTable
     */

    function createXYAxises(svg, plotCtx, chartConfig, dataTable) {
        var w = chartConfig.width;
        var h = chartConfig.height;
        var padding = chartConfig.padding;

        //Define X axis
        var xAxis = d3.svg.axis()
            .scale(plotCtx.xScale)
            .orient("bottom")
            .ticks(5);

        //Define Y axis
        var yAxis = d3.svg.axis()
            .scale(plotCtx.yScale)
            .orient("left")
            .ticks(5);

        //Create X axis
        var axis = svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (h - padding) + ")")
            .call(xAxis);

        //if categroical, we slant the text
        if (dataTable.metadata.types[chartConfig.xAxis] == 'C') {

            axis.selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", chartConfig.tickLabelConfig.dx)
                .attr("dy", chartConfig.tickLabelConfig.dy)
                .attr("transform", function (d) {
                    return "rotate(" + chartConfig.tickLabelConfig.textAngle + ")"
                });
        }

        axis.append("text")
            .style("font-size", chartConfig.xAxisLabelConfig.fontSize)
            .attr("y", chartConfig.xAxisLabelConfig.y)
            .attr("x", (chartConfig.xAxisLabelConfig.x == undefined || chartConfig.xAxisLabelConfig.x == 0) ? (w - padding / 5) : chartConfig.xAxisLabelConfig.x)
            .attr("dy", chartConfig.xAxisLabelConfig.dy)
            .style("text-anchor", "end")
            .text(dataTable.metadata.names[chartConfig.xAxis]);


        //Create Y axis
        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (padding) + ",0)")
            .call(yAxis)
            .append("text")
            .style("font-size", chartConfig.yAxisLabelConfig.fontSize)
            .attr("y", chartConfig.yAxisLabelConfig.y)
            .attr("x", chartConfig.yAxisLabelConfig.x)
            .attr("transform", "rotate(" + chartConfig.yAxisLabelConfig.rotate + ")")
            .attr("dy", chartConfig.yAxisLabelConfig.dy)
            .style("text-anchor", "end")
            .text(dataTable.metadata.names[chartConfig.yAxis]);
    }


    /**
     * Configure a point and set size and color
     * @param group1
     * @param xScale
     * @param yScale
     * @param rScale
     * @param colorScale
     */
    function configurePoints(group1, xScale, yScale, rScale, colorScale) {
        //TODO have to handle the case color scale is categorical
        group1.append("circle")
            .attr("cx", function (d) {
                return xScale(d.data[d.config.xAxis]);
            })
            .attr("cy", function (d) {
                return yScale(d.data[d.config.yAxis]);
            })
            .attr("r", function (d) {
                if (d.config.pointSize != -1) {
                    return rScale(d.data[d.config.pointSize]);
                } else {
                    return 5;
                }
            })
            .style("fill", function (d) {
                if (d.config.pointColor != -1) {
                    return colorScale(d.data[d.config.pointColor]);
                } else {
                    return 2;
                }
            });
    }


    /**
     * Methods for the base.html
     */
    /**
     * Add text to each point
     * @param group1
     * @param xScale
     * @param yScale
     */

    function configurePointLabels(group1, xScale, yScale) {
        //TODO make this nicer
        group1.append("text")
            .attr("x", function (d) {
                return xScale(d.data[d.config.xAxis]);
            })
            .attr("y", function (d) {
                return yScale(d.data[d.config.yAxis]) - 10;
            })
            .style("font-family", "sans-serif")
            .style("font-size", "10px")
            .style("text-anchor", "middle")
            .text(function (d) {
                if (d.config.pointLabel != -1) {
                    return d.data[d.config.pointLabel];
                } else {
                    return "3";
                }
            });
    }


    /////////////////////////////////////////// TODO: Fawsan's util stuff. Better refactor these later ////////////////////

    /**
     * Get the average of a numeric array
     * @param data
     * @returns average
     */
    function getAvg(data) {

        var sum = 0;

        for (var i = 0; i < data.length; i++) {
            sum = sum + data[i];
        }

        var average = (sum / data.length).toFixed(4);
        return average;
    }

    /**
     * Function to calculate the standard deviation
     * @param values
     * @returns sigma(standard deviation)
     */
    function standardDeviation(values) {
        var avg = getAvg(values);

        var squareDiffs = values.map(function (value) {
            var diff = value - avg;
            var sqrDiff = diff * diff;
            return sqrDiff;
        });

        var avgSquareDiff = getAvg(squareDiffs);

        var stdDev = Math.sqrt(avgSquareDiff);
        return stdDev;
    }

    /**
     * Get the p(x) : Helper function for the standard deviation
     * @param x
     * @param sigma
     * @param u
     * @returns {number|*}
     */
    function pX(x, sigma, u) {

        p = (1 / Math.sqrt(2 * Math.PI * sigma * sigma)) * Math.exp((-(x - u) * (x - u)) / (2 * sigma * sigma));

        return p;
    }


    /**
     * Get the normalized values for a list of elements
     * @param xVals
     * @returns {Array} of normalized values
     *
     */
    function NormalizationCoordinates(xVals) {

        var coordinates = [];

        var u = getAvg(xVals);
        var sigma = standardDeviation(xVals);

        for (var i = 0; i < xVals.length; i++) {

            coordinates[i] = {
                x: xVals[i],
                y: pX(xVals[i], sigma, u)
            };
        }

        return coordinates;
    }

    /**
     * This function will extract a column from a multi dimensional array
     * @param 2D array
     * @param index of column to be extracted
     * @return array of values
     */

    function parseColumnFrom2DArray(dataset, index) {

        var array = [];

        //console.log(dataset.length);
        //console.log(dataset[0].data);
        //console.log(dataset[1].data);

        for (var i = 0; i < dataset.length; i++) {
            array.push(dataset[i][index])
        }

        return array;
    }


    //Start of utility class declarations

    //DataTable that holds data in a tabular format
    //E.g var dataTable = new igviz.DataTable();
    //dataTable.addColumn("OrderId","C");
    //dataTable.addColumn("Amount","N");
    //dataTable.addRow(["12SS",1234.56]);
    igviz.DataTable = function (data) {
        this.metadata = {};
        this.metadata.names = [];
        this.metadata.types = [];
        this.data = [];
    };

    igviz.DataTable.prototype.addColumn = function (name, type) {
        this.metadata.names.push(name);
        this.metadata.types.push(type);
    };

    igviz.DataTable.prototype.addRow = function (row) {
        this.data.push(row);
    };

    igviz.DataTable.prototype.addRows = function (rows) {
        for (var i = 0; i < rows.length; i++) {
            this.data.push(rows[i]);
        }
        ;
    };

    igviz.DataTable.prototype.getColumnNames = function () {
        return this.metadata.names;
    };

    igviz.DataTable.prototype.getColumnByName = function (name) {
        var column = {};
        for (var i = 0; i < this.metadata.names.length; i++) {
            //TODO Need to check for case sensitiveness
            if (this.metadata.names[i] == name) {
                column.name = this.metadata.names[i];
                column.type = this.metadata.types[i];
                return column;
            }
        }
        ;
    };

    igviz.DataTable.prototype.getColumnByIndex = function (index) {
        var column = this.metadata.names[index];
        if (column) {
            column.name = column;
            column.type = this.metadata.types[index];
            return column;
        }

    };

    igviz.DataTable.prototype.getColumnData = function (columnIndex) {
        var data = [];
        this.data.map(function (d) {
            data.push(d[columnIndex]);
        });
        return data;
    };

    igviz.DataTable.prototype.toJSON = function () {
        console.log(this);
    };


    //Chart class that represents a single chart
    function Chart(canvas, config, dataTable) {
        //this.chart=chart;
        this.dataTable = dataTable;
        this.config = config;
        this.canvas = canvas;
    }


    //Redraw the chart with newly populated data
    //@data An array of arrays that holds new data
    //E.g
    // chart.load([
    //                ["Belgium",64589,16800,4.4,72.93,1.1,-0.6,12.8],
    //                ["Italy",601340,30500,2.9,81.86,1.8,0.38,8.4]
    //            ]);
    Chart.prototype.load = function (data) {
        for (var i = 0; i < data.length; i++) {
            this.dataTable.addRow(data[i])
        }
        ;
        igviz.plot(this.canvas, this.config, this.dataTable);
    };

    Chart.prototype.unload = function () {
        //TODO implement me!
    };

    Chart.prototype.update = function (pointObj) {

       point= this.table.shift();
        this.table.push(point);
        this.chart.data(this.data).update();
    }

    Chart.prototype.plot=function(dataset){
      var table=  setData(dataset,this.config )
        sortDataSet(table)
       var data={table:table}
        divId=this.canvas;


        vg.parse.spec(this.spec, function (chart) {
            this.chart = chart({
                el: divId,
                renderer: 'svg',
                data: data


            }).update();
        });


    }


})();