module adventure {
	export class SceneCommand extends Command {
		id:string;
		effect:string;
		image:string;
		repeat:string;
		angle:string;
		color:string;
		rotate:number;
		time:number;
		init:Command[];
		windowWidth:number;
		windowHeight:number;
		windowX:number;
		windowY:number;

		constructor(manager:Manager) {
			super(manager, "scene");
			this.init = new Command[];
		}

		getAngle():jg.Angle {
			switch (this.angle) {
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
		}

		execute() {
			if (this.windowWidth === undefined)
				this.windowWidth = this.manager.config.windowWidth;
			if (this.windowHeight === undefined)
				this.windowHeight = this.manager.config.windowHeight;
			if (this.windowX === undefined)
				this.windowX = this.manager.config.windowX;
			if (this.windowY === undefined)
				this.windowY = this.manager.config.windowY;
			var scene = new BasicScene(this.manager.game);
			scene.init(
				{width: this.windowWidth, height: this.windowHeight},
				{x: this.windowX, y: this.manager.config.windowY}
			);
			scene.enablePointingEvent();
			this.manager.changeScene(scene);

			var showScene = () => {
				scene.started.handle(this, () => {
					this.finished.fire();
				});

				if (this.effect) {
					var effect = new jg.Effect(this.effect);
					jg.Effect.time = this.time ? this.time : 1000;
					switch (effect.method) {
					case "mosaic":
					case "blur":
						//nothing
					break;

					case "slide":
					case "wipe":
					case "wipeFade":
						effect.arguments = [this.getAngle()];
					break;

					case "boxOut":
					case "boxIn":
						effect.arguments = [this.rotate, this.color];
					break;

					case "arcOut":
					case "arcIn":
					case "fade":
						effect.arguments = [this.color];
					break;

					case "universal":
					case "universalTwin":
						effect.arguments = [
							this.manager.game.r(this.image),
							this.repeat ? true : false
						];
					break;

					case "universalDelay":
						effect.arguments = [
							this.manager.game.r(this.image),
							this.repeat ? true : false,
							this.color
						];
					break;
					}
					this.manager.game.changeScene(scene, effect);
				} else {
					this.manager.game.changeScene(scene);
				}
			}
			var finishCount = 0;
			var commandFinished = () => {
				finishCount++;
				if (finishCount == this.init.length)
					showScene();
			};
			for (var i=0; i<this.init.length; i++) {
				this.init[i].manager = this.manager;
				this.init[i].finished.handle(this, commandFinished);
				this.init[i].execute();
			}
			if (this.init.length == 0)
				showScene();
		}

		add(line:string, tab:number) {
			if (tab > 2) {
				this.init[this.init.length - 1].add(line, tab-1);
			} else if (tab == 2) {
				var kv = this.getKeyValue(line);
				var command = Compiler.createCommand(kv.value);
				command.parent = this;
				this.init.push(command);
			} else {
				var kv = this.getKeyValue(line);
				if (kv.key) {
					if (PropertyUtil.isNumber(this, kv.key)) {
						this.setProp(kv, true);
						return;
					}
					this.setProp(kv);
				} //keyなしはinitに対する指定のみ
			}
		}

		getProperties():PropertySet {
			var p = new PropertySet("シーンを定義するコマンドです。\nシーン開始時に実行するコマンドをまとめて定義することも出来ます。");
			p.add("id", "string", "このシーンの識別IDを定義します。必須ではありませんが、出来る限り指定することを推奨します。");
			p.add(
				"effect",
				"string",
				"このシーンの表示に利用するエフェクトを指定します。",
				false,
				["", "mosaic","blur","slide","fade","wipe","wipeFade","boxOut","boxIn","arcOut","arcIn","universal","universalTwin","universalDelay"]
			);
			p.add("image", "image", "effectがuniversal、universalTwin、universalDelayの場合に利用する画像ファイルを指定します。", false, "image");
			p.add("repeat", "string", "effectがuniversal、universalTwin、universalDelayの場合に、エフェクト画像が繰り返し使われる場合に1を指定します。", false, ["", "1"]);
			p.add(
				"angle",
				"string",
				"effectがslide、wipe、wipeFadeの場合に、left、right、up、downのいずれかの値で方向を指定出来ます。",
				false,
				["", "up", "down", "left", "right"]
			);
			p.add("rotate", "number", "effectがboxOut、boxInの場合に、マスク画像に対する回転角度を指定出来ます。");
			p.add("color", "color", "effectがboxOut、boxIn、arcOut、arcIn、fade、universalDelayの場合に色を指定することが出来ます。");
			p.add("time", "number", "エフェクトにかける時間を指定します。");
			p.add("windowWidth", "number", "このシーンでのメッセージウィンドウ表示横幅を指定します。");
			p.add("windowHeight", "number", "このシーンでのメッセージウィンドウ表示縦幅を指定します。");
			p.add("windowX", "number", "このシーンでのメッセージウィンドウ表示横位置を指定します。");
			p.add("windowY", "number", "このシーンでのメッセージウィンドウ表示縦位置を指定します。");
			p.add("init", "commands", "初期化時に実行するコマンド群を指定します。");
			return p;
		}

		toString(prefix?:string):string {
			var tmp = this.toStringCommon("", "init");
			if (this.init.length) {
				tmp += "\n init\n";
				var inits = [];
				for (var i=0; i<this.init.length; i++)
					inits.push(this.init[i].toString("  "));
				tmp += "  "+inits.join("\n  ");
			}
			return tmp;
		}
	}
}