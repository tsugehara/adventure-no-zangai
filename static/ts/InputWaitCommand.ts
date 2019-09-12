module adventure {
	export class InputWaitCommand extends Command {
		focusManager:jgui.FocusManager;
		constructor(manager:Manager) {
			super(manager, "inputWait");
		}

		execute() {
			delete this.manager.vars["select"];
			this.manager.scene.messageLayer.disablePointingEvent();
			this.manager.game.update.handle(this, this.update);

			if (this.manager.config.autoFocus) {
				this.focusManager = new jgui.FocusManager(this.manager.game);
				this.focusManager.selected.handle(this, this.onFocusSelect)
			}

			var btnLayer = this.manager.scene.layers["buttons"];
			if (btnLayer) {
				btnLayer.enablePointingEvent();
				for (var i=0; i<btnLayer.entities.length; i++)
					(<jgui.Button>btnLayer.entities[i]).click.handle(this, this.onButtonClicked);

				if (this.focusManager)
					this.focusManager.addEntity.apply(this.focusManager, btnLayer.entities);
			}

			var hasSelectable = false;
			for (var i in this.manager.selectables) {
				hasSelectable = true;
				this.attachSelectable(this.manager.selectables[i]);
				if (this.focusManager)
					this.focusManager.addEntity(this.manager.selectables[i]);
			}
			if (hasSelectable)
				this.manager.scene.charaLayer.enablePointingEvent();

			if (this.focusManager)
				this.focusManager.start(btnLayer ? btnLayer : this.manager.scene.charaLayer);
		}

		attachSelectable(obj:jg.E) {
			obj.enablePointingEvent();
			obj.pointUp.handle(this, this.onSelect);
		}

		detachSelectable(obj:jg.E) {
			obj.disablePointingEvent();
			obj.pointUp.remove(this, this.onSelect);
		}

		onSelect(e:jg.InputPointEvent) {
			if (! e.entity.hitTest(e.point))
				return;
			if (e.entity["id"])
				this.manager.vars["select"] = e.entity["id"];
		}

		onFocusSelect(e:jg.E) {
			if (e["id"])
				this.manager.vars["select"] = e["id"];
		}

		update(t:number) {
			if (this.manager.vars["select"]) {
				var btnLayer = this.manager.scene.layers["buttons"];
				if (btnLayer) {
					for (var i=0; i<btnLayer.entities.length; i++)
						if (btnLayer.entities[i]["click"])
							(<jgui.Button>btnLayer.entities[i]).click.remove(this, this.onButtonClicked);
					btnLayer.disablePointingEvent();
				}
				for (var i in this.manager.selectables)
					this.detachSelectable(this.manager.selectables[i]);

				if (this.focusManager)
					this.focusManager.end();

				this.manager.scene.charaLayer.disablePointingEvent();
				this.manager.scene.messageLayer.enablePointingEvent();
				this.manager.scene.charaLayer.updated();
				this.manager.game.update.remove(this, this.update);
				this.finished.fire();
			}
		}

		onButtonClicked(e:jgui.TextButton) {
			this.manager.vars["select"] = e.getText();
		}

		toString(prefix?:string):string {
			return this.toStringCommon(prefix, "focusManager");
		}

		getProperties():PropertySet {
			var p = new PropertySet("ユーザ入力があるまで待機するコマンドです。");
			return p;
		}
	}
}