import React, { Component } from 'react';
import LoginInput from 'components/1-atoms/LoginInput';

class Login extends Component {
  constructor() {
    super();
    this.state = {
      user: {
        name: '',
        password: '',
      },
      active: false,
    };
  }

  render() {
    const onInputChange = (name, value) => {
      const user = this.state.user;
      user[name] = value;
      this.setState({ user });
    };

    const closeLogin = () => {
      this.setState({
        active: false,
      });
    };

    const openLogin = () => {
      this.setState({
        active: true,
      });
    };

    const {
      onLoginClick,
      onLogoutClick,
      isAuthenticated,
      user,
      message,
    } = this.props;

    if (isAuthenticated) {
      return (
        <div
          className="login"
          onClick={() => {
            closeLogin();
            onLogoutClick();
          }}
        >
          <span className="greeting">Hi, {user.name}</span>
          <span className="button">Logout</span>
        </div>);
    }

    const messageClass = message ? 'message active' : 'message';

    if (this.state.active && !isAuthenticated) {
      return (
        <div className="login">
          <div className={messageClass}>
            <span>{message}</span>
          </div>
          <div className="login-form">
            <LoginInput
              label="Name"
              property="name"
              onInputChange={onInputChange}
            />
            <LoginInput
              label="Password"
              property="password"
              onInputChange={onInputChange}
            />
            <div className="buttons">
              <span
                className="button"
                onClick={() => onLoginClick(this.state.user)}
              >Login</span>
              <span
                className="button"
                onClick={() => closeLogin()}
              >Cancel</span>
            </div>
          </div>
        </div>);
    }

    return (
      <div className="login">
        <span
          className="button"
          onClick={openLogin}
        >Login</span>
      </div>);
  }
}

export default Login;

Login.propTypes = {
  onLoginClick: React.PropTypes.func.isRequired,
  onLogoutClick: React.PropTypes.func.isRequired,
  isAuthenticated: React.PropTypes.bool.isRequired,
  user: React.PropTypes.object,
  message: React.PropTypes.string,
};
