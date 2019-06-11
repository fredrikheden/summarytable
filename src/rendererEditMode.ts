import powerbi from "powerbi-visuals-api";
import VisualObjectInstance = powerbi.VisualObjectInstance;
import { Visual } from './visual';
import { Renderer } from "./renderer";
import { VisualSettings } from "./settings";
import * as Utils from "./jsUtils";

export class RendererEditMode {
    private visual: Visual;
    private renderer: Renderer;
    private editModeJsonEditor: HTMLTextAreaElement = null;

    constructor(visual: Visual, renderer: Renderer) {
        this.visual = visual;
        this.editModeJsonEditor = document.createElement("textarea");
        this.renderer = renderer;
    }

    public RenderEditMode(target: HTMLElement,  settings: VisualSettings) {
        var btnSave : HTMLInputElement = document.createElement("input");
        var btnLoadFromFieldList : HTMLInputElement = document.createElement("input");
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
        divContainer.style.height = "94%"; // With 100% we get scrollbars in edit mode.
        target.appendChild(divContainer);
        var txtJson: HTMLTextAreaElement = this.editModeJsonEditor = document.createElement("textarea");
        var divRenderInEditMode = document.createElement("div");
        divContainer.appendChild(txtJson);
        divContainer.appendChild(divRenderInEditMode);
        txtJson.className = "TextCodeBox";
        txtJson.value = settings.dataPoint.tableConfiguration;

        if ( !Utils.containsValue(txtJson.value)  ) {
            this.EditModeCreateTemplateFromFieldList();
        }      

        txtJson.onkeydown = function(e){
            if(e.keyCode==9 || e.which==9){
                e.preventDefault();
                var s = txtJson.selectionStart;
                txtJson.value = txtJson.value.substring(0,txtJson.selectionStart) + "\t" + txtJson.value.substring(txtJson.selectionEnd);
                txtJson.selectionEnd = s+1;
            }
        }
        txtJson.onkeyup = function(e){
            try {
                var tableDefTmp = JSON.parse(txtJson.value);
                that.renderer.RenderAllContent(divRenderInEditMode, tableDefTmp);    
            } 
            catch(e) {
                divRenderInEditMode.innerHTML = "No valid JSON.";
            }
        }
        var that = this;
        btnLoadFromFieldList.onclick = function(e) {
            that.EditModeCreateTemplateFromFieldList();
            txtJson.onkeyup(null);
        }
        btnSave.onclick = function(e) {
            settings.dataPoint.tableConfiguration = txtJson.value;                
            let general: VisualObjectInstance[] = [{
                objectName: "dataPoint",
                displayName: "Data colors",
                selector: null,
                properties: {
                    tableConfiguration: txtJson.value
                }
            }];
            that.visual.getHost().persistProperties(general);
        }

        var tableDefTmp = JSON.parse(txtJson.value);
        that.renderer.RenderAllContent(divRenderInEditMode, tableDefTmp);
    }

    private EditModeCreateTemplateFromFieldList() {
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
        this.editModeJsonEditor.value = fullJson;
    }
}
