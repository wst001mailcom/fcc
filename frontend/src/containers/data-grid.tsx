import { connect } from "react-redux";
import { getDataAction, logoutAction } from "../actions/data-grid-action";
import { DataGridComp } from "../components/data-grid";

const mapStateToProps = (state: any) => ({
  data: state.dataGrid.data,
  fccData: state.dataGrid.fccData,
  isRequesting: state.dataGrid.isRequesting,
});

const mapDispatchToProps = {
  handleGetData: getDataAction,
  logout: logoutAction,
};

export const DataGrid = connect(
  mapStateToProps,
  mapDispatchToProps
)(DataGridComp);
