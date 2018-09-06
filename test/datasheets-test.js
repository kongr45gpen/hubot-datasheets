const Helper = require('hubot-test-helper');
const chai = require('chai');
const nock = require('nock')

const {
  expect
} = chai;

const helper = new Helper('../src/datasheets.js');

describe('datasheets', function() {
  beforeEach(function() {
    nock.disableNetConnect();
    let scope = nock('https://octopart.com/')
      .get('/api/v3/parts/search?apikey=none&q=irlb8721&sortby=score%20desc&limit=10&include=datasheets')
      .replyWithFile(200, __dirname + '/replies/irlb8721.json', {
        'Content-Type': 'application/json'
      })
      .get('/api/v3/parts/search?apikey=none&q=stm32f103rb&sortby=score%20desc&limit=10&include=datasheets')
      .replyWithFile(200, __dirname + '/replies/stm32f103rb.json', {
        'Content-Type': 'application/json'
      });

    return this.room = helper.createRoom();
  });

  afterEach(function() {
    nock.cleanAll();
    return this.room.destroy();
  });

  it('responds to datasheet', function(done) {
    let room = this.room;
    this.room.user.say('alice', '@hubot datasheet IRLB8721').then(function() {
      setTimeout(function() {
        done();
        return expect(room.messages).to.eql([
          ['alice', '@hubot datasheet IRLB8721'],
          ['hubot', '@alice Datasheet for **IRLB8721PBF** (0.61€): http://datasheet.octopart.com/IRLB8721PBF-Infineon-datasheet-8326873.pdf']
        ]);
      }, 50); // Timeout until the fake server replies
    });
  });

  it('responds to datasheets', function(done) {
    let room = this.room;
    this.room.user.say('alice', '@hubot datasheets STM32F103RB').then(function() {
      setTimeout(function() {
        done();
        return expect(room.messages).to.eql([
          ['alice', '@hubot datasheets STM32F103RB'],
          ['hubot',
            '@alice Datasheet for **STM32F103RBT7** (4.93€): http://datasheet.octopart.com/STM32F103RBT7-STMicroelectronics-datasheet-48026265.pdf\n' +
            'Datasheet for **STM32F103RBT6** (5.64€): http://datasheet.octopart.com/STM32F103RBT6-STMicroelectronics-datasheet-48026265.pdf\n' +
            'Datasheet for **STM32F103RBH6** (6.87€): http://datasheet.octopart.com/STM32F103RBH6-STMicroelectronics-datasheet-48026265.pdf\n' +
            'Datasheet for **STM32F103RBH7** (4.49€): http://datasheet.octopart.com/STM32F103RBH7-STMicroelectronics-datasheet-48026265.pdf\n' +
            'Datasheet for **STM32F103RBT7TR** (4.21€): http://datasheet.octopart.com/STM32F103RBT7TR-STMicroelectronics-datasheet-48026265.pdf'
          ],
        ]);
      }, 50); // Timeout until the fake server replies
    })
  });
});