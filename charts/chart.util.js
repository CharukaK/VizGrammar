var extend = function (defaults, options) {
    var extended = {};
    var prop;
    for (prop in defaults) {
        if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
            extended[prop] = defaults[prop];
        }
    }
    for (prop in options) {
        if (Object.prototype.hasOwnProperty.call(options, prop)) {
            extended[prop] = options[prop];
        }
    }
    return extended;
};

function checkConfig(config, metadata){
    
    if (config.color == null) {
		config.color = -1;
	} else if (config.color != "*"){
		config.color = metadata.names.indexOf(config.color);
	}

    if (config.size == null) {
        config.size = -1;
    } else {
        config.size = metadata.names.indexOf(config.size);
    }

    var defaults = {
        title: "table",
        mapType: -1,
        mode: "stack",
        //color hex array or string: category10, 10c, category20, category20b, category20c
        colorScale: "category10", 
        colorDomain: -1,
        maxLength: -1,
        markSize: 2,
        fillOpacity: 1,
        innerRadius:1,
        //string: canvas or svg
        renderer: "svg", 
        padding: {"top": 10, "left": 50, "bottom": 40, "right": 100},
        dateFormat: "%x %X",
        range:false,
        rangeColor:"#222",

        //Tool Configs
        tooltip: {"enabled":true, "color":"#e5f2ff", "type":"symbol"},

        //Legend Configs
        legend:true,
        legendTitleColor: "#222",
        legendTitleFontSize: 13,
        legendTextColor: "#888",
        ledgendTextFontSize: 12,

        //Axes Configs
        xTitle: config.x,
        yTitle: config.y,
        xAxisAngle:false,
        yAxisAngle:false,
        axesColor:"#222",
        axesSize:1,
        axesFontSize:10,
        titleFontSize:12,
        titleFontColor:"#222",
        grid: true,
        zero: false,
        xTicks: 0,
        yTicks: 0,
        xFormat: "",
        yFormat: ""


    };
    
    if (typeof vizgSettings != 'undefined'){
        defaults = extend(defaults, vizgSettings);
    }

    config = extend(defaults, config);
    config.height = config.height  - (config.padding.top + config.padding.bottom);
    config.width = config.width  - (config.padding.left + config.padding.right);

    if (typeof config.colorScale == "string") {
      config.markColor = window["d3"]["scale"][config.colorScale]().range()[0];
    } else {
      config.markColor = config.colorScale[0];
    }

	config.x = metadata.names.indexOf(config.x);
    config.y = metadata.names.indexOf(config.y);

    return config;
}

function buildTable(datatable) {
	var chartDatatable = {};
	chartDatatable.metadata = datatable[0].metadata;
	chartDatatable.values = buildData(datatable[0].data, datatable[0].metadata);
	return chartDatatable;
}


function buildData(data, metadata) {
	chartData = [];
	for (i = 0; i < data.length; i++) {
		var row = {};
		for (x = 0; x < metadata.names.length; x++) {
			row[metadata.names[x]] = data[i][x];
		}
		chartData.push(row);
	}
	return chartData;
}

/*
	General function used to draw circle symbols graphs
*/
function getSymbolMark(config, metadata) {

  var fill;
  if (config.color != -1) { 
      fill =  {"scale": "color", "field": metadata.names[config.color]};
  } else {
      fill = {"value":config.markColor};
  }

var  mark = {
      "type": "symbol",
      "from": {"data": config.title},
      "properties": {
        "update": {
          "x": {"scale": "x", "field": metadata.names[config.x]},
          "y": {"scale": "y", "field": metadata.names[config.y]},
          "fill": fill,
          "size": {"value": config.markSize},
          "fillOpacity": {"value": config.fillOpacity}
        }
      }
    }

    return mark;
}



function getSignals(config, metadata){

    var signals = [{
            "name": "hover",
            "init": {},
            "streams": [
                {"type": config.hoverType+":mouseover", "expr": "datum"},
                {"type": config.hoverType+":mouseout", "expr": "{}"}
            ]
    }];

    return signals;

}

