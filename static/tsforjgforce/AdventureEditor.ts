module adventure {
	export class AdventureEditor extends jgforce.Editor {
		scripts:AdventureScript[];
		loadedCount:number;
		savedCount:number;
		manager:Manager;
		beforePreviewIndex:number;
		flowchart:Flowchart;
		initTemplateMode: bool;
		images: string[];
		revision: number;
		materialLoaded: jg.Trigger;

		constructor(session:jgforce.Session) {
			super(session);
			this.scripts = [];
			jg.Resource.getInstance().structure = new jgforce.ResourceStructure();
			this.images = [];
			this.materialLoaded = new jg.Trigger();
			this.materialLoaded.handle(this, this.onMaterialLoaded);
		}

		load(id: number) {
			var ret = super.load(id);
			return ret;
		}

		_getSelectValues(targets:Object) {
			var ret = [];
			ret.push("");
			for (var i in targets)
				ret.push(i);
			return ret;
		}

		_getImages():string[] {
			return [""].concat(this.images);
			/*
			var ret = this.manager.resources.slice(0);
			ret.unshift("");

			return ret;
			*/
		}
		_getEffects() {
			return this._getSelectValues(this.manager.effects);
		}
		_getScenes() {
			return this._getSelectValues(this.manager.scenes);
		}
		_getLabels() {
			return this._getSelectValues(this.manager.labels);
		}

		_getPropertyEditor(index:number, command:Command) {
			var props = command.getProperties();
			var f = new PropertyEditor();
			f.index = index;
			f.createCommand(command.name);
			if (props.isPlain) {
				if (command instanceof MessageCommand)
					f.createTextarea((<MessageCommand>command).message.substr(0, (<MessageCommand>command).message.length-1), 1);
				else if (command instanceof ButtonsCommand)
					f.createTextarea((<ButtonsCommand>command).texts.join("\n"), 1);
				else if (command instanceof SelectableCommand)
					f.createTextarea((<SelectableCommand>command).selectable.join("\n"), 1);
				else
					f.createTextarea((<EvalAsyncCommand>command).script.substr(0, (<EvalAsyncCommand>command).script.length-1), 1);
			} else {
				for (var i=0, len=props.properties.length; i<len; i++) {
					var p = props.properties[i];
					if (props.isDynamic)
						f.createEditingLabel(p.name, 1);
					else if (p.type == "commands")
						f.createSubLabel(p.name, 1);
					else
						f.createLabel(p.name, 1);

					if (p.values) {
						var values;
						if (typeof p.values == "string")
							values = this["_get"+p.values.substr(0,1).toUpperCase()+p.values.substr(1).toLowerCase()+"s"]();
						else
							values = p.values;

						if (p.type == "number")
							f.createSelectNumber(command[p.name], values, 1, p.must, p.comment);
						else if (p.type == "image")
							f.createImageSelector(command[p.name], values, 1, p.must, p.comment);
						else
							f.createSelectString(command[p.name], values, 1, p.must, p.comment);

						continue;
					}

					switch (p.type) {
					case "number":
						f.createInputNumber(command[p.name], 1, p.must, p.comment);
					break;
					case "color":
						f.createInputColor(command[p.name], 1, p.must, p.comment);
					break;
					case "string":
						f.createInputString(command[p.name], 1, p.must, p.comment);
					break;
					case "commands":
						if (! command[p.name] || command[p.name].length == 0) {
							f.createSubCommand("", 2, p.must, p.comment);
						} else {
							f.createSubCommand(command[p.name].join("\n"), 2, p.must, p.comment);
						}
					break;
					}
				}

				if (props.isDynamic) {
					f.createEditingLabel("", 1);
					f.createInputString("");
				}
			}
			return f;
		}

		getPropertyEditorNew(index:number, cmdName:string):PropertyEditor {
			return this._getPropertyEditor(index, Compiler.createCommand(cmdName, this.manager));
		}

		getPropertyEditor(index:number):PropertyEditor {
			return this._getPropertyEditor(index, this.manager.commands[index]);
		}

		onLoadComplete(method:string, data:any, request:XMLHttpRequest) {
			var files;
			jgforce.NetUtil.getMaterials(this.materialLoaded);
			if (! this.game.data) {
				this.scripts.push(new AdventureScript("master", this));
				this.scripts[0].script = "game\n width: 480\n height: 480\n\nconfig\n windowWidth: 464\n windowHeight: 160\n windowX: 8\n windowY: 314\n messageAutoHide: 0\n autoFocus: 1";
				this.initTemplateMode = true;
				this.saveFile(
					this.scripts[0].name,
					this.scripts[0].script
				);

				return;
			} else {
				var tmp = JSON.parse(this.game.data);
				files = tmp.scripts;
				this.images = tmp.images;
			}

			this.loadedCount = 0;
			for (var i=0; i<files.length; i++)
				this.scripts.push(new AdventureScript(files[i], this));

			for (var i=0; i<this.scripts.length; i++)
				this.loadScript(this.scripts[i]);
		}

		initTemplateCompleted() {
			this.loadedCount = 0;
			this.loadScript(this.scripts[0]);
		}

		onMaterialLoaded(e:jgforce.IMaterialLoaded) {
			if (e.is_error) {
				alert("素材の読み込みに失敗しました。");
			} else {
				for (var i=0; i<e.materials.length; i++)
					this.images.push(e.materials[i].r_path);
			}
		}

		calculateLines() {
			var startIndex = 0;
			for (var i=0; i<this.scripts.length; i++) {
				this.scripts[i].updateLine(startIndex);
				startIndex += this.scripts[i].line;
			}
		}

		loadScript(script:AdventureScript) {
			var loader = new ScriptLoader();
			loader.loaded.handle(() => {
				script.script = loader.scripts[0];
				this.loadedCount++;
				if (this.loadedCount == this.scripts.length) {
					this.calculateLines();
					this.resetManager();
					this.loaded.fire();
				}
			});
			loader.load(jgforce.NetUtil.getDataUrl(this.session.user.name, this.game.id, this.revision, script.name));
		}

		getFiles():string[] {
			var files = [];
			for (var i=0; i<this.scripts.length; i++)
				files.push(this.scripts[i].name);
			return files;
		}

		getScripts():string[] {
			var scripts = [];
			for (var i=0; i<this.scripts.length; i++)
				scripts.push(this.scripts[i].script);
			return scripts;
		}

		save() {
			this.savedCount = 0;
			this.resetManager();
			var images = this.manager.resources;

			this.saveData(JSON.stringify({
				scripts: this.getFiles(),
				images: images
			}));
		}

		onSaveComplete(method:string, request:XMLHttpRequest) {
			if (this.initTemplateMode) {
				delete this.initTemplateMode;
				this.initTemplateCompleted();
				return;
			}
			this.savedCount++;
			if (this.savedCount == 1) {
				for (var i=0; i<this.scripts.length; i++) {
					this.scripts[i].updateScript();
					this.saveFile(
						this.scripts[i].name,
						this.scripts[i].script
					);
				}

				this.delFileOther(this.getFiles());
			} else if (this.savedCount == (this.scripts.length+1)) {
				this.saved.fire();
			}
		}

		getScriptIndexByLine(line:number) {
			var total=0;
			for (var i=0; i<this.scripts.length; i++) {
				total += this.scripts[i].line;
				if (line < total)
					return i;
			}
			throw "invalid argument";
		}

		updateFlowchart() {
			this.flowchart = new Flowchart(this.manager);
			delete this.beforePreviewIndex;
			this.flowchart.generate();
		}

		preview(container:HTMLElement, index:number, executeMasterCommands?:bool) {
			var scriptIndex = this.getScriptIndexByLine(index);
			var masterCommands = [];
			if (executeMasterCommands && scriptIndex > 0)
				masterCommands = this.scripts[0].getCommands();

			var isContinue = false;
			if (!this.flowchart)
				this.updateFlowchart();

			if (this.beforePreviewIndex !== undefined && this.beforePreviewIndex < index) {
				if (scriptIndex == this.getScriptIndexByLine(this.beforePreviewIndex))
					isContinue = true;
			}

			if (isContinue) {
				if ((<PreviewGame>this.manager.game).nextTo(index) === false)
					isContinue = false;
			}
			if (!isContinue) {
				container.innerHTML = "";
				try {
					if (this.manager.game)
						this.manager.game.end();
				} catch(ex) {
					console.log(ex);
				}
				this.manager.start(PreviewGame, container);
				this.manager.game.resource.structure = new jgforce.ResourceStructure();
				(<PreviewGame>this.manager.game).set(this.flowchart);
				(<PreviewGame>this.manager.game).previewTo(
					index,
					this.scripts[scriptIndex].startIndex,
					masterCommands
				);
			}
			this.beforePreviewIndex = index;
		}

		orderCommand(index:number, value:number) {
			var scriptIndex = this.getScriptIndexByLine(index);
			var baseLine = this.scripts[scriptIndex].startIndex;
			var limitLine = baseLine + this.scripts[scriptIndex].line - 1;
			var newOrder = Math.min(Math.max(index+value, baseLine), limitLine);
			if (newOrder == index)
				return false;

			var forLen = Math.abs(newOrder-index);
			var update = {}
			for (var i=0; i<forLen; i++) {
				var p = i * (newOrder < index ? -1 : 1);
				var p2 = (i+1) * (newOrder < index ? -1 : 1);
				var target = index + p;
				var target2 = index + p2;
				var tmp = this.manager.commands[target];
				this.manager.commands[target] = this.manager.commands[target2];
				this.manager.commands[target2] = tmp;
				update[target] = 1;
				update[target2] = 1;
			}
			for (var index in update) {
				var nIndex = Number(index);
				this.manager.updateManagerByCommand(this.manager.commands[nIndex], nIndex);
			}
			delete this.flowchart;
			return true;
		}

		orderScript(index:number, value:number) {
			var tmp = this.scripts[index];
			var newOrder = Math.min(Math.max(index+value, 0), this.scripts.length - 1);
			if (newOrder == index)
				return false;

			var forLen = Math.abs(newOrder-index);
			for (var i=0; i<forLen; i++) {
				var p = i * (newOrder < index ? -1 : 1);
				var p2 = (i+1) * (newOrder < index ? -1 : 1);
				var target = index + p;
				var target2 = index + p2;
				var tmp = this.scripts[target];
				this.scripts[target] = this.scripts[target2];
				this.scripts[target2] = tmp;
			}

			for (var i=0; i<this.scripts.length; i++)
				this.scripts[i].updateScript();
			this.calculateLines();
			this.resetManager();
			return true;
		}

		resetManager() {
			this.manager = new Manager(this.getScripts());
			//for (var i=0; i<this.images.length ;i++)
			//	this.manager.addResource(this.images[i]);
			delete this.beforePreviewIndex;
			delete this.flowchart;
		}

		replaceScript(index:number, script:string) {
			this.scripts[index].script = script;
			for (var i=0; i<this.scripts.length; i++)
				if (i != index)
					this.scripts[i].updateScript();
			this.calculateLines();
			this.resetManager();
		}

		replaceCommand(index:number, cmdStr:string) {
			var commandStrings = Compiler.getCommandStrings(cmdStr.split(/\r\n|\r|\n/g));
			var newCommand:Command;
			var commands = [];
			for (var i=0; i<commandStrings.length; i++)
				commands.push(Compiler.compileCommand(commandStrings[i]));

			this.manager.commands.splice.apply(
				this.manager.commands,
				[index, 1].concat(commands)
			)
			var len = commands.length+index;
			for (var i=index; i<len; i++) {
				this.manager.updateManagerByCommand(
					this.manager.commands[i],
					i
				);
			}

			var scriptIndex = this.getScriptIndexByLine(index);
			this.scripts[scriptIndex].line += commands.length - 1;
			this.manager.addResourcesByCommands(commands);
			delete this.flowchart;

			return commands.length;
		}

		isUniqueFile(name:string) {
			for (var i=0; i<this.scripts.length; i++)
				if (this.scripts[i].name == name)
					return false;
			return true;
		}

		insertScript(index:number, name:string, script?:string) {
			var scriptObj = new AdventureScript(name, this);
			scriptObj.script = (script === undefined) ? "message" : script;

			this.scripts.splice(index, 0, scriptObj);
			this.calculateLines();
			this.resetManager();
		}

		deleteScript(index:number) {
			if (index < 0 || index >= this.scripts.length || this.scripts.length == 0)
				return false;

			this.scripts.splice(index, 1);
			this.calculateLines();
			this.resetManager();
		}

		insertNewCommand(index:number, command?:Command) {
			if (command === undefined)
				command = Compiler.createCommand("message");

			var scriptIndex = this.getScriptIndexByLine(index);

			this.manager.commands.splice(index, 0, command);
			this.manager.updateManagerByCommand(command, index);
			this.manager.addResourcesByCommands([command]);

			this.scripts[scriptIndex].line++;
			for (var i=scriptIndex+1; i<this.scripts.length; i++)
				this.scripts[i].startIndex++;

			delete this.flowchart;
		}

		getNewScriptNumber() {
			var max = 0;
			for (var i=0; i<this.scripts.length; i++) {
				var s = this.scripts[i];
				if (s.name.indexOf("script") !== 0)
					continue;
				try {
					var v = parseInt(s.name.substr(6));
					if (max < v)
						max = v;
				} catch(ex) {
				}
			}
			return max+1;
		}

		deleteCommand(index:number) {
			var scriptIndex = this.getScriptIndexByLine(index);
			this.manager.commands.splice(index, 1);
			this.scripts[scriptIndex].line--;
			for (var i=scriptIndex+1; i<this.scripts.length; i++)
				this.scripts[i].startIndex--;

			delete this.flowchart;
		}
	}
}