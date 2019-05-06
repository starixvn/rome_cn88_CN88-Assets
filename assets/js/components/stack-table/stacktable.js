/**
 * stacktable.js
 * Author & copyright (c) 2012: John Polacek
 * CardTable by: Justin McNally (2015)
 * MIT license
 *
 * Page: http://johnpolacek.github.com/stacktable.js
 * Repo: https://github.com/johnpolacek/stacktable.js/
 *
 * jQuery plugin for stacking tables on small screens
 * Requires jQuery version 1.7 or above
 *
 */
; (function ($) {
    $.fn.cardtable = function (options) {
        var $tables = this,
            defaults = { headIndex: 0 },
            settings = $.extend({}, defaults, options),
            headIndex;

        // checking the "headIndex" option presence... or defaults it to 0
        if (options && options.headIndex)
            headIndex = options.headIndex;
        else
            headIndex = 0;

        return $tables.each(function () {
            var $table = $(this);
            if ($table.hasClass('stacktable')) {
                return;
            }
            var table_css = $(this).prop('class');
            var $stacktable = $('<div></div>');
            if (typeof settings.myClass !== 'undefined') $stacktable.addClass(settings.myClass);
            var markup = '';
            var $caption, $topRow, headMarkup, bodyMarkup, tr_class;

            $table.addClass('stacktable large-only');

            $caption = $table.find(">caption").clone();
            $topRow = $table.find('>thead>tr,>tbody>tr,>tfoot>tr,>tr').eq(0);

            // avoid duplication when paginating
            $table.siblings().filter('.small-only').remove();

            // using rowIndex and cellIndex in order to reduce ambiguity
            $table.find('>tbody>tr').each(function () {

                // declaring headMarkup and bodyMarkup, to be used for separately head and body of single records
                headMarkup = '';
                bodyMarkup = '';
                tr_class = $(this).prop('class');
                // for the first row, "headIndex" cell is the head of the table
                // for the other rows, put the "headIndex" cell as the head for that row
                // then iterate through the key/values
                $(this).find('>td,>th').each(function (cellIndex) {
                    if ($(this).html() !== '') {
                        bodyMarkup += '<tr class="' + tr_class + '">';
                        if ($topRow.find('>td,>th').eq(cellIndex).html()) {
                            bodyMarkup += '<td class="st-key">' + $topRow.find('>td,>th').eq(cellIndex).html() + '</td>';
                        } else {
                            bodyMarkup += '<td class="st-key"></td>';
                        }
                        bodyMarkup += '<td class="st-val ' + $(this).prop('class') + '">' + $(this).html() + '</td>';
                        bodyMarkup += '</tr>';
                    }
                });

                markup += '<table class=" ' + table_css + ' stacktable small-only"><tbody>' + headMarkup + bodyMarkup + '</tbody></table>';
            });

            $table.find('>tfoot>tr>td').each(function (rowIndex, value) {
                if ($.trim($(value).text()) !== '') {
                    markup += '<table class="' + table_css + ' stacktable small-only"><tbody><tr><td>' + $(value).html() + '</td></tr></tbody></table>';
                }
            });

            $stacktable.prepend($caption);
            $stacktable.append($(markup));
            $table.before($stacktable);
        });
    };

    $.fn.stacktable = function (options) {
        var $tables = this,
            defaults = { displayHeader: true, disabledHeaderRow: true, topIndex: 0 },
            settings = $.extend({}, defaults, options);

        return $tables.each(function () {
            $table = $(this);
            var table_css = $(this).prop('class');
            var $stacktable = $('<table class="' + table_css + ' stacktable small-only" id="' + $table.attr('id') + '-stack"><thead></thead><tbody></tbody></table>');
            if (typeof settings.myClass !== 'undefined') $stacktable.addClass(settings.myClass);
            var markup = '';
            var fixColumnMarkup = '';
            var $table, $topRow, bodyMarkup, tr_class, displayHeader,totalOfThNoStack,totalOfTh;


            $table.addClass('stacktable large-only');
            $topRow = $table.find('>thead>tr,>tbody>tr,>tfoot>tr').eq(settings.topIndex);
            totalOfThNoStack = $topRow.find("th[data-stack-column!=true]").length + 1;
            totalOfTh = $topRow.find("th").length;


            displayHeader = $table.data('display-header') === undefined ? settings.displayHeader : $table.data('display-header');

            // using rowIndex and cellIndex in order to reduce ambiguity
            $table.find('>tbody>tr, >thead>tr').each(function (rowIndex) {

                var $tr = $(this),
                    isTHead = $tr.parent().is('thead');
                // declaring headMarkup and bodyMarkup, to be used for separately head and body of single records
                bodyMarkup = '';
                tr_class = $tr.prop('class');

                // for the first row, "headIndex" cell is the head of the table
                if (rowIndex === 0) {
                    // the main heading goes into the markup variable
                    if (displayHeader) {
                        var tableHeader = $($table.find("thead")[0].outerHTML);
                        tableHeader.find("th[data-stack-column=true]").remove();
                        tableHeader.find("tr").append('<th></th>');
                        //$stacktable.prepend($caption);
                        $stacktable.find('thead').html(tableHeader.html());
                    }
                } else {
                    if (!isTHead) {
                        // for the other rows, put the "headIndex" cell as the head for that row
                        // then iterate through the key/values
                        $(this).find('>td').each(function (cellIndex) {
                            var me = $(this);
                            var currentHtml = me.html();
                            var sourceCell = $topRow.find('>td,>th').eq(cellIndex);
                            var isStackColumn = sourceCell.attr('data-stack-column') === 'true';
                            var currentColSpan = parseInt(me.attr('colspan'));

                            if (currentColSpan === totalOfTh) {
                                markup += '<tr class="' + tr_class + '">'
                                    + '<td class="st-val ' + me.prop('class') + '" colspan="' + currentColSpan + '">'
                                    + currentHtml
                                    + '</td></tr>';
                            }
                            else {
                                if (!isStackColumn) {
                                    fixColumnMarkup += '<td class="fix-column">' + currentHtml + '</td>';
                                } else {
                                    if (currentHtml !== '') {
                                        bodyMarkup += '<tr class="' + tr_class + ' stack-row stack-row-' + rowIndex + '">';
                                        //if (sourceCell.html()) {
                                        //    bodyMarkup += '<td class="st-key">' + sourceCell.html() + '</td>';
                                        //} else {
                                        //    bodyMarkup += '<td class="st-key"></td>';
                                        //}

                                        bodyMarkup +=
                                            '<td class="st-val ' + me.prop('class') + '" colspan="' + totalOfThNoStack + '">'
                                            + '<span class="st-cell-label">'
                                            + sourceCell.html()
                                            + '</span>'
                                            + '<span class="st-cell-value">'
                                            + currentHtml
                                            + '</span>'
                                            + '</td>';
                                        bodyMarkup += '</tr>';
                                    }
                                }
                            }
                        });

                        if (bodyMarkup !== '') {
                            markup += '<tr class="fixed-row">'
                                + fixColumnMarkup
                                + '<td data-stack-row='
                                + rowIndex
                                + '>'
                                + '<span class="btn-collapse-expanse icon-collapse" />'
                                + '</td>'
                                + '</tr >'
                                + bodyMarkup;
                        }
                        fixColumnMarkup = '';
                    }
                }
            });


            $stacktable.append($(markup));
            $stacktable.find('.stack-row').hide();
            $table.before($stacktable);

            var $stackTableElement = $('#' + $table.attr('id') + '-stack');
            
            $stackTableElement
                .find('.btn-collapse-expanse')
                .off('click.stack')
                .on('click.stack', function () {
                    var me = $(this);
                    var rowIndex = me.parent().attr('data-stack-row');
                    var isCollapsed = me.hasClass('icon-collapse');
                    var $nextRows = $stackTableElement.find('.stack-row-' + rowIndex);

                    if (isCollapsed) {
                        me.removeClass('icon-collapse')
                            .addClass('icon-expanse');
                        $nextRows.show(200);
                    }
                    else {
                        me.removeClass('icon-expanse')
                            .addClass('icon-collapse');
                        $nextRows.hide(200);
                    }
                });
        });
    };

    $.fn.stackcolumns = function (options) {
        var $tables = this,
            defaults = {},
            settings = $.extend({}, defaults, options);

        return $tables.each(function () {
            var $table = $(this);
            var $caption = $table.find(">caption").clone();
            var num_cols = $table.find('>thead>tr,>tbody>tr,>tfoot>tr').eq(0).find('>td,>th').length; //first table <tr> must not contain colspans, or add sum(colspan-1) here.
            if (num_cols < 3) //stackcolumns has no effect on tables with less than 3 columns
                return;

            var $stackcolumns = $('<table class="stacktable small-only"></table>');
            if (typeof settings.myClass !== 'undefined') $stackcolumns.addClass(settings.myClass);
            $table.addClass('stacktable large-only');
            var tb = $('<tbody></tbody>');
            var col_i = 1; //col index starts at 0 -> start copy at second column.

            while (col_i < num_cols) {
                $table.find('>thead>tr,>tbody>tr,>tfoot>tr').each(function (index) {
                    var tem = $('<tr></tr>'); // todo opt. copy styles of $this; todo check if parent is thead or tfoot to handle accordingly
                    if (index === 0) tem.addClass("st-head-row st-head-row-main");
                    var first = $(this).find('>td,>th').eq(0).clone().addClass("st-key");
                    var target = col_i;
                    // if colspan apply, recompute target for second cell.
                    if ($(this).find("*[colspan]").length) {
                        var i = 0;
                        $(this).find('>td,>th').each(function () {
                            var cs = $(this).attr("colspan");
                            if (cs) {
                                cs = parseInt(cs, 10);
                                target -= cs - 1;
                                if ((i + cs) > col_i) //out of current bounds
                                    target += i + cs - col_i - 1;
                                i += cs;
                            } else {
                                i++;
                            }

                            if (i > col_i)
                                return false; //target is set; break.
                        });
                    }
                    var second = $(this).find('>td,>th').eq(target).clone().addClass("st-val").removeAttr("colspan");
                    tem.append(first, second);
                    tb.append(tem);
                });
                ++col_i;
            }

            $stackcolumns.append($(tb));
            $stackcolumns.prepend($caption);
            $table.before($stackcolumns);
        });
    };

}(jQuery));
