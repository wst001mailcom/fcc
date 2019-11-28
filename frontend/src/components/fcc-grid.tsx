import * as React from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";

interface IProps {
  // data: Item [];
  fccData: any[];
}

const staticData = {
  columnDefs: [
    { headerName: "FCC ID", field: "fccid" },
    { headerName: "Product Model", valueGetter: (params: any) => params.data.productModelNo.join(", ") },
    { headerName: "Model", valueGetter: (params: any) => params.data.modelNo.join(", ") },
    { headerName: "P/N", valueGetter: (params: any) => params.data.pn.join(", ") },
    { headerName: "File name", field: "filename" },
    { headerName: "Brand", field: "brand" },
    { headerName: "Product", field: "product" },
    { headerName: "Spec", valueGetter: (params: any) => params.data.spec.map((x: any) => x.input + x.output).join(", ") },
    { headerName: "Url", field: "url" },
    // { headerName: , field: },
  ],
};

export const FccGridComp = (props: IProps) => {
  return (
    <div style={{ height: "80%", width: "100%", marginTop: 15 }} className="ag-theme-balham">
      <AgGridReact
        // properties
        columnDefs={staticData.columnDefs}
        rowData={props.fccData}
        defaultColDef={{ filter: true }}
        // events
        onGridReady={onGridReady}
      />
    </div>
  );
};

const onGridReady = (params: any) => {
  params.api.sizeColumnsToFit();
  // this.api = params.api;
  // this.columnApi = params.columnApi;
};
