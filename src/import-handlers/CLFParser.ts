import { BREADCRUMBS_COLLAPSED } from "@blueprintjs/core/lib/esm/common/classes";
import { ifError } from "assert";
import { forInRight, fromPairs } from "lodash";
import {Octave, ThirdOctave} from "../compute/acoustics/bands";
import {directivityData} from "../objects/source";

export class CLFParser{

    // TODO: 
    // - add support for comma decimal seperator 
    // - fix vertical symmetry (not getting caught in switch statement)
    // - add support for rotation 
    // - add support for phase data (CLF2 v2)

    private fileContents: string; 
    private clfData: string[][]; 
    private clfVersion: number;
    
    private phi: number[];
    private theta: number[];
    private frequencies: number[];
    private angleres: number; 

    private radiation: string; 

    private minband: number;
    private maxband: number; 

    constructor(fileContents: string){

        // get array of raw data
        this.fileContents = fileContents; 
        this.clfData = this.getCLFArray(this.fileContents);

        // check that file is valid
        //if(!this.isvalid()){
            //console.error("Invalid CLF file")
        //}

        //get CLF version
        this.clfVersion = parseInt(this.clfData[0][0].substring(4,5));

        //get min band, max band, radiation type
        this.minband = this.parseProperty("<MINBAND>").result;
        this.maxband = this.parseProperty("<MAXBAND>").result;
        this.radiation = this.parseProperty("<RADIATION>").result; 

        // define frequencies and angle resolution based on clf version (1 or 2)
        switch (this.clfVersion){
            case 1:
                this.frequencies = Octave(this.minband, this.maxband);
                this.angleres = 10; 
                break;
            case 2:
                this.frequencies = ThirdOctave(this.minband, this.maxband);
                this.angleres = 5; 
                break;
            default:
                console.error("Unsupported CLF version or not a CLF file");
                this.frequencies = [];
                this.angleres = 0;
        }

        // create theta list based on radiation type
        if(this.radiation == "<halfsphere>"){
            this.theta = this.createAngleList(0,this.angleres,90);
        }else{
            this.theta = this.createAngleList(0,this.angleres,180);
        }

        // create phi list 
        this.phi = this.createAngleList(0,this.angleres,360-this.angleres);
    }

    public parse(): CLFResult {

        let result: CLFResult = {
            clfversion: this.clfVersion,

            speakerName: "",
            speakerDescription: "", 
            speakerType: "", 
            
            symmetry: "",
            arcorder: "", 
            sign: "",
            reference: "",  

            measurementDistance: 0,

            phi: this.phi,
            theta: this.theta,
            frequencies: this.frequencies,
            minband: this.frequencies[0],
            maxband: this.frequencies[this.frequencies.length-1],
            angleres: this.angleres,

            sensitivity: [], 
            impedance: [],
            axialspectrum: [],
            
            directivity: [], 
        } 

        // read speaker name, description, type
        result.speakerName = this.parseProperty("<MODELNAME>").result;
        result.speakerDescription = this.parseProperty("<DESCRIPTION>").result;
        result.speakerType = this.parseProperty("<TYPE>").result;

        // read symmetry, arcorder, sign, reference
        result.symmetry = this.parseProperty("<BALLOON-SYMMETRY>").result;
        result.arcorder = this.parseProperty("<BALLOON-ARC-ORDER>").result;
        result.sign = this.parseProperty("<SIGN>").result;
        result.reference = this.parseProperty("<BALLOON-REF>").result;

        // read measurement distance
        result.measurementDistance = this.parseProperty("<MEASUREMENT-DISTANCE>").result;

        // read sensitivity, impedance, axial spectrum
        result.sensitivity = this.parseProperty("<SENSITIVITY>").result;
        result.impedance = this.parseProperty("<IMPEDANCE>").result;
        result.axialspectrum = this.parseProperty("<AXIAL-SPECTRUM>").result;

        // get directivity data at each frequency, apply symmetry (if specified), reverse (if specified)
        for(let i:number = 0; i<this.frequencies.length; i++){

            let sym = String(result.symmetry); 
            result.directivity[i] = this.applySymmetry(sym, this.parseDirectivity(this.frequencies[i]));

            if(result.arcorder == "<reversed>"){
                result.directivity[i].directivity.reverse();
            }
        }

        return result;

    };

