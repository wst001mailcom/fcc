import * as React from "react";
import { FccGrid } from "../containers/fcc-grid";

interface IProps {
  data: Item[];
  isRequesting: boolean;
  handleGetData(): void;
  logout(): void;
}

interface Item {
  name: string;
  value: number;
}

export const DataGridComp = (props: IProps) => {
  return (
    <div className="App-private" style={{ height: 600, width: "100%" }}>
      <button disabled={props.isRequesting} onClick={event => props.handleGetData()}>
        Get FCC Data
      </button>
      <button disabled={props.isRequesting} onClick={event => props.logout()}>
        Log out
      </button>
      <FccGrid />
    </div>
  );
};

/*
        
<div>
Server test data:
<ul>
  {props.data.map((item: Item, index) => (
    <li key={index}>
      name: {item.name} / value: {item.value}
    </li>
  ))}
</ul>
</div>
*/