function bindTooltip(div,markType,eventObj, config, metaData, keyList){

    eventObj.on("mouseover", function(event, item) {

        if (item != null && item.status != "exit" && item.mark.marktype == markType) {
            var canvas = $(".marks")[0];
            if($("#wrapper #tip").length) {
                $tip.remove();
            }

            $(div).wrap( "<div id='wrapper' style='position: relative'></div>" );

            $("#wrapper").append("<div id='tip' class='tooltipClass' style='top:0; left: 0; position: absolute'></div>");
            $tip=$('#tip');
            $tip.empty();

            var dataObj = item.datum;
            var dynamicContent = "";
            for (var key in dataObj) {
                if (dataObj.hasOwnProperty(key)) {
                    if(keyList != undefined){
                        for(var z=0;z<keyList.length;z++){
                            for (var keyVal in config) {
                                if(keyVal == keyList[z] && metaData.names[config[keyVal]] == key){
                                    dynamicContent += "<p>"+keyList[z]+" ("+key+"):"+dataObj[key]+"</p>";
                                    break;
                                }
                            }
                        }
                    }else{
                        if(metaData.names[config.x] == key){
                            dynamicContent += "<p>X ("+key+"):"+dataObj[key]+"</p>";
                        }
                        if(metaData.names[config.y] == key){
                            dynamicContent += "<p>Y ("+key+"):"+dataObj[key]+"</p>";
                        }
                    }
                }
            }

            $tip.append(dynamicContent);

            var canvasWidth = canvas.width;
            var canvasHeight = canvas.height;

            var el = $('.marks[style*="width"]');

            if(el.length > 0){
                canvasWidth = parseFloat($(".marks")[0].style.width);
                canvasHeight = parseFloat($(".marks")[0].style.height);
            }
            var dynamicWidth = $tip.width();
            var dynamicHeight = $tip.height();

            var toolTipWidth = item.bounds.x2 + config.padding.left + dynamicWidth;
            var toolTipHeight = (canvasHeight - item.bounds.y2) - config.padding.top + dynamicHeight;
            var toolTipCalculatedXPosition;
            var toolTipCalculatedYPosition = ((item.bounds.y2 + config.padding.top) - dynamicHeight);

            if(toolTipWidth > canvasWidth){
                toolTipCalculatedXPosition = ((item.bounds.x2 + config.padding.left) - dynamicWidth);
            }else{
                toolTipCalculatedXPosition = (item.bounds.x2 + config.padding.left);
            }

            if(toolTipHeight > canvasHeight){
                toolTipCalculatedYPosition = item.bounds.y2 + config.padding.top;
            }

            $tip.css({left:toolTipCalculatedXPosition,top:toolTipCalculatedYPosition}).show();
        }else{

            if($("#wrapper #tip").length) {
                $tip.remove();
            }
            if($(div).closest("#wrapper").length) {
                $(div).unwrap();
            }
        }
    })
};



function createTooltip(div) {
   document.getElementById(div.replace("#", "")).innerHTML = document.getElementById(div.replace("#", "")).innerHTML 
        + "<div id= "+div.replace("#", "")+"-tooltip></div>";
}

function bindTooltip(div, view, config, metadata){

    view.on("mouseover", function(event, item) {
      if (item != null && item.mark.marktype == config.tooltip.type) { 
        var tooltipDiv = document.getElementById(div.replace("#", "")+"-tooltip");
        var tooltipContent = "";
    
        if (item.datum[metadata.names[config.x]]!= null) {
          var content;

        //Default tooltip content if tooltip content is not defined
        if (config.tooltip.content == null) {
              if (metadata.types[config.x]== "time") {
                var dFormat =  d3.time.format(config.dateFormat);
                content =  dFormat(new Date(parseInt(item.datum[metadata.names[config.x]])));
              } else {
                content = item.datum[metadata.names[config.x]];
              }

              tooltipContent += "<b>"+ metadata.names[config.x] +"</b> : "+content+"<br/>" ;

            if (item.datum[metadata.names[config.y]] != null) {
                    tooltipContent += "<b>"+ metadata.names[config.y] + "</b> : "+item.datum[metadata.names[config.y]]+"<br/>" 
                }
            
            } else {
                //check all specified column and add them as tooltip content
                for (var i = 0; i < config.tooltip.content.length; i++) {
                    if (metadata.types[metadata.names.indexOf(config.tooltip.content[i])]=== "time") {
                        var dFormat =  d3.time.format(config.dateFormat);
                        content =  dFormat(new Date(parseInt(item.datum[metadata.names[config.x]])));
                    } else {
                        content = item.datum[config.tooltip.content[i]];
                    }

                    if (config.tooltip.label != false) {
                        tooltipContent += "<b>"+ config.tooltip.content[i] +"</b> : "+content+"<br/>" ;
                    } else {
                        tooltipContent += content+"<br/>" ;
                    }
                };

        }

       
        } 


        if (tooltipContent != "") {
            tooltipDiv.innerHTML = tooltipContent;
            tooltipDiv.style.padding = "5px 5px 5px 5px";
        }

        window.onmousemove = function (e) {
          tooltipDiv.style.top = (e.clientY + 15) + 'px';
          tooltipDiv.style.left = (e.clientX + 10) + 'px';
          tooltipDiv.style.zIndex  = 1000;
          tooltipDiv.style.backgroundColor = config.tooltip.color;
          tooltipDiv.style.position = "fixed";

          if (tooltipDiv.offsetWidth +  e.clientX - (cumulativeOffset(document.getElementById(div.replace("#", ""))).left + config.padding.left)  >  document.getElementById(div.replace("#", "")).offsetWidth) {
            tooltipDiv.style.left = (e.clientX - tooltipDiv.offsetWidth) + 'px';
          }

          if (e.clientY - (cumulativeOffset(document.getElementById(div.replace("#", ""))).top + 500) >  document.getElementById(div.replace("#", "")).offsetHeight) {
            tooltipDiv.style.top = (e.clientY - 400) + 'px';
          }
        
        }; 
      }
    })
    .on("mouseout", function(event, item) {
      var tooltipDiv = document.getElementById(div.replace("#", "")+"-tooltip");
      tooltipDiv.style.padding = "0px 0px 0px 0px";
      tooltipDiv.innerHTML = "";
    }).update();
}


