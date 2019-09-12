module adventure {
	export class Util {
		static normalCharaCache:{[key:string]: bool;};

		static getTabCount(line:string) {
			for (var i=0; i<line.length; i++) {
				if (line.charAt(i) != " ")
					return i;
			}
			return -1;	//only tab or line is empty
		}

		static isNormalChar(c:string) {
			if (Util.normalCharaCache === undefined) {
				Util.normalCharaCache = {};
				Util.normalCharaCache["+"] = true;
				Util.normalCharaCache["-"] = true;
				Util.normalCharaCache["/"] = true;
				Util.normalCharaCache["*"] = true;
				Util.normalCharaCache["("] = true;
				Util.normalCharaCache[")"] = true;
				Util.normalCharaCache["&"] = true;
				Util.normalCharaCache["^"] = true;
				Util.normalCharaCache[">"] = true;
				Util.normalCharaCache["<"] = true;
				Util.normalCharaCache["!"] = true;
				Util.normalCharaCache["="] = true;
				Util.normalCharaCache["["] = true;
				Util.normalCharaCache["]"] = true;
				Util.normalCharaCache["?"] = true;
				Util.normalCharaCache[" "] = true;
			}
			return Util.normalCharaCache[c] === undefined ? false : true;
		}

		static analysisVarLine(v:string):string {
			var mode=0;
			var index=0;
			var ret = new string[];
			for (var i=0, len=v.length; i<len; i++) {
				var c = v.charAt(i);
				switch (mode) {
				case 0:
					if (c == "$") {
						if (index < i)
							ret.push(v.substring(index, i))
						mode = 1;
						index = i+1;
					}
				break;
				case 1:
					if (Util.isNormalChar(c)) {
						ret.push("this.manager.vars[\""+v.substring(index, i)+"\"]");
						mode = 0;
						index = i;
					}
				break;
				}
			}
			if (index < v.length) {
				switch (mode) {
				case 0:
					ret.push(v.substr(index));
				break;
				case 1:
					ret.push("this.manager.vars[\""+v.substr(index)+"\"]");
				break;
				}
			}
			return ret.join("");
		}

		static getEasingProps() {
			var ret = [];
			for (var i in jg.Easing)
				ret.push(i  == "LINEAR" ? "" : i);

			return ret;
		}

		static getNgProps() {
			return ["name", "manager", "id", "finished", "parent"];
		}

		static createVStripeImage():HTMLImageElement {
			return Util.createImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAABCAYAAADjAO9DAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QMICyYEKIZfsgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAIUlEQVQI12MUFhb+z8/Pz6CgoMCgpKQEx8rKygxKSkoMAEdqA8hvXDJ/AAAAAElFTkSuQmCC");
		}
		static createHStripeImage():HTMLImageElement {
			return Util.createImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAICAYAAAA4GpVBAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QMICygFwQJCqgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAALUlEQVQI1wXBwREAIAgDwUykBnwzHv2XJh3orjL3c8SSq0o+IDfIgNyNdGfeB17iBz3zdLCqAAAAAElFTkSuQmCC");
		}
		static createDissolveImage():HTMLImageElement {
			return Util.createImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QMJAQkqU2eIowAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAF0lEQVQI12NcumTJzVu3GP7//8/MzAIAPTEHg/VK0L0AAAAASUVORK5CYII=");
		}

		static createImage(data:string):HTMLImageElement {
			var img = <HTMLImageElement>document.createElement("img");
			img.src = data;
			return img;
		}

		static getCommands(noMaster?:bool):string[] {
			var commands = [
				"message",
				"effect",
				"bg",
				"add",
				"remove",
				"show",
				"hide",
				"order",
				"image",
				"move",
				"scale",
				"resize",
				"wait",
				"jump",
				"call",
				"return",
				"skip",
				"label",
				"buttons",
				"deleteButtons",
				"selectable",
				"clearSelectable",
				"inputWait",
				"var",
				"if",
				"scene",
				"evalAsync",
				"eval",
				"changeConfig",
				"exit",
			];
			if (! noMaster) {
				commands.push("game");
				commands.push("config");
			}
			return commands;
		}
	}
}