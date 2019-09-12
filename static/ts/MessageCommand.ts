module adventure {
	export class MessageCommand extends Command {
		message:string;
		_message:string;
		offset:number;
		constructor(manager:Manager) {
			super(manager, "message");
			this.message = "";
		}

		execute() {
			delete this.offset;
			this._message = this.analysis(this.message.substr(0, this.message.length-1));
			this.manager.game.keyDown.handle(this, this.keyDown);
			this.manager.game.pointDown.handle(this, this.pointDown);
			this.manager.game.keyUp.handle(this, this.keyUp);
			this.manager.messageWindow.readed.handle(this, this.readed);
			this.nextText();
		}

		analysis(message:string):string {
			var index=0;
			var ret="";
			do {
				var index2 = message.indexOf("{$", index);
				if (index2 < 0) {
					ret += message.substr(index);
					break;
				}
				ret += message.substring(index, index2)
				index = message.indexOf("}", index2);
				if (index < 0) {
					ret += message.substr(index2);
					break;
				}
				ret += this.manager.vars[message.substring(index2+2, index)];
				index++;
			} while(index >= 0);
			return ret;
		}

		readed(hasNext:bool) {
		}

		keyDown(e:jg.InputKeyboardEvent) {
			if (e.param.keyCode == 17) {
				this.manager.messageWindow.fastMode();
			} else {
				if (this.manager.messageWindow.isReaded)
					this.nextText();
			}
		}

		keyUp(e:jg.InputKeyboardEvent) {
			if (e.param.keyCode == 17)
				this.manager.messageWindow.normalMode();
		}

		pointDown(e:jg.InputPointEvent) {
			if (this.manager.messageWindow.isReaded)
				this.nextText();
		}

		add(line:string, tab:number) {
			this.message += this.restoreSpace(tab)+line+"\n";
		}

		restoreSpace(tab:number) {
			if (tab < 2)
				return "";
			var ret = "";
			for (var i=1;i<tab;i++)
				ret += " ";
			return ret;
		}

		nextText() {
			var w = this.manager.messageWindow;
			if (this.offset === undefined) {
				w.show(true);
				this.offset = w.setScript(this._message);
			} else if (this.offset == -1) {
				if (this.manager.config.messageAutoHide)
					w.tl().fadeOut(200).then(() => { this.finish(); });
				else
					this.finish();
				return;
			} else {
				w.oldWipeOut();
				this.offset = w.setScript(this._message, this.offset);
			}
			w.showText();
		}

		finish() {
			this.manager.game.keyDown.remove(this, this.keyDown);
			this.manager.game.pointDown.remove(this, this.pointDown);
			this.manager.game.keyUp.remove(this, this.keyUp);
			this.manager.messageWindow.readed.remove(this, this.readed);
			this.finished.fire();
		}

		toString(prefix?:string):string {
			return this.name+"\n"
			+" "+this.message.substr(0, this.message.length-1).split(/\n/g).join("\n ");
		}

		getProperties():PropertySet {
			var p = new PropertySet("メッセージを表示させる基本的なコマンドです。");
			p.isPlain = true;
			return p;
		}
	}
}