function cumulativeOffset(element) {
    var top = 0, left = 0;
    do {
        top += element.offsetTop  || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while(element);

    return {
        top: top,
        left: left
    };
};

function getXYAxes(config, xAxesType, xScale, yAxesType, yScale) {
    var xProp = {"ticks": {
                   "stroke": {"value": config.axesColor}, 
                   "strokeWidth":{"value":config.axesSize}
                 },
                 "labels": {
                   "fill": {"value": config.axesColor},
                    "fontSize": {"value": config.axesFontSize}
                 },
                 "title": {
                   "fontSize": {"value": config.titleFontSize},
                    "fill": {"value": config.titleFontColor}
                 },
                 "axis": {
                   "stroke": {"value": config.axesColor},
                   "strokeWidth": {"value": config.axesSize}
                 }};
    var yProp =  {"ticks": {
                   "stroke": {"value": config.axesColor}, 
                   "strokeWidth":{"value":config.axesSize}
                 },
                 "labels": {
                   "fill": {"value": config.axesColor},
                    "fontSize": {"value": config.axesFontSize}
                 },
                 "title": {
                   "fontSize": {"value": config.titleFontSize},
                    "fill": {"value": config.titleFontColor}
                 },
                 "axis": {
                   "stroke": {"value": config.axesColor},
                   "strokeWidth": {"value": config.axesSize}
                 }};
    
    if (config.xAxisAngle) {
        xProp.labels = {
                       "labels": {
                          "fill": {"value": "orange"},
                          "fontSize": {"value": 12},
                          "angle": {"value": 45},
                          "align": {"value": "left"},
                          "baseline": {"value": "middle"}
                       }
                     };
    }

    if (config.yAxisAngle) {
        yProp =     {
                       "labels": {
                         "angle": {"value": 45},
                         "align": {"value": "left"},
                         "baseline": {"value": "middle"}
                       }
                     };
    }

    var axes =  [
      { "type": xAxesType, 
        "scale": xScale,
        "grid": config.grid, 
        "format" : config.xFormat, 
        "ticks" : config.xTicks, 
        "title": config.xTitle,
        "properties": xProp
      },
      {
        "type": yAxesType, 
        "scale": yScale, 
        "grid": config.grid, 
        "format" : config.yFormat, 
        "ticks" : config.yTicks, 
        "title": config.yTitle,
        "properties": yProp
      }
    ];

    return axes;
}

function getRangeSignals(config, signals) {
    signals.push({
            "name": "range_start",
            "streams": [{
              "type": "mousedown", 
              "expr": "eventX()", 
              "scale": {"name": "x", "invert": true}
            }]
          });
          signals.push(    {
            "name": "range_end",
            "streams": [{
              "type": "mousedown, [mousedown, window:mouseup] > window:mousemove",
              "expr": "clamp(eventX(), 0, "+config.width+")",
              "scale": {"name": "x", "invert": true}
            }]
    });
    return signals;
}

function getRangeMark(config, marks) {
      marks.push( {
          "type": "rect",
          "properties":{
            "enter":{
              "y": {"value": 0},
              "height": {"value":config.height},
              "fill": {"value": config.rangeColor},
              "fillOpacity": {"value":0.3}
            },
            "update":{
              "x": {"scale": "x", "signal": "range_start"},
              "x2": {"scale": "x", "signal": "range_end"}
            }
          }
        });

     return marks;
}

function getLegend(config) {
  var legends = [
          {
            "fill": "color",
            "title": "Legend",
            "offset": 0,
            "properties": {
                  "symbols": {
                      "stroke": {"value": "transparent"}
                  },
                  "title": {
                      "fill": {"value": config.legendTitleColor},
                      "fontSize": {"value": config.legendTitleFontSize}
                  },
                  "labels": {
                      "fill": {"value": config.legendTextColor},
                      "fontSize": {"value": config.ledgendTextFontSize}
                    }
              }
          }
      ];

    return legends;
}

function drawChart(div, obj, callbacks) {
    var viewUpdateFunction = (function(chart) {
      if(obj.config.tooltip.enabled){
         createTooltip(div);
         obj.view = chart({el:div}).renderer(obj.config.renderer).update();
         bindTooltip(div,obj.view,obj.config,obj.metadata);
      } else {
         obj.view = chart({el:div}).renderer(obj.config.renderer).update();
      }

      if (callbacks != null) {
        for (var i = 0; i<callbacks.length; i++) {
          if (callbacks[i].type == "range") {
              var range_start;
              var range_end;
              var callback = callbacks[i].callback;
                if (obj.config.range) {
                  obj.view.onSignal("range_start", function(signalName, signalValue){
                  range_start = signalValue;
                  });

                  obj.view.onSignal("range_end", function(signalName, signalValue){
                  range_end = signalValue;
                  callback(range_start, range_end);
               });
              }
          } else {
            obj.view.on(callbacks[i].type, callbacks[i].callback);
          }          
        }
      }
    }).bind(obj);

    vg.parse.spec(obj.spec, viewUpdateFunction);
}
