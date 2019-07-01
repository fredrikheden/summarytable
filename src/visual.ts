// TODO: Cross filtering by clicking on a row.
// TODO: Possibility to use themes.
// TODO: What does n/a mean? Is it different from a blank value?
// TODO: Possibililty to do drill-down (summaryMatrix)
// TODO: Possibility to reference rows below.

// OK: Default font/size. => Använd border style till detta.
// OK: Manage line breaks.
// OK: Reference a measure (column) in title fields
// OK: Master header
// OK: Use json from dataset.

// TODO: Add possibility to use expressions for styles.
// TODO: Use a better code editor with highlighting
// OK: Dynamic column namnes, based on expressions.
// TODO: Cross-filter by clicking on a row.
// TODO: Make it possible fo choose from different predefined style templates.
// TODO: Separate hover style effect.

// Format %: 0.0 %;-0.0 %;0.0 %               #,0
// Format number thousand separator: #,0
// Format number 4 decimals: #.0000


"use strict";
import "@babel/polyfill";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

// powerbi.extensibility.utils.formatting
import {
    valueFormatter as vf,
    textMeasurementService as tms
} from "powerbi-visuals-utils-formattingutils";
import TextProperties = tms.TextProperties;
import textMeasurementService = tms.textMeasurementService;
import valueFormatter = vf.valueFormatter;

import { VisualSettings } from "./settings";
import { Renderer } from "./renderer";
import { RendererEditMode } from "./rendererEditMode";

 function visualTransform(options: VisualUpdateOptions, thisRef: Visual) : any {            
    let dataViews = options.dataViews;
    var a = options.dataViews[0].metadata.columns[1];

    let tblView = dataViews[0].table;

    var tblData = [];
    thisRef.tableDefinitionFromDataset = null;
    for( var i = 0; i < dataViews[0].table.rows.length; i++) {
        var r = dataViews[0].table.rows[i];
        var colData  = [];
        for(var t = 0; t<r.length; t++) {
            var rawValue =  r[t];
            var columnName =  dataViews[0].table.columns[t].displayName;
            if ( columnName === 'json' ) {
                // SPecial handling of json string in dataset
                thisRef.tableDefinitionFromDataset = rawValue;
            } else {
                var formatString =  dataViews[0].table.columns[t].format;
                var isColumnNumeric = dataViews[0].table.columns[t].type.numeric;
                colData.push( { rawValue: rawValue, formatString: formatString, displayName: columnName, refName: "[" + columnName + "]", isNumeric: isColumnNumeric  } );
            }
        }
        var row = {
            title : dataViews[0].table.rows[i][0],
            name : "[" + dataViews[0].table.rows[i][0] + "]",
            values: colData,
        };
        tblData.push(row);
    }
    return tblData;
}      

export class Visual implements IVisual {
    private target: HTMLElement;
    private settings: VisualSettings;
    private tableDefinition: any;
    private model: any;
    private host: any;
    private internalVersionNo: string = "3.0.0";
    public tableDefinitionFromDataset: any;
    private renderer: Renderer;
    private rendererEditMode: RendererEditMode;

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.target = options.element;
        this.renderer = new Renderer(this);
        this.rendererEditMode = new RendererEditMode(this, this.renderer);
    }

    public getModel(): any {
        return this.model;
    }

    public getHost(): any {
        return this.host;
    }

    private getTableDefinition(): string  {
        this.tableDefinition = null;
        var errorMsg = "";
        if ( this.tableDefinitionFromDataset !== null && this.tableDefinitionFromDataset.length > 0  ) {
            // If a table definition is defined in the dataset, use that one.
            try {
                this.tableDefinition = JSON.parse(this.tableDefinitionFromDataset);
            }
            catch(e) {
                errorMsg = "Error parsing table definition from dataset. " + e;
            }
        }  
        else {
            if ( this.settings.dataPoint.tableConfiguration.trim().length > 0 ) {
                try {
                    this.tableDefinition = JSON.parse(this.settings.dataPoint.tableConfiguration);
                }
                catch(e) {
                    errorMsg = "Error parsing table definition. Enter edit mode and correct the error.";
                }
            }
        }   
        return errorMsg;
    }

    public RenderVersionNo() {
        var a = document.createElement("div");
        a.style.display = "none";
        a.innerHTML = "Version: " + this.internalVersionNo;
        this.target.appendChild(a);
    }
 
    private ClearAllContent() {
        this.target.innerHTML = "";
    }

    public update(options: VisualUpdateOptions) {
        var w = options.viewport.width;
        var h = options.viewport.height;
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
        this.model  = visualTransform(options, this);
        this.tableDefinition = null;
        var errorMsg = this.getTableDefinition();
       
        if ( options.editMode === 1 ) {
            this.ClearAllContent();
            this.rendererEditMode.RenderEditMode(this.target, this.settings);
        } else {
            if ( errorMsg.length === 0 ) {
                this.ClearAllContent();
                this.renderer.RenderAllContent(this.target, this.tableDefinition);
            } else {
                this.target.innerHTML = "<div>"+errorMsg+"</div>"
            }
        }
        this.target.style.overflow = "auto";

        this.RenderVersionNo();
    }    

    private static parseSettings(dataView: DataView): VisualSettings {
        return VisualSettings.parse(dataView) as VisualSettings;
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
}