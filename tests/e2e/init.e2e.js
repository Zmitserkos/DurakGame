"use strict";

describe('users registration', function() {
  it('should navigate to "/games"', function() {
    browser.get('/');

    element(by.css('.name-input')).sendKeys('PlayerName');
    element(by.css('.play-btn')).click();

    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + 'games');
  });

  it('should redirect to "/games"', function() {
    browser.get('/');
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + 'games');

    browser.get('/foo');
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + 'games');
  });

  it('should abort logging in for a user with the same login', function() {
    browser.driver.executeScript(function() {
      (function(a) {
        document.body.appendChild(a);
        a.setAttribute('href', location.href);
        a.dispatchEvent((function(e) {
          e.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, true, false, false, false, 0, null);
          return e;
        }(document.createEvent('MouseEvents'))))
      }(document.createElement('a')));
    });

    browser.getAllWindowHandles().then(function (handles) {
      var secondWindowHandle = handles[1];

      browser.switchTo().window(secondWindowHandle);
      browser.get('/');
    });

    element(by.css('.name-input')).sendKeys('PlayerName');
    element(by.css('.play-btn')).click();

    expect(element(by.css('.init-message')).getText()).toEqual('User with the given name has been created already!');
  });

});


/*browser.getCurrentUrl().then(function(text) {
  console.log('curr! '+text);
});*/

/*browser.getAllWindowHandles().then(function (handles) {
  console.log('tabs '+handles.length);
});*/
