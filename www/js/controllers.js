// L'emplacement de la base de donnees doit etre indiquee ici
var urlBDD = "url_bdd_ici";

var database;var currentMatiere;
var questions = [];
var resultats = [];
var n = 0;
var news;
var integrer;
var apropos;
var BDD_ready = false;

matiereGlob = {
  "MPSI": false,
  "PCSI": false,
  "PTSI": false,
  "PCSI": false,
  "MP": false,
  "PT": false,
  "PC": false,
  "PSI": false
};

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function aPrendre(formule){
  if(matiereGlob["MPSI"] == false && matiereGlob["MP"] == false && matiereGlob["PSI"] == false && matiereGlob["PT"] == false && matiereGlob["PCSI"] == false && matiereGlob["PTSI"] == false && matiereGlob["PC"] == false) {
    return true;
  }

  for(var i = 0; i < formule.classe.length; i++) {
    if(matiereGlob[formule.classe[i]]) {
      return true;
    }
  }

  return false;
}

angular.module('minaformules', [])

.controller('AProposCtrl', function($scope) {

  $scope.aProposTxt = apropos;

})

.controller('IndexCtrl', function($scope, $state, $http, $sce) {


  $http.get(urlBDD).
  success(function(data, status, headers, config) {
    database = TAFFY(data["db"]);
    integrer = $sce.trustAsHtml(data["integrer"]);
    apropos = $sce.trustAsHtml(data["apropos"]);
    BDD_ready = true;

  }).error(function(data, status, headers, config) {
    $http.get('db/db.json').success(function(data, status, headers, config) {
      database = TAFFY(data["db"]);
      integrer = $sce.trustAsHtml(data["integrer"]);
      apropos = $sce.trustAsHtml(data["apropos"]);
      BDD_ready = true;
    });

  });

    $http.get('http://www.mines-stetienne.fr/fr/feed/incoming-news').success(function(data, status, headers, config) {
      news = new Feed(data).items;
      news.forEach(function(e) { e.description = $sce.trustAsHtml(e.description); return e; });
  });

  $scope.matieres = [
    {name: "Chimie", shortname: "chimie"},
    {name: "Mathématiques", shortname: "maths"},
    {name: "Physique", shortname: "physique"},
    {name: "Sciences de l'ingénieur", shortname: "SI"}
  ];

  $scope.goto = function(matiere) {
    if(BDD_ready) {

    matiereGlob["MP"] = $scope.spes[0].isChecked;
    matiereGlob["PC"] = $scope.spes[1].isChecked;
    matiereGlob["PSI"] = $scope.spes[2].isChecked;
    matiereGlob["PT"] = $scope.spes[3].isChecked;
    matiereGlob["MPSI"] = $scope.sups[0].isChecked;
    matiereGlob["PCSI"] = $scope.sups[1].isChecked;
    matiereGlob["PTSI"] = $scope.sups[2].isChecked;

    currentMatiere =  {'matiere': matiere.name, 'shortname': matiere.shortname};

    $state.transitionTo('app.matiere', {'matiere': matiere.name, 'shortname': matiere.shortname});}
  };

  $scope.spes = [
    {name: "MP", shortname: "mp", isChecked: false},
    {name: "PC", shortname: "pc", isChecked: false},
    {name: "PSI", shortname: "psi", isChecked: false},
    {name: "PT", shortname: "pt", isChecked: false}
  ];

  $scope.sups = [
    {name: "MPSI", shortname: "mpsi", isChecked: false},
    {name: "PCSI", shortname: "pcsi", isChecked: false},
    {name: "PTSI", shortname: "ptsi", isChecked: false}
  ];
})

.controller('CategorieCtrl', function($scope, $stateParams, $http) {
  $scope.categorie = $stateParams.categorie;
  $scope.shortname = currentMatiere.shortname.toUpperCase()[0] || "M";

  var formules = database({matiere: currentMatiere.matiere, categorie: $scope.categorie}).get();

  $scope.formules = [];

  for(var i = 0; i < formules.length; i++) {
    if(aPrendre(formules[i])) {
      $scope.formules.push(formules[i]);
    }
  }
})

