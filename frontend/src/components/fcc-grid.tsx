import * as React from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";

interface IProps {
  // data: Item [];
  fccData: any[];
}

const dateComparator = (d1: string, d2: string) => {
  const date1: number = Date.parse(d1);
  const date2: number = Date.parse(d2);
  return date1 - date2;
};

const staticData = {
  columnDefs: [
    { headerName: "FCC ID PREFIX", field: "fccidPrefix" },
    { headerName: "FCC ID", field: "fccid" },
    { headerName: "Date", field: "repDate", sort: "desc", comparator: dateComparator },
    { headerName: "P/N", valueGetter: (params: any) => params.data.pn.join(", ") },
    { headerName: "Spec", valueGetter: (params: any) => params.data.spec.map((x: any) => x.input + x.output).join(", ") },
    { headerName: "Model", valueGetter: (params: any) => params.data.modelNo.join(", ") },
    { headerName: "Brand", field: "brand" },
    { headerName: "Product Model", valueGetter: (params: any) => params.data.productModelNo.join(", ") },
    { headerName: "Product", field: "product" },
    { headerName: "Dummy", field: "isDummy" },
    { headerName: "File name", field: "filename" },
    { headerName: "Url", field: "url" },
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
        <input type="text" placeholder="Filter...." onInput={this.onFilterTextBoxChanged} />
        <button onClick={this.onBtExport}>Export to Excel</button>
        <AgGridReact
          // properties
          columnDefs={staticData.columnDefs}
          rowData={this.props.fccData}
          defaultColDef={{ filter: true, sortable: true, resizable: true }}
          // copy
          enableCellTextSelection={true}
          // events
          onGridReady={this.onGridReady}
        />
      </div>
    );
  };

  private onBtExport = () => {
    this.gridApi.exportDataAsCsv({});
  };

  private onFilterTextBoxChanged = (evt: any) => {
    this.gridApi.setQuickFilter(evt.target.value);
  };

  private onGridReady = (params: any) => {
    this.gridApi = params.api;
    // this.gridColumnApi = params.columnApi;
    params.api.sizeColumnsToFit();
  };
}
