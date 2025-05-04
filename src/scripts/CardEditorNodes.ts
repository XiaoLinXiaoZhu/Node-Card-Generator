// //node constructor class
// function MyAddNode()
// {
//   this.addInput("A","number");
//   this.addInput("B","number");
//   this.addOutput("A+B","number");
//   this.properties = { precision: 1 };
// }
//@ts-ignore
import path from "path";
//@ts-ignore
import fs from "fs";

// 将 nodes 目录下的所有文件加载到 LiteGraph 中
import "./nodes/AddElementOnCard";
import "./nodes/ArrayGet";
import "./nodes/CSVParser";
import "./nodes/GetNumber";
import "./nodes/CSVReader";
import "./nodes/CSVReaderFromBackend";
import "./nodes/Array2Enum";
import "./nodes/FormatString";