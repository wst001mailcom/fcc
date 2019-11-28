import { connect } from "react-redux";
import { loginInProgressAction } from "../actions/login-action";
import { LoginForm } from "../components/login";
// import { bindActionCreators } from 'redux'

const mapStateToProps = (state: any) => ({
  isRequesting: state.login.isRequesting,
});

const mapDispatchToProps = {
  handLogin: loginInProgressAction,
};

/*
  
const mapDispatchToProps = (dispatch: any, ownProps: any) => {
    bindActionCreators({ loginInProgressAction}, dispatch)
};
*/

export const Login = connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginForm);
