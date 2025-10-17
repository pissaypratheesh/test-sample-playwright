class AuthPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('#txtUserName');
    this.passwordInput = page.locator('#txtPassword');
    this.loginButton = page.locator('#btnlogin')
  }

  async gotoLoginPage() {
    await this.page.goto('https://uatlifekaplan.tmibasl.in/');
  }

  async loginToApp(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}

module.exports = { AuthPage };