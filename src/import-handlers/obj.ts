export class OBJLoader {
	private fileContents: string;
	private defaultModelName = "untitled";
	private currentMaterial = "";
	private currentGroup = "";
	private smoothingGroup = 0;

	private result: IResult = {
		materialLibraries: [],
		models: []
	};

	constructor(fileContents: string, defaultModelName?: string) {
		this.fileContents = fileContents;

		if (defaultModelName !== undefined) {
			this.defaultModelName = defaultModelName;
		}
	}

	public parseAsync(): Promise<IResult> {
		return new Promise((resolve, reject) => {
			try {
				resolve(this.parse());
			} catch (theError) {
				reject(theError);
			}
		});
	}

	public parse(): IResult {
		const stripComments = (line: string) => {
			const commentIndex = line.indexOf("#");
			if (commentIndex > -1) {
				return line.substring(0, commentIndex);
			}
			return line;
		};

		const lines = this.fileContents.split("\n");
		for (const line of lines) {
			const strippedline = stripComments(line);

			const lineItems = strippedline
				.replace(/\s\s+/g, " ")
				.trim()
				.split(" ");

			switch (lineItems[0].toLowerCase()) {
				case "o": // Start A New Model
					this.parseObject(lineItems);
					break;
				case "g": // Start a new polygon group
					this.parseGroup(lineItems);
					break;
				case "v": // Define a vertex for the current model
					this.parseVertexCoords(lineItems);
					break;
				case "vt": // Texture Coords
					this.parseTextureCoords(lineItems);
					break;
				case "vn": // Define a vertex normal for the current model
					this.parseVertexNormal(lineItems);
					break;
				case "s": // Smooth shading statement
					this.parseSmoothShadingStatement(lineItems);
					break;
				case "f": // Define a Face/Polygon
					this.parsePolygon(lineItems);
					break;
				case "mtllib": // Reference to a material library file (.mtl)
					this.parseMtlLib(lineItems);
					break;
				case "usemtl": // Sets the current material to be applied to polygons defined from this point forward
					this.parseUseMtl(lineItems);
					break;
			}
		}

		return this.result;
	}

	private currentModel(): IModel {
		if (this.result.models.length === 0) {
			this.result.models.push({
				faces: [],
				name: this.defaultModelName,
				textureCoords: [],
				vertexNormals: [],
				vertices: []
			});
			this.currentGroup = "";
			this.smoothingGroup = 0;
		}

		return this.result.models[this.result.models.length - 1];
	}

	private parseObject(lineItems: string[]): void {
		const modelName =
			lineItems.length >= 2 ? lineItems[1] : this.defaultModelName;
		this.result.models.push({
			faces: [],
			name: modelName,
			textureCoords: [],
			vertexNormals: [],
			vertices: []
		});
		this.currentGroup = "";
		this.smoothingGroup = 0;
	}

	private parseGroup(lineItems: string[]): void {
		if (lineItems.length !== 2) {
			throw "Group statements must have exactly 1 argument (eg. g group_1)";
		}

		this.currentGroup = lineItems[1];
	}

	private parseVertexCoords(lineItems: string[]): void {
		const x = lineItems.length >= 2 ? parseFloat(lineItems[1]) : 0.0;
		const y = lineItems.length >= 3 ? parseFloat(lineItems[2]) : 0.0;
		const z = lineItems.length >= 4 ? parseFloat(lineItems[3]) : 0.0;

		this.currentModel().vertices.push({ x, y, z });
	}

	private parseTextureCoords(lineItems: string[]): void {
		const u = lineItems.length >= 2 ? parseFloat(lineItems[1]) : 0.0;
		const v = lineItems.length >= 3 ? parseFloat(lineItems[2]) : 0.0;
		const w = lineItems.length >= 4 ? parseFloat(lineItems[3]) : 0.0;

		this.currentModel().textureCoords.push({ u, v, w });
	}

	private parseVertexNormal(lineItems: string[]): void {
		const x = lineItems.length >= 2 ? parseFloat(lineItems[1]) : 0.0;
		const y = lineItems.length >= 3 ? parseFloat(lineItems[2]) : 0.0;
		const z = lineItems.length >= 4 ? parseFloat(lineItems[3]) : 0.0;

		this.currentModel().vertexNormals.push({ x, y, z });
	}

	private parsePolygon(lineItems: string[]): void {
		const totalVertices = lineItems.length - 1;
		if (totalVertices < 3) {
			throw `Face statement has less than 3 vertices`;
		}

		const face: IFace = {
			group: this.currentGroup,
			material: this.currentMaterial,
			smoothingGroup: this.smoothingGroup,
			vertices: []
		};

		for (let i = 0; i < totalVertices; i += 1) {
			const vertexString = lineItems[i + 1];
			const vertexValues = vertexString.split("/");

			if (vertexValues.length < 1 || vertexValues.length > 3) {
				throw `Two many values (separated by /) for a single vertex`;
			}

			let vertexIndex = 0;
			let textureCoordsIndex = 0;
			let vertexNormalIndex = 0;
			vertexIndex = parseInt(vertexValues[0], 10);
			if (vertexValues.length > 1 && vertexValues[1] !== "") {
				textureCoordsIndex = parseInt(vertexValues[1], 10);
			}
			if (vertexValues.length > 2) {
				vertexNormalIndex = parseInt(vertexValues[2], 10);
			}

			if (vertexIndex === 0) {
				throw "Faces uses invalid vertex index of 0";
			}

			// Negative vertex indices refer to the nth last defined vertex
			// convert these to postive indices for simplicity
			if (vertexIndex < 0) {
				vertexIndex =
					this.currentModel().vertices.length + 1 + vertexIndex;
			}

			face.vertices.push({
				textureCoordsIndex,
				vertexIndex,
				vertexNormalIndex
			});
		}
		this.currentModel().faces.push(face);
	}

	private parseMtlLib(lineItems: string[]): void {
		if (lineItems.length >= 2) {
			this.result.materialLibraries.push(lineItems[1]);
		}
	}

	private parseUseMtl(lineItems: string[]): void {
		if (lineItems.length >= 2) {
			this.currentMaterial = lineItems[1];
		}
	}

	private parseSmoothShadingStatement(lineItems: string[]): void {
		if (lineItems.length !== 2) {
			throw "Smoothing group statements must have exactly 1 argument (eg. s <number|off>)";
		}

		const groupNumber =
			lineItems[1].toLowerCase() === "off"
				? 0
				: parseInt(lineItems[1], 10);
		this.smoothingGroup = groupNumber;
	}
}

interface IResult {
	models: IModel[];
	materialLibraries: string[];
}

interface IModel {
	name: string;
	vertices: IVertex[];
	textureCoords: ITextureVertex[];
	vertexNormals: IVertex[];
	faces: IFace[];
}

interface IFace {
	material: string;
	group: string;
	smoothingGroup: number;
	vertices: IFaceVertexIndicies[];
}

interface IFaceVertexIndicies {
	vertexIndex: number;
	textureCoordsIndex: number;
	vertexNormalIndex: number;
}

interface IVertex {
	x: number;
	y: number;
	z: number;
}

interface ITextureVertex {
	u: number;
	v: number;
	w: number;
}
