///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2018 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/_base/html',
  'dojo/on',
  'dojo/dom-construct',
  'dojo/dom-style',
  'dojo/query',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'jimu/dijit/ViewStack',
  'jimu/utils'
],
function(
  declare, lang, array, html, on, domConstruct, domStyle,
  query, _WidgetBase, _TemplatedMixin, ViewStack, utils) {
  /* global jimuConfig */
  //label is not visible if node width is less than 80px, and icon should be scaled.
  var NORMAL_MIN_WIDTH = 60,
      NORMAL_WIDTH = 80, //node width should not be larger than this value.
      MIN_MARGIN = 20, //minimux margin between this dom and the map box.
      MIN_NODE_WIDTH = 10, //If node width is less than 10px, the node will not be visible.
      MAX_ROWCOL = 4,
      MIN_ROWCOL = 3;
  /**
   * @exports themes/LaunchpadTheme/widgets/AnchorBarController/PopupMoreNodes
   */
  return declare([_WidgetBase, _TemplatedMixin], {
    baseClass: 'jimu-anchorbar-more-pupup jimu-main-background',
    templateString: '<div><div class="pages" data-dojo-attach-point="pagesNode"></div>' +
      '<div class="points jimu-corner-bottom"><div class="points-inner"' +
      'data-dojo-attach-point="pointsNode"></div></div></div>',
    margin: 4,
    /**
     * Array of DockableItem
     * @type {Array}
     */
    nodes: [],
    forIcon: null,

    postCreate: function() {
      this.pages = [];
      this.createCloseBtn();
    },

    startup: function() {
      this.viewStack = new ViewStack({
        views: [],
        viewType: 'dom'
      }, this.pagesNode);
      this.viewStack.startup();
    },

    setForIcon: function(value){
      this.forIcon = value;
    },

    setNodes: function(newNodes){
      this.nodes = newNodes;
      this.oldGridParam = null;
      this.resize();
    },

    resize: function() {
      var gridParam = this._calculateGridParam(), closeDiv;
      if(gridParam !== null){
        html.setStyle(this.domNode, utils.getPositionStyle(gridParam.position));
        this.nodeWidth = gridParam.cellSize - this.margin;

        this.clearPages();
        this.createPages(gridParam);

        array.forEach(query('.icon-node', this.domNode), lang.hitch(this, function(node, i) {
          this.setItemNodePosition(node, i, gridParam);
        }));

        this.oldGridParam = gridParam;

        closeDiv = query('div.close', this.domNode)[0];
        html.setStyle(closeDiv, {
          width: this.nodeWidth * 0.25 + 'px',
          height: this.nodeWidth * 0.25 + 'px'
        });
      }else{
        this.oldGridParam = null;
        html.setStyle(this.domNode, utils.getPositionStyle({
          left:0,
          top:0,
          width:0,
          height:0,
          zIndex: 111
        }));
        this.nodeWidth = 0;
      }
    },

    setItemNodePosition: function(node, i, gridParam) {
      var ml, mt; //margin-left, margin-top

      if (i % gridParam.cols === 0) {
        ml = 0;
      } else {
        ml = this.margin / 2;
      }

      // If the node is in the first row of each page, margin-top is 0, else margin-top is 2
      if ((i % (gridParam.rows * gridParam.cols)) < gridParam.cols) {
        mt = 0;
      } else {
        mt = this.margin / 2;
      }

      var nodeStyle = {};
      if (typeof this.nodeWidth === "number") {
        nodeStyle.width = this.nodeWidth + 'px';
        nodeStyle.height = this.nodeWidth + 'px';
      }
      if (typeof ml === 'number') {
        if (window.isRTL){
          nodeStyle.marginRight = ml + 'px';
        }else {
          nodeStyle.marginLeft = ml + 'px';
        }
      }
      if (typeof mt === 'number') {
        nodeStyle.marginTop = mt + 'px';
      }

      html.setStyle(node, nodeStyle);
    },

    clearPages: function(){
      array.forEach(this.pages, function(page){
        this.viewStack.removeView(page.pageNode);
      }, this);

      domConstruct.empty(this.pointsNode);
      this.pages = [];
    },

    /**
     * Create node pages based on the gridParam object.
     * @param  {object} gridParam include rows:number, cols:number, cellSize:number,
     * iconScaled:boolean, showLabel:boolean,
     * position:object(left, right, top, bottom, width, height)
     */
    createPages: function(gridParam) {
      var count, pages, p, pageNode, pointNode;
      count = this.nodes.length;
      pages = Math.ceil(count / (gridParam.rows * gridParam.cols));
      for (p = 0; p < pages; p++) {
        pageNode = domConstruct.create('div', {
          'class': 'page'
        });
        this.createPageItems(p, pageNode, gridParam);
        this.viewStack.addView(pageNode);

        if (pages > 1) {
          pointNode = domConstruct.create('div', {
            'class': 'point'
          }, this.pointsNode);
          this.own(on(pointNode, 'click', lang.hitch(this, this._onPageNodeClick, p)));
        }

        this.pages.push({
          pageNode: pageNode,
          pointNode: pointNode
        });
      }

      if (this.viewStack.views.length > 0) {
        this._selectPage(0);
      }
    },

    _onPageNodeClick: function(p) {
      this._selectPage(p);
    },

    _selectPage: function(p) {
      if (this.pages.length > 1) {
        query('.point', this.domNode).removeClass('point-selected');
        html.addClass(this.pages[p].pointNode, 'point-selected');
      }
      this.viewStack.switchView(this.pages[p].pageNode);
    },

    createPageItems: function(page, pageNode, gridParam) {
      var count, pageSize, i, b, e, empty;
      count = this.nodes.length;
      pageSize = gridParam.rows * gridParam.cols;
      b = page * pageSize;
      e = (page + 1) * pageSize;
      empty = e - count;
      e = Math.min(e, count);
      for (i = b; i < e; i++) {
        this.createItemNode(i, pageNode);
      }
      for (i = count; i < count + empty; i++) {
        this.createEmptyItemNode(pageNode);
      }
    },

    createItemNode: function(i, pageNode) {
      var node, item, padding;
      item = this.nodes[i];
      node = domConstruct.create('div', {
        'class': 'icon-node jimu-float-leading'
      }, pageNode);

      padding = (this.nodeWidth - this.nodes[i].size) / 2;
      domStyle.set(this.nodes[i].domNode, {
        position: 'absolute',
        left: padding + 'px',
        top: padding + 'px',
        'margin-left': ''
      });

      this.nodes[i].placeAt(node);
    },

    createEmptyItemNode: function(pageNode) {
      var node;
      node = domConstruct.create('div', {
        'class': 'icon-node jimu-float-leading'
      }, pageNode);
      return node;
    },

    createCloseBtn: function() {
      var node;
      node = domConstruct.create('div', {
        'class': 'close'
      }, this.domNode);
      domConstruct.create('div', {
        'class': 'close-inner'
      }, node);

      on(node, 'click', lang.hitch(this, function() {
        this.hide();
      }));

      return node;
    },

    hide: function() {
      html.setStyle(this.domNode, 'display', 'none');
      if(this.forIcon){
        this.forIcon.setOpened(false);
      }
    },

    show: function() {
      html.setStyle(this.domNode, 'display', 'block');
    },

    _calculateGridParam: function(){
      var mapBox, minLen, position, rows, cols, cellSize, iconScaled = false,
          showLabel = true;
      mapBox = html.getContentBox(jimuConfig.mapId);
      minLen = Math.min(mapBox.w, mapBox.h) - MIN_MARGIN * 2;

      //calculate node width
      if(minLen >= NORMAL_WIDTH * MIN_ROWCOL){
        cellSize = NORMAL_WIDTH;
      }else{
        cellSize = Math.floor(minLen / MIN_ROWCOL);

        if(cellSize < MIN_NODE_WIDTH){
          return null;
        }

        iconScaled = true;

        if(cellSize < NORMAL_MIN_WIDTH){
          showLabel = false;
        }
      }

      //calculate rows and columns
      rows = Math.floor((mapBox.h - MIN_MARGIN * 2) / cellSize);
      cols = Math.floor((mapBox.w - MIN_MARGIN * 2) / cellSize);
      rows = rows > MAX_ROWCOL ? MAX_ROWCOL : rows;
      cols = cols > MAX_ROWCOL ? MAX_ROWCOL : cols;
      rows = rows < MIN_ROWCOL ? MIN_ROWCOL : rows;
      cols = rows < MIN_ROWCOL ? MIN_ROWCOL : cols;

      //calculate position
      position = {
        top: (mapBox.h - cellSize * rows) / 2,
        bottom: (mapBox.h - cellSize * rows) / 2,
        left: (mapBox.w - cellSize * cols) / 2,
        right: (mapBox.w - cellSize * cols) / 2,
        width: cellSize * cols - this.margin * (cols - 1) / 2,
        height: cellSize * rows - this.margin * (rows - 1) / 2,
        zIndex: 111
      };

      return {
        rows: rows,
        cols: cols,
        cellSize: cellSize,
        iconScaled: iconScaled,
        showLabel: showLabel,
        position: position
      };
    }
  });
});
