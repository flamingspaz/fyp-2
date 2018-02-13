import Component from '@ember/component';

export default Component.extend({
    didRender() {
        var data = this.get('data');
        //this.$('#graph').innerHTML = "";

        var diameter = 600;

        var svg = d3.select('#graph').append('svg')
        .attr('width', diameter)
        .attr('height', diameter);

        var bubble = d3.layout.pack()
        .size([diameter, diameter])
        .value(function(d) {return d.size;})
        .padding(3);

        var finaldata = { "deployments": {}};
        data.items.forEach(function(item) {
            var tmpdata = {
                "name": item.metadata.name,
                "size": item.spec.replicas
            };
            finaldata.deployments[item.metadata.name] = item.spec.replicas;
        });
        //console.log(finaldata);

        var color = d3.scale.category20();
        // generate data with calculated layout values
        var nodes = bubble.nodes(processData(finaldata.deployments))
        .filter(function(d) { return !d.children; }); // filter out the outer bubble
        var plinks = [{source: nodes[1], target: nodes[2]}];

        var vis = svg.selectAll('circle')
        .data(nodes);

        vis.enter().append('circle')
        .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
        .attr('r', function(d) { return d.r; })
        .attr('class', function(d) { return d.className; })
        .attr("fill",function(d,i){return color(i);})
        .on('click', (d) => this.get("circleClicked")(d.name));

        vis.enter().append("text")
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y + 5; })
        .attr("text-anchor", "middle")
        .text(function(d){ return d['name']; })
        .style({
            "fill":"white",
            "font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
            "font-size": "15px"
        });


            var links = svg.selectAll("line.node")
                .data(plinks)
                .enter()
                .append("line")
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; })
                .attr("class", "node")
                .style("stroke", "#000")
                .style("stroke-width", 5);

        function processData(data) {
            var obj = data;

            var newDataSet = [];

            for(var prop in obj) {
                newDataSet.push({name: prop, className: prop.toLowerCase(), size: obj[prop]});
            }
            return {children: newDataSet};
        }
        //d3.json("http://127.0.0.1:8080/apis/apps/v1/namespaces/default/deployments/", function(data) {

        //});
    },
    didUpdate() {
        console.log('ayyy');
        d3.select('svg').remove();
    }
});
