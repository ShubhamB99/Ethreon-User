App = {
  web3Provider: null,
  contracts: {},

  contract: null,
  web3: null,
  defaultAccount: null,
  allCreators: [],

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
    App.web3 = web3;
    // console.log('Web3 ', App.web3);

    var accounts = await web3.eth.getAccounts();
    web3.eth.defaultAccount = accounts[0];
    App.defaultAccount = web3.eth.defaultAccount;
    // console.log('Account', App.defaultAccount);

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
      console.log('App contracts', App.contracts.Ethreon);
      console.log('Contract set!');

      return App.initPage();
      // Use our contract to retrieve and mark the subscriptions
    });

    // return App.bindEvents();
  },

  initPage: async function() {

    var contractInstance = await App.contracts.Ethreon.deployed();
    App.contract = contractInstance;
    console.log('Web3 instance', App.web3);
    console.log('Contract instance', App.contract);
    console.log('Account', App.defaultAccount);

    console.log('Initiating page!');
    
    // Load creators.
    // Ideally JSON should be auto-populated by a function
    console.log('Getting creators!');
    var res = await App.contract.numCreators({from: App.defaultAccount});
    const numCreators = res.words[0];
    console.log('numCreators', numCreators);

    for (var i=0; i<numCreators; i++) {
      var acnt = await App.contract.allCreators(i, {from: App.defaultAccount});
      // console.log(acnt)
      var img = '', content = '';

      // Get creator data if old patron and subscribed to creator
      const isOldPatron = await App.contract.isOldPatron({from: App.defaultAccount});
      if (isOldPatron) {
        await App.contract.isSubscribedTo(acnt, {from: App.defaultAccount}).then(async function(isSubscribedTo) {
          console.log('isSubscribedTo ', acnt, ' -> ', isSubscribedTo)
          if (isSubscribedTo == true) {
            var resData;
            resData = await App.contract.getCreatorData(acnt, {from: App.defaultAccount});
            img = resData[0]
            content = resData[1]
            // console.log(img, content)
          }
        })
      }

      var creatorData = {
        id: null, 
        name: '', 
        picture: 'QmaAQmT3hUoWqcj1Q81BiFAGGv91CXQ52LyHzrC4Z6aHLe', 
        content: 'Qmb77FJbMMHJxqT6z5jX4NQ4qzWPmqTv3HB9MHz1eFSuH6'
      };
      creatorData.id = i;
      creatorData.name = acnt;
      if (img!='') { creatorData.picture = img;  }
      if (content!='') { creatorData.content = content;  }
      // console.log(creatorData);
      App.allCreators.push(creatorData);
    }

    var creatorsRow = $('#creatorsRow');
    var creatorTemplate = $('#creatorTemplate');

    // Update all creators from contract
    for (i = 0; i < numCreators; i++) {
      // console.log(App.allCreators[i]);
      creatorTemplate.find('.panel-title').text(App.allCreators[i].name.substring(0,6) + '....' + App.allCreators[i].name.substring(37,42));
      creatorTemplate.find('img').attr('src', "https://gateway.ipfs.io/ipfs/" + App.allCreators[i].picture);
      creatorTemplate.find('a').attr('href', "https://gateway.ipfs.io/ipfs/" + App.allCreators[i].content);
      creatorTemplate.find('.btn-tip').attr('data-id', App.allCreators[i].id);
      creatorTemplate.find('.btn-subscribe').attr('data-id', App.allCreators[i].id);
      creatorsRow.prepend(creatorTemplate.html());
    }
    creatorTemplate.remove();

    return App.bindEvents();
  },

  bindEvents: function() {

    $('.btn-subscribe').click(function() {
      const id = $(this).attr('data-id')
      const add = App.allCreators[id].name
      App.newSubscription(add)
    })

    $('.btn-tip').click(function() {
      const id = $(this).attr('data-id')
      const add = App.allCreators[id].name
      App.tipCreator(add)
    })

    console.log('Now registering user');
    return App.registerUser();    
  },

  newSubscription : async function (addr) {
    console.log('New subscription to ', addr);
    // Subscribe with 0.1 ETH
    var logs = await App.contract.newSubscription(addr, {from: App.defaultAccount, value:'100000000000000000'});
    console.log(logs);
  },

  tipCreator : async function (addr) {
    console.log('New tip to ', addr);
    // Tip 0.01 ETH
    App.web3.eth.sendTransaction({
      from: App.defaultAccount,
      to: addr,
      value: '10000000000000000'
    }).then(function (logs) {
      console.log(logs)
    })
  },

  registerUser: async function() {

    const isOldPatron = await App.contract.isOldPatron({from: App.defaultAccount});
    console.log('isOldPatron', isOldPatron);
    if (isOldPatron == false) {
      var receipt = await App.contract.newPatronSignup({from: App.defaultAccount})
      console.log(receipt);
      console.log(receipt.logs[0].event)
    }
    else {
      console.log('Welcome Back Patron!')
    }
    
    // Add notification for welcome back/ New user welcome!
  }
};


$(function() {
  $(window).load(function() {
      App.initWeb3();
  });
});