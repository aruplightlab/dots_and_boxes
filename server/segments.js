var request = require('request-promise-lite')
var hardware = require('./hardware');
var segments = [];

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
    }

    var i = 0;

    var h_rows = [0, 2, 4, 6, 8]
    var h_cols = [0, 1, 2, 3, 4, 5, 6]
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

function update_segment(segment) {
    var hw = hardware.SEGMENTS.filter(function (seg) {
      return seg.row == segment.row &&
             seg.col == segment.col;
    })[0];
    if (hw) {
        var url = 'http://' + hw.ip + '/arduino/' + hw.strip + '/' + hw.seq + '/' + segment.color
        request.get(url);
    };
}

exports.all_segments = all_segments;
exports.segment_change = segment_change;