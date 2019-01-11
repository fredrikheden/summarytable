# Summary Table Power BI Custom Visual

The summary table is a custom visual that allows you to define tables in Power BI with summary rows and custom styling. The most common scenario for using this custom visual is to create the an income statement report.

![](samples/Screenshot2.png)

The above image shows a summary table with an income statement with two summary levels.

![](samples/Screenshot1.png)

The abone image shows a summary table with an income statement with yellow highlighting.

* [Change Log](ChangeLog.md)

## The JSON structure
```json
{
	"columns": [...],
	"rows": [...],
	"headerRow": {...}
}
```

### Define columns - `columns`
#### Example
```json
{
	"headerStyle": "text-align:left",
	"rowStyle": "text-align:left",
	"width": 260,
	"type": "RowHeader",
	"refName": "[AccountGroup]", 
	"title": "Amounts in k$",
	"calculationFormula": "", 
	"format": ""
}
```

#### Properties
* **headerStyle** - the css style of the header of  the column.
* **rowStyle** - the css style of the row items of the column.
* **width** - the width in pixels of the column.
* **type** - the type of column. Valid values are RowHeader, Data and Calculation. RowHeader is used for the first column that contains the header for each row. Data is used for a column that is bound to a measure. Calculation is used when a specific calculation should be applied at render-time.
* **refName** - the name of the data bound measure/attribute. Only applicable when using RowHeader and Calculcation type.
* **title** - the displayed title of the column.
* **calculationFormula** - the formula that should be applied when using the Calculation type. E.g. "[Savings SEK]/[Spend SEK]". Measures are referenced betweeen brackets ([]). Allowed operators are: + - / *
* **format** - the formatting that should be applied when rendered. E.g. "#,0" and "0.0 %;-0.0 %;0.0 %".

### Define rows - `rows`
#### Example
```json
{
	"title": "Total revenues",
	"formula": "[Operating revenues]+[Other revenues]",
	"rowStyle": "font-weight:bold;font-size:small;",
	"visible": true,
	"cellRowHeaderStyle": "",
	"cellRowDataStyle": ""
}
```

#### Properties
* **title** - the displayed title of the row.
* **formula** - the calculation formula of the row. Either a direct reference to another row header row is used, e.g. "[Operating revenues]", or a summary formula is expressed, e.g. "[Operating revenues]+[Other revenues]". Allowed operators are: + -
* **rowStyle** - the css style of the whole row container.
* **visible** - true or false, indicatng whether the row should be displayed or not.
* **cellRowHeaderStyle** - the css style of the row header (the first column).
* **cellRowDataStyle** - the css style of the row data columns header (all columns except the first one).

### Define header row style - `headerRow`
#### Example
```json
"headerRow": {
	"rowStyle": "background-color:#aaa"
}
```
#### Properties
* **rowStyle** - the css style of the whole row container for the header columns.

## Known issues & limitations
* Hover-effects are not supported.
* Expression-based css styles are not supported (e.g. settings a background color based on an expression).
* Expression-based column header titles are not supported.
* Row formulas based on other row formulas are not supported. You have to define the whole formula for each row.
* Cross-filtering other visuals (by clicking on a row) is not supported.
