interface JQuery {
	imageselector: Function;
}
module adventure {
	export class PropertyEditor {
		components:JQuery[];
		index:number;
		srcMap: any;

		constructor() {
			this.components = [];
		}

		createValueComponent(html:string, value:string, tab:number, require?:bool, comment?:string) {
			var component = $(html);
			component.val(value);
			if (tab !== undefined)
				component.attr("tabCount", tab);
			if (require)
				component.addClass("require");
			if (comment)
				component.attr("title", comment);
			this.components.push(component);
			return component;
		}

		createHtmlComponent(html:string, value:string, tab:number, require?:bool, comment?:string) {
			var component = $(html);
			component.html(value);
			if (tab !== undefined)
				component.attr("tabCount", tab);
			if (require)
				component.addClass("require");
			if (comment)
				component.attr("title", comment);
			this.components.push(component);
			return component;
		}

		createCommand(value:string, tab?:number) {
			if (value == "game" || value == "config")
				return this.createHtmlComponent("<div/>", value, tab);
			if (tab === undefined)
				tab = 0;
			var select = this.createSelect(value, Util.getCommands(true), tab);
			select.addClass("command-selector");
			return select;
		}

		createSubCommand(value:string, tab?:number, require?:bool, comment?:string) {
			return this.createValueComponent("<textarea/>", value, tab, require, comment).addClass("sub-command");
		}

		createLabel(value:string, tab:number) {
			var label = this.createHtmlComponent("<label />", value, tab);
			label.addClass("prop-label");
			return label;
		}

		createSubLabel(value:string, tab:number) {
			var label = this.createHtmlComponent("<label />", value, tab);
			label.addClass("prop-sub-label");
			return label;
		}

		createEditingLabel(value:string, tab:number) {
			var component = this.createInputString(value, tab);
			component.addClass("prop-label");
			return component;
		}

		createTextarea(value:string, tab?:number, require?:bool, comment?:string) {
			return this.createValueComponent("<textarea/>", value, tab, require, comment);
		}

		createInputString(value:string, tab?:number, require?:bool, comment?:string) {
			return this.createValueComponent("<input type=\"text\"/>", value, tab, require, comment);
		}

		createImageSelector(value:string, images:string[], tab?:number, require?:bool, comment?:string) {
			var container = $("<div />");
			var structure = new jgforce.ResourceStructure();
			var index = 0;
			this.srcMap = {}
			var absoluteImages = [];
			var hasValue = false;
			var absoluteValue;

			if (value === undefined)
				value = "";

			for (var i=0; i<images.length; i++) {
				var img = structure.isAbsolute(images[i]) ? images[i] : structure.imageUrl(images[i]);
				if (value == images[i])
					hasValue = true;
				if (!images[i]) {
					if (! require)
						img = structure.imageUrl("empty.png");
					else
						continue;
				}
				absoluteImages.push(img)
				this.srcMap[img] = images[i];
			}

			if (! hasValue) {
				absoluteValue = structure.isAbsolute(value) ? value : structure.imageUrl(value);
				absoluteImages.push(absoluteValue);
				this.srcMap[absoluteValue] = value;
			} else {
				for (var j in this.srcMap) {
					if (this.srcMap[j] == value) {
						absoluteValue = j;
						break;
					}
				}
			}

			if (comment)
				container.attr("title", comment);

			this.components.push(container)
			setTimeout(function() {
				container.imageselector(absoluteImages, absoluteValue);
			}, 0);
			
			return container;	
		}

		createInputColor(value:string, tab?:number, require?:bool, comment?:string) {
			return this.createValueComponent("<input type=\"text\" class=\"color\" />", value, tab, require, comment);
		}

		createInputNumber(value:string, tab?:number, require?:bool, comment?:string) {
			var component = this.createValueComponent("<input type=\"text\"/>", value, tab, require, comment);
			component.attr("numberValue", 1);
			return component;
		}

		createSelect(value:string, values:string[], tab:number, require?:bool, comment?:string) {
			var select = document.createElement("select");
			for (var i=0, len=values.length; i<len; i++) {
				var opt = document.createElement("option");
				opt.appendChild(document.createTextNode(values[i]));
				select.appendChild(opt);
			}
			var component = $(select);
			component.val(value);
			if (tab !== undefined)
				component.attr("tabCount", tab);
			if (require)
				component.addClass("require");
			if (comment)
				component.attr("title", comment);
			this.components.push(component);
			return component;
		}

		createSelectString(value:string, values:string[], tab?:number, require?:bool, comment?:string) {
			return this.createSelect(value, values, tab, require, comment);
		}

		createSelectNumber(value:string, values:string[], tab?:number, require?:bool, comment?:string) {
			var component = this.createSelect(value, values, tab, require, comment);
			component.attr("numberValue", 1);
			return component;
		}

		createTab(tabCount:string) {
			var _tabCount = parseInt(tabCount);
			var ret = "";
			for (var i=0; i<_tabCount; i++)
				ret += " ";
			return ret;
		}

		_getComponentValue(component:JQuery) {
			if (component.is("textarea, input, select"))
				return component.val();
			return component.html();
		}

		destroy() {
		}

		toString():string {
			var values = [];
			for (var i=0; i<this.components.length; i++) {
				var component = this.components[i];
				var prefix = this.createTab(component.attr("tabCount"));
				if (component.is(".prop-sub-label")) {
					var subLabel = prefix + this._getComponentValue(component);
					component = this.components[++i];
					var subLines = this._getComponentValue(component).split(/\r\n|\r|\n/g);
					if (subLines.length == 0)
						continue;
					var j = 0;
					for (; j<subLines.length; j++)
						if (subLines[j] != "")
							break;
					if (j == subLines.length)
						continue;
					values.push(subLabel);
					for (j=0; j<subLines.length; j++)
						values.push(prefix + " " + subLines[j]);
					continue;
				} else if (component.is(".prop-label")) {
					prefix += this._getComponentValue(component)+": ";
					component = this.components[++i];
				}

				var value;
				if (component.is(".image-select")) {
					var dummy = component.find(".active").filter(".image");
					if (dummy.length == 0)
						value = "";
					else
						value = this.srcMap[$(dummy).attr("src")];
				} else {
					value = this._getComponentValue(component);
				}
				if (value === "")
					continue;
				values.push(prefix + value);
			}
			return values.join("\n");
		}
	}
}