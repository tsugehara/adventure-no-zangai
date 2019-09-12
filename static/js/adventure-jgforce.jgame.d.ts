interface JQuery {
    imageselector: Function;
}
module adventure {
    class PropertyEditor {
        public components: JQuery[];
        public index: number;
        public srcMap: any;
        constructor();
        public createValueComponent(html: string, value: string, tab: number, require?: bool, comment?: string): JQuery;
        public createHtmlComponent(html: string, value: string, tab: number, require?: bool, comment?: string): JQuery;
        public createCommand(value: string, tab?: number): JQuery;
        public createSubCommand(value: string, tab?: number, require?: bool, comment?: string): JQuery;
        public createLabel(value: string, tab: number): JQuery;
        public createSubLabel(value: string, tab: number): JQuery;
        public createEditingLabel(value: string, tab: number): JQuery;
        public createTextarea(value: string, tab?: number, require?: bool, comment?: string): JQuery;
        public createInputString(value: string, tab?: number, require?: bool, comment?: string): JQuery;
        public createImageSelector(value: string, images: string[], tab?: number, require?: bool, comment?: string): JQuery;
        public createInputColor(value: string, tab?: number, require?: bool, comment?: string): JQuery;
        public createInputNumber(value: string, tab?: number, require?: bool, comment?: string): JQuery;
        public createSelect(value: string, values: string[], tab: number, require?: bool, comment?: string): JQuery;
        public createSelectString(value: string, values: string[], tab?: number, require?: bool, comment?: string): JQuery;
        public createSelectNumber(value: string, values: string[], tab?: number, require?: bool, comment?: string): JQuery;
        public createTab(tabCount: string): string;
        public _getComponentValue(component: JQuery);
        public destroy(): void;
        public toString(): string;
    }
}
module adventure {
    class AdventureScript {
        public name: string;
        public startIndex: number;
        public line: number;
        public script: string;
        public editor: AdventureEditor;
        constructor(name: string, editor: AdventureEditor);
        public getCommands(): Command[];
        public updateLine(startIndex?: number): void;
        public updateScript(): void;
        public getScript(): string;
    }
}
module adventure {
    class AdventureEditor extends jgforce.Editor {
        public scripts: AdventureScript[];
        public loadedCount: number;
        public savedCount: number;
        public manager: Manager;
        public beforePreviewIndex: number;
        public flowchart: Flowchart;
        public initTemplateMode: bool;
        public images: string[];
        public revision: number;
        public materialLoaded: jg.Trigger;
        constructor(session: jgforce.Session);
        public load(id: number): XMLHttpRequest;
        public _getSelectValues(targets: Object): any[];
        public _getImages(): string[];
        public _getEffects(): any[];
        public _getScenes(): any[];
        public _getLabels(): any[];
        public _getPropertyEditor(index: number, command: Command): PropertyEditor;
        public getPropertyEditorNew(index: number, cmdName: string): PropertyEditor;
        public getPropertyEditor(index: number): PropertyEditor;
        public onLoadComplete(method: string, data: any, request: XMLHttpRequest): void;
        public initTemplateCompleted(): void;
        public onMaterialLoaded(e: jgforce.IMaterialLoaded): void;
        public calculateLines(): void;
        public loadScript(script: AdventureScript): void;
        public getFiles(): string[];
        public getScripts(): string[];
        public save(): void;
        public onSaveComplete(method: string, request: XMLHttpRequest): void;
        public getScriptIndexByLine(line: number): number;
        public updateFlowchart(): void;
        public preview(container: HTMLElement, index: number, executeMasterCommands?: bool): void;
        public orderCommand(index: number, value: number): bool;
        public orderScript(index: number, value: number): bool;
        public resetManager(): void;
        public replaceScript(index: number, script: string): void;
        public replaceCommand(index: number, cmdStr: string): number;
        public isUniqueFile(name: string): bool;
        public insertScript(index: number, name: string, script?: string): void;
        public deleteScript(index: number): bool;
        public insertNewCommand(index: number, command?: Command): void;
        public getNewScriptNumber(): number;
        public deleteCommand(index: number): void;
    }
}
module adventure {
    class AdventurePlayer extends jgforce.Editor {
        public files: string[];
        public scripts: string[];
        public loadedCount: number;
        public manager: Manager;
        public revision: number;
        public data_url: string;
        constructor(session: jgforce.Session);
        public load(id: number, data_url?: string): XMLHttpRequest;
        public onLoadComplete(method: string, data: any, request: XMLHttpRequest): void;
        public loadScript(index: number, file: string): void;
        public resetManager(): void;
        public start(gameClass: Function): void;
    }
}
