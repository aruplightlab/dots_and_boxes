// dots and boxes installation
// server interface
// Ben Hussey - May 2017

var request = require('request-promise-lite');
var convert = require('color-convert');
var hardware = require('./hardware');
var segments = [];
var colors = ['#D63F15', '#0F5573', '#FA9B1E', '#D22D7D', '#1982AF', '#28AF73', '#CCCCCC', '#000000'];


function Segment(id, row, col, type, color) {
    this.id = id;
    this.row = row;
    this.col = col;
    this.type = type
    this.color = color;
};

function all_segments(clear=false) {
    // Return all segments if they exist already
    if (segments.length > 0 && !clear) {
        return segments;
    } else {
        segments = [];
        reset_all();
    }

    var i = 0;

    var h_rows = [0, 2, 4, 6, 8]
    var h_cols = [1, 3, 5, 7, 9, 11, 13]
    var v_rows = [1, 3, 5, 7]
    var v_cols = [0, 2, 4, 6, 8, 10, 12, 14]
    var b_cols = [1, 3, 5, 7, 9, 11, 13]

    for (row in h_rows) {
        for (col in h_cols) {
            segments.push(
                new Segment(i, h_rows[row], h_cols[col], "horiz", "#000000"));
            i++;
        }
    }
    for (row in v_rows) {
        for (col in b_cols) {
            segments.push(
                new Segment(i, v_rows[row], b_cols[col], "block", "#333333"));
            i++;
        }
        for (col in v_cols) {
            segments.push(
                new Segment(i, v_rows[row], v_cols[col], "vert", "#000000"));
            i++;
        }
    }
    return segments;
}

function segment_change(segment) {
    update_segment(segment)
    segments = segments.filter(function( obj ) {
        return obj.id !== segment.id;
    });
    segments.push(segment);
    return segment;
}

function random_change() {
    segment_list = segments.filter(function (seg) {
      return seg.type == "horiz" ||
             seg.type == "vert";
    });
    segment = segment_list[Math.floor(Math.random() * segment_list.length)]
    if (segment) {
        segment.color = colors[Math.floor(Math.random() * colors.length)]
        update_segment(segment)
        segments = segments.filter(function( obj ) {
            return obj.id !== segment.id;
        });
        segments.push(segment);
        return segment;
    }
    return;
}

function update_segment(segment) {
    // console.log(segment)
    var hw = hardware.SEGMENTS.filter(function (seg) {
      return seg.row == segment.row &&
             seg.col == segment.col;
    })[0];
    if (hw) {
        var hsv = convert.hex.hsv(segment.color.replace('#',''))
        // console.log(hsv);
        var url = 'http://' + hw.ip + '/arduino/segment/' + hw.strip + '/' + hw.seq + '/' + parseInt(hsv[0]) + '/' + parseInt(hsv[1]/100*255) + '/' + parseInt(hsv[2]/100*255) + '/0/'
        // console.log(url);
        request.get(url);
    };
}

function reset_all() {
    hardware.CONTROLLERS.forEach(function(ip) {
        var url = 'http://' + ip + '/arduino/off/0'
        request.get(url);
    });
}

exports.all_segments = all_segments;
exports.segment_change = segment_change;
exports.random_change = random_change;
