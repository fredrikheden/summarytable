// TODO: Lägg till möjlighet att använda ett expression för att sätta styles.
// TODO: Använd en bättre kod-editor för highlighting m.m.
// TODO: Dynamiska kolumnnamn (baserade på expressions)
// TODO: Cross-filter
// TODO: Kunna välja mellan olika templates (som bara applicerar styles)
// TODO: Felhantering
// TODO: Separat style för hover-effekt på radnivå.

// Format %: 0.0 %;-0.0 %;0.0 %               #,0
// Format number thousand separator: #,0
// Format number 4 decimals: #.0000


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

    function jsonCopy(src) {
        return JSON.parse(JSON.stringify(src));
      }

      function containsValue(v) {
        if ( typeof v === 'undefined' ) {
            return false;
        }
        if ( v === "" ) {
            return false;
        }
        if ( v.trim().length === 0 ) {
            return false;
        }
        return true;
      }

      function replace2(str, strToFind, strToReplace) {
        var strR = strToReplace;
        var strF = strToFind.replace("[", "\\[", "g").replace("]", "\\]", "g").replace(")", "\\)", "g").replace("(", "\\(", "g");
        var regEx = new RegExp(strF, "ig");       
        var result = str.replace(regEx, strR);
        return result;
      }

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
                var isColumnNumeric = dataViews[0].table.columns[t].type.numeric;
                colData.push( { rawValue: rawValue, formatString: formatString, displayName: columnName, refName: "[" + columnName + "]", isNumeric: isColumnNumeric  } );
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
        private internalVersionNo: string = "1.4.4";

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

            this.RenderVersionNo();
        }

        public RenderVersionNo() {
            var a = document.createElement("div");
            a.style.display = "none";
            a.innerHTML = "Version: " + this.internalVersionNo;
            this.target.appendChild(a);
        }

        public RenderNoContentText() {
            var a = document.createElement("div");
            a.innerHTML = "No table definition defined. Edit the table definition by pressing the edit link in the upper right menu.";
            this.target.appendChild(a);
        }

        public RenderNonNumericColumns(target) {
            target.innerHTML = "Columns other than the first one contains non-numeric fields. This is not allowed.";
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
            // Till denna funktion kommer vi en gång per beräknad rad.
            var fExpression = row.formula;
            for(var i=0; i<this.model.length; i++) {
                // Gå igenom varje rad i modellen för att hitta referenser
                if ( row.formula !== null && this.model[i].name !== null) {
                    var iPos = row.formula.toLowerCase().indexOf( this.model[i].name.toLowerCase() );
                    if (  iPos !== -1 ) {
                        var modelRawValue = this.model[i].values[colIndex].rawValue;
                        fExpression = replace2( fExpression, this.model[i].name, modelRawValue );
                    }
                }
            }
            var rawValue = this.EvalFormula( fExpression );
            var format = this.model[0].values[colIndex].formatString;
            if ( containsValue(colDef.format) ) { // Only use column formatting if it is defined
                format = colDef.format;
            }
            if ( containsValue(row.format) ) { // Only use row formatting if it is defined
                format = row.format;
            }
            var formattedValue = this.FormatValue(rawValue, format, valueFormatter);
            return { formattedValue: formattedValue, rawValue: rawValue };
        }

        private EvalFormula(expr) {
            var e = null;
            try {
                e = eval(expr);
            } catch(exc) {
                e = null;
            }
            return e;
        }

        private FormatValue(rawValue, format, valueFormatter) {
            var formattedValue = valueFormatter.format(rawValue, format);
            return formattedValue;
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
            var resultExpression = calculationFormula;
            while( true ) {
                s = s.trim();
                if ( s.length === 0 || i > 10 ) {
                    break;
                }
                if ( s[0] === "[" ){
                    s = "+" + s;
                }
                var i1 = s.indexOf("[", 0);
                if ( i1 === -1 ) {
                    break;
                }
                var i2 = s.indexOf("]", i1);
                var name = s.substring(i1, i2+1);
                var calcColDef = col;
                calcColDef.refName = name;
                var columnValue = this.GetValueForColumnRowCalculationByName(row, calcColDef).rawValue;
                resultExpression = resultExpression.replace(name, columnValue);
                s = s.substr(i2+1);
                i ++;
            }
            var format = col.format;
            if ( containsValue(row.format) ) {
                format = row.format;
            }
            var evalValue = this.EvalFormula(resultExpression);
            var resultFormatted = this.FormatValue(evalValue, format, valueFormatter);
            return { formattedValue: resultFormatted, rawValue: evalValue };
        }

        private getTableTotalWidth(tableDefinition: any):number {
            var w = 0;
            var additionalWidth = tableDefinition.additionalWidth;
            for(var c=0; c<tableDefinition.columns.length; c++) {
                w += tableDefinition.columns[c].width;
            }
            if ( !isNaN(additionalWidth) ) {
                w += additionalWidth;
            }
            return w;
        }

        private RenderAllContent(targetElement: HTMLElement, tableDefinition: any) {
            if ( tableDefinition === null ) {
                this.RenderNoContentText();
                return;
            }

            // Check that all columns except the first one is numeric
            if ( this.model.length > 0 && this.model[0].values.length > 1) {
                var hasNonNumeric = false;
                for( var i=1; i<this.model[0].values.length; i++) {
                    if ( !this.model[0].values[i].isNumeric ) {
                        hasNonNumeric = true;
                    }
                }
            }

            if ( hasNonNumeric ) {
                this.RenderNonNumericColumns(targetElement);
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
            
            // Fix ranges (replace : with multiple +)
            for(var r=0; r<tableDefinition.rows.length; r++) {
                var row = tableDefinition.rows[r];
                var newFormula = "";
                if ( row.formula.indexOf("::") > -1 ) { // indexOf instead of includes to support older browsers
                    var p = row.formula.indexOf("::");
                    var startRange = row.formula.substring(0,p).trim();
                    var endRange = row.formula.substring(p+2).trim();
                    for(var i=0; i<this.model.length; i++) {
                        if ( this.model[i].name >= startRange && this.model[i].name <= endRange ) {
                            newFormula += "+" + this.model[i].name;
                        }
                    }
                    row.formula = newFormula;
                }
            }

            // Table rows
            for(var r=0; r<tableDefinition.rows.length; r++) {
                var row = tableDefinition.rows[r];
                var rowHtml = "";
                rowHtml += "<div class='div-table-row' style='"+row.rowStyle+"'>";
                var allColumnsAreBlank:boolean = true;
                var rowCols = [];
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
                            //renderValue = v.rawValue;   
                        } else {
                            renderValue = v.formattedValue;
                        }
                        v.formatString = col.format;
                        rowCols.push( v );
                    } 
                    else if ( col.type === "RowHeader") {
                        renderValue = row.title;
                        cellRowDataStyle = "width:" + col.width + "px;" +  row.cellRowHeaderStyle;
                        rowCols.push( { rawValue: null, formatString: null } );
                    } 
                    else if ( col.type === "Calculation") {
                        // Kolumner som baseras på en formeln räknas ut
                        var calcValue = this.GetValueForColumCalculation(row, col);
                        renderValue = calcValue.formattedValue;
                        if ( renderValue.toLowerCase() !== "(blank)" && renderValue.toLowerCase() !== "nan" ) {
                            allColumnsAreBlank = false;
                        } else {
                            renderValue = "&nbsp;";
                        }
                        calcValue.formatString = col.format;
                        rowCols.push( calcValue );
                    } 
                    else {
                        renderValue = "";
                        rowCols.push( { rawValue: null, formatString: null } );
                    }
                    if ( row.formula.length === 0 ) {
                        renderValue = "";
                    }
                    var colHtml = "<div class='div-table-col-number' style='" + rowStyle + "'><div class='table-cell-content' style='"+cellRowDataStyle+"'>"+renderValue+"</div></div>";
                    rowHtml += colHtml;
                } 
                rowHtml += "</div>";
                if ( !allColumnsAreBlank || row.formula.length === 0 || DisplayAllRows ) {
                    //tableHtml += rowHtml;
                } else {
                    rowHtml = "";
                }
                // Add calculated row to model (to be able to reuse it in later calculations)
                var isCalculatedRow = true;
                for(var i=0; i<this.model.length; i++) {
                    if ( this.model[i].title === row.title) {
                        isCalculatedRow = false;
                    }
                }
                if ( isCalculatedRow && row.title.length > 0 ){
                    // Add new row - it does not exist already
                    var newTitle = row.title;
                    var newName = "[" + newTitle + "]";
                    for( var c=0; c<rowCols.length; c++) {
                        rowCols[c].displayName = newTitle;
                        rowCols[c].refName = newName;
                    }
                    var newModelRow = { 
                        name: newName,
                        title: newTitle,
                        values: rowCols
                    };
                    this.model.push(newModelRow);
                }
                if ( row.visible ) {
                    tableHtml += rowHtml;
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