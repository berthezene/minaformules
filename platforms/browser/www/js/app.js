

MathJax.Hub.Config({
  skipStartupTypeset: true,
  messageStyle: "none",
  "HTML-CSS": {
    showMathMenu: false,
    linebreaks: { automatic: true }
  }
});
MathJax.Hub.Configured();

angular.module('starter', ['ionic', 'minaformules', 'ngCordova'])

.run(function($ionicPlatform, $sce) {

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }


  });

})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'IndexCtrl'
  })

  .state('app.matiere', {
    url: "/matiere/:matiere",
    views: {
      'menuContent': {
        templateUrl: "templates/matiere.html",
        controller: 'MatiereCtrl'
      }
    }
  })

  .state('app.categorie', {
    url: "/categorie/:categorie",
    views: {
      'menuContent': {
        templateUrl: "templates/categorie.html",
        controller: 'CategorieCtrl'
      }
    }
  })

  .state('app.Quizz', {
    url: "/Quizz",
    views: {
      'menuContent': {
        templateUrl: "templates/Quizz.html",
        controller: 'QuizzCtrl'
      }
    }
  })

  .state('app.QuizzMatiere', {
    url: "/quizz/:matiere",
    views: {
      'menuContent': {
        templateUrl: "templates/quizz-matiere.html",
        controller: 'QuizzMatiereCtrl'
      }
    }
  })

  .state('app.QuizzQuestions', {
   cache: false,
    url: "/quizz/question/:name",
    views: {
      'menuContent': {
        templateUrl: "templates/quizz-question.html",
        controller: 'QuizzQuestionCtrl'
      }
    }
  })

  .state('app.QuizzResultats', {
   cache: false,
    url: "/quizz/resultat/:name",
    views: {
      'menuContent': {
        templateUrl: "templates/quizz-resultat.html",
        controller: 'QuizzResultatCtrl'
      }
    }
  })

  .state('app.Favoris', {
   cache: false,
    url: "/Favoris",
    views: {
      'menuContent': {
        templateUrl: "templates/Favoris.html",
        controller: "FavCtrl"
      }
    }
  })

  .state('app.Formulaire', {
    url: "/Formulaire",
    views: {
      'menuContent': {
        templateUrl: "templates/Formulaire.html",
      }
    }
  })

  .state('app.Actu', {
    url: "/Actu",
    views: {
      'menuContent': {
        templateUrl: "templates/Actu.html",
        controller: "ActuCtrl"
      }
    }
  })

  .state('app.Apropos', {
    url: "/Apropos",
    views: {
      'menuContent': {
        templateUrl: "templates/Apropos.html",
        controller: "AProposCtrl"
      }
    }
  })

  .state('app.Integrer', {
    url: "/Integrer",
    views: {
      'menuContent': {
        templateUrl: "templates/Integrer.html",
        controller: "IntegrerCtrl"
      }
    }
  })

  .state('app.Formule', {
    url: '/formule/:idFormule',
    views: {
      'menuContent': {
        templateUrl: 'templates/formule.html',
        controller: 'FormuleCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/Formulaire');
})

.directive("mathjaxBind", function() {
  return {
    restrict: "A",
    scope:{
      text: "@mathjaxBind"
    },
    controller: ["$scope", "$element", "$attrs", function($scope, $element, $attrs) {
      $scope.$watch('text', function(value) {
        var $script = angular.element("<span>")
        .html(value == undefined ? "" : value);
        $element.html("");
        $element.append($script);
        MathJax.Hub.Queue(["Reprocess", MathJax.Hub, $element[0]]);
      });
    }]
  };
});
