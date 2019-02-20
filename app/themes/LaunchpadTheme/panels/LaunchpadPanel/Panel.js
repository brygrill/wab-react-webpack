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

define(['dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/on',
  'dojo/dom-style',
  'dojo/dom-class',
  'dojo/dom-construct',
  'dojo/dom-geometry',
  'dojo/mouse',
  'dojo/_base/fx',
  'dojo/fx',
  'dojo/dnd/move',
  'dojo/Deferred',
  'dojox/layout/ResizeHandle',
  'jimu/utils',
  'jimu/BaseWidgetPanel',
  'dijit/_TemplatedMixin',
  'dojo/text!./Panel.html'
],
function(declare, lang, on, domStyle, domClass, domConstruct, domGeometry, mouse,
  baseFx, coreFx, Move, Deferred, ResizeHandle, utils, BaseWidgetPanel, _TemplatedMixin, template) {
  /* global jimuConfig*/
  var DEFAULT_WIDTH = 350, DEFAULT_HEIGHT = 480, MARGIN_LEFT = 50;

  return declare([BaseWidgetPanel, _TemplatedMixin], {
    baseClass: 'jimu-panel jimu-launchpad-panel',
    templateString: template,
    titleHeight: 33,
    normalPosition: null,
    lastWindowState: null,
    openAnimation: 'fadeIn',
    closeAnimation: 'fadeOut',
    animationDuration: 400,
    _device: 'desktop', // 'desktop' or 'mobile'

    postCreate: function(){
      this.inherited(arguments);

      this._makeOriginalBox();
      domStyle.set(this.colorfulHeader, 'background-color',
        this.config.backgroundColor || '#FFFFFF');

      this.own(on(this.iconNode, mouse.enter, lang.hitch(this, function(){
        if (this.windowState === 'minimized') {
          this.disableMoveable();
        }
      })));
      this.own(on(this.iconNode, mouse.leave, lang.hitch(this, function(){
        if (this.windowState === 'minimized') {
          this.makeMoveable(this.domNode, 40, 40);
        }
      })));
      this.own(on(this.iconNode, 'click', lang.hitch(this, function(){
        if (this.windowState === 'minimized') {
          this.panelManager.normalizePanel(this);
          domStyle.set(this.domNode, 'overflow', 'visible');
        }
      })));
    },

    startup: function(){
      this.inherited(arguments);

      this.panelManager.normalizePanel(this);
    },

    _makeOriginalBox: function() {
      this._originalBox = {
        w: this.position.width || DEFAULT_WIDTH,
        h: this.position.height || DEFAULT_HEIGHT,
        l: this.position.left || 0,
        t: this.position.top || 0
      };
    },

    makeMoveable: function(handleNode, width, tolerance) {
      this.disableMoveable();
      var containerBox = this._getLayoutBox();
      containerBox.l = containerBox.l - width + tolerance;
      containerBox.w = containerBox.w + 2 * (width - tolerance);

      this.moveable = new Move.boxConstrainedMoveable(this.domNode, {
        box: containerBox,
        handle: handleNode || this.titleNode,
        within: true
      });
      this.own(on(this.moveable, 'MoveStart', lang.hitch(this, this.onMoveStart)));
      this.own(on(this.moveable, 'Moving', lang.hitch(this, this.onMoving)));
      this.own(on(this.moveable, 'MoveStop', lang.hitch(this, this.onMoveStop)));
    },

    disableMoveable: function() {
      if (this.moveable) {
        this.moveable.destroy();
        this.moveable = null;
      }
    },

    makeResizable: function() {
      this.disableResizable();
      this.resizeHandle = new ResizeHandle({
        targetId: this,
        minWidth: this._originalBox.w,
        minHeight: this._originalBox.h,
        activeResize: false
      }).placeAt(this.domNode);
      this.resizeHandle.startup();
    },

    disableResizable: function() {
      if (this.resizeHandle) {
        this.resizeHandle.destroy();
        this.resizeHandle = null;
      }
    },

    onMoveStart: function(mover){
      if(window.isRTL){
        var containerBox = this._getLayoutBox(),
            domBox = domGeometry.getMarginBox(this.domNode),
            rightPx = domStyle.get(mover.node, 'right');
        domStyle.set(mover.node, 'left',
            (containerBox.w - domBox.w - parseInt(rightPx, 10)) + 'px');
        domStyle.set(mover.node, 'right', '');
      }
    },

    onMoving: function(){
      domStyle.set(this.domNode, 'opacity', 0.9);
    },

    onMoveStop: function(){
      var panelBox;

      domStyle.set(this.domNode, 'opacity', 1);
      panelBox = domGeometry.getMarginBox(this.domNode);
      this.position.left = panelBox.l;
      this.position.top = panelBox.t;
    },

    _getLayoutBox: function() {
      //This panel's position always relates to map.
      return domGeometry.getMarginBox(jimuConfig.mapId);
    },

    _onMinNodeClick: function(){
      this.panelManager.minimizePanel(this);
      domStyle.set(this.domNode, 'overflow', 'hidden');
    },

    _onMaxNodeClick: function(){
      if(this.windowState === 'normal') {
        this.panelManager.maximizePanel(this);
        domClass.add(this.maxNode, 'maximized');
      } else if(this.windowState === 'maximized'){
        this.panelManager.normalizePanel(this);
        domClass.remove(this.maxNode, 'maximized');
      }
    },

    _onCloseBtnClicked: function(evt) {
      evt.stopPropagation();
      this.panelManager.closePanel(this, 'wipe');
    },

    _minimize: function(){
      this.disableMoveable();
      this.disableResizable();

      var def = new Deferred(), animArray = [];
      animArray.push(baseFx.animateProperty({
        node: this.domNode,
        properties: {
          height: 40,
          width: 40
        },
        duration: this.animationDuration,
        onEnd: lang.hitch(this, function(){
          domStyle.set(this.containerNode, 'display', 'none');
          domStyle.set(this.domNode, 'border-radius', '50%');
          domStyle.set(this.domNode, '-webkit-border-radius', '50%');
          this.makeMoveable(this.domNode, 40, 40);
        })
      }));
      animArray.push(baseFx.animateProperty({
        node: this.titleNode,
        properties: {
          height: 40,
          width: 40,
          'background-color': this.config.backgroundColor
        },
        duration: this.animationDuration,
        onEnd: lang.hitch(this, function(){
          domClass.remove(this.titleNode, 'jimu-main-background');
        })
      }));
      animArray.push(baseFx.animateProperty({
        node: this.iconNode,
        properties: {
          height: 20,
          width: 20
        },
        duration: this.animationDuration,
        onEnd: function(){
          def.resolve();
        }
      }));
      coreFx.combine(animArray).play();

      return def;
    },

    _maximize: function(){
      var box = this._getLayoutBox(), def = new Deferred();
      baseFx.animateProperty({
        node: this.domNode,
        properties: {
          top: 0,
          height: box.h,
          width: box.w
        },
        duration: this.animationDuration,
        onEnd: function(){
          def.resolve();
        }
      }).play();

      return def;
    },

    _normalize: function(){
      var box, width, def = new Deferred(), animArray = [];

      domStyle.set(this.containerNode, 'display', '');
      domStyle.set(this.domNode, 'border-radius', '');
      domStyle.set(this.domNode, '-webkit-border-radius', '');

      if(window.appInfo.isRunInMobile){
        box = this._getLayoutBox();
        width = box.w;
        animArray.push(baseFx.animateProperty({
          node: this.domNode,
          properties: {
            height: box.h / 2,
            width: width,
            left: 0,
            top: box.h / 2
          },
          duration: this.animationDuration,
          onEnd: function(){
            def.resolve();
          }
        }));
      }else{
        width = this.position.width;
        animArray.push(baseFx.animateProperty({
          node: this.domNode,
          properties: {
            height: this.position.height,
            width: width
          },
          duration: this.animationDuration,
          onEnd: function(){
            def.resolve();
          }
        }));
      }
      animArray.push(baseFx.animateProperty({
        node: this.titleNode,
        properties: {
          height: 30,
          width: width
        },
        duration: this.animationDuration,
        onEnd: lang.hitch(this, function(){
          domStyle.set(this.titleNode, 'background-color', '');
          domStyle.set(this.titleNode, 'width', '100%');
          domClass.add(this.titleNode, 'jimu-main-background');
        })
      }));
      animArray.push(baseFx.animateProperty({
        node: this.iconNode,
        properties: {
          height: 16,
          width: 16
        },
        duration: this.animationDuration
      }));

      coreFx.combine(animArray).play();
      return def;
    },

    _setPositionStyle: function(pos){
      var style;

      if(this.position.zIndex){
        pos.zIndex = this.position.zIndex;
      }
      this.position.left = pos.left;
      this.position.top = pos.top;
      this.position.width = pos.width;
      this.position.height = pos.height;

      style = utils.getPositionStyle(pos);
      lang.mixin(style, pos.borderRadiusStyle);
      domStyle.set(this.domNode, style);
    },

    onWindowResize: function(){
      var position = {}, box;

      if(this.windowState === 'minimized'){
        return; //do nothing if panel is minimized.
      }

      if(window.appInfo.isRunInMobile){
        box = this._getLayoutBox();

        if(this.windowState === 'maximized'){
          position.top = 0;
          position.height = box.h;
        }else{
          position.top = box.h / 2;
          position.height = box.h / 2;
        }

        domStyle.set(this.domNode, {
          left: 0,
          top: position.top + 'px',
          right: 0,
          height: position.height + 'px',
          width: 'auto'
        });
        this.resize();
        if(this._device !== 'mobile'){
          this._device = 'mobile';
          this._onResponsible();
        }
      }else{
        if(this._device !== 'desktop'){
          this._device = 'desktop';
          position = lang.clone(this.position);
          this.setWindowState('normal');
          domStyle.set(this.domNode, {
            left: position.left + 'px',
            top: position.top + 'px',
            height: position.height + 'px',
            width: position.width + 'px'
          });
          this.resize();
          this._onResponsible();
        }
      }
    },

    /**
     * @override
     * @param {Object} position      contains these fields: left, top, width, height,
     * margin and index
     * @param {[type]} containerNode [description]
     */
    setPosition: function(position){
      var style, box, row, col, size;

      box = this._getLayoutBox();
      size = Math.floor(box.w / (position.width + position.margin));

      row = Math.floor(position.index / size);
      col = position.index % size;
      position.left = (row + 1) * position.margin + col * (position.width + position.margin) + MARGIN_LEFT;
      position.top -= position.margin * row;

      this.position = lang.clone(position);

      if(window.appInfo.isRunInMobile){
        position.left = 0;
        position.top = box.h / 2;
        position.width = box.w;
        position.height = box.h / 2;
      }

      style = utils.getPositionStyle(position);
      style.position = 'absolute';

      domConstruct.place(this.domNode, jimuConfig.mapId);
      domStyle.set(this.domNode, style);

      this._onResponsible();
    },

    /**
     * @override
     * @return {[type]} [description]
     */
    onNormalize: function(){
      this._normalize().then(lang.hitch(this, function(){
        domStyle.set(this.iconNode, 'cursor', 'default');
        domClass.remove(this.domNode, 'minimized');
        domClass.remove(this.domNode, 'maximized');

        this.resize();
        this._onResponsible();
      }));
    },

    /**
     * @override
     * @return {[type]} [description]
     */
    onMinimize: function(){
      this.inherited(arguments);
      this._minimize().then(lang.hitch(this, function(){
        domStyle.set(this.iconNode, 'cursor', 'pointer');
        domClass.remove(this.domNode, 'maximized');
        domClass.add(this.domNode, 'minimized');
      }));
    },

    /**
     * Restore windowState to "normal" when user closes this panel
     * @return {[type]} [description]
     */
    onClose: function(){
      this.inherited(arguments);
      this.setWindowState('normal');
      this.onNormalize();
    },

    onMaximize: function(){
      this.inherited(arguments);
      this._maximize().then(lang.hitch(this, function(){
        domStyle.set(this.iconNode, 'cursor', 'default');
        domClass.remove(this.domNode, 'minimized');
        domClass.add(this.domNode, 'maximized');
        this.resize();
      }));
    },

    /**
     * @override
     * @return {[type]} [description]
     */
    resize: function(tmp) {
      var pos, style;

      if(!tmp){
        this.inherited(arguments);
        return;
      }

      pos = {
        left: tmp.l ? tmp.l : this.position.left,
        top: tmp.t ? tmp.t : this.position.top,
        width: tmp.w ? tmp.w : this.position.width,
        height: tmp.h ? tmp.h : this.position.height,
        zIndex: this.position.zIndex
      };

      this.position = pos;
      style = utils.getPositionStyle(this.position);
      if(window.isRTL && 'right' in style){
        style.left = style.right;
        style.right = '';
      }
      domStyle.set(this.domNode, style);

      this.inherited(arguments);
    },

    _onResponsible: function() {
      if(window.appInfo.isRunInMobile){
        if (this.windowState !== 'minimized') {
          this.disableMoveable();
        }
        this.disableResizable();
        domStyle.set(this.maxNode, 'display', '');
        domStyle.set(this.minNode, 'margin', '0 10px');
      } else {
        domStyle.set(this.maxNode, 'display', 'none');
        domStyle.set(this.minNode, 'margin', '');
        this.makeResizable();
        this.makeMoveable(this.titleLabelNode, this.position.width, this.position.width * 0.25);
      }
    }
  });
});
