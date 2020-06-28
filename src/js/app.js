App = {
  web3Provider: null,
  contracts: {},
  
  initPage: async function() {
    // Load creators.
    // Ideally JSON should be auto-populated by a function
    // var ethreonInstance = await App.contracts.Ethreon.deployed();
    // var account = await web3.eth.getAccounts();
    // web3.eth.defaultAccount = account[0];
    // console.log(web3.eth.defaultAccount);
    // var creatorCount;
    // await ethreonInstance.numCreators({from: web3.eth.defaultAccount}).then(result => creatorCount = result.toNumber());
    // console.log(creatorCount);
    // var creators = [];
    // for (var i=0;i<creatorCount;i++) {
    //   var result = await ethreonInstance.allCreators(i, {from: web3.eth.defaultAccount});
    //   console.log(result);
    //   creators[i] = result;
    // }
    // console.log(creators);
    // var creatorData = [];
    // for (var i=0;i<creatorCount;i++) {
    //   var result = await ethreonInstance.CreatorData(i, {from: web3.eth.defaultAccount});
    //   creatorData[i] = result;
    // }
    // console.log(creatorData);
    console.log('Initiating page!');
    // $.getJSON('../creators.json', function(data) {                  // Get this asap ***********
    //   var creatorsRow = $('#creatorsRow');
    //   var creatorTemplate = $('#creatorTemplate');
    //   console.log(creatorsRow);
    //   console.log(creatorTemplate);

    //   for (i = 0; i < data.length; i ++) {
    //     creatorTemplate.find('.panel-title').text(data[i].name);
    //     creatorTemplate.find('img').attr('src', data[i].picture);
    //     creatorTemplate.find('.btn-tip').attr('data-id', data[i].id);
    //     creatorTemplate.find('.btn-subscribe').attr('data-id', data[i].id);

    //     creatorsRow.append(creatorTemplate.html());
    //   }
    // });

    return App.initWeb3();
  },

  initWeb3: async function() {

    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    console.log(web3);

    var accounts = await web3.eth.getAccounts();
    web3.eth.defaultAccount = accounts[0];

    console.log('Web3 initiated!');

    return App.initContract();
  },

  initContract: async function() {
    
    console.log('Initiating smart contract!');
    
    $.getJSON('Ethreon.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var EthreonArtifact = data;
      App.contracts.Ethreon = TruffleContract(EthreonArtifact);

      App.contracts.Ethreon.setProvider(App.web3Provider);
      console.log(App.contracts.Ethreon);
      console.log('Contract set!');
      console.log('Now registering user');

      // Use our contract to retrieve and mark the subscriptions
      return App.registerUser();

      // return App.markAdopted();                                             // Do a similar to get mark subscribed
    });

    // return App.bindEvents();
  },

  registerUser: async function() {
    var ethreonInstance = await App.contracts.Ethreon.deployed();
    var account = await web3.eth.getAccounts();
    web3.eth.defaultAccount = account[0];
    var receipt = await ethreonInstance.newPatronSignup({from:web3.eth.defaultAccount});
    console.log(receipt.logs[0].event);
    // await App.handleEvents();                       // Give out notification based on event name
    console.log(receipt.logs[0].event == "WelcomeBackPatron");

    var subs = await ethreonInstance.getSubscriptionCount({from: web3.eth.defaultAccount});

    var addrElem = $('.address');
    var subsElem = $('.subscriptions');
    
    addrElem.text(addrElem.text().replace('loading...', web3.eth.defaultAccount));
    subsElem.text(subsElem.text().replace('loading...', subs));
    
    // Notification for welcome back/ New user welcome!
    return App.markSubscribed();
  },

  markSubscribed: async function() {
    console.log('Subscribe time');
    var ethreonInstance = await App.contracts.Ethreon.deployed();
    var account = await web3.eth.getAccounts();
    web3.eth.defaultAccount = account[0];
    var logs = await ethreonInstance.getSubscriptions({from:web3.eth.defaultAccount});
    console.log(logs);
    
    // Highlight creators who're subscribed to
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-subscribe', App.newSubscription()); //$('.btn-subscribe').attr('data-id')));   // Send address of creator to function
    $(document).on('click', '.btn-tip', App.tipCreator()); //$('.btn-tip').attr('data-id')));
    // $(document).on('click', '.get-content', App.getContent());
  },

  newSubscription : async function () {
    console.log('New subscription');
    var ethreonInstance = await App.contracts.Ethreon.deployed();
    var account = await web3.eth.getAccounts();
    web3.eth.defaultAccount = account[0];
    var tx = await web3.eth.sendTransaction({from:web3.eth.defaultAccount, 
                                              to:"0x4a2afb0785B24E41E9CA71D29bb16C9f994EB4e9", 
                                              value:'100000000000000000'})
    var logs = await ethreonInstance.newSubscription('0x4a2afb0785B24E41E9CA71D29bb16C9f994EB4e9', {from:web3.eth.defaultAccount});
    console.log(logs);
    // });
  },

  getContent : async function(cid) {
    console.log('Getting content');
    var ethreonInstance = await App.contracts.Ethreon.deployed();
    var account = await web3.eth.getAccounts();
    web3.eth.defaultAccount = account[0];
    var logs = await ethreonInstance.getContent(cid, {from:web3.eth.defaultAccount});
    console.log(logs);
  },

  tipCreator : async function () {
    var ethreonInstance;
    App.contracts.Ethreon.deployed().then(async function(instance) {
      ethreonInstance = instance;
      var tx = await web3.eth.sendTransaction({from:web3.eth.defaultAccount, 
                                                to:"0x4ef074aA456b23070631fCaB57c85Dd7B4b9424b", 
                                                value:'10000000000000000'})
      // web3.eth.sendTransaction({
      //   from: web3.eth.defaultAccount,
      //   to: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
      //   value: '1000000000000000'
      // })
      // return ethreonInstance.tipCreator('0x62871dD3d970F4E0A51D310fd6166f9c6fAac93d', {from:web3.eth.defaultAccount});
      return tx;
    }).then(function(subs){
      console.log(subs);
    });
  }

};


$(function() {
  $(window).load(function() {
      App.initPage();
  });
});