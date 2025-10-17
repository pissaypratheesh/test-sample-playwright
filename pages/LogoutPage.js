class LogoutPage {
  constructor(page) {
    this.page = page;
    this.logoutButton = page.locator("//button[@aria-label='account of current user']"); 
    this.signoutButton = page.locator("li:nth-child(2)");
  }

  async logoutFromApp() {
    await this.logoutButton.click();
    await this.signoutButton.click();
  }
}
module.exports = { LogoutPage };