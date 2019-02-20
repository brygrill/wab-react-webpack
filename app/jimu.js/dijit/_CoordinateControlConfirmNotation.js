///////////////////////////////////////////////////////////////////////////
// Copyright (c) 2016 Esri. All Rights Reserved.
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

/*global define*/
define([
  'dojo/_base/declare',
  'dojo/_base/Deferred',
  'dojo/dom-construct',
  'dojo/dom-class',
  'dijit/Dialog',
  'dijit/form/Select',
  'dojo/_base/lang'
], function (
  dojoDeclare,
  dojoDeferred,
  dojoDomConstruct,
  dojoDomClass,
  dijitDialog,
  dijitSelect,
  lang
) {
  return dojoDeclare([dijitDialog], {
    baseClass: 'jimu-coordinate-control',
    numberOfInputs: 0,
    selectOptions: {},
    comboOptions: {},
    dfd: null,

    constructor: function (options) {
      lang.mixin(this, options);
      this.numberOfInputs = options.options.length;
      this.selectOptions = options.options;
    },

    postCreate: function () {
      this.inherited('postCreate', arguments);

      if (this.theme === 'DartTheme') {
        dojoDomClass.add(this.containerNode, 'coordinateControlDialog');
      }

      this.message = dojoDomConstruct.create('div', {
        style: 'margin-bottom: 5px'
      }, this.containerNode, 'first');

      this.message.innerHTML = this.numberOfInputs + " " + this.nls.multipleNotationLabel;

      this.comboOptions = new dijitSelect({},
        dojoDomConstruct.create('div', {}, this.containerNode, 'last'));

      for (var i = 0; i < this.selectOptions.length; i++) {
        this.comboOptions.addOption({
          value: this.selectOptions[i].name,
          label: this.selectOptions[i].notationType
        });
      }

      this.buttonDiv = dojoDomConstruct.create('div', {
        'class': 'buttonContainer',
        style: 'text-align: right; margin-top: 10px'
      }, this.containerNode, 'last');

      this.okButton = dojoDomConstruct.create('div', {
        innerHTML: this.nls.applyButtonLabel,
        'class': 'jimu-btn',
        onclick: lang.hitch(this, function () {
          this.hide();
          this.dfd.resolve();
        })
      }, this.buttonDiv, 'first');

      this.cancelButton = dojoDomConstruct.create('div', {
        innerHTML: this.nls.cancelButtonLabel,
        'class': 'jimu-btn',
        style: 'margin-left: 5px',
        onclick: lang.hitch(this, function () {
          this.hide();
          this.dfd.cancel();
        })
      }, this.buttonDiv, 'last');
    },

    /**
     * Shows the dialog.
     * @return {Deferred}
     */
    show: function () {
      this.inherited('show', arguments);
      this.dfd = new dojoDeferred();
      return this.dfd;
    }
  });
});