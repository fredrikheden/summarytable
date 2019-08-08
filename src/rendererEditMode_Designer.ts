import powerbi from "powerbi-visuals-api";
import VisualObjectInstance = powerbi.VisualObjectInstance;
import { Visual } from './visual';
import { Renderer } from "./renderer";
import { RendererEditMode } from "./rendererEditMode";
import { VisualSettings } from "./settings";
import * as Utils from "./jsUtils";
import * as JSONEditor from "@json-editor/json-editor"
import { configSchema } from './configSchema';

export class RendererEditMode_Designer {
    private rendererEditModeBase: RendererEditMode;

    constructor(editor: RendererEditMode) {
        this.rendererEditModeBase = editor;
    }

    public RenderEditMode_Designer(target: HTMLElement,  settings: VisualSettings) {
        var divEditor = document.createElement("div");
        divEditor.className='newEditor';
        var divRenderInEditMode = document.createElement("div");
        var jsoneditor: JSONEditor = null;
        var tableConfigJSON = settings.dataPoint.tableConfiguration;
        if ( !Utils.containsValue(tableConfigJSON)  ) {
            tableConfigJSON = this.rendererEditModeBase.GetTemplateFromFieldList();
            settings.dataPoint.tableConfiguration=tableConfigJSON;
        }
        var tableConfigOject = JSON.parse(tableConfigJSON);
        try {
            jsoneditor = new JSONEditor(divEditor, {
                theme: 'bootstrap4',
                disable_properties: true,
                no_additional_properties: true,
                schema: configSchema,
                prompt_before_delete: false,
                startval: tableConfigOject
            });
            var that = this;
            jsoneditor.on('change', function () {
                var tableConfig = jsoneditor.getValue();
                settings.dataPoint.tableConfiguration = JSON.stringify(tableConfig);
                that.rendererEditModeBase.renderer.RenderAllContent(divRenderInEditMode, tableConfig); 
                //var validation_errors = jsoneditor.validate();
                // Show validation errors if there are any           
            });

        } catch (e) {
            console.log(e);
        }

        var that = this;
        this.rendererEditModeBase.btnLoadFromFieldList.onclick = function(e) {
            var tmpTableConfig = that.rendererEditModeBase.GetTemplateFromFieldList();
            settings.dataPoint.tableConfiguration=tmpTableConfig;
            jsoneditor.setValue(JSON.parse(tmpTableConfig));
        }
         this.rendererEditModeBase.btnSave.onclick = function(e) {
            that.rendererEditModeBase.Save(settings,  settings.dataPoint.tableConfiguration);
        }
        target.appendChild(divEditor);
        target.appendChild(divRenderInEditMode);
    }

}
