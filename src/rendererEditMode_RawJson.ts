import powerbi from "powerbi-visuals-api";
import VisualObjectInstance = powerbi.VisualObjectInstance;
import { Visual } from './visual';
import { Renderer } from "./renderer";
import { RendererEditMode } from "./rendererEditMode";
import { VisualSettings } from "./settings";
import * as Utils from "./jsUtils";

export class RendererEditModeRawJson {
    private rendererEditModeBase: RendererEditMode;
    private rawEditor: HTMLTextAreaElement

    constructor(editor: RendererEditMode) {
        this.rendererEditModeBase = editor;
    }

    public GetValue(): string {
        return this.rawEditor.value;
    }

    private getFormattedJson(json:string):string {
        try {
            var o = JSON.parse(json);
            var str = JSON.stringify(o, null, "\t");
            return str;
        }
        catch {
            return json;
        }
    }

    public RenderEditMode_RawJson(target: HTMLElement,  settings: VisualSettings) {
        var txtEditor: HTMLTextAreaElement = this.rawEditor = document.createElement("textarea");
        var divRenderInEditMode = document.createElement("div");
        target.appendChild(txtEditor);
        target.appendChild(divRenderInEditMode);
        txtEditor.className = "TextCodeBox";
        txtEditor.value = this.getFormattedJson(settings.dataPoint.tableConfiguration);

        if ( !Utils.containsValue(txtEditor.value)  ) {
            txtEditor.value = this.rendererEditModeBase.GetTemplateFromFieldList();
        }
        
        txtEditor.onkeydown = (e) => {
            if(e.keyCode===9 || e.which===9){
                e.preventDefault();
                var s = txtEditor.selectionStart;
                txtEditor.value = txtEditor.value.substring(0,txtEditor.selectionStart) + "\t" + txtEditor.value.substring(txtEditor.selectionEnd);
                txtEditor.selectionEnd = s+1;
            }
        }
        txtEditor.onkeyup = (e) => {
            try {
                var tableDefTmp1 = JSON.parse(txtEditor.value);
                that.rendererEditModeBase.renderer.RenderAllContent(divRenderInEditMode, tableDefTmp1);    
            } 
            catch(e) {
                Utils.clearHtmlElement(divRenderInEditMode);
                divRenderInEditMode.appendChild(document.createTextNode("No valid JSON."));
            }
        }
        
        var that = this;
        this.rendererEditModeBase.btnLoadFromFieldList.onclick = (e) => {
            txtEditor.value = that.rendererEditModeBase.GetTemplateFromFieldList();
            txtEditor.onkeyup(null);
        }
         this.rendererEditModeBase.btnSave.onclick = (e) => {
            that.rendererEditModeBase.Save(settings,  txtEditor.value);
        }


        var tableDefTmp = JSON.parse(txtEditor.value);
        that.rendererEditModeBase.renderer.RenderAllContent(divRenderInEditMode, tableDefTmp);
    }

}
