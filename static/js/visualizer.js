FlowVisualizer = function (flowchart, width, height, container) {
	this.flowchart = flowchart;
	this.manager = flowchart.manager;
	this.width = width;
	this.height = height;
	this.container = container;
	this.nodes = [];
	this.links = [];
}
FlowVisualizer.prototype = {
	init: function() {
		this.colors = pv.Colors.category10();
		this.vis = new pv.Panel()
			.width(800)
			.height(800)
			.canvas("chart-container")
			.fillStyle("white")
			.event("mousedown", pv.Behavior.pan())
			.event("mousewheel", pv.Behavior.zoom());
	},

	create: function() {
		var flowchart = this.flowchart;
		var nodes = this.nodes;
		var links = this.links;
		var manager = this.manager;

		for (var i=0; i<flowchart.nodes.length; i++) {
			var node = flowchart.nodes[i];
			var n = {
				nodeName: i+":"+node.caption
			};
			if (node.route.length == 0) {
				n.group = 1;
			} else if (node.route.length == 1) {
				if (node.route[0].next == (i+1)) {
					if (manager.commands[i].name == "call")
						n.group = 6;
					else
						n.group = 2;
				} else {
					n.group = 3;
				}
			} else {
				n.group = 8;
			}
			switch(manager.commands[i].name) {
			case "scene":
				n.p = 50;
				n.group = 4;
			break;
			case "label":
				n.p = 50;
				n.group = 5;
			break;
			default:
				n.p = 20;
			}
			for (var j=0; j<node.route.length; j++) {
				links.push({
					source: i,
					target: node.route[j].next,
					value: node.route.length == 1 ? 3 : 1
				});
			}
			nodes.push(n)
		}

		this.force = this.vis.add(pv.Layout.CustomForce)
			.nodes(nodes)
			.links(links);
		var force = this.force;

		force.link.add(pv.Line);

		var colors = this.colors;
		force.node.add(pv.Dot)
			.fillStyle(function(d) { return d.active ? "#f00" : colors(d.group); })
			.strokeStyle(function() { return this.fillStyle().darker(); })
			.lineWidth(1)
			.size(function(d) { return (d.p ? d.p : 1) * Math.pow(this.scale, -1.5); } )
			.title(function(d) { return d.nodeName;})
			.event("mousedown", pv.Behavior.drag())
			.event("drag", force);


		force.label.add(pv.Label)
			.textBaseline("bottom");
	},

	layout: function() {
		var test = 0;
		var self = this;
		var _test = function() {
			for (var i=0; i<100; i++)
				self.force.sim.step();
			self.force.render();
			test++;
			if (test++ < 50) {
				setTimeout(_test, 50);
			}
		}
		setTimeout(_test, 50);
	},

	render: function() {
		this.vis.render();
	},

	deactiveAll: function(refresh) {
		for (var i=0; i<this.nodes.length; i++) {
			delete this.nodes[i].active;
		}
		if (refresh)
			this.render();
	},

	active: function(targets, refresh) {
		for (var i=0; i<targets.length; i++) {
			this.nodes[targets[i]].active = true;
		}
		if (refresh)
			this.render();
	}
}
