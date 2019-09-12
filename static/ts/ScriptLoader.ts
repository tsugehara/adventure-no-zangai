module adventure {
	export class ScriptLoader {
		loaded:jg.Trigger;
		scripts:string[];
		loadedCount:number;
		constructor() {
			this.loaded = new jg.Trigger();
			this.scripts = new string[];
			this.loadedCount = 0;
		}

		load(...scripts:string[]) {
			var indexOffset = this.scripts.length;
			for (var i=0; i<scripts.length; i++) {
				this._load(indexOffset+i, scripts[i])
				this.scripts.push(null);
			}
		}

		_load(index:number, url:string) {
			var request = new XMLHttpRequest();
			var n = (new Date()).getTime();
			request.open("GET", url.indexOf("?") >= 0 ? url+"&"+n : url+"?"+n , true);
			request.onload = () => {
				this.scripts[index] = request.response;
				this.loadedCount++;
				if (this.loadedCount == this.scripts.length)
					this.loaded.fire();
			}
			request.onerror = () => {
				console.error("load "+url+" failed.");
				if (this.loadedCount == this.scripts.length)
					this.loaded.fire();
			}
			request.send();
		}
	}
}