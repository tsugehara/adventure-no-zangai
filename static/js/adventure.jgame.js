var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var adventure;
(function (adventure) {
    var BasicScene = (function (_super) {
        __extends(BasicScene, _super);
        function BasicScene(game) {
                _super.call(this, game);
        }
        BasicScene.prototype.init = function (size, pos) {
            if(size === undefined) {
                size = {
                    width: this.game.width,
                    height: this.game.height
                };
            }
            if(pos === undefined) {
                pos = {
                    x: (this.game.width - size.width) / 2,
                    y: (this.game.height - size.height)
                };
            }
            this.bgLayer = this.createLayer("bg");
            this.charaLayer = this.createLayer("chara");
            this.messageLayer = this.createLayer("message", size);
            this.messageLayer.moveTo(pos.x, pos.y);
            this.messageWindow = new jg.MessageWindow(size.width, size.height);
            this.messageWindow.moveTo(0, 0);
            this.messageLayer.append(this.messageWindow);
            this.messageWindow.hide();
            this.changeBg();
        };
        BasicScene.prototype.changeBg = function (image) {
            if(image === undefined) {
                image = (new jg.Shape(this.game.width, this.game.height, jg.ShapeStyle.Fill, "#ffffff")).createSprite().image;
            }
            var entity;
            while(entity = this.bgLayer.entities.pop()) {
                entity.remove();
            }
            this.bgLayer.append(new jg.Sprite(image));
            this.bgLayer.updated();
        };
        BasicScene.prototype.prepareBg = function (image) {
            if(image === undefined) {
                image = (new jg.Shape(this.game.width, this.game.height, jg.ShapeStyle.Fill, "#ffffff")).createSprite().image;
            }
            var bg = new jg.Sprite(image);
            this.bgLayer.insert(bg, 0);
            this.bgLayer.updated();
            return bg;
        };
        BasicScene.prototype.clearOldBgs = function () {
            while(this.bgLayer.entities.length > 1) {
                var entity = this.bgLayer.entities.pop();
                entity.remove();
            }
            this.bgLayer.updated();
        };
        return BasicScene;
    })(jg.Scene);
    adventure.BasicScene = BasicScene;    
})(adventure || (adventure = {}));
var adventure;
(function (adventure) {
    var Command = (function () {
        function Command(manager, name) {
            this.name = name;
            this.manager = manager;
            this.finished = new jg.Trigger();
        }
        Command.prototype.execute = function () {
            this.finished.fire();
        };
        Command.prototype.add = function (line, tab) {
            var kv = this.getKeyValue(line);
            if(adventure.PropertyUtil.isNumber(this, kv.key)) {
                this.setProp(kv, true);
                return;
            }
            this.setProp(kv);
        };
        Command.prototype.getKeyValue = function (line) {
            var index = line.indexOf(":");
            if(index == -1) {
                return {
                    key: "",
                    value: line
                };
            }
            return {
                key: line.substr(0, index).replace(/^[\s\t]+/, ""),
                value: line.substr(index + 1).replace(/^[\s\t]+/, "")
            };
        };
        Command.prototype.setProp = function (kv, isInt) {
            if(isInt) {
                this[kv.key] = Number(kv.value);
            } else {
                this[kv.key] = kv.value;
            }
        };
        Command.prototype.toStringCommon = function (prefix) {
            var ngs = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                ngs[_i] = arguments[_i + 1];
            }
            var props = [];
            var ng = [
                "name", 
                "manager", 
                "finished", 
                "parent"
            ];
            if(ngs) {
                ng = ng.concat(ngs);
            }
            if(!prefix) {
                prefix = "";
            }
            for(var prop in this) {
                var t = typeof this[prop];
                if(ng.indexOf(prop) >= 0) {
                    continue;
                }
                if(t == "function") {
                    continue;
                }
                if(t == "string" || t == "number") {
                    props.push(prop + ": " + this[prop]);
                    continue;
                }
                if(this[prop] instanceof Array) {
                    for(var i = 0; i < this[prop].length; i++) {
                        props.push(this[prop][i].toStringCommon(prefix + " ", ngs));
                    }
                } else {
                    props.push(this[prop].toStringCommon(prefix + " ", ngs));
                }
            }
            if(props.length == 0) {
                return this.name;
            }
            return this.name + "\n" + prefix + " " + props.join("\n" + prefix + " ");
        };
        Command.prototype.toString = function (prefix) {
            return this.toStringCommon(prefix);
        };
        Command.prototype.getProperties = function () {
            return new adventure.PropertySet();
        };
        Command.prototype.random = function (min, max) {
            return this.manager.game.random(min, max);
        };
        return Command;
    })();
    adventure.Command = Command;    
})(adventure || (adventure = {}));
var adventure;
(function (adventure) {
    var ExitCommand = (function (_super) {
        __extends(ExitCommand, _super);
        function ExitCommand(manager) {
                _super.call(this, manager, "exit");
        }
        ExitCommand.prototype.execute = function () {
            this.manager.index = this.manager.commands.length;
            this.finished.fire();
        };
        ExitCommand.prototype.getProperties = function () {
            return new adventure.PropertySet("ゲームを終了させるコマンドです。");
        };
        return ExitCommand;
    })(adventure.Command);
    adventure.ExitCommand = ExitCommand;    
    var EvalAsyncCommand = (function (_super) {
        __extends(EvalAsyncCommand, _super);
        function EvalAsyncCommand(manager, name) {
                _super.call(this, manager, name === undefined ? "evalAsync" : name);
            this.script = "";
        }
        EvalAsyncCommand.prototype.execute = function () {
            eval(this.script);
        };
        EvalAsyncCommand.prototype.add = function (line, tab) {
            this.script += line + "\n";
        };
        EvalAsyncCommand.prototype.toString = function (prefix) {
            return this.name + "\n" + " " + this.script.substr(0, this.script.length - 1).split(/\n/g).join("\n ");
        };
        EvalAsyncCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("JavaScriptを実行するコマンドです。\nこのコマンドはevalコマンドとは異なり、javascript実行後自動的にコマンド終了処理を行いません。明示的にthis.finished.fire()を実行する必要があります。");
            p.isPlain = true;
            return p;
        };
        return EvalAsyncCommand;
    })(adventure.Command);
    adventure.EvalAsyncCommand = EvalAsyncCommand;    
    var EvalCommand = (function (_super) {
        __extends(EvalCommand, _super);
        function EvalCommand(manager) {
                _super.call(this, manager, "eval");
        }
        EvalCommand.prototype.execute = function () {
            _super.prototype.execute.call(this);
            this.finished.fire();
        };
        EvalCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("JavaScriptを実行するコマンドです。\nこのコマンドはevalAsyncコマンドとは異なり、javascript実行後自動的にコマンドを終了させます。");
            p.isPlain = true;
            return p;
        };
        return EvalCommand;
    })(EvalAsyncCommand);
    adventure.EvalCommand = EvalCommand;    
    var GameCommand = (function (_super) {
        __extends(GameCommand, _super);
        function GameCommand(manager) {
                _super.call(this, manager, "game");
            this.width = 480;
            this.height = 480;
        }
        GameCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("ゲームの大きさを変更するコマンドです。このコマンドは一度だけしか実行出来ません。");
            p.add("width", "number", "横幅", true);
            p.add("height", "number", "縦幅", true);
            return p;
        };
        return GameCommand;
    })(adventure.Command);
    adventure.GameCommand = GameCommand;    
    var ConfigCommand = (function (_super) {
        __extends(ConfigCommand, _super);
        function ConfigCommand(manager, gameCommand) {
                _super.call(this, manager, "config");
            this.windowWidth = 480;
            this.windowHeight = 480;
            this.windowX = 0;
            this.windowY = 0;
            this.messageAutoHide = 0;
            this.autoFocus = 1;
        }
        ConfigCommand.prototype.setInfoByGameCommmand = function (gameCommand) {
            this.windowWidth = gameCommand.width;
            this.windowHeight = gameCommand.height;
        };
        ConfigCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("ゲームの各種設定を行うコマンドです。このコマンドは一度だけしか実行できません。\nゲーム中の設定変更はchangeConfigコマンドを利用する必要があります。");
            p.add("windowWidth", "number", "メッセージウィンドウの横幅");
            p.add("windowHeight", "number", "メッセージウィンドウの縦幅");
            p.add("windowX", "number", "メッセージウィンドウの表示横位置");
            p.add("windowY", "number", "メッセージウィンドウの表示縦位置");
            p.add("messageAutoHide", "number", "メッセージ表示後、メッセージウィンドウを自動的に隠すかどうか");
            p.add("autoFocus", "number", "selectableコマンドで指定した対象に、キーボード操作でフォーカスを合わせるかどうか");
            return p;
        };
        return ConfigCommand;
    })(adventure.Command);
    adventure.ConfigCommand = ConfigCommand;    
    var ChangeConfigCommand = (function (_super) {
        __extends(ChangeConfigCommand, _super);
        function ChangeConfigCommand(manager) {
                _super.call(this, manager, "changeConfig");
        }
        ChangeConfigCommand.prototype.execute = function () {
            var ng = adventure.Util.getNgProps();
            for(var prop in this) {
                if(ng.indexOf(prop) >= 0) {
                    continue;
                }
                if(typeof this[prop] == "function") {
                    continue;
                }
                this.manager.config[prop] = typeof this.manager.config[prop] == "number" ? parseInt(this[prop]) : this[prop];
            }
            this.finished.fire();
        };
        ChangeConfigCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("ゲームの各種設定を変更するコマンドです。\nどのような設定値があるかは、configコマンドを確認してください。");
            var ng = adventure.Util.getNgProps();
            p.isDynamic = true;
            for(var prop in this) {
                if(ng.indexOf(prop) >= 0) {
                    continue;
                }
                if(typeof this[prop] == "function") {
                    continue;
                }
                p.add(prop, "string");
            }
            return p;
        };
        return ChangeConfigCommand;
    })(adventure.Command);
    adventure.ChangeConfigCommand = ChangeConfigCommand;    
    var BgCommand = (function (_super) {
        __extends(BgCommand, _super);
        function BgCommand(manager) {
                _super.call(this, manager, "bg");
        }
        BgCommand.prototype.execute = function () {
            if(!this.effect) {
                this.manager.scene.changeBg(this.manager.game.r(this.file));
                this.finished.fire();
                return;
            }
            var bg1 = this.manager.get("bg");
            var effect = this.manager.effects[this.effect];
            var bg2 = this.manager.scene.prepareBg(this.manager.game.r(this.file));
            effect.target = bg2;
            effect.show = true;
            if(this.time !== undefined) {
                effect.time = this.time;
            }
            var effect2 = effect.cloneReverse();
            effect2.target = bg1;
            effect2.show = false;
            effect2.doEffect();
            effect.doEffect();
            effect.finished.handle(this, function () {
                effect.finished.removeAll(this);
                this.manager.scene.clearOldBgs();
                this.finished.fire();
            });
        };
        BgCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("背景画像を切り替えるコマンドです。");
            p.add("file", "image", "画像名を指定します。", true, "image");
            p.add("effect", "string", "画像表示に利用するエフェクトを指定します。\n省略すると、即時に表示されます。", false, "effect");
            p.add("time", "number", "画像表示のエフェクトにかける時間を指定します。");
            return p;
        };
        return BgCommand;
    })(adventure.Command);
    adventure.BgCommand = BgCommand;    
    var EffectiveCommand = (function (_super) {
        __extends(EffectiveCommand, _super);
        function EffectiveCommand(manager, name) {
                _super.call(this, manager, name);
        }
        EffectiveCommand.prototype.doEffect = function (show, e, noCallback) {
            if(e === undefined) {
                e = this.manager.get(this.id);
            }
            if(!this.effect) {
                this.effectEnded(e);
                return;
            }
            var effect = this.manager.effects[this.effect];
            effect.target = e;
            effect.show = show;
            if(this.time > 0) {
                effect.time = this.time;
            }
            effect.doEffect();
            var callback = function () {
                effect.finished.remove(this, callback);
                if(!noCallback) {
                    this.effectEnded(e);
                }
            };
            effect.finished.handle(this, callback);
        };
        EffectiveCommand.prototype.effectEnded = function (e) {
        };
        return EffectiveCommand;
    })(adventure.Command);
    adventure.EffectiveCommand = EffectiveCommand;    
    var AddCommand = (function (_super) {
        __extends(AddCommand, _super);
        function AddCommand(manager) {
                _super.call(this, manager, "add");
        }
        AddCommand.prototype.execute = function () {
            var image = this.manager.game.r(this.file);
            var sprite = new jg.Sprite(image, this.width !== undefined ? this.width : image.width, this.height !== undefined ? this.height : image.height);
            if(this.x !== undefined && this.y !== undefined) {
                sprite.moveTo(this.x, this.y);
            }
            this.manager.append(this.id ? this.id : this.file, sprite);
            if(this.effect) {
                this.doEffect(true);
            } else {
                this.finished.fire();
            }
        };
        AddCommand.prototype.effectEnded = function (e) {
            this.finished.fire();
        };
        AddCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("画面にオブジェクトを追加します。");
            p.add("id", "string", "表示するオブジェクトのIDを指定します。", true);
            p.add("file", "image", "表示するオブジェクトの画像ファイル名を指定します。", true, "image");
            p.add("effect", "string", "オブジェクト表示に利用するエフェクトを指定します。\n省略すると、即時に表示されます。", false, "effect");
            p.add("time", "number", "オブジェクト表示のエフェクトにかける時間を指定します。");
            p.add("x", "number", "表示横座標を指定します。");
            p.add("y", "number", "表示縦座標を指定します。");
            p.add("width", "number", "画像の横幅を指定します。省略時は画像の大きさのまま表示されます。");
            p.add("height", "number", "画像の縦幅を指定します。省略時は画像の大きさのまま表示されます。");
            return p;
        };
        return AddCommand;
    })(EffectiveCommand);
    adventure.AddCommand = AddCommand;    
    var RemoveCommand = (function (_super) {
        __extends(RemoveCommand, _super);
        function RemoveCommand(manager) {
                _super.call(this, manager, "remove");
        }
        RemoveCommand.prototype.execute = function () {
            this.doEffect(false);
        };
        RemoveCommand.prototype.effectEnded = function (e) {
            this.manager.remove(this.id);
            this.finished.fire();
        };
        RemoveCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("画面からオブジェクトを削除します。");
            p.add("id", "string", "削除するオブジェクトのIDを指定します。", true);
            p.add("effect", "string", "オブジェクト削除に利用するエフェクトを指定します。\n省略すると、即時に削除されます。", false, "effect");
            p.add("time", "number", "オブジェクト削除のエフェクトにかける時間を指定します。");
            return p;
        };
        return RemoveCommand;
    })(EffectiveCommand);
    adventure.RemoveCommand = RemoveCommand;    
    var HideCommand = (function (_super) {
        __extends(HideCommand, _super);
        function HideCommand(manager) {
                _super.call(this, manager, "hide");
        }
        HideCommand.prototype.execute = function () {
            this.doEffect(false);
        };
        HideCommand.prototype.effectEnded = function (e) {
            e.hide();
            this.finished.fire();
        };
        HideCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("画面のオブジェクトを非表示にします。");
            p.add("id", "string", "非表示にするオブジェクトのIDを指定します。", true);
            p.add("effect", "string", "オブジェクト非表示に利用するエフェクトを指定します。\n省略すると、即時に非表示にされます。", false, "effect");
            p.add("time", "number", "オブジェクト非表示時のエフェクトにかける時間を指定します。");
            return p;
        };
        return HideCommand;
    })(EffectiveCommand);
    adventure.HideCommand = HideCommand;    
    var ShowCommand = (function (_super) {
        __extends(ShowCommand, _super);
        function ShowCommand(manager) {
                _super.call(this, manager, "show");
        }
        ShowCommand.prototype.execute = function () {
            this.doEffect(true);
        };
        ShowCommand.prototype.effectEnded = function (e) {
            e.show();
            this.finished.fire();
        };
        ShowCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("画面のオブジェクトを再表示します。");
            p.add("id", "string", "再表示するオブジェクトのIDを指定します。", true);
            p.add("effect", "string", "オブジェクト再表示に利用するエフェクトを指定します。\n省略すると、即時に再表示されます。", false, "effect");
            p.add("time", "number", "オブジェクト再表示時のエフェクトにかける時間を指定します。");
            return p;
        };
        return ShowCommand;
    })(EffectiveCommand);
    adventure.ShowCommand = ShowCommand;    
    var OrderCommand = (function (_super) {
        __extends(OrderCommand, _super);
        function OrderCommand(manager) {
                _super.call(this, manager, "order");
        }
        OrderCommand.prototype.execute = function () {
            delete this.ordered;
            this.doEffect(false);
        };
        OrderCommand.prototype.effectEnded = function (e) {
            if(this.ordered) {
                this.finished.fire();
            } else {
                var all = this.manager.scene.charaLayer.entities;
                var index;
                for(var i = 0; i < all.length; i++) {
                    if(all[i] == e) {
                        index = i;
                        break;
                    }
                }
                var newIndex = index + this.value;
                if(newIndex < 0) {
                    newIndex = 0;
                }
                if(newIndex >= all.length) {
                    newIndex = all.length - 1;
                }
                if(this.value > 0) {
                    for(var i = index; i < newIndex; i++) {
                        all[i] = all[i + 1];
                    }
                    all[newIndex] = e;
                } else {
                    for(var i = index; i > newIndex; i--) {
                        all[i] = all[i - 1];
                    }
                    all[newIndex] = e;
                }
                this.manager.scene.charaLayer.updated();
                this.ordered = true;
                this.doEffect(true);
            }
        };
        OrderCommand.prototype.toString = function (prefix) {
            return this.toStringCommon(prefix, "ordered");
        };
        OrderCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("オブジェクトの表示順序を切り替えるコマンドです。");
            p.add("id", "string", "表示順序を切り替えるオブジェクトのIDを指定します。", true);
            p.add("value", "number", "入れ替え後の表示順序を示す値を指定します。\n0が一番奥です。", true);
            p.add("effect", "string", "表示順序切り替えに利用するエフェクトを指定します。\n省略すると、即時に表示順序を切り替えます。", false, "effect");
            p.add("time", "number", "表示順序切り替えのエフェクトにかける時間を指定します。");
            return p;
        };
        return OrderCommand;
    })(EffectiveCommand);
    adventure.OrderCommand = OrderCommand;    
    var ImageCommand = (function (_super) {
        __extends(ImageCommand, _super);
        function ImageCommand(manager) {
                _super.call(this, manager, "image");
        }
        ImageCommand.prototype.execute = function () {
            var e = this.manager.get(this.id);
            this._dummy = new jg.Sprite(this.manager.game.r(this.file), e.width, e.height);
            this.manager.scene.charaLayer.append(this._dummy);
            this._dummy.moveTo(e.x, e.y);
            var effect = this.manager.effects[this.effect];
            effect.mask1 = e.image;
            effect.mask2 = this._dummy.image;
            effect.maskDraw = true;
            var effect2 = effect.cloneReverse();
            effect2.show = false;
            effect2.time = this.time ? this.time : effect.time;
            effect2.target = e;
            effect2.doEffect();
            effect2.maskDraw = false;
            this.doEffect(true, this._dummy);
        };
        ImageCommand.prototype.effectEnded = function (e) {
            var effect = this.manager.effects[this.effect];
            delete effect.mask1;
            delete effect.mask2;
            var e = this.manager.get(this.id);
            e.image = this._dummy.image;
            e.show();
            this._dummy.remove();
            this.finished.fire();
        };
        ImageCommand.prototype.toString = function (prefix) {
            return this.toStringCommon(prefix, "_dummy");
        };
        ImageCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("オブジェクトの画像を切り替えるコマンドです。");
            p.add("id", "string", "画像を切り替えるオブジェクトのIDを指定します。", true);
            p.add("file", "image", "切り替え後の画像ファイル名を指定します。", true, "image");
            p.add("effect", "string", "画像切り替えに利用するエフェクトを指定します。\n省略すると、即時に画像を切り替えます。", false, "effect");
            p.add("time", "number", "画像切り替えのエフェクトにかける時間を指定します。");
            return p;
        };
        return ImageCommand;
    })(EffectiveCommand);
    adventure.ImageCommand = ImageCommand;    
    var MoveCommand = (function (_super) {
        __extends(MoveCommand, _super);
        function MoveCommand(manager) {
                _super.call(this, manager, "move");
            this.x = 0;
            this.y = 0;
        }
        MoveCommand.prototype.execute = function () {
            var _this = this;
            var e = this.manager.get(this.id);
            if(!this.time) {
                e.moveTo(this.x, this.y);
                this.finished.fire();
                return;
            }
            var easing = undefined;
            if(this.easing && jg.Easing[this.easing]) {
                easing = jg.Easing[this.easing];
            }
            e.tl().moveTo(this.x, this.y, this.time, easing).then(function () {
                _this.finished.fire();
            });
        };
        MoveCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("オブジェクトの位置を移動するコマンドです。");
            p.add("id", "string", "位置を移動させるオブジェクトのIDを指定します。", true);
            p.add("x", "number", "移動後の画面横座標を指定します。", true);
            p.add("y", "number", "移動後の画面縦座標を指定します。", true);
            p.add("time", "number", "移動にかかる時間を指定します。\n省略すると即座に移動が完了します。");
            p.add("easing", "string", "移動に利用するeasing関数を指定します。", false, adventure.Util.getEasingProps());
            return p;
        };
        return MoveCommand;
    })(adventure.Command);
    adventure.MoveCommand = MoveCommand;    
    var ScaleCommand = (function (_super) {
        __extends(ScaleCommand, _super);
        function ScaleCommand(manager) {
                _super.call(this, manager, "scale");
        }
        ScaleCommand.prototype.execute = function () {
            var _this = this;
            var e = this.manager.get(this.id);
            if(!this.time) {
                e.setDrawOption("scale", {
                    x: this.scale ? this.scale : this.scaleX,
                    y: this.scale ? this.scale : this.scaleY
                });
                this.finished.fire();
                return;
            }
            var easing = undefined;
            if(this.easing && jg.Easing[this.easing]) {
                easing = jg.Easing[this.easing];
            }
            if(this.scale) {
                e.tl().scaleTo(this.scale, this.time, easing).then(function () {
                    _this.finished.fire();
                });
            } else {
                e.tl().scaleTo(this.scaleX, this.scaleY, this.time, easing).then(function () {
                    _this.finished.fire();
                });
            }
        };
        ScaleCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("オブジェクトの表示倍率を操作するコマンドです。");
            p.add("id", "string", "表示倍率を変更するオブジェクトのIDを指定します。", true);
            p.add("scaleX", "number", "この値を指定すると、オブジェクトの横方向への拡大倍率を変更します。\nscaleとの同時指定は出来ません。");
            p.add("scaleY", "number", "この値を指定すると、オブジェクトの縦方向への拡大倍率を変更します。\nscaleとの同時指定は出来ません。");
            p.add("scale", "number", "この値を指定すると、オブジェクトの縦横双方の拡大倍率を同時に変更します。\nscaleXまたはscaleYとの同時指定は出来ません。");
            p.add("time", "number", "表示倍率変更にかかる時間を指定します。\n省略すると即座に変更が完了します。");
            p.add("easing", "string", "表示倍率変更に利用するeasing関数を指定します。", false, adventure.Util.getEasingProps());
            return p;
        };
        return ScaleCommand;
    })(adventure.Command);
    adventure.ScaleCommand = ScaleCommand;    
    var ResizeCommand = (function (_super) {
        __extends(ResizeCommand, _super);
        function ResizeCommand(manager) {
                _super.call(this, manager, "resize");
        }
        ResizeCommand.prototype.execute = function () {
            var _this = this;
            var e = this.manager.get(this.id);
            if(!this.time) {
                if(this.width) {
                    e.width = this.width;
                }
                if(this.height) {
                    e.height = this.height;
                }
                e.updated();
                this.finished.fire();
                return;
            }
            var easing = undefined;
            if(this.easing && jg.Easing[this.easing]) {
                easing = jg.Easing[this.easing];
            }
            e.tl().scaleTo(this.width ? this.width : e.width, this.height ? this.height : e.height, this.time, easing).then(function () {
                _this.finished.fire();
            });
        };
        ResizeCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("オブジェクトのサイズを操作するコマンドです。\nscaleコマンドとは異なり、オブジェクトのサイズ自体を変更するため、右下の方向に伸縮されます。");
            p.add("id", "string", "表示倍率を変更するオブジェクトのIDを指定します。", true);
            p.add("width", "number", "新しいオブジェクトの横幅を指定します。", true);
            p.add("height", "number", "新しいオブジェクトの縦幅を指定します。", true);
            p.add("time", "number", "表示倍率変更にかかる時間を指定します。\n省略すると即座に変更が完了します。");
            p.add("easing", "string", "表示倍率変更に利用するeasing関数を指定します。", false, adventure.Util.getEasingProps());
            return p;
        };
        return ResizeCommand;
    })(adventure.Command);
    adventure.ResizeCommand = ResizeCommand;    
    var WaitCommand = (function (_super) {
        __extends(WaitCommand, _super);
        function WaitCommand(manager) {
                _super.call(this, manager, "wait");
        }
        WaitCommand.prototype.execute = function () {
            this._t = 0;
            this.manager.game.update.handle(this, this.update);
        };
        WaitCommand.prototype.update = function (t) {
            this._t += t;
            if(this._t > this.time) {
                this.manager.game.update.remove(this, this.update);
                this.finished.fire();
            }
        };
        WaitCommand.prototype.toString = function (prefix) {
            return this.toStringCommon(prefix, "_t");
        };
        WaitCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("一定時間何もせずに待機するコマンドです。");
            p.add("time", "number", "待機する時間を指定します。", true);
            return p;
        };
        return WaitCommand;
    })(adventure.Command);
    adventure.WaitCommand = WaitCommand;    
    var JumpCommand = (function (_super) {
        __extends(JumpCommand, _super);
        function JumpCommand(manager) {
                _super.call(this, manager, "jump");
        }
        JumpCommand.prototype.execute = function () {
            if(this.command !== undefined) {
                this.manager.index = this.command;
            } else if(this.scene !== undefined) {
                this.manager.index = this.manager.scenes[this.scene];
            } else if(this.label !== undefined) {
                this.manager.index = this.manager.labels[this.label];
            }
            this.finished.fire();
        };
        JumpCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("特定の場所へジャンプするコマンドです。label、scene、commandのどれか一つのみを指定します。");
            p.add("label", "string", "指定したIDのlabelへジャンプします。", false, "label");
            p.add("scene", "string", "指定したIDのsceneへジャンプします。", false, "scene");
            p.add("command", "number", "指定番号目のコマンドへジャンプします。");
            return p;
        };
        return JumpCommand;
    })(adventure.Command);
    adventure.JumpCommand = JumpCommand;    
    var CallCommand = (function (_super) {
        __extends(CallCommand, _super);
        function CallCommand(manager) {
                _super.call(this, manager);
            this.name = "call";
        }
        CallCommand.prototype.execute = function () {
            this.manager.stack.push(this.manager.index);
            _super.prototype.execute.call(this);
        };
        CallCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("この場所を基点に、特定の場所へジャンプするコマンドです。label、scene、commandのどれか一つのみを指定します。\nジャンプ先では必ずreturnコマンドを用意しておく必要があります。");
            p.add("label", "string", "指定したIDのlabelへジャンプします。", false, "label");
            p.add("scene", "string", "指定したIDのsceneへジャンプします。", false, "scene");
            p.add("command", "number", "指定番号目のコマンドへジャンプします。");
            return p;
        };
        return CallCommand;
    })(JumpCommand);
    adventure.CallCommand = CallCommand;    
    var ReturnCommand = (function (_super) {
        __extends(ReturnCommand, _super);
        function ReturnCommand(manager) {
                _super.call(this, manager, "return");
        }
        ReturnCommand.prototype.execute = function () {
            if(this.manager.stack.length) {
                this.manager.index = this.manager.stack.pop();
            }
            this.finished.fire();
        };
        ReturnCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("直前のcallコマンドを呼び出した場所へジャンプします。");
            return p;
        };
        return ReturnCommand;
    })(adventure.Command);
    adventure.ReturnCommand = ReturnCommand;    
    var LabelCommand = (function (_super) {
        __extends(LabelCommand, _super);
        function LabelCommand(manager) {
                _super.call(this, manager, "label");
        }
        LabelCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("この場所にラベルを貼るコマンドです。\nこのコマンド単体では意味がありませんが、jumpやcallコマンドと併用して利用します。");
            p.add("id", "string", "このラベルの識別IDを指定します。", true);
            return p;
        };
        return LabelCommand;
    })(adventure.Command);
    adventure.LabelCommand = LabelCommand;    
    var SkipCommand = (function (_super) {
        __extends(SkipCommand, _super);
        function SkipCommand(manager) {
                _super.call(this, manager, "skip");
        }
        SkipCommand.prototype.execute = function () {
            this.manager.index += this.command;
            this.finished.fire();
        };
        SkipCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("指定行数の命令をスキップするコマンドです。");
            p.add("command", "number", "スキップするコマンド数を指定します。", true);
            return p;
        };
        return SkipCommand;
    })(adventure.Command);
    adventure.SkipCommand = SkipCommand;    
    var VarCommand = (function (_super) {
        __extends(VarCommand, _super);
        function VarCommand(manager) {
                _super.call(this, manager, "var");
        }
        VarCommand.ng = [
            "name", 
            "manager", 
            "id", 
            "finished", 
            "parent"
        ];
        VarCommand.prototype.execute = function () {
            var scripts = [];
            var ng = adventure.Util.getNgProps();
            for(var prop in this) {
                if(ng.indexOf(prop) >= 0) {
                    continue;
                }
                if(typeof this[prop] == "function") {
                    continue;
                }
                var script = [
                    "this.manager.vars[\"" + prop + "\"]="
                ];
                script.push(adventure.Util.analysisVarLine(this[prop]));
                script.push(";");
                scripts.push(script.join(""));
            }
            eval(scripts.join("\n"));
            this.finished.fire();
        };
        VarCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("変数を指定するコマンドです。\naプロパティに10という値を設定すれば、a変数に10の値が入ります。");
            var ng = adventure.Util.getNgProps();
            p.isDynamic = true;
            for(var prop in this) {
                if(ng.indexOf(prop) >= 0) {
                    continue;
                }
                if(typeof this[prop] == "function") {
                    continue;
                }
                p.add(prop, "string");
            }
            return p;
        };
        return VarCommand;
    })(adventure.Command);
    adventure.VarCommand = VarCommand;    
    var ButtonsCommand = (function (_super) {
        __extends(ButtonsCommand, _super);
        function ButtonsCommand(manager) {
                _super.call(this, manager, "buttons");
            this.texts = [];
        }
        ButtonsCommand.prototype.execute = function () {
            if(!this.manager.scene.layers["buttons"]) {
                this.manager.scene.createLayer("buttons");
            }
            var layer = this.manager.scene.layers["buttons"];
            var len = layer.entities.length + this.texts.length;
            for(var i = 0; i < this.texts.length; i++) {
                var btn = new jgui.TextButton(this.texts[i], this.manager.game.width - 64, 32);
                btn["id"] = this.texts[i];
                layer.append(btn);
            }
            var totalHeight = len * 48;
            for(var i = 0; i < layer.entities.length; i++) {
                var btn = layer.entities[i];
                btn.moveTo((layer.width - btn.width) / 2, layer.height / 2 - totalHeight / 2 + i * 40);
            }
            this.finished.fire();
        };
        ButtonsCommand.prototype.add = function (line, tab) {
            this.texts.push(line);
        };
        ButtonsCommand.prototype.toString = function (prefix) {
            return this.name + "\n" + " " + this.texts.join("\n ");
        };
        ButtonsCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("複数のボタンを表示するコマンドです。\n表示したいボタンを一行に一つの書式で、好きな数だけ指定出来ます。");
            p.isPlain = true;
            return p;
        };
        return ButtonsCommand;
    })(adventure.Command);
    adventure.ButtonsCommand = ButtonsCommand;    
    var DeleteButtonsCommand = (function (_super) {
        __extends(DeleteButtonsCommand, _super);
        function DeleteButtonsCommand(manager) {
                _super.call(this, manager, "deleteButtons");
        }
        DeleteButtonsCommand.prototype.execute = function () {
            this.manager.scene.deleteLayer("buttons");
            this.manager.scene.root.updated();
            this.finished.fire();
        };
        DeleteButtonsCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("buttonsコマンドで表示したボタンを削除するコマンドです。");
            return p;
        };
        return DeleteButtonsCommand;
    })(adventure.Command);
    adventure.DeleteButtonsCommand = DeleteButtonsCommand;    
    var SelectableCommand = (function (_super) {
        __extends(SelectableCommand, _super);
        function SelectableCommand(manager) {
                _super.call(this, manager, "selectable");
            this.selectable = new Array();
        }
        SelectableCommand.prototype.execute = function () {
            for(var i = 0; i < this.selectable.length; i++) {
                var id = this.selectable[i];
                var obj = this.manager.get(id);
                if(!obj) {
                    continue;
                }
                this.manager.selectables[id] = obj;
            }
            this.finished.fire();
        };
        SelectableCommand.prototype.add = function (line, tab) {
            this.selectable.push(line);
        };
        SelectableCommand.prototype.toString = function (prefix) {
            return this.name + "\n" + " " + this.selectable.join("\n ");
        };
        SelectableCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("画面内のオブジェクトを選択可能にします。\n選択可能にするオブジェクトのIDを一行に一つの書式で、好きな数だけ指定出来ます。");
            p.isPlain = true;
            return p;
        };
        return SelectableCommand;
    })(adventure.Command);
    adventure.SelectableCommand = SelectableCommand;    
    var ClearSelectableCommand = (function (_super) {
        __extends(ClearSelectableCommand, _super);
        function ClearSelectableCommand(manager) {
                _super.call(this, manager, "clearSelectable");
        }
        ClearSelectableCommand.prototype.execute = function () {
            this.manager.selectables = {
            };
            this.finished.fire();
        };
        ClearSelectableCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("selectableコマンドで選択可能にしたオブジェクトの選択状態をすべて解除します。");
            return p;
        };
        return ClearSelectableCommand;
    })(adventure.Command);
    adventure.ClearSelectableCommand = ClearSelectableCommand;    
})(adventure || (adventure = {}));
var adventure;
(function (adventure) {
    var Compiler = (function () {
        function Compiler() { }
        Compiler.getResources = function getResources(commands) {
            var tmp = {
            };
            for(var i = 0; i < commands.length; i++) {
                var c = commands[i];
                switch(c.name) {
                    case "add":
                        if((c).file) {
                            tmp[(c).file] = 1;
                        }
                        break;
                    case "bg":
                        if((c).file) {
                            tmp[(c).file] = 1;
                        }
                        break;
                    case "image":
                        if((c).file) {
                            tmp[(c).file] = 1;
                        }
                        break;
                    case "effect":
                        var effect = (c);
                        if(effect.image && effect.image.charAt(0) != "!") {
                            tmp[effect.image] = 1;
                        }
                        break;
                    case "scene":
                        var scene = c;
                        var sceneResources = Compiler.getResources(scene.init);
                        for(var j = 0; j < sceneResources.length; j++) {
                            tmp[sceneResources[j]] = 1;
                        }
                        if(scene.image && scene.image.charAt(0) != "!") {
                            tmp[scene.image] = 1;
                        }
                        break;
                    case "if":
                        var ifResources = Compiler.getResources((c).yes);
                        ifResources = ifResources.concat(Compiler.getResources((c).no));
                        for(var j = 0; j < ifResources.length; j++) {
                            tmp[ifResources[j]] = 1;
                        }
                        break;
                }
            }
            var ret = [];
            for(var p in tmp) {
                ret.push(p);
            }
            return ret;
        };
        Compiler.createCommand = function createCommand(line, manager) {
            var clsName = line.substr(0, 1).toUpperCase() + line.substr(1) + "Command";
            return new adventure[clsName](manager);
        };
        Compiler.compileCommand = function compileCommand(lines, manager) {
            var command;
            command = Compiler.createCommand(lines[0], manager);
            for(var i = 1; i < lines.length; i++) {
                var line = lines[i];
                var tab = adventure.Util.getTabCount(line);
                command.add(line.substr(tab), tab);
            }
            return command;
        };
        Compiler.getCommandStrings = function getCommandStrings(lines) {
            var cmdStr = [];
            var ret = [];
            for(var i = 0, len = lines.length; i < len; i++) {
                var line = lines[i];
                if(line.length == 0) {
                    continue;
                }
                var tab = adventure.Util.getTabCount(line);
                if(tab == -1) {
                    continue;
                }
                if(tab == 0) {
                    if(cmdStr.length > 0) {
                        ret.push(cmdStr);
                        cmdStr = [];
                    }
                }
                cmdStr.push(line);
            }
            if(cmdStr.length > 0) {
                ret.push(cmdStr);
            }
            return ret;
        };
        Compiler.compileCommands = function compileCommands(lines, manager) {
            var commands = [];
            var cmdStrings = Compiler.getCommandStrings(lines);
            for(var i = 0; i < cmdStrings.length; i++) {
                commands.push(Compiler.compileCommand(cmdStrings[i], manager));
            }
            return commands;
        };
        return Compiler;
    })();
    adventure.Compiler = Compiler;    
})(adventure || (adventure = {}));
var adventure;
(function (adventure) {
    var EffectCommand = (function (_super) {
        __extends(EffectCommand, _super);
        function EffectCommand(manager) {
                _super.call(this, manager, "effect");
            this.show = true;
        }
        EffectCommand.prototype.doEffect = function () {
            var _this = this;
            var time = this.time === undefined ? 500 : this.time;
            var type = this.type === undefined ? "universal" : this.type;
            var finish = function () {
                _this.finished.fire();
            };
            var easing = undefined;
            if(this.easing && jg.Easing[this.easing]) {
                easing = jg.Easing[this.easing];
            }
            if(!this.target) {
            }
            switch(type) {
                case "fade":
                    if(this.show) {
                        this.target.hide();
                        this.target.tl().fadeIn(time, easing).then(finish);
                    } else {
                        this.target.show();
                        this.target.tl().fadeOut(time, easing).then(finish);
                    }
                    break;
                case "universal":
                    if(this.show) {
                        this.target.hide();
                    }
                    var amount = this.show ? {
                        start: 255,
                        end: -255
                    } : {
                        start: -255,
                        end: 255
                    };
                    var opt = {
                        image: this.manager.game.r(this.image),
                        repeat: this.repeat ? true : false,
                        amount: amount
                    };
                    if(this.mask1 && this.mask2) {
                        opt.mask1 = this.mask1;
                        opt.mask2 = this.mask2;
                        opt.maskDraw = this.maskDraw;
                    }
                    this.target.tl().then(function () {
                        _this.target.show();
                    }).and().filter(jg.ImageFilter.UniversalTransitionFilter, opt, time, easing).then(function () {
                        if(!_this.show) {
                            _this.target.hide();
                        }
                        finish();
                    });
                    break;
                case "universal-r":
                    if(this.show) {
                        this.target.hide();
                    }
                    var amount = this.show ? {
                        start: 255,
                        end: -255
                    } : {
                        start: -255,
                        end: 255
                    };
                    var opt = {
                        image: this.manager.game.r(this.image),
                        repeat: this.repeat ? true : false,
                        amount: amount
                    };
                    if(this.mask1 && this.mask2) {
                        opt.mask1 = this.mask1;
                        opt.mask2 = this.mask2;
                    }
                    this.target.tl().then(function () {
                        _this.target.show();
                    }).and().filter(jg.ImageFilter.ReverseUniversalTransitionFilter, opt, time, easing).then(function () {
                        if(!_this.show) {
                            _this.target.hide();
                        }
                        finish();
                    });
                    break;
            }
        };
        EffectCommand.prototype.clone = function () {
            var ret = new EffectCommand(this.manager);
            ret.time = this.time;
            ret.image = this.image;
            ret.type = this.type;
            ret.repeat = this.repeat;
            ret.easing = this.easing;
            ret.mask1 = this.mask1;
            ret.mask2 = this.mask2;
            ret.maskDraw = this.maskDraw;
            return ret;
        };
        EffectCommand.prototype.cloneReverse = function () {
            var r = this.clone();
            if(r.type == "universal") {
                r.type = "universal-r";
            }
            return r;
        };
        EffectCommand.prototype.toString = function (prefix) {
            return this.toStringCommon(prefix, "target", "show", "mask1", "mask2", "maskDraw");
        };
        EffectCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("ゲーム中に利用するエフェクトを定義するコマンドです。");
            p.add("id", "string", "このエフェクトの識別IDを定義します。", true);
            p.add("type", "string", "このエフェクトの種別を定義します。", true, [
                "fade", 
                "universal", 
                "universal-r"
            ]);
            p.add("image", "image", "このエフェクトで利用する画像を定義します。\ntypeがuniversalの場合は必須です。", false, "image");
            p.add("repeat", "string", "このエフェクトは画像を繰り返し利用するタイプのものであれば1を指定します。", false, [
                "", 
                "1"
            ]);
            p.add("easing", "string", "このエフェクトで利用するEasingを指定します。", false, adventure.Util.getEasingProps());
            return p;
        };
        return EffectCommand;
    })(adventure.Command);
    adventure.EffectCommand = EffectCommand;    
})(adventure || (adventure = {}));
var adventure;
(function (adventure) {
    var Flowchart = (function () {
        function Flowchart(manager) {
            this.manager = manager;
            this.nodes = new Array();
        }
        Flowchart.prototype.getRoute = function (index, first) {
            if(first === undefined) {
                first = 0;
            }
            if(this.nodes[0].prev === undefined) {
                this.createPrevInfo();
            }
            var routes = [];
            routes.push([]);
            routes[0].push(index);
            var nodeLength = this.nodes.length;
            while(routes.length && routes.length < nodeLength) {
                for(var i = 0; i < routes.length; i++) {
                    var route = routes[i];
                    var lastRoute = route[route.length - 1];
                    if(lastRoute == first) {
                        return route;
                    }
                    var node = this.nodes[lastRoute];
                    if(node.prev.length == 0) {
                        if(routes.length == 1) {
                            return route;
                        }
                        routes.splice(i--, 1);
                        continue;
                    }
                    for(var j = 1; j < node.prev.length; j++) {
                        var newRoute = route.slice(0);
                        newRoute.push(node.prev[j]);
                        routes.unshift(newRoute);
                        i++;
                    }
                    route.push(node.prev[0]);
                }
            }
            return null;
        };
        Flowchart.prototype.getJumpTo = function (cmd, d) {
            if(cmd.command !== undefined) {
                return cmd.command;
            } else if(cmd.scene !== undefined) {
                return this.manager.scenes[cmd.scene];
            } else if(cmd.label !== undefined) {
                return this.manager.labels[cmd.label];
            }
            return d;
        };
        Flowchart.prototype.getSubCommandTo = function (cmds, d) {
            for(var i = 0; i < cmds.length; i++) {
                var cmd = cmds[i];
                switch(cmd.name) {
                    case "jump":
                    case "call":
                        return this.getJumpTo(cmd, d);
                        break;
                    case "return":
                        break;
                }
            }
            return d;
        };
        Flowchart.prototype.createPrevInfo = function () {
            for(var i = 0; i < this.nodes.length; i++) {
                var node = this.nodes[i];
                node.prev = new Array();
                for(var j = 0; j < this.nodes.length; j++) {
                    for(var k = 0; k < this.nodes[j].route.length; k++) {
                        if(this.nodes[j].route[k].next == i) {
                            node.prev.push(j);
                        }
                    }
                }
            }
        };
        Flowchart.prototype.generate = function () {
            var cmds = this.manager.commands;
            for(var i = 0; i < cmds.length; i++) {
                var cmd = cmds[i];
                var node = new FlowNode(i);
                switch(cmd.name) {
                    case "message":
                        node.caption = cmd["message"].substr(0, 10);
                        break;
                    case "label":
                    case "scene":
                        node.caption = cmd["id"] ? cmd["id"] : cmd.name;
                        break;
                    case "call":
                        node.caption = "(";
                        if(cmd["command"] !== undefined) {
                            node.caption += "c:" + cmd["command"];
                        } else if(cmd["scene"]) {
                            node.caption += "s:" + cmd["scene"];
                        } else {
                            node.caption += cmd["label"];
                        }
                        node.caption += ")";
                        break;
                    default:
                        node.caption = cmd.name;
                }
                switch(cmd.name) {
                    case "if":
                        var ifCmd = cmd;
                        var yes = this.getSubCommandTo(ifCmd.yes, i + 1);
                        var no = this.getSubCommandTo(ifCmd.no, i + 1);
                        if(yes == no) {
                            node.add(yes);
                        } else {
                            node.add(yes, ifCmd.exp + "==yes");
                            node.add(no, ifCmd.exp + "==no");
                        }
                        break;
                    case "jump":
                        node.add(this.getJumpTo(cmd, i + 1));
                        break;
                    case "call":
                        node.add(i + 1);
                        break;
                    case "return":
                        break;
                    case "exit":
                        break;
                    default:
                        node.add(i + 1);
                        break;
                }
                this.nodes.push(node);
            }
        };
        return Flowchart;
    })();
    adventure.Flowchart = Flowchart;    
    var FlowNode = (function () {
        function FlowNode(index, caption, next) {
            this.index = index;
            this.route = new Array();
            if(next !== undefined) {
                this.add(next);
            }
        }
        FlowNode.prototype.add = function (next, reason) {
            this.route.push({
                next: next,
                reason: reason
            });
        };
        FlowNode.prototype.toString = function () {
            var ret = this.caption ? this.caption : this.index.toString();
            for(var i = 0; i < this.route.length; i++) {
                var r = this.route[i];
                ret += "\n --" + (r.reason ? "[" + r.reason + "]" : "") + "--" + r.next;
            }
            return ret;
        };
        return FlowNode;
    })();
    adventure.FlowNode = FlowNode;    
})(adventure || (adventure = {}));
var adventure;
(function (adventure) {
    var IfCommand = (function (_super) {
        __extends(IfCommand, _super);
        function IfCommand(manager) {
                _super.call(this, manager, "if");
            this.yes = new Array();
            this.no = new Array();
        }
        IfCommand.prototype.execute = function () {
            var _this = this;
            var exp = adventure.Util.analysisVarLine(this.exp);
            var result = eval(exp);
            var target = result ? "yes" : "no";
            if(this[target].length == 0) {
                this.finished.fire();
                return;
            }
            var finishCount = 0;
            var finished = function () {
                finishCount++;
                if(finishCount == _this[target].length) {
                    _this.finished.fire();
                }
            };
            for(var i = 0; i < this[target].length; i++) {
                this[target][i].manager = this.manager;
                this[target][i].finished.handle(this, finished);
                this[target][i].execute();
            }
        };
        IfCommand.prototype.add = function (line, tab) {
            if(tab > 2) {
                var index = this[this._target].length - 1;
                this[this._target][index].add(line, tab - 2);
            } else if(tab == 2) {
                var command = adventure.Compiler.createCommand(line);
                command.parent = this;
                this[this._target].push(command);
            } else {
                if(line == "yes") {
                    this._target = "yes";
                } else if(line == "no") {
                    this._target = "no";
                } else {
                    delete this._target;
                    _super.prototype.add.call(this, line, tab);
                }
            }
        };
        IfCommand.prototype.toString = function (prefix) {
            var tmp = this.toStringCommon(prefix, "_target", "yes", "no");
            if(this.yes.length) {
                tmp += "\n yes\n";
                var yess = [];
                for(var i = 0; i < this.yes.length; i++) {
                    yess.push(this.yes[i].toString("  "));
                }
                tmp += "  " + yess.join("\n  ");
            }
            if(this.no.length) {
                tmp += "\n no\n";
                var nos = [];
                for(var i = 0; i < this.no.length; i++) {
                    nos.push(this.no[i].toString("  "));
                }
                tmp += "  " + nos.join("\n  ");
            }
            return tmp;
        };
        IfCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("条件分岐を行うコマンドです。");
            p.add("exp", "string", "条件式を指定します。", true);
            p.add("yes", "commands", "条件式が真の場合に実行されるコマンド群を指定します。");
            p.add("no", "commands", "条件式が偽の場合に実行されるコマンド群を指定します。");
            return p;
        };
        return IfCommand;
    })(adventure.Command);
    adventure.IfCommand = IfCommand;    
})(adventure || (adventure = {}));
var adventure;
(function (adventure) {
    var InputWaitCommand = (function (_super) {
        __extends(InputWaitCommand, _super);
        function InputWaitCommand(manager) {
                _super.call(this, manager, "inputWait");
        }
        InputWaitCommand.prototype.execute = function () {
            delete this.manager.vars["select"];
            this.manager.scene.messageLayer.disablePointingEvent();
            this.manager.game.update.handle(this, this.update);
            if(this.manager.config.autoFocus) {
                this.focusManager = new jgui.FocusManager(this.manager.game);
                this.focusManager.selected.handle(this, this.onFocusSelect);
            }
            var btnLayer = this.manager.scene.layers["buttons"];
            if(btnLayer) {
                btnLayer.enablePointingEvent();
                for(var i = 0; i < btnLayer.entities.length; i++) {
                    (btnLayer.entities[i]).click.handle(this, this.onButtonClicked);
                }
                if(this.focusManager) {
                    this.focusManager.addEntity.apply(this.focusManager, btnLayer.entities);
                }
            }
            var hasSelectable = false;
            for(var i in this.manager.selectables) {
                hasSelectable = true;
                this.attachSelectable(this.manager.selectables[i]);
                if(this.focusManager) {
                    this.focusManager.addEntity(this.manager.selectables[i]);
                }
            }
            if(hasSelectable) {
                this.manager.scene.charaLayer.enablePointingEvent();
            }
            if(this.focusManager) {
                this.focusManager.start(btnLayer ? btnLayer : this.manager.scene.charaLayer);
            }
        };
        InputWaitCommand.prototype.attachSelectable = function (obj) {
            obj.enablePointingEvent();
            obj.pointUp.handle(this, this.onSelect);
        };
        InputWaitCommand.prototype.detachSelectable = function (obj) {
            obj.disablePointingEvent();
            obj.pointUp.remove(this, this.onSelect);
        };
        InputWaitCommand.prototype.onSelect = function (e) {
            if(!e.entity.hitTest(e.point)) {
                return;
            }
            if(e.entity["id"]) {
                this.manager.vars["select"] = e.entity["id"];
            }
        };
        InputWaitCommand.prototype.onFocusSelect = function (e) {
            if(e["id"]) {
                this.manager.vars["select"] = e["id"];
            }
        };
        InputWaitCommand.prototype.update = function (t) {
            if(this.manager.vars["select"]) {
                var btnLayer = this.manager.scene.layers["buttons"];
                if(btnLayer) {
                    for(var i = 0; i < btnLayer.entities.length; i++) {
                        if(btnLayer.entities[i]["click"]) {
                            (btnLayer.entities[i]).click.remove(this, this.onButtonClicked);
                        }
                    }
                    btnLayer.disablePointingEvent();
                }
                for(var i in this.manager.selectables) {
                    this.detachSelectable(this.manager.selectables[i]);
                }
                if(this.focusManager) {
                    this.focusManager.end();
                }
                this.manager.scene.charaLayer.disablePointingEvent();
                this.manager.scene.messageLayer.enablePointingEvent();
                this.manager.scene.charaLayer.updated();
                this.manager.game.update.remove(this, this.update);
                this.finished.fire();
            }
        };
        InputWaitCommand.prototype.onButtonClicked = function (e) {
            this.manager.vars["select"] = e.getText();
        };
        InputWaitCommand.prototype.toString = function (prefix) {
            return this.toStringCommon(prefix, "focusManager");
        };
        InputWaitCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("ユーザ入力があるまで待機するコマンドです。");
            return p;
        };
        return InputWaitCommand;
    })(adventure.Command);
    adventure.InputWaitCommand = InputWaitCommand;    
})(adventure || (adventure = {}));
var adventure;
(function (adventure) {
    var Manager = (function () {
        function Manager(script) {
            this.init(script);
        }
        Manager.prototype.append = function (id, e) {
            if(id == "message" || id == "bg") {
                throw "invalid id";
            }
            this.objects[id] = e;
            e["id"] = id;
            this.scene.charaLayer.append(e);
        };
        Manager.prototype.remove = function (id) {
            switch(id) {
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
        };
        Manager.prototype.get = function (id) {
            switch(id) {
                case "message":
                    return this.messageWindow;
                case "bg":
                    return this.scene.bgLayer.entities[0];
            }
            return this.objects[id];
        };
        Manager.prototype.createBasicEffects = function () {
            this.effects["fade"] = new adventure.EffectCommand(this);
            this.effects["fade"].type = "fade";
            var universals = [
                "vstripe", 
                "hstripe", 
                "dissolve"
            ];
            for(var i = 0; i < universals.length; i++) {
                this.effects[universals[i]] = new adventure.EffectCommand(this);
                this.effects[universals[i]].repeat = "repeat";
            }
            this.effects["vstripe"].image = "!vstripe";
            this.effects["hstripe"].image = "!hstripe";
            this.effects["dissolve"].image = "!dissolve";
        };
        Manager.prototype.updateManagerByCommand = function (command, commandIndex) {
            command.manager = this;
            switch(command.name) {
                case "effect":
                    var effectCommand = command;
                    if(effectCommand.id && !this.effects[effectCommand.id]) {
                        this.effects[effectCommand.id] = effectCommand;
                    }
                    break;
                case "scene":
                    var sceneCommand = command;
                    if(sceneCommand.id && !this.scenes[sceneCommand.id]) {
                        this.scenes[sceneCommand.id] = commandIndex;
                    }
                    break;
                case "label":
                    var labelCommand = command;
                    if(labelCommand.id && !this.labels[labelCommand.id]) {
                        this.labels[labelCommand.id] = commandIndex;
                    }
                    break;
                case "game":
                    this.gameCommand = command;
                    break;
                case "config":
                    this.config = command;
                    break;
            }
        };
        Manager.prototype.init = function (script) {
            if(typeof script == "string") {
            } else {
                script = script.join("\n");
            }
            var lines = script.split(/\r\n|\r|\n/g);
            this.effects = {
            };
            this.createBasicEffects();
            this.labels = {
            };
            this.scenes = {
            };
            this.selectables = {
            };
            this.resources = new Array();
            this.gameCommand = null;
            this.config = null;
            var commands = adventure.Compiler.compileCommands(lines);
            for(var i = 0, len = commands.length; i < len; i++) {
                this.updateManagerByCommand(commands[i], i);
            }
            if(!this.gameCommand) {
                this.gameCommand = new adventure.GameCommand(this);
            }
            if(!this.config) {
                this.config = new adventure.ConfigCommand(this);
            }
            this.commands = commands;
            this.addResourcesByCommands(this.commands);
        };
        Manager.prototype.addResource = function (file) {
            if(this.resources.indexOf(file) >= 0) {
                return;
            }
            this.resources.push(file);
        };
        Manager.prototype.addResourcesByCommands = function (commands) {
            var ret = adventure.Compiler.getResources(commands);
            for(var i = 0; i < ret.length; i++) {
                this.addResource(ret[i]);
            }
            this.resources.sort();
        };
        Manager.prototype.start = function (gameClass, container) {
            if(gameClass) {
                this.game = new gameClass(this.gameCommand.width, this.gameCommand.height, container);
            } else {
                this.game = new jg.Game(this.gameCommand.width, this.gameCommand.height, container);
            }
            this.stack = new Array();
            this.vars = {
            };
            var scene = new adventure.BasicScene(this.game);
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
            this.game.resource.images["!vstripe"] = adventure.Util.createVStripeImage();
            this.game.resource.images["!hstripe"] = adventure.Util.createHStripeImage();
            this.game.resource.images["!dissolve"] = adventure.Util.createDissolveImage();
            if(this.resources.length == 0) {
                this.nextCommand();
            } else {
                this.game.preload(this.resources);
                this.game.loaded.handle(this, this.nextCommand);
            }
        };
        Manager.prototype.update = function (t) {
            if(this.isNext) {
                this.isNext = false;
                if(this.index >= this.commands.length) {
                    this.game.exit();
                    return;
                }
                this.command = this.commands[this.index++];
                this.command.finished.handle(this, this.oncommandfinish);
                this.command.execute();
            }
        };
        Manager.prototype.nextCommand = function () {
            this.isNext = true;
        };
        Manager.prototype.oncommandfinish = function () {
            this.command.finished.remove(this, this.oncommandfinish);
            this.nextCommand();
        };
        Manager.prototype.changeScene = function (scene) {
            this.messageWindow = scene.messageWindow;
            this.objects = {
            };
            this.scene = scene;
        };
        return Manager;
    })();
    adventure.Manager = Manager;    
})(adventure || (adventure = {}));
var adventure;
(function (adventure) {
    var MessageCommand = (function (_super) {
        __extends(MessageCommand, _super);
        function MessageCommand(manager) {
                _super.call(this, manager, "message");
            this.message = "";
        }
        MessageCommand.prototype.execute = function () {
            delete this.offset;
            this._message = this.analysis(this.message.substr(0, this.message.length - 1));
            this.manager.game.keyDown.handle(this, this.keyDown);
            this.manager.game.pointDown.handle(this, this.pointDown);
            this.manager.game.keyUp.handle(this, this.keyUp);
            this.manager.messageWindow.readed.handle(this, this.readed);
            this.nextText();
        };
        MessageCommand.prototype.analysis = function (message) {
            var index = 0;
            var ret = "";
            do {
                var index2 = message.indexOf("{$", index);
                if(index2 < 0) {
                    ret += message.substr(index);
                    break;
                }
                ret += message.substring(index, index2);
                index = message.indexOf("}", index2);
                if(index < 0) {
                    ret += message.substr(index2);
                    break;
                }
                ret += this.manager.vars[message.substring(index2 + 2, index)];
                index++;
            }while(index >= 0);
            return ret;
        };
        MessageCommand.prototype.readed = function (hasNext) {
        };
        MessageCommand.prototype.keyDown = function (e) {
            if(e.param.keyCode == 17) {
                this.manager.messageWindow.fastMode();
            } else {
                if(this.manager.messageWindow.isReaded) {
                    this.nextText();
                }
            }
        };
        MessageCommand.prototype.keyUp = function (e) {
            if(e.param.keyCode == 17) {
                this.manager.messageWindow.normalMode();
            }
        };
        MessageCommand.prototype.pointDown = function (e) {
            if(this.manager.messageWindow.isReaded) {
                this.nextText();
            }
        };
        MessageCommand.prototype.add = function (line, tab) {
            this.message += this.restoreSpace(tab) + line + "\n";
        };
        MessageCommand.prototype.restoreSpace = function (tab) {
            if(tab < 2) {
                return "";
            }
            var ret = "";
            for(var i = 1; i < tab; i++) {
                ret += " ";
            }
            return ret;
        };
        MessageCommand.prototype.nextText = function () {
            var _this = this;
            var w = this.manager.messageWindow;
            if(this.offset === undefined) {
                w.show(true);
                this.offset = w.setScript(this._message);
            } else if(this.offset == -1) {
                if(this.manager.config.messageAutoHide) {
                    w.tl().fadeOut(200).then(function () {
                        _this.finish();
                    });
                } else {
                    this.finish();
                }
                return;
            } else {
                w.oldWipeOut();
                this.offset = w.setScript(this._message, this.offset);
            }
            w.showText();
        };
        MessageCommand.prototype.finish = function () {
            this.manager.game.keyDown.remove(this, this.keyDown);
            this.manager.game.pointDown.remove(this, this.pointDown);
            this.manager.game.keyUp.remove(this, this.keyUp);
            this.manager.messageWindow.readed.remove(this, this.readed);
            this.finished.fire();
        };
        MessageCommand.prototype.toString = function (prefix) {
            return this.name + "\n" + " " + this.message.substr(0, this.message.length - 1).split(/\n/g).join("\n ");
        };
        MessageCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("���b�Z�[�W���\�����������{�I�ȃR�}���h�ł��B");
            p.isPlain = true;
            return p;
        };
        return MessageCommand;
    })(adventure.Command);
    adventure.MessageCommand = MessageCommand;    
})(adventure || (adventure = {}));
var adventure;
(function (adventure) {
    var PreviewGame = (function (_super) {
        __extends(PreviewGame, _super);
        function PreviewGame() {
            _super.apply(this, arguments);

        }
        PreviewGame.prototype.set = function (flowchart) {
            this.manager = flowchart.manager;
            this.flowchart = flowchart;
        };
        PreviewGame.prototype.doCommand = function () {
            this.command = this.commands.shift();
            switch(this.command.name) {
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
        };
        PreviewGame.prototype.oncommandfinish = function () {
            this.isNext = true;
        };
        PreviewGame.prototype.run = function () {
            var _this = this;
            var _main = function (t) {
                if(_this.isNext) {
                    if(_this.commands.length > 0) {
                        _this.doCommand();
                    } else {
                        _this.end();
                    }
                } else {
                    switch(_this.command.name) {
                        case "message":
                            _this.pointDown.fire(new jg.InputPointEvent(jg.InputEventAction.Down, null, {
                                x: 0,
                                y: 0
                            }));
                            break;
                    }
                    if(_this.commands.length == 0) {
                        if(_this.tick > (t + 10000) || (_this.tick + 10000) < t) {
                            _this.tick = t - 1;
                            _this.refresh();
                        }
                        var time = t - _this.tick;
                        _this.manualUpdate(time);
                        _this.manualRender();
                    } else {
                        _this.manualUpdate(5000);
                    }
                }
                _this.tick = t;
                if(!_this._exit) {
                    window.requestAnimationFrame(_main);
                }
            };
            this.isNext = true;
            this._exit = false;
            this.manager.isNext = false;
            window.requestAnimationFrame(_main);
        };
        PreviewGame.prototype.preview = function (commands) {
            this.loaded.destroy();
            this.commands = commands;
            if(this.resource.requests.length > 0) {
                this.loaded.handle(this, this.onloaded);
            } else {
                this.onloaded();
            }
        };
        PreviewGame.prototype.next = function (commands) {
            this.commands = this.commands.concat(commands);
            if(this._exit) {
                this.run();
            }
            return true;
        };
        PreviewGame.prototype.nextTo = function (index) {
            index = Number(index);
            var commands = [];
            var routes = this.flowchart.getRoute(index, this.index);
            if(routes == null) {
                return false;
            }
            this.index = index;
            routes.pop();
            while(routes.length) {
                commands.push(this.manager.commands[routes.pop()]);
            }
            return this.next(commands);
        };
        PreviewGame.prototype.previewTo = function (index, start, beforeCommands, afterCommands) {
            index = Number(index);
            var routes = this.flowchart.getRoute(index, start);
            var commands = [];
            this.index = index;
            if(beforeCommands) {
                for(var i = 0; i < beforeCommands.length; i++) {
                    commands.push(beforeCommands[i]);
                }
            }
            while(routes.length) {
                commands.push(this.manager.commands[routes.pop()]);
            }
            if(afterCommands) {
                for(var i = 0; i < afterCommands.length; i++) {
                    commands.push(afterCommands[i]);
                }
            }
            return this.preview(commands);
        };
        PreviewGame.prototype.onloaded = function () {
            this.run();
        };
        return PreviewGame;
    })(jgengine.StaticGame);
    // なんか動かなかったので、似たようなやつに変えてみた
    //})(jgengine.ManualGame);
    adventure.PreviewGame = PreviewGame;    
})(adventure || (adventure = {}));
var adventure;
(function (adventure) {
    var PropertySet = (function () {
        function PropertySet(comment) {
            this.properties = [];
            this.comment = comment;
        }
        PropertySet.prototype.add = function (name, type, comment, must, values) {
            this.properties.push({
                name: name,
                type: type,
                comment: comment,
                must: must,
                values: values
            });
        };
        PropertySet.prototype.isNumber = function (name) {
            for(var i = 0; i < this.properties.length; i++) {
                if(this.properties[i].name == name) {
                    return this.properties[i].type == "number";
                }
            }
            return false;
        };
        return PropertySet;
    })();
    adventure.PropertySet = PropertySet;    
    var PropertyUtil = (function () {
        function PropertyUtil() { }
        PropertyUtil.properties = {
        };
        PropertyUtil.getProperties = function getProperties(command) {
            if(!PropertyUtil.properties[command.name]) {
                PropertyUtil.properties[command.name] = command.getProperties();
            }
            return PropertyUtil.properties[command.name];
        };
        PropertyUtil.isNumber = function isNumber(command, name) {
            return PropertyUtil.getProperties(command).isNumber(name);
        };
        return PropertyUtil;
    })();
    adventure.PropertyUtil = PropertyUtil;    
})(adventure || (adventure = {}));
var adventure;
(function (adventure) {
    var SceneCommand = (function (_super) {
        __extends(SceneCommand, _super);
        function SceneCommand(manager) {
                _super.call(this, manager, "scene");
            this.init = new Array();
        }
        SceneCommand.prototype.getAngle = function () {
            switch(this.angle) {
                case "up":
                    return jg.Angle.Up;
                case "down":
                    return jg.Angle.Down;
                case "left":
                    return jg.Angle.Left;
                case "right":
                    return jg.Angle.Right;
            }
            return undefined;
        };
        SceneCommand.prototype.execute = function () {
            var _this = this;
            if(this.windowWidth === undefined) {
                this.windowWidth = this.manager.config.windowWidth;
            }
            if(this.windowHeight === undefined) {
                this.windowHeight = this.manager.config.windowHeight;
            }
            if(this.windowX === undefined) {
                this.windowX = this.manager.config.windowX;
            }
            if(this.windowY === undefined) {
                this.windowY = this.manager.config.windowY;
            }
            var scene = new adventure.BasicScene(this.manager.game);
            scene.init({
                width: this.windowWidth,
                height: this.windowHeight
            }, {
                x: this.windowX,
                y: this.manager.config.windowY
            });
            scene.enablePointingEvent();
            this.manager.changeScene(scene);
            var showScene = function () {
                scene.started.handle(_this, function () {
                    _this.finished.fire();
                });
                if(_this.effect) {
                    var effect = new jg.Effect(_this.effect);
                    jg.Effect.time = _this.time ? _this.time : 1000;
                    switch(effect.method) {
                        case "mosaic":
                        case "blur":
                            break;
                        case "slide":
                        case "wipe":
                        case "wipeFade":
                            effect.arguments = [
                                _this.getAngle()
                            ];
                            break;
                        case "boxOut":
                        case "boxIn":
                            effect.arguments = [
                                _this.rotate, 
                                _this.color
                            ];
                            break;
                        case "arcOut":
                        case "arcIn":
                        case "fade":
                            effect.arguments = [
                                _this.color
                            ];
                            break;
                        case "universal":
                        case "universalTwin":
                            effect.arguments = [
                                _this.manager.game.r(_this.image), 
                                _this.repeat ? true : false
                            ];
                            break;
                        case "universalDelay":
                            effect.arguments = [
                                _this.manager.game.r(_this.image), 
                                _this.repeat ? true : false, 
                                _this.color
                            ];
                            break;
                    }
                    _this.manager.game.changeScene(scene, effect);
                } else {
                    _this.manager.game.changeScene(scene);
                }
            };
            var finishCount = 0;
            var commandFinished = function () {
                finishCount++;
                if(finishCount == _this.init.length) {
                    showScene();
                }
            };
            for(var i = 0; i < this.init.length; i++) {
                this.init[i].manager = this.manager;
                this.init[i].finished.handle(this, commandFinished);
                this.init[i].execute();
            }
            if(this.init.length == 0) {
                showScene();
            }
        };
        SceneCommand.prototype.add = function (line, tab) {
            if(tab > 2) {
                this.init[this.init.length - 1].add(line, tab - 1);
            } else if(tab == 2) {
                var kv = this.getKeyValue(line);
                var command = adventure.Compiler.createCommand(kv.value);
                command.parent = this;
                this.init.push(command);
            } else {
                var kv = this.getKeyValue(line);
                if(kv.key) {
                    if(adventure.PropertyUtil.isNumber(this, kv.key)) {
                        this.setProp(kv, true);
                        return;
                    }
                    this.setProp(kv);
                }
            }
        };
        SceneCommand.prototype.getProperties = function () {
            var p = new adventure.PropertySet("シーンを定義するコマンドです。\nシーン開始時に実行するコマンドをまとめて定義することも出来ます。");
            p.add("id", "string", "このシーンの識別IDを定義します。必須ではありませんが、出来る限り指定することを推奨します。");
            p.add("effect", "string", "このシーンの表示に利用するエフェクトを指定します。", false, [
                "", 
                "mosaic", 
                "blur", 
                "slide", 
                "fade", 
                "wipe", 
                "wipeFade", 
                "boxOut", 
                "boxIn", 
                "arcOut", 
                "arcIn", 
                "universal", 
                "universalTwin", 
                "universalDelay"
            ]);
            p.add("image", "image", "effectがuniversal、universalTwin、universalDelayの場合に利用する画像ファイルを指定します。", false, "image");
            p.add("repeat", "string", "effectがuniversal、universalTwin、universalDelayの場合に、エフェクト画像が繰り返し使われる場合に1を指定します。", false, [
                "", 
                "1"
            ]);
            p.add("angle", "string", "effectがslide、wipe、wipeFadeの場合に、left、right、up、downのいずれかの値で方向を指定出来ます。", false, [
                "", 
                "up", 
                "down", 
                "left", 
                "right"
            ]);
            p.add("rotate", "number", "effectがboxOut、boxInの場合に、マスク画像に対する回転角度を指定出来ます。");
            p.add("color", "color", "effectがboxOut、boxIn、arcOut、arcIn、fade、universalDelayの場合に色を指定することが出来ます。");
            p.add("time", "number", "エフェクトにかける時間を指定します。");
            p.add("windowWidth", "number", "このシーンでのメッセージウィンドウ表示横幅を指定します。");
            p.add("windowHeight", "number", "このシーンでのメッセージウィンドウ表示縦幅を指定します。");
            p.add("windowX", "number", "このシーンでのメッセージウィンドウ表示横位置を指定します。");
            p.add("windowY", "number", "このシーンでのメッセージウィンドウ表示縦位置を指定します。");
            p.add("init", "commands", "初期化時に実行するコマンド群を指定します。");
            return p;
        };
        SceneCommand.prototype.toString = function (prefix) {
            var tmp = this.toStringCommon("", "init");
            if(this.init.length) {
                tmp += "\n init\n";
                var inits = [];
                for(var i = 0; i < this.init.length; i++) {
                    inits.push(this.init[i].toString("  "));
                }
                tmp += "  " + inits.join("\n  ");
            }
            return tmp;
        };
        return SceneCommand;
    })(adventure.Command);
    adventure.SceneCommand = SceneCommand;    
})(adventure || (adventure = {}));
var adventure;
(function (adventure) {
    var ScriptLoader = (function () {
        function ScriptLoader() {
            this.loaded = new jg.Trigger();
            this.scripts = new Array();
            this.loadedCount = 0;
        }
        ScriptLoader.prototype.load = function () {
            var scripts = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                scripts[_i] = arguments[_i + 0];
            }
            var indexOffset = this.scripts.length;
            for(var i = 0; i < scripts.length; i++) {
                this._load(indexOffset + i, scripts[i]);
                this.scripts.push(null);
            }
        };
        ScriptLoader.prototype._load = function (index, url) {
            var _this = this;
            var request = new XMLHttpRequest();
            var n = (new Date()).getTime();
            request.open("GET", url.indexOf("?") >= 0 ? url + "&" + n : url + "?" + n, true);
            request.onload = function () {
                _this.scripts[index] = request.response;
                _this.loadedCount++;
                if(_this.loadedCount == _this.scripts.length) {
                    _this.loaded.fire();
                }
            };
            request.onerror = function () {
                console.error("load " + url + " failed.");
                if(_this.loadedCount == _this.scripts.length) {
                    _this.loaded.fire();
                }
            };
            request.send();
        };
        return ScriptLoader;
    })();
    adventure.ScriptLoader = ScriptLoader;    
})(adventure || (adventure = {}));
var adventure;
(function (adventure) {
    var Util = (function () {
        function Util() { }
        Util.getTabCount = function getTabCount(line) {
            for(var i = 0; i < line.length; i++) {
                if(line.charAt(i) != " ") {
                    return i;
                }
            }
            return -1;
        };
        Util.isNormalChar = function isNormalChar(c) {
            if(Util.normalCharaCache === undefined) {
                Util.normalCharaCache = {
                };
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
        };
        Util.analysisVarLine = function analysisVarLine(v) {
            var mode = 0;
            var index = 0;
            var ret = new Array();
            for(var i = 0, len = v.length; i < len; i++) {
                var c = v.charAt(i);
                switch(mode) {
                    case 0:
                        if(c == "$") {
                            if(index < i) {
                                ret.push(v.substring(index, i));
                            }
                            mode = 1;
                            index = i + 1;
                        }
                        break;
                    case 1:
                        if(Util.isNormalChar(c)) {
                            ret.push("this.manager.vars[\"" + v.substring(index, i) + "\"]");
                            mode = 0;
                            index = i;
                        }
                        break;
                }
            }
            if(index < v.length) {
                switch(mode) {
                    case 0:
                        ret.push(v.substr(index));
                        break;
                    case 1:
                        ret.push("this.manager.vars[\"" + v.substr(index) + "\"]");
                        break;
                }
            }
            return ret.join("");
        };
        Util.getEasingProps = function getEasingProps() {
            var ret = [];
            for(var i in jg.Easing) {
                ret.push(i == "LINEAR" ? "" : i);
            }
            return ret;
        };
        Util.getNgProps = function getNgProps() {
            return [
                "name", 
                "manager", 
                "id", 
                "finished", 
                "parent"
            ];
        };
        Util.createVStripeImage = function createVStripeImage() {
            return Util.createImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAABCAYAAADjAO9DAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QMICyYEKIZfsgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAIUlEQVQI12MUFhb+z8/Pz6CgoMCgpKQEx8rKygxKSkoMAEdqA8hvXDJ/AAAAAElFTkSuQmCC");
        };
        Util.createHStripeImage = function createHStripeImage() {
            return Util.createImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAICAYAAAA4GpVBAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QMICygFwQJCqgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAALUlEQVQI1wXBwREAIAgDwUykBnwzHv2XJh3orjL3c8SSq0o+IDfIgNyNdGfeB17iBz3zdLCqAAAAAElFTkSuQmCC");
        };
        Util.createDissolveImage = function createDissolveImage() {
            return Util.createImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QMJAQkqU2eIowAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAF0lEQVQI12NcumTJzVu3GP7//8/MzAIAPTEHg/VK0L0AAAAASUVORK5CYII=");
        };
        Util.createImage = function createImage(data) {
            var img = document.createElement("img");
            img.src = data;
            return img;
        };
        Util.getCommands = function getCommands(noMaster) {
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
            if(!noMaster) {
                commands.push("game");
                commands.push("config");
            }
            return commands;
        };
        return Util;
    })();
    adventure.Util = Util;    
})(adventure || (adventure = {}));
