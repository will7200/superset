import d3 from 'd3';
import {fixDataTableBodyHeight} from '../javascripts/modules/utils';
import {timeFormatFactory, formatDate} from '../javascripts/modules/dates';
import moment from 'moment';

require('./table.css');
const $ = require('jquery');

require('datatables-bootstrap3-plugin/media/css/datatables-bootstrap3.css');
import 'datatables.net';
import dt from 'datatables.net-bs';
dt(window, $);

function tableVis(slice, payload) {
    let container
    container = $(slice.selector)
    const fC = d3.format('0,000');
    let timestampFormatter;
    var data = payload.data;
    const fd = slice.formData;
    // Removing metrics (aggregates) that are strings
    let metrics = fd.metrics || [];
    metrics = metrics.filter(m => !isNaN(data.records[0][m]));

    function col(c) {
        const arr = [];
        for (let i = 0; i < data.records.length; i++) {
            arr.push(data.records[i][c]);
        }
        return arr;
    }
    const maxes = {};
    for (let i = 0; i < metrics.length; i++) {
        maxes[metrics[i]] = d3.max(col(metrics[i]));
    }

    if (fd.table_timestamp_format === 'smart_date') {
        timestampFormatter = formatDate;
    } else if (fd.table_timestamp_format !== undefined) {
        timestampFormatter = timeFormatFactory(fd.table_timestamp_format);
    }

    const div = d3.select(slice.selector);
    div.html('');
    const table = div.append('table').classed('dataframe dataframe table table-striped table-bordered ' +
    'table-condensed table-hover dataTable no-footer',
    true).attr('width', '100%');

    table.append('thead').append('tr').selectAll('th').data(data.columns).enter().append('th').text(function(d) {
        return d;
    });

    table.append('tbody').selectAll('tr').data(data.records).enter().append('tr').selectAll('td').data(row => data.columns.map(c => {
        let val = row[c];
        let html;
        const isMetric = metrics.indexOf(c) >= 0;
        if(moment(val,'YYYY-MM-DDTHH:mm:ss.SSSSSS',true).isValid()){
            val = val.slice(0,val.length-7)
        }
        if (c === 'timestamp' || moment(val,'YYYY-MM-DDTHH:mm:ss',true).isValid()) {
            html = timestampFormatter(val);
        } else if (typeof(val) === 'string' && val.length < 17) {
            html = `<span class="like-pre">${val}</span>`;
        } else if (typeof(val) === 'string' && val.length >= 17) {
            let t = val.substring(0, 17) + '...'
            html = `<span class="like-pre" data-toggle="tooltip" data-container="body" title="${val}">${t}</span>`
        }
        if (isMetric) {
            html = slice.d3format(c, val);
        }
        let isDrilldown = false;
        if (fd.drilldown_field != undefined) 
            fd.drilldown_field.forEach(function(item) {
                if (item == c) 
                    isDrilldown = true;
                }
            );
        return {col: c, val, html, isMetric, isDrilldown};
    })).enter().append('td').style('background-image', function(d) {
        if (d.isMetric) {
            const perc = Math.round((d.val / maxes[d.col]) * 100);
            return (`linear-gradient(to right, lightgrey, lightgrey ${perc}%, ` + `rgba(0,0,0,0) ${perc}%`);
        }
        return null;
    }).attr('title', (d) => {
        if (!isNaN(d.val)) {
            return fC(d.val);
        }
        return null;
    }).attr('data-sort', function(d) {
        return (d.isMetric)
            ? d.val
            : null;
    }).on('click', function(d) {
        if (!d.isMetric && fd.table_filter && d.isDrilldown) {
            const td = d3.select(this);
            //if (td.classed('filtered')) {
            //  slice.removeFilter(d.col, [d.val]);
            //  d3.select(this).classed('filtered', false);
            //} else {
            //  d3.select(this).classed('filtered', true);
            //  slice.addFilter(d.col, [d.val]);
            slice.adddrillDown(d.col, [d.val]);
        }
    }).style('cursor', function(d) {
        return (d.isDrilldown)
            ? 'pointer'
            : '';
    }).style('color', function(d) {
        return (d.isDrilldown)
            ? 'blue'
            : '';
    }).style('text-align', function(d) {
        let v = d.val
        if (v.replace) {
            v = v.replace(':', '')
        }
        return (!isNaN(parseFloat(v)) && isFinite(v))? 'center': '';
    }).html(d => d.html ? d.html : d.val);
    const height = slice.height();
    let paging = false;
    let pageLength;
    if (fd.page_length && fd.page_length > 0) {
        paging = true;
        pageLength = parseInt(fd.page_length, 10);
    }
    const datatable = container.find('.dataTable').DataTable({
        paging,
        pageLength,
        aaSorting: [],
        searching: fd.include_search,
        bInfo: false,
        scrollY: height + 'px',
        scrollCollapse: true,
        scrollX: true,
        dom: '<"top"fli>rt<"bottom"p><"clear">'
    });
    fixDataTableBodyHeight(container.find('.dataTables_wrapper'), height);
    // Sorting table by main column
    if (metrics.length > 0) {
        const mainMetric = metrics[0];
        datatable.column(data.columns.indexOf(mainMetric)).order('desc').draw();
    }
    container.parents('.widget').find('.tooltip').remove();
    container.tooltip({
        selector: '[data-toggle="tooltip"]'
    })
}

module.exports = tableVis;
