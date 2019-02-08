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
  'dojo/dom-class',
  'dojo/dom-attr',
  'dojo/_base/fx',
  './BaseIconItem'
], function(declare, lang, domClass, domAttr, baseFx, BaseIconItem){
  var ANIMATION_DURATION = 500, ICON_IMG_SIZE = 20;
  /**
   * @exports themes/LaunchpadTheme/widgets/AnchorBarController/DockableItem
   */
  var clazz = declare([BaseIconItem], {
    /**
     * The visibility of widget icon in controller
     * @type {Boolean}
     */
    visible: true,

    postCreate: function(){
      this.inherited(arguments);

      domClass.add(this.iconItemNode, 'dockable');
      domAttr.set(this.domNode, 'settingid', this.config.id);
    },

    /**
     * AnimateProperty of hiding the iconItem
     * @return {object} dojo._base.fx.animateProperty
     */
    hideAnim: function(){
      var nodeStyle = this.domNode.style,
          animArray = [],
          prop = {};

      if(window.isRTL){
        prop['margin-right'] = 0;
      }else{
        prop['margin-left'] = 0;
      }
      domClass.remove(this.iconItemStatus, 'selected');

      animArray.push(baseFx.animateProperty({
        node: this.domNode,
        duration: ANIMATION_DURATION,
        properties: prop,
        onEnd: lang.hitch(this, function(){
          nodeStyle.display = 'none';
          this.visible = false;
        })
      }));

      animArray.push(baseFx.animateProperty({
        node: this.iconItemNode,
        duration: ANIMATION_DURATION,
        properties: {
          width: 1 // 0 causes IE to display the whole panel
        }
      }));

      animArray.push(baseFx.animateProperty({
        node: this.imgNode,
        duration: ANIMATION_DURATION,
        properties: {
          width: 1 // 0 causes IE to display the whole panel
        }
      }));

      return animArray; // dojo/_base/fx.Animation
    },

    /**
     * AnimateProperty of showing the iconItem. Learn from dojo.fx.WipeIn
     * @return {[type]} [description]
     */
    showAnim: function(marginValue){
      var nodeStyle = this.domNode.style,
          iconNodeStyle = this.iconItemNode.style,
          imgStyle = this.imgNode.style,
          animArray = [],
          iconNodeSize = this.size,
          prop = {},
          transition;

      transition = {
        start: function(){
          nodeStyle.display = '';
          return 0;
        },
        end: marginValue
      };

      if(window.isRTL){
        prop['margin-right'] = transition;
      }else{
        prop['margin-left'] = transition;
      }

      animArray.push(baseFx.animateProperty({
        node: this.domNode,
        duration: ANIMATION_DURATION,
        properties: prop,
        onEnd: lang.hitch(this, function(){
          if(this.isOpen){
            domClass.add(this.iconItemStatus, 'selected');
          }
          this.visible = true;
        })
      }));

      animArray.push(baseFx.animateProperty({
        node: this.iconItemNode,
        duration: ANIMATION_DURATION,
        properties: {
          width: {
            start: function(){
              iconNodeStyle.width = '1px';
              return 1;
            },
            end: iconNodeSize
          }
        }
      }));

      animArray.push(baseFx.animateProperty({
        node: this.imgNode,
        duration: ANIMATION_DURATION,
        properties: {
          width: {
            start: function(){
              imgStyle.width = '1px';
              return 1;
            },
            end: ICON_IMG_SIZE
          }
        }
      }));

      return animArray; // dojo/_base/fx.Animation
    }
  });
  return clazz;
});
