module adventure {
	export class AdventureScript {
		name:string;
		startIndex:number;
		line:number;
		script:string;
		editor:AdventureEditor;

		constructor(name:string, editor:AdventureEditor) {
			this.name = name;
			this.editor = editor;
		}

		getCommands():Command[] {
			var commands = [];
			for (var i=this.startIndex, len=this.startIndex+this.line; i<len; i++)
				commands.push(this.editor.manager.commands[i]);
			return commands;
		}

		updateLine(startIndex?:number) {
			var dummy = Compiler.compileCommands(this.script.split(/\r\n|\r|\n/g));
			this.line = dummy.length;
			if (startIndex !== undefined)
				this.startIndex = startIndex;
		}

		updateScript() {
			this.script = this.getScript();
		}

		getScript() {
			var commands = this.getCommands();
			var cmdStrings = [];
			for (var i=0; i<commands.length; i++)
				cmdStrings.push(commands[i].toString())

			return cmdStrings.join("\n\n");
		}
	}
}