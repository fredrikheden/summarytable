import powerbi from "powerbi-visuals-api";
import VisualObjectInstance = powerbi.VisualObjectInstance;
import { Visual } from './visual';
import { Renderer } from "./renderer";
import { RendererEditMode } from "./rendererEditMode";
import { VisualSettings } from "./settings";
import * as Utils from "./jsUtils";

export class RendererEditMode_Designer {
    private rendererEditModeBase: RendererEditMode;

    constructor(editor: RendererEditMode) {
        this.rendererEditModeBase = editor;
    }

    public RenderEditMode_Designer(target: HTMLElement,  settings: VisualSettings) {
        var a = document.createElement("div");
        a.appendChild( document.createTextNode( "Designer does here...") );
        target.appendChild(a);
    }

}
