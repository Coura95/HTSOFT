angular.module('starter', ['ionic', 'ionic-modal-select', 'starter.controllers', 'starter.directives', 'ngCordova'])

.run(function($ionicPlatform, $ionicPopup) {
  $ionicPlatform.ready(function() {

    //initialiser le stockage des fiches en local
    if(localStorage.getItem('ficheSauvegarde')==null){
      var init = [];
      var value= {"fichev":{"actionAMener":"titobiii",
          "bracheSecteur":"tito",
          "brandingExterieur":"NON",
          "brandingInterieur":"NON",
          "connaissanceCodeEmployeTPE":"OUI",
          "dateAjout":"2018-09-22 22:27:11",
          "dispositionTPE":"OUI",
          "flyers":"OUI",
          "formulaireClient":"OUI",
          "grilleTarifVisible":"OUI",
          "montantDeposit":"100000.0",
          "niveauBatterieTPE":"Excellent",
          "niveauFormation":"Excellent",
          "photoPoint":"tito",
          "presenceConcurence":"tito",
          "idUser": "20",
          "idPointvent":"16"
        }
      };
      var value1= {"fichev":{"actionAMener":"tata",
          "bracheSecteur":"tito",
          "brandingExterieur":"NON",
          "brandingInterieur":"NON",
          "connaissanceCodeEmployeTPE":"OUI",
          "dateAjout":"2018-09-22 22:27:11",
          "dispositionTPE":"OUI",
          "flyers":"OUI",
          "formulaireClient":"OUI",
          "grilleTarifVisible":"OUI",
          "montantDeposit":"100000.0",
          "niveauBatterieTPE":"Excellent",
          "niveauFormation":"Excellent",
          "photoPoint":"tito",
          "presenceConcurence":"tito",
          "idUser": "20",
          "idPointvent":"16"
        }
      };
      //init.push(value)
     // init.push(value1)
      localStorage.setItem('ficheSauvegarde', angular.toJson(init))
      localStorage.setItem('prospectsSauvegarde', angular.toJson(init))
    }
    if(window.Connection) {
      if(navigator.connection.type == Connection.NONE) {
          $ionicPopup.show({
            title: 'Pas de connexion Internet',
            content: 'Désolé, aucune connectivité Internet détectée. Veuillez vous reconnecter pour plus d\'options.<br/>Si vous voullez poursuivre en mode hors ligne cliquez sur [OUI]',
            buttons: [
              {
                text: 'Non',
                type: 'button-assertive',
                onTap: function(e) {
                  return false;
                }
              },
              {
                text: 'OUI',
                type: 'button-energized',
                onTap: function(e) {
                  return true;
                }
              }]
          }).then(function(result) {
            if(!result) {
              ionic.Platform.exitApp();
            }
          });
      }
    }
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }

    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
}) .config(function($translateProvider) {
  $translateProvider.translations('en', translations_en);
  $translateProvider.translations('hi', translations_hi);
  $translateProvider.translations('pr', translations_pr);
  console.log("test lngge preferred");
  if(localStorage.getItem('preferredLanguage')==null){
    $translateProvider.preferredLanguage('hi');
  }else{
    var lang = localStorage.getItem('preferredLanguage');
    $translateProvider.preferredLanguage(lang);
  }
  //console.log(localStorage.getItem('preferredLanguage'));
  
  
})
//Routing
.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/tabs.html',
      controller: 'AppCtrl'
    })

    .state('app.search', {
      url: '/search',
      views: {
        'menuContent': {
          templateUrl: 'templates/search.html',
          controller: 'SearchCtrl'

        }
      }
    })

    .state('app.qrcode', {
      url: '/qrcode',
      views: {
        'menuContent': {
          templateUrl: 'templates/qrcode.html',
          controller: 'QrcodeCtrl'

        }
      }
    })

    .state('app.accueil', {
      url: '/accueil',
      views: {
        'menuContent': {
          templateUrl: 'templates/accueil.html',
          controller: 'DashCtrl'
        }
      }
    })

    .state('app.profile', {
      url: '/profile',
      views: {
        'menuContent': {
          templateUrl: 'templates/profile.html',
          //    controller: 'ProfileCtrl'

        }
      }
    })
    .state('app.sondages', {
      url: '/sondages',
      views: {
        'menuContent': {
          templateUrl: 'templates/sondages.html',
          controller: 'SondagesCtrl'

        }
      }
    })


    .state('app.fiches', {
      url: '/fiches',
      views: {
        'menuContent': {
          templateUrl: 'templates/fiches.html',
          controller: 'FichesCtrl'

        }
      }
    })

    .state('app.mesfiches', {
      url: '/mesfiches',
      views: {
        'menuContent': {
          templateUrl: 'templates/mesfichesvisite.html',
          controller: 'MesfichesCtrl'

        }
      }
    })

    .state('app.medias', {
      url: '/medias',
      views: {
        'menuContent': {
          templateUrl: 'templates/medias.html',
          controller: 'MediasCtrl'

        }
      }
    })

    .state('app.image', {
      url: '/image',
      views: {
        'menuContent': {
          templateUrl: 'templates/image.html',
          controller: 'ImageCtrl'

        }
      }
    })

    .state('app.questions', {
      url: '/questions/:idsondages',
      views: {
        'menuContent': {
          templateUrl: 'templates/questions.html',
          controller: 'QuestionsCtrl'

        }
      }
    })

    .state('app.about', {
      url: '/about',
      views: {
        'menuContent': {
          templateUrl: 'templates/about.html'
        }
      }
    })

    .state('app.compte', {
      url: '/compte',
      views: {
        'menuContent': {
          templateUrl: 'templates/compte.html',
          controller: 'AppCtrl'
        }
      }
    })

    .state('app.prospects', {
      url: '/prospects',
      views: {
        'menuContent': {
          templateUrl: 'templates/prospects.html',
          controller: 'ProspectsCtrl'

        }
      }
    })

    .state('app.maps', {
      url: '/maps',
      views: {
        'menuContent': {
          templateUrl: 'templates/maps.html',
          controller: 'MapCtrl'

        }
      }
    })
    .state('app.addcompte', {
      url: '/addcompte',
      views: {
        'menuContent': {
          templateUrl: 'templates/addcompte.html',
          controller: 'AddcompteCtrl'

        }
      }
    })
    .state('app.fichevisite', {
      url: '/fichevisite',
      views: {
        'menuContent': {
          templateUrl: 'templates/fichevisite.html',
          controller: 'FicheVisiteCtrl'

        }
      }
    })
    .state('app.logout', {
      url: '/logout',
      views: {
        'menuContent': {
          templateUrl: 'templates/accueil.html',
          controller: 'LogoutCtrl'

        }
      }
    })

    .state('app.signup', {
      url: '/signup',
      views: {
        'menuContent': {
          templateUrl: 'templates/signup.html',
          controller: 'SignupCtrl'

        }
      }
    })
    .state('app.bienvenue', {
      url: '/bienvenue',
      views: {
        'menuContent': {
          templateUrl: 'templates/bienvenue.html',
        }
      }
    })
    .state('app.mesprospects', {
      url: '/mesprospects',
      views: {
        'menuContent': {
          templateUrl: 'templates/mesprospects.html',
          controller: 'MesprospectsCtrl'
        }
      }
    })
    .state('app.login1', {
      url: '/login1',
      views: {
        'menuContent': {
          templateUrl: 'templates/login1.html',
          controller: 'LoginCtrl'
        }
      }
    }).state('app.account', {
      url: '/account',
      views: {
          'tab-account': {
              templateUrl: 'templates/tab-account.html',
              controller: 'AccountCtrl'
          }
      }
  });
  // if none of the above states are matched, use this as the fallback
  if (localStorage.getItem('loggedin_name')==null || localStorage.getItem('loggedin_password')==null || localStorage.getItem('loggedin_name')=='null' || localStorage.getItem('loggedin_password')=='null') {
   localStorage.setItem('isconn', false)
    $urlRouterProvider.otherwise('/app/accueil');
   //$urlRouterProvider.otherwise('/tab/dash');

   // console.log(localStorage.getItem('loggedin_name'))
  //  console.log(  Z ŽAlocalStorage.getItem('loggedin_password'))
  } else {
    localStorage.setItem('isconn', true)
    $urlRouterProvider.otherwise('/app/bienvenue');
    //console.log(localStorage.getItem('loggedin_name'))
   // console.log(localStorage.getItem('loggedin_password'))
  }
})
