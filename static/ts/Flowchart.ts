module adventure {
	export class Flowchart {
		manager:Manager;
		nodes:FlowNode[];
		constructor(manager:Manager) {
			this.manager = manager;
			this.nodes = new FlowNode[];
		}

		getRoute(index:number, first?:number) {
			if (first === undefined)
				first = 0;

			if (this.nodes[0].prev === undefined)
				this.createPrevInfo();

			var routes = [];
			routes.push([]);
			routes[0].push(index);
			var nodeLength = this.nodes.length;
			while (routes.length && routes.length < nodeLength) {
				for (var i=0; i<routes.length; i++) {
					var route = routes[i];
					var lastRoute = route[route.length - 1];
					if (lastRoute == first)
						return route;
					var node = this.nodes[lastRoute];
					if (node.prev.length == 0) {
						if (routes.length == 1)
							return route;
						routes.splice(i--, 1);
						continue;
					}
					for (var j=1; j<node.prev.length; j++) {
						var newRoute = route.slice(0);
						newRoute.push(node.prev[j]);
						routes.unshift(newRoute);
						i++;
					}
					route.push(node.prev[0]);
				}
			}
			return null;
		}

		getJumpTo(cmd:JumpCommand, d:number) {
			if (cmd.command !== undefined) {
				return cmd.command;
			} else if (cmd.scene !== undefined) {
				return this.manager.scenes[cmd.scene];
			} else if (cmd.label !== undefined) {
				return this.manager.labels[cmd.label];
			}
			return d;
		}

		getSubCommandTo(cmds:Command[], d:number) {
			for (var i=0; i<cmds.length; i++) {
				var cmd = cmds[i];
				switch (cmd.name) {
					case "jump":
					case "call":
						return this.getJumpTo(<JumpCommand>cmd, d);
					break;
					case "return":
						//TODO
					break;
				}
			}
			return d;
		}

		createPrevInfo() {
			for (var i=0; i<this.nodes.length; i++) {
				var node = this.nodes[i];
				node.prev = new number[];
				for (var j=0; j<this.nodes.length; j++) {
					for (var k=0; k<this.nodes[j].route.length; k++) {
						if (this.nodes[j].route[k].next == i) {
							node.prev.push(j);
						}
					}
				}
			}
		}

		generate() {
			var cmds = this.manager.commands;
			for (var i=0; i<cmds.length; i++) {
				var cmd = cmds[i];
				var node = new FlowNode(i);
				switch (cmd.name) {
					case "message":
						node.caption = cmd["message"].substr(0, 10);
					break;
					case "label":
					case "scene":
						node.caption = cmd["id"] ? cmd["id"] : cmd.name;
					break;
					case "call":
						node.caption = "(";
						if (cmd["command"] !== undefined) {
							node.caption += "c:"+cmd["command"];
						} else if (cmd["scene"]) {
							node.caption += "s:"+cmd["scene"];
						} else {
							node.caption += cmd["label"];
						}
						node.caption += ")";
					break;
					default:
						node.caption = cmd.name;
				}
				switch (cmd.name) {
					case "if":
						var ifCmd = <IfCommand>cmd;
						var yes = this.getSubCommandTo(ifCmd.yes, i+1);
						var no = this.getSubCommandTo(ifCmd.no, i+1);
						if (yes == no) {
							node.add(yes);
						} else {
							node.add(yes, ifCmd.exp+"==yes")
							node.add(no, ifCmd.exp+"==no")
						}
					break;
					case "jump":
						node.add(this.getJumpTo(<JumpCommand>cmd, i+1));
					break;
					case "call":
						node.add(i+1);
					break;
					case "return":
						//TODO
					break;
					case "exit":
					break;
					default:
						node.add(i+1);
					break;
				}
				this.nodes.push(node);
			}
		}
	}

	export class FlowNode {
		index:number;
		route:FlowRoute[];
		prev:number[];
		caption:string;
		constructor(index:number, caption?:string,next?:number) {
			this.index = index;
			this.route = new FlowRoute[];
			if (next !== undefined)
				this.add(next);
		}

		add(next:number, reason?:string) {
			this.route.push({
				next: next,
				reason: reason
			});
		}

		toString():string {
			var ret = this.caption ? this.caption : this.index.toString();
			for (var i=0; i<this.route.length; i++) {
				var r = this.route[i];
				ret += "\n --"+(r.reason ? "["+r.reason+"]" : "")+"--"+r.next;
			}
			return ret;
		}
	}

	export interface FlowRoute {
		next:number;
		reason?:string;
	}
}