    public parseProperty(property: string, rowStartIndex: number = 0): parsePropertyResult{
        // returns value of a property in the CLF file specified as "property" (including '<' and '>')
        // starts searching in the CLF file at optional value 'rowStartIndex'

        let result: any = []; 
        let property_re = new RegExp(property);

        //for every row in clfData
        for(let i:number = rowStartIndex; i<this.clfData.length;i++){

            // for every column in row 
            for(let j = 0; j<this.clfData[i].length;j++){

                // if the array item passes the RegExp test() method (matching strings)
                if(property_re.test(this.clfData[i][j])){

                    // for each column in the row after the tag
                    for(let k = j+1; k<this.clfData[i].length;k++){
                        
                        //try to convert value to number
                        const floatConversion = parseFloat(this.clfData[i][k]);
                        if(!isNaN(floatConversion)){
                            //result is a number
                            result.push(floatConversion);
                        }else{
                            //result is a string

                            const comment_re = /(#\w+)/; // regexp defining the beginning of a comment
                            const empty_re = /^(?![\s\S])/; // regexp defining an empty character  
                            const newtag_re = /(<[A-Z]+>)/; //regexp defining the beginning of a tag (starting/ending with <> and all caps) 
                            const nodata_re = /<nodata>/; //regexp to match nodata tags 

                            let stringData = this.clfData[i][k];

                            // string checking
                            if(comment_re.test(stringData)){
                                // data is a comment. skip the rest of the line
                                break;
                            }else if(newtag_re.test(stringData)){
                                // data is a tag. skip the rest of the line
                                break; 
                            }else if(stringData=="" || stringData =="\n" || stringData =="\t" || stringData =="\r"){
                                // data is empty. skip this element
                                continue; 
                            }else if(nodata_re.test(stringData)){
                                // data is <nodata>. push a 0 for now. 
                                result.push(0);
                                continue; 
                            }else{
                                // everything passed, push data to result. 
                                result.push(stringData);
                            }
                        }
                    }

                    let pr: parsePropertyResult = {
                        result: result,
                        nextIndex: i+1,
                    };

                    if (pr.result.length == 1){
                        pr.result = result[0];
                        return pr; 
                    }else{
                        return pr;
                    }
                }
            }   
        }

        //catch 
        let pr: parsePropertyResult = {
            result: "",
            nextIndex: 0,
        };
       return pr;
    }

    public parseDirectivity(band: number): directivityData{
        // get the directivity data of an octave band in a CLF file

        let dirData: directivityData = {
            frequency: band, 
            directivity: [], 
        };

        // check that frequency is valid
        if(!this.frequencies.includes(band)){
            console.error("Invalid Frequency Band!")
            return dirData; 
        }

        let search: boolean = true; 
        let searchStart: number = 0; 

        let dir: number[][];
        dir = Array(Array());

        while(search){
            let parseResult = this.parseProperty("<BAND>",searchStart)
            searchStart = parseResult.nextIndex; 

            if(typeof parseResult.result === "number" && band == parseResult.result){
                let parsing: boolean = true; 
                let nextBandIndex: number; 

                nextBandIndex = this.parseProperty("<BAND>", searchStart).nextIndex; 

                let j = 0; 
                for(let i = parseResult.nextIndex; i<nextBandIndex-1; i++){
                    dir[j] = this.parseRowAsNumber(i);
                    j++;
                }
                
                dirData.directivity = dir; 
                search = false; 
            }
        }
        return dirData; 
    }

    private parseRowAsNumber(rowNumber: number): number[]{
        let row: string[] = this.clfData[rowNumber];
        let rowAsNum: number[] = Array();

        for(let i = 0; i<row.length; i++){
            rowAsNum.push(parseFloat(row[i]));
        }

        return rowAsNum; 
    } 

    private applySymmetry(symmetryType: string, baseDirData: directivityData): directivityData{
        //apply specified symmetry to a single directivityData interface 

        let resultDir: number[][] = Array(Array());

        let copyBlock: number[][] = Array(Array());
        let copyBlockRev: number[][]; 

        switch (symmetryType.trim()){
            // see CLF Specification pdf for more info re: symmetry types

            case "<full>":
                //radial symmetry about front of speaker (Q1 given)

                copyBlock = baseDirData.directivity.slice(0,(this.phi.length/4)+1);
                copyBlockRev = (copyBlock.slice(0,(this.phi.length/4))).reverse();

                resultDir = copyBlock.concat(copyBlockRev); 

                let horzTemp: directivityData = {
                    frequency: baseDirData.frequency,
                    directivity: resultDir, 
                };

                let horzAppliedDirData = this.applySymmetry("<horizontal>", horzTemp);
                resultDir = horzAppliedDirData.directivity; 

                break;

            case "<horizontal>":
                //left/right symmetry (Q1 and Q2 given)
                copyBlock = baseDirData.directivity.slice(0,(this.phi.length/2)+1);
                copyBlockRev = (copyBlock.slice(1,(this.phi.length/2))).reverse();
                resultDir = copyBlock.concat(copyBlockRev); 

                break; 

            case "<vertical>":
                //top/bottom symmetry (Q4 and Q1 given)

                let Q4: number[][] = baseDirData.directivity.slice(0,this.phi.length/4);
                let Q1: number[][] = baseDirData.directivity.slice(this.phi.length/4, this.phi.length/2);                                          

                let Q1Q2_temp: directivityData = {
                    frequency: baseDirData.frequency,
                    directivity: Q1,
                }

                let Q3Q4_temp: directivityData = {
                    frequency: baseDirData.frequency,
                    directivity: Q4, 
                }

                let Q1Q2 = this.applySymmetry("<Full>", Q1Q2_temp).directivity.slice(0,this.phi.length/2); 
                let Q3Q4 = this.applySymmetry("<Full>", Q3Q4_temp).directivity.slice(0,this.phi.length/2);

                resultDir = Q1Q2.concat(Q3Q4.reverse());

                break;

            case "<rotational>": 
                //copy first slice over entire balloon
                copyBlock[0] = baseDirData.directivity[0];

                for(let i = 0; i<this.phi.length; i++){
                    resultDir[i] = copyBlock[0];
                }

                break; 

            default: 
                //no symmetry or type not recognized. return unmodified directivity array
                resultDir = baseDirData.directivity; 
                break;
        }

        baseDirData.directivity = resultDir; 
        return baseDirData; 
    }
        
    private isvalid(): boolean{
        //check if a CLF file is valid based on the "<CLFn>" tag that should come first

        if (this.clfData[0][0] == "<CLF1>" || this.clfData[0][0] == "<CLF2>"){
            return true;
        }
        else{
            return false; 
        }
    }

    private getCLFArray(contents: string): string[][]{
        //get array of raw CLF data

        let clfArray =  contents.split('\n').map(function(ln){
            return ln.split('\t');
        });
        return clfArray; 
    }

    private createAngleList(min: number, increment: number, max: number): number[]{
        // create a list of angles based on min, max, and increment

        let numangles: number = (max-min)/increment; 
        let angle: number  = min; 

        let list: number[] = Array(numangles);

        for(let i = 0; i <= numangles; i++){
            list[i] = angle; 
            angle = angle+increment; 
        }

        return list
    }

}

interface parsePropertyResult{
    result: any; 
    nextIndex: number;
}

export interface CLFResult {
    clfversion: number; 

    speakerName: string;
    speakerDescription: string; 
    speakerType: string; 
    
    symmetry: string;
    arcorder: string; 
    sign: string; 
    reference: string;  

    measurementDistance: number;

    phi: number[]; 
    theta: number[];
    frequencies: number[]; 
    minband: number; 
    maxband: number; 
    angleres: number; 

    sensitivity: number[]; 
    impedance: number[]; 
    axialspectrum: number[];
    
    directivity: directivityData[]; 
}
