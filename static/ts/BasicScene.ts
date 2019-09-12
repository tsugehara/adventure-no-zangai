module adventure {
	export class BasicScene extends jg.Scene {
		messageWindow:jg.MessageWindow;
		charaLayer:jg.Layer;
		bgLayer:jg.Layer;
		messageLayer:jg.Layer;
		constructor(game:jg.Game) {
			super(game);
		}

		init(size?:jg.CommonSize, pos?:jg.CommonOffset) {
			if (size === undefined)
				size = {
					width: this.game.width,
					height: this.game.height
				}

			if (pos === undefined)
				pos = {
					x: (this.game.width - size.width) / 2,
					y: (this.game.height - size.height)
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
		}

		changeBg(image?:HTMLImageElement) {
			if (image === undefined)
				image = (new jg.Shape(this.game.width, this.game.height, jg.ShapeStyle.Fill, "#ffffff")).createSprite().image;

			var entity;
			while (entity = this.bgLayer.entities.pop())
				entity.remove();
			this.bgLayer.append(new jg.Sprite(image));
			this.bgLayer.updated();
		}

		prepareBg(image?:HTMLImageElement) {
			if (image === undefined)
				image = (new jg.Shape(this.game.width, this.game.height, jg.ShapeStyle.Fill, "#ffffff")).createSprite().image;

			var bg = new jg.Sprite(image);
			this.bgLayer.insert(bg, 0);
			this.bgLayer.updated();
			return bg;
		}

		clearOldBgs() {
			while (this.bgLayer.entities.length > 1) {
				var entity = this.bgLayer.entities.pop();
				entity.remove();
			}
			this.bgLayer.updated();
		}
	}
}