import { By, until } from 'selenium-webdriver';
import { url } from '../global';

export default class Project {
  constructor(driver) {
    const projectName = encodeURIComponent('Test Project 1');
    this.url = `${url}/${projectName}`;
    this.elements = {
      projectView: By.css('.project'),
      editLink: By.css(`a[href="${projectName}/edit"]`),
      projectionLink: By.css(`a[href="${projectName}/projection"]`),
      statusLink: By.css(`a[href="${projectName}/status"]`),
    };
    driver.manage().timeouts().implicitlyWait(10000);
    this.driver = driver;
  }

  waitUntilReady() {
    return this.driver.wait(until.elementLocated(this.elements.projectView), 10000);
  }

  navigate() {
    /* eslint-disable no-console */
    console.log('this.url:', this.url);
    /* eslint-enable no-console */
    this.driver.navigate().to(this.url);
    return this.waitUntilReady();
  }

  hasProjectView() {
    return this.driver.findElement(this.elements.projectView).isDisplayed();
  }

  hasEditLink() {
    return this.driver.findElement(this.elements.editLink).isDisplayed();
  }

  hasProjectionLink() {
    return this.driver.findElement(this.elements.projectionLink).isDisplayed();
  }

  hasStatusLink() {
    return this.driver.findElement(this.elements.statusLink).isDisplayed();
  }

  clickEditProject() {
    const editLink = this.driver.wait(
      until.elementLocated(this.elements.editLink), 10000);
    return editLink.click();
  }
}