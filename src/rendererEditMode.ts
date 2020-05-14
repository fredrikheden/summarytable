import powerbi from "powerbi-visuals-api";
import VisualObjectInstance = powerbi.VisualObjectInstance;
import { Visual } from './visual';
import { Renderer } from "./renderer";
import { VisualSettings } from "./settings";
import * as Utils from "./jsUtils";
import { RendererEditModeDesigner } from "./rendererEditMode_Designer";
import { RendererEditModeRawJson } from "./rendererEditMode_RawJson";

export class RendererEditMode {
    public visual: Visual;
    public renderer: Renderer;
    public editorContainer: HTMLDivElement = null;
    public btnSave : HTMLInputElement;
    public btnLoadFromFieldList : HTMLInputElement;
    private designMode: boolean = true;
    private EditModeRenderer = null; // Reference to the current renderer (edit mode or raw)
    private switchInputRef:HTMLInputElement = null;

    constructor(visual: Visual, renderer: Renderer) {
        this.visual = visual;
        this.renderer = renderer;
    }

    private CreateSwitchElement() : HTMLElement {
       var Switch1 = document.createElement("div");
       Switch1.style.display = "inline-block";
       Switch1.style.paddingLeft = "40px";
       var label1 = document.createElement("label");
       var input1 = document.createElement("input");
       var span1 = document.createElement("span");
       var span2 = document.createElement("span");
       var txt1 = document.createTextNode("Code view");
       label1.appendChild(input1);
       label1.appendChild(span1);
       Switch1.appendChild(label1);
       Switch1.appendChild(span2);
       span2.appendChild(txt1);
       label1.className = "switch";
       input1.type = "checkbox";
       input1.checked = !this.designMode;
       span1.className = "slider round";
       span2.style.paddingLeft = "7px";
       var thisRef = this;
       input1.onchange = (e) => {
            var et = e.target as HTMLInputElement;
            thisRef.ChangeEditMode(et.checked);
       };
       this.switchInputRef = input1;
       return Switch1;
    }

    private ChangeEditMode( rawJsonMode: boolean ) {
        if ( !this.designMode ) {
            // We are in code view, switching to design view. We need to store the json before rendering.
            var s = this.EditModeRenderer.GetValue();
            try {
                var tableDefTmp = JSON.parse(s);
                this.visual.settings.dataPoint.tableConfiguration = s;
            } 
            catch {
                // Json is not wellformed, do not switch to design mode.
                this.switchInputRef.checked = true;
                return;
            }           
            
        }
        this.designMode = !rawJsonMode;
        this.visual.ClearAllContent();
        this.RenderEditMode(this.visual.target, this.visual.settings)
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
        target.appendChild(this.CreateSwitchElement());

        var divContainer : HTMLDivElement = document.createElement("div");
        divContainer.style.height = "93%"; // With 100% we get scrollbars in edit mode.
        target.appendChild(divContainer);
        this.editorContainer = divContainer;  

        if ( this.designMode ) {
            // Render design mode editor here
            var EditModeDesigner = new RendererEditModeDesigner(this);
            EditModeDesigner.RenderEditMode_Designer(this.editorContainer, settings);
            this.EditModeRenderer = EditModeDesigner;
        }
        else {
            // Render raw json editor here
            var EditModeRawJson = new RendererEditModeRawJson(this);
            EditModeRawJson.RenderEditMode_RawJson(this.editorContainer, settings);
            this.EditModeRenderer = EditModeRawJson;
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
        "headerStyle": "#columnHeaderStyle#",
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
                j1 = j1.replace(/%ROWSTYLE%/g, '#columnRowHeaderStyle#');
            } else {
                j1 = j1.replace(/%TITLECOLNAME%/g, col.displayName);
                j1 = j1.replace(/%COLTYPE%/g, 'Data');                  
                j1 = j1.replace(/%ROWSTYLE%/g, '#columnRowStyle#');
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
        "rowStyle": "#rowRowStyle#",
        "visible": true,
        "cellRowHeaderStyle": "#rowHeaderStyle#",
        "cellRowDataStyle": "#rowDataStyle#"
    },`;
            j1 = j1.replace(/%ROWTITLE%/g, row.title); 
            j1 = j1.replace(/%FORMULA%/g, row.name); 
            rowJson += j1;
        }
        rowJson = rowJson.substr(0, rowJson.length-1);
        var fullJson = `
{
"reusableCSS": [
    {
        "key": "#columnHeaderStyle#",
        "value": "border-bottom:1px;border-bottom-color:#eee;border-bottom-style:solid;background-color:#eee"
    },	
    {
        "key": "#columnRowHeaderStyle#",
        "value": "text-align:left;white-space:nowrap;overflow:hidden"
    },
    {
        "key": "#columnRowStyle#",
        "value": ""
    },
    {
        "key": "#rowRowStyle#",
        "value": ""
    },
    {
        "key": "#rowHeaderStyle#",
        "value": ""
    },
    {
        "key": "#rowDataStyle#",
        "value": ""
    }
],    
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
