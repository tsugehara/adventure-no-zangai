module adventure {
	export class Command {
		name:string;
		manager:Manager;
		finished:jg.Trigger;
		parent:Command;

		constructor(manager:Manager, name:string) {
			this.name = name;
			this.manager = manager;
			this.finished = new jg.Trigger();
		}

		execute() {
			this.finished.fire();
		}

		add(line:string, tab:number) {
			var kv = this.getKeyValue(line);
			if (PropertyUtil.isNumber(this, kv.key)) {
				this.setProp(kv, true);
				return;
			}
			this.setProp(kv);
		}

		getKeyValue(line:string):KeyValue {
			var index = line.indexOf(":");
			if (index == -1)
				return {
					key: "",
					value: line
				};
			return {
				key: line.substr(0, index).replace(/^[\s\t]+/, ""),
				value: line.substr(index+1).replace(/^[\s\t]+/, "")
			}
		}

		setProp(kv:KeyValue, isInt?:bool) {
			if (isInt)
				this[kv.key] = Number(kv.value);
			else
				this[kv.key] = kv.value;
		}

		toStringCommon(prefix?:string, ...ngs:string[]):string {
			var props = [];
			var ng = ["name", "manager", "finished", "parent"];
			if (ngs)
				ng = ng.concat(ngs);
			if (!prefix)
				prefix = "";
			for (var prop in this) {
				var t = typeof this[prop];
				if (ng.indexOf(prop) >= 0)
					continue;
				if (t == "function")
					continue;
				if (t == "string" || t == "number") {
					props.push(prop+": "+this[prop]);
					continue;
				}
				if (this[prop] instanceof Array) {
					for (var i=0; i<this[prop].length; i++) {
						props.push(this[prop][i].toStringCommon(prefix+" ", ngs));
					}
				} else {
					props.push(this[prop].toStringCommon(prefix+" ", ngs));
				}
			}
			if (props.length == 0)
				return this.name;
			return this.name +"\n"
			+prefix+" "+props.join("\n"+prefix+" ");
		}

		toString(prefix?:string):string {
			return this.toStringCommon(prefix);
		}

		getProperties():PropertySet {
			return new PropertySet();
		}

		random(min:number, max:number) {
			return this.manager.game.random(min, max);
		}
	}
}