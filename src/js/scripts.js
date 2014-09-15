(function ($, window, document, undefined) {

  'use strict';

  $(function () {
    $('#name-form').submit(function(event) {
      event.preventDefault();

      var name = $("[name='name'").val().trim();
      if (name === '') {
        clearTopNicknames();
        return;
      }

      var matchGenders = $('#match-genders');
      $('#selected-name').val(name);

      var nameModel = nameToNameModel(name);
      var names;
      if (nameModel.gender === 'male') {
        names = cuteName.names.female;
        matchGenders.val('female');
      } else {
        names = cuteName.names.male;
        matchGenders.val('male');
      }

      var nicknameModels = cuteName.allNicknames(nameModel, names);
      displayTopNicknames(nicknameModels, name);
    });

    var nameToNameModel = function(name) {
      return cuteName.getNameModel(name) || cuteName.makeNameModel(name);
    };

    $('#match-genders').change(function(event) {
      var name = $("#selected-name").val();
      var matchGenders = $('#match-genders').val();
      var names;
      if (matchGenders === 'male') {
        names = cuteName.names.male;
      } else if (matchGenders === 'female') {
        names = cuteName.names.female;
      } else {
        names = _.extend(_.clone(cuteName.names.female), cuteName.names.male);
      }

      var nameModel = nameToNameModel(name);
      var nicknameModels = cuteName.allNicknames(nameModel, names);
      displayTopNicknames(nicknameModels, name);
    });

    var displayTopNicknames = function(nicknameModels, name) {
      var nicknameModels = _.chain(nicknameModels)
        .groupBy(function(model) {
          return model.nickname;
        })
        .map(function(models) {
          return _.max(models, function(model) { return model.score });
        })
        .sortBy(function(model) {
          return -model.score;
        })
        .value()
        .slice(0, 10);

      var listItems = Handlebars.templates['src/templates/nickname.hbs']({
        nicknameModels: _.map(nicknameModels, function(model) {
          return {
            nickname: model.nickname,
            name1: model.name1,
            name2: model.name2,
            score: Math.round(model.score * 100)
          };
        })
      });

      $('#nicknames-list').html(listItems);
    };

    var clearTopNicknames = function() {
      $('#nicknames-list').html("");
    }

    $('#couple-form').submit(function(event) {
      event.preventDefault();

      var names1 = $("#couple-form [name='name1'").val().trim().split(' ');
      var names2 = $("#couple-form [name='name2'").val().trim().split(' ');

      if (names1[0] === '' || names2[0] === '') {
        hideCoupleNicknames();
        return;
      }

      var name1Models = _.map(names1, nameToNameModel);
      var name2Models = _.map(names2, nameToNameModel);

      var nicknameModels = [];
      _.each(name1Models, function(name1Model) {
        _.each(name2Models, function(name2Model) {
          nicknameModels.push.apply(nicknameModels, cuteName.nicknamesForCouple(name1Model, name2Model));
        });
      });

      var fullName1 = _.chain(name1Models)
                    .pluck('name')
                    .reduce(function(memo, name) {
                      return memo + ' ' + name;
                    })
                    .value();
      var fullName2 = _.chain(name2Models)
                    .pluck('name')
                    .reduce(function(memo, name) {
                      return memo + ' ' + name;
                    })
                    .value();
      displayCoupleNicknames(nicknameModels, fullName1, fullName2);
    });

    var hideCoupleNicknames = function() {
      $('#couple-nicknames').html('');
      $('#couple').html('');
    };

    var displayCoupleNicknames = function(nicknameModels, name1, name2) {
        nicknameModels = _.sortBy(nicknameModels, function(model) {
          return -model.score;
        }).slice(0, 10);

      var listItems = Handlebars.templates['src/templates/couple-nickname-list.hbs']({
        nicknameModels: _.map(nicknameModels, function(model) {
          return {
            nickname: model.nickname,
            name1: model.name1,
            name2: model.name2,
            score: Math.round(model.score * 100)
          };
        })
      });

      $('#couple').html(name1 + ' + ' + name2);
      $('#couple-nicknames').html(listItems);
    };

    $(document).foundation( {
      abide: {
        validators: {
          inNameDatabase: function(el, required, parent) {
            var name = $(el).val().trim();
            return name === '' || name.indexOf('-') > -1 || !!cuteName.getNameModel(name);
          }
        }
      }
    });
  });
})(jQuery, window, document);
