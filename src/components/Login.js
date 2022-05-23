import React from 'react';

class Login extends React.Component {
  constructor(props) {
    super(props); 
  }

  render() {
    return (
      <form id="login-form" onSubmit={this.props.onSubmit}>
      {
        // Div object used for display banner text when responding to user input
        // this.props.banner passes { message: string, show: boolean, colour: string }
      }
        <div 
          style={{ color: this.props.banner.colour }} 
          className={"error-message" + (this.props.banner.show ? '' : ' hidden')}>
        {this.props.banner.message}
      </div>

        <label htmlFor="username">Username:</label>
        <input type="text" id="username" value={this.props.username} onChange={this.props.onUsernameChange} />
        <label htmlFor="password">Password:</label>
        <input type="password" id="password" value={this.props.password} onChange={this.props.onPasswordChange} />
        <div>
          <button type="submit">Log In</button>
          <button onClick={this.props.onCreateAccount}>Create Account</button>
          <button onClick={this.props.onGuest}>Guest</button>
        </div>
      </form>
    )
  }
}

export default Login;
