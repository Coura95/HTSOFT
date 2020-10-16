angular.module('starter.controllers', ['pascalprecht.translate'])
  // Accueil Controller

  .controller('DashCtrl', function ($scope) {
    console.log('DashCtrl');
    $scope.data = {};
    $scope.data.isconn = localStorage.getItem('isconn');
  })
  .controller('FriendsCtrl', function ($scope, Friends, $translate) {
    $scope.curlang = $translate.use();
    $scope.friends = Friends.all($scope.curlang);
  })

  .controller('FriendDetailCtrl', function ($scope, $stateParams, Friends, $translate) {
    $scope.curlang = $translate.use();
    $scope.friend = Friends.get($stateParams.friendId);
    $ionicViewService.clearHistory();
  })

  .controller('AccountCtrl', function ($scope, $translate, $ionicLoading) {
    $scope.showw = false;

    $scope.curlang = $translate.use();
    $scope.changeLanguage = function (key) {
      $ionicLoading.show({ content: 'Loading', animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0, duration: 3000 });
      $translate.use(key);
      $scope.curlang = key;
      $ionicLoading.hide()
      localStorage.setItem('preferredLanguage', key);
    };
  })
  .controller('AppCtrl', function ($scope,
    $ionicModal,
    $timeout,
    $state,
    $translate,
    $http,
    $ionicPopup,
    $ionicLoading,
    urlPhp,
    urlJava) {
    $scope.menu = true;
    $scope.scroll = false;
    $scope.menutab = false;
    $scope.data = {};

    if (localStorage.getItem('loggedin_name') == null || localStorage.getItem('loggedin_name') == 'null') {
      console.log('non autoriser')
      $scope.scroll = false;
    } else {
      $scope.scroll = true;
      // $scope.menu = true;
      console.log('autoriser')
    }
    $scope.majStat = function () {
      if ($scope.menutab) {
        //if($scope.scroll){
        $scope.menu = true;
        $scope.menutab = false;
        // }
      } else {

        $scope.menutab = true;
        $scope.menu = false;
      }
    }


    if (localStorage.length != 0) {
      $scope.connectedyet = true;
      $scope.sessionloginid = localStorage.getItem('loggedin_id');
      $scope.sessionlogininame = localStorage.getItem('loggedin_name');
      $scope.sessionpassword = localStorage.getItem('loggedin_password');
      $scope.sessionloginiduser = localStorage.getItem('loggedin_iduser');
      $scope.sessionprofile = localStorage.getItem('loggedin_profil')

      sessionStorage.setItem('loggedin_id', $scope.sessionloginid);
      sessionStorage.setItem('loggedin_name', $scope.sessionlogininame);
      sessionStorage.setItem('loggedin_password', $scope.sessionpassword);
      sessionStorage.setItem('loggedin_iduser', $scope.sessionloginiduser);
      sessionStorage.setItem('loggedin_profil', $scope.sessionprofile);

    }
    // Form data for the login modal
    $scope.loginData = {};
    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal;
    });
    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
      $scope.modal.hide();
    };
    // Open the login modal
    $scope.login = function () {
      $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
      console.log('Doing login', $scope.loginData);

      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function () {
        $scope.closeLogin();
      }, 1000);
    };

    // Enregistrement de la fiche de visite
    //Gerer les donnees locales: Synchronisation
    $scope.synchronDataLocal = function () {
      if (window.Connection) {

        if (navigator.connection.type == Connection.NONE) {

        } else {

          var flocal = angular.fromJson(localStorage.getItem('ficheSauvegarde'));
          if (flocal == null || flocal.length == 0) {
            console.log('Pas de donnees locales')
            $ionicLoading.hide();
          } else {
            $translate('header_title_synchrone').then(function (header) {
              $translate('content_label_synchrone').then(function (content) {
                $translate('content_label_synchrone_nb_fiche').then(function (nb) {
                  $translate('content_label_synchrone_nb_suggetion').then(function (sugest) {
                    $translate('alert_button_oui').then(function (oui) {
                      $translate('alert_button_non').then(function (non) {
                        var echec = [];
                        $ionicPopup.show({
                          title: header,
                          template: content + "<br/>" + nb + flocal.length + "<br/>" + sugest,
                          scope: $scope,
                          buttons: [
                            {
                              text: non,
                              type: 'button-assertive',
                              onTap: function (e) {
                                return false;
                              }
                            },
                            {
                              text: oui,
                              type: 'button-energized',
                              onTap: function (e) {
                                return true;
                              }
                            }]
                        }).then(function (result) {
                          if (!result) {

                          } else {
                            // console.log(flocal[0])
                            var url = urlJava.getUrl()
                            $ionicLoading.show({ content: 'Tentative de synchronisation', animation: 'fade-in', showBackdrop: true, maxWidth: 800, showDelay: 0, timeout: 10000 });
                            for (var i = 0; i < flocal.length; i++) {
                              $scope.data.value = flocal[i];
                              $http.post(url + '/yup/saveFiche', $scope.data.value).then(function (res) {
                              }).catch(function (error) {
                                echec.push(flocal[i])
                                $ionicLoading.hide();
                                alert('Synchro echouée');
                              });
                            }
                            $ionicLoading.hide();
                            if (echec.length == 0) {
                              var init = [];

                              $translate('alert_header_reussi').then(function (header) {
                                $translate('alert_content_reussi').then(function (content) {
                                  $ionicPopup.confirm({
                                    title: header,
                                    content: content,
                                    buttons: [
                                      {
                                        text: 'OK',
                                        type: 'button-energized',
                                        onTap: function (e) {
                                          return true;
                                        }
                                      }
                                    ]
                                  })
                                    .then(function (result) {
                                      if (result) {
                                        localStorage.setItem('ficheSauvegarde', angular.toJson(init))
                                        $scope.synchronDataLocalProspect();
                                      } else {
                                        localStorage.setItem('ficheSauvegarde', angular.toJson(init))
                                        $scope.synchronDataLocalProspect();
                                      }
                                    });
                                })
                              })
                            } else {
                              localStorage.setItem('ficheSauvegarde', angular.toJson(echec))
                            }
                          }
                        })

                      })
                    })

                  });

                })
              })
            })


          }
        }

      }
    }
    $scope.synchronDataLocal();
    //Gerer les donnees locales: Synchronisation

    $scope.synchronDataLocalProspect = function () {
      //  $ionicLoading.show({ content: 'Tentative de synchronisation', animation: 'fade-in', showBackdrop: true, maxWidth: 800, showDelay: 0, timeout: 10000 });
      var flocal = angular.fromJson(localStorage.getItem('prospectsSauvegarde'));
      if (flocal == null || flocal.length == 0) {
        console.log('Pas de donnees locales')
        //  $ionicLoading.hide();
      } else {
        //  var echec = [];

        $translate('header_title_synchrone').then(function (header) {
          $translate('content_label_synchrone').then(function (content) {
            $translate('content_label_synchrone_nb_fichep').then(function (nb) {
              $translate('content_label_synchrone_nb_suggetion').then(function (sugest) {
                $translate('alert_button_oui').then(function (oui) {
                  $translate('alert_button_non').then(function (non) {
                    var echec = [];
                    $ionicPopup.show({
                      title: header,
                      template: content + "<br/>" + nb + flocal.length + "<br/>" + sugest,
                      scope: $scope,
                      buttons: [
                        {
                          text: non,
                          type: 'button-assertive',
                          onTap: function (e) {
                            return false;
                          }
                        },
                        {
                          text: oui,
                          type: 'button-energized',
                          onTap: function (e) {
                            return true;
                          }
                        }]
                    }).then(function (result) {
                      if (!result) {

                      } else {
                        // console.log(flocal[0])
                        var url = urlPhp.getUrl();
                        $ionicLoading.show({ content: 'Tentative de synchronisation', animation: 'fade-in', showBackdrop: true, maxWidth: 800, showDelay: 0, timeout: 3000 });
                        for (var i = 0; i < flocal.length; i++) {
                          $http.post(url + '/prospect.php', flocal[i]).then(function (res) {
                            console.log('index :' + i + " " + res.data)
                          }).catch(function (error) {
                            echec.push(flocal[i])
                            console.log('echoue')
                            $ionicLoading.hide();
                            alert('Synchro echouée');
                          });
                        }
                        console.log('Taille apres la boucle')
                        console.log(echec)
                        $ionicLoading.hide();

                        if (echec.length == 0) {
                          var init = [];
                          console.log('tout est envoyé')
                          $translate('alert_header_reussi').then(function (header) {
                            $translate('alert_content_reussi').then(function (content) {
                              $ionicPopup.confirm({
                                title: header,
                                content: content,
                                buttons: [
                                  {
                                    text: 'OK',
                                    type: 'button-energized',
                                    onTap: function (e) {
                                      return true;
                                    }
                                  }]
                              })
                                .then(function (result) {
                                  if (result) {
                                    localStorage.setItem('prospectsSauvegarde', angular.toJson(init))
                                  } else {
                                    localStorage.setItem('prospectsSauvegarde', angular.toJson(init))
                                  }
                                });
                            })
                          })

                        } else {
                          console.log('Taille s il ya erreur')
                          console.log(echec)
                          localStorage.setItem('prospectsSauvegarde', angular.toJson(echec))
                        }
                      }
                    })
                  })
                })

              })
            })
          })
        })

      }
    }



  })

  .controller('MyApp', function ($scope, $translate) {
    $scope.reloadPage = function () {
      window.location.reload();
    }

  })

  // Login Controller
  .controller('LoginCtrl', function ($scope,
    $http,
    $ionicPopup,
    $state,
    $cordovaSQLite,
    $ionicLoading,
    $ionicHistory,
    $translate,
    urlPhp) {


    $scope.user = {
      login: '',
      password: ''
    };
    //test connexion abou
    $scope.sowmenu = function () {
      console.log("ici ici")
    }
    $scope.login = function () {
      console.log('abou0')
      if (window.Connection) {
        console.log('abou1')
        if (navigator.connection.type == Connection.NONE) {
          console.log('abou2')
          $translate('alert_header_ofline').then(function (header) {
            console.log('abou3')
            $translate('alert_content_ofline_home').then(function (content) {

            });
          });

        } else {
          var url = urlPhp.getUrl();
          $ionicLoading.show({ content: 'Loading', animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0, duration: 10000 });
          var str = url + "/login1.php?login=" + $scope.user.login + "&password=" + $scope.user.password;
          $http.get(str)
            .success(function (res) { // if login request is Accepted
              $ionicLoading.hide();
              // records is the 'server response array' variable name.
              $scope.user_details = res.records; // copy response values to user-details object.
              console.log($scope.user_details);

              sessionStorage.setItem('loggedin_id',
                $scope.user_details.idUtilisateursPointVent);
              sessionStorage.setItem('loggedin_name', $scope.user_details.login);
              sessionStorage.setItem('loggedin_password', $scope.user_details.password);
              sessionStorage.setItem('loggedin_iduser', $scope.user_details.idutilisateur);
              sessionStorage.setItem('loggedin_profil', $scope.user_details.profil);
              console.log($scope.user_details.profil)
              localStorage.setItem('loggedin_id', $scope.user_details.idUtilisateursPointVent);
              localStorage.setItem('loggedin_name', $scope.user_details.login);
              localStorage.setItem('loggedin_password', $scope.user_details.password);
              localStorage.setItem('loggedin_iduser', $scope.user_details.idutilisateur);
              localStorage.setItem('loggedin_profil', $scope.user_details.profil);
              localStorage.setItem('isconn', true)
              $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
              });
              $translate('alert_connexion_reussi_header').then(function (header) {
                $translate('alert_connexion_reussi_content').then(function (content) {
                  var alertPopup = $ionicPopup.alert({
                    title: header,
                    template: content + $scope.user_details.login + ' !'
                  });
                });
              });

              $state.transitionTo('app.bienvenue', {}, {
                reload: true,
                inherit: true,
                notify: true
              });

            }).error(function () { //if login failed
              $ionicLoading.hide();
              $translate('alert_connexion_lost_header').then(function (header) {
                $translate('alert_connexion_lost_content').then(function (content) {
                  var alertPopup = $ionicPopup.alert({
                    title: header,
                    template: content
                  });
                });
              });

            });
        }
      }
    };
  })
  // Fiche Visite Controller
  .controller('FicheVisiteCtrl', function (
    $scope,
    $http,
    $ionicPopup,
    $state,
    $stateParams,
    $location,
    $cordovaGeolocation,
    $ionicLoading,
    ChekConnect,
    $translate,
    ProfilUser,
    ListpaysByProfil,
    urlJava,
    urlPhp
  ) {

    $scope.pointvente = [];
    $scope.data = {};
    $scope.data.pvchoisit = null;
    $scope.data.pvchoisitoffline = null;
    $scope.data.nosubmit = false;
    $scope.data.longitude = null;
    $scope.data.latitude = null;
    $scope.distance = 0;
    $scope.traitementLunch = false
    $scope.data.dblclk = 0;
    $scope.data.profile = 'limite';
    $scope.data.listpays;
    $scope.data.payschoisit = null
    $scope.data.payschoisioffline = null

    $scope.data.reponse = "oui"
    //Tester la connectiviteee
    $scope.testProfile = function () {
      $scope.data.profile = ProfilUser.profilUser();
    }
    $scope.checkConnect = function () {
      $scope.connect = ChekConnect.getConnectivite();
      $scope.testProfile();
      //console.log($scope.data.profile)

    }

    //Tester la connectiviteee
    $scope.checkConnect();

    $scope.getOptPays = function (option) {
      return option;
    };

    $scope.majvar = function () {
      $scope.data.nosubmit = true;
    }

    if ($scope.connect == false) {
      $scope.offline = angular.fromJson(localStorage.getItem('paysOnline'));
      $scope.listpayoffline = angular.fromJson(localStorage.getItem('paysOnline'));

      if ($scope.data.profile == "limite") {
        $scope.payschoisioffline = $scope.listpayoffline[0];
        console.log($scope.listpayoffline[0])
        $scope.listpayoffline = null;

        $scope.pointvente = []
        $scope.selectableNames = [];

        $scope.selectableNames = angular.fromJson(localStorage.getItem('pvOnline'))

        console.log($scope.selectableNames)
      } else {

      }

    }
    $scope.listpointdevnteoffline = function () {
      $scope.payschoisioffline = $scope.data.payschoisioffline;
      $scope.pointvente = []
      // console.log(angular.fromJson(localStorage.getItem('pvOnline')))
      $scope.pointvente = angular.fromJson(localStorage.getItem('pvOnline'))
      // console.log($scope.pointvente)
      $scope.selectableNames = [];
      if ($scope.pointvente != null) {
        for (var i = 0; i < $scope.pointvente.length; i++) {
          if ($scope.pointvente[i].codepays == $scope.payschoisioffline.code) {
            $scope.selectableNames.push($scope.pointvente[i]);
          }
          //var pv = { name: $scope.pointvente[i].client, id: $scope.pointvente[i].idpointVentes, code: $scope.pointvente[i].codePointVente, latitude: $scope.pointvente[i].latitude, longitude: $scope.pointvente[i].longitude }
        }
      }
      console.log($scope.selectableNames)
    }
    $scope.listpays = function () {
      // $scope.data.profil = ProfilUser.profilUser();

      var pays;
      var listdespays;
      var payschoisit;
      if (window.Connection) {
        if (navigator.connection.type == Connection.NONE) {
          connect = false;
        }
        else {
          connect = true;

          if ($scope.data.profile == 'super') {
            var url = urlPhp.getUrl();
            $http.get(url + "/pays.php")
              .success(function (response) {
                // $ionicLoading.hide();
                console.log(response)
                pays = response;

                $scope.data.listpays = [];
                for (var i = 0; i < response.length; i++) {
                  var pv = { name: response[i].pays, id: response[i].idpays, code: response[i].code }
                  $scope.data.listpays.push(pv);
                }
                console.log($scope.data.listpays)
                localStorage.setItem('paysOnline', angular.toJson($scope.data.listpays));
              }).catch(function (error) {
                // $ionicLoading.hide();
                console.log(error)
              });
            //
          } else {
            //Recuperer la liste des pays
            var url = urlPhp.getUrl();
            $http.get(url + "/paysByUser.php?idutilisateurs=" + sessionStorage.getItem('loggedin_iduser'))
              .success(function (response) {
                //  $ionicLoading.hide();
                pays = response;
                //  localStorage.setItem('paysOnline', angular.toJson(pays));
                $scope.data.listpays = [];
                console.log(response)
                for (var i = 0; i < response.length; i++) {
                  var pv = { name: response[i].pays, id: response[i].idpays, code: response[i].code }
                  $scope.data.listpays.push(pv);
                }
                if ($scope.data.listpays.length != 0) {
                  //  payschoisit = $scope.data.listpays[0];
                  $scope.data.payschoisit = $scope.data.listpays[0];
                  $scope.listpointdevnte();
                  localStorage.setItem('paysOnline', angular.toJson($scope.data.listpays));
                  $scope.data.listpays = null;
                }

                console.log($scope.data.payschoisit)
                // $scope.listDesregionsByPaysID();
              }).catch(function (error) {
                // $ionicLoading.hide();
              });
            //Recuperer la liste des villes
          }

        }
      }

    }
    $scope.selectables = [
      1, 2, 3
    ];

    $scope.longList = [];
    for (var i = 0; i < 1000; i++) {
      $scope.longList.push(i);
    }

    $scope.getOpt = function (option) {
      //$scope.data.idpointVentes = option.id;
      return option;
    };


    $scope.shoutLoud = function (newValuea, oldValue) {
      alert("changed from " + JSON.stringify(oldValue) + " to " + JSON.stringify(newValuea));
    };

    $scope.shoutReset = function () {
      alert("value was reset!");
    };

    var intervalGetPosition = null;

    $scope.jsonPositionsLog = [];
    $scope.isTrackingPosition = false;

    var latLng = new google.maps.LatLng(14.7645042, -17.3660286);

    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById("mapf"), mapOptions);

    initGetLocationListener = function () {

      // init location listener
      intervalGetPosition = navigator.geolocation.watchPosition(function (position) {
        $scope.data.latitude = position.coords.latitude;
        $scope.data.logitude = position.coords.longitude;
        $scope.jsonPositionsLog.push({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });

        $scope.$apply();
      },
        function (error) {
          console.log(error.message);
        }, {
        timeout: 3000
      });

    }

    var options = {
      timeout: 10000,
      enableHighAccuracy: true
    };

    calculDistance = function (maposition, pv) {
      var listDist = [];
      var f = function (a, b) {
        return a > b;
      }
      for (var i = 0; i < pv.length; i++) {
        var unit = 'K';
        var radlat1 = Math.PI * maposition.latitude / 180;
        var radlat2 = Math.PI * pv[i].latitude / 180;
        var theta = maposition.longitude - pv[i].longitude;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
          dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit == "K") { dist = dist * 1.609344 }
        if (unit == "N") { dist = dist * 0.8684 }
        var p = { name: pv[i].name, id: pv[i].id, code: pv[i].code, latitude: pv[i].latitude, longitude: pv[i].longitude, distance: dist }
        listDist.push(p);
      }
      if (listDist.length != 0) {
        for (var i = 0; i < listDist.length; i++) {
          for (var j = i + 1; j < listDist.length; j++) {
            if (f(listDist[j].distance, listDist[i].distance)) {
              var temp = listDist[j];
              listDist[j] = listDist[i];
              listDist[i] = temp;
            }
          }
        }
      }

      return listDist;
    }
    $scope.listpays();
    $scope.listpointdevnte = function () {
      $scope.data.pvchoisit = null;
      $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
        console.log(position.coords.latitude)
        var maposition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
        var url = urlJava.getUrl();
        var link = url + "/yup/mespointVente"
        iduser = sessionStorage.getItem('loggedin_iduser')
        var user = {
          user: {
            "nom": "",
            "prenom": "",
            "telephone": "",
            "langue": "",
            "pays": "",
            "profil": "",
            "reseauxagent": "",
            "login": "",
            "password": "",
            "id": "" + iduser,
            "codePays": $scope.data.payschoisit.code
          }
        }
        //   console.log(user)
        $ionicLoading.show({ content: 'Loading', animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0, duration: 10000 });
        $http.post(link, user).then(function (res) {
          var options = {
            timeout: 10000,
            enableHighAccuracy: true
          };

          $scope.pointvente = angular.fromJson(res.data).sort();
          $ionicLoading.hide();
          //console.log($scope.pointvente)

          $scope.selectableNames = [];
          $scope.list = [];
          $scope.lesplusproches = [];

          console.log($scope.pointvente)
          for (var i = 0; i < $scope.pointvente.length; i++) {
            var pv = {
              name: $scope.pointvente[i].pointvente,
              id: $scope.pointvente[i].id,
              code: $scope.pointvente[i].codePointVente,
              latitude: $scope.pointvente[i].latitude,
              longitude: $scope.pointvente[i].longitude,
              codepays: $scope.data.payschoisit.code
            }
            $scope.selectableNames.push(pv);

          }

          //Charger le pv en local
          var pvlocal = angular.fromJson(localStorage.getItem('pvOnline'))
          //     localStorage.setItem('pvOnline', angular.toJson($scope.pointvente));
          var tempon = [];
          if (pvlocal == null || pvlocal.length == 0) {
            localStorage.setItem('pvOnline', angular.toJson($scope.selectableNames));
          } else {

            for (var i = 0; i < $scope.selectableNames.length; i++) {
              pvlocal.push($scope.selectableNames[i])
            }
            localStorage.setItem('pvOnline', angular.toJson(pvlocal));
          }
          $scope.list = calculDistance(maposition, $scope.selectableNames);
          //$scope.selectableNames = [];
          //$scope.selectableNames = $scope.list;
          for (var i = 0; i < $scope.list.length; i++) {
            if ($scope.list[i].distance <= 2) {
              $scope.lesplusproches.push($scope.list[i])
            }
          }
          if ($scope.lesplusproches == null || $scope.lesplusproches.length == 0) {

          } else {
            $translate('alert_header_point_detecter').then(function (header) {
              $translate('alert_button_oui').then(function (oui) {
                $translate('alert_button_non').then(function (non) {
                  $ionicPopup.show({
                    title: header,
                    content: '{{ "alert_content_point_detecter" | translate }}',
                    buttons: [
                      {
                        text: non,
                        type: 'button-assertive',
                        onTap: function (e) {
                          return false;
                        }
                      },
                      {
                        text: oui,
                        type: 'button-energized',
                        onTap: function (e) {
                          return true;
                        }
                      }]
                  })
                    .then(function (result) {
                      if (!result) {

                      } else {

                        $scope.data.pvchoisit = $scope.lesplusproches[$scope.lesplusproches.length - 1];
                      }
                    })
                });
              });

            });

          }

          var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          var mapOptions = {
            center: latLng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };

          $scope.map = new google.maps.Map(document.getElementById("mapf"), mapOptions);


          //Wait until the map is loaded
          google.maps.event.addListenerOnce($scope.map, 'idle', function () {

            var marker = new google.maps.Marker({
              map: $scope.map,
              animation: google.maps.Animation.DROP,
              position: latLng,
              icon: 'img/marker.png'
            });

            var infoWindow = new google.maps.InfoWindow({
              content: "Ma position!"
            });

            google.maps.event.addListener(marker, 'click', function () {
              infoWindow.open($scope.map, marker);
            });

            $scope.lesplusproches.forEach(function (pv) {
              var marker = new google.maps.Marker({
                map: $scope.map,
                animation: google.maps.Animation.DROP,
                position: new google.maps.LatLng(pv.latitude, pv.longitude),
                icon: 'img/map-marker.png'
              });

              var infoWindow = new google.maps.InfoWindow({
                content: "Point: " + pv.name + "<br/>Code: " + pv.code + "<br/>Longitude: " + pv.longitude + "<br/>Latitude: " + pv.latitude
              });

              google.maps.event.addListener(marker, 'click', function () {
                infoWindow.open($scope.map, marker);
              })

            });

          })
        });

      }, function (error) {
        if ($scope.connect == true) {
          $scope.oui = '';
          $scope.non = '';
          $translate('alert_button_oui').then(function (oui) {
            $scope.oui = oui;
            console.log(oui);
            $translate('alert_button_non').then(function (non) {
              $scope.non = non;
              //  console.log(non);

              $ionicPopup.show({
                title: '',
                content: '{{ "alert_content_position" | translate }}',
                buttons: [
                  {
                    text: non,
                    type: 'button-assertive',
                    onTap: function (e) {
                      return false;
                    }
                  },
                  {
                    text: oui,
                    type: 'button-energized',
                    onTap: function (e) {
                      return true;
                    }
                  }]
              })
                .then(function (result) {
                  if (!result) {
                    var maposition = {
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude
                    }
                    var url = urlJava.getUrl();
                    var link = url + "/yup/mespointVente"
                    iduser = sessionStorage.getItem('loggedin_iduser')
                    var user = {
                      user: {
                        "nom": "",
                        "prenom": "",
                        "telephone": "",
                        "langue": "",
                        "pays": "",
                        "profil": "",
                        "reseauxagent": "",
                        "login": "",
                        "password": "",
                        "id": "" + iduser,
                        "codePays": $scope.data.payschoisit.code
                      }
                    }
                    $ionicLoading.show({ content: 'Loading', animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0, duration: 10000 });
                    $http.post(link, user).then(function (res) {
                      var options = {
                        timeout: 10000,
                        enableHighAccuracy: true
                      };

                      $scope.pointvente = angular.fromJson(res.data).sort();
                      $ionicLoading.hide();

                      $scope.selectableNames = [];

                      console.log($scope.pointvente)
                      for (var i = 0; i < $scope.pointvente.length; i++) {
                        var pv = {
                          name: $scope.pointvente[i].pointvente,
                          id: $scope.pointvente[i].id,
                          code: $scope.pointvente[i].codePointVente,
                          latitude: $scope.pointvente[i].latitude,
                          longitude: $scope.pointvente[i].longitude,
                          code: $scope.data.payschoisit.code
                        }
                        $scope.selectableNames.push(pv);
                      }
                    })
                  } else {
                    ionic.Platform.exitApp();
                  }
                });
            });

          });


        }
        console.log("Could not get location");
      });
    }


    $scope.startTracking = function () {
      // init location listener
      initGetLocationListener();
    }

    $scope.stopTrackingPosition = function () {
      navigator.geolocation.clearWatch(intervalGetPosition);
    }
    $scope.initvar = function () {
      $scope.data.bracheSecteur = null;
      $scope.data.brandingExterieur = null;
      $scope.data.connaissanceCodeEmployeTPE = null;
      $scope.data.dispositionTPE = null;
      $scope.data.flyers = null;
      $scope.data.formulaireClient = null;
      $scope.data.grilleTarifVisible = null;
      $scope.data.photoPoint = null;
      $scope.data.montantDeposit = null;
      $scope.data.niveauBatterieTPE = null;
      $scope.data.niveauFormation = null;
      $scope.data.presenceConcurence = null;
      $scope.data.brandingInterieur = null;
      $scope.data.idpointVentes = null;
      $scope.data.pvchoisit = null;
      $scope.data.pvchoisitoffline = null;
      $scope.data.actionAMener = null;
      $scope.data.latitude = null;
      $scope.data.longitude = null;
    }

    $scope.data = {};
    $scope.data.bracheSecteur = 'non';
    $scope.data.brandingExterieur = 'non';
    $scope.data.connaissanceCodeEmployeTPE = 'non';
    $scope.data.dispositionTPE = 'non';
    $scope.data.flyers = 'non';
    $scope.data.formulaireClient = 'non';
    $scope.data.grilleTarifVisible = 'non';
    $scope.data.photoPoint = 'non';
    $scope.data.montantDeposit = null;
    $scope.data.niveauBatterieTPE = '';
    $scope.data.niveauFormation = '';
    $scope.data.presenceConcurence = '';
    $scope.data.brandingInterieur = 'non';
    $scope.data.idpointVentes = "";
    $scope.date = new Date();
    $scope.data.reponse = "oui"
    // Enregistrement de la fiche de visite
    //Gerer les donnees locales: Synchronisation
    $scope.synchronDataLocal = function () {
      var flocal = angular.fromJson(localStorage.getItem('ficheSauvegarde'));
      if (flocal.length == 0) {
        console.log('Pas de donnees locales')
        $ionicLoading.hide();
      } else {
        $translate('header_title_synchrone').then(function (header) {
          $translate('content_label_synchrone').then(function (content) {
            $translate('content_label_synchrone_nb_fiche').then(function (nb) {
              $translate('content_label_synchrone_nb_suggetion').then(function (sugest) {
                var echec = [];
                $ionicPopup.show({
                  title: header,
                  template: content + "<br/>" + nb + flocal.length + "<br/>" + sugest,
                  scope: $scope,
                  buttons: [
                    {
                      text: 'OK',
                      type: 'button-energized',
                      onTap: function (e) {
                        return true;
                      }
                    }]
                }).then(function (result) {
                  if (!result) {

                  } else {
                    // console.log(flocal[0])
                    var url = urlJava.getUrl();
                    $ionicLoading.show({ content: 'Tentative de synchronisation', animation: 'fade-in', showBackdrop: true, maxWidth: 800, showDelay: 0, timeout: 10000 });
                    for (var i = 0; i < flocal.length; i++) {
                      $scope.data.value = flocal[i];
                      $http.post(url + '/yup/saveFiche', $scope.data.value).then(function (res) {
                        $ionicLoading.hide();
                      }).catch(function (error) {
                        echec.push(flocal[i])
                        $ionicLoading.hide();
                        alert('Synchro echouée');
                      });
                    }
                    if (echec.length == 0) {
                      var init = [];

                      $translate('alert_header_reussi').then(function (header) {
                        $translate('alert_content_reussi').then(function (content) {
                          $ionicPopup.confirm({
                            title: header,
                            content: content,
                            buttons: [
                              {
                                text: 'OK',
                                type: 'button-energized',
                                onTap: function (e) {
                                  return true;
                                }
                              }]
                          })
                            .then(function (result) {
                              if (result) {
                                localStorage.setItem('ficheSauvegarde', angular.toJson(init))
                              } else {
                                localStorage.setItem('ficheSauvegarde', angular.toJson(init))
                              }
                            });
                        })
                      })
                    } else {
                      localStorage.setItem('ficheSauvegarde', angular.toJson(echec))
                    }
                  }
                })

              });

            })
          })
        })


      }
    }

    $scope.submit = function () {
      $scope.traitementLunch = true
      if ($scope.data.dblclk == 0) {
        $scope.date1 = new Date();
        console.log($scope.data);
        //initialiser coordonnees si connection =  false
        if (window.Connection) {
          if (navigator.connection.type == Connection.NONE) {
            if ($scope.data.longitude == null) {
              $scope.data.longitude = 0
            }
            if ($scope.data.latitude == null) {
              $scope.data.latitude = 0
            }
          }
        }
        //control fromulaire
        if ($scope.data.montantDeposit == 0 ||
          $scope.data.montantDeposit == null ||
          $scope.data.niveauBatterieTPE == '' ||
          $scope.data.niveauFormation == '' ||
          $scope.data.presenceConcurence == '' ||
          $scope.data.pvchoisit.id == 0 ||
          $scope.data.longitude == null ||
          $scope.data.latitude == null
        ) {
          $scope.traitementLunch = true
          $translate('alert_header_formulairvide').then(function (header) {
            $ionicPopup.show({
              title: header,
              template: '{{ "alert_content_formulairvide" | translate }}',
              scope: $scope,
              buttons: [
                {
                  text: 'Ok',
                  type: 'button-positive'
                }
              ]
            });
          });
          $scope.traitementLunch = false
        } else {


          if ($scope.data.bracheSecteur == true) {
            $scope.data.bracheSecteur = 'OUI'
          } else {
            $scope.data.bracheSecteur = 'NON'
          }
          if ($scope.data.brandingExterieur == true) {
            $scope.data.brandingExterieur = 'OUI'
          } else {
            $scope.data.brandingExterieur = 'NON'
          }
          if ($scope.data.brandingInterieur == true) {
            $scope.data.brandingInterieur = 'OUI'
          } else {
            $scope.data.brandingInterieur = 'NON'
          }
          if ($scope.data.connaissanceCodeEmployeTPE == true) {
            $scope.data.connaissanceCodeEmployeTPE = 'OUI'
          } else {
            $scope.data.connaissanceCodeEmployeTPE = 'NON'
          }
          if ($scope.data.dispositionTPE == true) {
            $scope.data.dispositionTPE = 'OUI'
          } else {
            $scope.data.dispositionTPE = 'NON'
          }
          if ($scope.data.flyers == true) {
            $scope.data.flyers = 'OUI'
          } else {
            $scope.data.flyers = 'NON'
          }
          if ($scope.data.formulaireClient == true) {
            $scope.data.formulaireClient = 'OUI'
          } else {
            $scope.data.formulaireClient = 'NON'
          }
          if ($scope.data.grilleTarifVisible == true) {
            $scope.data.grilleTarifVisible = 'OUI'
          } else {
            $scope.data.grilleTarifVisible = 'NON'
          }
          if ($scope.data.photoPoint == true) {
            $scope.data.photoPoint = 'OUI'
          } else {
            $scope.data.photoPoint = 'NON'
          }

          $scope.data.value = {
            "fichev": {
              "actionAMener": $scope.data.actionAMener,
              "bracheSecteur": $scope.data.bracheSecteur,
              "brandingExterieur": $scope.data.brandingExterieur,
              "brandingInterieur": $scope.data.brandingInterieur,
              "connaissanceCodeEmployeTPE": $scope.data.connaissanceCodeEmployeTPE,
              "dispositionTPE": $scope.data.dispositionTPE,
              "flyers": $scope.data.flyers,
              "formulaireClient": $scope.data.formulaireClient,
              "grilleTarifVisible": $scope.data.grilleTarifVisible,
              "montantDeposit": $scope.data.montantDeposit,
              "niveauBatterieTPE": $scope.data.niveauBatterieTPE,
              "niveauFormation": $scope.data.niveauFormation,
              "photoPoint": $scope.data.photoPoint,
              "presenceConcurence": $scope.data.presenceConcurence,
              "idUser": sessionStorage.getItem('loggedin_iduser'),
              "idPointvent": $scope.data.pvchoisit.id,
              "clientPointvente": $scope.data.pvchoisit.code,
              "latitude": $scope.data.latitude,
              "longitude": $scope.data.longitude,
              "client": $scope.data.pvchoisit.name,
              "dateAjout": $scope.date,
              "reponse": $scope.data.reponse
            }
          };
          if (window.Connection) {
            if (navigator.connection.type == Connection.NONE) {
              //insertion en local pour renvoi en cas de connection =true
              $translate('alert_header_ofline').then(function (header) {
                $translate('alert_content_ofline').then(function (content) {
                  $translate('alert_button_oui').then(function (oui) {
                    $translate('alert_button_non').then(function (non) {

                      $ionicPopup.show({
                        title: header,
                        content: content,
                        buttons: [
                          {
                            text: non,
                            type: 'button-assertive',
                            onTap: function (e) {
                              return false;
                            }
                          },
                          {
                            text: oui,
                            type: 'button-energized',
                            onTap: function (e) {
                              return true;
                            }
                          }]
                      })
                        .then(function (result) {
                          if (!result) {
                            $scope.traitementLunch = false
                            ionic.Platform.exitApp();

                          } else {
                            var flocal = angular.fromJson(localStorage.getItem('ficheSauvegarde'));
                            console.log()
                            flocal.push($scope.data.value)
                            console.log(flocal)
                            localStorage.setItem('ficheSauvegarde', angular.toJson(flocal));
                            $translate('alert_header_reussi').then(function (header) {
                              $translate('alert_content_reussi').then(function (content) {
                                $ionicPopup.confirm({
                                  title: header,
                                  content: content,
                                  buttons: [
                                    {
                                      text: 'OK',
                                      type: 'button-energized',
                                      onTap: function (e) {
                                        return true;
                                      }
                                    }]
                                })
                                  .then(function (result) {
                                    if (result) {
                                      $scope.data.dblclk = 0;
                                      $scope.traitementLunch = false
                                      $scope.data = {};
                                      //  console.log(angular.fromJson(localStorage.getItem('ficheSauvegarde')))
                                    } else {

                                      $scope.data.dblclk = 0;
                                      $scope.data = {};
                                      $scope.traitementLunch = false
                                    }
                                  });
                              });
                            });

                          }
                        });
                    });
                  });


                });
              });

            } else {
              var url = urlJava.getUrl();
              $ionicLoading.show({ content: 'Loading', animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0, duration: 10000 });
              $http.post(url + '/yup/saveFiche', $scope.data.value).then(function (res) {
                $ionicLoading.hide();
                console.log(res)
                if (res.data[0].reponse == 'ok') {
                  $translate('alert_header_reussi').then(function (header) {
                    $translate('alert_content_reussi').then(function (content) {
                      $ionicPopup.confirm({
                        title: header,
                        content: content,
                        buttons: [
                          {
                            text: 'OK',
                            type: 'button-energized',
                            onTap: function (e) {
                              return true;
                            }
                          }]
                      })
                        .then(function (result) {
                          if (!result) {
                            //forcer la syncronisation
                            $scope.traitementLunch = false
                            $scope.synchronDataLocal();
                          } else {
                            //forcer la syncronisation
                            $scope.traitementLunch = false
                            $scope.synchronDataLocal();
                          }
                        });
                    });

                  });
                  $scope.traitementLunch = false
                  $scope.data.dblclk = 0;
                  $scope.initvar();
                } else if (res.data[0].reponse == '20190416') {

                  $translate('fichevisite_message_doublon').then(function (content) {
                    $translate('alert_button_oui').then(function (oui) {
                      $translate('alert_button_non').then(function (non) {
                        $ionicPopup.confirm({
                          title: " ",
                          content: content,
                          buttons: [
                            {
                              text: non,
                              type: 'button-assertive',
                              onTap: function (e) {
                                return false;
                              }
                            },
                            {
                              text: oui,
                              type: 'button-energized',
                              onTap: function (e) {
                                return true;
                              }
                            }]
                        })
                          .then(function (result) {
                            if (!result) {

                            } else {

                              $scope.data.value = {
                                "fichev": {
                                  "actionAMener": res.data[0].actionAMener,
                                  "bracheSecteur": res.data[0].bracheSecteur,
                                  "brandingExterieur": res.data[0].brandingExterieur,
                                  "brandingInterieur": res.data[0].brandingInterieur,
                                  "connaissanceCodeEmployeTPE": res.data[0].connaissanceCodeEmployeTPE,
                                  "dispositionTPE": res.data[0].dispositionTPE,
                                  "flyers": res.data[0].flyers,
                                  "formulaireClient": res.data[0].formulaireClient,
                                  "grilleTarifVisible": res.data[0].grilleTarifVisible,
                                  "montantDeposit": $scope.data.montantDeposit,
                                  "niveauBatterieTPE": $scope.data.niveauBatterieTPE,
                                  "niveauFormation": res.data[0].niveauFormation,
                                  "photoPoint": res.data[0].photoPoint,
                                  "presenceConcurence": res.data[0].presenceConcurence,
                                  "idUser": res.data[0].idUser,
                                  "idPointvent": res.data[0].idPointvent,
                                  "clientPointvente": res.data[0].clientPointvente,
                                  "latitude": res.data[0].latitude,
                                  "longitude": res.data[0].longitude,
                                  "client": res.data[0].clientPointvente,
                                  "dateAjout": res.data[0].dateAjout,
                                  "reponse": "confirme"
                                }
                              };
                              console.log($scope.data.value)
                              var url = urlJava.getUrl();
                              $ionicLoading.show({ content: 'Loading', animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0, duration: 10000 });
                              $http.post(url + '/yup/saveFiche', $scope.data.value).then(function (res) {

                                $ionicLoading.hide();
                                console.log(res)

                                $translate('alert_header_reussi').then(function (header) {
                                  $translate('alert_content_reussi').then(function (content) {
                                    $ionicPopup.confirm({
                                      title: header,
                                      content: content,
                                      buttons: [
                                        {
                                          text: 'OK',
                                          type: 'button-energized',
                                          onTap: function (e) {
                                            return true;
                                          }
                                        }]
                                    })
                                      .then(function (result) {
                                        if (!result) {
                                          //forcer la syncronisation
                                          //  $scope.traitementLunch = false
                                          //   $scope.synchronDataLocal();
                                        } else {
                                          //forcer la syncronisation
                                          //   $scope.traitementLunch = false
                                          //   $scope.synchronDataLocal();
                                        }
                                      });
                                  });

                                });
                                $scope.traitementLunch = false
                                $scope.data.dblclk = 0;
                                $scope.initvar();
                              }).catch(function (error) {
                                $ionicLoading.hide();
                                $scope.data.dblclk = 0;
                                $scope.traitementLunch = false
                                $translate('alert_insert_echec').then(function (content) {
                                  alert(content);
                                });

                              });

                            }
                          });
                      })
                    })

                  });

                  $scope.traitementLunch = false
                  $scope.data.dblclk = 0;
                }


              }).catch(function (error) {
                $ionicLoading.hide();
                $scope.data.dblclk = 0;
                $scope.traitementLunch = false
                $translate('alert_insert_echec').then(function (content) {
                  alert(content);
                });

              });
            }
          }

        }

      } else {
        $translate('alert_ddlclck').then(function (content) {
          $translate('alert_header_formulairvide').then(function (header) {
            $ionicPopup.show({
              title: header,
              template: content,
              scope: $scope,
              buttons: [{
                text: 'Ok',
                type: 'button-positive'
              }]
            }).then(function (result) {
              if (!result) {
                $scope.data.dblclk = 0;
                $scope.traitementLunch = false

              } else {
                $scope.data.dblclk = 0;
                $scope.traitementLunch = false
              }
            });
          });


        });

      }
    }
  })
  .controller('ProspectsCtrl', function ($scope,
    $http,
    $ionicLoading,
    $ionicPopup,
    $cordovaGeolocation,
    ChekConnect,
    $translate,
    $cordovaCamera,
    $ionicModal,
    ProfilUser,
    urlPhp,
    urlJava) {

    $scope.data = {};
    $scope.data.regionchoisit = null;
    $scope.data.villechoisit = null;
    $scope.data.payschoisit = null;
    $scope.connect = null;
    $scope.data.date = new Date();
    $scope.data.longitude = '0';
    $scope.data.latitude = '0';
    $scope.data.profile = 'limite';
    $scope.images = [];
    $scope.img = '';
    $scope.showphoto = true;

    $scope.testProfile = function () {

      $scope.data.profile = ProfilUser.profilUser();
    }
    //Tester la connectiviteee
    $scope.checkConnect = function () {
      $scope.testProfile();
      $scope.connect = ChekConnect.getConnectivite();
    }
    $scope.initCtrl = function () {
      $scope.checkConnect();
      if ($scope.connect == false) {
        $scope.showphoto = false;
        $translate('alert_header_ofline').then(function (header) {
          $translate('alert_content_ofline_list').then(function (content) {
            $translate('alert_button_oui').then(function (oui) {
              $translate('alert_button_non').then(function (non) {
                $ionicPopup.show({
                  title: header,
                  content: content,
                  buttons: [
                    {
                      text: non,
                      type: 'button-assertive',
                      onTap: function (e) {
                        return false;
                      }
                    },
                    {
                      text: oui,
                      type: 'button-energized',
                      onTap: function (e) {
                        return true;
                      }
                    }]
                })
                  .then(function (result) {
                    if (!result) {
                      ionic.Platform.exitApp();
                    }
                  });
              });
            });
          });
        });

      }
    }
    //Tester la connectiviteee
    $scope.initCtrl();
    //Initialiser la liste de regions selon le connectivite
    $scope.initReg = function () {
      if ($scope.connect == true) {

        $ionicLoading.show({
          content: 'Loading',
          animation: 'fade-in',
          showBackdrop: true,
          maxWidth: 200,
          showDelay: 0,
          duration: 10000
        });
        console.log('Je suis ici')
        var url = urlPhp.getUrl();
        $http.get(url + "/pays.php")
          .success(function (response) {
            $ionicLoading.hide();
            //$scope.pays = response;
            console.log(response)

            // localStorage.setItem('paysOnline', angular.toJson($scope.pays));
            $scope.listdespays = [];
            for (var i = 0; i < response.length; i++) {
              var pv = { name: response[i].pays, id: response[i].idpays }
              $scope.listdespays.push(pv);
            }
            if ($scope.listdespays.length != 0) {
              $scope.data.payschoisit = $scope.listdespays[0];
              $scope.listDesregionsByPaysID();
            }
          }).catch(function (error) {
            $ionicLoading.hide();
          });
        /*    if ($scope.data.profile == 'super') {
              var url = urlPhp.getUrl();
              $http.get(url + "/pays.php")
                .success(function (response) {
                  $ionicLoading.hide();
                  $scope.pays = response;
                  localStorage.setItem('paysOnline', angular.toJson($scope.pays));
                  $scope.listdespays = [];
                  for (var i = 0; i < response.length; i++) {
                    var pv = { name: response[i].pays, id: response[i].idpays }
                    $scope.listdespays.push(pv);
                  }
                }).catch(function (error) {
                  $ionicLoading.hide();
                });
              //
    
            } else {
             
              //Recuperer la liste des pays
              var url = urlPhp.getUrl();
              $http.get(url + "/paysByUser.php?idutilisateurs=" + sessionStorage.getItem('loggedin_iduser'))
                .success(function (response) {
                  $ionicLoading.hide();
                  $scope.pays = response;
                  localStorage.setItem('paysOnline', angular.toJson($scope.pays));
    
                  $scope.listdespays = [];
                  for (var i = 0; i < response.length; i++) {
                    var pv = { name: response[i].pays, id: response[i].idpays }
                    $scope.listdespays.push(pv);
                  }
                  if ($scope.listdespays.length != 0) {
                    $scope.data.payschoisit = $scope.listdespays[0];
                  }
                  $scope.listDesregionsByPaysID();
                }).catch(function (error) {
                  $ionicLoading.hide();
    
                });
              //Recuperer la liste des villes
    
            }
    */

      } else {
        //console.log('eerror connexion')
        $scope.pays = []
        $scope.pays = angular.fromJson(localStorage.getItem('paysOnline'))
        // console.log($scope.pointvente)
        $scope.listdespays = [];
        if ($scope.pays != null) {
          for (var i = 0; i < $scope.pays.length; i++) {
            var pv = { name: $scope.pays[i].pays, id: $scope.pays[i].idpays }
            $scope.listdespays.push(pv);
          }
        }
        if ($scope.data.profile == 'limite') {
          $scope.data.payschoisit = $scope.listdespays[0]
        }
        $scope.listDesregionsByPaysID();
      }
    }

    $scope.listDesregionsByPaysID = function () {

      if ($scope.connect == true) {
        //Recuperer la liste des regions
        console.log($scope.data.payschoisit.id)
        var url = urlPhp.getUrl();
        $http.get(url + "/regionsByPays.php?idpays=" + $scope.data.payschoisit.id)
          .success(function (response) {
            $ionicLoading.hide();
            $scope.region = response;
            //  localStorage.setItem('regionsOnline', angular.toJson($scope.region));
            $scope.listregions = [];
            for (var i = 0; i < response.length; i++) {
              var pv = { name: response[i].region, id: response[i].idregion }
              $scope.listregions.push(pv);
            }

          }).catch(function (error) {
            $ionicLoading.hide();

          });
      } else {
        $scope.region = []
        $scope.region = angular.fromJson(localStorage.getItem('regionsOnline'))
        // console.log($scope.pointvente)
        $scope.listregions = [];
        if ($scope.data.profile == 'super') {
          //   $scope.listregions =  $scope.region;
          for (var i = 0; i < $scope.region.length; i++) {

            var pv = { name: $scope.region[i].region, id: $scope.region[i].idregion }
            $scope.listregions.push(pv);


          }
        } else {

          if ($scope.region != null) {
            for (var i = 0; i < $scope.region.length; i++) {
              if ($scope.region[i].idpays == $scope.data.payschoisit.id) {
                var pv = { name: $scope.region[i].region, id: $scope.region[i].idregion }
                $scope.listregions.push(pv);
              }

            }
          }
        }
      }

    }
    $scope.initvar = function () {
      $scope.data.adresse = null
      $scope.data.telephone = null
      $scope.data.gerant = null
      $scope.data.latitude = null
      $scope.data.longitude = null
      $scope.data.villechoisit = null
      $scope.data.date = new Date();
      $scope.data.idutilisateur = localStorage.getItem('loggedin_iduser');;
    }
    $scope.listVillesByRegionID = function () {
      if ($scope.connect == true) {
        //Recuperer la liste des villes
        var url = urlPhp.getUrl();
        $http.get(url + "/villeByRegion.php?idregion=" + $scope.data.regionchoisit.id)
          .success(function (response) {
            $ionicLoading.hide();
            $scope.ville = response;
            // localStorage.setItem('villesOnline', angular.toJson($scope.ville));
            $scope.listvilles = [];
            for (var i = 0; i < response.length; i++) {
              var pv = { name: response[i].ville, id: response[i].idville }
              $scope.listvilles.push(pv);
            }
            //    console.log($scope.listvilles)
          }).catch(function (error) {
            $ionicLoading.hide();
          });
      } else {
        $scope.ville = []
        $scope.ville = angular.fromJson(localStorage.getItem('villesOnline'))
        // console.log($scope.pointvente)
        $scope.listvilles = [];
        if ($scope.ville != null) {
          for (var i = 0; i < $scope.ville.length; i++) {
            if ($scope.ville[i].idregion == $scope.data.regionchoisit.id) {
              var pv = { name: $scope.ville[i].ville, id: $scope.ville[i].idville }
              $scope.listvilles.push(pv);
            }

          }
        }
      }

    }
    $scope.chargerLesVillesEnLocal = function () {
      $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0,
        duration: 10000
      });
      //Recuperer la liste des villes
      var url = urlPhp.getUrl();
      $http.get(url + "/Allville.php")
        .success(function (response) {
          $ionicLoading.hide();
          $scope.ville = response;
          localStorage.setItem('villesOnline', angular.toJson($scope.ville));
        }).catch(function (error) {
          $ionicLoading.hide();
        });
    }
    $scope.chargerLesRegionsEnLocal = function () {
      $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0,
        duration: 10000
      });
      //Recuperer la liste des regions
      var url = urlPhp.getUrl();
      $http.get(url + "/Allregions.php")
        .success(function (response) {
          $ionicLoading.hide();
          $scope.region = response;
          console.log(response);
          localStorage.setItem('regionsOnline', angular.toJson($scope.region));
        }).catch(function (error) {
          $ionicLoading.hide();

        });
    }
    //Initialiser la liste de regions selon le connectivite
    $scope.initReg();
    //Gerer les donnees locales: Synchronisation
    $scope.synchronDataLocalProspect = function () {
      var flocal = angular.fromJson(localStorage.getItem('prospectsSauvegarde'));
      if (flocal.length == 0) {
        console.log('Pas de donnees locales')

      } else {
        $translate('header_title_synchrone').then(function (header) {
          $translate('content_label_synchrone').then(function (content) {
            $translate('content_label_synchrone_nb_fiche').then(function (nb) {
              var echec = [];
              $ionicPopup.show({
                title: header,
                template: content + "<br/>" + nb + flocal.length,
                scope: $scope,
                buttons: [
                  {
                    text: 'OK',
                    type: 'button-energized',
                    onTap: function (e) {
                      return true;
                    }
                  }]
              })
                .then(function (result) {
                  if (!result) {

                  } else {
                    var url = urlPhp.getUrl();
                    $ionicLoading.show({ content: 'Tentative de synchronisation', animation: 'fade-in', showBackdrop: true, maxWidth: 800, showDelay: 0, timeout: 10000 });
                    for (var i = 0; i < flocal.length; i++) {
                      $http.post(url + '/prospect.php', flocal[i]).then(function (res) {
                        console.log('index :' + i + " " + res.data)
                      }).catch(function (error) {
                        echec.push(flocal[i])
                        console.log('echoue')
                        $ionicLoading.hide();
                        alert('Synchro echouée');
                      });
                    }
                    console.log('Taille apres la boucle')
                    console.log(echec)
                    $ionicLoading.hide();

                    if (echec.length == 0) {
                      var init = [];
                      console.log('tout est envoyé')
                      $translate('alert_header_reussi').then(function (header) {
                        $translate('alert_content_reussi').then(function (content) {
                          $ionicPopup.confirm({
                            title: header,
                            content: content,
                            buttons: [
                              {
                                text: 'OK',
                                type: 'button-energized',
                                onTap: function (e) {
                                  return true;
                                }
                              }]
                          })
                            .then(function (result) {
                              if (result) {
                                localStorage.setItem('prospectsSauvegarde', angular.toJson(init))
                              } else {
                                localStorage.setItem('prospectsSauvegarde', angular.toJson(init))
                              }
                            });
                        })
                      })


                    } else {
                      console.log('Taille s il ya erreur')
                      console.log(echec)
                      localStorage.setItem('prospectsSauvegarde', angular.toJson(echec))
                    }
                  }
                });

            })

          })
        })


      }
    }
    $scope.selectables = [
      1, 2, 3
    ];
    $scope.longList = [];
    for (var i = 0; i < 1000; i++) {
      $scope.longList.push(i);
    }

    $scope.getOptPays = function (option) {

      return option;
    };
    $scope.getOptRegion = function (option) {
      //   console.log($scope.data.regionchoisit)
      return option;
    };
    $scope.getOptVille = function (option) {
      //   console.log($scope.data.villechoisit)
      return option;
    };

    $scope.shoutLoud = function (newValuea, oldValue) {
      alert("changed from " + JSON.stringify(oldValue) + " to " + JSON.stringify(newValuea));
    };

    $scope.shoutReset = function () {
      alert("value was reset!");
    };


    var intervalGetPosition;

    $scope.jsonPositionsLog = [];
    $scope.isTrackingPosition = false;

    $scope.startTracking = function () {
      // init location listener
      initGetLocationListener();
    }

    $scope.stopTrackingPosition = function () {
      navigator.geolocation.clearWatch(intervalGetPosition);
    }

    getCurrentPosition = function () {
      navigator.geolocation.getCurrentPosition(function (position) {
        // get lat and long
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;

        // add positions to array
        $scope.jsonPositionsLog.push({
          latitude: latitude,
          longitude: longitude
        });

        $scope.$apply();
      });
    }

    initGetLocationListener = function () {
      // init location listener
      intervalGetPosition = navigator.geolocation.watchPosition(function (position) {
        $scope.jsonPositionsLog.push({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        $scope.$apply();
      },
        function (error) {
          console.log(error.message);
        }, {
        timeout: 3000
      });
    }

    var options = {
      timeout: 10000,
      enableHighAccuracy: true
    };

    $cordovaGeolocation.getCurrentPosition(options).then(function (position) {

      var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      var mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      $scope.map = new google.maps.Map(document.getElementById("mapp"), mapOptions);


      //Wait until the map is loaded
      google.maps.event.addListenerOnce($scope.map, 'idle', function () {

        var marker = new google.maps.Marker({
          map: $scope.map,
          animation: google.maps.Animation.DROP,
          position: latLng
        });

        var infoWindow = new google.maps.InfoWindow({
          content: "Je suis ici !"
        });

        google.maps.event.addListener(marker, 'click', function () {
          infoWindow.open($scope.map, marker);
        });

      });

    }, function (error) {
      console.log("Could not get location");
    });

    localStorage.getItem("username");
    localStorage.getItem("password");

    console.log(localStorage.getItem("username"));
    console.log(localStorage.getItem("password"));


    $ionicModal.fromTemplateUrl('modal.html', function (modal) {
      $scope.gridModal = modal;
    }, {
      scope: $scope,
      animation: 'slide-in-up'
    })
    $scope.openModal = function (data) {
      $scope.inspectionItem = data;
      $scope.gridModal.show();
    }
    $scope.closeModal = function () {
      $scope.gridModal.hide();
    }


    $scope.addImage = function () {
      // 2
      $scope.images = null;
      $ionicLoading.show({
        template: 'Chargement...'
      });
      var options = {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: false,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 500,
        targetHeight: 500,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false,
        correctOrientation: true
      };

      // 3
      $cordovaCamera.getPicture(options).then(function (imageData) {
        // 4
        //onImageSuccess(imageData);
        $scope.images = "data:image/jpeg;base64," + imageData;
        $scope.img = imageData;
        $ionicLoading.hide();
      }, function (err) {
        $ionicLoading.hide();
        console.log(err);
      });
    }
    $scope.insetImage = function (fiche) {
      var url = urlJava.getUrl();
      var link = url + "/mediatheque/uploadImageProspect";
      $http.post(link, {
        "idfiche": fiche,
        "imageData": "" + $scope.img
      }).then(function (res) {
        $translate('alert_header_reussi').then(function (header) {
          $translate('alert_content_reussi').then(function (content) {
            $ionicPopup.show({
              title: header,
              template: content,
              scope: $scope,
              buttons: [
                {
                  text: 'OK',
                  type: 'button-energized',
                  onTap: function (e) {
                    return true;
                  }
                }]
            })
              .then(function (result) {
                if (!result) {
                  //forcer la syncronisation
                  $scope.synchronDataLocalProspect();
                } else {
                  //forcer la syncronisation
                  $scope.synchronDataLocalProspect();
                }
              });
          });
        });
        $scope.initvar();
      }).catch(function (error) {
        console.log(error)
        alert(error);
      });/*.cath(function (err) {
        alert('Error');
      });*/
    }
    $scope.submit = function () {
      $scope.checkConnect();

      if ($scope.data.adresse == null ||
        $scope.data.gerant == null ||
        $scope.data.telephone == null) {
        $translate('alert_header_formulairvide').then(function (header) {
          $translate('alert_content_formulairvide').then(function (content) {
            $ionicPopup.show({
              title: header,
              template: content,
              scope: $scope,
              buttons: [{
                text: 'Ok',
                type: 'button-positive'
              }]
            });
          });
        });

      } else {

        $scope.value = {
          longitude: $scope.data.longitude,
          latitude: $scope.data.latitude,
          adresse: $scope.data.adresse,
          gerant: "" + $scope.data.gerant,
          idutilisateur: localStorage.getItem('loggedin_iduser'),
          ville: $scope.data.villechoisit.id,
          dateajout: $scope.data.date,
          telephone: $scope.data.telephone
        };
        if ($scope.connect == true) {
          console.log("Objet a envoyer")
          console.log($scope.value)
          var url = urlPhp.getUrl();
          var link = url + '/pointventeccbm.php';
          $ionicLoading.show({ content: 'Loading', animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0, duration: 10000 });
          console.log($scope.value)
          $http.post(link, $scope.value)
            .then(function (res) {
              console.log("Retour insert prospect")
              console.log(res)
              if (res.data == "1") {
                $scope.initvar();
                $ionicPopup.show({
                  title: "Infos",
                  template: "Insertion réussit",
                  scope: $scope,
                  buttons: [{
                    text: 'Ok',
                    type: 'button-positive'
                  }]
                });
              }

              $ionicLoading.hide();

            }).catch(function (error) {
              console.log(error)
              $ionicLoading.hide();
              alert(error);
            });
        } else {
          //insertion en local pour renvoi en cas de connection =true
          $translate('alert_header_ofline').then(function (header) {
            $translate('alert_content_ofline').then(function (content) {
              $translate('alert_button_oui').then(function (oui) {
                $translate('alert_button_non').then(function (non) {
                  $ionicPopup.show({
                    title: header,
                    content: content,
                    buttons: [
                      {
                        text: non,
                        type: 'button-assertive',
                        onTap: function (e) {
                          return false;
                        }
                      },
                      {
                        text: oui,
                        type: 'button-energized',
                        onTap: function (e) {
                          return true;
                        }
                      }]
                  })
                    .then(function (result) {
                      if (!result) {

                      } else {
                        $scope.value = {
                          prospect: $scope.data.prospect,
                          idregions: $scope.data.regionchoisit.id,
                          commentaire: $scope.data.commentaire,
                          longitude: '0',
                          latitude: '0',
                          adresse: $scope.data.adresse,
                          Frequentationdeslieux: "" + $scope.data.frequentationdeslieux,
                          tailledupoint: $scope.data.tailledupoint,
                          presencedelaconcurrence: $scope.data.presencedelaconcurrence,
                          InteretmanifestepourYUP: $scope.data.InteretmanifestepourYUP,
                          idutilisateurs: sessionStorage.getItem('loggedin_iduser'),
                          ville: $scope.data.regionchoisit.name,
                          dateajout: $scope.data.date
                        };
                        var plocal = angular.fromJson(localStorage.getItem('prospectsSauvegarde'));
                        plocal.push($scope.value)
                        localStorage.setItem('prospectsSauvegarde', angular.toJson(plocal));
                        $translate('alert_header_reussi').then(function (header) {
                          $translate('alert_content_reussi').then(function (content) {
                            $ionicPopup.confirm({
                              title: header,
                              content: content,
                              buttons: [
                                {
                                  text: 'OK',
                                  type: 'button-energized',
                                  onTap: function (e) {
                                    return true;
                                  }
                                }]
                            })
                              .then(function (result) {
                                if (result) {
                                  $scope.initvar();
                                } else {
                                  $scope.initvar();
                                }
                              });
                          });
                        });

                      }
                    });

                });
              });
            });
          });

        }
      }
    }
  })
  .controller('MesfichesCtrl', function ($scope, $http, $ionicLoading, $ionicPopup, $translate, urlJava) {
    $scope.data = {};
    $scope.checkConnect = function () {
      if (window.Connection) {
        console.log('in')
        if (navigator.connection.type == Connection.NONE) {
          $scope.data.connect = false;
          $translate('alert_header_ofline').then(function (header) {
            $translate('alert_content_ofline_list').then(function (content) {
              $translate('alert_button_oui').then(function (oui) {
                $translate('alert_button_non').then(function (non) {
                  $ionicPopup.show({
                    title: header,
                    content: content,
                    buttons: [
                      {
                        text: oui,
                        type: 'button-assertive',
                        onTap: function (e) {
                          return false;
                        }
                      },
                      {
                        text: non,
                        type: 'button-energized',
                        onTap: function (e) {
                          return true;
                        }
                      }]
                  })
                    .then(function (result) {
                      if (!result) {

                        $ionicLoading.show({ content: 'Loading', animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0, duration: 10000 });
                        var flocal = angular.fromJson(localStorage.getItem('ficheSauvegarde'));
                        console.log(flocal)
                        $scope.mesfichesvisitelocal = flocal;
                        $ionicLoading.hide();
                      } else {
                        ionic.Platform.exitApp();
                      }
                    });
                });
              });
            });
          });

        }
        else {
          $scope.data.connect = true;
          iduser = sessionStorage.getItem('loggedin_iduser')
          var user = {
            user: {
              "nom": "",
              "prenom": "",
              "telephone": "",
              "langue": "",
              "pays": "",
              "profil": "",
              "reseauxagent": "",
              "login": "",
              "password": "",
              "id": "" + iduser
            }
          }
          $ionicLoading.show({ content: 'Loading', animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0, duration: 3000 });
          var url = urlJava.getUrl();
          var link = url + "/yup/mesfichesdevisites";
          $http.post(link, user)
            .success(function (response) {
              $ionicLoading.hide();
              $scope.synchronDataLocal();
              console.log(response)
              $scope.mesfichesvisite = response;
              //console.log($scope.mesfichesvisite);
            }).catch(function (error) {
              $ionicLoading.hide();
              alert(error);
            });
        }
      }
    }
    $scope.checkConnect();
    //Gerer les donnees locales: Synchronisation
    $scope.synchronDataLocal = function () {
      // $ionicLoading.show({ content: 'Tentative de synchronisation', animation: 'fade-in', showBackdrop: true, maxWidth: 800, showDelay: 0, timeout: 10000 });

      var flocal = angular.fromJson(localStorage.getItem('ficheSauvegarde'));
      if (flocal.length == 0) {
        console.log('Pas de donnees locales')
        //   $ionicLoading.hide();
      } else {

        $translate('header_title_synchrone').then(function (header) {
          $translate('content_label_synchrone').then(function (content) {
            $translate('content_label_synchrone_nb_fiche').then(function (nb) {
              $translate('content_label_synchrone_nb_suggetion').then(function (sugest) {
                var echec = [];
                $ionicPopup.show({
                  title: header,
                  template: content + "<br/>" + nb + flocal.length + "<br/>" + sugest,
                  scope: $scope,
                  buttons: [
                    {
                      text: 'OK',
                      type: 'button-energized',
                      onTap: function (e) {
                        return true;
                      }
                    }]
                }).then(function (result) {
                  if (!result) {

                  } else {
                    // console.log(flocal[0])
                    $ionicLoading.show({ content: 'Tentative de synchronisation', animation: 'fade-in', showBackdrop: true, maxWidth: 800, showDelay: 0, timeout: 3000 });
                    var url = urlJava.getUrl();
                    for (var i = 0; i < flocal.length; i++) {
                      $scope.data.value = flocal[i];
                      $http.post(url + '/yup/saveFiche', $scope.data.value).then(function (res) {
                        $ionicLoading.hide();
                      }).catch(function (error) {
                        echec.push(flocal[i])
                        $ionicLoading.hide();
                        alert('Synchro echouée');
                      });
                    }
                    if (echec.length == 0) {
                      var init = [];

                      $translate('alert_header_reussi').then(function (header) {
                        $translate('alert_content_reussi').then(function (content) {
                          $ionicPopup.confirm({
                            title: header,
                            content: content,
                            buttons: [
                              {
                                text: 'OK',
                                type: 'button-energized',
                                onTap: function (e) {
                                  return true;
                                }
                              }]
                          })
                            .then(function (result) {
                              if (result) {
                                localStorage.setItem('ficheSauvegarde', angular.toJson(init))
                              } else {
                                localStorage.setItem('ficheSauvegarde', angular.toJson(init))
                              }
                            });
                        })
                      })
                    } else {
                      localStorage.setItem('ficheSauvegarde', angular.toJson(echec))
                    }
                  }
                })

              });

            })
          })
        })

      }
    }
  })
  .controller('MediasCtrl', function ($scope, $http, $state, $ionicLoading, urlPhp) {
    var url = urlPhp.getUrl();
    $ionicLoading.show({ content: 'Loading', animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0, duration: 10000 });
    $http.get(url + "/medias.php")
      .success(function (response) {
        $ionicLoading.hide();
        $scope.medias = response;
      }).catch(function (error) {
        $ionicLoading.hide();
        alert(error);
      });
  })

  .controller('SignupCtrl', function ($scope, $http, $ionicPopup, $state, $translate, urlPhp) {
    $scope.data = {};
    $scope.myusername = localStorage.getItem("username");
    //console.log($scope.myusername);

    $scope.submit = function () {
      var url = urlPhp.getUrl();
      var link = url + '/compte.php';

      $http.post(link, {
        loginame: $scope.data.username,
        newpassword: $scope.data.newpassword1,
        newpasswordc: $scope.data.newpassword2,
      });

      $http.get(url + '/compte.php?username=' + sessionStorage.getItem('loggedin_name') + '&newpassword=' + $scope.data.newpassword1 + '&newpasswordc=' + $scope.data.newpassword2).then(function (res) {
        $scope.response = res.data;
        //console.log($scope.response);
        $translate('alert_header_reussi').then(function (header) {
          $translate('alert_content_reussi').then(function (content) {

            $ionicPopup.show({
              title: header,
              template: content,
              // buttons: ['Ok'],
              scope: $scope,
              buttons: [
                {
                  text: 'OK',
                  type: 'button-energized',
                  onTap: function (e) {
                    return true;
                  }
                }]
            })
              .then(function (result) {
                if (result) {
                  if (res.data == "Changement effectué avec success !") {
                    $scope.data = {};
                    var initialHref = window.location.href;

                    function restartApplication() {
                      // Show splash screen (useful if your app takes time to load)
                      navigator.splashscreen.show();
                      // Reload original app url (ie your index.html file)
                      window.location = initialHref;
                    }
                    $state.transitionTo('app.accueil', {}, {
                      reload: true,
                      inherit: true,
                      notify: true
                    });
                  }

                } else {
                  $scope.initvar();
                }
              });

          });
        });


      });
    };
  })
  .controller('LogoutCtrl', function () {

    sessionStorage.clear();
    localStorage.setItem('loggedin_name', 'null')
    localStorage.setItem('loggedin_password', 'null')
    // localStorage.clear();
    /*localStorage.removeItem(loggedin_name);
    localStorage.removeItem(loggedin_id);
    localStorage.removeItem(loggedin_password);*/
    //  $state.go('app.accueil');

    // console.log(loggedin_name);

    //window.location.reload();


  })

  .controller('ImageCtrl', function ($scope, $http, $cordovaCamera, urlJava, $ionicLoading, $ionicPopup, $translate) {
    //if(empty(sessionStorage.getItem('loggedin_name') ))
    // console.log(sessionStorage.getItem('loggedin_name'));

    $scope.images = [];

    $scope.addImage = function () {

      var options = {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: false,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 500,
        targetHeight: 500,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false,
        correctOrientation: true
      };

      // 3
      $cordovaCamera.getPicture(options).then(function (imageData) {
        var url = urlJava.getUrl();
        // 4
        //onImageSuccess(imageData);
        $scope.images.push("data:image/jpeg;base64," + imageData);
        console.log(imageData)
        $ionicLoading.show({
          template: 'J\'envoie la photo...'
        });
        $http.post(url + "/mediatheque/uploadImage", {
          "imageData": "" + imageData,
          "idutilisateur": sessionStorage.getItem('loggedin_iduser')
        }).then(function (res) {
          $ionicLoading.hide();
          console.log(res)
          $translate('alert_header_reussi').then(function (header) {
            $translate('alert_content_reussi').then(function (content) {
              $ionicPopup.show({
                title: header,
                template: content,
                scope: $scope,
                buttons: [
                  {
                    text: 'Ok',
                    type: 'button-positive'
                  }
                ]
              });
            });
          });
        })

      }, function (err) {
        console.log(err);
      });
    }

  })

  .controller('ProfileCtrl', function ($scope, $http, $ionicPopup, $state, $translate, urlPhp) {
    $scope.data = {};
    $scope.myusername = localStorage.getItem("username");
    //console.log($scope.myusername);
    $scope.submit = function () {
      // var link = 'http://vps101245.ovh.net:84/webservice/compte.php';
      var url = urlPhp.getUrl();
      $http.get(url + '/password.php?username=' + localStorage.getItem("username")).then(function (res) {
        $scope.response = res.data;
        //console.log($scope.response);

        $translate('alert_header_reussi').then(function (header) {
          $translate('alert_content_reussi').then(function (content) {
            $ionicPopup.show({
              title: header,
              template: content,
              scope: $scope,
              buttons: [
                {
                  text: 'Ok',
                  type: 'button-positive'
                }
              ]
            });
          });
        });

        if (res.data == "Changement  success !") {
          $state.go('app.login1');
        }
      });
    };
  })

  .controller('SondagesCtrl', function ($scope, $http, $state, $ionicLoading, urlPhp) {
    $ionicLoading.show({ content: 'Loading', animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0, duration: 10000 });
    var url = urlPhp.getUrl();
    $http.get(url + "/sondages.php")
      .success(function (response) {
        $ionicLoading.hide();
        $scope.sondages = response;
        console.log(response);
      }).catch(function (error) {
        $ionicLoading.hide();
        alert(error);
      });

  })

  .controller('SearchCtrl', function ($scope, $http, urlPhp) {
    var url = urlPhp.getUrl();
    $http.get(url + "/fiches.php")
      .success(function (response) {
        $scope.fichevisite = response;
      });
  })

  .controller('FichesCtrl', function ($scope, $http, urlPhp) {
    var url = urlPhp.getUrl();
    $http.get(url + "/fiches.php")
      .success(function (response) {
        $scope.fichevisite = response;
      });
  })

  .controller('ReponsesCtrl', function ($scope, $http, $ionicPopup, $translate, urlPhp) {

    $scope.data = {};

    $scope.submit = function () {
      var url = urlPhp.getUrl();
      var link = url + '/reponses.php';
      $http.post(link, {
        reponse: $scope.data.reponse,
        idquestionSondage: $scope.data.idquestionSondage,



      }).then(function (res) {
        $scope.response = res.data;

        $translate('alert_header_reussi').then(function (header) {
          $translate('alert_content_reussi').then(function (content) {
            $ionicPopup.show({
              title: header,
              template: content,
              scope: $scope,
              buttons: [
                {
                  text: 'Ok',
                  type: 'button-positive'
                }
              ]
            });
          });
        });


        //  $scope.data = {};
        //    $state.go('app.sondages');

      });
    };

  })

  .controller('QuestionsCtrl', function ($scope, $http, $stateParams, $ionicPopup, $translate, urlPhp) {

    $scope.data = {};

    $scope.submitReponse = function () {
      var url = urlPhp.getUrl();
      var link = url + '/reponses.php';
      $http.post(link, {
        reponse: $scope.data.reponse,

      }).then(function (res) {
        $scope.response = res.data;

        $translate('alert_header_reussi').then(function (header) {
          $translate('alert_content_reussi').then(function (content) {
            $ionicPopup.show({
              title: header,
              template: content,
              scope: $scope,
              buttons: [
                {
                  text: 'Ok',
                  type: 'button-positive'
                }
              ]
            });
          });
        });
        $scope.data = {};
      });
    };


    var sondage = $stateParams.idsondages;
    var url = urlPhp.getUrl();
    $http.get(url + "/questions.php?idsondage=" + sondage)
      .success(function (response) {
        $scope.questions = response;
      });
  })

  .controller('CompteCtrl', function ($state) {
    /*
    var login = sessionStorage.loggedin_name;
    //alert(login);
    if(typeof sessionStorage!='undefined') {
                   //if login failed
              $ionicPopup.alert({
                title: 'Connexion requise !',
                template: 'SVP, Connectez vous d\'abord !'
              });


               $state.go('app.login1');

    }

    */
    $state.go('app.compte');



  })

  .factory('Markers', function ($http, urlPhp) {

    var markers = [];

    return {
      getMarkers: function () {
        var url = urlPhp.getUrl();
        return $http.get(url + "/fiches.php?idutilisateurs=" + sessionStorage.getItem('loggedin_iduser')).then(function (response) {
          markers = response;
          return markers;
        });

      }
    }

  })
  .factory('GoogleMaps', function ($cordovaGeolocation, Markers) {

    var apiKey = false;
    var map = null;

    function initMap() {

      var options = {
        timeout: 10000,
        enableHighAccuracy: true
      };

      $cordovaGeolocation.getCurrentPosition(options).then(function (position) {

        var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        //var latLng = new google.maps.LatLng(39.305, -76.617);

        var mapOptions = {
          center: latLng,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        /* map = new google.maps.Map(document.getElementById("map21"), mapOptions);

      //Wait until the map is loaded
      google.maps.event.addListenerOnce(map, 'idle', function(){

        //Load the markers
        loadMarkers();

      });
  */
      }, function (error) {
        // console.log("Could not get location");

        //Load the markers
        loadMarkers();
      });

    }

    function loadMarkers() {

      //Get all of the markers from our Markers factory
      Markers.getMarkers().then(function (markers) {

        console.log("Markers: ", markers);

        var records = markers.data;
        var infowindow = new google.maps.InfoWindow();
        var marker, i;
        for (i = 0; i < records.length; i++) {

          var record = records[i];
          var markerPos = new google.maps.LatLng(record.latitude, record.longitude);

          // Add the markerto the map
          marker = new google.maps.Marker({
            map: map,
            position: markerPos
          });
          google.maps.event.addListener(marker, 'click', function () {
            infowindow.open(map, marker);
          });

        }

      });

    }

    function addInfoWindow(marker, message, record, i) {
      var infoWindow = new google.maps.InfoWindow({
        content: message
      });

      google.maps.event.addListener(marker, 'click', (function (marker, i) {
        return function () {
          //    infoWindow.setContent(message);
          infoWindow.open(map, marker);
        }
      })(marker, i));

    }

    return {
      init: function () {
        initMap();
      }
    }

  })

  .controller('QrcodeCtrl', function ($scope, $http, $cordovaBarcodeScanner, $ionicPopup, $translate, urlPhp) {

    $scope.scanBarcode = function () {
      $cordovaBarcodeScanner.scan().then(function (imageData) {

        $translate('alert_header_reussi').then(function (header) {
          $translate('alert_content_reussi').then(function (content) {
            $ionicPopup.show({
              title: header,
              template: content,
              scope: $scope,
              buttons: [
                {
                  text: 'Ok',
                  type: 'button-positive'
                }
              ]
            });
          });
        });
        var url = urlPhp.getUrl();
        $http.get(url + "/qrcode.php?codePointVente=" + imageData.text)
          .success(function (response) {

            alert("Le code QR <b>" + imageData.text + "</b> est enregistré avec succès !");

          });
        console.log("Barcode Format -> " + imageData.format);
        console.log("Cancelled -> " + imageData.cancelled);
      }, function (error) {

        alert('Erreur Code QR ! <br>Réessayer');

        console.log("An error happened -> " + error);
      });
    };

  })

  .controller('MapCtrl', function ($scope, $cordovaGeolocation, $http, urlPhp, ChekConnect,
    $translate,
    ProfilUser,
    $ionicLoading,
    ChekConnect,
    $translate,
    ProfilUser,
    urlJava, ) {
    $scope.data.payschoisit = null
    $scope.pvtempon = [];
    $scope.index;
    $scope.size = 0;
    $scope.idregions;
    $scope.data.regionchoisit
    $scope.data.villechoisit
    $scope.data.cache = true;
    $scope.getOptPays = function (option) {
      // console.log(option)
      return option;
    };


    $scope.cacheselect = function () {
      if ($scope.data.cache) {
        $scope.data.cache = false;
      } else {
        $scope.data.cache = true;
      }

    }
    $scope.getOptRegion = function (option) {
      //   console.log($scope.data.regionchoisit)
      return option;
    };
    $scope.getOptVille = function (option) {

      return option;
    };
    $scope.testProfile = function () {
      $scope.data.profile = ProfilUser.profilUser();
    }
    $scope.checkConnect = function () {
      $scope.connect = ChekConnect.getConnectivite();
      $scope.testProfile();
    }
    $scope.checkConnect();
    $scope.initMap = function () {
      var options = {
        timeout: 10000,
        enableHighAccuracy: true
      };
      $cordovaGeolocation.getCurrentPosition(options).then(function (position) {

        var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        var mapOptions = {
          center: latLng,
          zoom: 12,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        $scope.map = new google.maps.Map(document.getElementById("map2"), mapOptions);


        //Wait until the map is loaded
        google.maps.event.addListenerOnce($scope.map, 'idle', function () {

          var marker = new google.maps.Marker({
            map: $scope.map,
            animation: google.maps.Animation.DROP,
            position: latLng,
            icon: 'img/marker.png'
          });
        });
      });
    }
    $scope.listpays = function () {
      // $scope.data.profil = ProfilUser.profilUser();
      $scope.initMap();
      var pays;
      var listdespays;
      var payschoisit;
      if (window.Connection) {
        if (navigator.connection.type == Connection.NONE) {
          connect = false;

        }
        else {

          connect = true;
          var url = urlPhp.getUrl();
          $http.get(url + "/pays.php")
            .success(function (response) {
              // $ionicLoading.hide();
              console.log(response)
              pays = response;

              $scope.data.listpays = [];
              for (var i = 0; i < response.length; i++) {
                var pv = { name: response[i].pays, id: response[i].idpays, code: response[i].code }
                $scope.data.listpays.push(pv);
              }
              if ($scope.data.listpays.length > 0) {
                $scope.data.payschoisit = $scope.data.listpays[0];
                $scope.listDesregionsByPaysID();
              }

            }).catch(function (error) {
              // $ionicLoading.hide();
              console.log(error)
            });
          /* if ($scope.data.profile == 'super') {
             var url = urlPhp.getUrl();
             $http.get(url + "/pays.php")
               .success(function (response) {
                 // $ionicLoading.hide();
                 console.log(response)
                 pays = response;
 
                 $scope.data.listpays = [];
                 for (var i = 0; i < response.length; i++) {
                   var pv = { name: response[i].pays, id: response[i].idpays, code: response[i].code }
                   $scope.data.listpays.push(pv);
                 }
                 console.log($scope.data.listpays)
                 localStorage.setItem('paysOnline', angular.toJson($scope.data.listpays));
               }).catch(function (error) {
                 // $ionicLoading.hide();
                 console.log(error)
               });
             //
           } else {
             //Recuperer la liste des pays
             var url = urlPhp.getUrl();
             $http.get(url + "/paysByUser.php?idutilisateurs=" + sessionStorage.getItem('loggedin_iduser'))
               .success(function (response) {
                 //  $ionicLoading.hide();
                 pays = response;
                 //  localStorage.setItem('paysOnline', angular.toJson(pays));
                 $scope.data.listpays = [];
                 console.log(response)
                 for (var i = 0; i < response.length; i++) {
                   var pv = { name: response[i].pays, id: response[i].idpays, code: response[i].code }
                   $scope.data.listpays.push(pv);
                 }
                 if ($scope.data.listpays.length != 0) {
                   //  payschoisit = $scope.data.listpays[0];
                   $scope.data.payschoisit = $scope.data.listpays[0];
                   //  $scope.listpointdevnte();
                   $scope.listDesregionsByPaysID();
                 }
 
                 console.log($scope.data.payschoisit)
                 // $scope.listDesregionsByPaysID();
               }).catch(function (error) {
                 // $ionicLoading.hide();
               });
             //Recuperer la liste des villes
           }*/

        }
      }

    }
    $scope.listDesregionsByPaysID = function () {

      if ($scope.connect == true) {
        //Recuperer la liste des regions
        var url = urlPhp.getUrl();
        $http.get(url + "/regionsByPays.php?idpays=" + $scope.data.payschoisit.id)
          .success(function (response) {
            $ionicLoading.hide();
            $scope.region = response;
            //  localStorage.setItem('regionsOnline', angular.toJson($scope.region));
            $scope.listregions = [];
            for (var i = 0; i < response.length; i++) {
              var pv = { name: response[i].region, id: response[i].idregion }
              $scope.listregions.push(pv);
            }

          }).catch(function (error) {
            $ionicLoading.hide();

          });
      }
    }
    $scope.listVillesByRegionID = function () {
      if ($scope.connect == true) {
        //Recuperer la liste des villes
        $scope.refreshville();
        var url = urlPhp.getUrl();
        $http.get(url + "/villeByRegion.php?idregion=" + $scope.data.regionchoisit.id)
          .success(function (response) {
            $ionicLoading.hide();
            $scope.ville = response;
            // localStorage.setItem('villesOnline', angular.toJson($scope.ville));
            $scope.listvilles = [];
            for (var i = 0; i < response.length; i++) {
              var pv = { name: response[i].ville, id: response[i].idville }
              $scope.listvilles.push(pv);
            }
            //    console.log($scope.listvilles)
          }).catch(function (error) {
            $ionicLoading.hide();
          });
      } else {
        /*    $scope.ville = []
            $scope.ville = angular.fromJson(localStorage.getItem('villesOnline'))
            // console.log($scope.pointvente)
            $scope.listvilles = [];
            if ($scope.ville != null) {
              for (var i = 0; i < $scope.ville.length; i++) {
                if ($scope.ville[i].idregion == $scope.data.regionchoisit.id) {
                  var pv = { name: $scope.ville[i].ville, id: $scope.ville[i].idville }
                  $scope.listvilles.push(pv);
                }
    
              }
            }*/
      }

    }
    $scope.refreshville = function () {
      $scope.initMap();
      $scope.listvilles = null
      $scope.data.villechoisit = null
    }

    $scope.listpays();
    $scope.listpointdevnte = function () {
      $scope.pvtempon = [];
      $scope.data.pvchoisit = null;
      console.log($scope.data.payschoisit.code);
      var url = urlJava.getUrl();
      var link = url + "/yup/mespointVente"
      iduser = sessionStorage.getItem('loggedin_iduser')
      var user = {
        user: {
          "nom": "",
          "prenom": "",
          "telephone": "",
          "langue": "",
          "pays": "",
          "profil": "",
          "reseauxagent": "",
          "login": "",
          "password": "",
          "id": "" + iduser,
          "codePays": $scope.data.payschoisit.code
        }
      }
      //   console.log(user)
      $ionicLoading.show({ content: 'Loading', animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0, duration: 10000 });
      $http.post(link, user).then(function (res) {
        var options = {
          timeout: 10000,
          enableHighAccuracy: true
        };
        $ionicLoading.hide();
        $scope.pointvente = angular.fromJson(res.data).sort();
        if ($scope.pointvente && $scope.pointvente.length > 0) {
          console.log("depart ")
          console.log($scope.pointvente)

          $scope.pvv = [];
          $scope.pvvv = [];
          $cordovaGeolocation.getCurrentPosition(options).then(function (position) {

            var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            var mapOptions = {
              center: latLng,
              zoom: 12,
              mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            $scope.map = new google.maps.Map(document.getElementById("map2"), mapOptions);


            //Wait until the map is loaded
            google.maps.event.addListenerOnce($scope.map, 'idle', function () {

              var marker = new google.maps.Marker({
                map: $scope.map,
                animation: google.maps.Animation.DROP,
                position: latLng,
                icon: 'img/marker.png'
              });
              $ionicLoading.show({ content: 'Loading', animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0, duration: 10000 });
              while ($scope.pvtempon.length < $scope.pointvente.length - 1) {

                if ($scope.size == 0) {
                  $scope.index = 0;
                  $scope.size = 10;
                } else {
                  $scope.index = $scope.size;
                  $scope.size = $scope.size + 10;
                }

                $scope.pvv = $scope.pointvente.slice($scope.index, $scope.size);
                $scope.pvtempon = $scope.pvtempon.concat($scope.pvv)
                $scope.pvv.forEach(function (pv) {
                  if (pv.latitude !== 0 && pv.longitude !== 0 && pv.latitude !== '' && pv.longitude !== '' && pv.latitude !== null && pv.longitude !== null) {
                    var marker = new google.maps.Marker({
                      map: $scope.map,
                      animation: google.maps.Animation.DROP,
                      position: new google.maps.LatLng(pv.latitude, pv.longitude),
                      icon: 'img/map-marker.png'
                    });

                    var infoWindow = new google.maps.InfoWindow({
                      content: "Point: " + pv.client + "<br/>Code: " + pv.codePointVente + "<br/>Telephone: " + pv.telephone + "<br/>Longitude: " + pv.longitude + "<br/>Latitude: " + pv.latitude
                    });

                    google.maps.event.addListener(marker, 'click', function () {
                      infoWindow.open($scope.map, marker);
                    })

                  }

                });
              }
              $ionicLoading.hide();


            });
          });
        }

        /*   $scope.pvv =$scope.pointvente.slice(0, 9)
           $scope.pvvv =$scope.pointvente.slice(10, 19)
         
           console.log("premiere ")
           console.log($scope.pvv)
           console.log("Deuxieme ")
           console.log($scope.pvvv)
           
           $scope.con = $scope.pvv.concat($scope.pvvv)
           console.log("Concat ")
           console.log($scope.con )*/
        /* for(var i = 0; i< 10; i++){
           $scope.pvv.push($scope.pointvente[i]);
         }*/


      });

    }

    $scope.listPvPhp = function () {
      var url = urlPhp.getUrl();
      $ionicLoading.show({ content: 'Loading', animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0, duration: 10000 });
      $http.get(url + '/pointventesutilisateurmap.php?idville=' + $scope.data.villechoisit.id + "&idutilisateur=" + localStorage.getItem('loggedin_id')).then(function (res) {
        var options = {
          timeout: 10000,
          enableHighAccuracy: true
        };

        $scope.pointventes = angular.fromJson(res.data).sort();

        $cordovaGeolocation.getCurrentPosition(options).then(function (position) {

          var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

          var mapOptions = {
            center: latLng,
            zoom: 12,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };

          $scope.map = new google.maps.Map(document.getElementById("map2"), mapOptions);


          //Wait until the map is loaded
          google.maps.event.addListenerOnce($scope.map, 'idle', function () {

            var marker = new google.maps.Marker({
              map: $scope.map,
              animation: google.maps.Animation.DROP,
              position: latLng,
              icon: 'img/marker.png'
            });
            console.log($scope.pointventes)
            $scope.pointventes.forEach(function (pv) {
              var marker = new google.maps.Marker({
                map: $scope.map,
                animation: google.maps.Animation.DROP,
                position: new google.maps.LatLng(pv.latitude, pv.longitude),
                icon: 'img/map-marker.png'
              });

              var infoWindow = new google.maps.InfoWindow({
                content: "Point: " + pv.gerant + "<br/>Telephone: " + pv.telephonegerant + "<br/>Longitude: " + pv.longitude + "<br/>Latitude: " + pv.latitude
              });

              google.maps.event.addListener(marker, 'click', function () {
                infoWindow.open($scope.map, marker);
              })
              $ionicLoading.hide();
            });


          });
        });
      });
    }
  })
  .controller('MesprospectsCtrl', function ($scope,
    $http, $ionicLoading, ChekConnect,
    $ionicPopup, $translate, urlPhp) {
      $scope.data = {};
    $scope.data.regionchoisit = null;
    $scope.data.villechoisit = null;
    $scope.data.payschoisit = null;
    $scope.connect = null;
    $scope.data = {};
    //Tester la connectiviteee
    $scope.checkConnect = function () {
      $scope.connect = ChekConnect.getConnectivite();
    }
    //Tester la connectiviteee
    $scope.getOptPays = function (option) {

      return option;
    };
    $scope.getOptVille = function (option) {

      return option;
    };
    $scope.getOptRegion = function (option) {

      return option;
    };
    $scope.checkConnect();
    if ($scope.connect == true) {
      $scope.data.connect = true;
     
    } else {
      $scope.data.connect = false;
      $translate('alert_header_ofline').then(function (header) {
        $translate('alert_content_ofline_list').then(function (content) {
          $translate('alert_button_non').then(function (non) {
            $translate('alert_button_oui').then(function (oui) {
              $ionicPopup.show({
                title: header,
                content: content,
                buttons: [
                  {
                    text: non,
                    type: 'button-assertive',
                    onTap: function (e) {
                      return false;
                    }
                  },
                  {
                    text: oui,
                    type: 'button-energized',
                    onTap: function (e) {
                      return true;
                    }
                  }]
              })
                .then(function (result) {
                  if (!result) {
                    ionic.Platform.exitApp();
                  } else {
                    $ionicLoading.show({ content: 'Loading', animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0, duration: 10000 });
                    var flocal = angular.fromJson(localStorage.getItem('prospectsSauvegarde'));
                    console.log(flocal)
                    $scope.mesprospectsocal = flocal;
                    $ionicLoading.hide();
                  }
                });
            });
          });
        });
      });

    }
    $scope.initReg = function () {
      if ($scope.connect == true) {

        $ionicLoading.show({
          content: 'Loading',
          animation: 'fade-in',
          showBackdrop: true,
          maxWidth: 200,
          showDelay: 0,
          duration: 10000
        });
        console.log('Je suis ici')
        var url = urlPhp.getUrl();
        $http.get(url + "/pays.php")
          .success(function (response) {
            $ionicLoading.hide();
            //$scope.pays = response;
            console.log(response)

            // localStorage.setItem('paysOnline', angular.toJson($scope.pays));
            $scope.listdespays = [];
            for (var i = 0; i < response.length; i++) {
              var pv = { name: response[i].pays, id: response[i].idpays }
              $scope.listdespays.push(pv);
            }
            if ($scope.listdespays.length != 0) {
              $scope.data.payschoisit = $scope.listdespays[0];
              $scope.listDesregionsByPaysID();
            }
          }).catch(function (error) {
            $ionicLoading.hide();
          });

      } else {
        //console.log('eerror connexion')
        $scope.pays = []
        $scope.pays = angular.fromJson(localStorage.getItem('paysOnline'))
        // console.log($scope.pointvente)
        $scope.listdespays = [];
        if ($scope.pays != null) {
          for (var i = 0; i < $scope.pays.length; i++) {
            var pv = { name: $scope.pays[i].pays, id: $scope.pays[i].idpays }
            $scope.listdespays.push(pv);
          }
        }
        if ($scope.data.profile == 'limite') {
          $scope.data.payschoisit = $scope.listdespays[0]
        }
        $scope.listDesregionsByPaysID();
      }
    }

    $scope.listDesregionsByPaysID = function () {

      if ($scope.connect == true) {
        //Recuperer la liste des regions
        console.log($scope.data.payschoisit.id)
        var url = urlPhp.getUrl();
        $http.get(url + "/regionsByPays.php?idpays=" + $scope.data.payschoisit.id)
          .success(function (response) {
            $ionicLoading.hide();
            $scope.region = response;
            //  localStorage.setItem('regionsOnline', angular.toJson($scope.region));
            $scope.listregions = [];
            for (var i = 0; i < response.length; i++) {
              var pv = { name: response[i].region, id: response[i].idregion }
              $scope.listregions.push(pv);
            }

          }).catch(function (error) {
            $ionicLoading.hide();

          });
      } else {
        $scope.region = []
        $scope.region = angular.fromJson(localStorage.getItem('regionsOnline'))
        // console.log($scope.pointvente)
        $scope.listregions = [];
        if ($scope.data.profile == 'super') {
          //   $scope.listregions =  $scope.region;
          for (var i = 0; i < $scope.region.length; i++) {

            var pv = { name: $scope.region[i].region, id: $scope.region[i].idregion }
            $scope.listregions.push(pv);


          }
        } else {

          if ($scope.region != null) {
            for (var i = 0; i < $scope.region.length; i++) {
              if ($scope.region[i].idpays == $scope.data.payschoisit.id) {
                var pv = { name: $scope.region[i].region, id: $scope.region[i].idregion }
                $scope.listregions.push(pv);
              }

            }
          }
        }
      }

    }
    $scope.listVillesByRegionID = function () {
      if ($scope.connect == true) {
        //Recuperer la liste des villes
        var url = urlPhp.getUrl();
        $http.get(url + "/villeByRegion.php?idregion=" + $scope.data.regionchoisit.id)
          .success(function (response) {
            $ionicLoading.hide();
            $scope.ville = response;
            // localStorage.setItem('villesOnline', angular.toJson($scope.ville));
            $scope.listvilles = [];
            for (var i = 0; i < response.length; i++) {
              var pv = { name: response[i].ville, id: response[i].idville }
              $scope.listvilles.push(pv);
            }
            
          }).catch(function (error) {
            $ionicLoading.hide();
          });
      } else {
        $scope.ville = []
        $scope.ville = angular.fromJson(localStorage.getItem('villesOnline'))
        // console.log($scope.pointvente)
        $scope.listvilles = [];
        if ($scope.ville != null) {
          for (var i = 0; i < $scope.ville.length; i++) {
            if ($scope.ville[i].idregion == $scope.data.regionchoisit.id) {
              var pv = { name: $scope.ville[i].ville, id: $scope.ville[i].idville }
              $scope.listvilles.push(pv);
            }

          }
        }
      }

    }
    $scope.initReg();
  $scope.lispvPhp = function(){
    $ionicLoading.show({ content: 'Loading', animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0, duration: 3000 });
    var url = urlPhp.getUrl();
    $http.get(url + "/pointventesutilisateur.php?idville="+ $scope.data.villechoisit.id+"&idutilisateur=" + localStorage.getItem('loggedin_iduser'))
      .success(function (response) {
        $ionicLoading.hide();
        console.log(response)
        $scope.pvs = response;
     /*   var inverse = []
        var taille = response.length - 1
        for (var i = taille; i >= 0; i--) {
          inverse.push(response[i])
          console.log(response[i].Date)
        }
        console.log(inverse)
        $scope.synchronDataLocalProspect()
        $scope.mesprospects = inverse;
        console.log($scope.mesprospects);*/
      }).catch(function (error) {
        $ionicLoading.hide();
        alert(error);
      });
  }

  })
  .factory('ChekConnect', function () {
    var connect;

    return {
      getConnectivite: function () {
        if (window.Connection) {
          if (navigator.connection.type == Connection.NONE) {
            connect = false;
          }
          else {
            connect = true;
          }
        }
        return connect;
      }
    }
  })
  .factory('urlPhp', function () {
    var connect;

    return {
      getUrl: function () {
        return "http://htsoftdemo.com/apiccbm";
        //  return "http://mob-test.yosard.com/webservice";
        // return "http://mob.yosard.com:89/webservice";
      }
    }
  })
  .factory('urlJava', function () {
    var connect;

    return {
      getUrl: function () {
        return "http://v-beta.yosard.com:8080/yup/rest";
        // return "http://www.yosard.com:8080/yup/rest";
      }
    }
  })
  .factory('ProfilUser', function () {
    var profil = 'limite';
    //$scope.data.profile = sessionStorage.getItem("")
    return {
      profilUser: function () {

        if (sessionStorage.getItem('loggedin_profil') == 'Codir YUP Mgt' || sessionStorage.getItem('loggedin_profil') == 'Direction Commerciale YUP Mgt'
          || sessionStorage.getItem('loggedin_profil') == 'Marketing YUP Mgt' || sessionStorage.getItem('loggedin_profil') == 'Call Center YUP Mgt'
          || sessionStorage.getItem('loggedin_profil') == 'Administrateur Maintenance') {
          // $scope.data.profile = 'super';
          profil = 'super';
        }
        return profil;
      }
    }
  })
  .controller('AddcompteCtrl', function ($scope,
    $http,
    $ionicLoading,
    $ionicPopup,
    $cordovaGeolocation,
    ChekConnect,
    $translate,
    $cordovaCamera,
    $ionicModal,
    ProfilUser,
    urlPhp,
    urlJava,
    $ionicHistory,
    $translate,
    $state) {
    $scope.user = {}
    console.log('creation de compte');
    $scope.initvar = function () {
      $scope.user.nom = '';
      $scope.user.prenom = '';
      $scope.user.telephone = '';
      $scope.user.adresse = '';
      $scope.user.email = '';
      $scope.user.password = '';
      $scope.user.passwordconfirm = '';
    }
    $scope.initvar();
    $scope.login = function () {

      if ($scope.user.nom !== '' &&
        $scope.user.prenom !== '' &&
        $scope.user.telephone !== '' &&
        $scope.user.adresse !== '' &&
        $scope.user.email !== '' &&
        $scope.user.password !== '' &&
        $scope.user.passwordconfirm !== ''
      ) {
        if ($scope.user.password == $scope.user.passwordconfirm) {
          console.log($scope.user);
          $scope.user.profil = 'Administrateur';
          $scope.user.dateajout = new Date()

          var url = urlPhp.getUrl();
          var link = url + '/utilisateur.php';
          $ionicLoading.show({ content: 'Loading', animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0, duration: 10000 });
          console.log($scope.user)
          $http.post(link, $scope.user)
            .then(function (res) {
              console.log(res)
              if (res.data !== "error") {
                //     $scope.showDialog('Infos', 'reussi')
                sessionStorage.setItem('loggedin_name', $scope.user.email);
                sessionStorage.setItem('loggedin_password', $scope.user.password);
                sessionStorage.setItem('loggedin_iduser', res.data);
                sessionStorage.setItem('loggedin_profil', 'Agent recenseur');


                localStorage.setItem('loggedin_name', $scope.user.email);
                localStorage.setItem('loggedin_password', $scope.user.password);
                localStorage.setItem('loggedin_iduser', res.data);
                localStorage.setItem('loggedin_profil', 'Agent recenseur');
                localStorage.setItem('isconn', true)
                $ionicHistory.nextViewOptions({
                  disableAnimate: true,
                  disableBack: true
                });
                $translate('alert_connexion_reussi_header').then(function (header) {
                  $translate('alert_connexion_reussi_content').then(function (content) {
                    var alertPopup = $ionicPopup.alert({
                      title: header,
                      template: content + $scope.user.email + ' !'
                    });
                  });
                });

                $state.transitionTo('app.bienvenue', {}, {
                  reload: true,
                  inherit: true,
                  notify: true
                });
              } else {
                $scope.showDialog('erreur', 'echec')
              }

              $ionicLoading.hide();

            }).catch(function (error) {
              console.log(error)
              $ionicLoading.hide();
              alert(error);
            });
        } else {
          $scope.showDialog('erreur', 'Les mots de passe ne sont pas conformes')
        }
      } else {
        $scope.showDialog('erreur', 'Remplire tout le formulaire')
      }
    }
    $scope.showDialog = function (header, content) {
      $ionicPopup.show({
        title: header,
        template: content,
        scope: $scope,
        buttons: [{
          text: 'Ok',
          type: 'button-positive'
        }]
      });
    }
  })
  .factory('ListpaysByProfil', function ($http, urlPhp) {
    var connect;
    var listdespays;
    var payschoisit;
    var pays;
    return {
      listpaysByProfil: function (profil) {
        console.log(profil)
        if (window.Connection) {
          if (navigator.connection.type == Connection.NONE) {
            connect = false;
          }
          else {
            connect = true;
            if (profil == 'super') {
              var url = urlPhp.getUrl();
              $http.get(url + "/pays.php")
                .success(function (response) {
                  // $ionicLoading.hide();
                  pays = response;
                  localStorage.setItem('paysOnline', angular.toJson(pays));
                  listdespays = [];
                  for (var i = 0; i < response.length; i++) {
                    var pv = { name: response[i].pays, id: response[i].idpays }
                    listdespays.push(pv);
                  }
                }).catch(function (error) {
                  // $ionicLoading.hide();
                  console.log(error)
                });
              //
            } else {
              //Recuperer la liste des pays
              var url = urlPhp.getUrl();
              $http.get(url + "/paysByUser.php?idutilisateurs=" + sessionStorage.getItem('loggedin_iduser'))
                .success(function (response) {
                  //  $ionicLoading.hide();
                  pays = response;
                  localStorage.setItem('paysOnline', angular.toJson(pays));
                  listdespays = [];
                  for (var i = 0; i < response.length; i++) {
                    var pv = { name: response[i].pays, id: response[i].idpays }
                    listdespays.push(pv);
                  }
                  if (listdespays.length != 0) {
                    payschoisit = listdespays[0];
                  }
                  listdespays = [];
                  listdespays.push(payschoisit);
                  // $scope.listDesregionsByPaysID();
                }).catch(function (error) {
                  // $ionicLoading.hide();
                });
              //Recuperer la liste des villes
            }
          }
        }
        return listdespays;
      }
    }
  });