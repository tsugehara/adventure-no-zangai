var adventure;
(function (adventure) {
    var PropertyEditor = (function () {
        function PropertyEditor() {
            this.components = [];
        }
        PropertyEditor.prototype.createValueComponent = function (html, value, tab, require, comment) {
            var component = $(html);
            component.val(value);
            if(tab !== undefined) {
                component.attr("tabCount", tab);
            }
            if(require) {
                component.addClass("require");
            }
            if(comment) {
                component.attr("title", comment);
            }
            this.components.push(component);
            return component;
        };
        PropertyEditor.prototype.createHtmlComponent = function (html, value, tab, require, comment) {
            var component = $(html);
            component.html(value);
            if(tab !== undefined) {
                component.attr("tabCount", tab);
            }
            if(require) {
                component.addClass("require");
            }
            if(comment) {
                component.attr("title", comment);
            }
            this.components.push(component);
            return component;
        };
        PropertyEditor.prototype.createCommand = function (value, tab) {
            if(value == "game" || value == "config") {
                return this.createHtmlComponent("<div/>", value, tab);
            }
            if(tab === undefined) {
                tab = 0;
            }
            var select = this.createSelect(value, adventure.Util.getCommands(true), tab);
            select.addClass("command-selector");
            return select;
        };
        PropertyEditor.prototype.createSubCommand = function (value, tab, require, comment) {
            return this.createValueComponent("<textarea/>", value, tab, require, comment).addClass("sub-command");
        };
        PropertyEditor.prototype.createLabel = function (value, tab) {
            var label = this.createHtmlComponent("<label />", value, tab);
            label.addClass("prop-label");
            return label;
        };
        PropertyEditor.prototype.createSubLabel = function (value, tab) {
            var label = this.createHtmlComponent("<label />", value, tab);
            label.addClass("prop-sub-label");
            return label;
        };
        PropertyEditor.prototype.createEditingLabel = function (value, tab) {
            var component = this.createInputString(value, tab);
            component.addClass("prop-label");
            return component;
        };
        PropertyEditor.prototype.createTextarea = function (value, tab, require, comment) {
            return this.createValueComponent("<textarea/>", value, tab, require, comment);
        };
        PropertyEditor.prototype.createInputString = function (value, tab, require, comment) {
            return this.createValueComponent("<input type=\"text\"/>", value, tab, require, comment);
        };
        PropertyEditor.prototype.createImageSelector = function (value, images, tab, require, comment) {
            var container = $("<div />");
            var structure = new jgforce.ResourceStructure();
            var index = 0;
            this.srcMap = {
            };
            var absoluteImages = [];
            var hasValue = false;
            var absoluteValue;
            if(value === undefined) {
                value = "";
            }
            for(var i = 0; i < images.length; i++) {
                var img = structure.isAbsolute(images[i]) ? images[i] : structure.imageUrl(images[i]);
                if(value == images[i]) {
                    hasValue = true;
                }
                if(!images[i]) {
                    if(!require) {
                        img = structure.imageUrl("empty.png");
                    } else {
                        continue;
                    }
                }
                absoluteImages.push(img);
                this.srcMap[img] = images[i];
            }
            if(!hasValue) {
                absoluteValue = structure.isAbsolute(value) ? value : structure.imageUrl(value);
                absoluteImages.push(absoluteValue);
                this.srcMap[absoluteValue] = value;
            } else {
                for(var j in this.srcMap) {
                    if(this.srcMap[j] == value) {
                        absoluteValue = j;
                        break;
                    }
                }
            }
            if(comment) {
                container.attr("title", comment);
            }
            this.components.push(container);
            setTimeout(function () {
                container.imageselector(absoluteImages, absoluteValue);
            }, 0);
            return container;
        };
        PropertyEditor.prototype.createInputColor = function (value, tab, require, comment) {
            return this.createValueComponent("<input type=\"text\" class=\"color\" />", value, tab, require, comment);
        };
        PropertyEditor.prototype.createInputNumber = function (value, tab, require, comment) {
            var component = this.createValueComponent("<input type=\"text\"/>", value, tab, require, comment);
            component.attr("numberValue", 1);
            return component;
        };
        PropertyEditor.prototype.createSelect = function (value, values, tab, require, comment) {
            var select = document.createElement("select");
            for(var i = 0, len = values.length; i < len; i++) {
                var opt = document.createElement("option");
                opt.appendChild(document.createTextNode(values[i]));
                select.appendChild(opt);
            }
            var component = $(select);
            component.val(value);
            if(tab !== undefined) {
                component.attr("tabCount", tab);
            }
            if(require) {
                component.addClass("require");
            }
            if(comment) {
                component.attr("title", comment);
            }
            this.components.push(component);
            return component;
        };
        PropertyEditor.prototype.createSelectString = function (value, values, tab, require, comment) {
            return this.createSelect(value, values, tab, require, comment);
        };
        PropertyEditor.prototype.createSelectNumber = function (value, values, tab, require, comment) {
            var component = this.createSelect(value, values, tab, require, comment);
            component.attr("numberValue", 1);
            return component;
        };
        PropertyEditor.prototype.createTab = function (tabCount) {
            var _tabCount = parseInt(tabCount);
            var ret = "";
            for(var i = 0; i < _tabCount; i++) {
                ret += " ";
            }
            return ret;
        };
        PropertyEditor.prototype._getComponentValue = function (component) {
            if(component.is("textarea, input, select")) {
                return component.val();
            }
            return component.html();
        };
        PropertyEditor.prototype.destroy = function () {
        };
        PropertyEditor.prototype.toString = function () {
            var values = [];
            for(var i = 0; i < this.components.length; i++) {
                var component = this.components[i];
                var prefix = this.createTab(component.attr("tabCount"));
                if(component.is(".prop-sub-label")) {
                    var subLabel = prefix + this._getComponentValue(component);
                    component = this.components[++i];
                    var subLines = this._getComponentValue(component).split(/\r\n|\r|\n/g);
                    if(subLines.length == 0) {
                        continue;
                    }
                    var j = 0;
                    for(; j < subLines.length; j++) {
                        if(subLines[j] != "") {
                            break;
                        }
                    }
                    if(j == subLines.length) {
                        continue;
                    }
                    values.push(subLabel);
                    for(j = 0; j < subLines.length; j++) {
                        values.push(prefix + " " + subLines[j]);
                    }
                    continue;
                } else if(component.is(".prop-label")) {
                    prefix += this._getComponentValue(component) + ": ";
                    component = this.components[++i];
                }
                var value;
                if(component.is(".image-select")) {
                    var dummy = component.find(".active").filter(".image");
                    if(dummy.length == 0) {
                        value = "";
                    } else {
                        value = this.srcMap[$(dummy).attr("src")];
                    }
                } else {
                    value = this._getComponentValue(component);
                }
                if(value === "") {
                    continue;
                }
                values.push(prefix + value);
            }
            return values.join("\n");
        };
        return PropertyEditor;
    })();
    adventure.PropertyEditor = PropertyEditor;    
})(adventure || (adventure = {}));
var adventure;
(function (adventure) {
    var AdventureScript = (function () {
        function AdventureScript(name, editor) {
            this.name = name;
            this.editor = editor;
        }
        AdventureScript.prototype.getCommands = function () {
            var commands = [];
            for(var i = this.startIndex, len = this.startIndex + this.line; i < len; i++) {
                commands.push(this.editor.manager.commands[i]);
            }
            return commands;
        };
        AdventureScript.prototype.updateLine = function (startIndex) {
            var dummy = adventure.Compiler.compileCommands(this.script.split(/\r\n|\r|\n/g));
            this.line = dummy.length;
            if(startIndex !== undefined) {
                this.startIndex = startIndex;
            }
        };
        AdventureScript.prototype.updateScript = function () {
            this.script = this.getScript();
        };
        AdventureScript.prototype.getScript = function () {
            var commands = this.getCommands();
            var cmdStrings = [];
            for(var i = 0; i < commands.length; i++) {
                cmdStrings.push(commands[i].toString());
            }
            return cmdStrings.join("\n\n");
        };
        return AdventureScript;
    })();
    adventure.AdventureScript = AdventureScript;    
})(adventure || (adventure = {}));
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var adventure;
(function (adventure) {
    var AdventureEditor = (function (_super) {
        __extends(AdventureEditor, _super);
        function AdventureEditor(session) {
                _super.call(this, session);
            this.scripts = [];
            jg.Resource.getInstance().structure = new jgforce.ResourceStructure();
            this.images = [];
            this.materialLoaded = new jg.Trigger();
            this.materialLoaded.handle(this, this.onMaterialLoaded);
        }
        AdventureEditor.prototype.load = function (id) {
            var ret = _super.prototype.load.call(this, id);
            return ret;
        };
        AdventureEditor.prototype._getSelectValues = function (targets) {
            var ret = [];
            ret.push("");
            for(var i in targets) {
                ret.push(i);
            }
            return ret;
        };
        AdventureEditor.prototype._getImages = function () {
            return [
                ""
            ].concat(this.images);
        };
        AdventureEditor.prototype._getEffects = function () {
            return this._getSelectValues(this.manager.effects);
        };
        AdventureEditor.prototype._getScenes = function () {
            return this._getSelectValues(this.manager.scenes);
        };
        AdventureEditor.prototype._getLabels = function () {
            return this._getSelectValues(this.manager.labels);
        };
        AdventureEditor.prototype._getPropertyEditor = function (index, command) {
            var props = command.getProperties();
            var f = new adventure.PropertyEditor();
            f.index = index;
            f.createCommand(command.name);
            if(props.isPlain) {
                if(command instanceof adventure.MessageCommand) {
                    f.createTextarea((command).message.substr(0, (command).message.length - 1), 1);
                } else if(command instanceof adventure.ButtonsCommand) {
                    f.createTextarea((command).texts.join("\n"), 1);
                } else if(command instanceof adventure.SelectableCommand) {
                    f.createTextarea((command).selectable.join("\n"), 1);
                } else {
                    f.createTextarea((command).script.substr(0, (command).script.length - 1), 1);
                }
            } else {
                for(var i = 0, len = props.properties.length; i < len; i++) {
                    var p = props.properties[i];
                    if(props.isDynamic) {
                        f.createEditingLabel(p.name, 1);
                    } else if(p.type == "commands") {
                        f.createSubLabel(p.name, 1);
                    } else {
                        f.createLabel(p.name, 1);
                    }
                    if(p.values) {
                        var values;
                        if(typeof p.values == "string") {
                            values = this["_get" + p.values.substr(0, 1).toUpperCase() + p.values.substr(1).toLowerCase() + "s"]();
                        } else {
                            values = p.values;
                        }
                        if(p.type == "number") {
                            f.createSelectNumber(command[p.name], values, 1, p.must, p.comment);
                        } else if(p.type == "image") {
                            f.createImageSelector(command[p.name], values, 1, p.must, p.comment);
                        } else {
                            f.createSelectString(command[p.name], values, 1, p.must, p.comment);
                        }
                        continue;
                    }
                    switch(p.type) {
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
                            if(!command[p.name] || command[p.name].length == 0) {
                                f.createSubCommand("", 2, p.must, p.comment);
                            } else {
                                f.createSubCommand(command[p.name].join("\n"), 2, p.must, p.comment);
                            }
                            break;
                    }
                }
                if(props.isDynamic) {
                    f.createEditingLabel("", 1);
                    f.createInputString("");
                }
            }
            return f;
        };
        AdventureEditor.prototype.getPropertyEditorNew = function (index, cmdName) {
            return this._getPropertyEditor(index, adventure.Compiler.createCommand(cmdName, this.manager));
        };
        AdventureEditor.prototype.getPropertyEditor = function (index) {
            return this._getPropertyEditor(index, this.manager.commands[index]);
        };
        AdventureEditor.prototype.onLoadComplete = function (method, data, request) {
            var files;
            jgforce.NetUtil.getMaterials(this.materialLoaded);
            if(!this.game.data) {
                this.scripts.push(new adventure.AdventureScript("master", this));
                this.scripts[0].script = "game\n width: 480\n height: 480\n\nconfig\n windowWidth: 464\n windowHeight: 160\n windowX: 8\n windowY: 314\n messageAutoHide: 0\n autoFocus: 1";
                this.initTemplateMode = true;
                this.saveFile(this.scripts[0].name, this.scripts[0].script);
                return;
            } else {
                var tmp = JSON.parse(this.game.data);
                files = tmp.scripts;
                this.images = tmp.images;
            }
            this.loadedCount = 0;
            for(var i = 0; i < files.length; i++) {
                this.scripts.push(new adventure.AdventureScript(files[i], this));
            }
            for(var i = 0; i < this.scripts.length; i++) {
                this.loadScript(this.scripts[i]);
            }
        };
        AdventureEditor.prototype.initTemplateCompleted = function () {
            this.loadedCount = 0;
            this.loadScript(this.scripts[0]);
        };
        AdventureEditor.prototype.onMaterialLoaded = function (e) {
            if(e.is_error) {
                alert("素材の読み込みに失敗しました。");
            } else {
                for(var i = 0; i < e.materials.length; i++) {
                    this.images.push(e.materials[i].r_path);
                }
            }
        };
        AdventureEditor.prototype.calculateLines = function () {
            var startIndex = 0;
            for(var i = 0; i < this.scripts.length; i++) {
                this.scripts[i].updateLine(startIndex);
                startIndex += this.scripts[i].line;
            }
        };
        AdventureEditor.prototype.loadScript = function (script) {
            var _this = this;
            var loader = new adventure.ScriptLoader();
            loader.loaded.handle(function () {
                script.script = loader.scripts[0];
                _this.loadedCount++;
                if(_this.loadedCount == _this.scripts.length) {
                    _this.calculateLines();
                    _this.resetManager();
                    _this.loaded.fire();
                }
            });
            loader.load(jgforce.NetUtil.getDataUrl(this.session.user.name, this.game.id, this.revision, script.name));
        };
        AdventureEditor.prototype.getFiles = function () {
            var files = [];
            for(var i = 0; i < this.scripts.length; i++) {
                files.push(this.scripts[i].name);
            }
            return files;
        };
        AdventureEditor.prototype.getScripts = function () {
            var scripts = [];
            for(var i = 0; i < this.scripts.length; i++) {
                scripts.push(this.scripts[i].script);
            }
            return scripts;
        };
        AdventureEditor.prototype.save = function () {
            this.savedCount = 0;
            this.resetManager();
            var images = this.manager.resources;
            this.saveData(JSON.stringify({
                scripts: this.getFiles(),
                images: images
            }));
        };
        AdventureEditor.prototype.onSaveComplete = function (method, request) {
            if(this.initTemplateMode) {
                delete this.initTemplateMode;
                this.initTemplateCompleted();
                return;
            }
            this.savedCount++;
            if(this.savedCount == 1) {
                for(var i = 0; i < this.scripts.length; i++) {
                    this.scripts[i].updateScript();
                    this.saveFile(this.scripts[i].name, this.scripts[i].script);
                }
                this.delFileOther(this.getFiles());
            } else if(this.savedCount == (this.scripts.length + 1)) {
                this.saved.fire();
            }
        };
        AdventureEditor.prototype.getScriptIndexByLine = function (line) {
            var total = 0;
            for(var i = 0; i < this.scripts.length; i++) {
                total += this.scripts[i].line;
                if(line < total) {
                    return i;
                }
            }
            throw "invalid argument";
        };
        AdventureEditor.prototype.updateFlowchart = function () {
            this.flowchart = new adventure.Flowchart(this.manager);
            delete this.beforePreviewIndex;
            this.flowchart.generate();
        };
        AdventureEditor.prototype.preview = function (container, index, executeMasterCommands) {
            var scriptIndex = this.getScriptIndexByLine(index);
            var masterCommands = [];
            if(executeMasterCommands && scriptIndex > 0) {
                masterCommands = this.scripts[0].getCommands();
            }
            var isContinue = false;
            if(!this.flowchart) {
                this.updateFlowchart();
            }
            if(this.beforePreviewIndex !== undefined && this.beforePreviewIndex < index) {
                if(scriptIndex == this.getScriptIndexByLine(this.beforePreviewIndex)) {
                    isContinue = true;
                }
            }
            if(isContinue) {
                if((this.manager.game).nextTo(index) === false) {
                    isContinue = false;
                }
            }
            if(!isContinue) {
                container.innerHTML = "";
                try  {
                    if(this.manager.game) {
                        this.manager.game.end();
                    }
                } catch (ex) {
                    console.log(ex);
                }
                this.manager.start(adventure.PreviewGame, container);
                this.manager.game.resource.structure = new jgforce.ResourceStructure();
                (this.manager.game).set(this.flowchart);
                (this.manager.game).previewTo(index, this.scripts[scriptIndex].startIndex, masterCommands);
            }
            this.beforePreviewIndex = index;
        };
        AdventureEditor.prototype.orderCommand = function (index, value) {
            var scriptIndex = this.getScriptIndexByLine(index);
            var baseLine = this.scripts[scriptIndex].startIndex;
            var limitLine = baseLine + this.scripts[scriptIndex].line - 1;
            var newOrder = Math.min(Math.max(index + value, baseLine), limitLine);
            if(newOrder == index) {
                return false;
            }
            var forLen = Math.abs(newOrder - index);
            var update = {
            };
            for(var i = 0; i < forLen; i++) {
                var p = i * (newOrder < index ? -1 : 1);
                var p2 = (i + 1) * (newOrder < index ? -1 : 1);
                var target = index + p;
                var target2 = index + p2;
                var tmp = this.manager.commands[target];
                this.manager.commands[target] = this.manager.commands[target2];
                this.manager.commands[target2] = tmp;
                update[target] = 1;
                update[target2] = 1;
            }
            for(var index in update) {
                var nIndex = Number(index);
                this.manager.updateManagerByCommand(this.manager.commands[nIndex], nIndex);
            }
            delete this.flowchart;
            return true;
        };
        AdventureEditor.prototype.orderScript = function (index, value) {
            var tmp = this.scripts[index];
            var newOrder = Math.min(Math.max(index + value, 0), this.scripts.length - 1);
            if(newOrder == index) {
                return false;
            }
            var forLen = Math.abs(newOrder - index);
            for(var i = 0; i < forLen; i++) {
                var p = i * (newOrder < index ? -1 : 1);
                var p2 = (i + 1) * (newOrder < index ? -1 : 1);
                var target = index + p;
                var target2 = index + p2;
                var tmp = this.scripts[target];
                this.scripts[target] = this.scripts[target2];
                this.scripts[target2] = tmp;
            }
            for(var i = 0; i < this.scripts.length; i++) {
                this.scripts[i].updateScript();
            }
            this.calculateLines();
            this.resetManager();
            return true;
        };
        AdventureEditor.prototype.resetManager = function () {
            this.manager = new adventure.Manager(this.getScripts());
            delete this.beforePreviewIndex;
            delete this.flowchart;
        };
        AdventureEditor.prototype.replaceScript = function (index, script) {
            this.scripts[index].script = script;
            for(var i = 0; i < this.scripts.length; i++) {
                if(i != index) {
                    this.scripts[i].updateScript();
                }
            }
            this.calculateLines();
            this.resetManager();
        };
        AdventureEditor.prototype.replaceCommand = function (index, cmdStr) {
            var commandStrings = adventure.Compiler.getCommandStrings(cmdStr.split(/\r\n|\r|\n/g));
            var newCommand;
            var commands = [];
            for(var i = 0; i < commandStrings.length; i++) {
                commands.push(adventure.Compiler.compileCommand(commandStrings[i]));
            }
            this.manager.commands.splice.apply(this.manager.commands, [
                index, 
                1
            ].concat(commands));
            var len = commands.length + index;
            for(var i = index; i < len; i++) {
                this.manager.updateManagerByCommand(this.manager.commands[i], i);
            }
            var scriptIndex = this.getScriptIndexByLine(index);
            this.scripts[scriptIndex].line += commands.length - 1;
            this.manager.addResourcesByCommands(commands);
            delete this.flowchart;
            return commands.length;
        };
        AdventureEditor.prototype.isUniqueFile = function (name) {
            for(var i = 0; i < this.scripts.length; i++) {
                if(this.scripts[i].name == name) {
                    return false;
                }
            }
            return true;
        };
        AdventureEditor.prototype.insertScript = function (index, name, script) {
            var scriptObj = new adventure.AdventureScript(name, this);
            scriptObj.script = (script === undefined) ? "message" : script;
            this.scripts.splice(index, 0, scriptObj);
            this.calculateLines();
            this.resetManager();
        };
        AdventureEditor.prototype.deleteScript = function (index) {
            if(index < 0 || index >= this.scripts.length || this.scripts.length == 0) {
                return false;
            }
            this.scripts.splice(index, 1);
            this.calculateLines();
            this.resetManager();
        };
        AdventureEditor.prototype.insertNewCommand = function (index, command) {
            if(command === undefined) {
                command = adventure.Compiler.createCommand("message");
            }
            var scriptIndex = this.getScriptIndexByLine(index);
            this.manager.commands.splice(index, 0, command);
            this.manager.updateManagerByCommand(command, index);
            this.manager.addResourcesByCommands([
                command
            ]);
            this.scripts[scriptIndex].line++;
            for(var i = scriptIndex + 1; i < this.scripts.length; i++) {
                this.scripts[i].startIndex++;
            }
            delete this.flowchart;
        };
        AdventureEditor.prototype.getNewScriptNumber = function () {
            var max = 0;
            for(var i = 0; i < this.scripts.length; i++) {
                var s = this.scripts[i];
                if(s.name.indexOf("script") !== 0) {
                    continue;
                }
                try  {
                    var v = parseInt(s.name.substr(6));
                    if(max < v) {
                        max = v;
                    }
                } catch (ex) {
                }
            }
            return max + 1;
        };
        AdventureEditor.prototype.deleteCommand = function (index) {
            var scriptIndex = this.getScriptIndexByLine(index);
            this.manager.commands.splice(index, 1);
            this.scripts[scriptIndex].line--;
            for(var i = scriptIndex + 1; i < this.scripts.length; i++) {
                this.scripts[i].startIndex--;
            }
            delete this.flowchart;
        };
        return AdventureEditor;
    })(jgforce.Editor);
    adventure.AdventureEditor = AdventureEditor;    
})(adventure || (adventure = {}));
var adventure;
(function (adventure) {
    var AdventurePlayer = (function (_super) {
        __extends(AdventurePlayer, _super);
        function AdventurePlayer(session) {
                _super.call(this, session);
            this.files = [];
            jg.Resource.getInstance().structure = new jgforce.ResourceStructure();
        }
        AdventurePlayer.prototype.load = function (id, data_url) {
            this.data_url = data_url;
            var ret = _super.prototype.load.call(this, id);
            return ret;
        };
        AdventurePlayer.prototype.onLoadComplete = function (method, data, request) {
            if(!this.game.data) {
                throw "can not load data";
            }
            this.scripts = [];
            var tmp = JSON.parse(this.game.data);
            this.files = tmp.scripts;
            this.loadedCount = 0;
            for(var i = 0; i < this.files.length; i++) {
                this.scripts.push("");
                this.loadScript(i, this.files[i]);
            }
        };
        AdventurePlayer.prototype.loadScript = function (index, file) {
            var _this = this;
            var loader = new adventure.ScriptLoader();
            loader.loaded.handle(function () {
                _this.scripts[index] = loader.scripts[0];
                _this.loadedCount++;
                if(_this.loadedCount == _this.scripts.length) {
                    _this.resetManager();
                    _this.loaded.fire();
                }
            });
            loader.load(this.data_url + file);
        };
        AdventurePlayer.prototype.resetManager = function () {
            this.manager = new adventure.Manager(this.scripts);
        };
        AdventurePlayer.prototype.start = function (gameClass) {
            this.manager.start(gameClass);
        };
        return AdventurePlayer;
    })(jgforce.Editor);
    adventure.AdventurePlayer = AdventurePlayer;    
})(adventure || (adventure = {}));
