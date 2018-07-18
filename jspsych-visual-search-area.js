/**
 *
 * jspsych-visual-search-area
 * Josh de Leeuw
 *
 * display a set of objects, with or without a target, equidistant from fixation
 * subject responds to whether or not the target is present
 *
 * based on code written for psychtoolbox by Ben Motz
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["visual-search-area"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('visual-search-area', 'target', 'image');
  jsPsych.pluginAPI.registerPreload('visual-search-area', 'foil', 'image');
  jsPsych.pluginAPI.registerPreload('visual-search-area', 'fixation_image', 'image');

  plugin.info = {
    name: 'visual-search-area',
    description: '',
    parameters: {
      target: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Target',
        default: undefined,
        description: 'The image to be displayed.'
      },
      foil: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Foil',
        default: undefined,
        description: 'Path to image file that is the foil/distractor.'
      },
      fixation_image: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Fixation image',
        default: undefined,
        description: 'Path to image file that is a fixation target.'
      },
      set_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Set size',
        default: 10,
        description: 'How many items should be displayed?'
      },
      target_present: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Target present',
        default: true,
        description: 'Is the target present?'
      },
      target_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Target size',
        array: true,
        default: [50, 50],
        description: 'Two element array indicating the height and width of the search array element images.'
      },
      fixation_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Fixation size',
        array: true,
        default: [16, 16],
        description: 'Two element array indicating the height and width of the fixation image.'
      },
      circle_diameter: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Circle diameter',
        default: 500,
        description: 'The diameter of the search array circle in pixels.'
      },
      target_present_key: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Target present key',
        default: 'j',
        description: 'The key to press if the target is present in the search array.'
      },
      target_absent_key: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Target absent key',
        default: 'f',
        description: 'The key to press if the target is not present in the search array.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'The maximum duration to wait for a response.'
      },
      fixation_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Fixation duration',
        default: 1000,
        description: 'How long to show the fixation image for before the search array (in milliseconds).'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // circle params
    var diam = trial.circle_diameter; // pixels
    var radi = diam / 2;
    var paper_size = diam + trial.target_size[0];

    // stimuli width, height
    var stimh = trial.target_size[0];
    var stimw = trial.target_size[1];
    var hstimh = stimh / 2;
    var hstimw = stimw / 2;

    // fixation location
    var fix_loc = [Math.floor(paper_size / 2 - trial.fixation_size[0] / 2), Math.floor(paper_size / 2 - trial.fixation_size[1] / 2)];

    // create a grid
    var w = paper_size;
    var h = paper_size;
    var circleCount = trial.set_size;
    var g = new Grid(150, w, h);

    // stick circles into the grid
    var display_locs = [];
    var radii = [
      Math.round(200/2),
      Math.round(150/2),
      Math.round(130/2),
      Math.round(100/2),
      Math.round(80/2)
    ];

    for (var i=0; i<trial.set_size; i++) {
      var radius, circle;
      var check = 0;
      var iterations = 500;
      do {
        radius = stimh;
        circle = {
          x: Math.random() * (w - radius * 2) + radius,
          y: Math.random() * (h - radius * 2) + radius,
          radius: radius
        };

      } while(g.hasCollisions(circle) && ++check < iterations);
      display_locs.push(circle);
      g.add(circle);
    }

    // get target to draw on
    display_element.innerHTML += '<div id="jspsych-visual-search-area-container" style="position: relative; width:' + paper_size + 'px; height:' + paper_size + 'px"></div>';
    var paper = display_element.querySelector("#jspsych-visual-search-area-container");

    // check distractors - array?
    if(!Array.isArray(trial.foil)){
      fa = [];
      for(var i=0; i<display_locs.length; i++){
        fa.push(trial.foil);
      }
      trial.foil = fa;
    }else{
      fa = [];
      while (fa.length < display_locs.length){
        for (var i=0; i<trial.foil.length; i++){
          fa.push(trial.foil[i]);
        }
      } 
      trial.foil = fa;
    }

    show_fixation();

    function show_fixation() {
      // show fixation
      //var fixation = paper.image(trial.fixation_image, fix_loc[0], fix_loc[1], trial.fixation_size[0], trial.fixation_size[1]);
      paper.innerHTML += "<img id='fixation' src='"+trial.fixation_image+"' style='position: absolute; top:"+fix_loc[0]+"px; left:"+fix_loc[1]+"px; width:"+trial.fixation_size[0]+"px; height:"+trial.fixation_size[1]+"px;'></img>";

      // wait
      jsPsych.pluginAPI.setTimeout(function() {
        // after wait is over
        show_search_array();
        setImageVisible('fixation', false);
      }, trial.fixation_duration);
    }

    function setImageVisible(id, visible) {
      var img = document.getElementById(id);
      img.style.visibility = (visible ? 'visible' : 'hidden');
    }

    function show_search_array() {

      var search_array_images = [];

      var to_present = [];
      if(trial.target_present){
        to_present.push(trial.target);
      }
      to_present = to_present.concat(trial.foil);

      for (var i = 0; i < display_locs.length; i++) {

        paper.innerHTML += "<img src='"+to_present[i]+"' style='position: absolute; top:"+display_locs[i].x+"px; left:"+display_locs[i].y+"px; width:"+trial.target_size[0]+"px; height:"+trial.target_size[1]+"px;'></img>";

      }

      var trial_over = false;

      var after_response = function(info) {

        trial_over = true;

        var correct = false;

        if (jsPsych.pluginAPI.compareKeys(info.key,trial.target_present_key) && trial.target_present ||
            jsPsych.pluginAPI.compareKeys(info.key,trial.target_absent_key) && !trial.target_present) {
          correct = true;
        }

        clear_display();


        end_trial(info.rt, correct, info.key);
      }

      var valid_keys = [trial.target_present_key, trial.target_absent_key];

      key_listener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: valid_keys,
        rt_method: 'date',
        persist: false,
        allow_held_key: false
      });

      if (trial.trial_duration !== null) {

        jsPsych.pluginAPI.setTimeout(function() {

          if (!trial_over) {

            jsPsych.pluginAPI.cancelKeyboardResponse(key_listener);

            trial_over = true;

            var rt = null;
            var correct = 0;
            var key_press = null;

            clear_display();

            end_trial(rt, correct, key_press);
          }
        }, trial.trial_duration);

      }

      function clear_display() {
        display_element.innerHTML = '';
      }
    }


    function end_trial(rt, correct, key_press) {

      // data saving
      var trial_data = {
        correct: correct,
        rt: rt,
        key_press: key_press,
        target_present: trial.target_present,
        set_size: trial.set_size
      };

      // go to next trial
      jsPsych.finishTrial(trial_data);
    }
  };

  // helper function for determining stimulus locations

  function cosd(num) {
    return Math.cos(num / 180 * Math.PI);
  }

  function sind(num) {
    return Math.sin(num / 180 * Math.PI);
  }

  return plugin;
})();



/**
GRID CLASS 
**/
function Grid(radius, width, height) {
    // I'm not sure offhand how to find the optimum grid size.
    // Let's use a radius as a starting point
    this.gridX = Math.floor(width / radius);
    this.gridY = Math.floor(height / radius);
  
    // Determine cell size
    this.cellWidth = width / this.gridX;
    this.cellHeight = height / this.gridY;
  
  // Create the grid structure
    this.grid = [];
    for (var i = 0; i < this.gridY; i++) {
        // grid row
        this.grid[i] = [];
        for (var j = 0; j < this.gridX; j++) {
            // Grid cell, holds refs to all circles
            this.grid[i][j] = []; 
        }
    }
}

