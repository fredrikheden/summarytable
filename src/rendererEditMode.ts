import powerbi from "powerbi-visuals-api";
import VisualObjectInstance = powerbi.VisualObjectInstance;
import { Visual } from './visual';
import { Renderer } from "./renderer";
import { VisualSettings } from "./settings";
import * as Utils from "./jsUtils";
import { RendererEditMode_Designer } from "./rendererEditMode_Designer";
import { RendererEditMode_RawJson } from "./rendererEditMode_RawJson";


export class RendererEditMode {
    public visual: Visual;
    public renderer: Renderer;
    public editorContainer: HTMLDivElement = null;
    public btnSave : HTMLInputElement;
    public btnLoadFromFieldList : HTMLInputElement;
    private designMode: boolean = true;

    constructor(visual: Visual, renderer: Renderer) {
        this.visual = visual;
        this.renderer = renderer;
    }

    public RenderEditMode(target: HTMLElement,  settings: VisualSettings) {
        var btnSave : HTMLInputElement = this.btnSave = document.createElement("input");
        var btnLoadFromFieldList : HTMLInputElement = this.btnLoadFromFieldList = document.createElement("input");
        btnSave.type = "button";
        btnSave.value = "Save";
        btnSave.className = "inputButton";
        btnLoadFromFieldList.type = "button";
        btnLoadFromFieldList.value = "Generate template from field list";
        btnLoadFromFieldList.title = "Note! This will replace the current configuration.";
        btnLoadFromFieldList.className = "inputButton";
        target.appendChild(btnSave);
        target.appendChild(btnLoadFromFieldList);
        var divContainer : HTMLDivElement = document.createElement("div");
        divContainer.style.height = "93%"; // With 100% we get scrollbars in edit mode.
        target.appendChild(divContainer);
        this.editorContainer = divContainer;  

        if ( this.designMode ) {
            // Render design mode editor here
            var EditModeDesigner = new RendererEditMode_Designer(this);
            EditModeDesigner.RenderEditMode_Designer(this.editorContainer, settings);
        }
        else {
            // Render raw json editor here
            var EditModeRawJson = new RendererEditMode_RawJson(this);
            EditModeRawJson.RenderEditMode_RawJson(this.editorContainer, settings);
        }
    }

    public Save(settings: VisualSettings, json:string) {
        settings.dataPoint.tableConfiguration = json;            
        let general: VisualObjectInstance[] = [{
            objectName: "dataPoint",
            displayName: "Data colors",
            selector: null,
            properties: {
                tableConfiguration: json
            }
        }];
        this.visual.getHost().persistProperties(general);
    }

    public GetTemplateFromFieldList():string {
        // Columns
        var model = this.visual.getModel();
        var colJson = "";
        for( var c=0; c<model[0].values.length; c++) {
            var col = model[0].values[c];
            var j1 = `
    {
        "headerStyle": "border-bottom:1px;border-bottom-color:#eee;border-bottom-style:solid",
        "rowStyle": "%ROWSTYLE%",
        "width": 150,
        "type": "%COLTYPE%",
        "refName": "%REFNAME%", 
        "title": "%TITLECOLNAME%",
        "calculationFormula": "", 
        "format": ""
    },`;
            if ( c === 0) {
                j1 = j1.replace(/%TITLECOLNAME%/g, '');
                j1 = j1.replace(/%COLTYPE%/g, 'RowHeader');
                j1 = j1.replace(/%ROWSTYLE%/g, 'text-align:left');
            } else {
                j1 = j1.replace(/%TITLECOLNAME%/g, col.displayName);
                j1 = j1.replace(/%COLTYPE%/g, 'Data');                  
                j1 = j1.replace(/%ROWSTYLE%/g, '');
            }
            j1 = j1.replace(/%REFNAME%/g, col.refName);
            colJson += j1;
        }
        colJson = colJson.substr(0, colJson.length-1);
        // Rows (de tre första)
        var rowJson = "";
        for( var r=0; r<model.length && r<7; r++) {
            var row = model[r];
            var j1 = `
    {
        "title": "%ROWTITLE%",
        "formula": "%FORMULA%",
        "rowStyle": "",
        "visible": true,
        "cellRowHeaderStyle": "",
        "cellRowDataStyle": ""
    },`;
            j1 = j1.replace(/%ROWTITLE%/g, row.title); 
            j1 = j1.replace(/%FORMULA%/g, row.name); 
            rowJson += j1;
        }
        rowJson = rowJson.substr(0, rowJson.length-1);
        var fullJson = `
{
"columns": [
%COLS%
],
"rows": [
%ROWS%
],
"headerRow": {
    "rowStyle": ""
},
"displayAllRows": false
}
        `;
        fullJson = fullJson.replace(/%COLS%/g, colJson); 
        fullJson = fullJson.replace(/%ROWS%/g, rowJson); 
        return fullJson;
    }
}
