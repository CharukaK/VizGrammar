(function() {

	var igviz = window.igviz || {};

	igviz.version = '1.0.0';
	igviz.dev = true; //set false when in production

	window.igviz = igviz;


	//Chart class that represents a single chart
	function Chart (canvas,config, dataTable) {
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
	Chart.prototype.load = function(data) {
		for (var i = 0; i < data.length; i++) {
			this.dataTable.addRow(data[i])
		};
		igviz.plot(this.canvas, this.config, this.dataTable);
	};

	Chart.prototype.unload = function() {
		//TODO implement me!
	};


	//Plots a chart in a given div specified by canvas
	igviz.plot = function(canvas, config, dataTable) {
		config=	setDefault(config)
		if (config.chartType == "bar") {
			this.drawBarChart(canvas, config, dataTable);
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
			this.drawAreaChart(canvas, config, dataTable);
		} else if (config.chartType == "arc") {
			this.drawArc(canvas, config, dataTable);
		}

		return new Chart(canvas,config, dataTable);
	};

	function setDefault(chartConfig)
	{
		var tickObj={
		"textAngle":-60,
			"x":0,
			"y":9,
			"dy":".15em",
			"dx":"-.8em",
			"tickHeight":6,
			"tickWidth":0
		}

		var xaxisObj={
		"fontSize":"20px",
			"rotate":"",
			"x": 0,
			"y":20,
			"dx": 0,
			"dy":".71em"

		}

		var yaxisObj={
			"fontSize":"20px",
			"rotate":-90,
			"x":-10 ,
			"y":6,
			"dy":".71em",
			"dx":0
		}
console.log(chartConfig);
		if(!chartConfig.hasOwnProperty("xAxisLabelConfig"))
		{
			chartConfig.xAxisLabelConfig=xaxisObj;
		}
		else
		{
			if(!chartConfig.xAxisLabelConfig.hasOwnProperty("fontSize"))
				chartConfig.xAxisLabelConfig.fontSize=xaxisObj.fontSize;

			if(!chartConfig.xAxisLabelConfig.hasOwnProperty("rotate"))
				chartConfig.xAxisLabelConfig.rotate=xaxisObj.rotate;

			if(!chartConfig.xAxisLabelConfig.hasOwnProperty("x"))
				chartConfig.xAxisLabelConfig.x=xaxisObj.x;

			if(!chartConfig.xAxisLabelConfig.hasOwnProperty("y"))
				chartConfig.xAxisLabelConfig.y=xaxisObj.y;

			if(!chartConfig.xAxisLabelConfig.hasOwnProperty("dx"))
				chartConfig.xAxisLabelConfig.dx=xaxisObj.dx;

			if(!chartConfig.xAxisLabelConfig.hasOwnProperty("dy"))
				chartConfig.xAxisLabelConfig.dx=xaxisObj.dy;
		}



		if(!chartConfig.hasOwnProperty("yAxisLabelConfig"))
		{
			chartConfig.yAxisLabelConfig=yaxisObj;
		}
		else
		{
			if(!chartConfig.yAxisLabelConfig.hasOwnProperty("fontSize"))
				chartConfig.yAxisLabelConfig.fontSize=yaxisObj.fontSize;

			if(!chartConfig.yAxisLabelConfig.hasOwnProperty("rotate"))
				chartConfig.yAxisLabelConfig.rotate=yaxisObj.rotate;

			if(!chartConfig.yAxisLabelConfig.hasOwnProperty("x"))
				chartConfig.yAxisLabelConfig.x=yaxisObj.x;

			if(!chartConfig.yAxisLabelConfig.hasOwnProperty("y"))
				chartConfig.yAxisLabelConfig.y=yaxisObj.y;

			if(!chartConfig.yAxisLabelConfig.hasOwnProperty("dx"))
				chartConfig.yAxisLabelConfig.dx=yaxisObj.dx;

			if(!chartConfig.yAxisLabelConfig.hasOwnProperty("dy"))
				chartConfig.yAxisLabelConfig.dx=yaxisObj.dy;
		}


		if(!chartConfig.hasOwnProperty("tickLabelConfig"))
		{
			chartConfig.tickLabelConfig=tickObj;
		}
		else
		{
			if(!chartConfig.tickLabelConfig.hasOwnProperty("textAngle"))
				chartConfig.tickLabelConfig.textAngle=tickObj.textAngle;

			if(!chartConfig.tickLabelConfig.hasOwnProperty("tickHeight"))
				chartConfig.tickLabelConfig.tickHeight=tickObj.tickHeight;

			if(!chartConfig.tickLabelConfig.hasOwnProperty("tickWidth"))
				chartConfig.tickLabelConfig.tickWidth=tickObj.tickWidth;

			if(!chartConfig.tickLabelConfig.hasOwnProperty("x"))
				chartConfig.tickLabelConfig.x=tickObj.x;

			if(!chartConfig.tickLabelConfig.hasOwnProperty("y"))
				chartConfig.tickLabelConfig.y=tickObj.y;

			if(!chartConfig.tickLabelConfig.hasOwnProperty("dx"))
				chartConfig.tickLabelConfig.dx=tickObj.dx;

			if(!chartConfig.tickLabelConfig.hasOwnProperty("dy"))
				chartConfig.tickLabelConfig.dx=tickObj.dy;
		}
	return chartConfig;
	}

	igviz.drawAreaChart = function(divId, chartConfig, dataTable) {

		var width = chartConfig.width;
		var height = chartConfig.height;
		var padding = chartConfig.padding;

		var margin = {top: 20, right: 20, bottom: 30, left: 50};

		var dataset = dataTable.data.map(function(d) {
			return {
				"data": d,
				"config": chartConfig
			}
		});



	//	var plotCtx = createScales(dataset, chartConfig, dataTable);
	//	var xScale = plotCtx.xScale;
	//	var yScale = plotCtx.yScale;

		var x = d3.scale.linear()
			.range([0,width]);

		var y = d3.scale.linear()
			.range([height, 0]);


		var xAxis = d3.svg.axis() //define x axis
			.scale(x)
			.orient("bottom");

		var yAxis = d3.svg.axis() //define y axis
			.scale(y)
			.orient("left");


		var area = d3.svg.area()
			.x(function(d) { return x(d.x); })
			.y0(height)
			.y1(function(d) { return y(d.y); });



		var svgID = divId + "_svg";
		//Remove current SVG if it is already there
		d3.select(svgID).remove();


		console.log(dataTable);
		dataTable.data;

		dataTable.data.forEach(
			function (d)
			{

				d.x=d[chartConfig.xAxis];
				d.y =d[chartConfig.yAxis];
				console.log(d)
			}
		);


		var svg = d3.select(divId)
			.append("svg")
			.attr("id", svgID.replace("#", ""))
			.attr("width", width)
			.attr("height", height);

		x.domain(d3.extent(dataTable.data, function(d) { return d.x; }));
		y.domain([0, d3.max(dataTable.data, function(d) { return d.y; })]);

		svg.append("path")
			.datum(dataTable.data)
			.attr("class", "area")
			.attr("d", area);

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
			.text("Price ($)");

		//d3.selectAll('.bar');

	};

	igviz.drawArc = function (divId, chartConfig, dataTable) {
			
			function radialProgress(parent) {
			    var _data=null,
			        _duration= 1000,
			        _selection,
			        _margin = {top:0, right:0, bottom:30, left:0},
			        __width = chartConfig.width,
			        __height = chartConfig.height,
			        _diameter,
			        _label="",
			        _fontSize=10;


			    var _mouseClick;

			    var _value= 0,
			        _minValue = 0,
			        _maxValue = 100;

			    var  _currentArc= 0, _currentArc2= 0, _currentValue=0;

			    var _arc = d3.svg.arc()
			        .startAngle(0 * (Math.PI/180)); //just radians

			    var _arc2 = d3.svg.arc()
			        .startAngle(0 * (Math.PI/180))
			        .endAngle(0); //just radians


			    _selection=d3.select(parent);


			    function component() {

			        _selection.each(function (data) {

			            // Select the svg element, if it exists.
			            var svg = d3.select(this).selectAll("svg").data([data]);

			            var enter = svg.enter().append("svg").attr("class","radial-svg").append("g");

			            measure();

			            svg.attr("width", __width)
			                .attr("height", __height);


			            var background = enter.append("g").attr("class","component")
			                .attr("cursor","pointer")
			                .on("click",onMouseClick);


			            _arc.endAngle(360 * (Math.PI/180))

			            background.append("rect")
			                .attr("class","background")
			                .attr("width", _width)
			                .attr("height", _height);

			            background.append("path")
			                .attr("transform", "translate(" + _width/2 + "," + _width/2 + ")")
			                .attr("d", _arc);

			            background.append("text")
			                .attr("class", "label")
			                .attr("transform", "translate(" + _width/2 + "," + (_width + _fontSize) + ")")
			                .text(_label);

			           //outer g element that wraps all other elements     
			           var gx = chartConfig.width/2 - _width/2;
			           var gy = chartConfig.height/2 - _height/2;
			           var g = svg.select("g")
			                .attr("transform", "translate(" + gx + "," + gy + ")");


			            _arc.endAngle(_currentArc);
			            enter.append("g").attr("class", "arcs");
			            var path = svg.select(".arcs").selectAll(".arc").data(data);
			            path.enter().append("path")
			                .attr("class","arc")
			                .attr("transform", "translate(" + _width/2 + "," + _width/2 + ")")
			                .attr("d", _arc);

			            //Another path in case we exceed 100%
			            var path2 = svg.select(".arcs").selectAll(".arc2").data(data);
			            path2.enter().append("path")
			                .attr("class","arc2")
			                .attr("transform", "translate(" + _width/2 + "," + _width/2 + ")")
			                .attr("d", _arc2);


			            enter.append("g").attr("class", "labels");
			            var label = svg.select(".labels").selectAll(".label").data(data);
			            label.enter().append("text")
			                .attr("class","label")
			                .attr("y",_width/2+_fontSize/3)
			                .attr("x",_width/2)
			                .attr("cursor","pointer")
			                .attr("width",_width)
			                // .attr("x",(3*_fontSize/2))
			                .text(function (d) { return Math.round((_value-_minValue)/(_maxValue-_minValue)*100) + "%" })
			                .style("font-size",_fontSize+"px")
			                .on("click",onMouseClick);

			            path.exit().transition().duration(500).attr("x",1000).remove();


			            layout(svg);

			            function layout(svg) {

			                var ratio=(_value-_minValue)/(_maxValue-_minValue);
			                var endAngle=Math.min(360*ratio,360);
			                endAngle=endAngle * Math.PI/180;

			                path.datum(endAngle);
			                path.transition().duration(_duration)
			                    .attrTween("d", arcTween);

			                if (ratio > 1) {
			                    path2.datum(Math.min(360*(ratio-1),360) * Math.PI/180);
			                    path2.transition().delay(_duration).duration(_duration)
			                        .attrTween("d", arcTween2);
			                }

			                label.datum(Math.round(ratio*100));
			                label.transition().duration(_duration)
			                    .tween("text",labelTween);

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

			        return function(t) {
			            _currentValue = i(t);
			            this.textContent = Math.round(i(t)) + "%";
			        }
			    }

			    function arcTween(a) {
			        var i = d3.interpolate(_currentArc, a);

			        return function(t) {
			            _currentArc=i(t);
			            return _arc.endAngle(i(t))();
			        };
			    }

			    function arcTween2(a) {
			        var i = d3.interpolate(_currentArc2, a);

			        return function(t) {
			            return _arc2.endAngle(i(t))();
			        };
			    }


			    function measure() {
			        _width=_diameter - _margin.right - _margin.left - _margin.top - _margin.bottom;
			        _height=_width;
			        _fontSize=_width*.2;
			        _arc.outerRadius(_width/2);
			        _arc.innerRadius(_width/2 * .85);
			        _arc2.outerRadius(_width/2 * .85);
			        _arc2.innerRadius(_width/2 * .85 - (_width/2 * .15));
			    }


			    component.render = function() {
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


			    component.margin = function(_) {
			        if (!arguments.length) return _margin;
			        _margin = _;
			        return component;
			    };

			    component.diameter = function(_) {
			        if (!arguments.length) return _diameter
			        _diameter =  _;
			        return component;
			    };

			    component.minValue = function(_) {
			        if (!arguments.length) return _minValue;
			        _minValue = _;
			        return component;
			    };

			    component.maxValue = function(_) {
			        if (!arguments.length) return _maxValue;
			        _maxValue = _;
			        return component;
			    };

			    component.label = function(_) {
			        if (!arguments.length) return _label;
			        _label = _;
			        return component;
			    };

			    component._duration = function(_) {
			        if (!arguments.length) return _duration;
			        _duration = _;
			        return component;
			    };

			    component.onClick = function (_) {
			        if (!arguments.length) return _mouseClick;
			        _mouseClick=_;
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

	igviz.drawBarChart = function(divId, chartConfig, dataTable) {
		var width = chartConfig.width;
		var height = chartConfig.height;
		var padding = chartConfig.padding;

		var dataset = dataTable.data.map(function(d) {
			return {
				"data": d,
				"config": chartConfig
			}
		});

		var plotCtx = createScales(dataset, chartConfig, dataTable);
		var xScale = plotCtx.xScale;
		var yScale = plotCtx.yScale;


		var svgID = divId + "_svg";
		//Remove current SVG if it is already there
		d3.select(svgID).remove();



		var svg = d3.select(divId)
			.append("svg")
			.attr("id", svgID.replace("#", ""))
			.attr("width", width)
			.attr("height", height);

		createXYAxises(svg, plotCtx, chartConfig, dataTable);

		//Now we really drwa by creating rectangles. The layout is done such a way that (0,0)
		// starts from bottom left corner as usual.
		//TODO handle multiple column groups using color
		//http://bl.ocks.org/mbostock/3887051

		svg.selectAll(".bar")
			.data(dataset)
			.enter().append("rect")
			.attr("class", "bar")
			.attr("x", function(d) {
				return xScale(d.data[d.config.xAxis]);
			})
			.attr("width", xScale.rangeBand())
			.attr("y", function(d) {
				return yScale(d.data[d.config.yAxis]);
			})
			.attr("height", function(d) {
				return height - yScale(d.data[d.config.yAxis]) - padding;
			}).style("fill",chartConfig.barColor);

		//d3.selectAll('.bar');

	};

	igviz.drawScatterPlot = function(divId, chartConfig, dataTable) {
		//Width and height
		var w = chartConfig.width;
		var h = chartConfig.height;
		var padding = chartConfig.padding;

		//prepare the dataset (all plot methods should use { "data":dataLine, "config":chartConfig } format
		//so you can use util methods
		var dataset = dataTable.data.map(function(d) {
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
	igviz.drawSingleNumberDiagram = function(divId, chartConfig, dataTable) {

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
		var dataset = dataTable.data.map(function(d) {
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
			.text("Max: " + getMax(selectedColumn))
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
			.text("Min: " + getMin(selectedColumn))
			.attr("font-size", MAX_FONT_SIZE)
			.attr("x", 3 * w / 4)
			.attr("y", 3 * h / 4)
			.style("fill", "black")
			.style("text-anchor", "middle")
			.style("lignment-baseline", "middle");
	};

	igviz.drawLineChart = function(divId, chartConfig, dataTable) {
		var w = chartConfig.width; //Width and height and margins
		var h = chartConfig.height;
		var margin = {
			top: 20,
			right: 80,
			bottom: 50,
			left: 30
		};

		var dataSet = dataTable.data.map(function(d) {
			return {
				"data": d,
				"config": chartConfig
			}
		});

		var xAxis = chartConfig.xAxis; //Identifying the Column number corresponding to the selected fields from the form
		var yAxis = chartConfig.yAxis;


		var xAxisName = dataTable.metadata.names[xAxis]; //Identify Column Names of the columns selected from the form

		var yAxisNames=[];


		var columnNames = [xAxisName];
		for( var i=0;i<yAxis.length;i++)
		{
			yAxisNames[i]=dataTable.metadata.names[yAxis[i]];
			columnNames.push(yAxisNames[i]);
		}

		//var yAxisName = dataTable.metadata.names[yAxis];




		dataSet.sort(function(a, b) { //sort the data set with respect to the x coordinates
			return a.data[xAxis] - b.data[xAxis];
		});


		var data = []; //empty array to load the selected data and organize in the required format
		for (var i = 0; i < dataSet.length; i++) {
			var obj={};
			obj['key']=dataSet[i].data[xAxis];
	    	for(var j=0;j<yAxis.length;j++)
			{
				obj['y'+j]=dataSet[i].data[yAxis[j]];
			}


			data.push(obj);
		}

		var svgID = divId + "_svg"; //svg container in which the chart shall be drawn
		d3.select(svgID).remove(); //Remove current SVG if it is already there

		var svg = d3.select(divId) //Create SVG element
			.append("svg")
			.attr("id", svgID.replace("#", ""))
			.attr("width", w) //width
			.attr("height", h + 50) //height
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")"); //move to the middle of the screen in given dimensions

		var interpolationMode = "cardinal"; //interpolation mode [linear, basis, step before, step after, cardinal]
		if (chartConfig.interpolationMode != undefined) {
			interpolationMode = chartConfig.interpolationMode;
		}

		var ordinal = d3.scale.ordinal(); //scale to map y coordinates

		var x = d3.scale.linear() //scale for x axis
			.range([0, w-100]);

		var y = d3.scale.linear() //scale for y axis
			.range([h, 0]);

		var XAxis = d3.svg.axis() //define x axis
			.scale(x)
			.orient("bottom");

		var YAxis = d3.svg.axis() //define y axis
			.scale(y)
			.orient("left");

		var line = d3.svg.line() //svg element to connect the coordinates as a path
			.x(function(d) {
				return x(d.key); //scale x coordinates
			})
			.y(function(d) {
				return y(d.value); //scale y coordinates
			});

		ordinal.domain(d3.keys(data[0]).filter(function(d) {
			return d !== "key"; //get key list as the scale domain except the one which is exactly "key" as it should be the x variable set
		}));

		x.domain(d3.extent(data, function(d) {
			return d.key; //define the domain of x scale
		}));

		var graphs = ordinal.domain().map(function(name) { //organize data in the format, {name,{key,value}}, {key,value}-values
			return {
				name: name,
				values: data.map(function(d) {
					return {
						key: d.key,
						value: +d[name]
					};
				})
			};
		});

		y.domain([ //define the domain of y scale i.e- minimum value of all y coordinates to max of all y coordinates
			d3.min(graphs, function(c) {
				return d3.min(c.values, function(v) {
					return v.value;
				});
			}),
			d3.max(graphs, function(c) {
				return d3.max(c.values, function(v) {
					return v.value;
				});
			})
		]);

		svg.append("g") //append x axis to the chart and move(translate to the bottom
			.attr("class", "x axis")
			.attr("transform", "translate(0," + h + ")")
			.call(XAxis)
			.append("text") //append the label for the x axis
			.attr("x", w-40) //move to the right hand end
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
			.attr("d", function(d) {
				return line.interpolate(interpolationMode)(d.values); //interpolate in given interpolationMode and render line
			})
			.style("stroke", function (d, i) {
				return chartConfig.lineColors[i];              //get different colors for each graph
			});

		graph.append("text")
			.datum(function(d) { //to bind data to a single svg element
				return {
					name: d.name,
					value: d.values[d.values.length - 1]
				};
			})
			.attr("transform", function(d) { //show the label of each graph at the end of each ones last value coordinate
					console.log(d);
				return "translate(" + (x(d.value.key)) + "," + y(d.value.value) + ")";
			})
			.attr("x", 3)
			.attr("dy", ".45em")
			.text(function(d, i) {
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
	igviz.drawTable = function(divId, chartConfig, dataTable) {
		console.log(chartConfig);
		var w = chartConfig.width;
		var h = chartConfig.height;
		var padding = chartConfig.padding;
		var dataSeries = chartConfig.dataSeries;
		var highlightMode = chartConfig.highlightMode;

		var dataset = dataTable.data.map(function(d) {
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
			.text(function(d) {
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
			.data(function(d, i) {
					return d;
				})
				//select the table rows (<tr>) and append table data (<td>)
				.enter()
				.append("td")
				.text(function(d, i) {
					return d;
				})
				.style("font-size", function(d, i) {


					fontSize.domain([
						getMin(parseColumnFrom2DArray(tableData, i)),
						getMax(parseColumnFrom2DArray(tableData, i))
					]);
					return fontSize(d) + "px";
				})
				.style('background-color', function(d, i) {

					//This is where the color is decided for the cell
					//The domain set according to the data set we have now
					//Minimum & maximum values for the particular data column is used as the domain
					alpha.domain([getMin(parseColumnFrom2DArray(tableData, i)), getMax(parseColumnFrom2DArray(tableData, i))]);

					//return the color for the cell
					return 'rgba(' + colors[i].r + ',' + colors[i].g + ',' + colors[i].b + ',' + alpha(d) + ')';

				});

		} else if (isColorBasedSet && !isFontBasedSet) {
			//adding the  data to the table rows
			cells = rows.selectAll("td")

			//Lets do a callback when we get each array from the data set
			.data(function(d, i) {
					return d;
				})
				//select the table rows (<tr>) and append table data (<td>)
				.enter()
				.append("td")
				.text(function(d, i) {
					return d;
				})
				.style('background-color', function(d, i) {

					//This is where the color is decided for the cell
					//The domain set according to the data set we have now
					//Minimum & maximum values for the particular data column is used as the domain
					alpha.domain([
						getMin(parseColumnFrom2DArray(tableData, i)),
						getMax(parseColumnFrom2DArray(tableData, i))
					]);

					//return the color for the cell
					return 'rgba(' + colors[i].r + ',' + colors[i].g + ',' + colors[i].b + ',' + alpha(d) + ')';

				});

		} else if (!isColorBasedSet && isFontBasedSet) {

			//adding the  data to the table rows
			cells = rows.selectAll("td")

			//Lets do a callback when we get each array from the data set
			.data(function(d, i) {
					return d;
				})
				//select the table rows (<tr>) and append table data (<td>)
				.enter()
				.append("td")
				.text(function(d, i) {
					return d;
				})
				.style("font-size", function(d, i) {

					fontSize.domain([
						getMin(parseColumnFrom2DArray(tableData, i)),
						getMax(parseColumnFrom2DArray(tableData, i))
					]);
					return fontSize(d) + "px";
				});

		} else {
			console.log("We are here baby!"); 
			//appending the rows inside the table body
			rows.style('background-color', function(d, i) {

					colorRows.domain([
						getMin(parseColumnFrom2DArray(tableData, chartConfig.xAxis)),
						getMax(parseColumnFrom2DArray(tableData, chartConfig.xAxis))
					]);
					return colorRows(d[chartConfig.xAxis]);
				})
				.style("font-size", function(d, i) {

					fontSize.domain([
						getMin(parseColumnFrom2DArray(tableData, i)),
						getMax(parseColumnFrom2DArray(tableData, i))
					]);
					return fontSize(d) + "px";
				});

			//adding the  data to the table rows
			cells = rows.selectAll("td")
				//Lets do a callback when we get each array from the data set
				.data(function(d, i) {
					return d;
				})
				//select the table rows (<tr>) and append table data (<td>)
				.enter()
				.append("td")
				.text(function(d, i) {
					return d;
				})
		}

	};

	igviz.drawMap = function(divId, chartConfig, dataTable) { //add this
		//Width and height
		divId = divId.substr(1);
		var w = chartConfig.width;
		var h = chartConfig.height;

		var mode = chartConfig.mode;
		var regionO = chartConfig.region;


		//prepare the dataset (all plot methods should use { "data":dataLine, "config":chartConfig } format
		//so you can use util methods
		var dataset = dataTable.data.map(function(d, i) {
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
		};

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
				.domain([0, d3.max(dataset, function(d) {
					return d.data[d.config.xAxis];
				})])
				.range([chartConfig.padding, chartConfig.width - chartConfig.padding]);
		} else {
			xScale = d3.scale.ordinal()
				.domain(dataset.map(function(d) {
					return d.data[chartConfig.xAxis];
				}))
				.rangeRoundBands([chartConfig.padding, chartConfig.width - chartConfig.padding], .1)
		}

		//TODO hanle case r and color are missing

		if (dataTable.metadata.types[chartConfig.yAxis] == 'N') {
			yScale = d3.scale.linear()
				.domain([0, d3.max(dataset, function(d) {
					return d.data[d.config.yAxis];
				})])
				.range([chartConfig.height - chartConfig.padding, chartConfig.padding]);
			//var yScale = d3.scale.linear()
			//    .range([height, 0])
			//    .domain([0, d3.max(dataset, function(d) { return d.data[d.config.yAxis]; })])
		} else {
			yScale = d3.scale.ordinal()
				.rangeRoundBands([0, chartConfig.width], .1)
				.domain(dataset.map(function(d) {
					return d.data[chartConfig.yAxis];
				}))
		}


		//this is used to scale the size of the point, it will value between 0-20
		var rScale = d3.scale.linear()
			.domain([0, d3.max(dataset, function(d) {
				return d.config.pointSize ? d.data[d.config.pointSize] : 20;
			})])
			.range([0, 20]);

		//TODO have to handle the case color scale is categorical : Done
		//http://synthesis.sbecker.net/articles/2012/07/16/learning-d3-part-6-scales-colors
		// add color to circles see https://www.dashingd3js.com/svg-basic-shapes-and-d3js
		//add legend http://zeroviscosity.com/d3-js-step-by-step/step-3-adding-a-legend
		if (dataTable.metadata.types[chartConfig.pointColor] == 'N') {
			colorScale = d3.scale.linear()
				.domain([-1, d3.max(dataset, function(d) {
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
				.attr("transform", function(d) {
					return "rotate("+chartConfig.tickLabelConfig.textAngle+")"
				});
		}

		axis.append("text")
			.style("font-size", chartConfig.xAxisLabelConfig.fontSize)
			.attr("y", chartConfig.xAxisLabelConfig.y)
			.attr("x",(chartConfig.xAxisLabelConfig.x==undefined || chartConfig.xAxisLabelConfig.x==0)?(w-padding/5):chartConfig.xAxisLabelConfig.x)
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
			.attr("transform", "rotate("+chartConfig.yAxisLabelConfig.rotate+")")
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
			.attr("cx", function(d) {
				return xScale(d.data[d.config.xAxis]);
			})
			.attr("cy", function(d) {
				return yScale(d.data[d.config.yAxis]);
			})
			.attr("r", function(d) {
				if (d.config.pointSize != -1) {
					return rScale(d.data[d.config.pointSize]);
				} else {
					return 5;
				}
			})
			.style("fill", function(d) {
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
			.attr("x", function(d) {
				return xScale(d.data[d.config.xAxis]);
			})
			.attr("y", function(d) {
				return yScale(d.data[d.config.yAxis]) - 10;
			})
			.style("font-family", "sans-serif")
			.style("font-size", "10px")
			.style("text-anchor", "middle")
			.text(function(d) {
				if (d.config.pointLabel != -1) {
					return d.data[d.config.pointLabel];
				} else {
					return "3";
				}
			});
	}


	/////////////////////////////////////////// TODO: Fawsan's util stuff. Better refactor these later ////////////////////

	/**
	 * Get teh maximum of a numaric array
	 * @param data
	 * @returns {*}
	 */
	function getMax(data) {

	    var max = data[0];

	    for (var i = 0; i < data.length; i++) {
	        if (max < data[i]) {
	            max = data[i];
	        }
	    }
	    return max;
	}

	/**
	 * Get the minimum value of a numeric array
	 * @param data
	 * @returns {*}
	 */
	function getMin(data) {

	    var min = data[0];

	    for (var i = 0; i < data.length; i++) {
	        if (min > data[i]) {
	            min = data[i];
	        }
	    }
	    return min;
	}

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

	        coordinates[i] = {x: xVals[i], y: pX(xVals[i], sigma, u)};
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




})();