angular.module('phpdraft.admin').config(($routeProvider, $locationProvider) => {
  $locationProvider
    .html5Mode(true)
    .hashPrefix('!');

  $routeProvider.when('/admin/proplayers', {
    template: '<phpd-pro-player-management></phpd-pro-player-management>',
    adminOnly: true,
  });

  $routeProvider.when('/admin/users', {
    template: '<phpd-users></phpd-users>',
    adminOnly: true,
  });

  $routeProvider.when('/admin/stats', {
    template: '<phpd-regenerate-stats></phpd-regenerate-stats>',
    adminOnly: true,
  });
});
