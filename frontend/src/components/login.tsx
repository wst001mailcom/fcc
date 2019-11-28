import { withStyles, WithStyles } from "@material-ui/core/styles";
import * as React from "react";

interface IProps {
  isRequesting: boolean;
  handLogin(email: string, password: string): void;
}

interface ILoginState {
  email: string;
  password: string;
}

const styles = {
  lcard: {
    maxWidth: 200,
  },
  rcard: {
    maxWidth: 100,
  },
  title: {
    fontSize: 14,
  },
};

class UnstyledLoginForm extends React.Component<IProps & WithStyles, ILoginState> {
  constructor(props: IProps & WithStyles) {
    super(props);
    this.state = {
      email: "",
      password: "",
    };
  }

  public render = () => {
    return (
      <div className="App-login">
        (try the credentials: testuser@email.com / my-password)
        <input
          disabled={this.props.isRequesting}
          placeholder="email"
          type="text"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setState({ email: e.target.value })}
        />
        <input
          disabled={this.props.isRequesting}
          placeholder="password"
          type="password"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setState({ password: e.target.value })}
        />
        <button disabled={this.props.isRequesting} onClick={event => this.props.handLogin(this.state.email, this.state.password)}>
          Log in
        </button>
      </div>
    );
  };

  /*
  private handleLogin = (email: string, password: string) => {
    console.log("logging in with ", email);
    this.props.loginInProgressAction(email, password);
  }  
  */
}

const LoginForm = withStyles(styles)(UnstyledLoginForm);
export { LoginForm };
