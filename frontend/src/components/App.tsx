import React from "react";
import "../App.css";
import logo from "../logo.svg";
import { Login } from "../containers/login";
import { DataGrid } from "../containers/data-grid";

export interface IProps {
  isLoggedIn: boolean;
  error: string;
}

class AppComp extends React.Component<IProps, any> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      isLoggedIn: this.props.isLoggedIn,
    };
  }
  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <div className="App-error">[{this.props.error}]</div>
        {this.props.isLoggedIn ? <DataGrid /> : <Login />}
      </div>
    );
  }
}

export default AppComp;
