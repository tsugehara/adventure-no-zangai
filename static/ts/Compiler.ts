module adventure {
	export class Compiler {
		static getResources(commands:Command[]):string[] {
			var tmp = {}
			for (var i=0; i<commands.length; i++) {
				var c = commands[i];
				switch (c.name) {
					case "add":
						if ((<AddCommand>c).file)
							tmp[(<AddCommand>c).file] = 1;
					break;
					case "bg":
						if ((<BgCommand>c).file)
							tmp[(<BgCommand>c).file] = 1;
					break;
					case "image":
						if ((<ImageCommand>c).file)
							tmp[(<ImageCommand>c).file] = 1;
					break;
					case "effect":
						var effect = (<EffectCommand>c);
						if (effect.image && effect.image.charAt(0) != "!")
							tmp[effect.image] = 1;
					break;
					case "scene":
						var scene = <SceneCommand>c;
						var sceneResources = Compiler.getResources(scene.init);
						for (var j=0; j<sceneResources.length; j++)
							tmp[sceneResources[j]] = 1;
						if (scene.image && scene.image.charAt(0) != "!")
							tmp[scene.image] = 1;
					break;
					case "if":
						var ifResources = Compiler.getResources((<IfCommand>c).yes);
						ifResources = ifResources.concat(Compiler.getResources((<IfCommand>c).no));
						for (var j=0; j<ifResources.length; j++)
							tmp[ifResources[j]] = 1;
					break;
				}
			}
			var ret = [];
			for (var p in tmp)
				ret.push(p);
			return ret;
		}

		static createCommand(line:string, manager?:Manager) {
			var clsName = line.substr(0,1).toUpperCase()+line.substr(1)+"Command";
			return new adventure[clsName](manager);
		}

		static compileCommand(lines:string[], manager?:Manager):Command {
			var command:Command;
			command = Compiler.createCommand(lines[0], manager);
			for (var i=1; i<lines.length; i++) {
				var line = lines[i];
				var tab = Util.getTabCount(line);
				command.add(line.substr(tab), tab);
			}
			return command;
		}

		static getCommandStrings(lines:string[]):string[][] {
			var cmdStr:string[] = [];
			var ret:string[][] = [];
			for (var i=0, len=lines.length; i<len; i++) {
				var line = lines[i];
				//空行飛ばし
				if (line.length == 0)
					continue;

				var tab = Util.getTabCount(line);
				//タブのみ行飛ばし
				if (tab == -1)
					continue;

				if (tab == 0) {
					if (cmdStr.length > 0) {
						ret.push(cmdStr);
						cmdStr = [];
					}
				}
				cmdStr.push(line);
			}
			if (cmdStr.length > 0)
				ret.push(cmdStr);

			return ret;
		}

		static compileCommands(lines:string[], manager?:Manager):Command[] {
			var commands:Command[] = [];
			var cmdStrings:string[][] = Compiler.getCommandStrings(lines);
			for (var i=0; i<cmdStrings.length; i++)
				commands.push(Compiler.compileCommand(cmdStrings[i], manager));
			return commands;
		}
	}
}