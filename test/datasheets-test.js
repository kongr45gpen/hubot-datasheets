const Helper = require('hubot-test-helper');
const chai = require('chai');
const nock = require('nock')

const { expect } = chai;

const helper = new Helper('../src/datasheets.js');

describe('datasheets', function() {
  beforeEach(function (done) {
    nock.disableNetConnect();
    nock('https://octopart.com/')
      .get('/api/v3/parts/search?apikey=none&q=irlb8721&sortby=score%20desc&include=datasheets')
      .replyWithFile(200, __dirname + '/replies/irlb8721.json', { 'Content-Type': 'application/json' });

    // Timeout until the fake server repies
    setTimeout(done, 1000)

    return this.room = helper.createRoom();
  });

  afterEach(function () {
    nock.cleanAll();
    return this.room.destroy();
  });

  return it('responds to datasheets', function () { //.then((() => done()), done)
    let room = this.room;
    return this.room.user.say('alice', '@hubot datasheet IRLB8721').then(function () {
      return expect(room.messages).to.eql([
        ['alice','@hubot datasheet IRLB8721'],
        ['hubot','@alice Datasheet for **IRLB8721PBF** (0.59€): http://datasheet.octopart.com/IRLB8721PBF-Infineon-datasheet-8326873.pdf']
      ]);
    });
  });
});
