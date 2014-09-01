(function ($, window, document, undefined) {

  'use strict';

  $(function () {
    var nameToNameModel = function(name) {
      return cuteName.getNameModel(name) || cuteName.makeNameModel(name);
    };

    $('#findMatches').click(function(event) {
      event.preventDefault();

      var name = $("[name='name'").val().trim();

      var nameModel = nameToNameModel(name);
      var names;
      if (nameModel.gender === 'male') {
        names = cuteName.names.female;
      } else if (nameModel.gender === 'female') {
        names = cuteName.names.male;
      } else {
        names = cuteName.names.male;
      }

      var nicknameModels = _.sortBy(cuteName.allNicknames(nameModel, names), function(model) {
        return -model.score;
      });
      console.log(nicknameModels.slice(0, 20), nameModel);

    });

    $('#compareNames').click(function(event) {
      event.preventDefault();

      var names1 = $("[name='name1'").val().trim().split(' ');
      var names2 = $("[name='name2'").val().trim().split(' ');
      var name1Models = _.map(names1, nameToNameModel);
      var name2Models = _.map(names2, nameToNameModel);

      var nicknameModels = [];
      _.each(name1Models, function(name1Model) {
        _.each(name2Models, function(name2Model) {
          nicknameModels.push.apply(nicknameModels, cuteName.nicknamesForCouple(name1Model, name2Model));
        });
      });

      nicknameModels = _.sortBy(nicknameModels, function(model) {
        return -model.score;
      });
      console.log(nicknameModels, name1Models, name2Models);
    });
  });
})(jQuery, window, document);