.controller('MatiereCtrl', function($scope, $stateParams, $http) {

  $scope.matiere = $stateParams.matiere;
  $scope.shortname = currentMatiere.shortname.toUpperCase()[0];

  var formules = database({matiere: $scope.matiere}).get();
  var categories = [];

  for(var i = 0; i < formules.length; i++) {
    if(aPrendre(formules[i]) && categories.indexOf(formules[i].categorie) == -1){
      categories.push(formules[i].categorie);
    }
  }

  categories = categories.map(function(e){ return {"name": e};});

  $scope.categories = categories;
})

.controller('FormuleCtrl', function($scope, $stateParams, $http, $cordovaToast, $cordovaEmailComposer) {

  var scope = $scope;

  scope.formule = database({id: parseInt($stateParams.idFormule)}).first();

  $scope.toggleFav = function() {

    var matiere = $scope.formule.matiere;

    var favoris = localStorage.getItem(matiere);
    if(!favoris) {
      localStorage.setItem(matiere, JSON.stringify([$scope.formule.id]));
    } else {
      favoris = JSON.parse(favoris);
      var index = favoris.indexOf($scope.formule.id);

      if(index == -1) {
        favoris.push($scope.formule.id);
        $cordovaToast.showShortBottom($scope.formule.name + ' a été ajoutée aux favoris');
      } else {
        favoris.splice(index, 1);
        $cordovaToast.showShortBottom($scope.formule.name + ' a été retirée des favoris');
      }
      localStorage.setItem(matiere,
        JSON.stringify(favoris)
      );
    }
  };

  $scope.reportError = function() {
    var email = {
      to: 'minaformules@emse.fr',
      subject: 'La formule '+ $scope.formule.id.toString() +' est erronée',
      body: 'La formule '+ $scope.formule.id.toString() +' est erronée',
      isHtml: false
    };
    $cordovaEmailComposer.open(email);
  }
})

