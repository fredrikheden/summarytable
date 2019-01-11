// TODO: Cross-filter
// TODO: Kunna välja mellan olika templates (som bara applicerar styles)
// TODO: Felhantering
// TODO: Lägg till möjlighet att använda ett expression för att sätta styles.
// TODO: Separat style för hover-effekt på radnivå.
// TODO: Dynamiska kolumnnamn (baserade på expressions)
// TODO: Referera till befintliga rader i formler (så att man inte behöver skriva samtliga fält igen)

// Format %: 0.0 %;-0.0 %;0.0 %               #,0
// Format number: #,0


/*
        {
            headerStyle: "border-bottom:1px;border-bottom-color:#eee;border-bottom-style:solid", // The style applied on the header row
            rowStyle: "", // The style applied on the rest of the rows for this column
            width: 150, // Width in pixels of column
            type: "%COLTYPE%", // Possible values: RowHeader, Data, Calculation
            refName: "%REFNAME%", // Reference to column including brackets, e.g. "[Savings]"
            title: "%TITLECOLNAME%", // Title of column
            calculationFormula: "", // Only used for calculation columns, e.g. "[Savings]/[Spend]"
            format: ""  // Only used for calculation columns
        },`;

{
            title: "%ROWTITLE%", // The title of the row (the first column)
            formula : "%FORMULA%", // The formula for the row, e.g. "[Övrigt material] + [Kontorsmaterial]"
            rowStyle: "", // The style applied on the whole row.
            visible: true,
            cellRowHeaderStyle: "text-align:left;",  // The style applied on the row title (first column)
            cellRowDataStyle: "" // The style applied onthe rest of the columns on the row
        },`;        
*/

import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;

module powerbi.extensibility.visual {
    "use strict";

