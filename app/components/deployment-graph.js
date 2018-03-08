import Component from '@ember/component';

export default Component.extend({
    didRender() {
        var data = this.get('data');
        //this.$('#graph').innerHTML = "";
        var networkpolicies = this.get('networkpolicies');
        console.log(networkpolicies.items);
        var diameter = 600;

        var svg = d3.select('#graph').append('svg')
        .attr('width', diameter)
        .attr('height', diameter);

        var bubble = d3.layout.pack()
        .size([diameter, diameter])
        .value(function(d) {return d.size;})
        .padding(3);

        var finaldata = {"children": []};
        data.items.forEach(function(item) {
            var tmpdata = {
                "name": item.metadata.name,
                "size": item.spec.replicas,
                "value": item.spec.replicas,
                "k8sLabels": item.metadata.labels
            };
            finaldata.children.push(tmpdata)
        });

        var color = d3.scale.category20();
        // generate data with calculated layout values
        var nodes = bubble.nodes(finaldata)
        .filter(function(d) { return !d.children; }); // filter out the outer bubble

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


        //var plinks = [{source: nodes[1], target: nodes[2]}, {source: nodes[0], target: nodes[2]}];
            var plinks = []
        networkpolicies.items.forEach(policy => {
            var source_indexes = []
            var target_indexes = []
            var source_selector = policy.spec.podSelector.matchLabels
            var target_selector = policy.spec.ingress[0].from[0].podSelector.matchLabels
            // find the source node for the networkpolicy
            for (var label in source_selector) {
                var value = source_selector[label]
                console.log(value)
                console.log(label + ":" + source_selector[label])
                console.log("nodes")
                var matchedSources = []
                for (var i = 0; i < nodes.length; i++) {
                    if (nodes[i].k8sLabels[label] === value) {
                        matchedSources.push(i)
                    }
                }
                source_indexes = source_indexes.concat(matchedSources)
            }
            console.log(source_indexes)
            // find the target node for the networkpolicy
            for (var label in target_selector) {
                var value = target_selector[label]
                var matchedTargets = []
                for (var i = 0; i < nodes.length; i++) {
                    if (nodes[i].k8sLabels[label] === value) {
                        matchedTargets.push(i)
                    }
                }
                target_indexes = target_indexes.concat(matchedTargets)
            }
            console.log(source_indexes)
            source_indexes.forEach(source_index => {
                target_indexes.forEach(target_index => {
                    plinks.push({source: nodes[source_index], target: nodes[target_index]})
                })
            })
            console.log(plinks)
            svg.selectAll("line.node")
                .data(plinks)
                .enter()
                .append("line")
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; })
                .attr("class", "node")
                .style("stroke",'#'+(Math.random()*0xFFFFFF<<0).toString(16))
                .style("stroke-width", 5);
        });
    },
    didUpdate() {
        d3.select('svg').remove();
    }
});
