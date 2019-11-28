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
    <div className="App-private">
      <FccGrid />
      <button disabled={props.isRequesting} onClick={event => props.handleGetData()}>
        Get test data
      </button>
      <button disabled={props.isRequesting} onClick={event => props.logout()}>
        Log out
      </button>
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
