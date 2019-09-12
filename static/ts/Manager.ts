module adventure {
	export class Manager {
		game:jg.Game;
		scene:BasicScene;
		messageWindow:jg.MessageWindow;
		gameCommand:GameCommand;
		config:ConfigCommand;
		command:Command;
		commands:Command[];
		index:number;
		isNext:bool;
		stack:number[];

		objects:{[key:string]: jg.E;};
		effects:{[key:string]: EffectCommand;};
		scenes:{[key:string]: number;};
		labels:{[key:string]: number;};
		selectables:{[key:string]: jg.E;};
		resources:string[];
		vars:{[key:string]: any;};

		constructor(script:any) {
			this.init(script);
		}

		append(id:string, e:jg.E) {
			if (id == "message" || id == "bg")
				throw "invalid id";
			this.objects[id] = e;
			e["id"] = id;
			this.scene.charaLayer.append(e);
		}

		remove(id:string) {
			switch (id) {
				case "message":
					this.messageWindow.remove();
					return;
				case "bg":
					this.scene.deleteLayer("bg");
					return;
			}
			var e = this.objects[id];
			delete this.objects[id];
			e.remove();
		}

		get(id:string) {
			switch (id) {
				case "message":
					return this.messageWindow;
				case "bg":
					return this.scene.bgLayer.entities[0];
			}
			return this.objects[id];
		}

		createBasicEffects() {
			this.effects["fade"] = new EffectCommand(this);
			this.effects["fade"].type = "fade";
			var universals = ["vstripe", "hstripe", "dissolve"];
			for (var i=0; i<universals.length; i++) {
				this.effects[universals[i]] = new EffectCommand(this);
				this.effects[universals[i]].repeat = "repeat";
			}
			this.effects["vstripe"].image = "!vstripe";
			this.effects["hstripe"].image = "!hstripe";
			this.effects["dissolve"].image = "!dissolve";
		}

		updateManagerByCommand(command:Command, commandIndex:number) {
			command.manager = this;
			switch (command.name) {
			case "effect":
				var effectCommand = <EffectCommand>command;
				if (effectCommand.id && !this.effects[effectCommand.id])
					this.effects[effectCommand.id] = effectCommand;
			break;
			case "scene":
				var sceneCommand = <SceneCommand>command;
				if (sceneCommand.id && !this.scenes[sceneCommand.id])
					this.scenes[sceneCommand.id] = commandIndex;
			break;
			case "label":
				var labelCommand = <LabelCommand>command;
				if (labelCommand.id && !this.labels[labelCommand.id])
					this.labels[labelCommand.id] = commandIndex;
			break;
			case "game":
				this.gameCommand = <GameCommand>command;
			break;
			case "config":
				this.config = <ConfigCommand>command;
			break;
			}
		}

		init(script:any) {
			if (typeof script == "string") {
				//default
			} else {
				//array
				script = script.join("\n");
			}
			var lines = script.split(/\r\n|\r|\n/g);
			this.effects = {};
			this.createBasicEffects();
			this.labels = {};
			this.scenes = {};
			this.selectables = {};
			this.resources = new string[];

			//default command
			this.gameCommand = null;
			this.config = null;

			var commands = Compiler.compileCommands(lines);
			for (var i=0, len=commands.length; i<len; i++) {
				this.updateManagerByCommand(commands[i], i);
			}
			if (! this.gameCommand)
				this.gameCommand = new GameCommand(this);
			if (! this.config)
				this.config = new ConfigCommand(this);

			this.commands = commands;
			this.addResourcesByCommands(this.commands);
		}

		addResource(file:string) {
			if (this.resources.indexOf(file) >= 0)
				return;
			this.resources.push(file);
		}

		addResourcesByCommands(commands:Command[]) {
			var ret = Compiler.getResources(commands);
			for (var i=0; i<ret.length; i++)
				this.addResource(ret[i]);
			this.resources.sort();
		}

		start(gameClass?:any, container?:any) {
			if (gameClass)
				this.game = new gameClass(this.gameCommand.width, this.gameCommand.height, container);
			else
				this.game = new jg.Game(this.gameCommand.width, this.gameCommand.height, container);
			this.stack = new number[];
			this.vars = {};
			var scene = new BasicScene(this.game);
			scene.init({
				width: this.config.windowWidth,
				height: this.config.windowHeight
			}, {
				x: this.config.windowX,
				y: this.config.windowY
			});
			scene.enablePointingEvent();
			this.game.changeScene(scene);
			this.changeScene(scene);

			this.index = 0;
			this.game.update.handle(this, this.update);

			this.game.resource.images["!vstripe"] = Util.createVStripeImage();
			this.game.resource.images["!hstripe"] = Util.createHStripeImage();
			this.game.resource.images["!dissolve"] = Util.createDissolveImage();
			if (this.resources.length == 0) {
				this.nextCommand();
			} else {
				this.game.preload(this.resources);
				this.game.loaded.handle(this, this.nextCommand);
			}
		}

		update(t:number) {
			if (this.isNext) {
				this.isNext = false;
				if (this.index >= this.commands.length) {
					this.game.exit();
					return;
				}
				this.command = this.commands[this.index++];
				this.command.finished.handle(this, this.oncommandfinish);
				this.command.execute();
			}
		}

		nextCommand() {
			this.isNext = true;
		}

		oncommandfinish() {
			this.command.finished.remove(this, this.oncommandfinish);
			this.nextCommand();
		}

		changeScene(scene:BasicScene) {
			this.messageWindow = scene.messageWindow;
			this.objects = {};
			this.scene = scene;
		}
	}
}