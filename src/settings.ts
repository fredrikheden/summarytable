"use strict";

import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import { DataPointSettings } from "./dataPointSettings";;
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

export class VisualSettings extends DataViewObjectsParser {
      public dataPoint: DataPointSettings = new DataPointSettings();
}
