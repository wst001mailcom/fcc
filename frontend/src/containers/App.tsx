import { connect } from "react-redux";
import AppComp from "../components/App";

const mapStateToProps = (state: any) => ({
  isLoggedIn: state.login.isLoggedIn,
  error: state.login.error,
});

export const App = connect(mapStateToProps)(AppComp);