.controller('ActuCtrl', function($scope, $http, $sce) {


  $scope.news = news;

  $scope.doRefresh = function() {
    $http.get('http://www.mines-stetienne.fr/fr/feed/incoming-news').success(function(data, status, headers, config) {
      news = new Feed(data).items;
      news.forEach(function(e) { e.description = $sce.trustAsHtml(e.description); return e; });
  })
    .finally(function() {
      // Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    });
  };


})

.controller('FavCtrl', function($scope, $http) {

  var scope = $scope;

  var maths = localStorage.getItem('Mathématiques');

  if(maths) {
    maths = JSON.parse(maths);
    scope.maths = maths.map(function (e) {
      return {'id': e,
      'name': database({id: e}).first().name};
    })
  }

  var phys = localStorage.getItem('Physique');

  if(phys) {
    phys = JSON.parse(phys);
    scope.phys = phys.map(function (e) {
      return {'id': e,
      'name': database({id: e}).first().name};
    })
  }

  var chimie = localStorage.getItem('Chimie');

  if(chimie) {
    chimie = JSON.parse(chimie);
    scope.chimie = chimie.map(function (e) {
      return {'id': e,
      'name': database({id: e}).first().name};
    })
  }

  var SI = localStorage.getItem("Sciences de l'ingénieur");

  if(SI) {
    SI = JSON.parse(SI);
    scope.SI = SI.map(function (e) {
      return {'id': e,
      'name': database({id: e}).first().name};
    })
  }
})

.controller('QuizzCtrl', function($scope, $state) {

  $scope.matieres = [
    {name: "Chimie", shortname: "chimie"},
    {name: "Mathématiques", shortname: "maths"},
    {name: "Physique", shortname: "physique"},
    {name: "Sciences de l'ingénieur", shortname: "SI"}
  ];

  $scope.goto = function(matiere) {
    matiereGlob["MP"] = $scope.spes[0].isChecked;
    matiereGlob["PC"] = $scope.spes[1].isChecked;
    matiereGlob["PSI"] = $scope.spes[2].isChecked;
    matiereGlob["PT"] = $scope.spes[3].isChecked;
    matiereGlob["MPSI"] = $scope.sups[0].isChecked;
    matiereGlob["PCSI"] = $scope.sups[1].isChecked;
    matiereGlob["PTSI"] = $scope.sups[2].isChecked;

    currentMatiere =  {'matiere': matiere.name, 'shortname': matiere.shortname};

    $state.transitionTo('app.QuizzMatiere', {'matiere': matiere.name, 'shortname': matiere.shortname});
  };

  $scope.spes = [
    {name: "MP", shortname: "mp", isChecked: false},
    {name: "PC", shortname: "pc", isChecked: false},
    {name: "PSI", shortname: "psi", isChecked: false},
    {name: "PT", shortname: "pt", isChecked: false}
  ];

  $scope.sups = [
    {name: "MPSI", shortname: "mpsi", isChecked: false},
    {name: "PCSI", shortname: "pcsi", isChecked: false},
    {name: "PTSI", shortname: "ptsi", isChecked: false}
  ];

  $scope.main = function() {
    $state.transitionTo('app.Formulaire', {});
  };
})

.controller('QuizzMatiereCtrl', function($scope, $stateParams, $http, $state) {

  $scope.shortname = $stateParams.matiere[0];
  $scope.matiere = $stateParams.matiere;
  $scope.shortname = currentMatiere.shortname.toUpperCase()[0];

  $scope.goto = function(categorie) {
    if(categorie != undefined) {
      var formules = database({matiere: $scope.matiere, categorie: categorie.name}).get();
    } else {
      var formules = database({matiere: $scope.matiere}).get();
    }


    questions = [];
    resultats = [];

    for(var i = 0; i < formules.length; i++) {
      if(aPrendre(formules[i]) && formules[i].questions != undefined){
        questions.push(formules[i]);
      }
    }

    questions = shuffle(questions);

    if(questions.length > 10) {
      questions = questions.slice(0, 10);
    }

    n = questions.length;

    if(categorie) {
      $state.transitionTo('app.QuizzQuestions', {'name': categorie.name});
    } else {
      $state.transitionTo('app.QuizzQuestions', {'name': 'Aléatoire'});
    }
  };


  $scope.matiere = $stateParams.matiere;
  $scope.shortname = currentMatiere.shortname.toUpperCase()[0];

  var formules = database({matiere: $scope.matiere}).get();
  var categories = [];

  for(var i = 0; i < formules.length; i++) {
    if(aPrendre(formules[i]) && categories.indexOf(formules[i].categorie) == -1 && formules[i].questions != undefined){
      categories.push(formules[i].categorie);
    }
  }

  categories = categories.map(function(e){ return {"name": e};});

  $scope.categories = categories;
})

.controller('QuizzQuestionCtrl', function($scope, $state, $stateParams, $http) {
  $scope.name = $stateParams.name;
  $scope.shortname = currentMatiere.shortname.toUpperCase()[0];
  $scope.formule = questions.shift();
  $scope.question = $scope.formule.questions[0];
  $scope.numero = n - questions.length;

  var reponses = $scope.question.mauvaises_reponses.map(function(e) {
    return {"correct": false,
    "reponse": e
  }});
  reponses.push({"correct": true,
  "reponse": $scope.question.correct_reponse
  });

  $scope.reponses = shuffle(reponses);

  $scope.next = function(correct) {
    resultats.push({"correct": correct, "question": $scope.formule});
    if(questions.length != 0) {
      $scope.formule = questions.shift();
      $scope.question = $scope.formule.questions[0];
      $scope.numero = n - questions.length;

      var reponses = $scope.question.mauvaises_reponses.map(function(e) {
        return {"correct": false,
        "reponse": e
      }});
      reponses.push({"correct": true,
      "reponse": $scope.question.correct_reponse
      });

      $scope.reponses = shuffle(reponses);
    } else {
      $state.transitionTo('app.QuizzResultats', {"name": $scope.name});
    }
  }

})

.controller('QuizzResultatCtrl', function($scope, $state, $stateParams, $http) {
  $scope.name = $stateParams.name;
  $scope.shortname = currentMatiere.shortname.toUpperCase()[0];

  $scope.resultats = resultats;

  $scope.note = resultats.reduce(function(note, item, index, array) {
    if(item.correct) {
      return note + 1;
    }
    return note;
  }, 0);
  $scope.total = resultats.reduce(function(total, item, index, array) {
    return total + 1;
  }, 0);

  $scope.quizz = function() {
    $state.transitionTo('app.Quizz', {});
  };
})

.controller('IntegrerCtrl', function($scope, $state) {
  $scope.integrer = integrer;
});
