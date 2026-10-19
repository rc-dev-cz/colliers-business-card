// Admin Home (admin) onFormLoad.
// Until FileMaker returns counts: sizes of the seeded lists (admindegrees-onFormLoad.js / admintitles-onFormLoad.js: 31 EN + 8 FR).
var DEGREE_SEED_COUNT = 32;
var TITLE_SEED_COUNT = 39;
if (!model.counts) model.counts = {};
if (!model.counts.degrees) model.counts.degrees = DEGREE_SEED_COUNT;
if (!model.counts.titles) model.counts.titles = TITLE_SEED_COUNT;
