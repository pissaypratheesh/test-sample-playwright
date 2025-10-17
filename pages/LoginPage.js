const testdata = require('../testdata/Login_Data.json');
exports.LoginPage = class LoginPage {
  constructor(page) {
    this.page = page;
  this.usernameInput = '#txtUserName';
  this.passwordInput = '#txtPassword';
  this.loginButton = '#btnlogin';
    
  }

    async gotoLoginPage() {
  await this.page.goto(testdata.URL);
    }

    async doLogin() {
  await this.page.fill(this.usernameInput, testdata.username);
  await this.page.waitForSelector(this.passwordInput, { timeout: 10000 });
  await this.page.type(this.passwordInput, testdata.password);
  // Fill captcha with a sample value (update as needed for real tests)
  await this.page.fill('#txtcaptcha', '123456');
  await this.page.waitForSelector(this.loginButton, { timeout: 10000 });
  await this.page.click(this.loginButton);
    }

    async doIcLogin() {
        await this.page.fill(this.usernameInput, testdata.icUsername);
        await this.page.fill(this.passwordInput, testdata.icPassword);
        await this.page.click(this.loginButton);
    }
}