Grid.prototype = {
    // Return all cells the circle intersects. Each cell is an array
    getCells: function(circle) {
        var cells = [];
        var grid = this.grid;
        // For simplicity, just intersect the bounding boxes
        var gridX1Index = Math.floor(
            (circle.x - circle.radius) / this.cellWidth
        );
        var gridX2Index = Math.ceil(
            (circle.x + circle.radius) / this.cellWidth
        );
        var gridY1Index = Math.floor(
            (circle.y - circle.radius) / this.cellHeight
        );
        var gridY2Index = Math.ceil(
            (circle.y + circle.radius) / this.cellHeight
        );
        for (var i = gridY1Index; i < gridY2Index; i++) {
            for (var j = gridX1Index; j < gridX2Index; j++) {
                // Add cell to list
                cells.push(grid[i][j]);
            }
        }
        return cells;
    },
    add: function(circle) {
        this.getCells(circle).forEach(function(cell) {
            cell.push(circle);
        });
    },
    hasCollisions: function(circle) {
        return this.getCells(circle).some(function(cell) {
            return cell.some(function(other) {
                return this.collides(circle, other);
            }, this);
        }, this);
    },
    collides: function (circle, other) {
        if (circle === other) {
          return false;
        }
      var dx = circle.x - other.x;
      var dy = circle.y - other.y;
      var rr = circle.radius + other.radius;
      return (dx * dx + dy * dy < rr * rr);
    }
};