    //function visualTransform(options: VisualUpdateOptions, host: IVisualHost, thisRef: Visual): VisualViewModel {            
    function visualTransform(options: VisualUpdateOptions, thisRef: Visual) : any {            
        let dataViews = options.dataViews;
        var a = options.dataViews[0].metadata.columns[1];

        let tblView = dataViews[0].table;
        
        var tblData = [];

        for( var i = 0; i < dataViews[0].table.rows.length; i++) {
            var r = dataViews[0].table.rows[i];
            var colData  = [];
            for(var t = 0; t<r.length; t++) {
                var rawValue =  r[t];
                var formatString =  dataViews[0].table.columns[t].format;
                var columnName =  dataViews[0].table.columns[t].displayName;
                colData.push( { rawValue: rawValue, formatString: formatString, displayName: columnName, refName: "[" + columnName + "]"  } );
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
        private textNode: Text;
        private tableDefinition: any;
        private model: any;
        private host: IVisualHost;
        private editModeJsonEditor: HTMLTextAreaElement;
        private sampleJson : string;
        private displayAllRows : boolean = true;

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.target = options.element;
            this.sampleJson = `/* SAMPLE JSON */
{
    columns: [
        {
            headerStyle: "border-bottom:1px;border-bottom-color:#eee;border-bottom-style:solid", // The style applied on the header of the column
            rowStyle: "", // The style applied on the rest of the rows for this column
            width: 150, // Width of the column
            type: "RowHeader", // Possible values: RowHeader, Data, Calculation
            refName: "[Account Group Level 1]", // The name of the column within brackets
            title: "" // The rendered title of the column
        },
        {
            headerStyle: "border-bottom:1px;border-bottom-color:#eee;border-bottom-style:solid",
            rowStyle: "",
            width: 150,
            type: "Data",
            refName: "[Spend SEK]",
            title: "Spend SEK"
        },
        {
            headerStyle: "border-bottom:1px;border-bottom-color:#eee;border-bottom-style:solid",
            rowStyle: "",
            width: 150,
            type: "Data",
            refName: "[Savings SEK]",
            title: "Savings SEK"
        },
        {
            headerStyle: "border-bottom:1px;border-bottom-color:#eee;border-bottom-style:solid",
            rowStyle: "",
            width: 150,
            type: "Calculation",
            refName: "",
            title: "Savings calc",
            calculationFormula: "[Savings SEK] / [Spend SEK]", // Only used for calculation columns. Possible operators: + - * /
            format: "0.0 %;-0.0 %;0.0 %"  // Only used for calculation columns. Two samples: "0.0 %;-0.0 %;0.0 %"   "#,0"
        }
    ],
    rows: [
        {
            title: "Other material", // The rendered title of the row
            formula : "[OtherMaterial]", // The reference to the row(s) including brackets. Possible operators: + -
            rowStyle: "", // The style applied on the whole row.
            visible: true,
            cellRowHeaderStyle: "text-align:left;",  // The style applied only to the row title (first column)
            cellRowDataStyle: "" // The style applied onthe rest of the columns on the row
        },
        {
            title: "Office equipement",
            formula : "[OfficeEquip]",
            rowStyle: "",
            visible: true,
            cellRowHeaderStyle: "text-align:left;",
            cellRowDataStyle: ""
        },
        {
            title: "SUM OF SALES",
            formula : "[OtherMaterial] + [OfficeEquip]",
            rowStyle: "",
            visible: true,
            cellRowHeaderStyle: "text-align:left;",
            cellRowDataStyle: ""
        },
        {
            title: "SALES AND RAW",
            formula : "[Sales]+[RawMaterial]",
            rowStyle: "",
            visible: true,
            cellRowHeaderStyle: "text-align:left;",
            cellRowDataStyle: ""
        }
    ],
    headerRow: {
        rowStyle: "" // The style applied to the whole header row
    },
    displayAllRows: false
}`;
            
        }

        public update(options: VisualUpdateOptions) {
            var w = options.viewport.width;
            var h = options.viewport.height;
            this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
            this.model  = visualTransform(options, this);
            this.tableDefinition = null;
            var errorMsg = "";
            if ( this.settings.dataPoint.tableConfiguration.trim().length > 0 ) {
                try {
                    this.tableDefinition = JSON.parse(this.settings.dataPoint.tableConfiguration);
                }
                catch(e) {
                    errorMsg = "Error parsing table definition. Enter edit mode and correct the error.";
                }
            }
            if ( options.editMode === 1 ) {
                this.ClearAllContent();
                this.RenderEditMode();
            } else {
                if ( errorMsg.length === 0 ) {
                    this.ClearAllContent();
                    this.RenderAllContent(this.target, this.tableDefinition);
                } else {
                    this.target.innerHTML = "<div>"+errorMsg+"</div>"
                }
            }
            this.target.style.overflow = "auto";
        }

        public RenderNoContentText() {
            var a = document.createElement("div");
            a.innerHTML = "No table definition defined. Edit the table definition by pressing the edit link in the upper right menu.";
            this.target.appendChild(a);
        }

        public RenderEditMode() {
            var btnSave : HTMLButtonElement = document.createElement("input");
            var btnLoadFromFieldList : HTMLButtonElement = document.createElement("input");
            btnSave.type = "button";
            btnSave.value = "Save";
            btnSave.className = "inputButton";
            btnLoadFromFieldList.type = "button";
            btnLoadFromFieldList.value = "Generate template from field list";
            btnLoadFromFieldList.title = "Note! This will replace the current configuration.";
            btnLoadFromFieldList.className = "inputButton";
            this.target.appendChild(btnSave);
            this.target.appendChild(btnLoadFromFieldList);
            var divContainer : HTMLDivElement = document.createElement("div");
            divContainer.style.height = "94%"; // With 100% we get scrollbars in edit mode.
            this.target.appendChild(divContainer);
            var txtJson: HTMLTextAreaElement = this.editModeJsonEditor = document.createElement("textarea");
            var txtSampleJson: HTMLTextAreaElement = document.createElement("textarea");
            var divRenderInEditMode = document.createElement("div");
            txtSampleJson.readOnly = true;
            divContainer.appendChild(txtJson);
            //divContainer.appendChild(txtSampleJson);
            divContainer.appendChild(divRenderInEditMode);
            txtJson.className = "TextCodeBox";
            txtJson.value = this.settings.dataPoint.tableConfiguration;
            txtSampleJson.className = "TextCodeBox TextCodeBoxSample";
            txtSampleJson.value = this.sampleJson;

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
                    that.RenderAllContent(divRenderInEditMode, tableDefTmp);    
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
                that.settings.dataPoint.tableConfiguration = txtJson.value;                
                let general: VisualObjectInstance[] = [{
                    objectName: "dataPoint",
                    displayName: "Data colors",
                    selector: null,
                    properties: {
                        tableConfiguration: txtJson.value
                    }
                }];
                let propertToChange: VisualObjectInstancesToPersist = {
                    replace: general
                }
                that.host.persistProperties(propertToChange);
            }

            var tableDefTmp = JSON.parse(txtJson.value);
            that.RenderAllContent(divRenderInEditMode, tableDefTmp);
        }

        private EditModeCreateTemplateFromFieldList() {
            // Columns
            var colJson = "";
            for( var c=0; c<this.model[0].values.length; c++) {
                var col = this.model[0].values[c];
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
            for( var r=0; r<this.model.length && r<7; r++) {
                var row = this.model[r];
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

        private GetValueForColumnRowCalculationByIndex(row:any, colIndex: number, colDef: any) : any {
            var rawValue = null;
            for(var i=0; i<this.model.length; i++) {
                if ( row.formula !== null && this.model[i].name !== null) {
                    var iPos = row.formula.toLowerCase().indexOf( this.model[i].name.toLowerCase() );
                    if (  iPos !== -1 ) {
                        var s = row.formula.substring(0, iPos);
                        var iPosLeft = s.lastIndexOf( "]", iPos );
                        var aritm = row.formula.toLowerCase().substring(iPosLeft+1, iPos);
                        if( aritm.length === 0 ) {
                            aritm = "+";
                        }
                        aritm = aritm.trim();
                        if ( aritm === "-") {
                            rawValue -= this.model[i].values[colIndex].rawValue;
                        } else {
                            rawValue += this.model[i].values[colIndex].rawValue;
                        }
                    }
                }
            }
            var format = this.model[0].values[colIndex].formatString;
            if ( colDef.format.length > 0 ) {
                format = colDef.format;
            }
            var formattedValue = valueFormatter.format(rawValue, format);
            return { formattedValue: formattedValue, rawValue: rawValue };
        }

        private GetValueForColumnRowCalculationByName(row:any, colDef: any) : any {
            var colNameWithBrackets = colDef.refName;
            var rawValue = 0;
            var colIndex = -1;
            for(var i=0; i<this.model[0].values.length; i++) {
                if ( this.model[0].values[i].refName === colNameWithBrackets ) {
                    colIndex = i;
                    break;
                }
            }
            var retValue = null;
            if ( colIndex !== -1 ) {
                retValue = this.GetValueForColumnRowCalculationByIndex(row, colIndex, colDef);
            } else {
                retValue = {
                    formattedValue: "(Unknown column)", rawValue: null 
                }
            }
            return retValue;
        }

        private GetValueForColumCalculation(row:any, col): any {
            var calculationFormula = col.calculationFormula;
            var s = calculationFormula;
            var i = 0;
            var result = 0;
            while( true ) {
                s = s.trim();
                if ( s.length === 0 || i > 10 ) {
                    break;
                }
                if ( s[0] == "[" ){
                    s = "+" + s;
                }
                var i1 = s.indexOf("[", 0);
                var i2 = s.indexOf("]", i1);
                var name = s.substring(i1, i2+1);
                var operator = s.substr(0,i1).trim();
                var calcColDef = col;
                calcColDef.refName = name;
                var columnValue = this.GetValueForColumnRowCalculationByName(row, calcColDef).rawValue; // TODO: hämta värdet
                if ( operator === "+") {
                    result += columnValue;
                } else if ( operator === "-" ) {
                    result -= columnValue;
                } else if ( operator === "*" ) {
                    result *= columnValue;
                } else if ( operator === "/" ) {
                    result /= columnValue;
                }
                s = s.substr(i2+1);
                i ++;
            }
            var format = col.format;
            var resultFormatted = valueFormatter.format(result, format);
            return resultFormatted;
        }

        private getTableTotalWidth(tableDefinition: any):number {
            var w = 0;
            for(var c=0; c<tableDefinition.columns.length; c++) {
                w += tableDefinition.columns[c].width;
            }
            return w;
        }

        private RenderAllContent(targetElement: HTMLElement, tableDefinition: any) {
            if ( tableDefinition === null ) {
                this.RenderNoContentText();
                return;
            }
            var w = this.getTableTotalWidth(tableDefinition);
            var tableHtml = "<div class='tablewrapper'><div class='div-table' style='width:"+w+"px'>";
            // Table header row
            tableHtml += "<div class='div-table-row-header' style='" + tableDefinition.headerRow.rowStyle + "'>";
            for(var c=0; c<tableDefinition.columns.length; c++) {
                tableHtml += "<div class='div-table-col-number' style='width:" + tableDefinition.columns[c].width + "px;" + tableDefinition.columns[c].headerStyle + "'><div class='table-cell-content'>"+ tableDefinition.columns[c].title+"&nbsp;</div></div>";
            } 
            tableHtml += "</div>";
            var DisplayAllRows = false; // Default value = display all rows
            if ( typeof(tableDefinition.displayAllRows)!=="undefined" ) {
                DisplayAllRows = tableDefinition.displayAllRows;
            }
            // Table rows
            for(var r=0; r<tableDefinition.rows.length; r++) {
                var row = tableDefinition.rows[r];
                if ( row.visible ) {
                    var rowHtml = "<div class='div-table-row' style='"+row.rowStyle+"'>";
                    var allColumnsAreBlank:boolean = true;
                    //if ( row.formula.length > 0 ) {
                        for(var c=0; c<tableDefinition.columns.length; c++) {
                            var col = tableDefinition.columns[c];
                            var renderValue = "";
                            var rowStyle = "width:" + col.width + "px;" +  col.rowStyle;
                            var cellRowDataStyle = row.cellRowDataStyle;
                            if ( col.type === "Data" ) {
                                // Datakolumners innehåll hämtar vi från modellen direkt.
                                var v = this.GetValueForColumnRowCalculationByName(row, col);
                                allColumnsAreBlank = v.rawValue !== null ? false : allColumnsAreBlank;
                                //renderValue = v === null ? "" : v.formattedValue;
                                if ( isNaN(Number(v.rawValue)) || v.rawValue === null) {
                                    renderValue = "&nbsp;";    
                                } else {
                                    renderValue = v.formattedValue;
                                }
                            } 
                            else if ( col.type === "RowHeader") {
                                renderValue = row.title;
                                cellRowDataStyle = "width:" + col.width + "px;" +  row.cellRowHeaderStyle;
                            } 
                            else if ( col.type === "Calculation") {
                                // Kolumner som baseras på en formeln räknas ut
                                renderValue = this.GetValueForColumCalculation(row, col);
                                if ( renderValue.toLowerCase() !== "(blank)" && renderValue.toLowerCase() !== "nan" ) {
                                    allColumnsAreBlank = false;
                                } else {
                                    renderValue = "&nbsp;";
                                }
                            } 
                            else {
                                renderValue = "";
                            }
                            if ( row.formula.length === 0 ) {
                                renderValue = "";
                            }
                            var colHtml = "<div class='div-table-col-number' style='" + rowStyle + "'><div class='table-cell-content' style='"+cellRowDataStyle+"'>"+renderValue+"</div></div>";
                            rowHtml += colHtml;
                        } 
                    //}
                    //else {
                        // Empty row
                    //    rowHtml += "<div class='div-table-col-number'><div class='table-cell-content' style='"+row.cellRowDataStyle+"'></div></div>";
                    //}
                    rowHtml += "</div>";
                    if ( !allColumnsAreBlank || row.formula.length === 0 || DisplayAllRows  ) {
                        tableHtml += rowHtml;
                    }
                    
                }
            } 
            tableHtml += "</div></div>";
            targetElement.innerHTML = tableHtml;
        }

        private ClearAllContent() {
            this.target.innerHTML = "";
        }

        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        /** 
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the 
         * objects and properties you want to expose to the users in the property pane.
         * 
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            //return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
            return [];
        }
    }
}