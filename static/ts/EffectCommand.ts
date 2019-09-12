module adventure {
	export class EffectCommand extends Command {
		target:jg.E;
		show:bool;
		time:number;
		id:string;
		image:string;
		type:string;
		repeat:string;
		easing:string;
		mask1:any;
		mask2:any;
		maskDraw:bool;

		constructor(manager:Manager) {
			super(manager, "effect");
			this.show = true;
		}

		doEffect() {
			var time = this.time === undefined ? 500 : this.time;
			var type = this.type === undefined ? "universal" : this.type;
			var finish = () => {
				this.finished.fire();
			}
			var easing = undefined;
			if (this.easing && jg.Easing[this.easing])
				easing = jg.Easing[this.easing];

			if (! this.target) {
				//for scene
				//TODO:
			}
			switch (type) {
			case "fade":
				if (this.show) {
					this.target.hide();
					this.target.tl().fadeIn(time, easing).then(finish);
				} else {
					this.target.show();
					this.target.tl().fadeOut(time, easing).then(finish);
				}
			break;
			case "universal":
				if (this.show)
					this.target.hide();
				var amount = this.show ? {start: 255, end: -255} : {start: -255, end: 255};
				var opt:any = {
					image: this.manager.game.r(this.image),
					repeat: this.repeat ? true : false,
					amount: amount
				}
				if (this.mask1 && this.mask2) {
					opt.mask1 = this.mask1;
					opt.mask2 = this.mask2;
					opt.maskDraw = this.maskDraw;
				}

				this.target.tl().then(() => {
					this.target.show();
				}).and().filter(
					jg.ImageFilter.UniversalTransitionFilter,
					opt,
					time,
					easing
				).then(() => {
					if (! this.show)
						this.target.hide();
					finish();
				});
			break;
			case "universal-r":
				if (this.show)
					this.target.hide();
				var amount = this.show ? {start: 255, end: -255} : {start: -255, end: 255};
				var opt:any = {
					image: this.manager.game.r(this.image),
					repeat: this.repeat ? true : false,
					amount: amount
				}
				if (this.mask1 && this.mask2) {
					opt.mask1 = this.mask1;
					opt.mask2 = this.mask2;
				}
				this.target.tl().then(() => {
					this.target.show();
				}).and().filter(
					jg.ImageFilter.ReverseUniversalTransitionFilter,
					opt,
					time,
					easing
				).then(() => {
					if (! this.show)
						this.target.hide();
					finish();
				});
			break;
			}
		}

		clone():EffectCommand {
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
		}

		cloneReverse():EffectCommand {
			var r = this.clone();
			if (r.type == "universal")
				r.type = "universal-r";
			return r;
		}

		toString(prefix?:string):string {
			return this.toStringCommon(prefix, "target", "show", "mask1", "mask2", "maskDraw");
		}

		getProperties():PropertySet {
			var p = new PropertySet("ゲーム中に利用するエフェクトを定義するコマンドです。");
			p.add("id", "string", "このエフェクトの識別IDを定義します。", true);
			p.add("type", "string", "このエフェクトの種別を定義します。", true, ["fade","universal","universal-r"]);
			p.add("image", "image", "このエフェクトで利用する画像を定義します。\ntypeがuniversalの場合は必須です。", false, "image");
			p.add("repeat", "string", "このエフェクトは画像を繰り返し利用するタイプのものであれば1を指定します。", false, ["", "1"]);
			p.add("easing", "string", "このエフェクトで利用するEasingを指定します。", false, Util.getEasingProps());
			return p;
		}
	}
}