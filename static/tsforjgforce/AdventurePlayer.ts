module adventure {
	export class AdventurePlayer extends jgforce.Editor {
		files:string[];
		scripts:string[];
		loadedCount:number;
		manager:Manager;
		revision: number;
		data_url: string;

		constructor(session:jgforce.Session) {
			super(session);
			this.files = [];
			jg.Resource.getInstance().structure = new jgforce.ResourceStructure();
		}

		load(id: number, data_url?:string) {
			this.data_url = data_url;
			var ret = super.load(id);
			return ret;
		}

		onLoadComplete(method:string, data:any, request:XMLHttpRequest) {
			if (! this.game.data)
				throw "can not load data";
			
			this.scripts = [];
			var tmp = JSON.parse(this.game.data);
			this.files = tmp.scripts;

			this.loadedCount = 0;
			for (var i=0; i<this.files.length; i++) {
				this.scripts.push("");
				this.loadScript(i, this.files[i]);
			}
		}

		loadScript(index:number, file:string) {
			var loader = new ScriptLoader();
			loader.loaded.handle(() => {
				this.scripts[index] = loader.scripts[0];
				this.loadedCount++;
				if (this.loadedCount == this.scripts.length) {
					this.resetManager();
					this.loaded.fire();
				}
			});
			loader.load(this.data_url+file);
		}

		resetManager() {
			this.manager = new Manager(this.scripts);
		}

		start(gameClass:Function) {
			this.manager.start(gameClass);
		}
	}
}