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
    { headerName: "FCC ID PREFIX", field: "fccidPrefix", sortable: true, rowGroup: true },
    { headerName: "FCC ID", field: "fccid", sortable: true },
    { headerName: "Date", field: "repDate", sortable: true },
    { headerName: "Product Model", valueGetter: (params: any) => params.data.productModelNo.join(", "), sortable: true },
    { headerName: "Model", valueGetter: (params: any) => params.data.modelNo.join(", "), sortable: true },
    { headerName: "P/N", valueGetter: (params: any) => params.data.pn.join(", "), sortable: true },
    { headerName: "File name", field: "filename", sortable: true },
    { headerName: "Brand", field: "brand", sortable: true },
    { headerName: "Product", field: "product", sortable: true },
    { headerName: "Spec", valueGetter: (params: any) => params.data.spec.map((x: any) => x.input + x.output).join(", "), sortable: true },
    { headerName: "Dummy", field: "isDummy", sortable: true },
    { headerName: "Url", field: "url", sortable: true },
    // { headerName: , field: },
  ],
};

export class FccGridComp extends React.Component<IProps, any> {
  private gridApi: any;
  // private gridColumnApi: any;

  constructor(props: IProps) {
    super(props);
  }

  public render = () => {
    return (
      <div style={{ height: "80%", width: "100%", marginTop: 15 }} className="ag-theme-balham">
        <button onClick={this.onBtExport}>Export to Excel</button>
        <AgGridReact
          // properties
          columnDefs={staticData.columnDefs}
          rowData={this.props.fccData}
          defaultColDef={{ filter: true }}
          // events
          onGridReady={this.onGridReady}
        />
      </div>
    );
  };

  private onBtExport = () => {
    this.gridApi.exportDataAsCsv({});
  };
  private onGridReady = (params: any) => {
    this.gridApi = params.api;
    // this.gridColumnApi = params.columnApi;
    params.api.sizeColumnsToFit();
  };
}
