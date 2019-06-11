
// powerbi.extensibility.utils.formatting
import {
    valueFormatter as vf,
    textMeasurementService as tms
} from "powerbi-visuals-utils-formattingutils";
import TextProperties = tms.TextProperties;
import textMeasurementService = tms.textMeasurementService;
import valueFormatter = vf.valueFormatter;

import * as Utils from "./jsUtils";
import { Visual } from './visual';

export class Renderer {
    private visual: Visual;

    constructor(visual: Visual) {
        this.visual = visual;
    }

    private RenderNoContentText(target: HTMLElement) {
        var a = document.createElement("div");
        a.innerHTML = "No table definition defined. Edit the table definition by pressing the edit link in the upper right menu.";
        target.appendChild(a);
    }

    private RenderNonNumericColumns(target: HTMLElement) {
        target.innerHTML = "Columns other than the first one contains non-numeric fields. This is not allowed.";
    }

    private GetValueForColumnRowCalculationByIndex(row:any, colIndex: number, colDef: any) : any {
        var model = this.visual.getModel();

        // Till denna funktion kommer vi en gång per beräknad rad.
        var fExpression = row.formula;
        for(var i=0; i<model.length; i++) {
            // Gå igenom varje rad i modellen för att hitta referenser
            if ( row.formula !== null && model[i].name !== null) {
                var iPos = row.formula.toLowerCase().indexOf( model[i].name.toLowerCase() );
                if (  iPos !== -1 ) {
                    var modelRawValue = model[i].values[colIndex].rawValue;
                    fExpression = Utils.replace2( fExpression, model[i].name, modelRawValue );
                }
            }
        }
        var rawValue = this.EvalFormula( fExpression );
        var format = model[0].values[colIndex].formatString;
        if ( Utils.containsValue(colDef.format) ) { // Only use column formatting if it is defined
            format = colDef.format;
        }
        if ( Utils.containsValue(row.format) ) { // Only use row formatting if it is defined
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
        var model = this.visual.getModel();

        var colNameWithBrackets = colDef.refName;
        var rawValue = 0;
        var colIndex = -1;
        for(var i=0; i<model[0].values.length; i++) {
            if ( model[0].values[i].refName === colNameWithBrackets ) {
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

            var orgRefName = calcColDef.refName;
            calcColDef.refName = name;
            var columnValue = this.GetValueForColumnRowCalculationByName(row, calcColDef).rawValue;
            resultExpression = resultExpression.replace(name, columnValue);
            s = s.substr(i2+1);
            i ++;
            calcColDef.refName = orgRefName;
        }
        var format = col.format;
        if ( Utils.containsValue(row.format) ) {
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

    // Hämtar ut en style och applicerar eventuella globla styles (angivna i reusableCSS)
    private getStyle(style: string, tableDefinition: any) {
        if ( typeof(style) === "undefined" ) {
            return "";
        }
        if ( typeof(tableDefinition.reusableCSS) === "undefined" ) {
            return style;
        }
        if ( tableDefinition.reusableCSS.length === 0 ) {
            return style;
        }
        var style2 = style;
        for( var i=0; i<tableDefinition.reusableCSS.length; i++) {
            style2 = Utils.replace2( style2, tableDefinition.reusableCSS[i].key, tableDefinition.reusableCSS[i].value );
        }
        return style2;
    }

    private getStringInside(startChar: string, endChar: string, s: string, includeContaining: boolean) {
        var i1 = s.indexOf(startChar, 0);
        var i2 = s.indexOf(endChar, i1);
        if ( i1 === -1 || i2 === -1 ) {
            return null;
        }
        var s2 = s.substring(i1+startChar.length, i2);
        if ( includeContaining ) {
            return s.substring(i1, i2+endChar.length);
        } 
        else {
            return s.substring(i1+startChar.length, i2);
        }
    }

    private getTitle( col: any, tableDefinition: any) {
        var model = this.visual.getModel();

        var i1 = col.title.indexOf("eval(", 0);
        var i2 = col.title.indexOf(")", i1);
        if ( i1 === -1 || i2 === -1 ) {
            return col.title;
        }
        var expressionToEval = col.title.substring(i1+5, i2);
        var colNameWithBrackets = this.getStringInside("[", "]", expressionToEval, true);
        if ( colNameWithBrackets === null ){
            return col.title;
        }


        var colIndex = null;
        for(var i=0; i<model[0].values.length; i++) {
            if ( model[0].values[i].refName === colNameWithBrackets ) {
                colIndex = i;
                break;
            }
        }
        if ( colIndex === null ) {
            return col.title;
        }
        var title = col.title;
        title = Utils.replace2( title, colNameWithBrackets, model[0].values[colIndex].rawValue );
        i1 = title.indexOf("eval(", 0);
        i2 = title.lastIndexOf(")");
        var v = title.substring(i1+5, i2);
        var vEvaluated = title.substring(0, i1) + eval(v) + title.substring(i2+1);
        return vEvaluated.trim();
    }



    public RenderAllContent(targetElement: HTMLElement, tableDefinition: any) {
        var model = this.visual.getModel();

        if ( tableDefinition === null ) {
            this.RenderNoContentText(targetElement);
            return;
        }

        // Check that all columns except the first one is numeric
        if ( model.length > 0 && model[0].values.length > 1) {
            var hasNonNumeric = false;
            for( var i=1; i<model[0].values.length; i++) {
                if ( !model[0].values[i].isNumeric ) {
                    hasNonNumeric = true;
                }
            }
        }

        if ( hasNonNumeric ) {
            this.RenderNonNumericColumns(targetElement);
            return;
        }

        // Table border
        var customTableStyle = "";
        if ( typeof tableDefinition.masterHeader !== 'undefined' ) {
            customTableStyle = ";" + tableDefinition.masterHeader.borderStyle + ";";
        }
        var w = this.getTableTotalWidth(tableDefinition);
        //var tableHtml = "<div class='tablewrapper'><div class='div-table' style='width:"+w+"px"+customTableStyle+"''>"; // TODO: Det verkar som att bredden inte behövs - det ställer bara till det när det gäller additionalwidth... Nackdelen är att vi inte får en scrollbar om vi förminskar fönstret...
        var tableHtml = "<div class='tablewrapper'><div class='div-table' style='"+customTableStyle+"''>";

        
        // Table header row
        var rowStyle = this.getStyle(tableDefinition.headerRow.rowStyle, tableDefinition);

        // Table header
        if ( typeof tableDefinition.masterHeader !== 'undefined' ) {
            tableHtml += "<div class='div-table-row-masterheader'  style='"+tableDefinition.masterHeader.headerStyle+"'><div>"+tableDefinition.masterHeader.title+"</div></div>";
        }

        tableHtml += "<div class='div-table-row-header' style='" + rowStyle + "'>";
        for(var c=0; c<tableDefinition.columns.length; c++) {
            var headerStyle = this.getStyle(tableDefinition.columns[c].headerStyle, tableDefinition);
            var headerTitle = this.getTitle(tableDefinition.columns[c], tableDefinition);
            //tableHtml += "<div class='div-table-col-number' style='max-width:"+tableDefinition.columns[c].width+"px;width:"+tableDefinition.columns[c].width+"px;min-width:" + tableDefinition.columns[c].width + "px;" + headerStyle + "'><div class='table-cell-content'>"+ headerTitle +"</div></div>";
            tableHtml += "<div class='div-table-col-number table-cell-content' style='max-width:"+tableDefinition.columns[c].width+"px;width:"+tableDefinition.columns[c].width+"px;min-width:" + tableDefinition.columns[c].width + "px;" + headerStyle + "'><div class=' table-cell-content-inner'>"+ headerTitle +"</div></div>";
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
                for(var i=0; i<model.length; i++) {
                    if ( model[i].name >= startRange && model[i].name <= endRange ) {
                        newFormula += "+" + model[i].name;
                    }
                }
                row.formula = newFormula;
            }
        }

        // Table rows
        for(var r=0; r<tableDefinition.rows.length; r++) {
            var row = tableDefinition.rows[r];
            var rowHtml = "";
            var rowStyle = this.getStyle(row.rowStyle, tableDefinition);
            rowHtml += "<div class='div-table-row' style='"+rowStyle+"'>";
            var allColumnsAreBlank:boolean = true;
            var rowCols = [];
            for(var c=0; c<tableDefinition.columns.length; c++) {
                var col = tableDefinition.columns[c];
                var colRowStyle = this.getStyle(col.rowStyle, tableDefinition);
                var renderValue = "";
                var rowStyle = "max-width:" + col.width + "px;" +"min-width:" + col.width + "px;" + "width:" + col.width + "px;" +  colRowStyle;
                var cellRowDataStyle = this.getStyle( row.cellRowDataStyle, tableDefinition );
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
                    var cellRowHeaderStyle = this.getStyle(row.cellRowHeaderStyle, tableDefinition);
                    // TODO: behövs bredden verkligen här. Just nu tar vi bort den.
                    //cellRowDataStyle = "width:" + col.width + "px;" +  cellRowHeaderStyle;
                    cellRowDataStyle = cellRowHeaderStyle;
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
                // Check if we should ignore presentation of this field for this column.
                var shouldHideValue = false;
                if ( typeof row.hideForColumns !== 'undefined' ) {
                    for(var i=0;i < row.hideForColumns.length; i++ ) {
                        if ( row.hideForColumns[i] === col.refName ) {
                            shouldHideValue = true;
                            break;
                        }
                    }
                }
                if ( shouldHideValue) {
                    renderValue = "&nbsp;";
                }

                if ( row.formula.length === 0 ) {
                    renderValue = "";
                }
                //var colHtml = "<div class='div-table-col-number' style='" + rowStyle + "'><div class='table-cell-content' style='"+cellRowDataStyle+"'>"+renderValue+"</div></div>";
                var colHtml = "<div class='div-table-col-number table-cell-content' style='" + rowStyle + ";"+cellRowDataStyle+"'><div class=' table-cell-content-inner'>"+renderValue+"</div></div>";
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
            for(var i=0; i<model.length; i++) {
                if ( model[i].title === row.title) {
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
                model.push(newModelRow);
            }
            if ( row.visible ) {
                tableHtml += rowHtml;
            }
        } 
        
        tableHtml += "</div></div>";
        targetElement.innerHTML = tableHtml;
    }    

}








