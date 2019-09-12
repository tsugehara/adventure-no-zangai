pv.Layout.CustomForce = function() {
	pv.Layout.Force.call(this);
};
pv.Layout.CustomForce.prototype = pv.extend(pv.Layout.Force);
pv.Layout.CustomForce.prototype.defaults = new pv.Layout.CustomForce()
	.extend(pv.Layout.Force.prototype.defaults);

pv.Layout.CustomForce.prototype.buildImplied = function(s) {
	if (pv.Layout.Network.prototype.buildImplied.call(this, s)) {
		var f = s.$force;
		if (f) {
			f.next = this.binds.$force;
			this.binds.$force = f;
		}
		return;
	}

	var that = this,
		nodes = s.nodes,
		links = s.links,
		k = s.iterations,
		w = s.width,
		h = s.height;

	for (var i = 0, n; i < nodes.length; i++) {
		n = nodes[i];
		if (isNaN(n.x)) n.x = w / 2 + 40 * Math.random() - 20;
		if (isNaN(n.y)) n.y = h / 2 + 40 * Math.random() - 20;
	}

	var sim = this.sim = pv.simulation(nodes);
	sim.force(pv.Force.drag(s.dragConstant));
	sim.force(pv.Force.charge(s.chargeConstant)
		.domain(s.chargeMinDistance, s.chargeMaxDistance)
		.theta(s.chargeTheta));
	sim.force(pv.Force.spring(s.springConstant)
		.damping(s.springDamping)
		.length(s.springLength)
		.links(links));

	sim.constraint(pv.Constraint.position());

	if (s.bound)
		sim.constraint(pv.Constraint.bound().x(6, w - 6).y(6, h - 6));

	function speed(n) {
		return n.fix ? 1 : n.vx * n.vx + n.vy * n.vy;
	}

	sim.step();
	sim.step();

	var force = s.$force = this.binds.$force = {
		next: this.binds.$force,
		nodes: nodes,
		min: 1e-4 * (links.length + 1),
		sim: sim
	};
};
