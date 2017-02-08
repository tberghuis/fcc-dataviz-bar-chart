import * as d3 from 'd3';
import gdp from '../assets/GDP-data.json';


var data = gdp.data;

// notes
d3.select(".notes")
    .text(gdp.description);

data = data.map((d) => {
    var ret = {};
    ret.GDP = d[1];
    ret.date = new Date(d[0]);
    let x = d[0].split('-');
    //convert x[1] to quarter
    switch (x[1]) {
        case '01':
            x[1] = '1'
            break;
        case '04':
            x[1] = '2'
            break;
        case '07':
            x[1] = '3'
            break;
        case '10':
            x[1] = '4'
            break;
    }

    if (ret.GDP > 1000) {
        ret.GDPtext = parseFloat((ret.GDP / 1000).toPrecision(3)) + ' Trillion';
    }
    else {
        ret.GDPtext = parseFloat(ret.GDP.toPrecision(3)) + ' Billion';
    }
    ret.quarter = 'Q' + x[1] + ', ' + x[0];
    ret.tick = (x[1] == '1') && ((+x[0]) % 10 == 0);
    return ret;
});

var WIDTH = 1000, HEIGHT = 500;
var margin = {
    top: 5,
    right: 10,
    bottom: 30,
    left: 75
},
    width = WIDTH - margin.left - margin.right,
    height = HEIGHT - margin.top - margin.bottom;

var svg = d3.select("svg");
svg.attr('width', WIDTH)
    .attr('height', HEIGHT);


var rootGroup = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



// add defs background image
rootGroup.append('defs')
    .html(`
    <pattern id="chart-background" patternUnits="userSpaceOnUse" width="${WIDTH}" height="${HEIGHT}">
            <image xlink:href="assets/money.jpg" x="0" y="0" width="${WIDTH}" height="${HEIGHT}"/>
        </pattern>
    `);

var x = d3.scaleBand().range([0, width])
    .domain(data.map(d => d.date));
var y = d3.scaleLinear().rangeRound([height, 0]);
y.domain([0, d3.max(data, function (d) { return d.GDP; })]);

var tooltip, amount, quarter;
tooltip = d3.select('.tooltip');
amount = d3.select('.tooltip .amount');
quarter = d3.select('.tooltip .quarter');

rootGroup.selectAll("rect")
    .data(data)
    .enter().append("rect")
    .attr("x", function (d) { return x(d.date); })
    .attr("y", function (d) { return y(d.GDP); })
    .attr("width", x.bandwidth())
    .attr("height", function (d) { return height - y(d.GDP); })
    .attr("fill", "url(#chart-background)")
    .on("mouseover", function (d) {
        var rect = d3.select(this);
        rect.attr("fill", "black")

        //tooltip
        amount.text(d.GDPtext);
        quarter.text(d.quarter);
        tooltip
            .style("left", (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY - 50) + "px")
            .style('display', 'block');

    })
    .on("mouseout", function () {
        var rect = d3.select(this);
        rect.attr("fill", "url(#chart-background)");
        d3.select('.tooltip').style('display', 'none');
    });

// axis
var xAxis = d3.axisBottom(x)
    .tickValues(x.domain().filter(function (d, i) { return data[i].tick }))
    .tickFormat(d3.timeFormat("%Y"));

rootGroup.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

rootGroup.append("g")    
    .call(d3.axisLeft(y));





