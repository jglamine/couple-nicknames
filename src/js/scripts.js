(function ($, window, document, undefined) {

  'use strict';

  $(function () {
    var nameToNameModel = function(name) {
      return cuteName.getNameModel(name) || cuteName.makeNameModel(name);
    };

    var displayTopNicknames = function(nicknameModels, name) {
      var nicknameModels = _.sortBy(nicknameModels, function(model) {
        return -model.score;
      }).slice(0, 10);

      name = name.toLowerCase();

      var tableBody = $('<tbody/>');
      _.each(nicknameModels, function(model, index) {
        if (name !== model.name1.toLowerCase()) {
          var matchedName = model.name1;
        } else {
          var matchedName = model.name2;
        }
        var tr = $('<tr/>');
        tr.append('<td>' + (index + 1) + '.</td>');
        var td = $('<td>' + model.nickname + '</td>');
        if (index < 3) {
          td.addClass('top-result');
        }
        td.appendTo(tr);
        tr.append('<td>' + matchedName + '</td>');
        tr.append('<td>' + (Math.round(model.score * 1000) / 10) + '%</td>');
        tableBody.append(tr);
      });
      $('#name-results tbody').replaceWith(tableBody);

    };

    $('#name-form').submit(function(event) {
      event.preventDefault();

      var name = $("[name='name'").val().trim();
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
    });
  });
})(jQuery, window, document);
