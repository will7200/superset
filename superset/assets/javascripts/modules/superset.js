import $ from 'jquery';
const Mustache = require('mustache');
const utils = require('./utils');
// vis sources
/* eslint camel-case: 0 */
import vizMap from '../../visualizations/main.js';
import axios from 'axios';
import {
  getExploreUrl
} from '../explorev2/exploreUtils';
import {
  applyDefaultFormData
} from '../explorev2/stores/store';

/* eslint wrap-iife: 0*/
const px = function() {
  let slice;

  function getParam(name) {
    /* eslint no-useless-escape: 0 */
    const formattedName = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + formattedName + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  function initFavStars() {
    const baseUrl = '/superset/favstar/';
    // Init star behavihor for favorite
    function show() {
      if ($(this).hasClass('selected')) {
        $(this).html('<i class="fa fa-star"></i>');
      } else {
        $(this).html('<i class="fa fa-star-o"></i>');
      }
    }
    $('.favstar')
      .attr('title', 'Click to favorite/unfavorite')
      .css('cursor', 'pointer')
      .each(show)
      .each(function() {
        let url = baseUrl + $(this).attr('class_name');
        const star = this;
        url += '/' + $(this).attr('obj_id') + '/';
        $.getJSON(url + 'count/', function(data) {
          if (data.count > 0) {
            $(star).addClass('selected').each(show);
          }
        });
      })
      .click(function() {
        $(this).toggleClass('selected');
        let url = baseUrl + $(this).attr('class_name');
        url += '/' + $(this).attr('obj_id') + '/';
        if ($(this).hasClass('selected')) {
          url += 'select/';
        } else {
          url += 'unselect/';
        }
        $.get(url);
        $(this).each(show);
      })
      .tooltip();
  }
  const Slice = function(data, controller) {
    let timer;
    const token = $('#token_' + data.slice_id);
    const containerId = 'con_' + data.slice_id;
    const selector = '#' + containerId;
    const container = $(selector);
    const sliceId = data.slice_id;
    const drilldown = data.drilldown
    const formData = applyDefaultFormData(data.form_data);
    formData.extra = data.form_data.Formatextra ? data.form_data.Formatextra : null
    let dttm = 0;
    const stopwatch = function() {
      dttm += 10;
      const num = dttm / 1000;
      $('#timer').text(num.toFixed(2) + ' sec');
    };
    slice = {
      data,
      formData,
      container,
      containerId,
      selector,
      drilldown,
      querystring() {
        let qrystr = '';
        const parser = document.createElement('a');
        parser.href = jsonEndpoint;
        if (controller.type === 'dashboard') {
          parser.href = origJsonEndpoint;
          let flts = controller.effectiveExtraFilters(sliceId);
          flts = encodeURIComponent(JSON.stringify(flts));
          qrystr = parser.search + '&extra_filters=' + flts;
        } else if ($('#query').length === 0) {
          qrystr = parser.search;
        } else {
          qrystr = '?' + $('#query').serialize();
        }
        return qrystr;
      },
      getNextquery() {
        let qrystr = ''
        if (this.drilldown != null) {
          var level = this.currentLevel();
          level += 1;
          var url = Object.assign({}, this.drilldown[level]);
          if (this.formData.drillWhere) {
            url.where += this.formData.drillWhere;
          }
          let flts = controller.effectiveExtraFilters(sliceId);
          if (flts) {
            url.extra_filters = flts;
          }
          url = getExploreUrl(url, 'json');
          const parser = document.createElement('a');
          parser.href = url;
          qrystr = parser.pathname + parser.search;
        }
        return qrystr
      },
      getWidgetHeader() {
        return this.container.parents('div.widget').find('.chart-header');
      },
      render_template(s) {
        const context = {
          width: this.width,
          height: this.height,
        };
        return Mustache.render(s, context);
      },
      jsonEndpoint() {
        return this.endpoint('json');
      },
      endpoint(endpointType = 'json') {
        let formDataExtra
        let flts
        if (this.drilldown != null & this.currentLevel() != -1) {
          formDataExtra = Object.assign({}, this.drilldown[this.currentLevel()]);
          flts = controller.drillDownFilters(sliceId);
          if (this.formData.drillWhere) {
            formDataExtra.where += this.formData.drillWhere;
          }
          if ("all_columns" in formDataExtra && formDataExtra.all_columns.length > 1) {
            const removeCols = controller.excludeDrillDownCol(sliceId);
            let newCols = []
            formDataExtra.all_columns.map(column => {
              if (!(column in removeCols)) newCols.push(column)
            });
            formDataExtra.all_columns = newCols
          }
        } else {
          formDataExtra = Object.assign({}, formData);
          flts = controller.effectiveExtraFilters(sliceId);
        }
        if (flts) {
          formDataExtra.extra_filters = flts;
        }
        let endpoint = getExploreUrl(formDataExtra, endpointType, this.force);
        if (endpoint.charAt(0) !== '/') {
          // Known issue for IE <= 11:
          // https://connect.microsoft.com/IE/feedbackdetail/view/1002846/pathname-incorrect-for-out-of-document-elements
          endpoint = '/' + endpoint;
        }
        return endpoint;
      },
      d3format(col, number) {
        // uses the utils memoized d3format function and formats based on
        // column level defined preferences
        if (data.column_formats) {
          const format = data.column_formats[col];
          return utils.d3format(format, number);
        }
        return utils.d3format('.3s', number);
      },
      /* eslint no-shadow: 0 */
      always(data) {
        clearInterval(timer);
        $('#timer').removeClass('btn-warning');
        if (data && data.query) {
          slice.viewSqlQuery = data.query;
        }
      },
      done(payload) {
        Object.assign(data, payload);

        clearInterval(timer);
        token.find('img.loading').hide();
        container.fadeTo(0.5, 1);
        container.show();

        $('#timer').addClass('label-success');
        $('#timer').removeClass('label-warning label-danger');
        $('.query-and-save button').removeAttr('disabled');
        this.always(data);
        controller.done(this);
      },
      getErrorMsg(xhr) {
        if (xhr.statusText === 'timeout') {
          return 'The request timed out';
        }
        let msg = '';
        if (!xhr.responseText) {
          const status = xhr.status;
          msg += 'An unknown error occurred. (Status: ' + status + ')';
          if (status === 0) {
            // This may happen when the worker in gunicorn times out
            msg += ' Maybe the request timed out?';
          }
        }
        return msg;
      },
      error(msg, xhr) {
        let errorMsg = msg;
        token.find('img.loading').hide();
        container.fadeTo(0.5, 1);
        let errHtml = '';
        let o;
        try {
          o = JSON.parse(msg);
          if (o.error) {
            errorMsg = o.error;
          }
        } catch (e) {
          // pass
        }
        errHtml = `<div class="alert alert-danger">${errorMsg}</div>`;
        if (xhr) {
          const extendedMsg = this.getErrorMsg(xhr);
          if (extendedMsg) {
            errHtml += `<div class="alert alert-danger">${extendedMsg}</div>`;
          }
        }
        container.html(errHtml);
        container.show();
        $('span.query').removeClass('disabled');
        $('#timer').addClass('btn-danger');
        $('.query-and-save button').removeAttr('disabled');
        this.always(o);
        controller.error(this);
      },
      clearError() {
        $(selector + ' div.alert').remove();
      },
      width() {
        return token.width();
      },
      height() {
        let others = 0;
        const widget = container.parents('.widget');
        const sliceDescription = widget.find('.slice_description');
        if (sliceDescription.is(':visible')) {
          others += widget.find('.slice_description').height() + 25;
        }
        others += widget.find('.chart-header').height();
        return widget.height() - others - 10;
      },
      bindResizeToWindowResize() {
        let resizeTimer;
        const slice = this;
        $(window).on('resize', function() {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(function() {
            slice.resize();
          }, 500);
        });
      },
      render(force) {
        if (force === undefined) {
          this.force = false;
        } else {
          this.force = force;
        }
        token.find('img.loading').show();
        container.fadeTo(0.5, 0.25);
        container.css('height', this.height());
        dttm = 0;
        timer = setInterval(stopwatch, 10);
        $('#timer').removeClass('label-danger label-success');
        $('#timer').addClass('label-warning');
        $.getJSON(this.jsonEndpoint(), queryResponse => {
          try {
            let newslice = Object.assign({}, this);
            let formData = this.currentLevel() == -1 ? this.formData : this.drilldown[this.currentLevel()]
            newslice.formData = formData;
            vizMap[formData.viz_type](newslice, queryResponse);
            this.done(queryResponse);
          } catch (e) {
            console.log(e)
            this.error('An error occurred while rendering the visualization: ' + e);
          }
        }).fail(err => {
          this.error(err.responseText, err);
        });
      },
      renderNext(node) {
        var that = this
        if (this.drilldown === undefined | this.drilldown === null) {
          return
        }
        if (Object.keys(this.drilldown).length == this.currentLevel() + 1) {
          return
        }
        axios.get(this.getNextquery())
          .then(function(response) {
            try {
              let newslice = Object.assign({}, that);
              let formData = that.drilldown[that.currentLevel() + 1]
              if (node != null) {
                newslice.selector = node;
                newslice.container = $(node)
                newslice.width = function() {
                  return window.innerWidth - 200
                }
                newslice.height = function() {
                  return window.innerHeight - 200
                }
              }
              newslice.formData = formData;
              vizMap[formData.viz_type](newslice, response.data);
            } catch (e) {
              console.log(e)
              that.error('An error occurred while rendering the visualization: ' + e);
            }
          })
          .catch(function(error) {
            console.log(error);
          });
      },
      resize() {
        this.render();
      },
      addFilter(col, vals, merge = true, refresh = true) {
        controller.addFilter(sliceId, col, vals, merge, refresh);
      },
      adddrillDown(col, vals, merge = true, refresh = true) {
        controller.adddrillDown(sliceId, col, vals, merge);
        this.render();
      },
      drill(level) {
        controller.drill(sliceId, level);
        this.render()
      },
      currentLevel() {
        return controller.currentLevel(sliceId);
      },
      DrillLinks() {
        return controller.readDrillDowns(sliceId);
      },
      hasNext() {
        if (this.drilldown === undefined | this.drilldown === null) {
          return false
        }
        if (Object.keys(this.drilldown).length == this.currentLevel() + 1) {
          return false
        }
        return true;
      },
      setFilter(col, vals, refresh = true) {
        controller.setFilter(sliceId, col, vals, refresh);
      },
      getFilters() {
        return controller.filters[sliceId];
      },
      clearFilter() {
        controller.clearFilter(sliceId);
      },
      removeFilter(col, vals) {
        controller.removeFilter(sliceId, col, vals);
      },
    };
    return slice;
  };
  // Export public functions
  return {
    getParam,
    initFavStars,
    Slice,
  };
}();
module.exports = px;
