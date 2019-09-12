module adventure {
	export class PreviewGame extends jgengine.ManualGame {
		manager:Manager;
		flowchart:Flowchart;
		index:number;
		commands:Command[];
		command:Command;
		isNext:bool;

		set(flowchart:Flowchart) {
			this.manager = flowchart.manager;
			this.flowchart = flowchart;
		}

		doCommand() {
			this.command = this.commands.shift();
			switch (this.command.name) {
			case "if":
			case "wait":
			case "label":
			case "inputWait":
			case "jump":
			case "call":
			case "skip":
			case "return":
			case "exit":
				this.isNext = true;
			break;
			default:
				this.isNext = false;
				this.command.finished.handle(this, this.oncommandfinish);
				this.command.execute();
			break;
			}
		}

		oncommandfinish() {
			this.isNext = true;
		}

		run() {
			var _main = (t:number) => {
				if (this.isNext) {
					if (this.commands.length > 0)
						this.doCommand();
					else
						this.end();
				} else {
					switch (this.command.name) {
						case "message":
							this.pointDown.fire(new jg.InputPointEvent(
								jg.InputEventAction.Down,
								null,
								{x: 0, y: 0}
							));
						break;
					}
					if (this.commands.length == 0) {
						if (this.tick > (t+10000) || (this.tick+10000) < t) {
							this.tick = t - 1;
							this.refresh();
						}
						var time = t - this.tick;
						this.manualUpdate(time);
						this.manualRender();
					} else {
						this.manualUpdate(5000);
					}
				}
				this.tick = t;
				if (! this._exit)
					window.requestAnimationFrame(_main);
			}
			this.isNext = true;
			this._exit = false;
			this.manager.isNext = false;
			window.requestAnimationFrame(_main);
		}

		preview(commands:Command[]) {
			this.loaded.destroy();
			this.commands = commands;
			if (this.resource.requests.length > 0)
				this.loaded.handle(this, this.onloaded);
			else
				this.onloaded();
		}

		next(commands:Command[]) {
			this.commands = this.commands.concat(commands);
			if (this._exit)
				this.run();
			return true;
		}

		nextTo(index:number) {
			index = Number(<string><any>index);
			var commands = [];
			var routes = this.flowchart.getRoute(index, this.index);
			if (routes == null)
				return false;
			this.index = index;
			routes.pop();
			while (routes.length)
				commands.push(this.manager.commands[routes.pop()]);

			return this.next(commands);
		}

		previewTo(index:number, start?:number, beforeCommands?:Command[], afterCommands?:Command[]) {
			index = Number(<string><any>index);
			var routes = this.flowchart.getRoute(index, start);
			var commands = [];
			this.index = index;
			if (beforeCommands)
				for (var i=0; i<beforeCommands.length; i++)
					commands.push(beforeCommands[i]);

			while (routes.length)
				commands.push(this.manager.commands[routes.pop()]);

			if (afterCommands)
				for (var i=0; i<afterCommands.length; i++)
					commands.push(afterCommands[i]);

			return this.preview(commands);
		}

		onloaded() {
			this.run();
		}
	}
}