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
  'dojo/_base/array',
  'dojo/dom-geometry',
  'dojo/dom-style',
  'dojo/dom-class',
  'dojo/dom-construct',
  'dojo/fx',
  'dojo/on',
  'dojo/query',
  'dojo/aspect',
  'jimu/BaseWidget',
  'jimu/PoolControllerMixin',
  './DockableItem',
  './GroupItems',
  './PopupMoreNodes'
  ], function(declare, lang, array, domGeometry, domStyle, domClass, domConstruct, coreFx, on,
  query, aspect, BaseWidget, PoolControllerMixin, DockableItem, GroupItems, PopupMoreNodes){
  /* global jimuConfig*/
  var MIN_MARGIN = 8, ICON_SIZE = 40, ICON_IMG_SIZE = 20, BUTTON_SIZE = 60,
      NORMAL_MODE = 1, MOBILE_MODE = 2;
  /**
   * @exports themes/LaunchpadTheme/widgets/AnchorBarController/Widget
   */
  var clazz = declare([BaseWidget, PoolControllerMixin], {
    baseClass: 'jimu-anchorbar-controller',

    visibleIcons: 0,
    iconList: [],
    enableNext: false,
    enablePrevious: false,
    currentMode: NORMAL_MODE,
    iconMargin: MIN_MARGIN,
    groupList: [],
    openedIds: [],
    currentStyle: 'default',

    postCreate: function(){
      this.inherited(arguments);

      this.iconList = [];
      this.groupList = [];
      this.openedIds = [];
      this.currentStyle = this.appConfig.theme.styles[0];
      this.allConfigs = this.getAllConfigs();

      array.forEach(this.allConfigs, function(configItem, index){
        this._createItem(configItem, index);
      }, this);
    },

    _createItem: function(configItem, index){
      var item, itemGroup, containerNode;
      item = new DockableItem({
        config: configItem,
        backgroundIndex: index
      });
      item.placeAt(this.iconGroupNode);
      this.iconList.push(item);

      if(item.isGroup()){
        //create widget group icon
        itemGroup = new GroupItems({
          config: configItem,
          dockableItem: item
        });

        if(window.appInfo.isRunInMobile){
          containerNode = jimuConfig.layoutId;
        }else{
          containerNode = jimuConfig.mapId;
        }
        itemGroup.placeAt(containerNode);
        domStyle.set(itemGroup.domNode, 'display', 'none');

        this.own(on(itemGroup, 'groupItemClicked', lang.hitch(this, function(data){
          this._onDockableNodeClick(data.target);
        })));

        this.own(on(item, 'nodeClick', lang.hitch(this, function(data){
          this._onGroupNodeClick(data.target, itemGroup);
        })));

        this.groupList.push(itemGroup);
      }else{
        this.own(on(item, 'nodeClick', lang.hitch(this, function(data){
          this._onDockableNodeClick(data.target);
        })));
      }

      return item;
    },

    startup: function() {
      this.inherited(arguments);
      this.resize();

      // handle open at start widget, only one is allowed to open at start
      array.some(this.iconList, function(iconItem, index){
        if(iconItem.isOpenAtStart()){
          if(!window.appInfo.isRunInMobile){
            this._makeIconVisible(index);
          }
          iconItem._onNodeClick();
          return true;
        }
      }, this);
    },

    destroy: function(){
      this.inherited(arguments);

      array.forEach(this.groupList, function(widgetGroup){
        widgetGroup.destroy();
      });
    },

    onAction: function(action, data) {
      /*jshint unused: false*/
      if (action === 'highLight' && data) {
        var node = query('div[settingid="' + data.widgetId + '"]', this.domNode)[0];
        this._highLight(node);
      }
      if (action === 'removeHighLight') {
        this._removeHighLight();
      }
    },

    onOpen: function(){
      if(this.iconList.length === 0 && this.appConfig.mode !== 'config'){
        this.widgetManager.closeWidget(this);
      }
    },

    onAppConfigChanged: function(appConfig){
      this.currentStyle = appConfig.theme.styles[0];
    },

    /**
     * @override
     * @param {[type]} ids [description]
     */
    setOpenedIds: function(ids) {
      var item;
      if (ids.length === 0) {
        return;
      }
      array.forEach(ids, function(id){
        item = this._getIconItemById(id);
        if(item !== null){
          item._onNodeClick();
        }
      }, this);
    },

    getOpenedIds: function() {
      this.inherited(arguments);

      return array.filter(this.openedIds, function(item){
        return typeof item !== 'undefined';
      });
    },

    _highLight: function(node) {
      if (this.hlDiv) {
        this._removeHighLight();
      }
      if (!node || domStyle.get(node, 'display') === 'none') {
        return;
      }
      var marginLeft = domStyle.get(node, 'margin-left');
      var position = domGeometry.getMarginBox(node);
      var hlStyle = {
        position: 'absolute',
        left: (position.l + marginLeft) + 'px',
        top: (position.t) + 'px',
        width: ICON_SIZE + 'px',
        height: ICON_SIZE + 'px'
      };
      if(this.currentStyle !== 'style2'){
        hlStyle['margin-top'] = (-ICON_SIZE / 2) + 'px';
      }
      this.hlDiv = domConstruct.create('div', {
        "style": hlStyle,
        "class": 'icon-highlight'
      }, node, 'before');
    },

    _removeHighLight: function() {
      if (this.hlDiv) {
        domConstruct.destroy(this.hlDiv);
        this.hlDiv = null;
      }
    },

    clearIconGroupNode: function(){
      while(this.iconGroupNode.firstChild) {
        this.iconGroupNode.removeChild(this.iconGroupNode.firstChild);
      }
    },

    resize: function(){
      if(window.appInfo.isRunInMobile){
        if(this.currentMode === NORMAL_MODE){
          //mode changed
          this.currentMode = MOBILE_MODE;
          domClass.add(this.domNode, 'mobile');
          this.clearIconGroupNode();
          this.lastVisibleIcons = 0;
        }

        if(this.popupMore){
          this.popupMore.hide();
        }

        this.switchToMobileStyle();
      }else{
        if(this.currentMode === MOBILE_MODE){
          //mode changed
          this.currentMode = NORMAL_MODE;
          domClass.remove(this.domNode, 'mobile');
          this.clearIconGroupNode();
          this.lastVisibleIcons = 0;

          //set width of iconGroupNode large enough to hold all the icons
          domStyle.set(this.iconGroupNode, 'width',
              this.allConfigs.length * 2 * ICON_SIZE + 'px');

          array.forEach(this.iconList, function(iconItem){// recreate icon list once
            iconItem.placeAt(this.iconGroupNode);
          }, this);
        }

        this.switchToNormalStyle();
      }
      this._resizeOpenedPanel();
    },

    switchToMobileStyle: function(){
      var mapBox, containerSize, iconGroupWidth;

      mapBox = domGeometry.getContentBox(jimuConfig.mapId);
      containerSize = mapBox.w;

      iconGroupWidth = Math.max(containerSize, this.allConfigs.length * 2 * ICON_SIZE);
      //set width of iconGroupNode large enough to hold all the icons
      domStyle.set(this.iconGroupNode, 'width', iconGroupWidth + 'px');

      //calculate widgets
      this.visibleIcons = Math.floor(containerSize / (ICON_SIZE + MIN_MARGIN));
      if(this.visibleIcons >= this.iconList.length){
        this.visibleIcons = this.iconList.length;
      }

      if(this.visibleIcons !== this.lastVisibleIcons){
        this.lastVisibleIcons = this.visibleIcons;
        this.clearIconGroupNode();
        this._reArrangeIconItems(containerSize);
      }else{
        this._adjustIconMargin(containerSize);
      }
    },

    _reArrangeIconItems: function(currentWidth){
      var showMore, normalIconNumber, moreIconItem, moreItemArray = [], args;

      showMore = this.visibleIcons < this.iconList.length;
      normalIconNumber = showMore ? (this.visibleIcons - 1) : this.visibleIcons;
      this.iconMargin = Math.floor((currentWidth - (this.visibleIcons * ICON_SIZE)) /
          (this.visibleIcons + 1));

      array.forEach(this.iconList, function(item, index){
        //clear styles set in PopupMoreNodes.js
        args = {
          display: '',
          position: '',
          left: '',
          top: ''
        };
        //reset the size of iconItem and image
        domStyle.set(item.iconItemNode, {
          width: ICON_SIZE + 'px',
          height: ICON_SIZE + 'px'
        });
        domStyle.set(item.imgNode, {
          width: ICON_IMG_SIZE + 'px',
          height: ICON_IMG_SIZE + 'px'
        });
        if(index < normalIconNumber){
          if(window.isRTL){
            args['margin-right'] = this.iconMargin + 'px';
          }else{
            args['margin-left'] = this.iconMargin + 'px';
          }
          domStyle.set(item.domNode, args);
          item.placeAt(this.iconGroupNode);
        }else{
          domStyle.set(item.domNode, args);
          moreItemArray.push(item);
        }
      }, this);

      if(showMore){
        moreIconItem = this._createIconItemForMore();
        args = {};
        if(window.isRTL){
          args['margin-right'] = this.iconMargin + 'px';
        }else{
          args['margin-left'] = this.iconMargin + 'px';
        }
        domStyle.set(moreIconItem.domNode, args);
        moreIconItem.placeAt(this.iconGroupNode);

        this.own(on(moreIconItem, 'nodeClick', lang.hitch(this, function(data){
          this._onShowMoreNodeClick(data.target, moreItemArray);
        })));
      }
    },

    _createIconItemForMore: function(){
      var moreIconItem = new DockableItem({
        config: {
          id: 'show_more_widget_icons',
          label: this.nls.more,
          icon: this.folderUrl + 'images/more_icon.png'
        },
        backgroundIndex: this.visibleIcons
      });

      return moreIconItem;
    },

    _adjustIconMargin: function(currentWidth){
      var args = {};
      this.iconMargin = Math.floor((currentWidth - (this.visibleIcons * ICON_SIZE)) /
          (this.visibleIcons + 1));

      if(window.isRTL){
        args['margin-right'] = this.iconMargin + 'px';
      }else{
        args['margin-left'] = this.iconMargin + 'px';
      }

      query('div.jimu-anchorbar-iconitem', this.iconGroupNode).forEach(function(node){
        domStyle.set(node, args);
      }, this);
    },

    switchToNormalStyle: function(){
      var mapBox, widgetWidth, left, containerSize,
          firstVisible = 0, lastVisible;

      mapBox = domGeometry.getContentBox(jimuConfig.mapId);
      widgetWidth = Math.floor(mapBox.w / 2);

      if(widgetWidth > this.allConfigs.length * (ICON_SIZE + MIN_MARGIN) + BUTTON_SIZE){
        widgetWidth = this.allConfigs.length * (ICON_SIZE + MIN_MARGIN) + BUTTON_SIZE;
      }
      left = Math.floor((mapBox.w - widgetWidth) / 2);

      domStyle.set(this.domNode, {
        width: widgetWidth + 'px',
        left: left + 'px'
      });

      //calculate widgets
      containerSize = widgetWidth - BUTTON_SIZE;
      this.visibleIcons = Math.floor(containerSize / (ICON_SIZE + MIN_MARGIN));
      if(this.visibleIcons > this.iconList.length){
        this.visibleIcons = this.iconList.length;
      }

      //calculate the visible range
      array.some(this.iconList, function(item, index){
        if(item.visible){
          firstVisible = index;
          return true;
        }
      });

      lastVisible = firstVisible + this.visibleIcons - 1;
      if(lastVisible >= this.iconList.length){
        lastVisible = this.iconList.length - 1;
        firstVisible = lastVisible - this.visibleIcons + 1;
      }

      this.iconMargin = Math.floor((containerSize - (this.visibleIcons * ICON_SIZE)) /
          (this.visibleIcons + 1));

      this._adjustIconStyle(firstVisible, lastVisible);
    },

    _previous: function(){
      var idxFirst = -1, idxLast = -1, animArray = [];
      if(this.enablePrevious){
        //find the first visible iconItem
        array.some(this.iconList, function(iconItem, index){
          if(iconItem.visible){
            idxFirst = index - 1;//get the previous item index
            return true;
          }
        }, this);

        if(idxFirst >= 0){
          idxLast = idxFirst + this.visibleIcons;
          animArray = animArray.concat(this.iconList[idxLast].hideAnim(this.iconMargin),
              this.iconList[idxFirst].showAnim(this.iconMargin));
          coreFx.combine(animArray).play();

          this.enableNext = true;
          domClass.add(this.nextButton, 'enabled');

          if(idxFirst === 0){
            this.enablePrevious = false;
            domClass.remove(this.previousButton, 'enabled');
          }
        }
      }
    },

    _next: function(){
      var idxFirst = -1, idxLast = -1, animArray = [];
      if(this.enableNext){
        //find the first visible iconItem
        array.some(this.iconList, function(iconItem, index){
          if(iconItem.visible){
            idxFirst = index;
            return true;
          }
        }, this);

        if(idxFirst >= 0){
          idxLast = idxFirst + this.visibleIcons;
          animArray = animArray.concat(this.iconList[idxFirst].hideAnim(this.iconMargin),
              this.iconList[idxLast].showAnim(this.iconMargin));
          coreFx.combine(animArray).play();

          this.enablePrevious = true;
          domClass.add(this.previousButton, 'enabled');

          if(idxLast === this.iconList.length - 1){
            this.enableNext = false;
            domClass.remove(this.nextButton, 'enabled');
          }
        }
      }
    },

    _getGroupPanelPosition: function(dockableItem, widgetBox){
      var position = {},
        iconBox = domGeometry.position(dockableItem.iconItemNode),
        mapBox = domGeometry.getContentBox(jimuConfig.mapId);

      position.top = iconBox.y - widgetBox.h - MIN_MARGIN;

      if (window.isRTL) {
        if(iconBox.x < widgetBox.w + MIN_MARGIN){
          position.left = MIN_MARGIN;
        }else{
          position.left = iconBox.x - widgetBox.w + iconBox.w;
        }
      } else {
        if(iconBox.x + widgetBox.w + MIN_MARGIN > mapBox.w){
          position.left = mapBox.w - widgetBox.w - MIN_MARGIN;
        }else{
          position.left = iconBox.x;
        }
      }
      return position;
    },

    //off panel widget position
    _getOffPanelPosition: function(dockableItem, widgetBox){
      var position = {},
          iconBox = domGeometry.position(dockableItem.iconItemNode),
          mapBox = domGeometry.getContentBox(jimuConfig.mapId);

      position.bottom = mapBox.h - (iconBox.y + MIN_MARGIN) + ICON_SIZE / 2;

      if (window.isRTL) {
        if(iconBox.x < widgetBox.w + MIN_MARGIN){
          position.right = mapBox.w - widgetBox.w - MIN_MARGIN;
        }else{
          position.right = iconBox.x - widgetBox.w;
        }
      } else {
        if(iconBox.x + widgetBox.w + MIN_MARGIN > mapBox.w){
          position.left = mapBox.w - widgetBox.w - MIN_MARGIN;
        }else{
          position.left = iconBox.x;
        }
      }
      if(dockableItem.config.position) {
        position.relativeTo = dockableItem.config.position.relativeTo;
      }
      return position;
    },

    _createPopupMoreNodes: function(){
      if(!this.popupMore){
        this._createCoverNode();

        this.popupMore = new PopupMoreNodes();
        this.popupMore.placeAt(jimuConfig.mapId);

        aspect.after(this.popupMore, 'show', lang.hitch(this, function() {
          domStyle.set(this.moreIconPaneCoverNode, 'display', '');
        }), true);

        aspect.after(this.popupMore, 'hide', lang.hitch(this, function() {
          domStyle.set(this.moreIconPaneCoverNode, 'display', 'none');
        }), true);
      }
    },

    _onShowMoreNodeClick: function(dockableItem, moreItemsArray){
      this._createPopupMoreNodes();

      if(dockableItem.isOpen){
        this.popupMore.setForIcon(dockableItem);
        this.popupMore.setNodes(moreItemsArray);
        this.popupMore.show();
      }else{
        this.popupMore.hide();
      }
    },

    _getIconItemById: function(id){
      var ret = null;

      array.some(this.iconList, function(item){
        if(item.config.id === id){
          ret = item;
          return true;
        }
      });

      if(ret === null){
        array.some(this.groupList, function(groupItem){
          return array.some(groupItem.getItemList(), function(item){
            if(item.config.id === id){
              ret = item;
              return true;
            }
          });
        });
      }

      return ret;
    },

    _addToOpenedIds: function(id){
      if(this.openedIds.indexOf(id) === -1){
        this.openedIds.push(id);
      }
    },

    _removeFromOpenedIds: function(id){
      var idx = this.openedIds.indexOf(id);
      if(idx !== -1){
        this.openedIds[idx] = undefined;
      }
    },

    _onGroupNodeClick: function(dockableItem, groupItem){
      var position;

      if(dockableItem.isOpen){
        position = this._getGroupPanelPosition(dockableItem, groupItem.box);
        groupItem.setPosition(position);
        groupItem.open();
        this._addToOpenedIds(dockableItem.config.id);
      }else{
        groupItem.close();
        this._removeFromOpenedIds(dockableItem.config.id);
      }
    },

    _onDockableNodeClick: function(dockableItem){
      var panelId, panelConfig;
      if(dockableItem.config.inPanel === false){
        if(dockableItem.isOpen){
          this.widgetManager.loadWidget(dockableItem.config).then(
              lang.hitch(this, function(widget) {
            this._addToOpenedIds(dockableItem.config.id);

            var position = this._getOffPanelPosition(dockableItem,
                this.widgetManager.getWidgetMarginBox(widget));
            position.zIndex = 100;
            widget.setPosition(position, this.containerNode);
            this.widgetManager.openWidget(widget);

            this.own(aspect.after(widget, 'onClose', lang.hitch(this, function() {
              dockableItem.setOpened(false);
              this._removeFromOpenedIds(dockableItem.config.id);
            })));
          }));
        }else{
          this.widgetManager.closeWidget(dockableItem.config.id);
          this._removeFromOpenedIds(dockableItem.config.id);
        }
      }else{
        panelId = dockableItem.config.id + '_panel';
        if(dockableItem.isOpen){
          dockableItem.setPanelIndex(this._calPanelIndex());
          panelConfig = dockableItem.getConfigForPanel();

          this.panelManager.showPanel(panelConfig).then(lang.hitch(this, function(panel){
            panel.setPosition(panelConfig.panel.position);
            aspect.after(panel, 'onClose', lang.hitch(this, function(){
              dockableItem.setOpened(false);
              this._removeFromOpenedIds(dockableItem.config.id);
            }));
          }));

          if(this.popupMore){
            this.popupMore.hide();
          }
          this._addToOpenedIds(dockableItem.config.id);
        }else{
          this.panelManager.closePanel(panelId);
          this._removeFromOpenedIds(dockableItem.config.id);
        }
      }
    },

    _calPanelIndex: function(){
      var openedList = [], i, len;

      //collect panel index of opened widget.
      array.forEach(this.iconList, function(item){
        if(!item.isGroup() && item.config.inPanel !== false && item.isOpen){
          openedList.push(item.getPanelIndex());
        }
      });
      array.forEach(this.groupList, function(groupItem){
        array.forEach(groupItem.getItemList(), function(item){
          if(item.config.inPanel !== false && item.isOpen){
            openedList.push(item.getPanelIndex());
          }
        });
      });

      if(openedList.length === 0){
        return 0;
      }

      //sort asc
      openedList.sort(function(a, b){
        return a - b;
      });

      //Find the smallest panel index that is not used.
      if(openedList[0] > 0){
        return 0;
      }

      for(i = 0, len = openedList.length - 1 ; i < len; i++){
        if(openedList[i + 1] - openedList[i] > 1){
          return openedList[i] + 1;
        }
      }

      return openedList[len] + 1;
    },

    _createCoverNode: function() {
      this.moreIconPaneCoverNode = domConstruct.create('div', {
        'class': 'jimu-more-icon-cover'
      }, jimuConfig.layoutId);
    },

    _resizeOpenedPanel: function(){
      var panel;
      //collect panel index of opened widget.
      array.forEach(this.iconList, function(item){
        if(!item.isGroup() && item.config.inPanel !== false && item.isOpen){
          panel = this.panelManager.getPanelById(item.config.id + '_panel');
          if(panel){
            panel.onWindowResize();
          }
        }
      }, this);
      array.forEach(this.groupList, function(groupItem){
        array.forEach(groupItem.getItemList(), function(item){
          if(item.config.inPanel !== false && item.isOpen){
            panel = this.panelManager.getPanelById(item.config.id + '_panel');
            if(panel){
              panel.onWindowResize();
            }
          }
        }, this);
      }, this);
    },

    /**
     * Used by open at start widget. Make the widget icon at the center of the anchor bar.
     * @param  {number} index [description]
     */
    _makeIconVisible: function(index){
      var firstVisible, lastVisible;
      if(this.visibleIcons === this.iconList.length){
        return;
      }

      firstVisible = index - Math.floor(this.visibleIcons / 2);
      firstVisible = firstVisible >= 0 ? firstVisible : 0;
      lastVisible = firstVisible + this.visibleIcons - 1;
      if(lastVisible >= this.iconList.length){
        lastVisible = this.iconList.length - 1;
        firstVisible = lastVisible - this.visibleIcons + 1;
      }

      this._adjustIconStyle(firstVisible, lastVisible);
    },

    _adjustIconStyle: function(firstVisible, lastVisible){
      var args;
      array.forEach(this.iconList, function(iconItem, index){
        iconItem.visible = index >= firstVisible && index <= lastVisible;
        args = {
          position: '',
          left: '',
          top: '',
          display: iconItem.visible ? '' : 'none'
        };
        if(window.isRTL){
          args['margin-right'] = this.iconMargin + 'px';
        }else{
          args['margin-left'] = this.iconMargin + 'px';
        }
        domStyle.set(iconItem.domNode, args);
        domStyle.set(iconItem.iconItemNode, {
          width: ICON_SIZE + 'px',
          height: ICON_SIZE + 'px'
        });
        domStyle.set(iconItem.imgNode, {
          width: ICON_IMG_SIZE + 'px',
          height: ICON_IMG_SIZE + 'px'
        });
      }, this);

      if(lastVisible < this.allConfigs.length - 1){
        domClass.add(this.nextButton, 'enabled');
        this.enableNext = true;
      }else{
        domClass.remove(this.nextButton, 'enabled');
        this.enableNext = false;
      }

      if(firstVisible > 0){
        this.enablePrevious = true;
        domClass.add(this.previousButton, 'enabled');
      }else{
        this.enablePrevious = false;
        domClass.remove(this.previousButton, 'enabled');
      }
    }
  });
  return clazz;
});
