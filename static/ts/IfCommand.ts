module adventure {
	export class IfCommand extends Command {
		yes:Command[];
		no:Command[];
		exp:string;
		_target:string;
		constructor(manager:Manager) {
			super(manager, "if");
			this.yes = new Command[];
			this.no = new Command[];
		}

		execute() {
			var exp = Util.analysisVarLine(this.exp);
			var result = eval(exp);
			var target = result ? "yes" : "no";
			if (this[target].length == 0) {
				this.finished.fire();
				return;
			}

			var finishCount = 0;
			var finished = () => {
				finishCount++;
				if (finishCount == this[target].length)
					this.finished.fire();
			}
			for (var i=0; i<this[target].length; i++) {
				this[target][i].manager = this.manager;
				this[target][i].finished.handle(this, finished);
				this[target][i].execute();
			}
		}

		add(line:string, tab:number) {
			if (tab > 2) {
				var index = this[this._target].length - 1;
				this[this._target][index].add(line, tab-2);
			} else if (tab == 2) {
				var command = Compiler.createCommand(line);
				command.parent = this;
				this[this._target].push(command);
			} else {
				if (line == "yes") {
					this._target = "yes";
				} else if (line == "no") {
					this._target = "no";
				} else {
					delete this._target;
					super.add(line, tab);
				}
			}
		}

		toString(prefix?:string):string {
			var tmp = this.toStringCommon(prefix, "_target", "yes", "no");
			if (this.yes.length) {
				tmp += "\n yes\n";
				var yess = [];
				for (var i=0; i<this.yes.length; i++)
					yess.push(this.yes[i].toString("  "));
				tmp += "  "+yess.join("\n  ");
			}
			if (this.no.length) {
				tmp += "\n no\n";
				var nos = [];
				for (var i=0; i<this.no.length; i++)
					nos.push(this.no[i].toString("  "));
				tmp += "  "+nos.join("\n  ");
			}
			return tmp;
		}

		getProperties():PropertySet {
			var p = new PropertySet("条件分岐を行うコマンドです。");
			p.add("exp", "string", "条件式を指定します。", true);
			p.add("yes", "commands", "条件式が真の場合に実行されるコマンド群を指定します。");
			p.add("no", "commands", "条件式が偽の場合に実行されるコマンド群を指定します。");
			return p;
		}
	}
}