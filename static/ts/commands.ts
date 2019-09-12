module adventure {
	export class ExitCommand extends Command {
		constructor(manager:Manager) {
			super(manager, "exit");
		}

		execute() {
			this.manager.index = this.manager.commands.length;
			this.finished.fire();
		}

		getProperties():PropertySet {
			return new PropertySet("ゲームを終了させるコマンドです。");
		}
	}

	export class EvalAsyncCommand extends Command {
		script:string;
		constructor(manager:Manager, name?:string) {
			super(manager, name === undefined ? "evalAsync" : name);
			this.script = "";
		}

		execute() {
			eval(this.script);
		}

		add(line:string, tab:number) {
			this.script += line+"\n";
		}

		toString(prefix?:string):string {
			return this.name+"\n"
			+" "+this.script.substr(0, this.script.length - 1).split(/\n/g).join("\n ");
		}

		getProperties():PropertySet {
			var p = new PropertySet("JavaScriptを実行するコマンドです。\nこのコマンドはevalコマンドとは異なり、javascript実行後自動的にコマンド終了処理を行いません。明示的にthis.finished.fire()を実行する必要があります。");
			p.isPlain = true;
			return p;
		}
	}

	export class EvalCommand extends EvalAsyncCommand {
		constructor(manager:Manager) {
			super(manager, "eval");
		}
		execute() {
			super.execute();
			this.finished.fire();
		}

		getProperties():PropertySet {
			var p = new PropertySet("JavaScriptを実行するコマンドです。\nこのコマンドはevalAsyncコマンドとは異なり、javascript実行後自動的にコマンドを終了させます。");
			p.isPlain = true;
			return p;
		}
	}

	export class GameCommand extends Command {
		width:number;
		height:number;
		constructor(manager:Manager) {
			super(manager, "game");
			this.width = 480;
			this.height = 480;
		}

		getProperties():PropertySet {
			var p = new PropertySet("ゲームの大きさを変更するコマンドです。このコマンドは一度だけしか実行出来ません。");
			p.add("width", "number", "横幅", true);
			p.add("height", "number", "縦幅", true);
			return p;
		}
	}

	export class ConfigCommand extends Command {
		windowWidth:number;
		windowHeight:number;
		windowX:number;
		windowY:number;
		messageAutoHide:number;
		autoFocus:number;
		constructor(manager:Manager, gameCommand?:GameCommand) {
			super(manager, "config");
			this.windowWidth = 480;
			this.windowHeight = 480;
			this.windowX = 0;
			this.windowY = 0;
			this.messageAutoHide = 0;
			this.autoFocus = 1;
		}

		setInfoByGameCommmand(gameCommand:GameCommand) {
			this.windowWidth = gameCommand.width;
			this.windowHeight = gameCommand.height;
		}

		getProperties():PropertySet {
			var p = new PropertySet("ゲームの各種設定を行うコマンドです。このコマンドは一度だけしか実行できません。\nゲーム中の設定変更はchangeConfigコマンドを利用する必要があります。");
			p.add("windowWidth", "number", "メッセージウィンドウの横幅");
			p.add("windowHeight", "number", "メッセージウィンドウの縦幅");
			p.add("windowX", "number", "メッセージウィンドウの表示横位置");
			p.add("windowY", "number", "メッセージウィンドウの表示縦位置");
			p.add("messageAutoHide", "number", "メッセージ表示後、メッセージウィンドウを自動的に隠すかどうか");
			p.add("autoFocus", "number", "selectableコマンドで指定した対象に、キーボード操作でフォーカスを合わせるかどうか");
			return p;
		}
	}

	export class ChangeConfigCommand extends Command {
		constructor(manager:Manager) {
			super(manager, "changeConfig");
		}

		execute() {
			var ng = Util.getNgProps();
			for (var prop in this) {
				if (ng.indexOf(prop) >= 0)
					continue;
				if (typeof this[prop] == "function")
					continue;
				this.manager.config[prop] = typeof this.manager.config[prop] == "number" ? parseInt(this[prop]) : this[prop];
			}
			this.finished.fire();
		}

		getProperties():PropertySet {
			var p = new PropertySet("ゲームの各種設定を変更するコマンドです。\nどのような設定値があるかは、configコマンドを確認してください。");
			var ng = Util.getNgProps();
			p.isDynamic = true;
			for (var prop in this) {
				if (ng.indexOf(prop) >= 0)
					continue;
				if (typeof this[prop] == "function")
					continue;
				p.add(prop, "string");
			}
			return p;
		}
	}

	export class BgCommand extends Command {
		file:string;
		effect:string;
		time:number;

		constructor(manager:Manager) {
			super(manager, "bg");
		}

		execute() {
			if (! this.effect) {
				this.manager.scene.changeBg(this.manager.game.r(this.file));
				this.finished.fire();
				return;
			}

			var bg1 = this.manager.get("bg");
			var effect = this.manager.effects[this.effect];
			var bg2 = this.manager.scene.prepareBg(this.manager.game.r(this.file));
			effect.target = bg2;
			effect.show = true;
			if (this.time !== undefined)
				effect.time = this.time;

			var effect2 = effect.cloneReverse();
			effect2.target = bg1;
			effect2.show = false;
			effect2.doEffect();

			effect.doEffect();
			effect.finished.handle(this, function() {
				effect.finished.removeAll(this);
				this.manager.scene.clearOldBgs();
				this.finished.fire();
			});
		}

		getProperties():PropertySet {
			var p = new PropertySet("背景画像を切り替えるコマンドです。");
			p.add("file", "image", "画像名を指定します。", true, "image");
			p.add("effect", "string", "画像表示に利用するエフェクトを指定します。\n省略すると、即時に表示されます。", false, "effect");
			p.add("time", "number", "画像表示のエフェクトにかける時間を指定します。");
			return p;
		}
	}

	export class EffectiveCommand extends Command {
		id: string;
		effect:string;
		time:number;

		constructor(manager:Manager, name:string) {
			super(manager, name);
		}

		doEffect(show:bool, e?:jg.E, noCallback?:bool) {
			if (e === undefined)
				e = this.manager.get(this.id);

			if (! this.effect) {
				this.effectEnded(e);
				return;
			}

			var effect = this.manager.effects[this.effect];
			effect.target = e;
			effect.show = show;
			if (this.time > 0)
				effect.time = this.time;
			effect.doEffect();
			var callback = function() {
				effect.finished.remove(this, callback);
				if (! noCallback)
					this.effectEnded(e);
			};
			effect.finished.handle(this, callback);
		}

		effectEnded(e:jg.E) {

		}
	}

	export class AddCommand extends EffectiveCommand {
		file:string;
		x:number;
		y:number;
		width:number;
		height:number;

		constructor(manager:Manager) {
			super(manager, "add");
		}

		execute() {
			var image = this.manager.game.r(this.file);
			var sprite = new jg.Sprite(
				image,
				this.width !== undefined ? this.width : image.width,
				this.height !==undefined ? this.height : image.height
			);
			if (this.x !== undefined && this.y !== undefined)
				sprite.moveTo(this.x, this.y);
			this.manager.append(this.id ? this.id : this.file, sprite);
			if (this.effect) {
				this.doEffect(true);
			} else {
				this.finished.fire();
			}
		}

		effectEnded(e:jg.E) {
			this.finished.fire();
		}

		getProperties():PropertySet {
			var p = new PropertySet("画面にオブジェクトを追加します。");
			p.add("id", "string", "表示するオブジェクトのIDを指定します。", true);
			p.add("file", "image", "表示するオブジェクトの画像ファイル名を指定します。", true, "image");
			p.add("effect", "string", "オブジェクト表示に利用するエフェクトを指定します。\n省略すると、即時に表示されます。", false, "effect");
			p.add("time", "number", "オブジェクト表示のエフェクトにかける時間を指定します。");
			p.add("x", "number", "表示横座標を指定します。");
			p.add("y", "number", "表示縦座標を指定します。");
			p.add("width", "number", "画像の横幅を指定します。省略時は画像の大きさのまま表示されます。");
			p.add("height", "number", "画像の縦幅を指定します。省略時は画像の大きさのまま表示されます。");
			return p;
		}
	}

	export class RemoveCommand extends EffectiveCommand {
		constructor(manager:Manager) {
			super(manager, "remove");
		}

		execute() {
			this.doEffect(false);
		}

		effectEnded(e:jg.E) {
			this.manager.remove(this.id);
			this.finished.fire();
		}

		getProperties():PropertySet {
			var p = new PropertySet("画面からオブジェクトを削除します。");
			p.add("id", "string", "削除するオブジェクトのIDを指定します。", true);
			p.add("effect", "string", "オブジェクト削除に利用するエフェクトを指定します。\n省略すると、即時に削除されます。", false, "effect");
			p.add("time", "number", "オブジェクト削除のエフェクトにかける時間を指定します。");
			return p;
		}
	}

	export class HideCommand extends EffectiveCommand {
		constructor(manager:Manager) {
			super(manager, "hide");
		}

		execute() {
			this.doEffect(false);
		}

		effectEnded(e:jg.E) {
			e.hide();
			this.finished.fire();
		}

		getProperties():PropertySet {
			var p = new PropertySet("画面のオブジェクトを非表示にします。");
			p.add("id", "string", "非表示にするオブジェクトのIDを指定します。", true);
			p.add("effect", "string", "オブジェクト非表示に利用するエフェクトを指定します。\n省略すると、即時に非表示にされます。", false, "effect");
			p.add("time", "number", "オブジェクト非表示時のエフェクトにかける時間を指定します。");
			return p;
		}
	}

	export class ShowCommand extends EffectiveCommand {
		constructor(manager:Manager) {
			super(manager, "show");
		}

		execute() {
			this.doEffect(true);
		}

		effectEnded(e:jg.E) {
			e.show();
			this.finished.fire();
		}

		getProperties():PropertySet {
			var p = new PropertySet("画面のオブジェクトを再表示します。");
			p.add("id", "string", "再表示するオブジェクトのIDを指定します。", true);
			p.add("effect", "string", "オブジェクト再表示に利用するエフェクトを指定します。\n省略すると、即時に再表示されます。", false, "effect");
			p.add("time", "number", "オブジェクト再表示時のエフェクトにかける時間を指定します。");
			return p;
		}
	}

	export class OrderCommand extends EffectiveCommand {
		value:number;
		ordered:bool;

		constructor(manager:Manager) {
			super(manager, "order");
		}

		execute() {
			delete this.ordered;
			this.doEffect(false);
		}

		effectEnded(e:jg.E) {
			if (this.ordered) {
				this.finished.fire();
			} else {
				var all = this.manager.scene.charaLayer.entities;
				var index;
				for (var i=0; i<all.length; i++) {
					if (all[i] == e) {
						index = i;
						break;
					}
				}

				var newIndex = index + this.value;
				if (newIndex < 0)
					newIndex = 0;
				if (newIndex >= all.length)
					newIndex = all.length - 1;

				if (this.value > 0) {
					for (var i=index; i<newIndex; i++)
						all[i] = all[i+1];

					all[newIndex] = e;
				} else {
					for (var i=index; i>newIndex; i--)
						all[i] = all[i-1];

					all[newIndex] = e;
				}

				this.manager.scene.charaLayer.updated();

				this.ordered = true;
				this.doEffect(true);
			}
		}

		toString(prefix?:string):string {
			return this.toStringCommon(prefix, "ordered");
		}

		getProperties():PropertySet {
			var p = new PropertySet("オブジェクトの表示順序を切り替えるコマンドです。");
			p.add("id", "string", "表示順序を切り替えるオブジェクトのIDを指定します。", true);
			p.add("value", "number", "入れ替え後の表示順序を示す値を指定します。\n0が一番奥です。", true);
			p.add("effect", "string", "表示順序切り替えに利用するエフェクトを指定します。\n省略すると、即時に表示順序を切り替えます。", false, "effect");
			p.add("time", "number", "表示順序切り替えのエフェクトにかける時間を指定します。");
			return p;
		}
	}

	export class ImageCommand extends EffectiveCommand {
		file:string;
		_dummy:jg.Sprite;
		constructor(manager:Manager) {
			super(manager, "image");
		}

		execute() {
			var e = <jg.Sprite>this.manager.get(this.id);
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
		}

		effectEnded(e:jg.E) {
			var effect = this.manager.effects[this.effect];
			delete effect.mask1;
			delete effect.mask2;
			var e = <jg.Sprite>this.manager.get(this.id);
			e.image = this._dummy.image;
			e.show();
			this._dummy.remove();
			this.finished.fire();
		}

		toString(prefix?:string):string {
			return this.toStringCommon(prefix, "_dummy");
		}

		getProperties():PropertySet {
			var p = new PropertySet("オブジェクトの画像を切り替えるコマンドです。");
			p.add("id", "string", "画像を切り替えるオブジェクトのIDを指定します。", true);
			p.add("file", "image", "切り替え後の画像ファイル名を指定します。", true, "image");
			p.add("effect", "string", "画像切り替えに利用するエフェクトを指定します。\n省略すると、即時に画像を切り替えます。", false, "effect");
			p.add("time", "number", "画像切り替えのエフェクトにかける時間を指定します。");
			return p;
		}
	}

	export class MoveCommand extends Command {
		id:string;
		x:number;
		y:number;
		time:number;
		easing:string;

		constructor(manager:Manager) {
			super(manager, "move");
			this.x = 0;
			this.y = 0;
		}

		execute() {
			var e = this.manager.get(this.id);
			if (! this.time) {
				e.moveTo(this.x, this.y);
				this.finished.fire();
				return;
			}
			var easing = undefined;
			if (this.easing && jg.Easing[this.easing])
				easing = jg.Easing[this.easing];
			e.tl().moveTo(this.x, this.y, this.time, easing).then(() => {
				this.finished.fire();
			});
		}

		getProperties():PropertySet {
			var p = new PropertySet("オブジェクトの位置を移動するコマンドです。");
			p.add("id", "string", "位置を移動させるオブジェクトのIDを指定します。", true);
			p.add("x", "number", "移動後の画面横座標を指定します。", true);
			p.add("y", "number", "移動後の画面縦座標を指定します。", true);
			p.add("time", "number", "移動にかかる時間を指定します。\n省略すると即座に移動が完了します。");
			p.add("easing", "string", "移動に利用するeasing関数を指定します。", false, Util.getEasingProps());
			return p;
		}
	}

	export class ScaleCommand extends Command {
		id:string;
		scaleX:number;
		scaleY:number;
		scale:number;
		time:number;
		easing:string;

		constructor(manager:Manager) {
			super(manager, "scale");
		}

		execute() {
			var e = this.manager.get(this.id);
			if (! this.time) {
				e.setDrawOption("scale", {
					x: this.scale ? this.scale : this.scaleX,
					y: this.scale ? this.scale : this.scaleY
				});
				this.finished.fire();
				return;
			}
			var easing = undefined;
			if (this.easing && jg.Easing[this.easing])
				easing = jg.Easing[this.easing];
			if (this.scale) {
				e.tl().scaleTo(this.scale, this.time, easing).then(() => {
					this.finished.fire();
				});
			} else {
				e.tl().scaleTo(this.scaleX, this.scaleY, this.time, easing).then(() => {
					this.finished.fire();
				});
			}
		}

		getProperties():PropertySet {
			var p = new PropertySet("オブジェクトの表示倍率を操作するコマンドです。");
			p.add("id", "string", "表示倍率を変更するオブジェクトのIDを指定します。", true);
			p.add("scaleX", "number", "この値を指定すると、オブジェクトの横方向への拡大倍率を変更します。\nscaleとの同時指定は出来ません。");
			p.add("scaleY", "number", "この値を指定すると、オブジェクトの縦方向への拡大倍率を変更します。\nscaleとの同時指定は出来ません。");
			p.add("scale", "number", "この値を指定すると、オブジェクトの縦横双方の拡大倍率を同時に変更します。\nscaleXまたはscaleYとの同時指定は出来ません。");
			p.add("time", "number", "表示倍率変更にかかる時間を指定します。\n省略すると即座に変更が完了します。");
			p.add("easing", "string", "表示倍率変更に利用するeasing関数を指定します。", false, Util.getEasingProps());
			return p;
		}
	}

	export class ResizeCommand extends Command {
		id:string;
		width:number;
		height:number;
		time:number;
		easing:string;

		constructor(manager:Manager) {
			super(manager, "resize");
		}

		execute() {
			var e = this.manager.get(this.id);
			if (! this.time) {
				if (this.width)
					e.width = this.width;
				if (this.height)
					e.height = this.height;
				e.updated();
				this.finished.fire();
				return;
			}
			var easing = undefined;
			if (this.easing && jg.Easing[this.easing])
				easing = jg.Easing[this.easing];
			e.tl().scaleTo(
				this.width ? this.width : e.width,
				this.height ? this.height : e.height,
				this.time,
				easing
			).then(() => {
				this.finished.fire();
			});
		}

		getProperties():PropertySet {
			var p = new PropertySet("オブジェクトのサイズを操作するコマンドです。\nscaleコマンドとは異なり、オブジェクトのサイズ自体を変更するため、右下の方向に伸縮されます。");
			p.add("id", "string", "表示倍率を変更するオブジェクトのIDを指定します。", true);
			p.add("width", "number", "新しいオブジェクトの横幅を指定します。", true);
			p.add("height", "number", "新しいオブジェクトの縦幅を指定します。", true);
			p.add("time", "number", "表示倍率変更にかかる時間を指定します。\n省略すると即座に変更が完了します。");
			p.add("easing", "string", "表示倍率変更に利用するeasing関数を指定します。", false, Util.getEasingProps());
			return p;
		}
	}

	export class WaitCommand extends Command {
		_t:number;
		time:number;
		constructor(manager:Manager) {
			super(manager, "wait");
		}

		execute() {
			this._t = 0;
			this.manager.game.update.handle(this, this.update);
		}

		update(t:number) {
			this._t += t;
			if (this._t > this.time) {
				this.manager.game.update.remove(this, this.update);
				this.finished.fire();
			}
		}

		toString(prefix?:string):string {
			return this.toStringCommon(prefix, "_t");
		}

		getProperties():PropertySet {
			var p = new PropertySet("一定時間何もせずに待機するコマンドです。");
			p.add("time", "number", "待機する時間を指定します。", true);
			return p;
		}
	}

	export class JumpCommand extends Command {
		command:number;
		scene:string;
		label:string;

		constructor(manager:Manager) {
			super(manager, "jump");
		}

		execute() {
			if (this.command !== undefined) {
				this.manager.index = this.command;
			} else if (this.scene !== undefined) {
				this.manager.index = this.manager.scenes[this.scene];
			} else if (this.label !== undefined) {
				this.manager.index = this.manager.labels[this.label];
			}
			this.finished.fire();
		}

		getProperties():PropertySet {
			var p = new PropertySet("特定の場所へジャンプするコマンドです。label、scene、commandのどれか一つのみを指定します。");
			p.add("label", "string", "指定したIDのlabelへジャンプします。", false, "label");
			p.add("scene", "string", "指定したIDのsceneへジャンプします。", false, "scene");
			p.add("command", "number", "指定番号目のコマンドへジャンプします。");
			return p;
		}
	}

	export class CallCommand extends JumpCommand {
		constructor(manager:Manager) {
			super(manager);
			this.name = "call";
		}

		execute() {
			this.manager.stack.push(this.manager.index);
			super.execute();
		}

		getProperties():PropertySet {
			var p = new PropertySet("この場所を基点に、特定の場所へジャンプするコマンドです。label、scene、commandのどれか一つのみを指定します。\nジャンプ先では必ずreturnコマンドを用意しておく必要があります。");
			p.add("label", "string", "指定したIDのlabelへジャンプします。", false, "label");
			p.add("scene", "string", "指定したIDのsceneへジャンプします。", false, "scene");
			p.add("command", "number", "指定番号目のコマンドへジャンプします。");
			return p;
		}
	}

	export class ReturnCommand extends Command {
		constructor(manager:Manager) {
			super(manager, "return");
		}

		execute() {
			//返る場所が無い場合、エラーは出さずにそのまま通貨させる
			if (this.manager.stack.length)
				this.manager.index = this.manager.stack.pop();
			this.finished.fire();
		}

		getProperties():PropertySet {
			var p = new PropertySet("直前のcallコマンドを呼び出した場所へジャンプします。");
			return p;
		}
	}

	export class LabelCommand extends Command {
		id:string;

		constructor(manager:Manager) {
			super(manager, "label");
		}

		getProperties():PropertySet {
			var p = new PropertySet("この場所にラベルを貼るコマンドです。\nこのコマンド単体では意味がありませんが、jumpやcallコマンドと併用して利用します。");
			p.add("id", "string", "このラベルの識別IDを指定します。", true);
			return p;
		}
	}

	export class SkipCommand extends Command {
		command:number;
		constructor(manager:Manager) {
			super(manager, "skip");
		}

		execute() {
			this.manager.index += this.command;
			this.finished.fire();
		}

		getProperties():PropertySet {
			var p = new PropertySet("指定行数の命令をスキップするコマンドです。");
			p.add("command", "number", "スキップするコマンド数を指定します。", true);
			return p;
		}
	}

	export class VarCommand extends Command {
		static ng =  ["name", "manager", "id", "finished", "parent"];
		constructor(manager:Manager) {
			super(manager, "var");
		}

		execute() {
			var scripts = [];
			var ng = Util.getNgProps();
			for (var prop in this) {
				if (ng.indexOf(prop) >= 0)
					continue;
				if (typeof this[prop] == "function")
					continue;

				var script = ["this.manager.vars[\""+prop+"\"]="];
				script.push(Util.analysisVarLine(this[prop]));
				script.push(";");
				scripts.push(script.join(""));
			}
			eval(scripts.join("\n"));
			this.finished.fire();
		}

		getProperties():PropertySet {
			var p = new PropertySet("変数を指定するコマンドです。\naプロパティに10という値を設定すれば、a変数に10の値が入ります。");
			var ng = Util.getNgProps();
			p.isDynamic = true;
			for (var prop in this) {
				if (ng.indexOf(prop) >= 0)
					continue;
				if (typeof this[prop] == "function")
					continue;
				p.add(prop, "string");
			}
			return p;
		}
	}

	export class ButtonsCommand extends Command {
		texts:string[];
		constructor(manager:Manager) {
			super(manager, "buttons");
			this.texts = [];
		}

		execute() {
			if (! this.manager.scene.layers["buttons"]) {
				this.manager.scene.createLayer("buttons");
			}
			var layer = this.manager.scene.layers["buttons"];
			var len = layer.entities.length + this.texts.length;

			for (var i=0; i<this.texts.length; i++) {
				var btn = new jgui.TextButton(
					this.texts[i],
					this.manager.game.width - 64,
					32
				);
				btn["id"] = this.texts[i];
				layer.append(btn);
			}

			var totalHeight = len * 48;
			for (var i=0; i<layer.entities.length; i++) {
				var btn = <jgui.TextButton>layer.entities[i];
				btn.moveTo(
					(layer.width - btn.width) / 2,
					layer.height / 2 - totalHeight / 2 + i * 40
				);
			}
			this.finished.fire();
		}

		add(line:string, tab:number) {
			this.texts.push(line);
		}

		toString(prefix?:string):string {
			return this.name+"\n"
			+" "+this.texts.join("\n ");
		}

		getProperties():PropertySet {
			var p = new PropertySet("複数のボタンを表示するコマンドです。\n表示したいボタンを一行に一つの書式で、好きな数だけ指定出来ます。");
			p.isPlain = true;
			return p;
		}
	}

	export class DeleteButtonsCommand extends Command {
		constructor(manager:Manager) {
			super(manager, "deleteButtons");
		}

		execute() {
			this.manager.scene.deleteLayer("buttons");
			this.manager.scene.root.updated();
			this.finished.fire();
		}

		getProperties():PropertySet {
			var p = new PropertySet("buttonsコマンドで表示したボタンを削除するコマンドです。");
			return p;
		}
	}

	export class SelectableCommand extends Command {
		selectable:string[];

		constructor(manager:Manager) {
			super(manager, "selectable");
			this.selectable = new string[];
		}

		execute() {
			for (var i=0; i<this.selectable.length; i++) {
				var id = this.selectable[i];
				var obj = this.manager.get(id);
				if (! obj) {
					//TODO: 
					continue;
				}

				this.manager.selectables[id] = obj;
			}
			this.finished.fire();
		}

		add(line:string, tab:number) {
			this.selectable.push(line);
		}

		toString(prefix?:string):string {
			return this.name+"\n"
			+" "+this.selectable.join("\n ");
		}

		getProperties():PropertySet {
			var p = new PropertySet("画面内のオブジェクトを選択可能にします。\n選択可能にするオブジェクトのIDを一行に一つの書式で、好きな数だけ指定出来ます。");
			p.isPlain = true;
			return p;
		}
	}

	export class ClearSelectableCommand extends Command {
		constructor(manager:Manager) {
			super(manager, "clearSelectable");
		}

		execute() {
			this.manager.selectables = {};
			this.finished.fire();
		}

		getProperties():PropertySet {
			var p = new PropertySet("selectableコマンドで選択可能にしたオブジェクトの選択状態をすべて解除します。");
			return p;
		}
	}
}