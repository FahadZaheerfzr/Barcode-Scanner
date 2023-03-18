import React, { Component } from "react";
import { render } from "react-dom";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import excelFile from "./DATA.xlsx";
import * as xlsx from 'xlsx';
import "./style.css";
// import fs from 'fs';
// import { readXlsxFile } from 'react-excel-renderer';



function App() {

  const [data, setData] = React.useState("Not Found");
  const [excelData, setExcelData] = React.useState(undefined);
  const [foundNumber, setFoundNumber] = React.useState(undefined)
  const [found, setFound] = React.useState(false);
  const [scannedButNotinExcel, setScannedButNotinExcel] = React.useState(false);

  React.useEffect(() => {
    var request = new XMLHttpRequest();
    request.open('GET', excelFile, true);
    request.responseType = "arraybuffer";
    request.onload = function () {
      /* convert data to binary string */
      var data = new Uint8Array(request.response);
      var arr = new Array();
      for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
      data = arr.join("");

      //using xlsx library convert file to json
      const workbook = xlsx.read(data, { type: "binary" })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const json = xlsx.utils.sheet_to_json(worksheet)
      setExcelData(json)
      // console.log(json)
    };
    request.send();
  }, []);

  React.useEffect(() => {
    if (excelData !== undefined && data !== undefined && data !== "Not Found") {
      let FoundInExcel = false;
      for (let i = 0; i < excelData.length; i++) {
        const element = excelData[i];
        if (data.includes(element["CONSIGNMENT NUMBER"])) {
          setFound(true);
          setFoundNumber(element);
          FoundInExcel = true;
        }
      }
      if (!FoundInExcel) {
        setScannedButNotinExcel(true);
      }
    }
  }, [data])

  const scanAgain = () => {
    setFound(false);
    setScannedButNotinExcel(false)
  }
  // console.log(foundNumber);

  return (
    <>
      <div className="container">
        {
          (!found && !scannedButNotinExcel) ? (
            <BarcodeScannerComponent
              width={600}
              height={500}
              onUpdate={(err, result) => {
                if (result) setData(result.text);
                else setData("Not Found");
              }}
            />) : null
        }

        <h1 style={{ fontSize: "70px", marginTop: "50px", marginBottom: "30px" }}>{(!found && !scannedButNotinExcel) ? "Scanning..." : "Scanned !!!"}</h1>
        <p>{(!found && !scannedButNotinExcel) ? "This might take a few seconds!" : null}</p>
        <p>{(!found && !scannedButNotinExcel) ? "Note: Move the Camera a bit closer and focus on the barcode. Keep it still!" : null}</p>

        {
          scannedButNotinExcel && (
            <>
              <h1>But Could not find in the database.</h1>
              <button onClick={scanAgain}>Scan Again</button>
            </>
          )
        }

        {
          found && (
            <>
              <p>{found ? "Here's the data you wanted" : null}</p>
              <p>{found ? `PREFIX: ${foundNumber["PREFIX"]}` : null}</p>
              <p>{found ? `CONSIGNMENT NUMBER: ${foundNumber["CONSIGNMENT NUMBER"]}` : null}</p>
              <p style={{ fontSize: "65px" }}>{found ? `STOP NUMBER: ${foundNumber["STOP NUMBER"]}` : null}</p>
              {
                found ?
                  (
                    <button onClick={scanAgain}>Scan Again</button>
                  ) : null
              }
            </>
          )
        }
      </div>
    </>
  );
}

render(<App />, document.getElementById("root"));





