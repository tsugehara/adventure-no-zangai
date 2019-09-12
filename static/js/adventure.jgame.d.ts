module adventure {
    class BasicScene extends jg.Scene {
        public messageWindow: jg.MessageWindow;
        public charaLayer: jg.Layer;
        public bgLayer: jg.Layer;
        public messageLayer: jg.Layer;
        constructor(game: jg.Game);
        public init(size?: jg.CommonSize, pos?: jg.CommonOffset): void;
        public changeBg(image?: HTMLImageElement): void;
        public prepareBg(image?: HTMLImageElement): jg.Sprite;
        public clearOldBgs(): void;
    }
}
module adventure {
    class Command {
        public name: string;
        public manager: Manager;
        public finished: jg.Trigger;
        public parent: Command;
        constructor(manager: Manager, name: string);
        public execute(): void;
        public add(line: string, tab: number): void;
        public getKeyValue(line: string): KeyValue;
        public setProp(kv: KeyValue, isInt?: bool): void;
        public toStringCommon(prefix?: string, ...ngs: string[]): string;
        public toString(prefix?: string): string;
        public getProperties(): PropertySet;
        public random(min: number, max: number): number;
    }
}
module adventure {
    class ExitCommand extends Command {
        constructor(manager: Manager);
        public execute(): void;
        public getProperties(): PropertySet;
    }
    class EvalAsyncCommand extends Command {
        public script: string;
        constructor(manager: Manager, name?: string);
        public execute(): void;
        public add(line: string, tab: number): void;
        public toString(prefix?: string): string;
        public getProperties(): PropertySet;
    }
    class EvalCommand extends EvalAsyncCommand {
        constructor(manager: Manager);
        public execute(): void;
        public getProperties(): PropertySet;
    }
    class GameCommand extends Command {
        public width: number;
        public height: number;
        constructor(manager: Manager);
        public getProperties(): PropertySet;
    }
    class ConfigCommand extends Command {
        public windowWidth: number;
        public windowHeight: number;
        public windowX: number;
        public windowY: number;
        public messageAutoHide: number;
        public autoFocus: number;
        constructor(manager: Manager, gameCommand?: GameCommand);
        public setInfoByGameCommmand(gameCommand: GameCommand): void;
        public getProperties(): PropertySet;
    }
    class ChangeConfigCommand extends Command {
        constructor(manager: Manager);
        public execute(): void;
        public getProperties(): PropertySet;
    }
    class BgCommand extends Command {
        public file: string;
        public effect: string;
        public time: number;
        constructor(manager: Manager);
        public execute(): void;
        public getProperties(): PropertySet;
    }
    class EffectiveCommand extends Command {
        public id: string;
        public effect: string;
        public time: number;
        constructor(manager: Manager, name: string);
        public doEffect(show: bool, e?: jg.E, noCallback?: bool): void;
        public effectEnded(e: jg.E): void;
    }
    class AddCommand extends EffectiveCommand {
        public file: string;
        public x: number;
        public y: number;
        public width: number;
        public height: number;
        constructor(manager: Manager);
        public execute(): void;
        public effectEnded(e: jg.E): void;
        public getProperties(): PropertySet;
    }
    class RemoveCommand extends EffectiveCommand {
        constructor(manager: Manager);
        public execute(): void;
        public effectEnded(e: jg.E): void;
        public getProperties(): PropertySet;
    }
    class HideCommand extends EffectiveCommand {
        constructor(manager: Manager);
        public execute(): void;
        public effectEnded(e: jg.E): void;
        public getProperties(): PropertySet;
    }
    class ShowCommand extends EffectiveCommand {
        constructor(manager: Manager);
        public execute(): void;
        public effectEnded(e: jg.E): void;
        public getProperties(): PropertySet;
    }
    class OrderCommand extends EffectiveCommand {
        public value: number;
        public ordered: bool;
        constructor(manager: Manager);
        public execute(): void;
        public effectEnded(e: jg.E): void;
        public toString(prefix?: string): string;
        public getProperties(): PropertySet;
    }
    class ImageCommand extends EffectiveCommand {
        public file: string;
        public _dummy: jg.Sprite;
        constructor(manager: Manager);
        public execute(): void;
        public effectEnded(e: jg.E): void;
        public toString(prefix?: string): string;
        public getProperties(): PropertySet;
    }
    class MoveCommand extends Command {
        public id: string;
        public x: number;
        public y: number;
        public time: number;
        public easing: string;
        constructor(manager: Manager);
        public execute(): void;
        public getProperties(): PropertySet;
    }
    class ScaleCommand extends Command {
        public id: string;
        public scaleX: number;
        public scaleY: number;
        public scale: number;
        public time: number;
        public easing: string;
        constructor(manager: Manager);
        public execute(): void;
        public getProperties(): PropertySet;
    }
    class ResizeCommand extends Command {
        public id: string;
        public width: number;
        public height: number;
        public time: number;
        public easing: string;
        constructor(manager: Manager);
        public execute(): void;
        public getProperties(): PropertySet;
    }
    class WaitCommand extends Command {
        public _t: number;
        public time: number;
        constructor(manager: Manager);
        public execute(): void;
        public update(t: number): void;
        public toString(prefix?: string): string;
        public getProperties(): PropertySet;
    }
    class JumpCommand extends Command {
        public command: number;
        public scene: string;
        public label: string;
        constructor(manager: Manager);
        public execute(): void;
        public getProperties(): PropertySet;
    }
    class CallCommand extends JumpCommand {
        constructor(manager: Manager);
        public execute(): void;
        public getProperties(): PropertySet;
    }
    class ReturnCommand extends Command {
        constructor(manager: Manager);
        public execute(): void;
        public getProperties(): PropertySet;
    }
    class LabelCommand extends Command {
        public id: string;
        constructor(manager: Manager);
        public getProperties(): PropertySet;
    }
    class SkipCommand extends Command {
        public command: number;
        constructor(manager: Manager);
        public execute(): void;
        public getProperties(): PropertySet;
    }
    class VarCommand extends Command {
        static ng: string[];
        constructor(manager: Manager);
        public execute(): void;
        public getProperties(): PropertySet;
    }
    class ButtonsCommand extends Command {
        public texts: string[];
        constructor(manager: Manager);
        public execute(): void;
        public add(line: string, tab: number): void;
        public toString(prefix?: string): string;
        public getProperties(): PropertySet;
    }
    class DeleteButtonsCommand extends Command {
        constructor(manager: Manager);
        public execute(): void;
        public getProperties(): PropertySet;
    }
    class SelectableCommand extends Command {
        public selectable: string[];
        constructor(manager: Manager);
        public execute(): void;
        public add(line: string, tab: number): void;
        public toString(prefix?: string): string;
        public getProperties(): PropertySet;
    }
    class ClearSelectableCommand extends Command {
        constructor(manager: Manager);
        public execute(): void;
        public getProperties(): PropertySet;
    }
}
module adventure {
    class Compiler {
        static getResources(commands: Command[]): string[];
        static createCommand(line: string, manager?: Manager);
        static compileCommand(lines: string[], manager?: Manager): Command;
        static getCommandStrings(lines: string[]): string[][];
        static compileCommands(lines: string[], manager?: Manager): Command[];
    }
}
module adventure {
    class EffectCommand extends Command {
        public target: jg.E;
        public show: bool;
        public time: number;
        public id: string;
        public image: string;
        public type: string;
        public repeat: string;
        public easing: string;
        public mask1: any;
        public mask2: any;
        public maskDraw: bool;
        constructor(manager: Manager);
        public doEffect(): void;
        public clone(): EffectCommand;
        public cloneReverse(): EffectCommand;
        public toString(prefix?: string): string;
        public getProperties(): PropertySet;
    }
}
module adventure {
    class Flowchart {
        public manager: Manager;
        public nodes: FlowNode[];
        constructor(manager: Manager);
        public getRoute(index: number, first?: number);
        public getJumpTo(cmd: JumpCommand, d: number): number;
        public getSubCommandTo(cmds: Command[], d: number): number;
        public createPrevInfo(): void;
        public generate(): void;
    }
    class FlowNode {
        public index: number;
        public route: FlowRoute[];
        public prev: number[];
        public caption: string;
        constructor(index: number, caption?: string, next?: number);
        public add(next: number, reason?: string): void;
        public toString(): string;
    }
    interface FlowRoute {
        next: number;
        reason?: string;
    }
}
module adventure {
    class IfCommand extends Command {
        public yes: Command[];
        public no: Command[];
        public exp: string;
        public _target: string;
        constructor(manager: Manager);
        public execute(): void;
        public add(line: string, tab: number): void;
        public toString(prefix?: string): string;
        public getProperties(): PropertySet;
    }
}
module adventure {
    class InputWaitCommand extends Command {
        public focusManager: jgui.FocusManager;
        constructor(manager: Manager);
        public execute(): void;
        public attachSelectable(obj: jg.E): void;
        public detachSelectable(obj: jg.E): void;
        public onSelect(e: jg.InputPointEvent): void;
        public onFocusSelect(e: jg.E): void;
        public update(t: number): void;
        public onButtonClicked(e: jgui.TextButton): void;
        public toString(prefix?: string): string;
        public getProperties(): PropertySet;
    }
}
module adventure {
    class Manager {
        public game: jg.Game;
        public scene: BasicScene;
        public messageWindow: jg.MessageWindow;
        public gameCommand: GameCommand;
        public config: ConfigCommand;
        public command: Command;
        public commands: Command[];
        public index: number;
        public isNext: bool;
        public stack: number[];
        public objects: {
            [key: string]: jg.E;
        };
        public effects: {
            [key: string]: EffectCommand;
        };
        public scenes: {
            [key: string]: number;
        };
        public labels: {
            [key: string]: number;
        };
        public selectables: {
            [key: string]: jg.E;
        };
        public resources: string[];
        public vars: {
            [key: string]: any;
        };
        constructor(script: any);
        public append(id: string, e: jg.E): void;
        public remove(id: string): void;
        public get(id: string): jg.E;
        public createBasicEffects(): void;
        public updateManagerByCommand(command: Command, commandIndex: number): void;
        public init(script: any): void;
        public addResource(file: string): void;
        public addResourcesByCommands(commands: Command[]): void;
        public start(gameClass?: any, container?: any): void;
        public update(t: number): void;
        public nextCommand(): void;
        public oncommandfinish(): void;
        public changeScene(scene: BasicScene): void;
    }
}
module adventure {
    class MessageCommand extends Command {
        public message: string;
        public _message: string;
        public offset: number;
        constructor(manager: Manager);
        public execute(): void;
        public analysis(message: string): string;
        public readed(hasNext: bool): void;
        public keyDown(e: jg.InputKeyboardEvent): void;
        public keyUp(e: jg.InputKeyboardEvent): void;
        public pointDown(e: jg.InputPointEvent): void;
        public add(line: string, tab: number): void;
        public restoreSpace(tab: number): string;
        public nextText(): void;
        public finish(): void;
        public toString(prefix?: string): string;
        public getProperties(): PropertySet;
    }
}
module adventure {
    class PreviewGame extends jgengine.ManualGame {
        public manager: Manager;
        public flowchart: Flowchart;
        public index: number;
        public commands: Command[];
        public command: Command;
        public isNext: bool;
        public set(flowchart: Flowchart): void;
        public doCommand(): void;
        public oncommandfinish(): void;
        public run(): void;
        public preview(commands: Command[]): void;
        public next(commands: Command[]): bool;
        public nextTo(index: number): bool;
        public previewTo(index: number, start?: number, beforeCommands?: Command[], afterCommands?: Command[]): void;
        public onloaded(): void;
    }
}
module adventure {
    interface KeyValue {
        key: string;
        value: string;
    }
    class PropertySet {
        public properties: Property[];
        public comment: string;
        public isPlain: bool;
        public isDynamic: bool;
        constructor(comment?: string);
        public add(name: string, type: string, comment?: string, must?: bool, values?: any): void;
        public isNumber(name: string): bool;
    }
    interface Property {
        name: string;
        type: string;
        must?: bool;
        comment?: string;
        values?: any;
    }
    class PropertyUtil {
        static properties: {
            [key: string]: PropertySet;
        };
        static getProperties(command: Command): PropertySet;
        static isNumber(command: Command, name: string): bool;
    }
}
module adventure {
    class SceneCommand extends Command {
        public id: string;
        public effect: string;
        public image: string;
        public repeat: string;
        public angle: string;
        public color: string;
        public rotate: number;
        public time: number;
        public init: Command[];
        public windowWidth: number;
        public windowHeight: number;
        public windowX: number;
        public windowY: number;
        constructor(manager: Manager);
        public getAngle(): jg.Angle;
        public execute(): void;
        public add(line: string, tab: number): void;
        public getProperties(): PropertySet;
        public toString(prefix?: string): string;
    }
}
module adventure {
    class ScriptLoader {
        public loaded: jg.Trigger;
        public scripts: string[];
        public loadedCount: number;
        constructor();
        public load(...scripts: string[]): void;
        public _load(index: number, url: string): void;
    }
}
module adventure {
    class Util {
        static normalCharaCache: {
            [key: string]: bool;
        };
        static getTabCount(line: string): number;
        static isNormalChar(c: string): bool;
        static analysisVarLine(v: string): string;
        static getEasingProps(): any[];
        static getNgProps(): string[];
        static createVStripeImage(): HTMLImageElement;
        static createHStripeImage(): HTMLImageElement;
        static createDissolveImage(): HTMLImageElement;
        static createImage(data: string): HTMLImageElement;
        static getCommands(noMaster?: bool): string[];
    }
}
