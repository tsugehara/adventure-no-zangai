module adventure {
	export interface KeyValue {
		key: string;
		value: string;
	}

	export class PropertySet {
		properties:Property[];
		comment:string;
		isPlain:bool;
		isDynamic:bool;

		constructor(comment?:string) {
			this.properties = [];
			this.comment = comment;
		}

		add(name:string, type:string, comment?:string, must?:bool, values?:any) {
			this.properties.push({
				name: name,
				type: type,
				comment: comment,
				must: must,
				values: values
			});
		}

		isNumber(name:string):bool {
			for (var i=0; i<this.properties.length; i++)
				if (this.properties[i].name == name)
					return this.properties[i].type == "number";
			return false;
		}
	}

	export interface Property {
		name:string;
		type:string; //string, number, commands, color
		must?:bool;
		comment?:string;
		values?:any;	//string[] or string
	}

	export class PropertyUtil {
		static properties:{[key: string]: PropertySet;} = {};

		static getProperties(command:Command) {
			if (! PropertyUtil.properties[command.name])
				PropertyUtil.properties[command.name] = command.getProperties();
			return PropertyUtil.properties[command.name];
		}

		static isNumber(command:Command, name:string):bool {
			return PropertyUtil.getProperties(command).isNumber(name);
		}
	}
}