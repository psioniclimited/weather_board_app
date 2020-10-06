function join_with_shared_prefix(a, b, joiner) {
  var m = a,
      i = 0,
      j;

  /* HACK: This gets around "today through on Tuesday" or cases like it, which
   * are incorrect in English. */
  if(m === "today" || m === "tomorrow")
    m = "on " + m;

  while(i !== m.length &&
        i !== b.length &&
        m.charCodeAt(i) === b.charCodeAt(i))
    ++i;

  while(i && m.charCodeAt(i - 1) !== 32)
    --i;

  return a + joiner + b.slice(i);
}

function strip_prefix(period) {
  return period.slice(0, 9) === "overnight" ? period.slice(4) :
         period.slice(0, 7) ===   "in the " ? period.slice(7) :
                                              period;
}

module.exports = require("../template")({
  "clear": "পরিষ্কার",
  "no-precipitation": "বৃষ্টিপাতের নেই",
  "mixed-precipitation": "মিশ্র বৃষ্টিপাতের",
  "possible-very-light-precipitation": "সম্ভব-খুব-হালকা-বৃষ্টিপাতের",
  "very-light-precipitation": "খুব-হালকা-বৃষ্টিপাতের",
  "possible-light-precipitation": "সম্ভব-হালকা-বৃষ্টিপাতের",
  "light-precipitation": "হালকা-বৃষ্টিপাতের",
  "medium-precipitation": "মাঝারি বৃষ্টিপাতের",
  "heavy-precipitation": "ভারী বৃষ্টিপাতের",
  "possible-very-light-rain": "সম্ভব-খুব-হালকা-বৃষ্টি",
  "very-light-rain": "খুব-হালকা-বৃষ্টি",
  "possible-light-rain": "সম্ভব-হালকা-বৃষ্টি",
  "light-rain": "হালকা বৃষ্টি",
  "medium-rain": "মাঝারি বৃষ্টি",
  "heavy-rain": "ভারী বর্ষণ",
  "possible-very-light-sleet": "সম্ভব-খুব-হালকা-শিলাবৃষ্টি",
  "very-light-sleet": "খুব-হালকা-শিলাবৃষ্টি",
  "possible-light-sleet": "সম্ভব-হালকা-শিলাবৃষ্টি",
  "light-sleet": "হালকা-শিলাবৃষ্টি",
  "medium-sleet": "sleet",
  "heavy-sleet": "মাঝারি শিলাবৃষ্টি",
  "possible-very-light-snow": "possible flurries",
  "very-light-snow": "flurries",
  "possible-light-snow": "possible light snow",
  "light-snow": "light snow",
  "medium-snow": "snow",
  "heavy-snow": "heavy snow",
  "possible-thunderstorm": "সম্ভব-বজ্রঝড়",
  "thunderstorm": "বজ্রঝড়",
  "light-wind": "হালকা বাতাস",
  "medium-wind": "windy",
  "heavy-wind": "dangerously windy",
  "low-humidity": "dry",
  "high-humidity": "humid",
  "fog": "foggy",
  "light-clouds": "partly cloudy",
  "medium-clouds": "mostly cloudy",
  "heavy-clouds": "overcast",
  "today-morning": "this morning",
  "later-today-morning": "later this morning",
  "today-afternoon": "this afternoon",
  "later-today-afternoon": "later this afternoon",
  "today-evening": "this evening",
  "later-today-evening": "later this evening",
  "today-night": "tonight",
  "later-today-night": "later tonight",
  "tomorrow-morning": "tomorrow morning",
  "tomorrow-afternoon": "tomorrow afternoon",
  "tomorrow-evening": "tomorrow evening",
  "tomorrow-night": "tomorrow night",
  "morning": "in the morning",
  "afternoon": "in the afternoon",
  "evening": "in the evening",
  "night": "overnight",
  "today": "today",
  "tomorrow": "tomorrow",
  "sunday": "on Sunday",
  "monday": "on Monday",
  "tuesday": "on Tuesday",
  "wednesday": "on Wednesday",
  "thursday": "on Thursday",
  "friday": "on Friday",
  "saturday": "on Saturday",
  "next-sunday": "next Sunday",
  "next-monday": "next Monday",
  "next-tuesday": "next Tuesday",
  "next-wednesday": "next Wednesday",
  "next-thursday": "next Thursday",
  "next-friday": "next Friday",
  "next-saturday": "next Saturday",
  "minutes": "$1 min.",
  "fahrenheit": "$1\u00B0F",
  "celsius": "$1\u00B0C",
  "inches": "$1 in.",
  "centimeters": "$1 cm.",
  "less-than": "under $1",
  "and": function(a, b) {
    return join_with_shared_prefix(
      a,
      b,
      a.indexOf(",") !== -1 ? ", and " : " and "
    );
  },
  "through": function(a, b) {
    return join_with_shared_prefix(a, b, " through ");
  },
  "with": "$1, with $2",
  "range": "$1\u2013$2",
  "parenthetical": function(a, b) {
    return a + " (" + b + (a === "mixed precipitation" ? " of snow)" : ")");
  },
  "for-hour": "$1 for the hour",
  "starting-in": "$1 starting in $2",
  "stopping-in": "$1 stopping in $2",
  "starting-then-stopping-later": "$1 starting in $2, stopping $3 later",
  "stopping-then-starting-later": "$1 stopping in $2, starting again $3 later",
  "for-day": "$1 throughout the day",
  "starting": "$1 starting $2",
  "until": function(condition, period) {
    return condition + " until " + strip_prefix(period);
  },
  "until-starting-again": function(condition, a, b) {
    return condition + " until " + strip_prefix(a) + ", starting again " + b;
  },
  "starting-continuing-until": function(condition, a, b) {
    return condition + " starting " + a + ", continuing until " +
           strip_prefix(b);
  },
  "during": "$1 $2",
  "for-week": "$1 throughout the week",
  "over-weekend": "$1 over the weekend",
  "temperatures-peaking": "temperatures peaking at $1 $2",
  "temperatures-rising": "temperatures rising to $1 $2",
  "temperatures-valleying": "temperatures bottoming out at $1 $2",
  "temperatures-falling": "temperatures falling to $1 $2",
  /* Capitalize the first letter of every word, except if that word is
   * "and". (This is a very crude bastardization of proper English titling
   * rules, but it is adequate for the purposes of this module.) */
  "title": function(str) {
    return str.replace(
      /\b(?:a(?!nd\b)|c(?!m\.)|i(?!n\.)|[^\Waci])/g,
      function(letter) {
        return letter.toUpperCase();
      }
    );
  },
  /* Capitalize the first word of the sentence and end with a period. */
  "sentence": function(str) {
    /* Capitalize. */
    str = str.charAt(0).toUpperCase() + str.slice(1);

    /* Add a period if there isn't already one. */
    if(str.charAt(str.length - 1) !== ".")
      str += ".";

    return str;
  }
});
