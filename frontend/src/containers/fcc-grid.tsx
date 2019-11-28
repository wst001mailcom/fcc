import { connect } from "react-redux";
import { FccGridComp } from "../components/fcc-grid";

const mapStateToProps = (state: any) => ({
  fccData: state.dataGrid.fccData,
});

export const FccGrid = connect(mapStateToProps)(FccGridComp);
