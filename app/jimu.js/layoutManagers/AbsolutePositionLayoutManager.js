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
  'dojo/topic',
  'dojo/on',
  'dojo/keys',
  'dojo/dom-construct',
  'dojo/dom-geometry',
  'dojo/promise/all',
  'dojo/when',
  '../WidgetManager',
  '../PanelManager',
  '../utils',
  '../dijit/LoadingShelter',
  './BaseLayoutManager'
],

function(declare, lang, array, html, topic, on, keys, domConstruct, domGeometry,
  all, when, WidgetManager, PanelManager, utils, LoadingShelter, BaseLayoutManager) {
  /* global jimuConfig:true */
  var instance = null, clazz;

  clazz = declare([BaseLayoutManager], {
    name: 'AbsolutePositionLayoutManager',

    constructor: function() {
      /*jshint unused: false*/
      this.widgetManager = WidgetManager.getInstance();
      this.panelManager = PanelManager.getInstance();

      topic.subscribe("changeMapPosition", lang.hitch(this, this.onChangeMapPosition));

      this.onScreenGroupPanels = [];
    },

    map: null,

    resize: function() {
      //resize widgets. the panel's resize is called by the panel manager.
      //widgets which is in panel is resized by panel
      array.forEach(this.widgetManager.getAllWidgets(), function(w) {
        if (w.inPanel === false) {
          w.resize();
        }
      }, this);
    },

    setMap: function(map){
      this.inherited(arguments);
      this.panelManager.setMap(map);
    },

    getMapDiv: function(){
      if(html.byId(this.mapId)){
        return html.byId(this.mapId);
      }else{
        return html.create('div', {
          id: this.mapId,
          style: lang.mixin({
            position: 'absolute',
            backgroundColor: '#EEEEEE',
            overflow: 'hidden',
            minWidth:'1px',
            minHeight:'1px'
          }, utils.getPositionStyle(this.appConfig.map.position))
        }, this.layoutId);
      }
    },

    loadAndLayout: function(appConfig){
      console.time('Load widgetOnScreen');
      this.setMapPosition(appConfig.map.position);

      var loading = new LoadingShelter(), defs = [];
      loading.placeAt(this.layoutId);
      loading.startup();

      this._setTabindex(appConfig);
      // topic.publish('tabIndexChanged', appConfig);//this line will change this.appConfig

      //load widgets
      defs.push(this.loadOnScreenWidgets(appConfig));

      //load groups
      array.forEach(appConfig.widgetOnScreen.groups, function(groupConfig) {
        defs.push(this._loadOnScreenGroup(groupConfig, appConfig));
      }, this);

      all(defs).then(lang.hitch(this, function(){
        if(loading){
          loading.destroy();
          loading = null;
        }
        console.timeEnd('Load widgetOnScreen');
        topic.publish('preloadWidgetsLoaded');
      }), lang.hitch(this, function(){
        if(loading){
          loading.destroy();
          loading = null;
        }
        //if error when load widget, let the others continue
        console.timeEnd('Load widgetOnScreen');
        topic.publish('preloadWidgetsLoaded');
      }));
    },

    _setTabindex: function(appConfig){
      var rtoWindowElements = [];
      var rtoMapElements = [];

      appConfig.visitElement(function(e, info){
        //the pool widgets tabindex will be handled by controller.
        if(!info.isOnScreen){
          return;
        }
        var pos = e.position || e.panel && e.panel.position;
        if(!pos){
          return;
        }
        if(pos.relativeTo === 'browser'){
          rtoWindowElements.push(e);
        }else{
          rtoMapElements.push(e);
        }
      });

      var layoutBox = domGeometry.getMarginBox(this.layoutId);
      var mapBox = domGeometry.getMarginBox(this.mapId);

      rtoWindowElements = rtoWindowElements.sort(lang.hitch(this, sortElements, layoutBox));
      //if splash widget is in this array, set it as first tabindex
      rtoWindowElements.sort(function(e1, e2){
        if(e1.name === 'Splash'){
          return -1;
        }else if(e2.name === 'Splash'){
          return 1;
        }else{
          return 0;
        }
      });

      rtoMapElements = rtoMapElements.sort(lang.hitch(this, sortElements, mapBox));

      var tabIndex = 1;
      rtoWindowElements.forEach(function(e){
        e.tabIndex = tabIndex;

        if(e.isController){
          tabIndex += 5000;
        }else{
          tabIndex += 200;
        }
      });

      html.setAttr(this.map.container, 'tabindex', tabIndex);
      html.setAttr(this.map.container, 'aria-label', window.jimuNls.gridLayout.mapArea);
      html.setAttr(this.map.container, 'role', 'application');

      //allow map's pan-action with arrow and support cancel-event
      this.own(on(this.map.container, 'keydown', lang.hitch(this, function(evt) {
        if(html.getAttr(evt.target, 'id') === 'map' && evt.keyCode === keys.ESCAPE){
          utils.trapToNextFocusContainer(this.map.container);
        }
      })));

      window.isMoveFocusFromMap = true;
      this.own(on(this.map.container, 'focus', lang.hitch(this, function(evt) {
        if(utils.isInNavMode() && html.getAttr(evt.target, 'id') === 'map'){
          //Go to the dom it should be focusing on when using screenReader-chrome&chromeVox
          //Tips: Chrome&chromeVox will focus first focusable node that tabindex > 0, not min-tabindex > 0
          var splashWidget = this.widgetManager.getWidgetsByName('Splash')[0];
          if(splashWidget && html.getStyle(splashWidget.domNode, 'display') !== 'none'){
            window.isMoveFocusFromMap = false;
            splashWidget.domNode.focus();
            return;
          }else if(window.currentMsgPopup && window.currentMsgPopup.firstFocusNode){
            window.isMoveFocusFromMap = false;
            window.currentMsgPopup.focusedNodeBeforeOpen = utils.trapToNextFocusContainer(this.map.container, true);
            window.currentMsgPopup.firstFocusNode.focus();
            return;
          }else if(window.isMoveFocusFromMap){
            window.isMoveFocusFromMap = false;
            utils.trapToNextFocusContainer(this.map.container, true);
            return;
          }

          var myTarget = document.getElementById("map_container");
          myTarget.addEventListener("mouseover", function(){});
          //simulate a hover event
          myTarget.simulateEvent = new MouseEvent('mouseover', {
            'view': window,
            'bubbles': true,
            'cancelable': true
          });
          this.map.isKeyboardNavigationOrigin = this.map.isKeyboardNavigation;
          var isTrue = myTarget.dispatchEvent(myTarget.simulateEvent);
          if(isTrue){
            this.map.enableKeyboardNavigation();
          }
        }
      })));
      this.own(on(this.map.container, 'blur', lang.hitch(this, function(evt) {
        if(utils.isInNavMode() && html.getAttr(evt.target, 'id') === 'map'){
          var myTarget = document.getElementById('map_container');
          myTarget.removeEventListener("mouseover", function(){});
          // this.map.disableKeyboardNavigation();
          //reset to original state
          if(!this.map.isKeyboardNavigationOrigin){
            this.map.disableKeyboardNavigation();
          }
        }
      })));


      tabIndex += 1000;

      rtoMapElements.forEach(function(e){
        if(e.inPanel){ //inPanel widgets only need tabindex to init icons
          e.tabIndexJimu = tabIndex;
        }else{
          e.tabIndex = tabIndex;
        }

        if(e.isController){
          tabIndex += 5000;
        }else{
          tabIndex += 200;
        }
      });

      function changePosition(pos, box){
        var widgetBox = {w: 100, h: 100};// hard code the widget box here for simple.

        if(!pos){
          return;
        }
        if(typeof pos.bottom !== 'undefined'){
          pos.top = box.h - pos.bottom - widgetBox.h;
          delete pos.bottom;
        }
        if(typeof pos.right !== 'undefined'){
          pos.left = box.w - pos.right - widgetBox.w;
          delete pos.right;
        }
      }

      //sort nodes by position, compare top and then left.
      function sortElements(box, e1, e2){
        var pos1 = lang.clone(e1.position || e1.panel && e1.panel.position);
        var pos2 = lang.clone(e2.position || e2.panel && e2.panel.position);

        //change position to x, y
        changePosition(pos1, box);
        changePosition(pos2, box);

        if(pos1.top === pos2.top){
          return pos1.left - pos2.left;
        }else{
          return pos1.top - pos2.top;
        }
      }
    },

    destroyOnScreenWidgetsAndGroups: function(){
      this.panelManager.destroyAllPanels();
      this.destroyOnScreenOffPanelWidgets();
      this.destroyWidgetPlaceholders();
      this.destroyOnScreenWidgetIcons();
    },

    ///seems this function is not used any more, leave it here for backward compatibility.
    openWidget: function(widgetId){
      //if widget is in group, we just ignore it

      //check on screen widgets, we don't check not-closeable off-panel widget
      array.forEach(this.onScreenWidgetIcons, function(widgetIcon){
        if(widgetIcon.configId === widgetId){
          widgetIcon.switchToOpen();
        }
      }, this);

      //check controllers
      array.forEach(this.widgetManager.getControllerWidgets(), function(controllerWidget){
        if(controllerWidget.widgetIsControlled(widgetId)){
          controllerWidget.setOpenedIds([widgetId]);
        }
      }, this);
    },

    /////////////functions to handle builder events
    onLayoutChange: function(appConfig){
      this._changeMapPosition(appConfig);

      //relayout placehoder
      array.forEach(this.widgetPlaceholders, function(placeholder){
        placeholder.moveTo(appConfig.getConfigElementById(placeholder.configId).position);
      }, this);

      //relayout icons
      array.forEach(this.onScreenWidgetIcons, function(icon){
        icon.moveTo(appConfig.getConfigElementById(icon.configId).position);
      }, this);

      //relayout paneless widget
      array.forEach(this.widgetManager.getOnScreenOffPanelWidgets(), function(widget){
        if(widget.closeable){
          //this widget position is controlled by icon
          return;
        }
        var position = appConfig.getConfigElementById(widget.id).position;
        widget.setPosition(position);
      }, this);

      //relayout groups
      array.forEach(this.onScreenGroupPanels, function(panel){
        var position = appConfig.getConfigElementById(panel.config.id).panel.position;
        panel.setPosition(position);
      }, this);
    },

    onWidgetChange: function(appConfig, widgetConfig){
      widgetConfig = appConfig.getConfigElementById(widgetConfig.id);

      this.onOnScreenWidgetChange(appConfig, widgetConfig);

      array.forEach(this.onScreenGroupPanels, function(panel){
        panel.reloadWidget(widgetConfig);
      }, this);

    },

    onGroupChange: function(appConfig, groupConfig){
      groupConfig = appConfig.getConfigElementById(groupConfig.id);

      if(groupConfig.isOnScreen){
        //for now, onscreen group can change widgets in it only
        this.panelManager.destroyPanel(groupConfig.id + '_panel');
        this.removeDestroyed(this.onScreenGroupPanels);
        this._loadOnScreenGroup(groupConfig, appConfig);
      }else{
        array.forEach(this.widgetManager.getControllerWidgets(), function(controllerWidget){
          if(controllerWidget.isControlled(groupConfig.id)){
            this.reloadControllerWidget(appConfig, controllerWidget.id);
          }
        }, this);

        array.forEach(this.panelManager.panels, function(panel){
          if(panel.config.id === groupConfig.id){
            panel.updateConfig(groupConfig);
          }
        }, this);
      }
    },

    onActionTriggered: function(info){
      if(info.action === 'highLight'){
        array.forEach(this.widgetPlaceholders, function(placehoder){
          if(placehoder.configId === info.elementId){
            this._highLight(placehoder);
          }
        }, this);
        array.forEach(this.onScreenWidgetIcons, function(widgetIcon){
          if (widgetIcon.configId === info.elementId){
            this._highLight(widgetIcon);
          }
        }, this);
        array.forEach(this.widgetManager.getOnScreenOffPanelWidgets(), function(panelessWidget){
          if (panelessWidget.configId === info.elementId){
            this._highLight(panelessWidget);
          }
        }, this);
        array.forEach(this.onScreenGroupPanels, function(panel){
          if (panel.configId === info.elementId){
            this._highLight(panel);
          }
        }, this);
      }
      if(info.action === 'removeHighLight'){
        this._removeHighLight();
      }
      if(info.action === 'showLoading'){
        html.setStyle(jimuConfig.loadingId, 'display', 'block');
        html.setStyle(jimuConfig.mainPageId, 'display', 'none');
      }
      if(info.action === 'showApp'){
        html.setStyle(jimuConfig.loadingId, 'display', 'none');
        html.setStyle(jimuConfig.mainPageId, 'display', 'block');
      }
    },

    onChangeMapPosition: function(position) {
      var pos = lang.clone(this.mapPosition);
      lang.mixin(pos, position);
      this.setMapPosition(pos);
    },

    setMapPosition: function(position){
      this.mapPosition = position;

      var posStyle = utils.getPositionStyle(position);
      html.setStyle(this.mapId, posStyle);
      if (this.map && this.map.resize) {
        this.map.resize();
      }
    },

    getMapPosition: function(){
      return this.mapPosition;
    },

    _highLight: function(dijit){
      if(!dijit.domNode){
        //the dijit may be destroyed
        return;
      }
      if (this.hlDiv){
        this._removeHighLight(dijit);
      }
      var position = domGeometry.getMarginBox(dijit.domNode);
      var hlStyle = {
        position: 'absolute',
        left: position.l + 'px',
        top: position.t + 'px',
        width: position.w + 'px',
        height: position.h + 'px'
      };
      this.hlDiv = domConstruct.create('div', {
        "style": hlStyle,
        "class": 'icon-highlight'
      }, dijit.domNode, 'before');
    },

    _removeHighLight: function(){
      if (this.hlDiv){
        domConstruct.destroy(this.hlDiv);
        this.hlDiv = null;
      }
    },

    _changeMapPosition: function(appConfig){
      if(!this.map){
        return;
      }
      if(!utils.isEqual(this.getMapPosition(), appConfig.map.position)){
        this.setMapPosition(appConfig.map.position);
      }
    },

    _loadOnScreenGroup: function(groupJson, appConfig) {
      if(!appConfig.mode && (!groupJson.widgets || groupJson.widgets.length === 0)){
        return when(null);
      }
      return this.panelManager.showPanel(groupJson).then(lang.hitch(this, function(panel){
        panel.configId = groupJson.id;
        this.onScreenGroupPanels.push(panel);
        return panel;
      }));
    }
  });

  clazz.getInstance = function() {
    if (instance === null) {
      instance = new clazz();
      window._absolutLayoutManager = instance;
    }
    return instance;
  };
  return clazz;
});
