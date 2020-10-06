(function() {

    'use strict';

    var wlNgW = angular.module('wl-ng-weather', ['ngAnimate']);

    wlNgW.directive('skycon', [function() {
        return {
            replace: true,
            restrict: 'A',
            scope: {
                size: '=',
                icon: '='
            },
            link: function(scope, element, attrs) {
                var color = attrs.color;
                if(!color) {
                    color = '#fff';
                }

                var skycons = new Skycons({"color": color});
                var canvas = document.createElement('canvas');

                scope.$watch('size', function(newValue) {
                    if(newValue) {
                        canvas.width = canvas.height = scope.size || 64;
                    }
                }, true);

                skycons.add(canvas, scope.icon);

                scope.$watch('icon', function(newValue) {
                    if(newValue) {
                        skycons.set(canvas, scope.icon);
                    }
                }, true);

                scope.$on('$destroy', function () {
                    skycons.remove(canvas);
                    if (skycons.list.length === 0) {
                        skycons.pause(canvas);
                    }
                });

                if (element[0].nodeType === 8) {
                    element.replaceWith(canvas);
                } else {
                    element[0].appendChild(canvas);
                }

                skycons.play();
            }
        };
    }]);

    wlNgW.filter('wlNgWTimeConverter', [function() {
        return function(unixSeconds, format) {

            var areDatesEqual = function(d1, d2) {
                return (d1.getFullYear() == d2.getFullYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate());
            };

            var getDayName = function(dayNo) {
                switch(dayNo) {
                    case 0: return 'Sunday'; break;
                    case 1: return 'Monday'; break;
                    case 2: return 'Tuesday'; break;
                    case 3: return 'Wednesday'; break;
                    case 4: return 'Thursday'; break;
                    case 5: return 'Friday'; break;
                    case 6: return 'Saturday'; break;
                    default: return 'Someday'; break;
                }
            };

            var d = new Date(0);
            d.setUTCSeconds(unixSeconds);

            if(format == 'day-night') {
                var h = d.getHours();
                if(h >= 5 && h <= 20) {
                    return 'day';
                }
                return 'night';
            }

            var now = new Date();
            var tomorrow = new Date();
            tomorrow.setDate(now.getDate() + 1);

            var ret = '';
            if(areDatesEqual(now, d)) {
                ret = 'Today';
            }else if(areDatesEqual(tomorrow, d)) {
                ret = 'Tomorrow';
            }else {
                ret = getDayName(d.getDay());
            }

            if(format == 'short-day') {
                return ret.substring(0, 3);
            }else if(format == 'long-day') {
                return ret;
            }

            return d.toLocaleDateString();
        };
    }]);

    wlNgW.filter('wlNgWTrim3', [function() {
        return function(input) {
            return input.substring(0, 3);
        };
    }]);

    wlNgW.filter('wlNgWTemp', [function() {
        return function(temp, mu) {
            if(!temp) {
                return 0;
            }
            var ret = temp;
            if(mu == 'C') {
                ret = (temp - 32) * 5/9;
            }
            return ret.toFixed(0);
        };
    }]);

    wlNgW.filter('wlNgWSpeed', [function() {
        return function(miles, mu) {
            if(!miles) {
                return 0;
            }
            var ret = miles;
            if(mu == 'C') {
                ret = miles / 0.62137;
            }
            return ret.toFixed(2);
        };
    }]);

    wlNgW.filter('wlNgWPressure', [function() {
        return function(mbar, mu) {
            if(!mbar) {
                return 0;
            }
            var ret = mbar;
            if(mu == 'F') {
                ret = (29.92 * mbar) / 1013.25 ;
            }
            return ret.toFixed(2);
        };
    }]);

    wlNgW.value('wlNgWLocaleDictionary', {});

    wlNgW.filter('wlNgWLocale', ['wlNgWLocaleDictionary', function(wlNgWLocaleDictionary) {
        return function(input, lang) {
            if(lang == 'en') {
                return input;
            }
            if(!wlNgWLocaleDictionary[lang]) {
                return input;
            }
            if(!wlNgWLocaleDictionary[lang][input]) {
                return input;
            }
            return wlNgWLocaleDictionary[lang][input];
        };
    }]);

    wlNgW.filter('wlNgRainbow', [function() {
        return function(index) {
            var colors = [
                'rgba(0, 128, 9, 0.6)',
                'rgba(255, 161, 4, 0.6)',
                'rgba(128, 58, 127, 0.6)',
                'rgba(202, 81, 12, 0.6)',
                'rgba(31, 122, 202, 0.6)',
                'rgba(234, 230, 0, 0.6)'
            ];
            return colors[index];
        };
    }]);

    wlNgW.service('wlNgWGeoLocationBrowser', ['$q', function($q) {
        return {
            get: function() {
                var dfd = $q.defer();
                var resolved = false;
                if(navigator.geolocation) {
                    var timeOut = setTimeout(function() {
                        clearTimeout(timeOut);
                        if(!resolved) {
                            resolved = true;
                            dfd.reject('Browser geolocation timeout');
                        }
                    }, 5000);
                    navigator.geolocation.getCurrentPosition(
                        function(data) {
                            clearTimeout(timeOut);
                            resolved = true;
                            dfd.resolve({
                                latitude: data.coords.latitude,
                                longitude: data.coords.longitude
                            });
                        },
                        function(positionError) {
                            clearTimeout(timeOut);
                            resolved = true;
                            dfd.reject(positionError);
                        }
                    );
                }else {
                    dfd.reject('Geolocation is not supported by this browser.');
                }
                return dfd.promise;
            }
        }
    }]);

    wlNgW.service('wlNgWGeoLocationTelize', ['$q', '$http', function($q, $http) {
        return {
            get: function() {
                var dfd = $q.defer();
                $http.jsonp('http://www.telize.com/geoip?callback=JSON_CALLBACK')
                    .then(function(data) {
                        dfd.resolve({
                            latitude: data.data.latitude,
                            longitude: data.data.longitude
                        });
                    }, function(error) {
                        dfd.reject(error);
                    });
                return dfd.promise;
            }
        }
    }]);

    wlNgW.service('wlNgWGeoPredictionGoogle', ['$q', function($q) {
        return {
            get: function(search) {
                var service = new google.maps.places.AutocompleteService();
                var dfd = $q.defer();
                service.getQueryPredictions({ input: search }, function(predictions, status) {
                    if(status != google.maps.places.PlacesServiceStatus.OK) {
                        dfd.reject(status);
                    }else {
                        dfd.resolve(predictions);
                    }
                });
                return dfd.promise;
            }
        }
    }]);

    wlNgW.service('wlNgWGeoCodingGoogle', ['$q', function($q) {
        return {
            get: function(address) {
                var service = new google.maps.Geocoder();
                var dfd = $q.defer();
                service.geocode({ 'address': address }, function(results, status) {
                    if(status != google.maps.places.PlacesServiceStatus.OK) {
                        dfd.reject(status);
                    }else {
                        dfd.resolve(results[0]);
                    }
                });
                return dfd.promise;
            }
        }
    }]);

    wlNgW.service('wlNgWForecastIo', ['$q', '$http', '$filter', 'bins', 'apikey', function($q, $http, $filter, bins, apikey) {
        var convert = function(data) {
            var ret = {
                latitude: data.latitude,
                longitude: data.longitude,
                zone: data.timezone,
                current: {
                    time: data.currently.time,
                    dayNight: $filter('wlNgWTimeConverter')(data.currently.time, 'day-night'),
                    description: data.currently.summary,
                    icon: data.currently.icon,
                    temperature: data.currently.temperature,
                    temperatureApparent: data.currently.apparentTemperature,
                    humidity: (data.currently.humidity * 100).toFixed(0),
                    windSpeed: data.currently.windSpeed,
                    pressure: data.currently.pressure,
                    precipitationIntensity: data.currently.precipIntensity,
                    precipitationProbability: data.currently.precipProbability
                },
                today: {},
                tomorrow: {},
                forecast: []
            };
            for(var i = 0; i < data.daily.data.length; i++) {
                var daily = data.daily.data[i];
                ret.forecast.push({
                    time: daily.time,
                    description: daily.summary,
                    icon: daily.icon,
                    temperatureMin: daily.temperatureMin,
                    temperatureMax: daily.temperatureMax,
                    humidity: (daily.humidity * 100).toFixed(0),
                    windSpeed: daily.windSpeed,
                    pressure: daily.pressure,
                    precipitationProbability: daily.precipProbability
                });
            }
            ret.today = ret.forecast[0];
            ret.tomorrow = ret.forecast[1];
            return ret;
        };
        return {
            get: function(latitude, longitude, lang) {
                var supportedLanguages = ['bs', 'de', 'en', 'es', 'fr', 'it', 'nl', 'pl', 'pt', 'ru'];
                if(!lang || -1 === supportedLanguages.indexOf(lang)) {
                    lang = 'en';
                }
                var dfd = $q.defer();
                $http.jsonp('https://api.forecast.io/forecast/' + apikey + '/' + latitude +',' + longitude + '?units=us&lang=' + lang + '&callback=JSON_CALLBACK')
                    .then(function(data) {
                        dfd.resolve(convert(data.data));
                    }, function(error) {
                        dfd.reject(error);
                    });
                return dfd.promise;
            }
        }
    }]);

    wlNgW.directive('wlNgEditableLabel', ['$timeout', function($timeout) {
        return {
            replace: true,
            restrict: 'A',
            template: '<div><input class="form-control" style="cursor:pointer;background:transparent;border:none;color:inherit;box-shadow:none;text-shadow:inherit;font-size:inherit;transition:none;-webkit-transition:none;-moz-transition:none;-o-transition:none;" readonly ng-click="showTyping()" ng-show="!isTyping" ng-model="value"/><input class="form-control" style="text-shadow:none;font-size:inherit;transition:none;-webkit-transition:none;-moz-transition:none;-o-transition:none;" ng-show="isTyping" ng-model="localValue" ng-keydown="onKeyDown($event)" ng-blur="hideTyping()"/></div>',
            scope: {
                value: '=',
                onChanged: '&',
                isTyping: '='
            },
            link: function($scope, element) {
                $scope.isTyping = false;

                $scope.$watch('value', function() {
                    if($scope.value) {
                        $scope.localValue = $scope.value;
                    }
                });

                $scope.$watch('isTyping', function(newValue) {
                    if(newValue) {
                        $scope.showTyping();
                    }
                });

                $scope.showTyping = function() {
                    $scope.isTyping = true;
                    $timeout(function() {
                        element[0].children[1].select();
                        element[0].children[1].focus();
                    });
                };

                $scope.hideTyping = function() {
                    $scope.isTyping = false;
                };

                $scope.onKeyDown = function($event) {
                    if($event.keyCode == 13) {
                        $scope.value = $scope.localValue;
                        $scope.hideTyping();
                        $timeout(function() {
                            $scope.onChanged();
                        });
                    }else if($event.keyCode == 27) {
                        $scope.localValue = $scope.value;
                        $scope.hideTyping();
                    }
                };
            }
        };
    }]);

    wlNgW.directive('wlNgWeather', ['$q', '$interval', 'bins', 'wlNgWForecastIo', 'wlNgWGeoLocationBrowser', 'wlNgWGeoLocationTelize', 'wlNgWGeoPredictionGoogle', 'wlNgWGeoCodingGoogle', 'wlNgWLocaleDictionary', function(q, $interval, bins, wlNgWForecastIo, wlNgWGeoLocationBrowser, wlNgWGeoLocationTelize, wlNgWGeoPredictionGoogle, wlNgWGeoCodingGoogle, wlNgWLocaleDictionary) {
        return {
            replace: true,
            restrict: 'A',
            template: '<div class="wlww-animate" ng-show="weather!=null" ng-style="getBackgroundStyle()"><style>.wlww-animate{-webkit-transition:all linear 0.5s;transition:all linear 0.5s;} .wlww-animate.ng-hide{opacity:0;} .wlww-fixed{position:relative;height:100%;width:100%;}</style><div ng-style="getRefreshBackgroundStyle()"><div ng-include="getLocale()"></div><div ng-include="getTheme()"></div></div></div>',
            scope: {
                theme: '@',
                background: '@',
                latitude: '@',
                longitude: '@',
                location: '@',
                lang: '@',
                units: '@' //us, si
            },
            controller: ['$scope', function($scope) {

                var northPole = 'Dhaka';

                $scope.units = $scope.units || 'si';

                var currentLocation  = {
                    latitude: 0,
                    longitude: 0,
                    name: null
                };

                $scope.locale = wlNgWLocaleDictionary;
                $scope.weather = null;
                $scope.mu = {
                    temperature: 'C',
                    speed: 'km/h',
                    pressure: 'mBar'
                };
                $scope.options = {
                    forecastDays: 5,
                    showForecast: false,
                    isSearching: false,
                    isRefreshing: false
                };
                $scope.bins = bins;

                $scope.getTheme = function() {
                    $scope.theme = $scope.theme || 'complex1';
                    return bins + '/themes/' + $scope.theme +  '.html';
                };

                $scope.getLocale = function() {
                    if(!$scope.lang || $scope.lang == 'en') {
                        return '';
                    }
                    return bins + '/lang/' + $scope.lang +  '.html';
                };

                $scope.getBackgroundStyle = function() {
                    $scope.background = $scope.background || 'dynamic';
                    if(!$scope.weather || !$scope.weather.current || !$scope.weather.current.icon) {
                        return null;
                    }
                    var icon = $scope.weather.current.icon.replace('-day', '').replace('-night', '');
                    return {
                        'background-color':  $scope.background != 'dynamic' ? $scope.background : 'transparent',
                        'background-image': $scope.background == 'dynamic' ? "url('" + bins + "/assets/bg-" + icon + "-" + $scope.weather.current.dayNight + ".jpg')" : 'none',
                        'background-repeat': 'no-repeat',
                        'background-position': 'center',
                        'background-size': 'cover',
                        'text-shadow': $scope.background != 'dynamic' ? 'none' : '1px 1px 2px #000, 1px 1px 4px #000, 1px 1px 7px #000'
                    };
                };

                $scope.getRefreshBackgroundStyle = function() {
                    return {
                        'background-color': $scope.options.isRefreshing ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
                        '-webkit-transition': 'all linear 0.5s',
                        'transition': 'all linear 0.5s'
                    };
                };

                var getWeatherByPosition = function(latitude, longitude, name) {
                    currentLocation.latitude = latitude;
                    currentLocation.longitude = longitude;
                    currentLocation.name = name;
                    $scope.refresh();
                };

                var getWeatherByClientPosition = function() {
                    wlNgWGeoLocationBrowser.get()
                        .then(function(position) {
                            getWeatherByPosition(position.latitude, position.longitude, null);
                        }, function() {
                            wlNgWGeoLocationTelize.get()
                                .then(function(position) {
                                    getWeatherByPosition(position.latitude, position.longitude, null);
                                }, function() {
                                    getWeatherByPosition(23.8103, 90.4125, northPole);
                                });
                        });
                };

                var getWeatherByAddress = function(address) {
                    wlNgWGeoPredictionGoogle.get(address)
                        .then(function(predictions) {
                            var first = predictions[0];
                            wlNgWGeoCodingGoogle.get(first.description)
                                .then(function(place) {
                                    getWeatherByPosition(place.geometry.location.lat(), place.geometry.location.lng(), first.description);
                                }, function() {
                                    getWeatherByPosition(23.8103, 90.4125, northPole);
                                });
                        }, function() {
                            getWeatherByPosition(23.8103, 90.4125, northPole);
                        });
                };

                $scope.refresh = function() {
                    $scope.options.isRefreshing = true;
                    var timeOut = setTimeout(function() {
                        wlNgWForecastIo.get(currentLocation.latitude, currentLocation.longitude, $scope.lang)
                            .then(function(weather) {
                                $scope.weather = weather;
                                if(currentLocation.name) {
                                    $scope.weather.zone = currentLocation.name;
                                }
                                $scope.options.isRefreshing = false;
                                clearTimeout(timeOut);
                            }, function(error) {
                                $scope.options.isRefreshing = false;
                                clearTimeout(timeOut);
                                // alert(error);
                            });
                    }, 200);
                };

                $scope.doSearch = function() {
                    getWeatherByAddress($scope.weather.zone);
                };

                $scope.startSearch = function() {
                    $scope.options.isSearching = true;
                };

                $scope.switchMu = function() {
                    if($scope.mu.temperature == 'F') {
                        $scope.mu.temperature = 'C';
                        $scope.mu.speed = 'km/h';
                        $scope.mu.pressure = 'mBar';
                    }else {
                        $scope.mu.temperature = 'F';
                        $scope.mu.speed = 'mph';
                        $scope.mu.pressure = 'inHg';
                    }
                };

                $scope.switchShortForecast = function() {
                    $scope.options.forecastDays = $scope.options.forecastDays == 5 ? $scope.weather.forecast.length : 5;
                };

                $scope.setForecastDays = function(days) {
                    $scope.options.forecastDays = days;
                };

                $scope.toggleForecast = function() {
                    $scope.options.showForecast = !$scope.options.showForecast;
                };

                var start = function() {
                    if($scope.units == 'us') {
                        $scope.switchMu();
                    }
                    if(!$scope.location && !$scope.latitude && !$scope.longitude) {
                        getWeatherByClientPosition();
                    }else if($scope.latitude || $scope.longitude) {
                        $scope.latitude = $scope.latitude || '0';
                        $scope.longitude = $scope.longitude || '0';
                        getWeatherByPosition($scope.latitude, $scope.longitude, $scope.location);
                    }else if($scope.location && !$scope.latitude && !$scope.longitude) {
                        getWeatherByAddress($scope.location);
                    }
                };

                start();
            }]
        };
    }]);
})();