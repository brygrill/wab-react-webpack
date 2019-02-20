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
    'dojo/dom-class',
    'dojo/_base/window',
    'dojo/window',
    'dojo/query',
    'dojo/on',
    //'dojo/topic',
    'dojo/Deferred',
    'jimu/BaseWidget',
    'jimu/WidgetManager',
    'jimu/LayoutManager',
    'jimu/utils',
    'dojo/NodeList-dom',
    'dojo/NodeList-manipulate'
  ],
  function(declare, lang, array, html, domClass, winBase, win, query, on,
    Deferred, BaseWidget, WidgetManager, LayoutManager, utils) {
    /* global jimuConfig */
    /*jshint scripturl:true*/
    var clazz = declare([BaseWidget], {

      baseClass: 'jimu-widget-header jimu-main-background',
      name: 'Header',

      switchableElements: {},
      _boxSizes: null,
      _searchWidgetId: "",

      moveTopOnActive: false,

      constructor: function() {
        this.height = this.getHeaderHeight() + 'px';
        this.widgetManager = WidgetManager.getInstance();
        this.LayoutManager = LayoutManager.getInstance();
      },

      postCreate: function() {
        this.inherited(arguments);
        this._boxSizes = {};

        this.own(on(this.widgetManager, 'widget-created', lang.hitch(this, function(widget) {
          if(widget.name === 'Search') {
            var searchWidget = this._getSearchWidgetInHeader();
            if (searchWidget) {
              html.addClass(searchWidget.domNode, 'has-transition');
              // check if the search dijit has been parsed within the search widget
              // if not, wait until it is ready, and then call resize()
              if(searchWidget && !searchWidget.searchDijit) {
                this._searchDijitDomReady(searchWidget).then(lang.hitch(this, function(){
                  this.resize();
                }));
              }else{
                this.resize();
              }
            }
          }
        })));

        this.own(on(this.widgetManager, 'widget-destroyed', lang.hitch(this, function(widgetId) {
          if(widgetId && widgetId === this._searchWidgetId) {
            this._detachSearchWidget();
            this.resize();
          }
        })));

        var logoW = this.getLogoWidth() + 'px';

        if (this.position && this.position.height) {
          this.height = this.position.height;
        }

        this.switchableElements.logo = query('.logo', this.domNode);
        this.switchableElements.title = query('.jimu-title', this.domNode);
        //this.switchableElements.links = query('.links', this.domNode);
        this.switchableElements.subtitle = query('.jimu-subtitle', this.domNode);

        this._handleTitleColorAndLogoLink(this.appConfig);

        this.switchableElements.logo.style({
          height: logoW
        });

        this._setElementsSize();
      },

      _attachSearchWidget: function(searchWidget) {
        if(!searchWidget) {
          searchWidget = this._getSearchWidgetInHeader();
        }
        if(!searchWidget || html.isDescendant(searchWidget.domNode, this.searchNode)) {
          return;
        }
        searchWidget.domNode.style.position = 'relative';
        searchWidget.domNode.style.left = 'auto';
        searchWidget.domNode.style.right = 'auto';
        searchWidget.domNode.style.top = 'auto';
        searchWidget.domNode.style.bottom = 'auto';
        searchWidget.domNode.style.width = '280px';
        html.place(searchWidget.domNode, this.searchNode);
        this._boxSizes.searchWidgetBox = {w: 280, h: 30};
      },

      _detachSearchWidget: function() {
        html.empty(this.searchNode);
        this._boxSizes.searchWidgetBox = {w: 0, h: 0};
      },

      _getSearchWidgetInHeader: function() {
        var result;
        var searchWidgets = this.widgetManager.getWidgetsByName('Search');

        array.some(searchWidgets, lang.hitch(this, function(widget) {
          if (!widget.closeable && widget.isOnScreen) {
            result = widget;
            this._searchWidgetId = widget.id;
            return true;
          }
        }));
        return result;
      },

      startup: function() {
        this.inherited(arguments);

        // Update UI:
        // Logo
        if (this.appConfig && this.appConfig.logo) {
          this.logoNode.src = this.appConfig.logo;
          this.own(on(this.logoNode, "load", lang.hitch(this, function () {
            this._boxSizes.logoBox = html.getMarginSize(this.logoWrapperNode);
            this.resize();
          })));
          html.removeClass(this.logoWrapperNode, 'hide-logo');
        } else {
          this.logoNode.src = "";
          html.addClass(this.logoWrapperNode, 'hide-logo');
        }
        // Title
        this.switchableElements.title.innerHTML(
          utils.sanitizeHTML(this.appConfig.title ? this.appConfig.title : '')
        );
        // Subtitle
        this.switchableElements.subtitle.innerHTML(
          utils.sanitizeHTML(this.appConfig.subtitle ? this.appConfig.subtitle : '')
        );
        // Links
        this._createDynamicLinks(this.appConfig.links);
        // About
        if (this.appConfig.about) {
          html.setStyle(this.aboutNode, 'display', '');
        } else {
          html.setStyle(this.aboutNode, 'display', 'none');
        }

        // Show links placeholder button (if needed)
        this._determineLinksButtonVisibility(this.appConfig.links);
      },

      _searchDijitDomReady: function(searchWidget) {
        var timeCounter = 0;
        var def = new Deferred();
        // Check if searchDijit has been initialized within the search widget every 200 ms
        var checkSearchDijitTimer = setInterval(lang.hitch(this, function(){
          if(timeCounter > 5000 || searchWidget.searchDijit) {
            // stop watching and resize UI
            clearInterval(checkSearchDijitTimer);
            def.resolve();
          }else {
            timeCounter += 200;
          }
        }), 200);
        return def;
      },

      onAppConfigChanged: function(appConfig, reason, changedData) {
        switch (reason) {
        case 'attributeChange':
          this._onAttributeChange(appConfig, changedData);
          this._updateBoxsizes();
          this.resize();
          break;
        case 'widgetChange':
          if(changedData.name === 'Search'){
            this.resize();
          }
          break;
        default:
          return;
        }
        this.appConfig = appConfig;
      },

      _onAttributeChange: function(appConfig, changedData) {
        /*jshint unused: false*/
        if ('title' in changedData && changedData.title !== this.appConfig.title) {
          this.switchableElements.title.innerHTML(utils.sanitizeHTML(changedData.title));
          html.setStyle(this.titleNode, {
            display: changedData.title ? '' : 'none'
          });
        }
        if ('subtitle' in changedData && changedData.subtitle !== this.appConfig.subtitle) {
          this.switchableElements.subtitle.innerHTML(utils.sanitizeHTML(changedData.subtitle));
          html.setStyle(this.subtitleNode, {
            display: changedData.subtitle ? '' : 'none'
          });
        }
        if (html.getStyle(this.titleNode, 'display') !== 'none' ||
          html.getStyle(this.subtitleNode, 'display') !== 'none') {
          html.setStyle(this.titlesNode, 'width', '1000px');
        }

        if ('logo' in changedData && changedData.logo !== this.appConfig.logo) {
          if(changedData.logo){
            html.setAttr(this.logoNode, 'src', changedData.logo);
            html.removeClass(this.logoWrapperNode, 'hide-logo');
          }else{
            html.removeAttr(this.logoNode, 'src');
            html.addClass(this.logoWrapperNode, 'hide-logo');
          }
        }
        if ('links' in changedData) {
          this._createDynamicLinks(changedData.links);
          this._determineLinksButtonVisibility(changedData.links);
        }

        this._handleTitleColorAndLogoLink(appConfig);
      },

      _handleTitleColorAndLogoLink: function(appConfig){
        if(appConfig.titleColor){
          html.setStyle(this.switchableElements.title, 'color', appConfig.titleColor);
        }else{
          html.setStyle(this.switchableElements.title, 'color', '');
        }

        if(appConfig.logoLink){
          html.setAttr(this.logoLinkNode, 'href', appConfig.logoLink);
          html.setStyle(this.logoNode, 'cursor', 'pointer');
        }else{
          html.setAttr(this.logoLinkNode, 'href', 'javascript:void(0)');
          html.setStyle(this.logoNode, 'cursor', 'default');
        }
      },

      _setElementsSize: function() {
        // Logo
        html.setStyle(this.logoNode, {
          height: '30px',
          marginTop: ((this.getLogoWidth() - 30) / 2) + 'px'
        });
        // Title
        html.setStyle(this.titleNode, {
          lineHeight: this.height + 'px'
        });
        // Subtitle
        html.setStyle(this.subtitleNode, {
          lineHeight: this.height + 'px'
        });
      },

      _createDynamicLinks: function(links) {
        html.empty(this.dynamicLinksNode);
        array.forEach(links, function(link) {
          html.create('a', {
            href: link.url,
            target: '_blank',
            rel: "noopener noreferrer",
            innerHTML: utils.sanitizeHTML(link.label),
            'class': "link"
          }, this.dynamicLinksNode);
        }, this);
      },

      _determineLinksButtonVisibility: function(links) {
        if(links.length || this.appConfig.about) {
          this._showLinksIcon();
        }else {
          this._hideLinksIcon();
        }
      },

      _showLinksIcon: function() {
        html.setAttr(this.linksIconImageNode, 'src', this.folderUrl + 'images/link_icon.png');
        html.setStyle(this.linksIconNode, 'display', 'block');
        html.addClass(winBase.body(), 'header-has-links');

        if(!this.linksIconClicked) {
          this.linksIconClicked = on(this.linksIconNode, 'click', lang.hitch(this, function() {
            this._toggleLinksMenu();
          }));
        }
      },

      _hideLinksIcon: function() {
        html.setStyle(this.linksIconNode, 'display', 'none');
        html.removeClass(winBase.body(), 'header-has-links');
      },

      _toggleLinksMenu: function() {
        html.toggleClass(this.linksNode, 'hidden');
      },

      _onAboutClick: function() {
        var widgetConfig = {
          id: this.appConfig.about + '_1',
          uri: this.appConfig.about,
          label: 'About'
        };
        this.widgetManager.loadWidget(widgetConfig).then(lang.hitch(this, function(widget) {
          html.place(widget.domNode, jimuConfig.layoutId);
          widget.startup();
        }));
      },

      _updateBoxsizes: function() {
        var logoBox = this._boxSizes.logoBox;
        if (html.getStyle(this.logoWrapperNode, 'display') !== 'none') {
          logoBox = html.getMarginSize(this.logoWrapperNode);
        } else {
          logoBox = {w:0, h: 0};
        }
        this._boxSizes.logoBox = logoBox;

        var titleBox = this._boxSizes.titleBox;
        if (html.getStyle(this.titleNode, 'display') !== 'none' && this.switchableElements.title.innerHTML()){
          titleBox = html.getMarginSize(this.titleNode);
        }
        if(!titleBox) {
          titleBox = {w:0, h: 0};
        }
        this._boxSizes.titleBox = titleBox;

        var subTitleBox = this._boxSizes.subTitleBox;
        if(html.getStyle(this.subtitleNode, 'display') !== 'none' && this.switchableElements.subtitle.innerHTML()) {
          subTitleBox = html.getMarginSize(this.subtitleNode);
        }
        if (!subTitleBox) {
          subTitleBox = {w:0, h: 0};
        }
        this._boxSizes.subTitleBox = subTitleBox;
        html.setStyle(this.titlesNode, 'width', 'auto');

        var LinksIconBox = this._boxSizes.LinksIconBox; // "w:10": leave some space to the edge
        if(this.linksIconNode.style.display !== 'none') {
          LinksIconBox = html.getMarginSize(this.linksIconNode);
        } else {
          LinksIconBox = {w:0, h: 0};
        }
        this._boxSizes.LinksIconBox = LinksIconBox;

        if (!this._boxSizes.searchWidgetBox) {
          this._boxSizes.searchWidgetBox = {w: 0, h: 0};
        }
      },

      setPosition: function(position, containerNode){
        //For on-screen off-panel widget, layout manager will call this function
        //to set widget's position after load widget. If your widget will position by itself,
        //please override this function.
        this.position = position;
        var style = utils.getPositionStyle(this.position);
        style.position = 'absolute';
        style.width = 'auto';

        if(!containerNode){
          if(position.relativeTo === 'map'){
            containerNode = this.map.id;
          }else{
            containerNode = window.jimuConfig.layoutId;
          }
        }

        html.place(this.domNode, containerNode);
        html.setStyle(this.domNode, style);
        if(this.started){
          setTimeout(lang.hitch(this, this.resize), 200);
        }
      },

      resize: function() {
        if(!this._started){
          return;
        }
        if (!this._boxSizes.logoBox || !this._boxSizes.titleBox ||
            !this._boxSizes.subTitleBox || !this._boxSizes.searchWidgetBox ||
            !this._boxSizes.LinksIconBox) {
          this._updateBoxsizes();
        }
        var boxSizes = this._boxSizes;
        // whether the app is in mobile mode
        if(window.appInfo.isRunInMobile){
          html.addClass(winBase.body(), 'is-mobile');
          this._detachSearchWidget();
        }else {
          html.removeClass(winBase.body(), 'is-mobile');
          this._attachSearchWidget();

          // Space reserved to show off screen widget icons to the right of the header
          var winBox = win.getBox();
          var offsetRight = 300, left = 15;

          // Total width of the content in the header
          // var contentPadding = 20;
          var contentWidth = boxSizes.logoBox.w + boxSizes.titleBox.w + boxSizes.subTitleBox.w +
              boxSizes.searchWidgetBox.w + boxSizes.LinksIconBox.w;

          if (contentWidth === 0) {
            html.setStyle(this.domNode, 'visibility', 'hidden');
            return;
          } else {
            html.setStyle(this.domNode, 'visibility', 'visible');
          }

          if (contentWidth === boxSizes.logoBox.w || contentWidth === boxSizes.LinksIconBox.w) {
            html.setStyle(this.titlesNode, 'display', 'none');
          } else {
            html.setStyle(this.titlesNode, 'display', 'flex');
          }

          if(left + contentWidth + offsetRight < winBox.w) {  // enough space to show everything
            this.titleNode.style.display = 'block';
            this.subtitleNode.style.display = 'block';
          } else {
            if(left + contentWidth - boxSizes.subTitleBox.w + offsetRight < winBox.w) {
              // not enough space to show subtitle
              this.titleNode.style.display = 'block';
              this.subtitleNode.style.display = 'none';
            } else {
              // not enough space to show tile and subtitle
              this.titleNode.style.display = 'none';
              this.subtitleNode.style.display = 'none';
            }
          }
        }
      },

      getHeaderHeight: function() {
        return 44;
      },

      getLogoWidth: function() {
        return 50;
      },

      getLinksWidth: function() {
        return 36;
      },

      destroy: function() {
        this.inherited(arguments);
      }
    });
    return clazz;
  });
