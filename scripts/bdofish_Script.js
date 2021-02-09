//-----------------------------------------//
//----------       langNum       ----------//  영어면 2, 한국어면 3의 값으로 변동
//-----------------------------------------//
if(Language == 'English'){
    langNum = 2;
}
else if(Language == 'Korean'){
    langNum = 3;
}

//------------------------------------------------------------//
//---------------      leaflet-sidebar.js      ---------------//
//------------------------------------------------------------//
    /**
     * @name Sidebar
     * @class L.Control.Sidebar
     * @extends L.Control
     * @param {string} id - The id of the sidebar element (without the # character)
     * @param {Object} [options] - Optional options object
     * @param {string} [options.position=left] - Position of the sidebar: 'left' or 'right'
     * @see L.control.sidebar
    */
   L.Control.Sidebar = L.Control.extend(/** @lends L.Control.Sidebar.prototype */ {
    includes: (L.Evented.prototype || L.Mixin.Events),

    options: {
        position: 'right'
    },

    initialize: function (id, options) {
        var i, child;

        L.setOptions(this, options);

        // Find sidebar HTMLElement
        this._sidebar = L.DomUtil.get(id);

        // Attach .sidebar-left/right class
        L.DomUtil.addClass(this._sidebar, 'sidebar-' + this.options.position);

        // Attach touch styling if necessary
        if (L.Browser.touch)
            L.DomUtil.addClass(this._sidebar, 'leaflet-touch');

        // Find sidebar > div.sidebar-content
        for (i = this._sidebar.children.length - 1; i >= 0; i--) {
            child = this._sidebar.children[i];
            if (child.tagName == 'DIV' &&
                    L.DomUtil.hasClass(child, 'sidebar-content'))
                this._container = child;
        }

        // Find sidebar ul.sidebar-tabs > li, sidebar .sidebar-tabs > ul > li
        this._tabitems = this._sidebar.querySelectorAll('ul.sidebar-tabs > li, .sidebar-tabs > ul > li');
        for (i = this._tabitems.length - 1; i >= 0; i--) {
            this._tabitems[i]._sidebar = this;
        }

        // Find sidebar > div.sidebar-content > div.sidebar-pane
        this._panes = [];
        this._closeButtons = [];
        for (i = this._container.children.length - 1; i >= 0; i--) {
            child = this._container.children[i];
            if (child.tagName == 'DIV' &&
                L.DomUtil.hasClass(child, 'sidebar-pane')) {
                this._panes.push(child);

                var closeButtons = child.querySelectorAll('.sidebar-close');
                for (var j = 0, len = closeButtons.length; j < len; j++)
                    this._closeButtons.push(closeButtons[j]);
            }
        }
    },

    /**
     * Add this sidebar to the specified map.
     *
     * @param {L.Map} map
     * @returns {Sidebar}
     */
    addTo: function (map) {
        var i, child;

        this._map = map;

        for (i = this._tabitems.length - 1; i >= 0; i--) {
            child = this._tabitems[i];
            var sub = child.querySelector('a');
            if (sub.hasAttribute('href') && sub.getAttribute('href').slice(0,1) == '#') {
                L.DomEvent
                    .on(sub, 'click', L.DomEvent.preventDefault )
                    .on(sub, 'click', this._onClick, child);
            }
        }

        for (i = this._closeButtons.length - 1; i >= 0; i--) {
            child = this._closeButtons[i];
            L.DomEvent.on(child, 'click', this._onCloseClick, this);
        }

        return this;
    },

    /**
     * @deprecated - Please use remove() instead of removeFrom(), as of Leaflet 0.8-dev, the removeFrom() has been replaced with remove()
     * Removes this sidebar from the map.
     * @param {L.Map} map
     * @returns {Sidebar}
     */
    removeFrom: function(map) {
        console.log('removeFrom() has been deprecated, please use remove() instead as support for this function will be ending soon.');
        this.remove(map);
    },

    /**
     * Remove this sidebar from the map.
     *
     * @param {L.Map} map
     * @returns {Sidebar}
     */
    remove: function (map) {
        var i, child;

        this._map = null;

        for (i = this._tabitems.length - 1; i >= 0; i--) {
            child = this._tabitems[i];
            L.DomEvent.off(child.querySelector('a'), 'click', this._onClick);
        }

        for (i = this._closeButtons.length - 1; i >= 0; i--) {
            child = this._closeButtons[i];
            L.DomEvent.off(child, 'click', this._onCloseClick, this);
        }

        return this;
    },

    /**
     * Open sidebar (if necessary) and show the specified tab.
     *
     * @param {string} id - The id of the tab to show (without the # character)
     */
    open: function(id) {
        var i, child;

        // hide old active contents and show new content
        for (i = this._panes.length - 1; i >= 0; i--) {
            child = this._panes[i];
            if (child.id == id)
                L.DomUtil.addClass(child, 'active');
            else if (L.DomUtil.hasClass(child, 'active'))
                L.DomUtil.removeClass(child, 'active');
        }

        // remove old active highlights and set new highlight
        for (i = this._tabitems.length - 1; i >= 0; i--) {
            child = this._tabitems[i];
            if (child.querySelector('a').hash == '#' + id)
                L.DomUtil.addClass(child, 'active');
            else if (L.DomUtil.hasClass(child, 'active'))
                L.DomUtil.removeClass(child, 'active');
        }

        this.fire('content', { id: id });

        // open sidebar (if necessary)
        if (L.DomUtil.hasClass(this._sidebar, 'collapsed')) {
            this.fire('opening');
            L.DomUtil.removeClass(this._sidebar, 'collapsed');
        }

        return this;
    },

    /**
     * Close the sidebar (if necessary).
     */
    close: function() {
        // remove old active highlights
        for (var i = this._tabitems.length - 1; i >= 0; i--) {
            var child = this._tabitems[i];
            if (L.DomUtil.hasClass(child, 'active'))
                L.DomUtil.removeClass(child, 'active');
        }

        // close sidebar
        if (!L.DomUtil.hasClass(this._sidebar, 'collapsed')) {
            this.fire('closing');
            L.DomUtil.addClass(this._sidebar, 'collapsed');
        }

        return this;
    },

    /**
     * @private
     */
    _onClick: function() {
        if (L.DomUtil.hasClass(this, 'active'))
            this._sidebar.close();
        else if (!L.DomUtil.hasClass(this, 'disabled'))
            this._sidebar.open(this.querySelector('a').hash.slice(1));
    },

    /**
     * @private
     */
    _onCloseClick: function () {
        this.close();
    }
});

/**
 * Creates a new sidebar.
 *
 * @example
 * var sidebar = L.control.sidebar('sidebar').addTo(map);
 *
 * @param {string} id - The id of the sidebar element (without the # character)
 * @param {Object} [options] - Optional options object
 * @param {string} [options.position=left] - Position of the sidebar: 'left' or 'right'
 * @returns {Sidebar} A new sidebar instance
 */
L.control.sidebar = function (id, options) {
    return new L.Control.Sidebar(id, options);
};



//------------------------------------------------------------------//
//---------------      L.Control.Layers.Tree.js      ---------------//
//------------------------------------------------------------------//
/*
* Control like L.Control.Layers, but showing layers in a tree.
* Do not forget to include the css file.
*/

(function(L) {
    if (typeof L === 'undefined') {
        throw new Error('Leaflet must be included first');
    }

    /*
    * L.Control.Layers.Tree extends L.Control.Layers because it reuses
    * most of its functionality. Only the HTML creation is different.
    */
    L.Control.Layers.Tree = L.Control.Layers.extend({
        options: {
            //closedSymbol: '+',
            //openedSymbol: '&minus;',
            spaceSymbol: ' ',
            selectorBack: false,
            namedToggle: false,
            collapseAll: '',
            expandAll: '',
            labelIsSelector: 'both',
        },

        // Class names are error prone texts, so write them once here
        _initClassesNames: function() {
            this.cls = {
                children: 'leaflet-layerstree-children',
                childrenNopad: 'leaflet-layerstree-children-nopad',
                hide: 'leaflet-layerstree-hide',
                //closed: 'leaflet-layerstree-closed',
                //opened: 'leaflet-layerstree-opened',
                space: 'leaflet-layerstree-header-space',
                pointer: 'leaflet-layerstree-header-pointer',
                header: 'leaflet-layerstree-header',
                neverShow: 'leaflet-layerstree-nevershow',
                node: 'leaflet-layerstree-node',
                name: 'leaflet-layerstree-header-name',
                label: 'leaflet-layerstree-header-label',
                selAllCheckbox: 'leaflet-layerstree-sel-all-checkbox',
            };
        },

        initialize: function(baseTree, overlaysTree, options) {
            this._scrollTop = 0;
            this._initClassesNames();
            this._baseTree = null;
            this._overlaysTree = null;
            L.Util.setOptions(this, options);
            L.Control.Layers.prototype.initialize.call(this, null, null, options);
            this._setTrees(baseTree, overlaysTree);
        },

        setBaseTree: function(tree) {
            return this._setTrees(tree);
        },

        setOverlayTree: function(tree) {
            return this._setTrees(undefined, tree);
        },

        addBaseLayer: function(layer, name) {
            throw 'addBaseLayer is disabled';
        },

        addOverlay: function(layer, name) {
            throw 'addOverlay is disabled';
        },

        removeLayer: function(layer) {
            throw 'removeLayer is disabled';
        },

        collapse: function() {
            this._scrollTop = this._sect().scrollTop;
            return L.Control.Layers.prototype.collapse.call(this);
        },

        expand: function() {
            var ret = L.Control.Layers.prototype.expand.call(this);
            this._sect().scrollTop = this._scrollTop;
        },

        onAdd: function(map) {
            function changeName(layer) {
                if (layer._layersTreeName) {
                    toggle.innerHTML = layer._layersTreeName;
                }
            }

            var ret = L.Control.Layers.prototype.onAdd.call(this, map);
            if (this.options.namedToggle) {
                var toggle = this._container.getElementsByClassName('leaflet-control-layers-toggle')[0];
                L.DomUtil.addClass(toggle, 'leaflet-layerstree-named-toggle');
                // Start with this value...
                map.eachLayer(function(layer) {changeName(layer);});
                // ... and change it whenever the baselayer is changed.
                map.on('baselayerchange', function(e) {changeName(e.layer);}, this);
            }
            return ret;
        },

        // Expands the whole tree (base other overlays)
        expandTree: function(overlay) {
            var container = overlay ? this._overlaysList : this._baseLayersList;
            if (container) {
                this._applyOnTree(container, false);
            }
            return this._localExpand();
        },

        // Collapses the whole tree (base other overlays)
        collapseTree: function(overlay) {
            var container = overlay ? this._overlaysList : this._baseLayersList;
            if (container) {
                this._applyOnTree(container, true);
            }
            return this._localExpand();
        },

        // Expands the tree, only to show the selected inputs
        expandSelected: function(overlay) {
            function iter(el) {
                // Function to iterate the whole DOM upwards
                var p = el.parentElement;
                if (p) {
                    if (L.DomUtil.hasClass(p, that.cls.children) &&
                        !L.DomUtil.hasClass(el, that.cls.childrenNopad)) {
                        L.DomUtil.removeClass(p, hide);
                    }

                    if (L.DomUtil.hasClass(p, that.cls.node)) {
                        var h = p.getElementsByClassName(that.cls.header)[0];
                        that._applyOnTree(h, false);
                    }
                    iter(p);
                }
            }

            var that = this;
            var container = overlay ? this._overlaysList : this._baseLayersList;
            if (!container) return this;
            var hide = this.cls.hide;
            var inputs = this._layerControlInputs || container.getElementsByTagName('input');
            for (var i = 0; i < inputs.length; i++) {
                // Loop over every (valid) input.
                var input = inputs[i];
                if (this._getLayer && !!this._getLayer(input.layerId).overlay != !!overlay) continue;
                if (input.checked) {
                    // Get out of the header,
                    // to not open the posible (but rare) children
                    iter(input.parentElement.parentElement.parentElement.parentElement);
                }
            }
            return this._localExpand();
        },

        // "private" methods, not exposed in the API
        _sect: function() {
            // to keep compatibility after 1.3 https://github.com/Leaflet/Leaflet/pull/6380
            return this._section || this._form;
        },

        _setTrees: function(base, overlays) {
            var id = 0; // to keep unique id
            function iterate(tree, output, overlays) {
                if (tree && tree.layer) {
                    if (!overlays) {
                        tree.layer._layersTreeName = tree.name || tree.label;
                    }
                    output[id++] = tree.layer;
                }
                if (tree && tree.children && tree.children.length) {
                    tree.children.forEach(function(child) {
                        iterate(child, output, overlays);
                    });
                }
                return output;
            }

            // We accept arrays, but convert into an object with children
            function forArrays(input) {
                if (Array.isArray(input)) {
                    return {noShow: true, children: input};
                } else {
                    return input;
                }
            }

            // Clean everything, and start again.
            if (this._layerControlInputs) {
                this._layerControlInputs = [];
            }
            for (var i = 0; i < this._layers.length; ++i) {
                this._layers[i].layer.off('add remove', this._onLayerChange, this);
            }
            this._layers = [];

            if (base !== undefined) this._baseTree = forArrays(base);
            if (overlays !== undefined) this._overlaysTree = forArrays(overlays);

            var bflat = iterate(this._baseTree, {});
            for (var i in bflat) {
                this._addLayer(bflat[i], i);
            }

            var oflat = iterate(this._overlaysTree, {}, true);
            for (i in oflat) {
                this._addLayer(oflat[i], i, true);
            }
            return (this._map) ? this._update() : this;
        },

        // Used to update the vertical scrollbar
        _localExpand: function() {
            if (this._map && L.DomUtil.hasClass(this._container, 'leaflet-control-layers-expanded')) {
                var top = this._sect().scrollTop;
                /*this.expand();*/
                this._sect().scrollTop = top; // to keep the scroll location
                this._scrollTop = top;
            }
            return this;
        },

        // collapses or expands the tree in the containter.
        _applyOnTree: function(container, collapse) {
            var iters = [
                {cls: this.cls.children, hide: collapse},
                {cls: this.cls.opened, hide: collapse},
                {cls: this.cls.closed, hide: !collapse},
            ];
            iters.forEach(function(it) {
                var els = container.getElementsByClassName(it.cls);
                for (var i = 0; i < els.length; i++) {
                    var el = els[i];
                    if (L.DomUtil.hasClass(el, this.cls.childrenNopad)) {
                        // do nothing
                    } else if (it.hide) {
                        L.DomUtil.addClass(el, this.cls.hide);
                    } else {
                        L.DomUtil.removeClass(el, this.cls.hide);
                    }
                }
            }, this);
        },

        // it is called in the original _update, and shouldn't do anything.
        _addItem: function(obj) {
        },

        // overwrite _update function in Control.Layers
        _update: function() {
            if (!this._container) { return this; }
            L.Control.Layers.prototype._update.call(this);
            this._addTreeLayout(this._baseTree, false);
            this._addTreeLayout(this._overlaysTree, true);
            return this._localExpand();
        },

        // Create the DOM objects for the tree
        _addTreeLayout: function(tree, overlay) {
            if (!tree) return;
            var container = overlay ? this._overlaysList : this._baseLayersList;
            this._expandCollapseAll(overlay, this.options.collapseAll, this.collapseTree);
            this._expandCollapseAll(overlay, this.options.expandAll, this.expandTree);
            this._iterateTreeLayout(tree, container, overlay, [], tree.noShow);
            if (this._checkDisabledLayers) {
                // to keep compatibility
                this._checkDisabledLayers();
            }
        },

        // Create the "Collapse all" or expand, if needed.
        _expandCollapseAll: function(overlay, text, fn, ctx) {
            var container = overlay ? this._overlaysList : this._baseLayersList;
            ctx = ctx ? ctx : this;
            if (text) {
                var o = document.createElement('div');
                o.className = 'leaflet-layerstree-expand-collapse';
                container.appendChild(o);
                o.innerHTML = text;
                o.tabIndex = 0;
                L.DomEvent.on(o, 'click keydown', function(e) {
                    if (e.type !== 'keydown' || e.keyCode === 32) {
                        o.blur();
                        fn.call(ctx, overlay);
                        this._localExpand();
                    }
                }, this);
            }
        },

        // recursive funtion to create the DOM children
        _iterateTreeLayout: function(tree, container, overlay, selAllNodes, noShow) {
            if (!tree) return;
            function creator(type, cls, append, innerHTML) {
                var obj = L.DomUtil.create(type, cls, append);
                if (innerHTML) obj.innerHTML = innerHTML;
                return obj;
            }

            // create the header with it fields
            var header = creator('div', this.cls.header, container);
            var sel = creator('span');
            var entry = creator('span');
            var closed = creator('span', this.cls.closed, sel, this.options.closedSymbol);
            var opened = creator('span', this.cls.opened, sel, this.options.openedSymbol);
            var space = creator('span', this.cls.space, null, this.options.spaceSymbol);
            if (this.options.selectorBack) {
                sel.insertBefore(space, closed);
                header.appendChild(entry);
                header.appendChild(sel);
            } else {
                sel.appendChild(space);
                header.appendChild(sel);
                header.appendChild(entry);
            }

            function updateSelAllCheckbox(ancestor) {
                var selector = ancestor.querySelector('input[type=checkbox]');
                var selectedAll = true;
                var selectedNone = true;
                var inputs = ancestor.querySelectorAll('input[type=checkbox]');
                [].forEach.call(inputs, function(inp) { // to work in node for tests
                    if (inp === selector) {
                        // ignore
                    } else if (inp.indeterminate) {
                        selectedAll = false;
                        selectedNone = false;
                    } else if (inp.checked) {
                        selectedNone = false;
                    } else if (!inp.checked) {
                        selectedAll = false;
                    }
                });
                if (selectedAll) {
                    selector.indeterminate = false;
                    selector.checked = true;
                } else if (selectedNone) {
                    selector.indeterminate = false;
                    selector.checked = false;
                } else {
                    selector.indeterminate = true;
                    selector.checked = false;
                }
            }

            function manageSelectorsAll(input, ctx) {
                selAllNodes.forEach(function(ancestor) {
                    L.DomEvent.on(input, 'click', function(ev) {
                        updateSelAllCheckbox(ancestor);
                    }, ctx);
                }, ctx);
            }

            var selAll;
            if (tree.selectAllCheckbox) {
                selAll = this._createCheckboxElement(false);
                selAll.className += ' ' + this.cls.selAllCheckbox;
            }

            var hide = this.cls.hide; // To toggle state
            // create the children group, with the header event click
            if (tree.children) {
                var children = creator('div', this.cls.children, container);
                var sensible = tree.layer ? sel : header;
                L.DomUtil.addClass(sensible, this.cls.pointer);
                sensible.tabIndex = 0;
                L.DomEvent.on(sensible, 'click keydown', function(e) {
                    if (e.type === 'keydown' && e.keyCode !== 32) {
                        return;
                    }
                    sensible.blur();

                    if (L.DomUtil.hasClass(opened, hide)) {
                        // it is not opened, so open it
                        L.DomUtil.addClass(closed, hide);
                        L.DomUtil.removeClass(opened, hide);
                        L.DomUtil.removeClass(children, hide);
                    } else {
                        // close it
                        L.DomUtil.removeClass(closed, hide);
                        L.DomUtil.addClass(opened, hide);
                        L.DomUtil.addClass(children, hide);
                    }
                    this._localExpand();
                }, this);
                if (selAll) {
                    selAllNodes.splice(0, 0, container);
                }
                tree.children.forEach(function(child) {
                    var node = creator('div', this.cls.node, children);
                    this._iterateTreeLayout(child, node, overlay, selAllNodes);
                }, this);
                if (selAll) {
                    selAllNodes.splice(0, 1);
                }
            } else {
                // no children, so the selector makes no sense.
                L.DomUtil.addClass(sel, this.cls.neverShow);
            }

            // make (or not) the label clickable to toggle the layer
            var labelType;
            if (tree.layer) {
                if ((this.options.labelIsSelector === 'both') || // if option is set to both
                    (overlay && this.options.labelIsSelector === 'overlay') || // if an overlay layer and options is set to overlay
                    (!overlay && this.options.labelIsSelector === 'base')) { // if a base layer and option is set to base
                    labelType = 'label';
                } else { // if option is set to something else
                    labelType = 'span';
                }
            } else {
                labelType = 'span';
            }
            // create the input and label
            var label = creator(labelType, this.cls.label, entry);
            if (tree.layer) {
                // now create the element like in _addItem
                var checked = this._map.hasLayer(tree.layer);
                var input;
                var radioGroup = overlay ? tree.radioGroup : 'leaflet-base-layers_' + L.Util.stamp(this);
                if (radioGroup) {
                    input = this._createRadioElement(radioGroup, checked);
                } else {
                    input = this._createCheckboxElement(checked);
                    manageSelectorsAll(input, this);
                }
                if (this._layerControlInputs) {
                    // to keep compatibility with 1.0.3
                    this._layerControlInputs.push(input);
                }
                input.layerId = L.Util.stamp(tree.layer);
                L.DomEvent.on(input, 'click', this._onInputClick, this);
                label.appendChild(input);
            }

            function isText(variable) {
                return (typeof variable === 'string' || variable instanceof String);
            }

            function isFunction(functionToCheck) {
                return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
            }

            function selectAllCheckboxes(select, ctx) {
                var inputs = container.getElementsByTagName('input');
                for (var i = 0; i < inputs.length; i++) {
                    var input = inputs[i];
                    if (input.type !== 'checkbox') continue;
                    input.checked = select;
                    input.indeterminate = false;
                }
                ctx._onInputClick();
            }
            if (tree.selectAllCheckbox) {
                // selAll is already created
                label.appendChild(selAll);
                if (isText(tree.selectAllCheckbox)) {
                    selAll.title = tree.selectAllCheckbox;
                }
                L.DomEvent.on(selAll, 'click', function(ev) {
                    ev.stopPropagation();
                    selectAllCheckboxes(selAll.checked, this);
                }, this);
                updateSelAllCheckbox(container);
                manageSelectorsAll(selAll, this);
            }

            var name = creator('span', this.cls.name, label, tree.label);

            // hide the button which doesn't fit the collapsed state, then hide children conditionally
            L.DomUtil.addClass(tree.collapsed ? opened : closed, hide);
            tree.collapsed && children && L.DomUtil.addClass(children, hide);

            if (noShow) {
                L.DomUtil.addClass(header, this.cls.neverShow);
                L.DomUtil.addClass(children, this.cls.childrenNopad);
            }

            var eventeds = tree.eventedClasses;
            if (!(eventeds instanceof Array)) {
                eventeds = [eventeds];
            }

            for (var e = 0; e < eventeds.length; e++) {
                var evented = eventeds[e];
                if (evented && evented.className) {
                    var obj = container.querySelector('.' + evented.className);
                    if (obj) {
                        L.DomEvent.on(obj, evented.event || 'click', (function(selectAll) {
                            return function(ev) {
                                ev.stopPropagation();
                                var select = isFunction(selectAll) ? selectAll(ev, container, tree, this._map) : selectAll;
                                if (select !== undefined && select !== null) {
                                    selectAllCheckboxes(select, this);
                                }
                            };
                        })(evented.selectAll), this);
                    }
                }
            }
        },

        _createCheckboxElement: function(checked) {
            var input = document.createElement('input');
            input.type = 'checkbox';
            input.className = 'leaflet-control-layers-selector';
            input.defaultChecked = checked;
            return input;
        },

    });

    L.control.layers.tree = function(base, overlays, options) {
        return new L.Control.Layers.Tree(base, overlays, options);
    };

})(L);






//-----------------------------------------------//
//----------       Polygon Datas       ----------//
//-----------------------------------------------//

var FreshwaterData = {"type":"FeatureCollection","features":
[

    //-----  no fish  -----//
    {
        "type":"Feature",
        "id":"0",
        "properties":
            {
            "name_EN":"(no fish)",
            "name_KR":"(물고기 없음)",
            "fishGroup": [],
            "locationColor": "black",

        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Mediah Castle(1)*/[[37.46, -38.41],[37.52, -38.38],[37.61, -38.46],[37.81, -38.36],[37.84, -38.40],[37.64, -38.51],[37.56, -38.51]],
            /*Mediah Caslte(2)*/[[37.84, -38.75],[37.54, -38.79],[37.54, -38.84],[37.84, -38.81]],
            /*Kamasylvia Vicinity*/[[-8.57, -58.44],[-8.44, -58.46],[-8.30, -58.36],[-8.29, -58.26],[-8.38, -58.21],[-8.36, -58.14],[-8.44, -58.11],[-8.50, -58.23],[-8.66, -58.20],[-8.73, -58.25],[-8.61, -58.29]],
            /*Kamasylvia Tooth Fairy Cabin(1)*/[[-34.49, -60.02],[-34.54, -60.19],[-34.50, -60.28],[-34.63, -60.34],[-34.71, -60.49],[-34.36, -60.52],[-34.46, -60.41],[-34.41, -60.25],[-34.37, -60.24],[-34.32, -60.14],[-34.37, -60.10],[-34.38, -60.02]],
            /*Kamasylvia Tooth Fairy Cabin(2)*/[[-32.46, -59.90],[-32.35, -59.87],[-32.29, -60.05],[-32.23, -60.08],[-32.24, -60.11],[-32.33, -60.11],[-32.58, -60.39],[-32.60, -60.47],[-32.67, -60.50],[-32.68, -60.53],[-32.66, -60.55],[-32.71, -60.58],[-32.80, -60.57],[-32.80, -60.54],[-32.76, -60.53],[-32.67, -60.42],[-32.64, -60.24],[-32.52, -60.19],[-32.44, -59.95]],
            /*Kamasylvia Grana(1)*/[[-29.82, -64.77],[-29.69, -64.79],[-29.68, -64.86],[-29.75, -64.87],[-29.79, -64.93],[-29.88, -64.92],[-29.89, -64.80]],
            /*Kamasylvia Grana(2)*/[[-29.46, -64.80],[-29.34, -64.79],[-29.31, -64.81],[-29.34, -64.86],[-29.28, -64.91],[-29.46, -64.91],[-29.42, -64.83]],
            /*Kamasylvia Atanis Pond*/[[-29.63, -65.71],[-29.64, -65.73],[-29.53, -65.73],[-29.51, -65.68],[-29.54, -65.63],[-29.61, -65.63],[-29.57, -65.69]],
            /*Kamasylvia Lonney Cabin*/[[-35.07, -63.90],[-34.97, -63.88],[-34.70, -63.91],[-34.72, -63.95],[-34.77, -63.96],[-34.87, -63.92],[-34.96, -63.92]],
            /*Duvencrune(spa)*/[[8.16, -61.71],[8.24, -61.70],[8.30, -61.71],[8.27, -61.74],[8.19, -61.75],[8.14, -61.73]],
            /*Duvencrune(north)*/[[7.66, -60.16],[7.64, -60.15],[7.70, -60.14],[7.70, -60.09],[7.61, -60.09],[7.49, -60.14],[7.59, -60.17],[7.60, -60.19]],
            /*Garmoth's Nest*/[[10.49, -58.95],[10.63, -58.90],[10.45, -58.80],[10.28, -58.76],[10.22, -58.82]],
            /*Crioville*/[[-14.85, -56.31],[-14.78, -56.31],[-14.71, -56.40],[-14.76, -56.50],[-14.82, -56.47]],
            /*Port Epheria*/[[-17.90, -40.52],[-17.84, -40.62],[-17.90, -40.77],[-18.08, -40.90],[-18.15, -40.81],[-17.96, -40.69]],
            /*Calpheon Northwestern Outpost*/[[-27.42, -42.98],[-27.19, -43.00],[-27.15, -43.18],[-27.41, -43.14]],
            /*Calpheon Castle*/[[-17.43, -45.18],[-17.48, -45.27],[-16.97, -45.86],[-16.47, -45.71],[-16.26, -45.53],[-16.56, -45.18],[-16.97, -45.07],[-17.26, -45.09]],
            /*Behr*/[[-11.44, -54.45],[-11.39, -54.47],[-11.63, -54.58],[-11.66, -54.62],[-11.76, -54.71],[-11.91, -54.79],[-11.95, -54.85],[-12.15, -54.97],[-12.28, -55.04],[-12.41, -55.18],[-12.41, -55.26],[-12.52, -55.33],[-12.65, -55.41],[-12.91, -55.47],[-12.94, -55.45],[-12.87, -55.40],[-12.62, -55.33],[-12.47, -55.23],[-12.46, -55.15],[-12.32, -55.00],[-12.02, -54.83],[-12.00, -54.80],[-11.82, -54.69],[-11.70, -54.56]],
            /*Behr Riverhead*/[[-12.88, -52.33],[-12.74, -52.32],[-12.66, -52.35],[-12.55, -52.31],[-12.46, -52.33],[-12.36, -52.32],[-12.18, -52.37],[-11.97, -52.37],[-11.76, -52.40],[-11.58, -52.37],[-11.37, -52.36],[-11.14, -52.28],[-11.01, -52.28],[-11.02, -52.31],[-11.12, -52.31],[-11.15, -52.33],[-11.32, -52.39],[-11.52, -52.39],[-11.60, -52.42],[-11.83, -52.43],[-12.02, -52.41],[-12.22, -52.40],[-12.33, -52.37],[-12.47, -52.38],[-12.59, -52.43],[-12.68, -52.46],[-12.84, -52.47],[-12.95, -52.40]],
            /*Witch's Chapel(1)*/[[-3.75, -56.05],[-3.73, -56.14],[-3.62, -56.13],[-3.50, -56.03],[-3.58, -55.97],[-3.70, -55.98]],
            /*Witch's Chapel(2)*/[[-2.42, -56.30],[-2.38, -56.33],[-2.35, -56.33],[-2.20, -56.23],[-2.17, -56.24],[-2.14, -56.24],[-2.14, -56.21],[-1.96, -56.13],[-1.94, -56.12],[-1.80, -55.99],[-1.74, -55.90],[-1.64, -55.76],[-1.58, -55.73],[-1.69, -55.69],[-1.70, -55.75],[-1.78, -55.86],[-1.81, -55.92],[-1.84, -55.95],[-1.85, -55.98],[-2.00, -56.11],[-2.32, -56.24]],
            /*Rhua Tree Stub*/[[-8.72, -53.31],[-8.78, -53.40],[-8.77, -53.49],[-8.82, -53.56],[-8.80, -53.60],[-8.52, -53.59],[-8.34, -53.47],[-8.34, -53.43],[-8.48, -53.35],[-8.48, -53.31],[-8.58, -53.25]],
            /*Star's End*/[[-26.36, -46.56],[-26.31, -46.62],[-26.21, -46.71],[-26.22, -46.77],[-26.10, -46.94],[-26.05, -47.03],[-26.07, -47.07],[-26.02, -47.14],[-26.05, -47.21],[-26.02, -47.26],[-26.03, -47.28],[-25.99, -47.28],[-25.99, -47.23],[-26.00, -47.20],[-25.97, -47.14],[-26.02, -47.05],[-26.00, -47.00],[-25.97, -47.00],[-25.95, -46.94],[-26.02, -46.94],[-26.05, -46.96],[-26.16, -46.80],[-26.15, -46.77],[-26.17, -46.68],[-26.23, -46.57],[-26.29, -46.56],[-26.28, -46.51],[-26.11, -46.37],[-26.01, -46.32],[-25.60, -46.31],[-25.53, -46.35],[-25.54, -46.37],[-25.50, -46.38],[-25.47, -46.36],[-25.32, -46.43],[-25.30, -46.42],[-25.43, -46.32],[-25.50, -46.32],[-25.60, -46.27],[-25.70, -46.27],[-25.78, -46.29],[-26.05, -46.28],[-26.22, -46.39],[-26.34, -46.50],[-26.93, -46.17],[-27.17, -46.11],[-27.26, -46.11],[-27.32, -46.08],[-27.30, -45.84],[-27.44, -45.75],[-27.65, -45.81],[-27.97, -45.96],[-27.98, -46.09],[-27.73, -46.22],[-27.33, -46.14],[-27.17, -46.15],[-26.98, -46.20]],
            /*Isolated Sentry Post*/[[-13.59, -42.38],[-13.50, -42.40],[-13.47, -42.47],[-13.50, -42.56],[-13.57, -42.58],[-13.72, -42.40]],
            /*Phoniel's Cabin*/[[-11.97, -49.30],[-11.79, -49.25],[-12.04, -49.15],[-12.26, -49.14],[-12.34, -49.07],[-12.55, -49.30],[-12.33, -49.40],[-12.35, -49.46],[-12.23, -49.51],[-12.25, -49.39],[-12.21, -49.29],[-12.16, -49.27]],
            /*Abandoned Monastery(1)*/[[-17.85, -52.07],[-17.95, -52.06],[-17.96, -52.13],[-17.89, -52.23],[-17.79, -52.22],[-17.69, -52.15],[-17.71, -52.12],[-17.81, -52.14]],
            /*Abandoned Monastery(2)*/[[-17.65, -51.99],[-17.70, -52.04],[-17.57, -52.14],[-17.38, -52.15],[-17.27, -52.12],[-17.27, -52.07],[-17.38, -52.02],[-17.45, -52.06],[-17.54, -52.01]],
            /*Abandoned Monastery(3)*/[[-17.81, -52.46],[-17.87, -52.50],[-17.76, -52.55],[-17.52, -52.52],[-17.45, -52.38],[-17.49, -52.33],[-17.54, -52.36],[-17.56, -52.43],[-17.65, -52.49]],
            /*Calpheon City*/[[-10.97, -45.92],[-10.95, -46.00],[-10.90, -45.97],[-10.82, -46.01],[-10.81, -46.04],[-10.73, -46.01],[-10.62, -46.01],[-10.60, -46.04],[-10.34, -45.96],[-10.29, -46.02],[-10.02, -45.93],[-10.06, -45.89],[-10.28, -45.97],[-10.46, -45.73],[-10.74, -45.81]],
            /*Delphe Knights Castle*/[[0.78, -45.21],[0.81, -45.18],[0.84, -45.21],[0.81, -45.24]],
            /*Lake Kaia*/[[-14.65, -46.42],[-14.52, -46.28],[-14.46, -46.24],[-14.35, -46.26],[-14.48, -46.32],[-14.48, -46.38],[-14.46, -46.40]],
            /*Glutoni Cave*/[[-2.57, -50.38],[-2.39, -50.34],[-2.37, -50.25],[-2.30, -50.25],[-2.30, -50.22],[-2.20, -50.23],[-2.28, -50.10],[-2.40, -50.02],[-2.57, -50.04],[-2.63, -50.11],[-2.66, -50.27]],
            /*Calpheon Northwestern Outpost*/[[-24.06, -41.76],[-24.01, -41.73],[-24.22, -41.57],[-24.25, -41.51],[-24.53, -41.36],[-24.59, -41.33],[-25.06, -41.30],[-25.13, -41.25],[-25.21, -41.24],[-25.42, -41.11],[-25.46, -41.12],[-25.31, -41.24],[-25.15, -41.27],[-25.00, -41.36],[-24.63, -41.37],[-24.33, -41.55]],
            /*Bree Tree Ruins Underground*/[[-6.21, -38.66],[-6.34, -38.71],[-6.36, -38.62]],
            /*Waragon Cave*/[[-5.43, -42.50],[-5.47, -42.42],[-5.48, -42.25],[-5.35, -42.21],[-5.24, -42.18],[-5.10, -41.85],[-4.84, -41.80],[-4.73, -41.82],[-4.71, -41.88],[-4.85, -41.84],[-5.00, -41.92],[-5.08, -42.04],[-5.14, -42.19],[-5.04, -42.24],[-5.03, -42.38],[-5.12, -42.53]],
            /*Khuruto Cave(1)*/[[-1.90, -43.21],[-2.02, -43.22],[-2.07, -43.27],[-2.03, -43.34],[-1.94, -43.29],[-1.83, -43.34],[-1.72, -43.33],[-1.63, -43.30],[-1.55, -43.18],[-1.65, -43.13],[-1.34, -42.90],[-1.39, -42.89],[-1.68, -43.04],[-1.82, -43.25]],
            /*Khuruto Cave(2)*/[[0.27, -42.26],[0.09, -42.36],[-0.12, -42.33],[-0.30, -42.41],[-0.23, -42.51],[-0.40, -42.63],[-0.49, -42.70],[-0.57, -42.78],[-0.66, -42.71],[-0.47, -42.43],[-0.31, -42.29],[0.21, -42.15]],
            /*Khuruto Cave(3)*/[[-0.65, -43.10],[-0.96, -43.20],[-1.02, -43.27],[-0.96, -43.33],[-1.15, -43.36],[-1.18, -43.31],[-1.09, -43.17],[-0.78, -42.97]],
            /*Khuruto Cave(4)*/[[-1.53, -43.83],[-1.52, -43.78],[-1.42, -43.71],[-1.30, -43.75]],
            /*Khuruto Cave(5)*/[[-1.25, -43.86],[-1.26, -43.81],[-1.21, -43.86]],
            /*Southern Neutral Zone*/[[5.60, -50.04],[5.58, -49.97],[5.65, -49.93],[5.87, -49.96],[5.91, -50.07],[5.73, -50.06]],
            /*Orc Camp(1)*/[[4.94, -47.03],[5.02, -47.03],[5.03, -46.97],[4.96, -46.97]],
            /*Orc Camp(2)*/[[5.55, -47.01],[5.61, -46.98],[5.58, -46.92],[5.63, -46.84],[5.69, -46.82],[5.70, -46.86],[5.76, -46.84],[5.81, -46.84],[5.80, -46.89],[5.76, -46.90],[5.78, -46.96],[5.73, -47.01],[5.64, -47.03]],
            /*Orc Camp(3)*/[[5.77, -46.36],[5.80, -46.32],[5.86, -46.32],[5.88, -46.36],[5.86, -46.41],[5.79, -46.41]],
            /*Secret Cave(Bloody Monastery(west))*/[[7.60, -50.64],[7.50, -50.73],[7.53, -50.76],[7.61, -50.70]],
            /*Kamasylve Temple*/[[23.75, -44.48],[23.82, -44.47],[23.85, -44.54],[23.80, -44.57],[23.72, -44.54]],
            /*Kunid's Vacation Spot(north)*/[[45.74, -33.80],[45.71, -34.02],[45.63, -34.06],[45.66, -34.13],[45.61, -34.28],[45.74, -34.28],[45.74, -34.07],[45.83, -34.01],[45.82, -33.80]],
            /*Leical Falls*/[[44.26, -33.26],[44.27, -33.21],[44.19, -33.23],[44.01, -33.38],[43.95, -33.48],[44.00, -33.50],[44.06, -33.39],[44.20, -33.26]],
            /*Basilisk Den(1)*/[[42.49, -38.84],[42.59, -38.86],[42.68, -39.01],[42.45, -38.91]],
            /*Basilisk Den(2)*/[[43.32, -39.13],[43.30, -39.06],[43.40, -38.89],[43.51, -38.93],[43.51, -39.11]],
            
            /*Roud Sulfur Works(1)*/[[101.26, -12.03],[101.26, -11.97],[101.42, -11.97],[101.51, -12.01],[101.40, -12.07]],
            /*Roud Sulfur Works(2)*/[[101.63, -12.03],[101.63, -12.13],[101.84, -12.15],[101.87, -12.08],[101.84, -11.98],[101.73, -11.97]],
            /*Roud Sulfur Works(3)*/[[102.43, -11.48],[102.49, -11.40],[102.55, -11.46],[102.49, -11.53]],
            /*Roud Sulfur Works(4)*/[[102.98, -11.52],[103.07, -11.52],[103.07, -11.44],[102.98, -11.44]],
            /*Roud Sulfur Works(north)*/[[99.86, -9.10],[99.95, -9.19],[100.02, -9.12],[100.03, -9.05],[99.95, -9.00],[99.87, -8.98],[99.83, -9.05]],
            /*Roud Sulfur Works(east1)*/[[105.24, -12.27],[105.25, -12.37],[105.31, -12.39],[105.40, -12.34],[105.40, -12.24],[105.35, -12.21],[105.28, -12.22]],
            /*Roud Sulfur Works(east2)*/[[105.96, -12.03],[105.93, -12.15],[106.00, -12.15],[106.02, -12.06]],
            /*Arehaza Town(north)*/[[115.79, -26.09],[115.84, -26.14],[115.89, -26.15],[115.88, -26.10],[115.84, -26.05]],
            /*Heidel*/[[15.86, -44.64],[15.93, -44.59],[15.87, -44.56],[15.82, -44.60]],
            /*Atosa's Villa(south1)*/[[82.52, -48.65],[82.58, -48.64],[82.70, -48.78],[82.70, -48.85],[82.56, -48.85],[82.52, -48.76]],
            /*Atosa's Villa(south2)*/[[84.36, -50.14],[84.36, -50.18],[84.45, -50.22],[84.51, -50.20],[84.51, -50.16],[84.41, -50.14]],
            /*Valencia City(1)*/[[96.05, -27.85],[96.05, -27.99],[96.26, -27.98],[96.25, -27.84]],
            /*Valencia City(2)*/[[97.85, -27.37],[97.88, -27.32],[97.94, -27.35],[97.91, -27.41]],
            /*Valencia City(3)*/[[97.58, -28.44],[97.66, -28.44],[97.66, -28.37],[97.57, -28.37]],
            /*Valencia City(4)*/[[98.07, -27.95],[98.04, -28.00],[98.11, -28.02],[98.14, -27.97]],
            /*Valencia City(5)*/[[98.09, -27.91],[98.16, -27.94],[98.18, -27.90],[98.11, -27.86]],
            /*Valencia City(6)*/[[98.14, -28.62],[98.11, -28.66],[98.18, -28.69],[98.20, -28.64]],
            /*Valencia City(east1)*/[[100.23, -28.57],[100.16, -28.57],[100.16, -28.39],[100.12, -28.35],[100.16, -28.31],[100.22, -28.35],[100.23, -28.49],[100.27, -28.53]],
            /*Valencia City(east2)*/[[100.01, -27.97],[100.05, -27.94],[100.08, -27.99],[100.12, -27.96],[100.16, -27.96],[100.13, -28.00],[100.15, -28.08],[100.10, -28.19],[100.13, -28.24],[100.06, -28.28],[99.96, -28.17],[100.00, -28.14],[99.96, -28.11],[100.05, -28.07]],
            /*Valencia City(north3)*/[[93.85, -25.79],[93.91, -25.82],[93.87, -25.86],[93.91, -25.89],[94.01, -25.80],[93.91, -25.77]],
            /*Valencia City(north7)*/[[94.65, -25.20],[94.62, -25.26],[94.56, -25.25]],
            /*Valencia Plantation*/[[93.17, -29.82],[93.07, -29.90],[93.07, -29.98],[93.27, -30.20],[93.42, -30.18],[93.43, -30.14],[93.46, -30.14],[93.49, -30.19],[93.61, -30.15],[94.01, -30.15],[94.35, -29.95],[94.48, -29.81],[94.40, -29.75],[94.38, -29.66],[94.23, -29.65],[94.05, -29.69],[94.05, -29.77],[94.08, -29.84],[93.97, -29.91],[93.91, -29.80],[93.81, -29.82],[93.81, -29.96],[93.76, -29.96],[93.79, -30.00],[93.79, -30.04],[93.77, -30.06],[93.70, -30.06],[93.65, -30.03],[93.65, -29.99],[93.72, -29.93],[93.70, -29.86],[93.61, -29.81],[93.43, -29.85]],
            /*Valencia Castle(1)*/[[107.74, -21.21],[107.79, -21.18],[107.82, -21.23],[107.77, -21.25]],
            /*Valencia Castle(2)*/[[107.99, -20.96],[108.02, -21.06],[108.07, -21.02],[108.05, -20.98],[108.11, -20.96],[108.19, -20.98],[108.26, -21.13],[108.19, -21.16],[108.19, -21.21],[108.29, -21.18],[108.32, -21.12],[108.23, -20.95],[108.11, -20.91]],
            /*Salanar Pond*/[[-5.21, -68.85],[-5.26, -68.81],[-5.38, -68.85],[-5.30, -68.88]],
            /*O'draxxia(1)*/[[-0.91, -68.53],[-0.83, -68.52],[-0.80, -68.56],[-0.88, -68.57]],
            /*Blade Narrows*/[[-2.87, -69.86],[-2.80, -69.89],[-2.88, -69.90],[-2.98, -69.96],[-3.16, -69.99],[-3.21, -70.01],[-3.48, -70.05],[-3.54, -70.02],[-3.50, -70.00],[-3.32, -69.99],[-3.21, -69.95],[-3.08, -69.95],[-2.96, -69.88]],
            /*Tunkuta*/[[-14.94, -67.33],[-14.77, -67.31],[-14.68, -67.32],[-14.64, -67.41],[-14.75, -67.44],[-14.93, -67.43],[-15.01, -67.41],[-14.94, -67.38]],
            /*Protty Cave(1)*/[[15.34, -24.63],[15.32, -24.51],[15.42, -24.48],[15.42, -24.61]],
            /*Protty Cave(2)*/[[15.95, -24.90],[15.98, -25.08],[16.08, -25.08],[16.21, -24.99],[16.00, -24.87]],
            /*Protty Cave(3)*/[[15.63, -25.78],[15.60, -25.96],[15.48, -26.10],[15.33, -26.04],[15.06, -26.16],[14.88, -26.04],[14.93, -25.91],[15.34, -25.84],[15.45, -25.80],[15.54, -25.76]],
            /*Protty Cave(4)*/[[14.99, -24.53],[15.00, -24.50],[15.13, -24.52],[15.07, -24.56]],
            /*Rumbling Land(secret cave 1)*/[[20.59, -41.97],[20.55, -41.95],[20.58, -41.93],[20.66, -41.91],[20.66, -41.98]],
            /*Rumbling Land(secret cave 2)*/[[21.73, -41.72],[21.73, -41.76],[21.77, -41.78],[21.79, -41.74]],
            /*Rumbling Land(secret cave 2)*/[[21.91, -41.87],[21.89, -41.89],[21.93, -41.91],[21.95, -41.89]],
            /*Lynch Ranch(secret cave)*/[[7.82, -42.87],[7.77, -42.86],[7.81, -42.81],[7.88, -42.83]],
            /*Quint Hill*/[[-12.33, -39.98],[-12.23, -40.02],[-12.29, -40.09],[-12.44, -40.06],[-12.45, -39.98]],
            /*Glish(secret cave 1)*/[[11.54, -48.10],[11.62, -48.10],[11.62, -48.06],[11.67, -48.10],[11.62, -48.14]],
            /*Glish(secret cave 2)*/[[11.81, -47.87],[11.82, -47.78],[11.77, -47.77],[11.79, -47.74],[12.01, -47.78],[12.03, -47.82],[11.98, -47.86],[11.98, -47.92],[11.91, -47.88]],
            /*Central Guard Camp(secret cave)*/[[14.38, -47.75],[14.36, -47.78],[14.29, -47.77],[14.29, -47.85],[14.08, -47.82],[14.06, -47.74],[14.15, -47.69],[14.23, -47.71],[14.25, -47.74],[14.22, -47.75],[14.17, -47.74],[14.10, -47.75],[14.13, -47.80],[14.24, -47.81],[14.25, -47.76],[14.37, -47.72]],
            /*Bloody Monastery(secret cave)*/[[11.72, -51.22],[11.77, -51.25],[11.79, -51.23]],
            /*Serendia Shrine(secret cave)*/[[16.80, -50.79],[16.83, -50.74],[16.90, -50.75],[17.03, -50.82],[17.06, -50.83],[17.14, -50.88],[17.09, -50.95],[17.02, -50.93],[16.86, -50.80]],
            /*Elric Shrine(secret cave)*/[[26.96, -36.81],[27.04, -36.85],[26.99, -36.89],[26.92, -36.88]],
            /*Abyssal Zone of the Sycraia Underwater Ruins(1)*/[[24.40, -12.62],[24.58, -12.62],[24.50, -12.55],[24.44, -12.55]],
            /*Abyssal Zone of the Sycraia Underwater Ruins(2)*/[[22.96, -11.96],[22.88, -12.17],[22.94, -12.29],[23.26, -12.34],[23.39, -12.21],[23.35, -12.00]],
            /*Abyssal Zone of the Sycraia Underwater Ruins(3)*/[[23.41, -10.54],[23.54, -10.58],[23.54, -10.82],[23.12, -10.89],[23.18, -10.68]],
            /*Oberin's Villa*/[[106.88, -44.11],[106.96, -44.11],[106.96, -44.05],[106.88, -44.05]],
            /*Karashu's Villa(1)*/[[49.20, -42.49],[49.26, -42.49],[49.25, -42.55],[49.20, -42.54]],
            /*Karashu's Villa(2)*/[[49.68, -42.47],[49.69, -42.42],[49.77, -42.43],[49.76, -42.48]],
            /*Atosa's Villa*/[[84.36, -47.51],[84.39, -47.55],[84.47, -47.52],[84.43, -47.48]],
            /*Alsabi's Villa(1)*/[[56.98, -23.02],[56.99, -22.97],[56.89, -22.95],[56.88, -23.01]],
            /*Alsabi's Villa(2)*/[[57.11, -22.96],[57.16, -22.97],[57.17, -22.92],[57.12, -22.91]],
            /*Gahaz's Villa*/[[64.07, -15.86],[64.12, -15.83],[64.15, -15.88],[64.11, -15.91]],
            /*Marzana's Villa*/[[90.92, -16.26],[90.97, -16.23],[91.01, -16.28],[90.94, -16.30]],
            /*Shandi's Villa*/[[98.86, -29.91],[98.90, -29.91],[98.90, -29.96],[98.86, -29.96]],
        ]]
            }                
        },


    //-----  Green Fish only  -----//
    {
        "type":"Feature",
        "id":"1",
        "properties":
            {
            "name_EN":"(Sandeel area)",
            "name_KR":"(까나리 지역)",
            "fishGroup": ["Sandeel"],
            "locationColor": "#909090",

        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Mediah Castle(1)*/[[36.45, -36.56],[36.45, -36.91],[36.37, -36.87],[36.30, -36.88],[36.23, -36.81],[36.27, -36.77],[36.32, -36.77],[36.38, -36.72],[36.39, -36.63]],
            /*Mediah Castle(2)*/[[36.45, -37.14],[36.34, -37.46],[36.25, -37.25],[36.28, -37.19],[36.41, -37.11]],
            /*Mediah Castle(3)*/[[36.32, -37.68],[36.15, -37.94],[36.14, -37.82],[36.16, -37.75],[36.23, -37.69]],
            /*Mediah Castle(4)*/[[36.11, -38.07],[36.07, -38.31],[36.04, -38.19],[36.06, -38.10]],
            /*Mediah Castle(5)*/[[36.04, -38.41],[35.69, -38.93],[35.66, -38.85],[35.73, -38.76],[35.74, -38.69],[35.80, -38.65],[35.83, -38.58],[35.80, -38.55],[35.83, -38.51],[35.93, -38.42]],
            /*Mediah Castle(6)*/[[35.41, -39.07],[35.35, -38.98],[35.37, -38.96],[35.41, -38.99],[35.46, -38.97],[35.51, -39.04],[35.57, -39.04],[35.54, -39.09],[35.51, -39.12],[35.48, -39.08]],
            /*Mediah Castle(7)*/[[35.00, -38.51],[35.07, -38.48],[35.11, -38.54]],
            /*Mediah Castle(8)*/[[34.83, -38.02],[34.99, -38.10],[35.05, -38.07],[35.02, -38.01],[34.83, -37.97]],
            /*Mediah Castle(9)*/[[34.61, -38.17],[34.71, -38.09],[34.56, -38.08],[34.54, -38.10]],
            /*Mediah Castle(10)*/[[33.59, -38.42],[33.61, -38.38],[33.70, -38.35],[33.79, -38.30],[33.80, -38.38]],
            /*Stonebeak Shore(1)*/[[38.35, -42.78],[38.37, -42.88],[38.29, -42.98],[38.18, -42.98],[38.25, -42.86]],
            /*Stonebeak Shore(2)*/[[38.40, -44.39],[38.35, -44.33],[38.07, -44.45],[38.11, -44.48]],
            /*Stonebeak Shore(3)*/[[39.44, -45.61],[39.34, -45.66],[39.44, -45.72]],
            /*Stonebeak Shore(4)*/[[39.36, -45.95],[39.37, -46.01],[39.28, -46.00],[39.29, -45.96]],
            /*Stonebeak Shore(5)*/[[45.15, -50.70],[45.20, -50.78],[45.10, -50.78],[45.09, -50.71]],

            /*Altinova Sea(1)*/[[45.82, -48.94],[45.91, -48.87],[46.00, -48.90],[46.04, -49.18],[46.19, -49.17],[46.27, -49.21],[46.33, -49.38],[46.29, -49.48],[45.92, -49.13]],
            /*Altinova Sea(2)*/[[45.55, -43.81],[45.60, -43.86],[45.66, -43.83],[45.62, -43.80]],
            /*Altinova Sea(3)*/[[44.95, -42.96],[45.01, -42.92],[45.03, -42.88],[44.87, -42.88],[44.84, -42.92]],
            /*Altinova Sea(4)*/[[42.92, -42.36],[43.31, -42.68],[43.37, -42.56],[43.11, -42.34]],
            /*Altinova Sea(5)*/[[41.75, -41.24],[41.84, -41.25],[41.82, -41.35]],
            /*Altinova Sea*/[[45.34, -43.33],[45.38, -43.32],[45.41, -43.35],[45.37, -43.37]],
            /*Altinova Sea(6)*/[[41.43, -40.89],[41.47, -40.95],[41.57, -40.95],[41.64, -40.90],[41.52, -40.87]],
            /*Altinova Sea(7)*/[[40.85, -39.05],[40.89, -39.17],[40.98, -39.10],[40.97, -39.07]],
            /*Altinova Sea(8)*/[[40.55, -38.62],[40.62, -38.60],[40.62, -38.55],[40.53, -38.52]],
            /*Altinova Sea(9)*/[[40.16, -38.08],[40.21, -38.28],[40.27, -38.22],[40.27, -38.12],[40.23, -38.08]],
            /*Altinova Sea(10)*/[[40.00, -37.18],[39.99, -37.53],[40.03, -37.53],[40.13, -37.45],[40.14, -37.33]],
            /*Altinova Sea(11)*/[[39.90, -36.52],[39.99, -36.91],[40.05, -36.83],[39.98, -36.68],[40.00, -36.58]],
            /*Altinova Sea(12)*/[[39.91, -34.61],[39.93, -34.81],[40.07, -34.82],[40.28, -34.78],[40.37, -34.66],[40.09, -34.59],[40.03, -34.63]],

            /*Calpheon Northwestern Outpost*/[[-25.52, -40.87],[-25.49, -40.95],[-25.45, -40.93],[-25.42, -40.99],[-25.42, -41.11],[-25.48, -41.13],[-25.56, -41.06],[-25.57, -41.02],[-25.64, -41.02]],
            /*Western Guard Camp(1)*/[[6.94, -39.98],[6.94, -40.02],[7.11, -40.00],[7.11, -39.96]],
            /*Western Guard Camp(2)*/[[7.65, -39.43],[7.70, -39.43],[7.67, -39.26],[7.62, -39.26]],
            /*Western Guard Camp(3)*/[[7.15, -38.87],[7.15, -38.83],[7.02, -38.84],[6.97, -38.87],[6.99, -38.89],[7.04, -38.86]],
            /*Goblin Cave*/[[19.67, -38.35],[19.83, -38.35],[19.91, -38.43],[19.87, -38.50],[19.95, -38.75],[19.91, -38.83],[19.79, -39.03],[19.56, -39.07],[19.43, -38.95],[19.11, -38.89],[19.00, -38.89],[18.65, -38.85],[18.44, -38.94],[18.28, -38.85],[18.22, -38.71],[18.04, -38.59],[17.85, -38.65],[17.73, -38.55],[17.76, -38.45],[17.98, -38.36],[18.21, -38.45],[18.23, -38.52],[18.31, -38.65],[18.46, -38.66],[18.52, -38.69],[18.69, -38.73],[18.79, -38.73],[18.97, -38.74],[19.05, -38.69],[19.62, -38.59],[19.67, -38.49]],
            /*Mediah Northern Gateway(1)*/[[19.85, -36.75],[19.87, -36.81],[19.95, -36.76],[19.94, -36.60],[20.01, -36.25],[19.99, -36.17],[20.10, -36.04],[20.06, -35.91],[19.96, -35.58],[19.85, -35.36],[19.82, -35.30],[19.88, -35.18],[19.91, -35.16],[19.88, -34.91],[19.92, -34.90],[19.95, -34.74],[19.92, -34.67],[19.96, -34.64],[19.92, -34.39],[19.84, -34.26],[19.77, -34.28],[19.84, -34.39],[19.88, -34.62],[19.78, -34.71],[19.85, -34.76],[19.86, -34.84],[19.80, -34.92],[19.80, -34.97],[19.82, -34.98],[19.78, -35.10],[19.83, -35.15],[19.77, -35.31],[19.91, -35.71],[19.97, -35.77],[20.01, -35.96],[19.91, -36.30],[19.94, -36.33],[19.91, -36.55]],
            /*Mediah Northern Gateway(2)*/[[20.14, -34.00],[20.11, -34.06],[20.39, -34.14],[20.64, -33.95],[20.66, -33.77],[20.57, -33.81],[20.58, -33.89],[20.39, -34.05]],
            /*Sausan Garrison(1)*/[[30.65, -31.82],[30.74, -31.54],[31.10, -32.05],[30.93, -32.10],[30.93, -31.92]],
            /*Sausan Garrison(2)*/[[31.36, -32.09],[31.45, -32.14],[31.38, -32.21]],
            /*Ancient Ruins Excavation Site(1)*/[[24.89, -41.24],[24.89, -41.38],[24.96, -41.38],[24.97, -41.24]],
            /*Ancient Ruins Excavation Site(2)*/[[25.95, -41.64],[25.96, -41.76],[25.92, -41.80],[25.78, -41.81],[25.79, -42.00],[25.84, -42.00],[26.12, -41.90],[26.13, -41.79],[26.21, -41.79],[26.21, -41.73],[26.12, -41.65]],
            /*Ahto Farm*/[[26.63, -43.43],[26.64, -43.50],[26.70, -43.51],[26.88, -43.36],[26.84, -43.32],[26.80, -43.30],[26.76, -43.32],[26.77, -43.35]],
            /*Rumbling Land(1)*/[[22.25, -42.16],[22.27, -42.21],[22.32, -42.23],[22.56, -42.15],[22.59, -42.17],[22.91, -42.18],[23.09, -42.20],[23.30, -42.45],[23.26, -42.47],[23.36, -42.57],[23.38, -42.68],[23.62, -43.06],[23.63, -43.12],[23.57, -43.15],[23.57, -43.16],[23.62, -43.19],[23.60, -43.36],[23.68, -43.40],[23.68, -43.70],[23.62, -43.91],[23.67, -43.97],[23.65, -44.03],[23.62, -44.04],[23.67, -44.12],[23.68, -44.25],[23.71, -44.40],[23.73, -44.41],[23.72, -44.45],[23.75, -44.48],[23.82, -44.47],[23.84, -44.43],[23.81, -44.40],[23.79, -44.28],[23.73, -44.19],[23.75, -44.04],[23.70, -43.99],[23.75, -43.74],[23.72, -43.68],[23.75, -43.64],[23.77, -43.56],[23.73, -43.52],[23.75, -43.38],[23.68, -43.34],[23.73, -43.19],[23.67, -43.17],[23.67, -43.12],[23.71, -43.10],[23.51, -42.79],[23.52, -42.75],[23.47, -42.65],[23.41, -42.61],[23.39, -42.47],[23.33, -42.44],[23.37, -42.42],[23.36, -42.40],[23.28, -42.37],[23.22, -42.28],[23.26, -42.24],[23.26, -42.21],[23.15, -42.20],[23.13, -42.17],[22.95, -42.12],[22.41, -42.12]],
            /*Rumbling Land(2)*/[[23.75, -42.08],[23.83, -41.99],[23.93, -41.99],[24.04, -42.04],[24.04, -42.10],[23.96, -42.12],[23.82, -42.12]],
            /*Stonetail Wasteland*/[[28.15, -37.39],[28.19, -37.47],[28.24, -37.44],[28.23, -37.36]],
            /*Kamasylve Temple*/[[22.99, -44.62],[23.00, -44.87],[23.09, -44.86],[23.29, -44.87],[23.39, -44.83],[23.51, -44.82],[23.66, -44.78],[23.79, -44.79],[23.87, -44.82],[23.95, -44.76],[24.07, -44.73],[24.10, -44.70],[24.19, -44.69],[24.23, -44.71],[24.34, -44.72],[24.45, -44.77],[24.52, -44.77],[24.61, -44.82],[24.65, -44.81],[24.69, -44.84],[24.76, -44.81],[24.76, -44.76],[24.15, -44.62],[23.87, -44.69],[23.87, -44.58],[23.75, -44.60],[23.74, -44.59],[23.69, -44.62],[23.65, -44.62],[23.64, -44.59],[23.49, -44.58],[23.41, -44.62],[23.30, -44.60],[23.24, -44.61],[23.08, -44.58],[23.06, -44.62]],
            /*Tungrad Forest*/[[24.77, -50.47],[24.82, -50.49],[24.97, -50.38],[25.02, -50.31],[25.16, -50.23],[25.89, -49.38],[25.90, -49.25],[26.16, -48.91],[26.36, -48.73],[26.47, -48.41],[26.40, -48.35],[26.44, -48.23],[26.57, -48.15],[26.59, -48.09],[26.72, -48.10],[26.77, -48.06],[26.70, -47.86],[27.03, -47.76],[27.15, -47.64],[27.16, -47.51],[27.23, -47.49],[27.38, -47.51],[27.53, -47.39],[27.53, -47.22],[27.82, -47.19],[27.98, -47.13],[28.00, -47.05],[28.23, -46.88],[28.39, -46.86],[28.26, -46.76],[28.15, -46.79],[28.14, -46.85],[28.07, -46.90],[27.90, -46.90],[27.86, -46.95],[27.92, -46.98],[27.85, -47.08],[27.75, -47.09],[27.70, -47.05],[27.62, -47.05],[27.46, -47.15],[27.44, -47.26],[27.23, -47.38],[27.17, -47.36],[27.10, -47.37],[27.16, -47.43],[27.14, -47.46],[26.71, -47.64],[26.70, -47.74],[26.39, -47.82],[26.23, -48.16],[26.28, -48.24],[26.18, -48.60],[26.19, -48.70],[25.94, -48.89],[25.87, -49.18],[25.68, -49.47],[25.52, -49.52],[25.54, -49.70],[25.46, -49.81],[25.33, -49.85],[25.21, -49.92],[25.23, -50.07],[25.12, -50.16],[25.08, -50.13],[25.05, -50.16],[25.09, -50.21],[24.95, -50.34]],
            /*Veteran's Canyon*/[[47.19, -39.05],[47.26, -39.00],[47.27, -39.04],[47.42, -39.02],[47.48, -39.04],[47.52, -39.10],[47.51, -39.24],[47.37, -39.23],[47.30, -39.17],[47.20, -39.15]],
            /*Veteran's Canyon(west)*/[[45.25, -38.76],[45.34, -38.75],[45.37, -38.79],[45.36, -38.95],[45.32, -38.98],[45.23, -38.94]],
            /*Gorgo Rock Belt(north)*/[[43.66, -37.41],[43.74, -37.48],[43.75, -37.62],[43.67, -37.63],[43.58, -37.52],[43.59, -37.45]],
            /*Kunid's Vacation Spot(north)*/[[45.96, -33.03],[45.92, -33.00],[45.67, -33.11],[45.76, -33.30],[45.74, -33.72],[45.82, -33.72],[45.88, -33.63],[45.84, -33.13]],
            /*Kisleev Crag*/[[40.51, -34.26],[40.48, -34.17],[40.52, -34.12],[40.67, -34.12],[40.74, -34.26]],
            /*Leical Falls(1)*/[[43.10, -34.86],[43.27, -34.86],[42.78, -35.20],[42.71, -35.22],[42.71, -35.34],[42.65, -35.46],[42.67, -35.81],[42.75, -36.06],[42.85, -36.10],[42.92, -36.07],[43.02, -36.16],[43.06, -36.32],[43.15, -36.47],[43.08, -36.52],[42.95, -36.78],[42.44, -37.18],[42.14, -37.48],[42.06, -37.88],[42.11, -38.17],[41.93, -38.29],[41.96, -38.31],[41.92, -38.51],[41.88, -38.56],[42.00, -38.68],[41.99, -38.99],[42.06, -39.03],[41.95, -39.26],[41.96, -39.46],[42.02, -39.62],[42.10, -39.70],[42.06, -39.74],[42.12, -39.80],[42.06, -39.82],[41.93, -39.71],[41.95, -39.57],[41.91, -39.46],[41.92, -39.19],[41.97, -39.14],[42.01, -39.06],[41.91, -38.99],[41.90, -38.78],[41.95, -38.75],[41.94, -38.67],[41.90, -38.66],[41.84, -38.56],[41.85, -38.37],[41.89, -38.30],[41.86, -38.20],[41.88, -38.16],[41.92, -38.15],[41.95, -38.13],[41.94, -38.04],[41.80, -38.01],[42.02, -37.62],[42.13, -37.40],[42.44, -37.09],[42.44, -36.94],[42.53, -36.81],[42.61, -36.81],[42.88, -36.54],[42.88, -36.28],[42.67, -36.07],[42.59, -35.85],[42.57, -35.55],[42.64, -35.35],[42.65, -35.18],[43.09, -34.91]],
            /*Leical Falls(2)*/[[42.07, -40.02],[42.11, -39.97],[42.31, -39.99],[42.56, -40.07],[42.56, -40.12],[42.45, -40.09],[42.37, -40.11],[42.22, -40.08]],
            /*Leical Falls(3)*/[[42.63, -40.15],[42.74, -40.09],[42.79, -40.12],[42.84, -40.10],[43.20, -40.08],[43.25, -40.11],[43.34, -40.10],[43.36, -40.04],[43.43, -40.03],[43.47, -39.96],[43.58, -39.88],[43.68, -39.86],[43.80, -39.92],[43.73, -40.04],[43.61, -40.07],[43.56, -40.04],[43.51, -40.09],[43.41, -40.16],[43.26, -40.20],[43.07, -40.20],[42.91, -40.26],[42.76, -40.22],[42.75, -40.18]],
            /*Bashim Base(north)*/[[51.94, -45.75],[51.91, -45.79],[51.96, -45.83],[52.09, -45.84],[52.15, -45.79],[52.17, -45.68],[52.13, -45.65],[52.03, -45.67],[52.03, -45.72],[52.01, -45.75]],
            /*Bashim Base(west)*/[[48.70, -47.27],[48.64, -47.30],[48.64, -47.34],[48.71, -47.37],[48.81, -47.37],[49.04, -47.25],[49.10, -47.29],[49.15, -47.27],[49.13, -47.22],[49.01, -47.23],[48.79, -47.29]],
            /*Bashim Base(east1)*/[[53.53, -46.00],[53.56, -45.96],[53.63, -45.96],[53.66, -46.01],[53.59, -46.05]],
            /*Bashim Base(east2)*/[[53.62, -47.35],[53.62, -47.38],[53.70, -47.44],[53.70, -47.50],[53.83, -47.50],[53.88, -47.49],[53.87, -47.45],[53.84, -47.45],[53.79, -47.41],[53.80, -47.38],[53.70, -47.34]],
            /*Bashim Base(east3)*/[[54.41, -48.66],[54.42, -48.71],[54.49, -48.73],[54.55, -48.68],[54.47, -48.64]],
            /*Bashim Base(east4)*/[[55.39, -47.09],[55.42, -47.06],[55.57, -47.04],[55.60, -46.92],[55.62, -46.85],[55.68, -46.85],[55.66, -47.07],[55.63, -47.17],[55.55, -47.20]],
            /*Sand Grain Bazaar*/[[62.53, -40.88],[62.57, -40.84],[62.62, -40.83],[62.60, -40.78],[62.65, -40.72],[62.69, -40.76],[62.66, -40.79],[62.67, -40.83],[62.65, -40.86],[62.61, -40.87]],
            /*Oasis of Bless*/[[67.74, -49.19],[67.74, -49.33],[67.93, -49.33],[67.91, -49.29],[67.95, -49.27],[68.01, -49.29],[68.05, -49.27],[68.08, -49.28],[68.08, -49.33],[68.26, -49.31],[68.26, -49.26],[68.23, -49.22],[68.10, -49.15]],
            /*Deserted City of Runn(1)*/[[49.86, -31.44],[49.95, -31.41],[49.95, -31.18],[49.93, -31.13],[49.97, -31.07],[50.06, -31.03],[50.19, -31.05],[50.30, -30.94],[50.35, -30.84],[50.47, -30.81],[50.56, -30.82],[50.60, -30.79],[50.70, -30.81],[50.74, -30.79],[50.75, -30.68],[51.09, -30.60],[51.44, -30.35],[51.47, -30.29],[51.48, -30.23],[51.43, -30.25],[51.16, -30.36],[51.17, -30.41],[51.07, -30.40],[50.98, -30.35],[50.91, -30.36],[50.84, -30.44],[50.75, -30.46],[50.56, -30.64],[50.49, -30.64],[50.45, -30.72],[50.40, -30.70],[50.36, -30.62],[50.29, -30.61],[50.28, -30.64],[50.22, -30.70],[50.13, -30.71],[50.04, -30.79],[49.96, -30.84],[49.94, -30.96],[49.79, -31.10],[49.82, -31.16],[49.78, -31.34]],
            /*Deserted City of Runn(2)*/[[49.94, -32.31],[50.03, -32.26],[50.13, -32.27],[50.18, -32.32],[50.23, -32.31],[50.26, -32.35],[50.20, -32.42],[50.05, -32.47],[49.97, -32.42]],
            /*Deserted City of Runn(south)*/[[51.28, -33.30],[51.29, -33.23],[51.19, -33.19],[51.07, -33.19],[50.95, -33.24],[50.90, -33.33],[50.92, -33.44],[51.02, -33.51],[51.12, -33.54],[51.24, -33.40]],
            /*Iris Canyon*/[[74.06, -12.71],[74.15, -12.62],[74.29, -12.61],[74.38, -12.69],[74.36, -12.78],[74.51, -12.74],[74.56, -12.77],[74.60, -12.73],[74.70, -12.80],[74.73, -12.91],[74.77, -12.91],[74.79, -13.03],[74.65, -13.11],[74.49, -13.12],[74.42, -13.03],[74.14, -13.05],[74.06, -12.91]],
            /*Iris Canyon(north)*/[[73.30, -11.49],[73.28, -11.63],[73.37, -11.68],[73.48, -11.69],[73.60, -11.64],[73.57, -11.56],[73.59, -11.53],[73.54, -11.44],[73.37, -11.41]],
            /*Iris Canyon(east)*/[[75.86, -13.53],[75.86, -13.60],[75.91, -13.61],[76.02, -13.54],[76.01, -13.49],[75.93, -13.48]],
            /*Gavinya Great Crater*/[[102.23, -6.21],[102.33, -6.00],[102.45, -5.95],[102.61, -6.02],[102.70, -6.16],[102.56, -6.54],[102.50, -6.58],[102.47, -6.53],[102.37, -6.57],[102.27, -6.48]],
            /*Valencia Castle*/[[108.33, -21.44],[108.24, -21.37],[108.12, -21.50],[108.20, -21.57]],
            /*Ibellab Oasis*/[[72.34, -28.52],[72.23, -28.44],[72.23, -28.25],[72.34, -28.15],[72.52, -28.14],[72.64, -28.20],[72.76, -28.55],[72.69, -28.79],[72.58, -28.84],[72.45, -28.57]],
            /*Pilgrim's Sanctum: Sincerity(Dreaming Oasis)*/[[79.89, -41.89],[79.87, -41.94],[79.90, -41.98],[79.97, -41.97],[80.00, -41.90],[79.96, -41.87]],
            /*Atosa's Villa(south1)*/[[83.61, -49.19],[83.65, -49.15],[83.81, -49.18],[83.85, -49.23],[83.86, -49.54],[83.81, -49.59],[83.69, -49.62],[83.64, -49.59],[83.58, -49.52],[83.62, -49.46],[83.66, -49.48]],
            /*Atosa's Villa(south2)*/[[85.54, -50.00],[85.51, -49.96],[85.53, -49.91],[85.72, -49.73],[85.79, -49.71],[85.82, -49.74],[85.91, -49.71],[85.94, -49.66],[86.02, -49.68],[86.00, -49.74],[86.09, -49.80],[86.18, -49.76],[86.24, -49.80],[86.35, -49.74],[86.42, -49.77],[86.42, -49.87],[86.33, -49.98],[86.28, -49.94],[86.20, -49.95],[85.95, -50.08],[85.78, -50.11],[85.70, -50.08],[85.70, -50.03],[85.63, -50.00]],
            /*Titium Valley(1)*/[[87.18, -48.92],[87.26, -48.87],[87.38, -48.88],[87.51, -48.81],[87.46, -48.77],[87.89, -48.56],[88.20, -48.76],[88.17, -48.82],[88.26, -49.07],[89.51, -49.43],[89.53, -49.52],[90.52, -49.89],[90.63, -49.87],[90.68, -49.92],[90.91, -50.01],[91.12, -49.95],[91.30, -49.97],[91.32, -50.03],[91.57, -50.13],[91.59, -50.23],[91.94, -50.24],[92.17, -50.47],[92.12, -50.56],[92.30, -50.70],[92.41, -50.76],[92.55, -50.79],[92.63, -50.91],[92.72, -50.93],[92.79, -51.10],[92.88, -51.15],[93.03, -51.15],[93.04, -51.25],[93.21, -51.37],[93.52, -51.37],[94.09, -51.22],[94.30, -51.27],[94.44, -51.27],[94.64, -51.13],[94.73, -51.12],[94.90, -51.01],[94.99, -51.00],[95.07, -50.95],[95.10, -50.89],[95.23, -50.83],[95.44, -50.83],[95.44, -50.85],[95.35, -50.89],[95.27, -50.89],[95.21, -50.90],[95.07, -51.02],[95.08, -51.10],[95.13, -51.16],[95.09, -51.29],[95.18, -51.31],[95.25, -51.45],[95.32, -51.51],[95.39, -51.50],[95.47, -51.62],[95.34, -51.67],[95.30, -51.55],[95.12, -51.44],[95.00, -51.44],[94.87, -51.47],[94.51, -51.45],[94.13, -51.53],[93.65, -51.51],[93.41, -51.55],[93.21, -51.52],[93.15, -51.54],[93.06, -51.60],[92.96, -51.77],[93.04, -51.83],[93.04, -51.89],[92.98, -51.88],[92.98, -51.84],[92.88, -51.78],[92.85, -51.60],[92.97, -51.52],[93.13, -51.46],[93.16, -51.38],[93.00, -51.27],[92.84, -51.26],[92.74, -51.30],[92.62, -51.29],[92.49, -51.22],[92.61, -51.15],[92.60, -51.10],[92.52, -51.06],[92.58, -51.02],[92.57, -50.91],[92.50, -50.86],[92.51, -50.82],[92.31, -50.76],[92.26, -50.76],[92.16, -50.72],[92.19, -50.70],[92.19, -50.68],[92.09, -50.68],[91.60, -50.40],[91.59, -50.32],[91.46, -50.32],[91.45, -50.27],[91.49, -50.22],[91.43, -50.12],[91.34, -50.12],[91.26, -50.11],[91.23, -50.06],[91.13, -50.07],[91.03, -50.12],[90.69, -49.98],[90.56, -49.97],[90.53, -49.91],[90.45, -49.93],[89.92, -49.72],[89.83, -49.67],[89.73, -49.64],[89.61, -49.65],[89.41, -49.59],[89.03, -49.62],[88.93, -49.69],[88.95, -49.81],[89.13, -49.85],[89.38, -49.92],[89.70, -50.04],[89.81, -50.12],[90.12, -50.36],[90.13, -50.40],[90.21, -50.41],[90.32, -50.37],[90.71, -50.38],[90.80, -50.41],[90.87, -50.60],[90.79, -50.70],[90.82, -50.78],[90.93, -50.81],[90.97, -50.86],[91.32, -50.93],[91.48, -50.92],[91.80, -50.93],[91.82, -50.97],[91.64, -50.98],[91.54, -50.97],[91.46, -50.99],[91.43, -50.95],[91.10, -50.96],[91.04, -50.92],[90.98, -50.92],[90.90, -50.86],[90.83, -50.86],[90.77, -50.82],[90.55, -50.73],[90.52, -50.68],[90.32, -50.62],[90.29, -50.58],[90.18, -50.55],[90.12, -50.43],[90.04, -50.41],[89.87, -50.26],[89.86, -50.20],[89.73, -50.18],[89.73, -50.13],[89.59, -50.06],[89.42, -50.06],[89.42, -50.16],[89.37, -50.20],[89.25, -50.20],[89.21, -50.14],[89.30, -50.06],[89.31, -49.98],[89.10, -49.90],[88.98, -49.87],[88.89, -49.88],[88.87, -49.67],[88.92, -49.62],[88.88, -49.58],[88.89, -49.49],[88.84, -49.46],[88.84, -49.35],[88.73, -49.29],[88.57, -49.24],[88.48, -49.25],[88.41, -49.17],[88.29, -49.13],[88.23, -49.15],[88.22, -49.08],[88.16, -49.07],[88.04, -49.15],[87.86, -49.14],[87.72, -49.06],[87.51, -49.01],[87.43, -49.01],[87.39, -49.03]],
            /*Titium Valley(2)*/[[92.75, -52.30],[92.82, -52.25],[92.79, -52.23],[92.90, -52.19],[92.87, -52.16],[92.75, -52.21],[92.65, -52.22],[92.51, -52.29],[92.42, -52.25],[92.35, -52.28],[92.22, -52.27],[92.07, -52.29],[92.03, -52.32],[92.09, -52.33],[92.08, -52.36],[91.95, -52.42],[91.91, -52.40],[91.79, -52.43],[91.70, -52.40],[91.66, -52.40],[91.66, -52.36],[91.59, -52.37],[91.58, -52.46],[91.65, -52.48],[91.83, -52.49],[91.91, -52.53],[91.90, -52.60],[91.90, -52.60],[91.95, -52.65],[92.12, -52.66],[92.14, -52.64],[92.22, -52.64],[92.27, -52.61],[92.31, -52.54],[92.35, -52.51],[92.45, -52.47],[92.45, -52.47],[92.45, -52.44],[92.54, -52.43]],
            /*Valencia City(1)*/[[96.62, -28.63],[96.66, -28.58],[96.72, -28.57],[96.75, -28.62],[96.72, -28.66],[96.65, -28.67]],
            /*Valencia City(2)*/[[96.19, -28.19],[96.20, -28.13],[96.29, -28.13],[96.29, -28.20]],
            /*Valencia City(3)*/[[97.07, -27.53],[97.14, -27.47],[97.21, -27.51],[97.15, -27.58]],
            /*Valencia City(4)*/[[98.05, -27.95],[98.03, -27.99],[97.97, -27.97],[97.99, -27.92]],
            /*Valencia City(5)*/[[98.10, -27.87],[98.07, -27.91],[97.99, -27.88],[98.02, -27.84]],
            /*Valencia City(6)*/[[98.30, -27.81],[98.69, -27.93],[98.55, -28.30],[98.15, -28.16]],
            /*Valencia City(7)*/[[98.77, -28.27],[98.80, -28.19],[98.90, -28.22],[98.85, -28.30]],
            /*Valencia City(8)*/[[98.56, -27.63],[98.64, -27.65],[98.66, -27.60],[98.59, -27.58]],
            /*Valencia City(9)*/[[98.19, -28.49],[98.26, -28.51],[98.28, -28.45],[98.22, -28.43]],
            /*Valencia City(north1)*/[[95.89, -26.83],[95.94, -26.89],[95.99, -26.79],[96.05, -26.83],[96.04, -26.75],[96.09, -26.70],[96.17, -26.69],[96.21, -26.78],[96.24, -26.80],[96.43, -26.73],[96.40, -26.67],[96.29, -26.66],[96.24, -26.57],[95.96, -26.69]],
            /*Valencia City(north2)*/[[95.60, -26.50],[95.63, -26.46],[95.69, -26.48],[95.69, -26.53],[95.64, -26.55],[95.59, -26.55]],
            /*Valencia City(north3)*/[[93.66, -25.79],[93.63, -25.90],[93.71, -25.92],[93.69, -25.88],[93.78, -25.86],[93.79, -25.89],[93.88, -25.90],[93.85, -25.86],[93.88, -25.82],[93.82, -25.79]],
            /*Valencia City(north4)*/[[93.85, -25.62],[93.94, -25.56],[93.92, -25.62]],
            /*Valencia City(north5)*/[[94.04, -25.52],[94.04, -25.57],[94.09, -25.64],[94.12, -25.63],[94.14, -25.56],[94.12, -25.52]],
            /*Valencia City(north6)*/[[94.29, -25.49],[94.36, -25.48],[94.40, -25.45],[94.40, -25.41],[94.30, -25.43]],
            /*Valencia City(north8)*/[[94.71, -25.21],[94.71, -25.32],[94.81, -25.24]],
            /*Valencia City(north9)*/[[95.05, -24.67],[95.05, -24.77],[95.08, -24.78],[95.16, -24.66],[95.12, -24.58],[95.08, -24.59],[95.11, -24.65]],
            /*Padix Island*/[[-17.16, -18.18],[-16.98, -18.58],[-17.08, -18.74],[-17.00, -18.97],[-16.35, -19.04],[-16.18, -18.96],[-16.03, -18.91],[-15.69, -18.88],[-15.48, -18.99],[-15.48, -19.04],[-15.77, -19.24],[-15.75, -19.44],[-15.70, -19.51],[-15.32, -19.83],[-14.73, -20.12],[-14.36, -20.64],[-14.19, -20.63],[-14.17, -20.48],[-14.01, -20.50],[-14.15, -20.70],[-14.33, -20.81],[-14.85, -20.54],[-14.99, -20.24],[-15.64, -19.98],[-15.81, -19.64],[-15.89, -19.25],[-16.76, -19.16],[-16.91, -19.22],[-17.13, -19.01],[-17.22, -18.84],[-17.40, -18.89],[-17.50, -18.70],[-17.34, -18.67],[-17.24, -18.62],[-17.25, -18.45],[-17.36, -18.24]],
            /*Velia*/[[13.40, -35.71],[13.37, -35.64],[13.50, -35.47],[13.65, -35.53],[13.58, -35.70],[13.53, -35.75],[13.51, -35.73]],
            /*Papua Crinea(Queekity Thumpity Moon Village)*/[[-41.50, -53.13],[-41.60, -53.07],[-41.48, -53.04],[-41.38, -53.07],[-41.45, -53.08]],
            /*Grandiha(1)*/[[-33.80, -64.74],[-33.74, -64.74],[-33.74, -64.76],[-33.70, -64.78],[-33.65, -64.77],[-33.64, -64.74],[-33.67, -64.73],[-33.64, -64.72],[-33.58, -64.75],[-33.62, -64.89],[-33.67, -64.89],[-33.66, -64.84],[-33.71, -64.80]],
            /*Grandiha(2)*/[[-34.56, -64.58],[-34.50, -64.59],[-34.60, -64.63],[-34.59, -64.66],[-34.57, -64.67],[-34.49, -64.66],[-34.45, -64.70],[-34.51, -64.72],[-34.51, -64.75],[-34.45, -64.77],[-34.45, -64.77],[-34.38, -64.77],[-34.37, -64.78],[-34.49, -64.78],[-34.59, -64.76],[-34.65, -64.72],[-34.67, -64.66],[-34.63, -64.61]],
            /*Acher Western Camp(west island)*/[[-40.46, -57.22],[-40.43, -57.20],[-40.57, -57.15],[-40.62, -57.19]],
            /*Padix Island*/[[-13.64, -19.68],[-13.69, -19.54],[-13.84, -19.49],[-14.05, -19.66],[-13.98, -19.78]],
            /*Rumbling Land(secret cave 1)*/[[20.53, -41.97],[20.49, -41.99],[20.55, -42.02],[20.57, -41.99]],
            /*Rumbling Land(secret cave 2)*/[[21.69, -42.05],[21.75, -42.15],[21.97, -42.17],[21.90, -42.21],[21.81, -42.18],[21.67, -42.17],[21.60, -42.11],[21.62, -42.05]],
            /*Canyon of Corruption(secret cave)*/[[26.20, -39.28],[26.30, -39.34],[26.19, -39.41],[26.26, -39.49],[26.22, -39.52],[26.08, -39.46],[26.05, -39.40]],

            /*Kunid's Villa(1)*/[[45.66, -37.38],[45.65, -37.32],[45.73, -37.32],[45.73, -37.37]],
            /*Kunid's Villa(2)*/[[45.44, -36.99],[45.41, -37.01],[45.44, -37.04],[45.48, -37.01]],
            /*Lohan's Villa*/[[64.70, -15.58],[64.73, -15.52],[64.67, -15.49],[64.62, -15.54]],
            /*Inaha's Villa*/[[90.46, -20.76],[90.51, -20.83],[90.57, -20.79],[90.52, -20.73]],
            /*Dudora's Villa*/[[110.97, -12.57],[111.01, -12.63],[111.10, -12.57],[111.05, -12.51]],
            /*Muna's Villa*/[[98.00, -28.64],[97.94, -28.59],[97.87, -28.62],[97.94, -28.68]],
            /*Tasaila's Villa(1)*/[[93.07, -28.78],[92.98, -28.75],[92.95, -28.83],[93.04, -28.86]],
            /*Tasaila's Villa(2)*/[[92.55, -28.42],[92.61, -28.43],[92.60, -28.49],[92.54, -28.48]],
            /*Karashu's Villa*/[[49.49, -42.68],[49.50, -42.72],[49.54, -42.71],[49.54, -42.68]],
            /*Amir's Villa*/[[53.36, -45.21],[53.40, -45.17],[53.46, -45.20],[53.42, -45.24]],
            /*Talia's Villa*/[[90.24, -20.34],[90.29, -20.29],[90.34, -20.33],[90.30, -20.38]],
            /*Kiyak's Villa*/[[92.94, -27.96],[93.00, -27.96],[93.00, -28.01],[92.94, -28.01]],
            /*Oberin's Villa*/[[107.13, -44.01],[107.18, -44.01],[107.18, -44.06],[107.13, -44.06]],
        ]]
            }                
        },
    {
        "type":"Feature",
        "id":"2",
        "properties":
            {
            "name_EN":"(Surfperch area)",
            "name_KR":"(망상어 지역)",
            "fishGroup": ["Surfperch"],
            "locationColor": "#909090",

        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Altinova*/[[43.50, -46.14],[43.54, -46.10],[43.69, -46.08],[43.72, -46.13],[43.63, -46.17]],
            /*Altinova North(1)*/[[40.56, -43.92],[40.63, -43.86],[40.80, -43.92],[40.87, -43.99],[40.65, -43.99]],
            /*Altinova North(2)*/[[40.50, -43.07],[40.83, -43.14],[40.86, -43.27],[40.65, -43.37],[40.64, -43.43],[40.68, -43.46],[40.69, -43.55],[40.61, -43.62],[40.50, -43.59],[40.52, -43.52],[40.43, -43.50],[40.38, -43.42],[40.38, -43.28],[40.42, -43.16]],
            /*Lema Island*/[[7.09, -13.59],[7.10, -13.48],[7.17, -13.54]],
            /*Iliya Island(1)*/[[29.75, -19.12],[29.72, -18.97],[29.64, -18.98],[29.67, -19.14]],
            /*Iliya Isalnd(2)*/[[29.62, -18.83],[29.62, -18.76],[29.53, -18.76],[29.54, -18.83]],
            /*Mediah Castle(1)*/[[36.88, -38.06],[36.98, -38.13],[37.19, -38.07],[37.00, -37.95]],
            /*Mediah Castle(2)*/[[38.16, -39.06],[38.16, -38.98],[38.00, -38.98],[37.93, -38.91],[37.87, -38.94],[37.96, -39.06]],
            /*Mediah Castle(3)*/[[37.49, -39.05],[37.36, -39.00],[37.46, -38.96],[37.54, -38.86],[37.59, -38.87],[37.50, -39.01]],
            /*Mediah Castle(4)*/[[37.23, -39.02],[37.18, -39.05],[37.05, -38.96],[36.88, -38.86],[36.88, -38.80],[36.92, -38.81],[36.96, -38.79],[36.94, -38.75],[36.86, -38.76],[36.77, -38.74],[36.75, -38.69],[36.66, -38.72],[36.63, -38.69],[36.66, -38.62],[36.72, -38.64],[36.79, -38.57],[37.07, -38.53],[37.30, -38.54],[37.48, -38.66],[37.48, -38.83],[37.37, -38.75],[37.25, -38.62],[37.11, -38.62],[37.10, -38.68],[37.14, -38.80],[37.15, -38.94]],
            /*Halmad Island(1)*/[[58.41, -18.72],[58.51, -18.65],[58.62, -18.73],[58.44, -18.80]],
            /*Halmad Island(2)*/[[55.72, -17.95],[55.94, -17.94],[55.82, -17.86]],
            /*Kashuma Island*/[[61.36, -15.69],[61.23, -15.73],[60.85, -15.32],[60.93, -15.08],[61.12, -15.00],[61.25, -14.73],[61.35, -14.74],[61.31, -14.93],[61.20, -15.10],[61.01, -15.16],[60.97, -15.27]],
            /*Racid Island*/[[17.51, -11.99],[17.37, -11.94],[17.34, -12.29],[17.39, -12.51],[17.43, -12.91],[17.33, -13.62],[18.46, -13.58],[19.00, -13.94],[19.16, -13.39],[18.95, -13.24],[19.05, -12.89],[18.73, -12.60],[18.36, -12.69],[18.35, -12.24],[17.92, -12.08],[17.53, -12.20]],
            /*Altinova Sea(1)*/[[44.56, -44.78],[44.71, -44.86],[44.76, -44.78],[44.73, -44.76]],
            /*Altinova Sea(2)*/[[44.81, -44.59],[44.92, -44.72],[44.88, -44.77],[44.79, -44.75],[44.80, -44.72],[44.77, -44.66]],
            /*Feltron Island(1)*/[[13.22, -4.42],[13.35, -4.21],[13.41, -4.24],[13.40, -4.43]],
            /*Feltron Island(2)*/[[14.25, -4.41],[14.27, -4.35],[14.37, -4.32],[14.41, -4.34],[14.34, -4.42]],
            /*Protty Cave(1)*/[[15.14, -24.56],[15.29, -24.64],[15.34, -24.63],[15.32, -24.51]],
            /*Protty Cave(2)*/[[14.95, -24.50],[14.97, -24.47],[14.83, -24.36],[15.00, -24.26],[14.95, -24.21],[14.74, -24.34],[14.78, -24.40]],

            /*Port Ratt*/[[-93.61, 61.47],[-93.11, 61.27],[-92.81, 61.27],[-92.63, 61.40],[-92.44, 61.37],[-92.26, 61.18],[-91.97, 61.18],[-91.88, 61.34],[-92.16, 61.39],[-92.19, 61.43],[-92.08, 61.55],[-92.10, 61.58],[-92.18, 61.61],[-92.30, 61.60],[-92.38, 61.62],[-92.39, 61.66],[-92.46, 61.68],[-92.49, 61.65],[-92.69, 61.59],[-92.85, 61.62],[-93.28, 61.57],[-93.50, 61.50],[-93.54, 61.52]],
            ]]
            }                
        },
        

    //-----  Kamasylvia  -----//
    {
        "type":"Feature",
        "id":"3",
        "properties":
            {
            "name_EN":"Kamasylvia - Atanis Pond",
            "name_KR":"카마실비아 - 아타니스 못",
            "fishGroup": ["AlbinoCoelacanth", "WhiteGrouper", "GoldenSiniperca", "MandarinFish", "SpottedBarbel", "DiamondMinnow", "YellowHeadCatfish", "StripedShiner", "Arowana", "Lenok", "CherrySalmon", "AmurMinnow", "YellowfinSculpin", "Bass"],
            "locationColor": "#FC7504",

        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Atanis Pond*/[[-15.87, -60.58],[-16.03, -60.65],[-16.01, -60.82],[-16.08, -60.86],[-15.96, -60.88],[-15.87, -60.84],[-15.51, -60.84],[-15.37, -60.90],[-15.29, -60.86],[-15.29, -60.79],[-15.21, -60.73],[-14.76, -60.63],[-14.60, -60.66],[-14.41, -60.63],[-14.12, -60.69],[-13.96, -60.67],[-13.74, -60.69],[-13.41, -60.62],[-13.04, -60.71],[-12.14, -60.60],[-11.50, -60.65],[-11.29, -60.58],[-11.08, -60.58],[-10.99, -60.51],[-11.08, -60.31],[-11.25, -60.25],[-11.69, -60.10],[-11.66, -60.02],[-11.78, -59.92],[-12.01, -59.95],[-12.31, -59.90],[-12.52, -59.74],[-12.60, -59.66],[-12.59, -59.41],[-12.65, -59.37],[-12.73, -59.53],[-12.66, -59.71],[-12.51, -59.91],[-12.17, -59.96],[-11.84, -60.20],[-11.62, -60.19],[-11.33, -60.30],[-11.58, -60.44],[-11.77, -60.52],[-11.97, -60.56],[-12.31, -60.54],[-12.89, -60.65],[-13.37, -60.54],[-13.82, -60.57],[-14.04, -60.63],[-14.56, -60.55],[-15.08, -60.58],[-15.69, -60.72],[-15.82, -60.67]],
            /*Viv Foretta Hamlet*/[[-12.99, -59.04],[-12.85, -58.94],[-13.04, -58.85],[-13.04, -58.79],[-13.25, -58.71],[-13.27, -58.65],[-13.48, -58.65],[-13.61, -58.58],[-13.74, -58.56],[-14.02, -58.56],[-14.08, -58.59],[-13.99, -58.60],[-13.76, -58.60],[-13.54, -58.72],[-13.31, -58.74],[-13.15, -58.80],[-13.17, -58.88],[-13.04, -58.96],[-13.07, -59.00]],
            /*Mirumok Ruins*/[[-23.04, -58.93],[-23.10, -59.03],[-23.09, -59.10],[-22.99, -59.12],[-23.04, -59.19],[-22.99, -59.27],[-23.00, -59.41],[-23.06, -59.46],[-23.04, -59.49],[-22.94, -59.46],[-22.93, -59.42],[-22.92, -59.24],[-22.82, -59.14],[-22.84, -59.04],[-22.94, -58.99],[-22.94, -58.93]],
            /*Acher Southern Camp*/[[-30.11, -65.07],[-29.98, -65.07],[-29.95, -65.17],[-29.88, -65.24],[-29.53, -65.61],[-29.63, -65.62],[-29.92, -65.37],[-29.99, -65.28]],
            /*Krogdalo's Trace*/[[-36.96, -62.22],[-36.91, -62.28],[-36.67, -62.23],[-36.47, -62.25],[-36.38, -62.21],[-36.17, -62.14],[-35.80, -62.10],[-35.70, -62.06],[-35.57, -62.07],[-35.41, -62.12],[-35.28, -62.12],[-35.15, -62.16],[-35.12, -62.21],[-35.21, -62.28],[-35.08, -62.31],[-34.94, -62.29],[-34.87, -62.19],[-34.71, -62.14],[-34.29, -62.07],[-33.97, -62.03],[-33.82, -62.07],[-33.68, -62.08],[-33.56, -62.03],[-33.55, -61.95],[-33.70, -61.90],[-33.80, -61.92],[-33.94, -62.00],[-34.73, -62.10],[-34.81, -62.12],[-34.92, -62.10],[-34.92, -62.08],[-35.10, -62.05],[-35.34, -62.05],[-35.46, -62.01],[-35.58, -61.98],[-35.79, -62.04],[-35.94, -62.09],[-36.21, -62.10],[-36.38, -62.16],[-36.60, -62.20]],
            /*Lonney Cabin*/[[-35.28, -63.74],[-35.15, -63.71],[-35.27, -63.55],[-35.44, -63.54],[-35.54, -63.57],[-35.65, -63.56],[-35.71, -63.52],[-35.76, -63.38],[-35.69, -63.22],[-36.06, -62.85],[-36.01, -62.52],[-36.14, -62.42],[-36.23, -62.39],[-36.39, -62.40],[-36.39, -62.42],[-36.18, -62.49],[-36.22, -62.70],[-36.11, -62.95],[-35.93, -63.23],[-36.29, -63.44],[-36.24, -63.50],[-36.10, -63.60],[-35.75, -63.63],[-35.68, -63.67],[-35.45, -63.70]],
            /*Tooth Fairy Cabin*/[[-31.66, -58.88],[-31.81, -58.86],[-32.26, -58.60],[-32.14, -58.53],[-31.55, -58.38],[-30.70, -58.18],[-29.97, -57.85],[-29.93, -57.76],[-29.57, -57.67],[-28.97, -57.32],[-28.88, -57.37],[-28.98, -57.44],[-29.29, -57.71],[-29.54, -57.74],[-29.74, -57.95],[-30.05, -58.02],[-30.57, -58.23],[-31.01, -58.37],[-31.20, -58.56]],
            /*Old Wisdom Tree*/[[-20.80, -65.11],[-20.78, -65.16],[-20.60, -65.14],[-20.23, -65.07],[-20.06, -65.07],[-19.96, -65.00],[-20.03, -64.96],[-19.86, -64.90],[-19.65, -64.91],[-19.38, -64.83],[-19.23, -64.83],[-18.86, -64.67],[-18.12, -64.56],[-18.02, -64.51],[-17.73, -64.46],[-17.42, -64.15],[-17.08, -64.03],[-16.62, -64.04],[-16.51, -64.00],[-16.21, -63.95],[-15.91, -63.93],[-15.04, -64.01],[-14.78, -64.00],[-14.48, -63.94],[-14.39, -63.84],[-13.81, -63.70],[-13.17, -63.66],[-12.98, -63.71],[-12.92, -63.71],[-12.69, -63.65],[-12.35, -63.63],[-12.18, -63.59],[-12.26, -63.55],[-12.48, -63.57],[-12.93, -63.58],[-12.96, -63.56],[-13.02, -63.56],[-13.05, -63.58],[-13.86, -63.56],[-14.01, -63.66],[-14.12, -63.68],[-14.16, -63.66],[-14.26, -63.67],[-14.45, -63.79],[-14.46, -63.84],[-14.53, -63.89],[-14.75, -63.93],[-15.46, -63.90],[-15.72, -63.86],[-15.84, -63.88],[-16.03, -63.86],[-16.47, -63.97],[-16.60, -63.94],[-16.85, -63.98],[-17.08, -63.92],[-17.20, -63.98],[-17.41, -64.01],[-17.50, -64.09],[-17.62, -64.15],[-17.74, -64.19],[-17.91, -64.40],[-18.28, -64.48],[-18.59, -64.52],[-19.02, -64.62],[-19.42, -64.73],[-19.46, -64.77],[-20.17, -64.91],[-20.19, -64.96],[-20.30, -65.00],[-20.43, -65.00],[-20.71, -65.06]],
            ]]
            }                
        },
    {
        "type":"Feature",
        "id":"4",
        "properties":
            {
            "name_EN":"Kamasylvia - Lake Flonder",
            "name_KR":"카마실비아 - 플롱도르 호수",
            "fishGroup": ["AlbinoCoelacanth", "WhiteGrouper", "GoldenSiniperca", "Pacu", "Swiri", "DiamondMinnow", "YellowHeadCatfish", "StripedShiner", "Arowana", "Lenok", "CherrySalmon", "StumpyBullhead", "GobyMinnow", "Sweetfish"],
            "locationColor": "#57094E",

        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Lake Flonder*/[[-27.02, -63.96],[-26.90, -63.95],[-27.00, -63.67],[-26.93, -63.58],[-27.03, -63.51],[-26.74, -63.18],[-26.43, -63.18],[-25.99, -63.12],[-25.77, -63.04],[-25.53, -63.02],[-25.54, -62.93],[-25.80, -62.92],[-25.92, -62.88],[-26.11, -62.65],[-26.01, -62.50],[-25.75, -62.50],[-25.77, -62.44],[-26.06, -62.43],[-26.28, -62.32],[-26.59, -62.19],[-26.78, -62.25],[-27.13, -62.19],[-27.15, -62.13],[-26.88, -61.94],[-27.42, -61.74],[-28.05, -61.61],[-28.53, -61.64],[-29.03, -61.81],[-29.54, -61.86],[-29.83, -61.79],[-30.69, -61.49],[-30.78, -61.43],[-30.84, -61.50],[-30.55, -61.75],[-30.05, -61.89],[-29.98, -62.12],[-30.08, -62.48],[-30.18, -62.79],[-30.30, -62.83],[-30.27, -62.93],[-30.03, -62.94],[-30.03, -62.68],[-29.89, -62.54],[-29.60, -62.52],[-29.09, -62.56],[-28.52, -62.46],[-28.44, -62.38],[-28.02, -62.40],[-27.59, -62.64],[-27.19, -62.96],[-27.30, -63.11],[-27.26, -63.14],[-27.12, -63.13],[-27.16, -63.35],[-27.20, -63.50]],
            ]]
            }                
        },
    {
        "type":"Feature",
        "id":"5",
        "properties":
            {
            "name_EN":"Kamasylvia - Navarn Steppe",
            "name_KR":"카마실비아 - 나반 초원",
            "fishGroup": ["GoldenSiniperca", "Pacu", "Swiri", "DiamondMinnow", "YellowHeadCatfish", "StripedShiner", "Arowana", "Lenok", "CherrySalmon", "StumpyBullhead", "GobyMinnow", "Sweetfish"],
            "locationColor": "#AB21EA",

        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Trent*/[[-22.10, -55.47],[-22.06, -55.39],[-22.22, -55.38],[-22.36, -55.45],[-22.33, -55.58],[-22.21, -55.64],[-22.03, -55.57]],
            /*Old Wisdom Tree*/[[-17.22, -62.70],[-17.45, -62.84],[-17.35, -62.93],[-17.16, -62.91],[-17.15, -62.87],[-16.96, -62.87],[-16.88, -62.89],[-16.59, -62.77],[-16.78, -62.59],[-16.90, -62.56],[-17.05, -62.60]],
            /*Navarn Steppe*/[[-20.20, -63.45],[-20.32, -63.50],[-20.17, -63.57],[-20.06, -63.52]],
            /*Mirumok Ruins(1)*/[[-24.53, -58.87],[-24.42, -58.84],[-24.43, -58.75],[-24.59, -58.73],[-24.73, -58.74],[-24.65, -58.82]],
            /*Mirumok Ruins(2)*/[[-24.01, -58.08],[-23.86, -58.07],[-23.90, -58.17],[-23.93, -58.25],[-23.92, -58.47],[-24.09, -58.48],[-24.08, -58.41],[-24.02, -58.29]],
            /*Shady Tree Forest*/[[-22.03, -65.32],[-22.00, -65.36],[-21.68, -65.40],[-21.24, -65.37],[-21.13, -65.35],[-20.80, -65.18],[-20.83, -65.12],[-21.11, -65.09],[-21.63, -65.10],[-21.82, -65.13],[-21.93, -65.19]],
            /*Tooth Fairy Cabin*/[[-34.47, -59.92],[-34.34, -59.93],[-34.21, -59.79],[-33.70, -59.53],[-33.28, -59.43],[-33.06, -59.45],[-32.72, -59.38],[-32.45, -59.39],[-32.47, -59.53],[-32.46, -59.86],[-32.36, -59.85],[-32.35, -59.67],[-32.24, -59.54],[-32.26, -59.39],[-32.15, -59.34],[-31.99, -59.34],[-31.92, -59.30],[-32.00, -59.23],[-32.00, -59.11],[-31.70, -58.91],[-31.84, -58.89],[-32.29, -58.63],[-32.32, -58.65],[-32.70, -58.74],[-32.83, -58.80],[-33.08, -58.80],[-33.57, -58.80],[-33.62, -58.94],[-33.29, -59.06],[-33.10, -59.08],[-32.93, -59.23],[-32.86, -59.33],[-33.03, -59.40],[-33.54, -59.43],[-33.99, -59.56],[-34.34, -59.72]],
            /*Acher Guard Post(1)*/[[-29.81, -55.49],[-29.75, -55.45],[-29.82, -55.42],[-29.91, -55.44]],
            /*Acher Guard Post(2)*/[[-29.03, -55.41],[-28.80, -55.38],[-28.95, -55.33],[-29.13, -55.31],[-29.17, -55.35]],
            /*Loopy Tree Forest*/[[-34.56, -54.99],[-34.39, -54.99],[-34.41, -55.03],[-34.56, -55.04]],
            ]]
            }                
        }, 
    {
        "type":"Feature",
        "id":"6",
        "properties":
            {
            "name_EN":"Kamasylvia - Grana",
            "name_KR":"카마실비아 - 그라나",
            "fishGroup": ["GrangesD’or", "GoldenSiniperca", "MihoSpineLoach", "SpottedBarbel", "DiamondMinnow", "YellowHeadCatfish", "StripedShiner", "Arowana", "Lenok", "CherrySalmon", "StumpyBullhead", "GobyMinnow", "Sweetfish"],
            "locationColor": "#FFD400",

        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Grana(north)*/[[-30.26, -62.97],[-30.23, -62.94],[-30.05, -62.95],[-29.99, -63.04],[-30.02, -63.15],[-29.86, -63.31],[-29.85, -63.40],[-30.00, -63.37],[-30.05, -63.33],[-30.01, -63.28],[-30.10, -63.23],[-30.22, -63.15]],
            /*Grana(east)*/[[-27.96, -63.53],[-28.30, -63.54],[-28.86, -63.69],[-29.33, -63.65],[-29.34, -63.59],[-28.91, -63.56],[-28.51, -63.43],[-28.02, -63.45]],
            /*Grana(west)*/[[-30.97, -63.87],[-30.95, -63.92],[-30.71, -63.89],[-30.49, -63.84],[-30.35, -63.80],[-30.37, -63.77],[-30.54, -63.81]],
            /*Grana(center)*/[[-29.78, -63.78],[-29.55, -63.84],[-29.58, -63.88],[-29.76, -63.83],[-29.82, -63.82],[-29.84, -63.86],[-29.69, -63.91],[-29.47, -63.92],[-29.40, -63.95],[-29.45, -63.97],[-29.68, -63.97],[-29.79, -63.95],[-29.94, -63.86],[-29.92, -63.81]],
            /*Grana(south)*/[[-29.69, -64.05],[-29.77, -64.12],[-29.72, -64.19],[-29.65, -64.30],[-29.74, -64.41],[-29.79, -64.50],[-29.80, -64.61],[-29.77, -64.65],[-29.73, -64.71],[-29.80, -64.75],[-29.69, -64.78],[-29.65, -64.71],[-29.59, -64.68],[-29.51, -64.69],[-29.45, -64.75],[-29.48, -64.78],[-29.33, -64.78],[-29.43, -64.69],[-29.38, -64.62],[-29.37, -64.56],[-29.43, -64.45],[-29.46, -64.35],[-29.53, -64.30],[-29.48, -64.22],[-29.40, -64.13],[-29.40, -64.07],[-29.44, -64.03],[-29.57, -64.01]],
            /*Grana(small)*/[[-28.48, -64.22],[-28.33, -64.23],[-28.33, -64.19],[-28.47, -64.20]],
            ]]
            }                
        },
    {
        "type":"Feature",
        "id":"7",
        "properties":
            {
            "name_EN":"Kamasylvia - Okiara River",
            "name_KR":"카마실비아 - 오기에르 강",
            "fishGroup": ["GoldenSiniperca", "MihoSpineLoach", "LeatherCarp", "DiamondMinnow", "YellowHeadCatfish", "StripedShiner", "Arowana", "Lenok", "CherrySalmon", "CommonMinnow", "Grayling", "Bleeker"],
            "locationColor": "#FF7D6B",

        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Okiara River*/[[-31.94, -64.67],[-31.83, -64.62],[-31.40, -64.75],[-30.97, -64.88],[-30.75, -64.89],[-30.44, -64.93],[-30.04, -64.90],[-29.87, -64.94],[-29.22, -64.92],[-29.10, -64.95],[-28.86, -64.87],[-28.70, -64.86],[-28.40, -64.92],[-28.20, -64.92],[-28.07, -64.87],[-27.93, -64.86],[-27.83, -64.80],[-27.73, -64.80],[-27.44, -64.75],[-27.45, -64.59],[-27.45, -64.51],[-27.28, -64.33],[-27.21, -64.20],[-27.00, -64.01],[-26.93, -64.01],[-27.09, -64.23],[-27.18, -64.36],[-27.29, -64.50],[-27.25, -64.57],[-27.31, -64.63],[-27.23, -64.70],[-27.11, -64.71],[-27.04, -64.83],[-26.91, -64.86],[-26.51, -65.07],[-26.13, -65.07],[-26.02, -65.15],[-25.82, -65.16],[-25.44, -65.26],[-25.31, -65.25],[-25.22, -65.21],[-24.75, -65.22],[-24.63, -65.26],[-24.44, -65.23],[-23.50, -65.27],[-23.12, -65.26],[-22.79, -65.26],[-22.49, -65.32],[-22.05, -65.32],[-22.03, -65.36],[-22.46, -65.36],[-22.88, -65.30],[-23.40, -65.34],[-24.28, -65.33],[-24.51, -65.29],[-24.71, -65.30],[-24.89, -65.31],[-25.43, -65.31],[-25.64, -65.32],[-25.96, -65.28],[-26.15, -65.17],[-26.52, -65.10],[-27.08, -64.94],[-27.78, -64.92],[-29.03, -64.98],[-29.73, -65.08],[-30.41, -65.03],[-30.75, -64.94],[-31.28, -64.88],[-31.42, -64.82]],
            /*Weenie Cabin*/[[-30.96, -61.49],[-30.90, -61.42],[-31.01, -61.34],[-31.49, -61.12],[-31.98, -60.99],[-32.13, -60.93],[-32.48, -60.72],[-32.93, -60.57],[-34.14, -60.55],[-34.79, -60.50],[-34.95, -60.46],[-35.14, -60.49],[-35.31, -60.43],[-35.44, -60.44],[-35.51, -60.40],[-35.72, -60.45],[-35.88, -60.42],[-35.95, -60.43],[-36.22, -60.36],[-36.41, -60.28],[-36.53, -60.28],[-36.55, -60.50],[-36.38, -60.49],[-35.95, -60.60],[-35.62, -60.57],[-35.51, -60.55],[-35.46, -60.57],[-35.46, -60.60],[-35.36, -60.61],[-35.35, -60.63],[-35.27, -60.64],[-35.19, -60.60],[-35.01, -60.61],[-34.99, -60.63],[-34.67, -60.59],[-34.22, -60.64],[-33.89, -60.60],[-33.70, -60.64],[-33.23, -60.67],[-32.92, -60.69],[-32.57, -60.82],[-32.27, -61.03],[-32.09, -61.12],[-31.73, -61.16],[-31.26, -61.35],[-31.15, -61.45]],
            ]]
            }                
        },
    {
        "type":"Feature",
        "id":"8",
        "properties":
            {
            "name_EN":"Kamasylvia",
            "name_KR":"카마실비아",
            "fishGroup": ["AmurMinnow", "YellowfinSculpin", "Bass"],
            "locationColor": "#909090",

        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Manshaum Forest*/[[-18.25, -61.18],[-18.26, -61.23],[-18.15, -61.23],[-17.97, -61.20],[-18.00, -61.14]],
            /*Mirumok Ruins*/[[-24.35, -58.90],[-24.04, -58.91],[-24.08, -58.99],[-24.32, -58.99],[-24.39, -58.94]],
            /*Gyfin Rhasia Temple*/[[-31.75, -66.16],[-31.78, -66.12],[-31.72, -66.09],[-31.32, -66.04],[-31.29, -66.08],[-31.38, -66.10],[-31.38, -66.15],[-31.36, -66.24],[-31.26, -66.30],[-31.27, -66.38],[-31.33, -66.53],[-31.34, -66.65],[-31.47, -66.80],[-31.60, -66.85],[-31.90, -66.82],[-31.81, -66.79],[-31.81, -66.71],[-31.69, -66.67],[-31.58, -66.57],[-31.50, -66.54],[-31.50, -66.48],[-31.41, -66.41],[-31.44, -66.29],[-31.54, -66.26],[-31.52, -66.17]],
            /*Grana(west)*/[[-31.07, -63.91],[-31.31, -63.96],[-31.40, -63.96],[-31.72, -63.98],[-31.76, -64.08],[-31.71, -64.10],[-31.66, -64.07],[-31.47, -64.09],[-31.32, -64.03],[-31.24, -63.99],[-31.17, -63.99],[-31.03, -63.95]],
            /*Grana(east)*/[[-27.37, -63.12],[-27.33, -63.16],[-27.49, -63.20],[-27.58, -63.25],[-27.60, -63.32],[-27.44, -63.36],[-27.25, -63.35],[-27.30, -63.40],[-27.70, -63.38],[-27.89, -63.48],[-27.95, -63.44],[-27.75, -63.32],[-27.64, -63.21],[-27.52, -63.15]],
            /*Krogdalo's Trace(west)*/[[-37.07, -62.27],[-37.17, -62.32],[-37.70, -62.42],[-38.27, -62.37],[-38.32, -62.28],[-37.90, -62.33],[-37.62, -62.34],[-37.13, -62.24]],
            /*Krogdalo's Trace(east)*/[[-33.56, -61.80],[-33.63, -61.85],[-33.42, -61.89],[-33.36, -61.83]],
            /*Looney Cabin*/[[-35.19, -63.78],[-35.02, -63.82],[-35.00, -63.87],[-35.13, -63.89],[-35.24, -63.86]],
            /*Tooth Fairy Cabin*/[[-34.46, -59.93],[-34.50, -59.99],[-34.36, -59.99],[-34.34, -59.94]],
            /*Loopy Tree Forest(1)*/[[-33.44, -53.76],[-33.38, -53.73],[-33.49, -53.55],[-33.72, -53.32],[-34.26, -53.26],[-34.56, -53.19],[-34.88, -53.23],[-35.00, -53.20],[-35.17, -53.04],[-35.40, -52.98],[-35.87, -53.03],[-35.85, -53.08],[-35.39, -53.02],[-35.23, -53.07],[-35.02, -53.24],[-34.87, -53.27],[-34.56, -53.23],[-34.23, -53.32],[-33.79, -53.37],[-33.58, -53.64]],
            /*Loopy Tree Forest(2)*/[[-33.15, -54.08],[-32.98, -54.01],[-32.97, -53.95],[-33.27, -53.96],[-33.31, -54.03],[-33.27, -54.08]],
            /*Loopy Tree Forest(3)*/[[-32.64, -54.06],[-32.45, -54.02],[-32.43, -53.96],[-32.69, -53.96],[-32.73, -54.02]],
            /*Loopy Tree Forest(4)*/[[-34.57, -54.99],[-34.39, -54.99],[-34.41, -54.93],[-34.56, -54.92]],
            /*Yianaros's Field*/[[-26.88, -55.98],[-26.77, -55.94],[-26.59, -55.98],[-26.55, -56.04],[-26.67, -56.04]],
            /*Trent(1)*/[[-22.02, -55.58],[-22.20, -55.65],[-22.07, -55.64]],
            /*Trent(2)*/[[-19.24, -56.36],[-19.26, -56.31],[-19.62, -56.32],[-19.88, -56.33],[-19.93, -56.36],[-19.88, -56.37],[-19.74, -56.39]],
            /*Salun's Border(1)*/[[-12.97, -63.73],[-12.99, -63.84],[-12.90, -63.89],[-12.77, -63.87],[-12.76, -63.83],[-12.89, -63.72]],
            /*Salun's Border(2)*/[[-14.60, -64.35],[-14.49, -64.36],[-14.44, -64.30],[-14.23, -64.22],[-14.08, -64.08],[-14.14, -64.04],[-14.33, -64.11],[-14.34, -64.20],[-14.36, -64.24],[-14.56, -64.30]],
        ]]
            }                
        },
    

    //-----  Drieghan  -----//
    {
        "type":"Feature",
        "id":"9",
        "properties":
            {
            "name_EN":"Drieghan - Dormann Lumber Camp",
            "name_KR":"드리간 - 도르만 벌목장",
            "fishGroup": ["Axolotl", "Burbot", "GrassCarp", "Mori", "Stickleback", "AmurGoby", "FreshwaterEel", "AmurIde", "KoreanLoach", "GobyMinnow", "Crawfish"],
            "locationColor": "#572601",

        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Ahib Conflict Zone*/[[-8.95, -62.70],[-8.80, -62.61],[-9.37, -62.43],[-9.81, -62.43],[-9.83, -62.31],[-9.74, -62.25],[-9.88, -62.20],[-9.87, -62.07],[-10.02, -62.03],[-10.15, -62.05],[-10.11, -62.13],[-10.16, -62.28],[-10.03, -62.39],[-10.32, -62.37],[-10.55, -62.29],[-10.72, -62.31],[-10.74, -62.43],[-10.55, -62.46],[-10.47, -62.44],[-10.16, -62.47],[-9.93, -62.54],[-9.90, -62.57],[-10.01, -62.64],[-10.22, -62.83],[-10.11, -62.84],[-9.78, -62.63],[-9.60, -62.56],[-9.35, -62.52]],
            /*Khalk Canyon*/[[-5.85, -62.68],[-5.70, -62.73],[-5.45, -62.57],[-5.42, -62.39],[-5.19, -62.23],[-5.28, -61.94],[-5.46, -61.86],[-5.61, -61.62],[-5.72, -61.63],[-5.57, -61.86],[-5.31, -62.13],[-5.51, -62.30],[-5.60, -62.34],[-5.74, -62.46],[-5.78, -62.58]],
            /*Duvencrune(south)*/[[7.87, -64.20],[7.84, -64.24],[7.69, -64.20],[7.63, -64.14],[7.63, -64.06],[7.69, -63.93],[8.05, -63.66],[8.26, -63.56],[8.23, -63.42],[8.39, -63.28],[8.21, -63.17],[8.22, -63.11],[8.28, -63.08],[8.34, -63.06],[8.35, -63.02],[8.45, -63.02],[8.42, -63.09],[8.47, -63.22],[8.54, -63.27],[8.38, -63.41],[8.40, -63.53],[8.03, -63.79],[7.78, -63.95],[7.70, -64.10],[7.70, -64.14],[7.80, -64.14]],
            /*Duvencrune(north)*/[[5.65, -61.40],[5.66, -61.46],[5.77, -61.44],[5.86, -61.40],[5.88, -61.33],[5.99, -61.30],[6.33, -61.27],[6.85, -61.08],[7.45, -61.15],[7.73, -61.25],[7.86, -61.18],[7.91, -61.12],[7.88, -61.08],[7.98, -61.06],[7.63, -60.86],[7.83, -60.38],[7.83, -60.24],[7.68, -60.17],[7.62, -60.20],[7.74, -60.25],[7.56, -60.73],[6.28, -61.22],[5.84, -61.30]],
            /*Harak's Shelter*/[[0.01, -63.29],[-0.13, -63.27],[-0.01, -63.21],[-0.02, -62.95],[0.08, -62.88],[1.04, -62.81],[1.28, -62.75],[1.41, -62.58],[1.58, -62.41],[2.31, -61.77],[2.72, -61.61],[2.87, -61.32],[2.71, -61.00],[3.10, -60.71],[3.39, -60.36],[3.79, -60.11],[4.10, -60.02],[5.22, -60.05],[5.41, -59.95],[5.54, -59.82],[5.70, -59.71],[5.62, -59.60],[5.79, -59.29],[5.95, -59.24],[6.10, -59.31],[6.02, -59.44],[5.77, -59.54],[5.81, -59.64],[5.83, -59.71],[6.04, -59.74],[6.24, -59.70],[6.38, -59.74],[6.83, -59.71],[6.90, -59.75],[6.97, -59.86],[6.90, -59.88],[6.80, -59.82],[6.01, -59.78],[5.73, -59.81],[5.45, -60.03],[5.10, -60.15],[4.29, -60.07],[4.10, -60.08],[3.63, -60.33],[3.24, -60.63],[3.06, -60.88],[2.90, -60.97],[3.03, -61.16],[2.99, -61.30],[3.17, -61.45],[2.29, -61.94],[2.21, -62.10],[1.99, -62.20],[1.95, -62.34],[1.56, -62.56],[1.37, -62.81],[1.17, -62.91],[0.76, -62.90],[0.17, -62.95],[0.14, -63.21]],
            /*Marak Farm*/[[13.25, -63.92],[13.36, -63.89],[13.43, -63.77],[13.41, -63.60],[13.63, -63.44],[13.68, -63.31],[13.79, -63.26],[13.78, -63.14],[13.77, -62.84],[13.65, -62.74],[13.59, -62.59],[13.37, -62.51],[13.20, -62.49],[12.90, -62.39],[12.81, -62.39],[12.68, -62.34],[12.69, -62.29],[12.57, -62.28],[12.56, -62.34],[12.66, -62.38],[12.79, -62.42],[13.07, -62.50],[13.23, -62.55],[13.36, -62.56],[13.52, -62.62],[13.64, -62.82],[13.71, -62.89],[13.69, -62.97],[13.70, -63.11],[13.72, -63.18],[13.55, -63.37],[13.40, -63.54],[13.29, -63.60],[13.30, -63.77],[13.23, -63.87]],
            /*Blood Wolf Settlement*/[[18.46, -60.62],[18.54, -60.57],[18.71, -60.57],[18.72, -60.66],[18.54, -60.69],[18.50, -60.86],[18.05, -61.13],[17.60, -61.20],[17.45, -61.36],[17.15, -61.41],[16.91, -61.38],[16.74, -61.45],[16.44, -61.49],[16.39, -61.53],[15.64, -61.53],[15.48, -61.53],[15.03, -61.61],[14.85, -61.62],[14.82, -61.59],[15.00, -61.54],[15.37, -61.49],[15.57, -61.47],[16.18, -61.47],[16.34, -61.44],[16.66, -61.38],[16.87, -61.31],[17.18, -61.37],[17.37, -61.32],[17.45, -61.19],[17.58, -61.15],[17.98, -61.08],[18.38, -60.82],[18.45, -60.72]],
            /*Dormann Lumber Camp*/[[9.20, -57.11],[9.26, -57.15],[9.39, -57.07],[9.42, -56.99],[9.49, -56.96],[9.82, -56.87],[9.88, -56.83],[10.00, -56.79],[10.10, -56.79],[10.11, -56.71],[10.05, -56.66],[10.17, -56.64],[10.32, -56.60],[10.42, -56.53],[10.54, -56.50],[10.56, -56.53],[10.73, -56.46],[10.89, -56.41],[10.91, -56.35],[11.14, -56.25],[11.26, -56.23],[11.41, -56.17],[11.44, -56.08],[11.50, -56.07],[11.61, -56.17],[11.89, -56.25],[12.06, -56.25],[12.11, -56.30],[12.20, -56.26],[12.17, -56.22],[12.12, -56.17],[12.12, -56.12],[12.18, -56.09],[12.18, -56.01],[12.38, -55.89],[12.46, -55.86],[12.50, -55.81],[12.57, -55.81],[12.58, -55.83],[12.79, -55.78],[12.91, -55.72],[13.12, -55.72],[13.18, -55.68],[13.08, -55.61],[12.94, -55.68],[12.78, -55.63],[12.69, -55.64],[12.63, -55.73],[12.51, -55.75],[12.45, -55.74],[12.33, -55.80],[12.27, -55.86],[12.16, -55.92],[12.05, -55.96],[11.78, -55.96],[11.61, -55.84],[11.59, -55.57],[11.67, -55.51],[11.65, -55.47],[11.70, -55.43],[11.80, -55.36],[11.79, -55.32],[11.74, -55.32],[11.65, -55.38],[11.59, -55.48],[11.47, -55.54],[11.44, -55.71],[11.42, -55.83],[11.33, -55.88],[11.20, -55.84],[10.91, -55.76],[10.77, -55.63],[10.72, -55.40],[10.54, -55.30],[10.18, -55.29],[10.02, -55.25],[9.72, -55.28],[9.44, -55.18],[9.11, -55.20],[8.57, -55.29],[8.35, -55.28],[8.19, -55.35],[8.06, -55.33],[7.86, -55.40],[7.58, -55.30],[7.48, -55.33],[7.39, -55.39],[7.50, -55.44],[7.60, -55.44],[7.78, -55.42],[7.80, -55.47],[7.91, -55.47],[7.95, -55.44],[8.04, -55.43],[8.27, -55.45],[8.39, -55.40],[8.60, -55.42],[9.01, -55.37],[9.08, -55.39],[9.30, -55.38],[9.42, -55.40],[9.59, -55.40],[9.59, -55.43],[9.68, -55.43],[9.87, -55.39],[10.12, -55.48],[10.22, -55.48],[10.30, -55.55],[10.54, -55.67],[10.63, -55.78],[10.56, -55.95],[10.39, -56.05],[10.34, -56.16],[10.21, -56.31],[10.16, -56.39],[10.19, -56.43],[10.13, -56.52],[10.14, -56.60],[9.97, -56.65],[9.98, -56.70],[9.65, -56.87],[9.58, -56.88],[9.41, -56.95],[9.35, -56.95],[9.32, -57.04]],
            ]]
            }                
        },
    {
        "type":"Feature",
        "id":"10",
        "properties":
            {
            "name_EN":"Drieghan",
            "name_KR":"드리간",
            "fishGroup": ["Minnow", "Perch","YellowfinSculpin"],
            "locationColor": "#909090",

        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Marcha Outpost*/[[-2.97, -63.42],[-2.89, -63.46],[-2.75, -63.38],[-2.65, -63.35],[-2.51, -63.32],[-2.52, -63.28],[-2.71, -63.31]],
            /*Gayak Altar*/[[-0.03, -63.31],[-0.17, -63.29],[-0.27, -63.43],[-0.28, -63.64],[-0.17, -63.65],[-0.08, -63.46],[-0.08, -63.41]],
            /*Duvencrune(south)*/[[8.35, -63.02],[8.25, -63.05],[8.26, -63.08],[8.34, -63.06]],
            /*Duvencrune(east)*/[[9.66, -62.08],[9.69, -62.07],[9.76, -62.09],[9.73, -62.12],[9.64, -62.14],[9.57, -62.12],[9.59, -62.09]],
            /*Marak Farm*/[[13.25, -64.09],[13.16, -64.06],[13.16, -63.99],[13.20, -63.96],[13.35, -63.94],[13.27, -63.99]],
            /*Gervish Mountains*/[[12.87, -56.69],[12.78, -56.72],[12.54, -56.60],[12.39, -56.51],[12.26, -56.49],[12.16, -56.33],[12.24, -56.30],[12.35, -56.43],[12.52, -56.48]],
            /*Dormann Lumber Camp*/[[11.41, -55.74],[11.37, -55.78],[11.40, -55.82]],
            /*Olun's Valley*/[[-1.04, -64.24],[-0.96, -64.21],[-0.88, -64.26],[-0.86, -64.33],[-0.76, -64.35],[-0.56, -64.30],[-0.45, -64.21],[-0.36, -64.22],[-0.54, -64.34],[-0.75, -64.39],[-0.82, -64.39],[-0.92, -64.47],[-1.05, -64.48],[-1.05, -64.44],[-0.99, -64.43],[-0.89, -64.38],[-0.94, -64.32],[-0.94, -64.27]],
            ]]
            }                
        },
    {
        "type":"Feature",
        "id":"11",
        "properties":
            {
            "name_EN":"Drieghan - Gayak Altar",
            "name_KR":"드리간 - 가야크 제단",
            "fishGroup": ["Axolotl", "Burbot", "GrassCarp", "Mori", "Stickleback", "AmurGoby", "FreshwaterEel", "SpinedLoach", "OilyShiner", "AmurMinnow", "Grayling"],
            "locationColor": "#0C500A",

        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Marcha Outpost*/[[-2.50, -63.32],[-2.52, -63.28],[-2.17, -63.21],[-1.80, -63.22],[-1.69, -63.24],[-1.39, -63.11],[-1.23, -62.96],[-0.97, -63.02],[-1.04, -63.17],[-1.32, -63.31],[-1.63, -63.28],[-1.95, -63.28],[-2.15, -63.28],[-2.25, -63.32]],
            /*Duvencrune(south)*/[[7.87, -64.24],[7.90, -64.20],[8.04, -64.22],[8.38, -64.23],[8.56, -64.19],[9.03, -64.18],[9.76, -64.32],[10.40, -64.53],[10.35, -64.56],[9.66, -64.35],[9.07, -64.22],[8.54, -64.25],[8.42, -64.28]],
            /*Gayak Altar*/[[-12.24, -63.54],[-12.14, -63.58],[-11.46, -63.46],[-11.40, -63.41],[-11.13, -63.41],[-9.86, -63.15],[-9.53, -63.07],[-9.43, -62.96],[-8.89, -62.79],[-8.58, -62.70],[-8.38, -62.73],[-7.54, -62.72],[-7.44, -62.75],[-6.80, -62.65],[-6.19, -62.74],[-6.03, -62.73],[-5.22, -63.07],[-4.93, -63.07],[-4.64, -63.25],[-4.57, -63.39],[-4.41, -63.48],[-4.27, -63.51],[-4.23, -63.54],[-4.32, -63.62],[-4.43, -63.62],[-4.60, -63.74],[-4.53, -63.77],[-4.37, -63.66],[-4.29, -63.66],[-4.16, -63.57],[-3.97, -63.55],[-3.65, -63.61],[-3.48, -63.74],[-3.47, -63.79],[-3.11, -63.92],[-2.90, -64.10],[-2.59, -64.15],[-2.27, -64.15],[-2.00, -64.10],[-1.68, -64.26],[-1.78, -64.35],[-1.80, -64.61],[-1.84, -64.67],[-1.79, -64.71],[-1.71, -64.71],[-1.66, -64.68],[-1.69, -64.65],[-1.70, -64.42],[-1.45, -64.22],[-0.82, -64.13],[-0.41, -64.16],[-0.02, -64.33],[0.22, -64.35],[0.68, -64.30],[0.86, -64.32],[1.21, -64.28],[1.57, -64.36],[1.59, -64.44],[2.12, -64.55],[2.46, -64.42],[2.48, -64.34],[2.78, -64.21],[3.06, -64.22],[3.19, -64.17],[3.53, -64.10],[3.73, -64.15],[4.15, -64.02],[4.49, -64.01],[4.94, -63.84],[5.59, -63.70],[5.78, -63.78],[6.08, -63.77],[6.48, -63.99],[6.72, -64.11],[7.06, -64.20],[7.31, -64.23],[7.58, -64.27],[7.78, -64.25],[7.65, -64.22],[7.58, -64.16],[7.00, -64.14],[6.56, -63.95],[6.13, -63.72],[5.77, -63.73],[5.60, -63.67],[5.11, -63.62],[4.96, -63.37],[4.48, -63.05],[4.59, -62.93],[4.71, -62.88],[4.99, -62.79],[5.01, -62.70],[4.81, -62.16],[4.89, -62.07],[5.17, -61.83],[5.25, -61.61],[5.63, -61.48],[5.62, -61.42],[5.42, -61.52],[5.11, -61.57],[5.09, -61.75],[4.93, -61.84],[4.88, -62.01],[4.71, -62.11],[4.91, -62.70],[4.89, -62.79],[4.45, -62.90],[4.26, -63.00],[4.20, -63.08],[3.90, -63.10],[3.65, -63.06],[2.41, -63.29],[2.16, -63.42],[1.75, -63.71],[1.64, -63.86],[1.14, -64.06],[0.69, -64.18],[0.52, -64.26],[0.09, -64.30],[-0.15, -64.18],[-0.69, -64.05],[-0.64, -63.91],[-0.52, -63.85],[-0.18, -63.66],[-0.28, -63.65],[-0.66, -63.86],[-0.86, -64.04],[-1.53, -64.17],[-1.98, -64.06],[-2.20, -64.09],[-2.81, -64.05],[-3.02, -63.89],[-3.33, -63.77],[-3.33, -63.63],[-2.92, -63.47],[-2.99, -63.44],[-3.29, -63.55],[-3.46, -63.59],[-3.73, -63.53],[-3.92, -63.53],[-4.12, -63.31],[-4.29, -63.21],[-4.63, -63.19],[-4.84, -62.97],[-5.27, -62.84],[-5.52, -62.84],[-5.72, -62.75],[-5.87, -62.70],[-6.55, -62.58],[-7.10, -62.58],[-7.38, -62.65],[-7.93, -62.62],[-8.17, -62.68],[-8.51, -62.59],[-8.70, -62.66],[-8.77, -62.63],[-8.90, -62.71],[-9.12, -62.75],[-9.48, -62.92],[-9.63, -63.01],[-10.00, -63.02],[-10.15, -62.91],[-10.13, -62.88],[-10.23, -62.86],[-10.37, -62.99],[-10.73, -63.05],[-11.03, -63.16],[-11.39, -63.27],[-11.53, -63.38]],
            /*Marak Farm*/[[12.99, -64.25],[13.14, -64.25],[13.15, -64.18],[13.23, -64.11],[13.14, -64.08],[13.04, -64.16]],
            /*Blood Wolf Settlement(1)*/[[18.39, -60.58],[18.44, -60.55],[18.32, -60.47],[18.25, -60.24],[17.90, -60.07],[17.67, -60.00],[17.49, -60.00],[17.34, -59.98],[17.17, -60.04],[17.14, -60.16],[17.24, -60.20],[17.20, -60.24],[17.18, -60.46],[17.06, -60.51],[16.71, -60.49],[16.51, -60.52],[16.35, -60.59],[16.47, -60.72],[16.53, -60.72],[16.55, -60.66],[16.49, -60.62],[16.54, -60.57],[16.88, -60.53],[17.13, -60.55],[17.33, -60.46],[17.29, -60.40],[17.34, -60.21],[17.32, -60.18],[17.33, -60.04],[17.67, -60.05],[17.71, -60.07],[17.91, -60.12],[18.20, -60.30],[18.16, -60.45]],
            /*Blood Wolf Settlement(2)*/[[18.76, -60.58],[18.77, -60.65],[19.11, -60.70],[19.22, -60.68],[19.71, -60.74],[20.06, -60.72],[20.31, -60.60],[20.41, -60.48],[20.67, -60.31],[20.82, -60.26],[21.25, -60.29],[21.61, -60.30],[21.75, -60.28],[21.84, -60.32],[21.86, -60.31],[21.87, -60.25],[21.79, -60.25],[21.59, -60.24],[20.67, -60.23],[20.45, -60.35],[20.41, -60.43],[20.22, -60.57],[20.00, -60.66],[19.73, -60.69],[19.29, -60.65],[19.10, -60.65]],
            /*Khimut Lumber Camp*/[[17.67, -54.67],[17.85, -54.72],[17.91, -54.71],[18.03, -54.62],[18.14, -54.60],[18.16, -54.58],[18.23, -54.60],[18.22, -54.64],[18.37, -54.75],[18.54, -54.76],[18.59, -54.80],[18.53, -54.82],[18.34, -54.78],[18.20, -54.81],[18.15, -54.75],[17.95, -54.77],[17.76, -54.80],[17.68, -54.77],[17.51, -54.81],[17.41, -54.79],[16.77, -54.88],[16.64, -54.94],[16.35, -54.94],[16.18, -55.02],[15.79, -55.08],[15.72, -55.06],[15.37, -55.10],[15.26, -55.16],[15.09, -55.19],[14.94, -55.25],[14.55, -55.33],[14.44, -55.38],[14.31, -55.38],[14.08, -55.43],[14.04, -55.46],[13.89, -55.46],[13.68, -55.50],[13.42, -55.64],[13.23, -55.67],[13.11, -55.58],[13.35, -55.51],[13.47, -55.45],[13.63, -55.44],[13.77, -55.37],[13.97, -55.37],[14.37, -55.27],[14.68, -55.21],[14.94, -55.08],[15.20, -55.02],[15.32, -54.97],[16.11, -54.83],[16.20, -54.85],[16.61, -54.78],[16.89, -54.74],[16.99, -54.70],[17.22, -54.68]],
            ]]
            }                
        },
    {
        "type":"Feature",
        "id":"12",
        "properties":
            {
            "name_EN":"Drieghan - Kiernak Lake",
            "name_KR":"드리간 - 카르낙 호수",
            "fishGroup": ["Axolotl", "BlackShiner", "GrassCarp", "Mori", "Stickleback", "AmurGoby", "FreshwaterEel", "Minnow", "Perch","YellowfinSculpin"],
            "locationColor": "#739700",

        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Duvencrune Farmland*/[[6.01, -62.42],[6.02, -62.47],[6.09, -62.47],[6.20, -62.43],[6.18, -62.40],[6.07, -62.40]],
            /*Sherekhan Necropolis*/[[1.50, -60.67],[1.67, -60.71],[1.81, -60.60],[1.69, -60.52]],
            /*Garmoth's Nest(1)*/[[10.96, -58.18],[10.80, -58.17],[10.60, -58.35],[10.58, -58.43],[10.44, -58.51],[10.47, -58.63],[10.62, -58.63],[10.68, -58.49],[10.66, -58.44],[10.72, -58.33]],
            /*Garmoth's Nest(2)*/[[10.04, -58.62],[10.03, -58.65],[10.09, -58.65],[10.09, -58.61]],
            /*Garmoth's Nest(3)*/[[9.88, -58.60],[9.84, -58.50],[9.81, -58.35],[9.67, -58.19],[9.56, -58.16],[9.57, -58.07],[9.51, -58.06],[9.49, -58.10],[9.50, -58.20],[9.63, -58.23],[9.65, -58.35],[9.66, -58.48],[9.60, -58.51],[9.73, -58.60]],
            /*Garmoth's Nest(4)*/[[9.89, -58.79],[9.88, -58.85],[9.67, -58.86],[9.60, -58.83],[9.50, -58.85],[9.36, -58.83],[8.93, -58.79],[8.93, -58.74],[8.79, -58.72],[8.77, -58.67],[8.88, -58.65],[9.00, -58.72],[9.07, -58.77],[9.54, -58.79],[9.64, -58.77]],
            /*Marak Farm(1)*/[[12.79, -61.37],[12.86, -61.40],[12.89, -61.37],[12.83, -61.35]],
            /*Marak Farm(2)*/[[12.21, -61.69],[12.26, -61.66],[12.33, -61.65],[12.39, -61.68],[12.32, -61.71],[12.22, -61.72]],
            /*Gervish Mountains*/[[12.84, -56.75],[12.93, -56.71],[13.11, -56.80],[13.16, -56.89],[13.11, -56.95],[13.16, -56.97],[13.28, -57.13],[13.25, -57.19],[13.20, -57.19],[13.02, -57.15],[12.96, -57.10],[13.05, -56.96],[13.01, -56.92],[12.95, -56.91],[12.93, -56.89],[12.94, -56.82]],
            /*Kiernak Lake*/[[10.10, -62.23],[10.07, -62.36],[10.14, -62.40],[10.34, -62.41],[10.40, -62.44],[10.34, -62.49],[10.41, -62.51],[10.55, -62.51],[10.73, -62.45],[10.89, -62.44],[10.93, -62.38],[10.82, -62.34],[10.72, -62.35],[10.67, -62.18],[10.59, -62.16],[10.40, -62.18],[10.35, -62.14],[10.26, -62.14],[10.26, -62.20],[10.19, -62.23]],
            /*Fountain of Origin(east)*/[[1.85, -58.73],[1.85, -58.79],[1.92, -58.82],[1.92, -58.91],[2.04, -58.97],[2.12, -58.92],[2.25, -58.94],[2.31, -58.90],[2.25, -58.88],[2.35, -58.81],[2.29, -58.78],[2.34, -58.74],[2.36, -58.69],[2.25, -58.69],[2.24, -58.64],[2.03, -58.65]],
            /*Fountain of Origin(west)*/[[-2.70, -58.42],[-2.69, -58.38],[-2.62, -58.34],[-2.57, -58.34],[-2.47, -58.36],[-2.44, -58.33],[-2.40, -58.33],[-2.32, -58.36],[-2.28, -58.32],[-2.18, -58.33],[-2.23, -58.41],[-2.12, -58.54],[-2.20, -58.60],[-2.62, -58.59],[-2.79, -58.50]],
            ]]
            }                
        },
    {
        "type":"Feature",
        "id":"13",
        "properties":
            {
            "name_EN":"Drieghan - Duvencrune",
            "name_KR":"드리간 - 드벤크룬",
            "fishGroup": ["Axolotl", "Burbot", "GrassCarp", "Mori", "Stickleback", "AmurGoby", "FreshwaterEel", "StoneMoroko", "KoreanLoach", "StumpyBullhead", "Sweetfish"],
            "locationColor": "#1D6964",

        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Duvencrune(south)*/[[8.80, -62.70],[8.84, -62.65],[8.95, -62.64],[9.00, -62.70],[8.86, -62.71],[8.71, -62.77],[8.53, -62.81],[8.41, -62.95],[8.28, -62.96],[8.14, -62.91],[8.19, -62.83],[8.26, -62.79],[8.48, -62.78],[8.50, -62.73],[8.25, -62.69],[8.13, -62.70],[8.16, -62.64],[8.27, -62.63],[8.30, -62.62],[8.41, -62.64],[8.70, -62.70]],
            /*Duvencrune(north)*/[[8.00, -61.08],[7.94, -61.09],[7.96, -61.12],[7.89, -61.20],[7.76, -61.27],[7.99, -61.45],[7.98, -61.55],[7.88, -61.61],[7.74, -61.59],[7.68, -61.61],[7.80, -61.67],[7.90, -61.69],[7.91, -61.71],[7.87, -61.73],[7.85, -61.76],[7.95, -61.78],[8.11, -61.74],[8.10, -61.70],[8.03, -61.69],[7.99, -61.63],[8.04, -61.59],[8.17, -61.58],[8.28, -61.62],[8.38, -61.65],[8.51, -61.67],[8.61, -61.71],[8.72, -61.80],[8.92, -61.88],[9.06, -61.96],[9.35, -61.97],[9.42, -62.00],[9.61, -62.02],[9.76, -61.97],[9.90, -61.98],[9.89, -62.02],[9.99, -62.05],[10.10, -62.04],[10.20, -61.97],[10.21, -61.91],[10.19, -61.87],[10.11, -61.86],[10.05, -61.89],[9.99, -61.87],[9.89, -61.91],[9.77, -61.91],[9.62, -61.90],[9.57, -61.83],[9.47, -61.80],[9.42, -61.80],[9.34, -61.86],[9.31, -61.90],[9.16, -61.89],[9.09, -61.85],[9.01, -61.84],[8.83, -61.79],[8.66, -61.64],[8.50, -61.61],[8.43, -61.50],[8.20, -61.42],[7.99, -61.26],[8.06, -61.18]],
            ]]
            }                
        },
    {
        "type":"Feature",
        "id":"14",
        "properties":
            {
            "name_EN":"Drieghan - Khimut Lumber Camp",
            "name_KR":"드리간 - 히무트 벌목장",
            "fishGroup": ["Axolotl", "BlackShiner", "GrassCarp", "Mori", "Stickleback", "AmurGoby", "FreshwaterEel", "CherryIcefish", "ShuttlesHoppfish", "Perch", "Bass"],
            "locationColor": "#E5AA42",

        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Blood Wolf Settlement(east)*/[[21.89, -60.80],[21.86, -60.87],[21.93, -60.98],[21.86, -61.04],[22.16, -61.03],[22.04, -60.80],[22.00, -60.69],[22.07, -60.47],[22.02, -60.39],[22.13, -60.21],[22.28, -60.10],[22.37, -59.89],[22.37, -59.81],[22.53, -59.71],[22.53, -59.58],[22.42, -59.53],[22.45, -59.40],[22.50, -59.37],[22.50, -59.16],[22.62, -59.06],[22.63, -58.84],[22.59, -58.60],[22.52, -58.53],[22.34, -58.17],[22.17, -58.05],[22.20, -58.01],[22.07, -57.90],[22.00, -57.90],[21.94, -57.85],[21.91, -57.79],[21.83, -57.81],[21.88, -57.86],[21.86, -57.93],[21.84, -57.97],[21.96, -58.05],[22.13, -58.09],[22.27, -58.21],[22.36, -58.42],[22.44, -58.57],[22.38, -58.63],[22.43, -58.69],[22.40, -58.81],[22.46, -58.98],[22.52, -59.01],[22.36, -59.24],[22.41, -59.32],[22.31, -59.51],[22.18, -59.64],[22.25, -59.73],[22.14, -59.91],[22.00, -59.94],[21.88, -60.16],[21.94, -60.18],[21.92, -60.23],[21.90, -60.34],[21.91, -60.38],[21.84, -60.58],[21.88, -60.62],[21.84, -60.75],[21.91, -60.77]],
            /*Khimut Lumber Camp*/[[23.50, -53.79],[23.50, -53.83],[23.21, -53.86],[22.99, -53.84],[22.76, -53.83],[22.57, -53.77],[22.47, -53.78],[22.33, -53.75],[22.34, -53.67],[22.16, -53.64],[22.07, -53.61],[21.98, -53.62],[21.83, -53.42],[21.60, -53.33],[21.36, -53.29],[21.27, -53.30],[20.94, -53.21],[20.43, -53.15],[20.40, -53.19],[20.22, -53.23],[20.14, -53.38],[19.93, -53.46],[19.77, -53.46],[19.49, -53.55],[19.34, -53.68],[19.24, -53.73],[18.99, -53.79],[18.89, -53.89],[18.71, -53.92],[18.53, -54.17],[18.41, -54.20],[18.35, -54.37],[18.27, -54.45],[18.26, -54.57],[18.18, -54.56],[18.20, -54.52],[18.08, -54.46],[18.12, -54.36],[18.18, -54.29],[18.12, -54.27],[18.15, -54.21],[18.33, -54.09],[18.47, -54.02],[18.55, -53.88],[18.77, -53.76],[18.95, -53.72],[19.06, -53.61],[19.48, -53.46],[19.81, -53.33],[19.86, -53.27],[20.06, -53.22],[20.03, -53.04],[19.77, -52.91],[19.70, -52.94],[19.40, -52.87],[19.38, -52.80],[19.20, -52.76],[18.98, -52.78],[18.88, -52.75],[18.91, -52.65],[19.09, -52.56],[19.69, -52.56],[19.79, -52.61],[19.78, -52.68],[20.14, -52.79],[20.28, -52.73],[20.36, -52.73],[20.44, -52.79],[20.66, -52.80],[21.31, -53.18],[21.74, -53.26],[21.94, -53.35],[22.14, -53.57],[22.43, -53.64],[22.81, -53.78],[23.08, -53.81],[23.26, -53.76]],
            ]]
            }                
        },
    {
        "type":"Feature",
        "id":"15",
        "properties":
            {
            "name_EN":"Drieghan - Macalod Lake",
            "name_KR":"드리간 - 마칼로드 호수",
            "fishGroup": ["Axolotl", "BlackShiner", "GrassCarp", "Mori", "Stickleback", "AmurGoby", "FreshwaterEel", "CherryIcefish", "Minnow", "StumpyBullhead", "Perch"],
            "locationColor": "#29BA2D",

        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Tshira Ruins*/[[21.81, -57.79],[21.89, -57.78],[22.00, -57.67],[22.77, -57.58],[23.08, -57.33],[23.06, -57.24],[23.14, -57.22],[23.36, -57.40],[23.48, -57.37],[23.58, -57.00],[23.50, -56.72],[22.92, -56.75],[22.63, -56.81],[22.44, -56.94],[22.03, -56.93],[21.47, -56.49],[21.84, -56.19],[21.70, -56.12],[21.24, -56.11],[20.95, -56.12],[20.80, -56.21],[20.31, -56.17],[20.17, -56.17],[19.95, -56.28],[19.69, -56.23],[19.66, -56.13],[19.54, -56.06],[19.37, -56.15],[19.44, -56.25],[19.13, -56.43],[19.21, -56.56],[19.15, -56.62],[18.95, -56.63],[18.76, -56.74],[18.65, -56.86],[18.76, -57.09],[18.94, -57.26],[19.27, -57.33],[19.50, -57.23],[19.68, -57.23],[19.83, -57.31],[20.02, -57.35],[20.24, -57.26],[20.51, -57.31],[20.66, -57.40],[21.09, -57.25],[21.32, -57.27],[21.53, -57.41],[21.43, -57.68]],
            /*Macalod Lake*/[[20.64, -55.17],[20.61, -55.25],[20.68, -55.28],[20.68, -55.37],[20.87, -55.41],[21.19, -55.35],[21.20, -55.30],[21.24, -55.29],[21.45, -55.20],[21.52, -55.14],[21.54, -55.07],[21.45, -55.03],[21.25, -55.02],[20.99, -55.07],[20.95, -55.11],[20.89, -55.12],[20.79, -55.10]],
            /*Macalod Lake(west)*/[[18.00, -55.60],[18.07, -55.61],[18.10, -55.68],[18.14, -55.77],[18.22, -55.79],[18.24, -55.83],[18.12, -55.84],[17.96, -55.79],[17.92, -55.68]],
            ]]
            }                
        },
    {
        "type":"Feature",
        "id":"16",
        "properties":
            {
            "name_EN":"Drieghan - Fountain of Origin",
            "name_KR":"드리간 - 기원의 샘",
            "fishGroup": ["Axolotl", "Burbot", "GrassCarp", "Mori", "Stickleback", "AmurGoby", "FreshwaterEel", "AmurIde", "OilyShiner", "RoundtailParadisefish", "Mudfish"],
            "locationColor": "#62FF5C",

        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Fountain of Origin*/[[0.49, -56.89],[0.54, -56.87],[0.58, -56.91],[0.66, -56.96],[0.75, -57.06],[0.76, -57.15],[0.72, -57.17],[0.80, -57.37],[0.78, -57.47],[0.72, -57.49],[0.71, -57.59],[0.83, -57.67],[0.88, -57.83],[0.98, -57.85],[1.02, -57.95],[0.96, -58.01],[0.78, -57.97],[0.42, -57.98],[0.39, -57.94],[0.27, -57.94],[0.14, -58.07],[-0.55, -58.09],[-0.62, -58.12],[-0.62, -58.32],[-0.77, -58.39],[-0.85, -58.41],[-0.93, -58.40],[-0.97, -58.38],[-0.90, -58.32],[-0.92, -58.26],[-1.05, -58.22],[-1.12, -58.23],[-1.10, -58.26],[-1.15, -58.26],[-1.20, -58.23],[-1.20, -58.17],[-1.14, -58.09],[-1.07, -58.07],[-0.98, -58.08],[-0.97, -58.09],[-0.94, -58.10],[-0.95, -58.07],[-0.91, -58.02],[-0.80, -58.04],[-0.65, -57.93],[-0.37, -57.93],[-0.30, -57.98],[-0.19, -57.96],[-0.16, -57.99],[-0.11, -57.99],[0.09, -57.89],[0.25, -57.90],[0.30, -57.87],[0.37, -57.89],[0.45, -57.88],[0.55, -57.80],[0.53, -57.76],[0.59, -57.74],[0.68, -57.73],[0.72, -57.68],[0.60, -57.55],[0.66, -57.45],[0.70, -57.44],[0.72, -57.40],[0.62, -57.15],[0.62, -57.01]],
            ]]
            }                
        },


    //-----  Calpheon  -----//
    {
        "type":"Feature",
        "id":"17",
        "properties":
            {
            "name_EN":"Calpheon",
            "name_KR":"칼페온",
            "fishGroup": ["Snakehead", "YellowHeadCatfish", "StripedShiner", "Arowana", "Lenok", "CherrySalmon", "FreshwaterEel", "Carp", "RoundtailParadisefish", "Smelt", "Mudfish", "NotchJaw", "Dace", "Salmon"],
            "locationColor": "#CE0C23",

        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Crioville*/[[-14.85, -56.29],[-14.78, -56.29],[-14.74, -56.16],[-14.63, -56.06],[-14.63, -55.98],[-14.68, -55.95],[-14.62, -55.88],[-14.55, -55.83],[-14.39, -55.79],[-14.35, -55.74],[-14.63, -55.71],[-14.79, -55.80],[-14.91, -55.79],[-15.03, -55.93],[-14.93, -56.00],[-14.95, -56.08],[-14.86, -56.21]],
            /*Crioville(north)*/[[-15.57, -55.36],[-15.46, -55.34],[-15.39, -55.41],[-15.27, -55.42],[-15.12, -55.47],[-15.15, -55.51],[-15.33, -55.57],[-15.56, -55.56],[-15.63, -55.52],[-15.61, -55.46],[-15.51, -55.45]],
            /*Calpheon Castle(north)*/[[-18.67, -44.44],[-18.73, -44.45],[-18.69, -44.50],[-18.65, -44.50],[-18.47, -44.60],[-18.20, -44.65],[-18.01, -44.61],[-17.90, -44.43],[-17.68, -44.35],[-17.47, -44.37],[-17.42, -44.39],[-17.30, -44.37],[-17.17, -44.28],[-17.14, -44.30],[-17.06, -44.27],[-16.96, -44.10],[-16.89, -43.94],[-16.70, -43.79],[-16.70, -43.73],[-16.58, -43.71],[-16.48, -43.64],[-16.07, -43.73],[-15.81, -43.74],[-15.68, -43.48],[-15.83, -43.43],[-16.05, -43.45],[-16.29, -43.38],[-16.54, -43.48],[-16.56, -43.60],[-16.75, -43.70],[-16.77, -43.80],[-16.85, -43.80],[-17.08, -44.01],[-17.05, -44.15],[-17.26, -44.27],[-17.52, -44.30],[-17.76, -44.31],[-17.90, -44.36],[-18.00, -44.45],[-18.07, -44.56],[-18.12, -44.59],[-18.39, -44.58],[-18.47, -44.54],[-18.58, -44.51],[-18.61, -44.47]],
            /*Trent*/[[-14.75, -46.45],[-14.45, -46.42],[-14.28, -46.67],[-14.18, -46.84],[-14.26, -47.06],[-14.29, -47.37],[-14.42, -47.39],[-14.55, -47.48],[-14.63, -47.68],[-14.72, -47.72],[-14.75, -47.84],[-14.60, -47.76],[-14.47, -47.94],[-14.59, -48.07],[-14.77, -48.03],[-14.87, -48.18],[-14.77, -48.24],[-15.03, -48.56],[-15.27, -48.64],[-15.34, -48.61],[-15.44, -48.67],[-15.40, -48.71],[-15.53, -48.82],[-15.71, -48.78],[-15.86, -48.85],[-15.85, -48.94],[-15.94, -48.97],[-16.01, -48.82],[-16.17, -48.79],[-16.36, -48.81],[-16.57, -48.79],[-16.60, -48.84],[-16.93, -48.86],[-17.11, -48.99],[-17.42, -49.10],[-17.61, -49.14],[-17.69, -49.19],[-17.73, -49.28],[-17.90, -49.50],[-18.12, -49.55],[-18.24, -49.66],[-18.27, -49.93],[-18.32, -50.00],[-18.38, -50.16],[-18.63, -50.36],[-18.83, -50.42],[-19.14, -50.46],[-19.23, -50.53],[-19.29, -50.70],[-19.30, -50.76],[-19.39, -50.79],[-19.55, -51.04],[-19.56, -51.17],[-19.62, -51.20],[-19.71, -51.35],[-19.77, -51.39],[-19.78, -51.45],[-19.83, -51.46],[-19.85, -51.61],[-19.81, -51.72],[-19.69, -51.80],[-19.67, -51.96],[-19.76, -52.05],[-19.87, -52.11],[-19.84, -52.29],[-19.81, -52.38],[-19.89, -52.59],[-19.96, -52.62],[-20.16, -52.77],[-20.21, -52.78],[-20.22, -52.86],[-20.26, -52.93],[-20.19, -53.10],[-20.15, -53.22],[-20.20, -53.35],[-20.28, -53.40],[-20.27, -53.56],[-20.12, -53.65],[-19.95, -53.72],[-19.83, -53.86],[-19.85, -53.91],[-19.76, -54.07],[-19.43, -54.23],[-19.25, -54.30],[-18.96, -54.38],[-18.86, -54.48],[-18.66, -54.51],[-18.55, -54.48],[-18.32, -54.49],[-18.07, -54.65],[-17.94, -54.64],[-17.77, -54.72],[-17.45, -54.81],[-17.46, -54.91],[-17.59, -55.04],[-17.67, -55.09],[-17.79, -55.23],[-17.78, -55.40],[-17.84, -55.47],[-17.82, -55.52],[-17.63, -55.60],[-17.57, -55.66],[-17.56, -55.71],[-17.62, -55.75],[-17.77, -55.80],[-17.89, -55.78],[-17.98, -55.87],[-18.29, -55.96],[-18.33, -56.01],[-18.50, -56.04],[-18.75, -56.18],[-18.78, -56.25],[-19.07, -56.33],[-19.24, -56.36],[-19.26, -56.31],[-18.96, -56.26],[-18.79, -56.12],[-18.47, -55.98],[-18.45, -55.94],[-18.03, -55.83],[-17.97, -55.77],[-17.92, -55.57],[-17.95, -55.52],[-17.87, -55.35],[-17.89, -55.24],[-17.76, -55.08],[-17.63, -55.02],[-17.61, -55.00],[-17.50, -54.88],[-17.53, -54.82],[-17.73, -54.76],[-18.05, -54.78],[-18.51, -54.60],[-18.55, -54.53],[-18.72, -54.54],[-18.91, -54.50],[-18.95, -54.46],[-19.17, -54.40],[-19.26, -54.34],[-19.81, -54.10],[-19.92, -53.91],[-19.90, -53.87],[-19.96, -53.84],[-19.94, -53.81],[-20.00, -53.73],[-20.25, -53.64],[-20.35, -53.55],[-20.41, -53.44],[-20.47, -53.39],[-20.41, -53.36],[-20.36, -53.37],[-20.30, -53.31],[-20.25, -53.14],[-20.31, -52.99],[-20.29, -52.87],[-20.31, -52.80],[-19.96, -52.55],[-19.90, -52.34],[-19.92, -52.07],[-20.03, -51.69],[-20.23, -51.58],[-20.25, -51.38],[-20.03, -51.32],[-19.89, -51.41],[-19.71, -51.21],[-19.70, -51.09],[-19.45, -50.75],[-19.38, -50.72],[-19.25, -50.48],[-19.20, -50.42],[-18.87, -50.37],[-18.60, -50.22],[-18.41, -50.09],[-18.37, -49.96],[-18.32, -49.90],[-18.29, -49.65],[-18.18, -49.53],[-17.95, -49.46],[-17.79, -49.22],[-17.62, -49.09],[-17.40, -49.05],[-17.23, -48.98],[-17.09, -48.81],[-17.13, -48.77],[-17.06, -48.62],[-16.96, -48.55],[-16.92, -48.44],[-17.02, -48.31],[-16.99, -48.18],[-17.22, -48.01],[-17.27, -47.86],[-17.20, -47.71],[-17.03, -47.57],[-16.84, -47.59],[-16.56, -47.76],[-16.38, -47.74],[-15.97, -47.81],[-15.98, -47.86],[-15.94, -47.87],[-15.81, -47.84],[-15.62, -47.96],[-15.52, -47.96],[-15.27, -47.88],[-15.25, -47.84],[-15.20, -47.83],[-15.16, -47.84],[-14.93, -47.81],[-14.92, -47.77],[-14.83, -47.75],[-14.89, -47.70],[-14.93, -47.63],[-14.90, -47.59],[-15.02, -47.52],[-15.09, -47.54],[-15.18, -47.50],[-15.18, -47.45],[-15.27, -47.44],[-15.34, -47.48],[-15.33, -47.55],[-15.48, -47.60],[-15.54, -47.53],[-15.53, -47.47],[-15.41, -47.41],[-15.46, -47.36],[-15.57, -47.36],[-15.70, -47.26],[-15.71, -47.20],[-15.59, -47.11],[-15.54, -47.11],[-15.50, -47.07],[-15.54, -46.97],[-15.37, -46.71],[-15.23, -46.71],[-15.20, -46.65],[-15.02, -46.54],[-15.04, -46.49],[-14.99, -46.46],[-14.95, -46.49],[-14.95, -46.52],[-14.81, -46.53],[-14.73, -46.50]],
            /*Isolated Sentry Post*/[[-12.71, -43.20],[-12.67, -43.23],[-12.69, -43.27],[-12.76, -43.30],[-12.79, -43.34],[-12.66, -43.41],[-12.49, -43.39],[-12.42, -43.36],[-12.45, -43.26],[-12.65, -43.13]],
            /*Calpheon City*/[[-0.80, -44.86],[-0.79, -44.65],[-0.89, -44.62],[-1.05, -44.67],[-1.26, -44.66],[-1.32, -44.73],[-1.41, -44.75],[-1.51, -44.66],[-1.85, -44.52],[-2.02, -44.50],[-2.05, -44.47],[-2.15, -44.43],[-2.19, -44.46],[-2.33, -44.42],[-2.51, -44.42],[-2.58, -44.46],[-2.66, -44.45],[-2.84, -44.53],[-3.08, -44.72],[-3.09, -44.89],[-3.32, -45.22],[-3.67, -45.37],[-4.29, -45.29],[-4.51, -45.22],[-4.96, -45.20],[-5.24, -45.24],[-5.28, -45.30],[-5.94, -45.40],[-6.05, -45.37],[-6.20, -45.39],[-7.20, -45.08],[-7.29, -45.03],[-7.69, -44.94],[-7.99, -44.93],[-8.28, -44.90],[-8.30, -44.85],[-8.79, -44.87],[-8.80, -44.72],[-9.00, -44.73],[-8.99, -44.85],[-9.46, -44.96],[-9.83, -44.98],[-9.83, -45.10],[-10.32, -45.13],[-10.53, -45.16],[-10.67, -45.25],[-11.19, -45.25],[-11.37, -45.33],[-11.53, -45.31],[-12.28, -45.45],[-12.37, -45.44],[-12.47, -45.47],[-12.51, -45.51],[-12.58, -45.47],[-12.98, -45.55],[-13.23, -45.53],[-13.81, -45.18],[-14.21, -44.48],[-14.04, -43.41],[-14.45, -43.02],[-14.41, -42.90],[-14.05, -42.72],[-13.86, -42.65],[-13.61, -42.62],[-13.59, -42.58],[-13.73, -42.41],[-13.93, -42.47],[-13.98, -42.53],[-14.30, -42.64],[-14.34, -42.70],[-14.44, -42.72],[-14.51, -42.79],[-14.72, -42.86],[-15.21, -42.77],[-15.23, -42.72],[-15.49, -42.70],[-15.57, -42.65],[-16.43, -42.62],[-16.59, -42.62],[-17.24, -42.67],[-17.46, -42.63],[-17.54, -42.66],[-17.74, -42.65],[-17.82, -42.61],[-17.82, -42.56],[-18.09, -42.23],[-18.15, -42.09],[-18.11, -42.06],[-18.18, -41.74],[-18.30, -41.53],[-18.59, -41.65],[-18.59, -41.95],[-18.44, -42.46],[-18.02, -42.69],[-17.64, -42.81],[-17.01, -42.81],[-16.79, -42.83],[-16.63, -42.78],[-16.37, -42.84],[-16.31, -42.81],[-15.95, -42.83],[-15.85, -42.79],[-15.54, -42.85],[-15.10, -42.94],[-15.06, -42.93],[-14.76, -43.01],[-14.72, -43.04],[-14.60, -43.27],[-14.45, -43.39],[-14.41, -43.57],[-14.41, -43.95],[-14.48, -44.11],[-14.34, -44.67],[-14.26, -44.69],[-14.25, -44.87],[-13.90, -45.42],[-13.56, -45.74],[-13.53, -45.72],[-13.46, -45.75],[-13.39, -45.80],[-13.23, -45.80],[-13.19, -45.75],[-13.12, -45.75],[-12.91, -45.81],[-12.66, -45.78],[-12.60, -45.71],[-12.55, -45.69],[-12.48, -45.72],[-12.13, -45.64],[-12.06, -45.60],[-11.98, -45.60],[-11.93, -45.63],[-11.78, -45.61],[-11.71, -45.55],[-11.67, -45.55],[-11.60, -45.60],[-11.31, -45.59],[-11.23, -45.61],[-11.21, -45.59],[-10.94, -45.62],[-10.56, -45.59],[-10.46, -45.50],[-10.35, -45.50],[-10.32, -45.47],[-10.23, -45.47],[-10.03, -45.40],[-10.04, -45.36],[-10.01, -45.31],[-9.93, -45.30],[-9.87, -45.33],[-9.77, -45.32],[-9.77, -45.26],[-9.01, -45.19],[-9.00, -45.29],[-8.95, -45.30],[-8.89, -45.60],[-8.89, -45.65],[-8.93, -45.66],[-8.90, -45.85],[-8.92, -46.06],[-8.95, -46.14],[-8.95, -46.18],[-8.88, -46.22],[-8.89, -46.29],[-8.97, -46.31],[-9.05, -46.28],[-9.18, -46.29],[-9.20, -46.35],[-9.15, -46.38],[-9.15, -46.46],[-9.18, -46.72],[-9.09, -46.88],[-9.01, -46.91],[-8.97, -46.89],[-8.95, -46.84],[-9.04, -46.65],[-9.02, -46.58],[-8.80, -46.42],[-8.71, -46.42],[-8.70, -46.38],[-8.72, -46.34],[-8.70, -46.17],[-8.65, -46.17],[-8.64, -46.07],[-8.68, -45.98],[-8.75, -45.99],[-8.78, -45.55],[-8.79, -45.50],[-8.83, -45.51],[-8.85, -45.36],[-8.81, -45.30],[-8.74, -45.29],[-8.79, -45.10],[-8.44, -45.07],[-7.45, -45.20],[-6.80, -45.39],[-6.60, -45.47],[-6.41, -45.46],[-6.03, -45.65],[-5.92, -45.61],[-5.62, -45.52],[-5.61, -45.49],[-5.54, -45.47],[-5.48, -45.47],[-5.34, -45.44],[-5.16, -45.41],[-5.09, -45.36],[-5.04, -45.36],[-5.01, -45.38],[-4.49, -45.37],[-4.41, -45.40],[-3.96, -45.54],[-3.81, -45.54],[-3.67, -45.47],[-3.39, -45.47],[-3.24, -45.39],[-3.24, -45.34],[-3.17, -45.28],[-3.14, -45.28],[-2.91, -45.04],[-2.88, -44.94],[-2.83, -44.90],[-2.71, -44.87],[-2.61, -44.75],[-2.63, -44.71],[-2.61, -44.69],[-2.45, -44.65],[-2.45, -44.60],[-2.35, -44.59],[-2.25, -44.64],[-2.04, -44.66],[-1.95, -44.70],[-1.79, -44.84],[-1.65, -44.84],[-1.55, -44.89],[-1.15, -44.91],[-1.04, -44.90]],
            /*Calpheon City(south)*/[[0.49, -56.88],[0.54, -56.86],[0.54, -56.78],[0.56, -56.77],[0.53, -56.73],[0.52, -56.67],[0.57, -56.60],[0.52, -56.56],[0.69, -56.50],[0.69, -56.46],[0.81, -56.43],[0.94, -56.44],[0.94, -56.48],[1.05, -56.49],[1.10, -56.44],[1.32, -56.42],[1.48, -56.39],[1.66, -56.39],[1.69, -56.34],[1.85, -56.31],[1.89, -56.27],[1.95, -56.26],[2.18, -56.21],[2.18, -56.17],[2.26, -56.10],[2.35, -56.07],[2.36, -56.03],[2.52, -55.93],[2.50, -55.89],[2.58, -55.83],[2.63, -55.83],[2.72, -55.78],[2.81, -55.75],[2.91, -55.77],[3.19, -55.70],[3.31, -55.64],[3.35, -55.66],[3.50, -55.66],[3.52, -55.68],[3.71, -55.65],[3.86, -55.61],[3.86, -55.58],[3.92, -55.56],[4.01, -55.58],[4.11, -55.57],[4.23, -55.51],[4.49, -55.46],[4.51, -55.42],[4.61, -55.38],[4.65, -55.34],[4.72, -55.33],[4.72, -55.29],[4.80, -55.29],[4.91, -55.33],[5.00, -55.33],[5.01, -55.30],[5.16, -55.29],[5.21, -55.30],[5.29, -55.27],[5.38, -55.27],[5.48, -55.32],[5.57, -55.29],[6.17, -55.31],[6.27, -55.35],[6.34, -55.32],[6.44, -55.33],[6.65, -55.54],[6.83, -55.54],[6.96, -55.47],[7.05, -55.48],[7.08, -55.43],[7.19, -55.39],[7.35, -55.39],[7.38, -55.40],[7.48, -55.33],[7.33, -55.20],[7.12, -55.10],[6.67, -55.11],[6.63, -55.13],[6.21, -55.08],[6.14, -55.01],[5.47, -55.01],[5.40, -55.07],[5.29, -55.09],[5.04, -55.02],[4.80, -55.06],[4.30, -55.18],[4.28, -55.23],[3.81, -55.21],[3.19, -55.26],[2.84, -55.43],[2.66, -55.43],[2.63, -55.51],[2.52, -55.60],[2.46, -55.60],[2.44, -55.62],[2.49, -55.66],[2.47, -55.80],[2.10, -56.05],[2.04, -56.13],[1.78, -56.20],[1.78, -56.26],[1.44, -56.26],[1.41, -56.31],[0.84, -56.36],[0.44, -56.35],[0.28, -56.15],[-0.16, -55.97],[-0.64, -55.90],[-1.05, -55.87],[-1.87, -55.39],[-1.98, -55.22],[-2.20, -55.06],[-2.40, -54.92],[-2.41, -54.88],[-2.58, -54.79],[-2.64, -54.52],[-2.83, -54.42],[-3.05, -54.44],[-3.12, -54.47],[-3.23, -54.43],[-3.67, -54.39],[-3.84, -54.34],[-3.90, -54.30],[-4.03, -54.29],[-4.23, -54.22],[-4.65, -54.18],[-4.84, -54.22],[-4.91, -54.27],[-5.02, -54.24],[-5.43, -54.29],[-5.63, -54.26],[-5.97, -54.24],[-6.19, -54.09],[-6.29, -54.02],[-6.37, -53.90],[-6.37, -53.74],[-6.23, -53.69],[-6.23, -53.60],[-6.19, -53.58],[-6.22, -53.53],[-6.20, -53.51],[-6.29, -53.36],[-6.28, -53.32],[-6.42, -53.21],[-6.41, -53.18],[-6.51, -53.10],[-6.76, -53.04],[-7.23, -53.03],[-7.26, -53.06],[-7.30, -53.07],[-7.32, -53.05],[-7.45, -53.01],[-7.48, -53.04],[-7.52, -53.02],[-8.20, -52.68],[-8.25, -52.49],[-8.23, -52.33],[-8.31, -52.26],[-8.43, -52.15],[-8.47, -51.98],[-8.33, -51.82],[-8.33, -51.53],[-8.54, -51.31],[-8.73, -51.14],[-8.92, -51.12],[-9.15, -50.87],[-9.19, -50.80],[-9.07, -50.72],[-9.15, -50.62],[-9.24, -50.65],[-9.30, -50.59],[-9.22, -50.43],[-9.12, -50.37],[-9.15, -50.24],[-9.28, -50.15],[-9.10, -50.07],[-9.06, -50.09],[-8.93, -50.05],[-8.88, -49.73],[-8.96, -49.74],[-9.00, -49.71],[-8.93, -49.64],[-8.92, -49.56],[-8.74, -49.46],[-8.74, -49.42],[-8.83, -49.27],[-8.73, -49.16],[-8.67, -49.07],[-8.66, -49.02],[-8.53, -48.85],[-8.51, -48.80],[-8.37, -48.63],[-8.23, -48.48],[-8.26, -48.06],[-8.25, -47.96],[-8.29, -47.80],[-8.25, -47.71],[-8.23, -47.57],[-8.27, -47.49],[-8.20, -47.46],[-8.29, -47.27],[-8.38, -47.29],[-8.41, -47.26],[-8.41, -47.21],[-8.52, -47.09],[-8.84, -46.94],[-8.96, -46.97],[-8.96, -47.02],[-8.87, -47.04],[-8.84, -47.09],[-8.69, -47.18],[-8.67, -47.21],[-8.58, -47.24],[-8.54, -47.35],[-8.46, -47.41],[-8.42, -47.89],[-8.36, -47.90],[-8.36, -48.13],[-8.31, -48.37],[-8.62, -48.78],[-8.72, -48.88],[-9.01, -49.28],[-9.11, -49.56],[-9.18, -49.56],[-9.14, -49.78],[-9.06, -49.81],[-9.19, -50.00],[-9.29, -50.01],[-9.44, -50.12],[-9.35, -50.26],[-9.25, -50.33],[-9.29, -50.41],[-9.42, -50.44],[-9.45, -50.64],[-9.51, -50.62],[-9.61, -50.74],[-9.78, -50.79],[-9.72, -50.83],[-9.76, -50.93],[-9.87, -50.92],[-9.95, -50.89],[-9.98, -50.95],[-9.93, -50.97],[-9.93, -51.06],[-10.12, -51.03],[-10.19, -51.06],[-10.20, -51.13],[-10.31, -51.29],[-10.31, -51.37],[-10.40, -51.45],[-10.51, -51.61],[-10.49, -51.72],[-10.57, -51.80],[-10.64, -51.92],[-10.74, -51.99],[-10.82, -52.06],[-10.82, -52.21],[-10.86, -52.27],[-10.95, -52.28],[-10.95, -52.32],[-10.88, -52.34],[-10.82, -52.31],[-10.80, -52.33],[-10.84, -52.40],[-10.78, -52.41],[-10.77, -52.55],[-10.78, -52.67],[-10.61, -52.81],[-10.62, -52.93],[-10.81, -53.12],[-10.93, -53.22],[-10.90, -53.31],[-10.96, -53.34],[-10.98, -53.62],[-10.98, -54.07],[-11.03, -54.13],[-11.04, -54.24],[-11.39, -54.41],[-11.34, -54.44],[-11.16, -54.38],[-10.97, -54.26],[-10.96, -54.13],[-10.92, -54.08],[-10.96, -54.04],[-10.90, -53.80],[-10.93, -53.69],[-10.87, -53.30],[-10.69, -53.08],[-10.47, -52.90],[-10.48, -52.86],[-10.26, -52.87],[-10.24, -52.92],[-10.18, -52.99],[-10.15, -52.94],[-10.10, -52.94],[-10.03, -52.98],[-9.94, -52.97],[-9.79, -52.76],[-9.94, -52.69],[-10.13, -52.74],[-10.29, -52.63],[-10.26, -52.54],[-10.18, -52.51],[-10.16, -52.43],[-10.12, -52.41],[-10.07, -52.41],[-10.05, -52.36],[-10.26, -52.28],[-10.25, -52.17],[-10.13, -51.98],[-10.26, -51.83],[-10.33, -51.67],[-10.24, -51.59],[-10.26, -51.54],[-10.29, -51.52],[-10.19, -51.44],[-10.19, -51.38],[-10.18, -51.31],[-10.16, -51.30],[-10.14, -51.19],[-10.09, -51.14],[-9.87, -51.15],[-9.71, -51.06],[-9.65, -50.93],[-9.56, -50.86],[-9.50, -50.84],[-9.48, -50.77],[-9.42, -50.73],[-9.30, -50.88],[-9.24, -50.96],[-9.28, -50.98],[-9.24, -51.01],[-9.19, -51.02],[-8.95, -51.23],[-8.97, -51.24],[-8.89, -51.26],[-8.87, -51.25],[-8.76, -51.26],[-8.73, -51.28],[-8.69, -51.38],[-8.58, -51.50],[-8.50, -51.53],[-8.45, -51.74],[-8.57, -51.87],[-8.55, -52.02],[-8.59, -52.06],[-8.52, -52.18],[-8.51, -52.23],[-8.49, -52.26],[-8.45, -52.39],[-8.35, -52.48],[-8.41, -52.70],[-8.23, -52.83],[-8.09, -52.89],[-8.10, -52.91],[-8.02, -52.96],[-7.90, -52.98],[-7.92, -53.02],[-7.87, -53.08],[-7.65, -53.12],[-7.61, -53.10],[-7.58, -53.11],[-7.55, -53.16],[-7.29, -53.20],[-7.21, -53.20],[-7.17, -53.24],[-7.24, -53.25],[-7.21, -53.36],[-7.15, -53.42],[-6.99, -53.41],[-6.88, -53.48],[-6.67, -53.71],[-6.74, -53.74],[-6.96, -53.75],[-6.96, -53.79],[-6.88, -53.83],[-6.88, -53.87],[-6.91, -53.89],[-6.91, -53.95],[-6.74, -54.06],[-6.51, -54.17],[-6.47, -54.17],[-6.26, -54.27],[-6.15, -54.28],[-5.96, -54.39],[-5.70, -54.37],[-5.57, -54.37],[-5.48, -54.39],[-5.16, -54.38],[-5.07, -54.35],[-4.90, -54.34],[-4.82, -54.31],[-4.70, -54.31],[-4.61, -54.29],[-4.51, -54.30],[-4.50, -54.31],[-4.40, -54.34],[-4.30, -54.34],[-4.11, -54.37],[-3.91, -54.41],[-3.85, -54.44],[-3.65, -54.49],[-3.63, -54.55],[-3.56, -54.55],[-3.43, -54.60],[-3.19, -54.69],[-3.15, -54.71],[-3.02, -54.71],[-3.00, -54.69],[-2.95, -54.70],[-2.90, -54.78],[-2.92, -54.91],[-2.81, -54.95],[-2.72, -54.94],[-2.61, -54.91],[-2.57, -55.00],[-2.49, -55.04],[-2.34, -55.05],[-2.28, -55.11],[-2.16, -55.16],[-2.11, -55.15],[-2.09, -55.17],[-2.10, -55.21],[-2.05, -55.27],[-2.00, -55.30],[-2.00, -55.38],[-1.94, -55.46],[-1.89, -55.49],[-1.83, -55.49],[-1.81, -55.51],[-1.75, -55.63],[-1.67, -55.70],[-1.58, -55.73],[-1.51, -55.73],[-1.40, -55.75],[-1.20, -55.85],[-1.18, -55.89],[-1.02, -55.90],[-0.87, -55.96],[-0.77, -55.98],[-0.69, -55.97],[-0.54, -55.99],[-0.46, -55.99],[-0.35, -56.03],[-0.19, -56.04],[-0.06, -56.09],[-0.05, -56.12],[0.03, -56.16],[0.11, -56.17],[0.21, -56.32],[0.24, -56.33],[0.23, -56.35],[0.18, -56.35],[0.16, -56.46],[0.27, -56.51],[0.42, -56.52],[0.46, -56.54],[0.37, -56.57],[0.37, -56.60],[0.40, -56.62],[0.37, -56.66],[0.36, -56.72],[0.39, -56.76],[0.46, -56.76],[0.46, -56.82],[0.41, -56.82],[0.41, -56.86]],
            /*Northern Wheat Plantation(1)*/[[-5.04, -40.98],[-4.87, -40.80],[-4.73, -40.78],[-4.60, -40.87],[-4.62, -41.03],[-4.69, -41.09],[-4.98, -41.18],[-5.05, -41.16],[-5.31, -41.19],[-5.56, -41.26],[-5.61, -41.38],[-5.86, -41.42],[-5.92, -41.40],[-6.13, -41.43],[-6.30, -41.41],[-6.41, -41.45],[-6.80, -41.76],[-6.94, -41.77],[-7.00, -41.82],[-7.07, -41.80],[-7.23, -41.92],[-7.35, -41.98],[-7.46, -42.20],[-7.47, -42.42],[-7.40, -42.55],[-7.32, -42.74],[-7.08, -42.83],[-7.00, -42.84],[-6.77, -43.00],[-6.52, -43.24],[-6.29, -43.30],[-6.06, -43.22],[-5.97, -43.22],[-5.86, -43.28],[-5.81, -43.41],[-5.87, -43.48],[-6.12, -43.50],[-6.21, -43.54],[-6.36, -43.47],[-6.42, -43.42],[-6.42, -43.37],[-6.66, -43.22],[-6.74, -43.10],[-6.82, -43.01],[-7.12, -42.89],[-7.38, -42.77],[-7.55, -42.45],[-7.59, -42.25],[-7.60, -42.10],[-7.58, -42.01],[-7.43, -41.84],[-7.31, -41.85],[-7.20, -41.81],[-7.19, -41.79],[-6.57, -41.43],[-6.58, -41.35],[-6.52, -41.31],[-6.42, -41.30],[-6.31, -41.29],[-6.00, -41.34],[-5.67, -41.28],[-5.47, -41.13]],
            /*Northern Wheat Plantation(2)*/[[-4.22, -42.65],[-4.17, -42.61],[-3.94, -42.77],[-3.94, -42.82],[-4.10, -42.97],[-4.24, -43.01],[-4.27, -42.99],[-4.17, -42.86]],
            /*Trina Fort*/[[-5.89, -50.90],[-5.88, -50.87],[-5.27, -50.92],[-5.23, -50.97],[-5.20, -50.96],[-5.19, -51.00],[-5.30, -50.99],[-5.29, -50.96]],
            /*Beacon Entrance Post*/[[-4.72, -49.13],[-4.63, -49.11],[-4.54, -49.01],[-4.14, -49.10],[-3.94, -49.28],[-3.85, -49.39],[-3.86, -49.45],[-4.14, -49.44],[-4.22, -49.46],[-4.65, -49.30],[-4.70, -49.23],[-4.77, -49.18]],
            /*Marni Cave Path*/[[-2.82, -48.30],[-2.88, -48.40],[-2.69, -48.56],[-2.48, -48.59],[-2.40, -48.64],[-2.23, -48.64],[-2.20, -48.67],[-2.12, -48.66],[-2.09, -48.82],[-1.98, -48.96],[-1.70, -49.04],[-1.65, -49.08],[-1.61, -49.08],[-1.53, -49.03],[-1.60, -48.97],[-1.51, -48.93],[-1.58, -48.77],[-1.74, -48.78],[-1.80, -48.68],[-1.72, -48.64],[-1.87, -48.58],[-2.05, -48.56],[-2.16, -48.48],[-2.32, -48.47],[-2.40, -48.41],[-2.42, -48.35],[-2.51, -48.34],[-2.60, -48.27],[-2.71, -48.27]],
            /*Keplan Vicinity(1)*/[[0.33, -49.88],[0.35, -49.95],[0.55, -50.03],[0.66, -50.02],[0.87, -49.94],[0.80, -49.89],[0.44, -49.89],[0.43, -49.86]],
            /*Keplan Vicinity(2)*/[[1.15, -50.19],[1.14, -50.16],[1.37, -50.08],[1.35, -50.14],[1.31, -50.14],[1.26, -50.19]],
            /*Oze Pass(1)*/[[-0.94, -46.99],[-0.90, -47.07],[-0.68, -47.12],[-0.63, -47.12],[-0.57, -47.07],[-0.63, -46.99],[-0.83, -46.96]],
            /*Oze Pass(2)*/[[-0.34, -47.15],[-0.34, -47.22],[-0.31, -47.23],[-0.16, -47.24],[0.16, -47.24],[0.09, -47.16],[-0.23, -47.13]],
            /*Keplan(1)*/[[-0.56, -50.14],[-0.44, -50.25],[-0.60, -50.29],[-0.78, -50.38],[-0.84, -50.35],[-0.94, -50.38],[-1.18, -50.61],[-1.23, -50.59],[-1.21, -50.51],[-1.10, -50.40],[-0.95, -50.27],[-0.74, -50.24],[-0.67, -50.18]],
            /*Keplan(2)*/[[-1.50, -51.36],[-1.54, -51.45],[-1.50, -51.54],[-1.54, -51.63],[-1.38, -51.70],[-1.30, -51.67],[-1.43, -51.56],[-1.31, -51.48],[-1.31, -51.44],[-1.20, -51.39],[-1.37, -51.33]],
            /*Bloody Monastery*/[[8.58, -51.61],[8.62, -51.64],[8.71, -51.62],[8.71, -51.57],[8.76, -51.53],[8.76, -51.44],[8.93, -51.31],[9.09, -51.22],[9.13, -51.22],[9.16, -51.21],[9.20, -51.21],[9.24, -51.20],[9.47, -51.10],[9.59, -51.08],[9.61, -51.04],[9.85, -51.01],[9.92, -51.04],[9.98, -51.04],[10.03, -51.01],[10.22, -51.02],[10.43, -51.09],[10.52, -51.08],[10.63, -51.12],[10.78, -51.22],[10.82, -51.29],[10.87, -51.33],[11.06, -51.32],[11.20, -51.25],[11.35, -51.30],[11.41, -51.23],[11.34, -51.18],[11.12, -51.16],[11.04, -51.08],[10.93, -51.05],[10.83, -51.06],[10.72, -51.08],[10.70, -51.06],[10.59, -51.06],[10.47, -51.05],[10.41, -51.02],[10.34, -51.02],[10.27, -51.00],[10.24, -50.98],[9.98, -50.97],[9.91, -50.94],[9.53, -51.03],[9.49, -51.08],[9.39, -51.08],[9.14, -51.18],[9.07, -51.17],[8.84, -51.28],[8.84, -51.33],[8.70, -51.39],[8.70, -51.45],[8.67, -51.51],[8.67, -51.55]],
            /*Castle Ruins*/[[16.38, -49.03],[16.34, -49.06],[16.82, -49.27],[16.93, -49.36],[17.01, -49.37],[17.10, -49.40],[17.16, -49.43],[17.25, -49.41],[17.35, -49.44],[17.42, -49.43],[17.53, -49.47],[17.70, -49.45],[17.77, -49.48],[17.85, -49.47],[18.00, -49.52],[18.07, -49.51],[18.50, -49.66],[18.65, -49.71],[18.73, -49.68],[18.90, -49.72],[18.93, -49.76],[18.90, -49.79],[18.92, -49.81],[18.95, -49.79],[19.01, -49.78],[19.21, -49.84],[19.27, -49.81],[19.33, -49.81],[19.32, -49.79],[19.38, -49.75],[19.46, -49.75],[19.54, -49.76],[19.67, -49.73],[19.79, -49.76],[19.88, -49.84],[19.92, -49.84],[20.00, -49.92],[20.10, -49.93],[20.15, -49.89],[20.32, -49.90],[20.44, -49.80],[20.47, -49.80],[20.51, -49.73],[20.33, -49.69],[20.23, -49.72],[20.12, -49.71],[20.11, -49.67],[20.07, -49.65],[19.79, -49.67],[19.71, -49.66],[19.56, -49.55],[19.50, -49.55],[19.44, -49.59],[19.28, -49.59],[19.24, -49.55],[19.21, -49.54],[19.14, -49.57],[18.99, -49.56],[18.95, -49.65],[18.87, -49.66],[18.71, -49.65],[18.58, -49.65],[18.45, -49.59],[18.30, -49.56],[18.21, -49.51],[18.03, -49.48],[17.94, -49.44],[17.87, -49.46],[17.75, -49.42],[17.47, -49.41],[17.40, -49.38],[17.19, -49.37],[16.97, -49.32],[16.88, -49.25]],
            ]]
            }                
        },
    

    //-----  Serendia  -----//
    {
        "type":"Feature",
        "id":"18",
        "properties":
            {
            "name_EN":"Serendia - Heidel",
            "name_KR":"세렌디아 - 하이델",
            "fishGroup": ["Pirarucu", "GoldenAlbacore", "LeatherCarp", "MandarinFish", "YellowHeadCatfish", "StripedShiner", "Arowana", "Lenok", "CherrySalmon", "FreshwaterEel", "Carp", "Grayling", "BubbleEye", "BarbelSteed", "YellowfinSculpin", "Bitterling", "Terrapin", "Sweetfish"],
            "locationColor": "#FF5900",

        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Heidel(Pirarucu Point)*/[[8.32, -45.75],[8.47, -45.75],[8.50, -45.71],[8.62, -45.71],[8.72, -45.66],[8.78, -45.69],[8.93, -45.68],[8.95, -45.65],[9.08, -45.66],[9.24, -45.64],[9.28, -45.57],[9.39, -45.58],[9.61, -45.50],[9.75, -45.39],[9.77, -45.34],[9.88, -45.30],[9.95, -45.32],[10.03, -45.25],[10.19, -45.22],[10.29, -45.15],[10.42, -45.11],[10.41, -45.07],[10.54, -44.99],[10.78, -44.97],[10.93, -44.92],[10.98, -44.88],[11.09, -44.85],[11.12, -44.81],[11.28, -44.79],[11.30, -44.75],[11.52, -44.69],[11.63, -44.72],[11.70, -44.67],[11.89, -44.72],[12.02, -44.72],[12.06, -44.66],[12.23, -44.67],[12.43, -44.67],[12.51, -44.69],[12.57, -44.66],[12.69, -44.66],[12.85, -44.72],[12.90, -44.72],[13.02, -44.79],[13.09, -44.78],[13.21, -44.85],[13.45, -44.85],[13.50, -44.87],[13.49, -44.80],[13.51, -44.76],[13.56, -44.76],[13.64, -44.80],[13.64, -44.86],[13.67, -44.87],[13.77, -44.88],[13.81, -44.84],[13.95, -44.91],[13.93, -44.97],[14.15, -45.03],[14.24, -45.03],[14.70, -45.19],[14.74, -45.18],[15.09, -45.27],[15.30, -45.29],[15.37, -45.31],[15.65, -45.32],[15.77, -45.34],[15.95, -45.36],[16.07, -45.32],[16.18, -45.33],[16.20, -45.28],[16.38, -45.28],[16.42, -45.33],[16.64, -45.29],[16.67, -45.25],[16.89, -45.24],[16.96, -45.27],[17.04, -45.21],[17.24, -45.20],[17.25, -45.16],[17.32, -45.09],[17.38, -45.08],[17.45, -45.11],[17.48, -45.10],[17.70, -45.07],[17.89, -45.02],[18.07, -44.99],[18.07, -44.97],[18.16, -44.97],[18.18, -45.00],[18.43, -44.98],[18.42, -44.94],[18.51, -44.92],[18.55, -44.93],[18.74, -44.94],[18.80, -44.91],[18.92, -44.91],[19.01, -44.87],[19.14, -44.88],[19.16, -44.83],[19.23, -44.86],[19.31, -44.82],[19.46, -44.84],[19.51, -44.89],[19.69, -44.92],[19.89, -44.90],[19.91, -44.87],[20.05, -44.90],[20.10, -44.90],[20.16, -44.87],[20.14, -44.85],[20.24, -44.79],[20.35, -44.79],[20.38, -44.76],[20.52, -44.77],[20.57, -44.84],[20.86, -44.87],[20.89, -44.89],[20.98, -44.88],[21.01, -44.91],[21.27, -44.79],[21.49, -44.83],[21.55, -44.64],[21.55, -44.61],[21.46, -44.60],[21.32, -44.64],[21.19, -44.65],[21.13, -44.62],[21.08, -44.64],[21.00, -44.62],[21.00, -44.59],[20.96, -44.57],[20.77, -44.65],[20.74, -44.63],[20.64, -44.65],[20.42, -44.64],[20.38, -44.62],[20.01, -44.65],[19.92, -44.59],[19.73, -44.61],[19.60, -44.64],[19.56, -44.70],[19.47, -44.67],[19.40, -44.67],[19.37, -44.69],[19.32, -44.69],[19.30, -44.66],[19.11, -44.69],[19.08, -44.73],[18.98, -44.74],[18.94, -44.73],[18.25, -44.79],[18.24, -44.83],[18.09, -44.83],[18.05, -44.81],[17.82, -44.83],[17.86, -44.88],[17.85, -44.93],[17.67, -44.97],[17.49, -44.95],[17.32, -44.96],[17.28, -44.98],[17.24, -44.96],[17.17, -44.99],[17.15, -45.01],[16.89, -45.01],[16.74, -45.03],[16.45, -45.09],[16.42, -45.12],[16.30, -45.11],[16.25, -45.16],[16.19, -45.12],[16.09, -45.19],[15.97, -45.21],[15.86, -45.17],[15.78, -45.19],[15.70, -45.14],[15.61, -45.17],[15.61, -45.19],[15.58, -45.20],[15.43, -45.17],[15.43, -45.13],[15.38, -45.08],[15.25, -45.06],[15.18, -45.08],[14.80, -45.08],[14.75, -45.02],[14.51, -44.92],[14.39, -44.92],[14.32, -44.87],[14.33, -44.81],[14.15, -44.72],[14.01, -44.72],[13.95, -44.61],[13.81, -44.57],[13.77, -44.58],[13.74, -44.57],[13.72, -44.47],[13.66, -44.45],[13.39, -44.45],[13.33, -44.35],[13.26, -44.33],[13.21, -44.34],[13.17, -44.38],[13.07, -44.32],[12.97, -44.25],[12.93, -44.27],[12.93, -44.32],[12.84, -44.33],[12.78, -44.37],[12.73, -44.35],[12.51, -44.35],[12.49, -44.34],[12.29, -44.37],[12.29, -44.39],[12.24, -44.42],[12.16, -44.40],[11.97, -44.39],[11.89, -44.41],[11.89, -44.44],[11.82, -44.42],[11.79, -44.42],[11.78, -44.46],[11.69, -44.44],[11.64, -44.39],[11.50, -44.42],[11.31, -44.52],[11.23, -44.52],[11.11, -44.51],[11.05, -44.55],[11.00, -44.54],[10.72, -44.67],[10.69, -44.74],[10.59, -44.74],[10.58, -44.82],[10.32, -44.94],[10.22, -44.95],[10.19, -45.01],[10.11, -45.05],[10.05, -45.04],[9.97, -45.13],[10.00, -45.15],[9.91, -45.21],[9.89, -45.25],[9.74, -45.30],[9.64, -45.32],[9.61, -45.29],[9.53, -45.31],[9.20, -45.45],[9.01, -45.50],[8.65, -45.56],[8.65, -45.60],[8.62, -45.62],[8.59, -45.60],[8.50, -45.63],[8.46, -45.62],[8.28, -45.64]],
            ]]
            }                
        },
    {
        "type":"Feature",
        "id":"19",
        "properties":
            {
            "name_EN":"Serendia",
            "name_KR":"세렌디아",
            "fishGroup": ["LeatherCarp", "MandarinFish", "YellowHeadCatfish", "StripedShiner", "Arowana", "Lenok", "CherrySalmon", "FreshwaterEel", "Carp", "Grayling", "BubbleEye", "BarbelSteed", "YellowfinSculpin", "Bitterling", "Terrapin", "Sweetfish"],
            "locationColor": "#FFC800",

        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Watchtower(1)*/[[7.04, -47.64],[7.10, -47.64],[7.14, -47.75],[7.03, -47.87],[7.17, -47.99],[7.16, -48.07],[7.12, -48.05],[7.09, -48.07],[7.10, -48.12],[7.17, -48.16],[7.23, -48.14],[7.32, -48.18],[7.20, -48.24],[7.26, -48.39],[7.24, -48.43],[7.29, -48.49],[7.20, -48.55],[7.20, -48.61],[6.95, -48.75],[6.97, -48.88],[6.91, -48.94],[6.91, -49.00],[6.99, -49.07],[6.95, -49.32],[7.06, -49.43],[7.02, -49.47],[6.96, -49.48],[6.91, -49.50],[6.87, -49.60],[6.95, -49.66],[6.92, -49.69],[6.98, -49.74],[6.89, -49.79],[6.71, -49.65],[6.94, -49.43],[6.86, -49.30],[6.81, -49.26],[6.91, -49.19],[6.91, -49.16],[6.83, -49.05],[6.85, -49.01],[6.81, -48.98],[6.79, -48.94],[6.86, -48.89],[6.86, -48.85],[6.81, -48.80],[6.87, -48.72],[6.84, -48.49],[6.90, -48.42],[6.85, -48.35],[6.95, -48.21],[6.92, -48.18],[7.00, -48.11],[6.99, -48.08],[6.95, -48.08],[6.92, -48.06],[7.00, -48.02],[7.00, -47.98],[6.94, -47.90],[6.89, -47.90],[6.86, -47.88],[6.88, -47.83],[6.99, -47.79],[7.04, -47.73]],
            /*Watchtower(2)*/[[6.98, -47.54],[6.88, -47.52],[6.88, -47.48],[6.97, -47.48]],
            /*Serendia Western Gateway*/[[5.45, -46.09],[5.28, -46.12],[5.35, -46.16],[5.31, -46.27],[5.19, -46.35],[5.05, -46.40],[5.05, -46.42],[5.02, -46.45],[4.98, -46.46],[4.88, -46.60],[4.91, -46.61],[4.88, -46.68],[4.82, -46.71],[4.62, -46.78],[4.42, -46.98],[4.34, -47.00],[4.20, -47.20],[4.14, -47.22],[4.21, -47.31],[4.06, -47.51],[4.05, -47.54],[4.16, -47.64],[4.28, -47.81],[4.26, -48.30],[4.50, -48.59],[4.51, -48.75],[4.60, -48.90],[4.59, -48.98],[4.63, -49.07],[4.58, -49.33],[4.62, -49.41],[4.59, -49.44],[4.60, -49.47],[4.57, -49.65],[4.57, -49.77],[4.47, -49.78],[4.52, -49.84],[4.47, -49.87],[4.19, -50.24],[4.26, -50.30],[4.18, -50.37],[4.24, -50.41],[4.22, -50.46],[4.21, -50.69],[4.24, -50.76],[4.20, -50.81],[4.15, -50.80],[4.08, -50.83],[4.10, -50.93],[4.05, -50.97],[3.98, -50.95],[3.89, -51.00],[3.90, -51.04],[3.86, -51.13],[3.99, -51.24],[3.96, -51.29],[4.18, -51.37],[4.22, -51.45],[4.29, -51.47],[4.35, -51.43],[4.35, -51.28],[4.30, -51.24],[4.29, -51.22],[4.36, -51.17],[4.34, -51.02],[4.31, -51.00],[4.32, -50.98],[4.36, -50.98],[4.36, -50.85],[4.27, -50.80],[4.32, -50.77],[4.35, -50.72],[4.32, -50.65],[4.35, -50.53],[4.44, -50.50],[4.47, -50.45],[4.40, -50.28],[4.40, -50.20],[4.62, -49.94],[4.55, -49.90],[4.59, -49.82],[4.68, -49.76],[4.66, -49.59],[4.74, -49.51],[4.75, -49.42],[4.81, -49.40],[4.81, -49.35],[4.78, -49.30],[4.94, -49.23],[4.94, -49.23],[4.90, -49.12],[4.80, -49.12],[4.81, -49.08],[4.75, -49.05],[4.78, -48.98],[4.72, -48.96],[4.75, -48.91],[4.68, -48.86],[4.74, -48.73],[4.78, -48.61],[4.84, -48.52],[4.96, -48.45],[4.87, -48.38],[4.93, -48.34],[4.97, -48.26],[5.20, -48.09],[5.35, -48.09],[5.85, -47.79],[5.72, -47.73],[5.63, -47.71],[5.66, -47.64],[5.61, -47.61],[5.68, -47.57],[5.68, -47.51],[5.73, -47.45],[5.87, -47.37],[6.07, -47.19],[6.12, -47.16],[6.23, -47.09],[6.25, -47.04],[6.30, -46.98],[6.31, -46.93],[6.28, -46.91],[6.31, -46.86],[6.30, -46.82],[6.18, -46.71],[6.18, -46.64],[6.30, -46.56],[6.49, -46.48],[6.52, -46.34],[6.32, -46.16],[6.35, -46.11],[6.24, -46.11],[6.23, -46.23],[6.28, -46.23],[6.29, -46.26],[6.44, -46.35],[6.44, -46.43],[6.31, -46.52],[6.14, -46.56],[6.11, -46.65],[6.12, -46.77],[6.25, -46.86],[6.23, -46.97],[6.13, -47.09],[6.07, -47.11],[5.78, -47.38],[5.70, -47.41],[5.57, -47.51],[5.58, -47.53],[5.52, -47.63],[5.62, -47.76],[5.56, -47.88],[5.44, -47.97],[5.34, -47.98],[5.31, -48.01],[5.31, -48.05],[5.15, -48.06],[4.94, -48.20],[4.90, -48.26],[4.75, -48.31],[4.63, -48.30],[4.54, -48.26],[4.44, -48.11],[4.44, -47.91],[4.39, -47.82],[4.39, -47.78],[4.25, -47.63],[4.24, -47.58],[4.15, -47.53],[4.14, -47.48],[4.21, -47.42],[4.28, -47.28],[4.28, -47.18],[4.39, -47.05],[4.43, -47.04],[4.47, -46.97],[4.52, -46.95],[4.65, -46.82],[4.83, -46.76],[4.96, -46.67],[4.99, -46.55],[5.06, -46.48],[5.27, -46.40],[5.31, -46.33],[5.34, -46.33],[5.43, -46.23],[5.46, -46.15],[5.50, -46.15],[5.50, -46.11]],
            /*Glish(west)*/[[8.89, -48.25],[8.71, -48.55],[9.18, -48.78],[9.60, -48.86],[9.98, -48.73],[10.03, -48.53],[9.79, -48.17],[9.45, -48.08]],
            /*Glish(north)*/[[9.69, -46.51],[10.30, -46.39],[10.42, -46.23],[10.55, -46.19],[10.58, -46.05],[10.71, -46.02],[10.85, -46.09],[10.94, -46.20],[10.99, -46.34],[10.99, -46.43],[11.11, -46.47],[11.25, -46.50],[11.64, -46.48],[11.81, -46.53],[11.89, -46.59],[11.86, -46.71],[11.76, -46.71],[11.72, -46.73],[11.75, -46.85],[11.67, -46.88],[11.56, -47.02],[11.59, -47.08],[11.56, -47.12],[11.50, -47.12],[11.58, -47.21],[11.59, -47.26],[11.41, -47.49],[11.38, -47.56],[11.30, -47.64],[10.92, -47.61],[10.81, -47.65],[10.64, -47.64],[10.51, -47.57],[10.52, -47.39],[10.36, -47.24],[10.15, -47.24],[10.02, -47.30],[9.94, -47.36],[9.83, -47.38],[9.66, -47.22],[9.65, -47.15],[9.70, -47.12],[9.69, -47.01],[9.53, -46.83],[9.53, -46.60]],
            /*Glish(south)*/[[10.57, -49.75],[10.58, -49.87],[10.70, -49.95],[11.35, -50.07],[11.65, -50.05],[11.80, -50.09],[11.87, -50.22],[12.11, -50.32],[12.37, -50.32],[12.86, -50.14],[12.83, -49.92],[12.87, -49.72],[13.16, -49.60],[13.40, -49.60],[13.96, -49.65],[14.45, -49.63],[14.98, -49.54],[15.09, -49.44],[15.01, -49.38],[14.83, -49.44],[13.92, -49.28],[13.86, -49.15],[13.51, -48.88],[13.50, -48.74],[13.40, -48.64],[13.21, -48.58],[12.90, -48.57],[12.63, -48.68],[12.56, -48.79],[12.55, -49.15],[12.85, -49.27],[12.86, -49.34],[12.98, -49.36],[13.08, -49.39],[13.06, -49.52],[12.75, -49.68],[12.62, -49.64],[12.41, -49.66],[12.27, -49.76],[12.07, -49.67],[11.89, -49.61],[11.62, -49.60],[11.58, -49.54],[11.27, -49.54],[10.99, -49.57],[10.75, -49.64]],
            /*Northern Cienaga*/[[15.45, -49.18],[15.48, -49.22],[15.57, -49.24],[15.98, -49.15],[16.18, -49.03],[16.26, -49.03],[16.29, -48.99],[16.22, -48.69],[16.47, -48.53],[16.55, -48.56],[16.66, -48.51],[16.86, -48.55],[16.98, -48.55],[17.19, -48.52],[17.27, -48.44],[17.38, -48.38],[17.33, -48.18],[17.23, -48.14],[17.13, -48.13],[17.07, -48.09],[17.08, -47.89],[17.27, -47.72],[17.38, -47.65],[17.38, -47.61],[17.51, -47.43],[17.49, -47.26],[17.39, -47.05],[17.25, -46.85],[17.15, -46.73],[16.78, -46.49],[16.72, -46.46],[16.65, -46.40],[16.64, -46.29],[16.53, -46.15],[16.36, -46.13],[16.19, -45.87],[15.72, -45.89],[15.68, -45.92],[15.90, -46.01],[15.91, -46.07],[16.09, -46.11],[16.11, -46.15],[16.07, -46.25],[15.98, -46.24],[15.98, -46.31],[15.90, -46.33],[15.75, -46.27],[15.73, -46.14],[15.57, -46.12],[15.53, -46.09],[15.44, -46.10],[15.42, -46.15],[15.48, -46.21],[15.40, -46.25],[15.30, -46.25],[15.24, -46.39],[15.28, -46.53],[15.39, -46.70],[15.49, -46.80],[15.57, -46.80],[15.69, -46.92],[15.81, -46.93],[16.19, -46.79],[16.23, -46.68],[16.31, -46.65],[16.41, -46.65],[16.44, -46.68],[16.58, -46.70],[16.70, -46.83],[16.88, -46.84],[16.93, -46.89],[17.17, -46.92],[17.35, -47.14],[17.35, -47.26],[17.27, -47.39],[17.27, -47.60],[17.16, -47.64],[17.07, -47.75],[17.07, -47.82],[16.85, -47.98],[16.84, -48.05],[16.70, -48.08],[16.57, -48.17],[16.51, -48.27],[16.40, -48.40],[16.42, -48.43],[16.32, -48.50],[16.19, -48.54],[16.14, -48.50],[15.97, -48.57],[15.89, -48.65],[15.88, -48.76],[15.90, -48.88],[15.86, -48.94],[15.88, -48.97],[15.60, -49.09]],
            /*Biraghi Den*/[[3.49, -43.78],[3.57, -43.72],[3.65, -43.77],[3.59, -43.83],[3.59, -43.93],[3.66, -44.01],[3.60, -44.05],[3.52, -44.02],[3.41, -43.86]],
            /*Northern Plain of Serendia(1)*/[[7.60, -44.86],[7.70, -44.82],[7.76, -44.82],[7.76, -44.86],[7.82, -44.86],[7.84, -44.83],[7.91, -44.83],[7.96, -44.90],[7.93, -45.01],[7.85, -45.10],[7.73, -45.17],[7.64, -45.16],[7.56, -45.12],[7.54, -45.06],[7.56, -44.97],[7.62, -44.94]],
            /*Northern Plain of Serendia(2)*/[[8.03, -45.09],[8.10, -45.08],[8.14, -45.14],[8.25, -45.15],[8.27, -45.09],[8.32, -45.00],[8.43, -45.03],[8.44, -45.14],[8.38, -45.15],[8.38, -45.21],[8.43, -45.23],[8.43, -45.29],[8.36, -45.30],[8.17, -45.29],[8.13, -45.23],[8.03, -45.24],[7.96, -45.19],[7.98, -45.13]],
            /*Heidel(Pirarucu Point added)*/[[-0.77, -44.64],[-0.78, -44.87],[-0.75, -44.88],[-0.70, -44.85],[-0.48, -44.90],[-0.15, -44.91],[0.18, -44.88],[0.23, -44.91],[0.34, -44.86],[0.57, -44.89],[0.73, -44.98],[0.97, -44.95],[1.26, -45.07],[1.33, -45.15],[1.40, -45.15],[1.47, -45.17],[1.51, -45.15],[1.58, -45.18],[1.59, -45.21],[1.70, -45.24],[1.76, -45.20],[1.84, -45.21],[1.89, -45.28],[2.01, -45.31],[2.06, -45.35],[2.17, -45.37],[2.27, -45.47],[2.35, -45.49],[2.40, -45.46],[2.50, -45.49],[2.63, -45.56],[2.78, -45.59],[2.86, -45.64],[2.89, -45.58],[3.04, -45.61],[3.05, -45.58],[3.21, -45.65],[3.24, -45.63],[3.36, -45.66],[3.39, -45.69],[3.55, -45.74],[3.58, -45.72],[3.66, -45.77],[3.75, -45.77],[3.89, -45.78],[3.90, -45.82],[3.94, -45.82],[4.10, -45.90],[4.30, -45.92],[4.31, -45.89],[4.39, -45.88],[4.50, -45.91],[4.59, -45.91],[4.66, -46.02],[5.19, -46.11],[5.28, -46.09],[5.29, -46.11],[5.41, -46.08],[5.43, -46.05],[5.46, -46.05],[5.49, -46.07],[5.64, -46.01],[5.68, -46.01],[5.68, -45.97],[5.82, -45.94],[6.18, -46.07],[6.24, -46.07],[6.25, -46.10],[6.34, -46.10],[6.36, -46.07],[6.51, -46.08],[6.72, -46.05],[6.75, -46.02],[6.90, -46.02],[7.10, -45.98],[7.22, -45.98],[7.30, -45.95],[7.49, -45.96],[7.59, -45.92],[7.70, -45.89],[7.81, -45.90],[7.98, -45.87],[8.04, -45.87],[8.23, -45.79],[8.30, -45.78],[8.32, -45.75],[8.47, -45.75],[8.50, -45.71],[8.62, -45.71],[8.72, -45.66],[8.78, -45.69],[8.93, -45.68],[8.95, -45.65],[9.08, -45.66],[9.24, -45.64],[9.28, -45.57],[9.39, -45.58],[9.61, -45.50],[9.75, -45.39],[9.77, -45.34],[9.88, -45.30],[9.95, -45.32],[10.03, -45.25],[10.19, -45.22],[10.29, -45.15],[10.42, -45.11],[10.41, -45.07],[10.54, -44.99],[10.78, -44.97],[10.93, -44.92],[10.98, -44.88],[11.09, -44.85],[11.12, -44.81],[11.28, -44.79],[11.30, -44.75],[11.52, -44.69],[11.63, -44.72],[11.70, -44.67],[11.89, -44.72],[12.02, -44.72],[12.06, -44.66],[12.23, -44.67],[12.43, -44.67],[12.51, -44.69],[12.57, -44.66],[12.69, -44.66],[12.85, -44.72],[12.90, -44.72],[13.02, -44.79],[13.09, -44.78],[13.21, -44.85],[13.45, -44.85],[13.50, -44.87],[13.49, -44.80],[13.51, -44.76],[13.56, -44.76],[13.64, -44.80],[13.64, -44.86],[13.67, -44.87],[13.77, -44.88],[13.81, -44.84],[13.95, -44.91],[13.93, -44.97],[14.15, -45.03],[14.24, -45.03],[14.70, -45.19],[14.74, -45.18],[15.09, -45.27],[15.30, -45.29],[15.37, -45.31],[15.65, -45.32],[15.77, -45.34],[15.95, -45.36],[16.07, -45.32],[16.18, -45.33],[16.20, -45.28],[16.38, -45.28],[16.42, -45.33],[16.64, -45.29],[16.67, -45.25],[16.89, -45.24],[16.96, -45.27],[17.04, -45.21],[17.24, -45.20],[17.25, -45.16],[17.32, -45.09],[17.38, -45.08],[17.45, -45.11],[17.48, -45.10],[17.70, -45.07],[17.89, -45.02],[18.07, -44.99],[18.07, -44.97],[18.16, -44.97],[18.18, -45.00],[18.43, -44.98],[18.42, -44.94],[18.51, -44.92],[18.55, -44.93],[18.74, -44.94],[18.80, -44.91],[18.92, -44.91],[19.01, -44.87],[19.14, -44.88],[19.16, -44.83],[19.23, -44.86],[19.31, -44.82],[19.46, -44.84],[19.51, -44.89],[19.69, -44.92],[19.89, -44.90],[19.91, -44.87],[20.05, -44.90],[20.10, -44.90],[20.16, -44.87],[20.14, -44.85],[20.24, -44.79],[20.35, -44.79],[20.38, -44.76],[20.52, -44.77],[20.57, -44.84],[20.86, -44.87],[20.89, -44.89],[20.98, -44.88],[21.01, -44.91],[21.27, -44.79],[21.49, -44.83],[21.76, -44.84],[21.89, -44.83],[22.16, -44.87],[22.20, -44.90],[22.26, -44.91],[22.35, -44.87],[22.51, -44.85],[22.57, -44.86],[22.75, -44.84],[22.86, -44.85],[22.98, -44.88],[22.98, -44.64],[22.90, -44.63],[22.86, -44.60],[22.42, -44.63],[22.40, -44.66],[22.00, -44.67],[21.91, -44.62],[21.72, -44.65],[21.69, -44.67],[21.55, -44.64],[21.55, -44.61],[21.46, -44.60],[21.32, -44.64],[21.19, -44.65],[21.13, -44.62],[21.08, -44.64],[21.00, -44.62],[21.00, -44.59],[20.96, -44.57],[20.77, -44.65],[20.74, -44.63],[20.64, -44.65],[20.42, -44.64],[20.38, -44.62],[20.01, -44.65],[19.92, -44.59],[19.73, -44.61],[19.60, -44.64],[19.56, -44.70],[19.47, -44.67],[19.40, -44.67],[19.37, -44.69],[19.32, -44.69],[19.30, -44.66],[19.11, -44.69],[19.08, -44.73],[18.98, -44.74],[18.94, -44.73],[18.25, -44.79],[18.24, -44.83],[18.09, -44.83],[18.05, -44.81],[17.82, -44.83],[17.86, -44.88],[17.85, -44.93],[17.67, -44.97],[17.49, -44.95],[17.32, -44.96],[17.28, -44.98],[17.24, -44.96],[17.17, -44.99],[17.15, -45.01],[16.89, -45.01],[16.74, -45.03],[16.45, -45.09],[16.42, -45.12],[16.30, -45.11],[16.25, -45.16],[16.19, -45.12],[16.09, -45.19],[15.97, -45.21],[15.86, -45.17],[15.78, -45.19],[15.70, -45.14],[15.61, -45.17],[15.61, -45.19],[15.58, -45.20],[15.43, -45.17],[15.43, -45.13],[15.38, -45.08],[15.25, -45.06],[15.18, -45.08],[14.80, -45.08],[14.75, -45.02],[14.51, -44.92],[14.39, -44.92],[14.32, -44.87],[14.33, -44.81],[14.15, -44.72],[14.01, -44.72],[13.95, -44.61],[13.81, -44.57],[13.77, -44.58],[13.74, -44.57],[13.72, -44.47],[13.66, -44.45],[13.39, -44.45],[13.33, -44.35],[13.26, -44.33],[13.21, -44.34],[13.17, -44.38],[13.07, -44.32],[12.97, -44.25],[12.93, -44.27],[12.93, -44.32],[12.84, -44.33],[12.78, -44.37],[12.73, -44.35],[12.51, -44.35],[12.49, -44.34],[12.29, -44.37],[12.29, -44.39],[12.24, -44.42],[12.16, -44.40],[11.97, -44.39],[11.89, -44.41],[11.89, -44.44],[11.82, -44.42],[11.79, -44.42],[11.78, -44.46],[11.69, -44.44],[11.64, -44.39],[11.50, -44.42],[11.31, -44.52],[11.23, -44.52],[11.11, -44.51],[11.05, -44.55],[11.00, -44.54],[10.72, -44.67],[10.69, -44.74],[10.59, -44.74],[10.58, -44.82],[10.32, -44.94],[10.22, -44.95],[10.19, -45.01],[10.11, -45.05],[10.05, -45.04],[9.97, -45.13],[10.00, -45.15],[9.91, -45.21],[9.89, -45.25],[9.74, -45.30],[9.64, -45.32],[9.61, -45.29],[9.53, -45.31],[9.20, -45.45],[9.01, -45.50],[8.65, -45.56],[8.65, -45.60],[8.62, -45.62],[8.59, -45.60],[8.50, -45.63],[8.46, -45.62],[8.28, -45.64],[8.18, -45.68],[8.16, -45.71],[8.05, -45.72],[8.05, -45.74],[8.00, -45.77],[7.97, -45.74],[7.84, -45.76],[7.78, -45.79],[7.59, -45.77],[7.40, -45.83],[7.28, -45.79],[7.15, -45.80],[7.09, -45.74],[6.97, -45.70],[6.88, -45.64],[6.86, -45.64],[6.71, -45.59],[6.56, -45.37],[6.52, -45.21],[6.49, -45.13],[6.41, -45.06],[6.31, -44.88],[6.32, -44.77],[6.35, -44.77],[6.24, -44.57],[6.19, -44.43],[6.21, -44.25],[6.28, -44.00],[6.25, -43.86],[6.34, -43.78],[6.33, -43.71],[6.37, -43.66],[6.37, -43.54],[6.44, -43.37],[6.40, -43.35],[6.43, -43.30],[6.40, -43.29],[6.44, -43.23],[6.49, -43.25],[6.52, -43.20],[6.47, -43.10],[6.49, -43.06],[6.55, -43.04],[6.55, -43.00],[6.53, -42.95],[6.58, -42.84],[6.51, -42.84],[6.47, -42.87],[6.42, -42.85],[6.38, -42.88],[6.37, -42.97],[6.32, -43.00],[6.32, -43.11],[6.27, -43.15],[6.25, -43.26],[6.23, -43.32],[6.30, -43.39],[6.26, -43.43],[6.27, -43.45],[6.25, -43.56],[6.25, -43.65],[6.23, -43.72],[6.21, -43.75],[6.22, -43.79],[6.16, -43.86],[6.18, -43.95],[6.11, -44.06],[6.11, -44.18],[6.08, -44.23],[6.01, -44.26],[6.04, -44.29],[6.04, -44.37],[6.07, -44.38],[6.04, -44.44],[6.08, -44.55],[6.10, -44.56],[6.08, -44.64],[6.15, -44.70],[6.19, -44.95],[6.27, -45.08],[6.26, -45.13],[6.30, -45.22],[6.37, -45.27],[6.40, -45.35],[6.46, -45.36],[6.49, -45.47],[6.52, -45.50],[6.63, -45.58],[6.66, -45.64],[6.74, -45.65],[6.77, -45.71],[6.84, -45.72],[6.88, -45.82],[6.86, -45.85],[6.72, -45.87],[6.72, -45.89],[6.44, -45.90],[6.38, -45.86],[6.26, -45.87],[6.24, -45.83],[6.00, -45.76],[5.88, -45.78],[5.77, -45.72],[5.72, -45.72],[5.64, -45.69],[5.60, -45.61],[5.44, -45.59],[5.40, -45.63],[5.21, -45.70],[5.21, -45.77],[5.14, -45.78],[5.08, -45.82],[4.94, -45.82],[4.86, -45.78],[4.37, -45.68],[4.29, -45.68],[4.21, -45.66],[4.14, -45.68],[3.95, -45.63],[3.91, -45.57],[3.82, -45.56],[3.70, -45.53],[3.62, -45.54],[3.60, -45.52],[3.16, -45.39],[2.96, -45.38],[2.83, -45.35],[2.71, -45.29],[2.65, -45.24],[2.50, -45.22],[2.47, -45.21],[2.42, -45.24],[2.39, -45.20],[2.21, -45.15],[2.16, -45.15],[2.08, -45.14],[2.02, -45.08],[1.96, -45.06],[1.89, -45.09],[1.81, -45.08],[1.53, -44.91],[1.44, -44.90],[1.41, -44.92],[1.36, -44.93],[1.19, -44.88],[1.12, -44.90],[1.03, -44.87],[0.99, -44.81],[0.83, -44.73],[0.70, -44.70],[0.64, -44.74],[0.57, -44.77],[0.50, -44.76],[0.48, -44.78],[0.37, -44.80],[0.20, -44.79],[0.15, -44.74],[0.11, -44.75],[0.02, -44.75],[-0.14, -44.72],[-0.19, -44.74],[-0.29, -44.74],[-0.29, -44.70],[-0.41, -44.72],[-0.45, -44.68],[-0.48, -44.62],[-0.68, -44.63]],
            /*Pirarucu Point*/[[8.32, -45.75],[8.47, -45.75],[8.50, -45.71],[8.62, -45.71],[8.72, -45.66],[8.78, -45.69],[8.93, -45.68],[8.95, -45.65],[9.08, -45.66],[9.24, -45.64],[9.28, -45.57],[9.39, -45.58],[9.61, -45.50],[9.75, -45.39],[9.77, -45.34],[9.88, -45.30],[9.95, -45.32],[10.03, -45.25],[10.19, -45.22],[10.29, -45.15],[10.42, -45.11],[10.41, -45.07],[10.54, -44.99],[10.78, -44.97],[10.93, -44.92],[10.98, -44.88],[11.09, -44.85],[11.12, -44.81],[11.28, -44.79],[11.30, -44.75],[11.52, -44.69],[11.63, -44.72],[11.70, -44.67],[11.89, -44.72],[12.02, -44.72],[12.06, -44.66],[12.23, -44.67],[12.43, -44.67],[12.51, -44.69],[12.57, -44.66],[12.69, -44.66],[12.85, -44.72],[12.90, -44.72],[13.02, -44.79],[13.09, -44.78],[13.21, -44.85],[13.45, -44.85],[13.50, -44.87],[13.49, -44.80],[13.51, -44.76],[13.56, -44.76],[13.64, -44.80],[13.64, -44.86],[13.67, -44.87],[13.77, -44.88],[13.81, -44.84],[13.95, -44.91],[13.93, -44.97],[14.15, -45.03],[14.24, -45.03],[14.70, -45.19],[14.74, -45.18],[15.09, -45.27],[15.30, -45.29],[15.37, -45.31],[15.65, -45.32],[15.77, -45.34],[15.95, -45.36],[16.07, -45.32],[16.18, -45.33],[16.20, -45.28],[16.38, -45.28],[16.42, -45.33],[16.64, -45.29],[16.67, -45.25],[16.89, -45.24],[16.96, -45.27],[17.04, -45.21],[17.24, -45.20],[17.25, -45.16],[17.32, -45.09],[17.38, -45.08],[17.45, -45.11],[17.48, -45.10],[17.70, -45.07],[17.89, -45.02],[18.07, -44.99],[18.07, -44.97],[18.16, -44.97],[18.18, -45.00],[18.43, -44.98],[18.42, -44.94],[18.51, -44.92],[18.55, -44.93],[18.74, -44.94],[18.80, -44.91],[18.92, -44.91],[19.01, -44.87],[19.14, -44.88],[19.16, -44.83],[19.23, -44.86],[19.31, -44.82],[19.46, -44.84],[19.51, -44.89],[19.69, -44.92],[19.89, -44.90],[19.91, -44.87],[20.05, -44.90],[20.10, -44.90],[20.16, -44.87],[20.14, -44.85],[20.24, -44.79],[20.35, -44.79],[20.38, -44.76],[20.52, -44.77],[20.57, -44.84],[20.86, -44.87],[20.89, -44.89],[20.98, -44.88],[21.01, -44.91],[21.27, -44.79],[21.49, -44.83],[21.55, -44.64],[21.55, -44.61],[21.46, -44.60],[21.32, -44.64],[21.19, -44.65],[21.13, -44.62],[21.08, -44.64],[21.00, -44.62],[21.00, -44.59],[20.96, -44.57],[20.77, -44.65],[20.74, -44.63],[20.64, -44.65],[20.42, -44.64],[20.38, -44.62],[20.01, -44.65],[19.92, -44.59],[19.73, -44.61],[19.60, -44.64],[19.56, -44.70],[19.47, -44.67],[19.40, -44.67],[19.37, -44.69],[19.32, -44.69],[19.30, -44.66],[19.11, -44.69],[19.08, -44.73],[18.98, -44.74],[18.94, -44.73],[18.25, -44.79],[18.24, -44.83],[18.09, -44.83],[18.05, -44.81],[17.82, -44.83],[17.86, -44.88],[17.85, -44.93],[17.67, -44.97],[17.49, -44.95],[17.32, -44.96],[17.28, -44.98],[17.24, -44.96],[17.17, -44.99],[17.15, -45.01],[16.89, -45.01],[16.74, -45.03],[16.45, -45.09],[16.42, -45.12],[16.30, -45.11],[16.25, -45.16],[16.19, -45.12],[16.09, -45.19],[15.97, -45.21],[15.86, -45.17],[15.78, -45.19],[15.70, -45.14],[15.61, -45.17],[15.61, -45.19],[15.58, -45.20],[15.43, -45.17],[15.43, -45.13],[15.38, -45.08],[15.25, -45.06],[15.18, -45.08],[14.80, -45.08],[14.75, -45.02],[14.51, -44.92],[14.39, -44.92],[14.32, -44.87],[14.33, -44.81],[14.15, -44.72],[14.01, -44.72],[13.95, -44.61],[13.81, -44.57],[13.77, -44.58],[13.74, -44.57],[13.72, -44.47],[13.66, -44.45],[13.39, -44.45],[13.33, -44.35],[13.26, -44.33],[13.21, -44.34],[13.17, -44.38],[13.07, -44.32],[12.97, -44.25],[12.93, -44.27],[12.93, -44.32],[12.84, -44.33],[12.78, -44.37],[12.73, -44.35],[12.51, -44.35],[12.49, -44.34],[12.29, -44.37],[12.29, -44.39],[12.24, -44.42],[12.16, -44.40],[11.97, -44.39],[11.89, -44.41],[11.89, -44.44],[11.82, -44.42],[11.79, -44.42],[11.78, -44.46],[11.69, -44.44],[11.64, -44.39],[11.50, -44.42],[11.31, -44.52],[11.23, -44.52],[11.11, -44.51],[11.05, -44.55],[11.00, -44.54],[10.72, -44.67],[10.69, -44.74],[10.59, -44.74],[10.58, -44.82],[10.32, -44.94],[10.22, -44.95],[10.19, -45.01],[10.11, -45.05],[10.05, -45.04],[9.97, -45.13],[10.00, -45.15],[9.91, -45.21],[9.89, -45.25],[9.74, -45.30],[9.64, -45.32],[9.61, -45.29],[9.53, -45.31],[9.20, -45.45],[9.01, -45.50],[8.65, -45.56],[8.65, -45.60],[8.62, -45.62],[8.59, -45.60],[8.50, -45.63],[8.46, -45.62],[8.28, -45.64]],

        ]]
            }                
        },
    

    //-----  Balenos  -----//
    {
        "type":"Feature",
        "id":"20",
        "properties":
            {
            "name_EN":"Balenos - Western Guard Camp",
            "name_KR":"발레노스 - 서부 경비캠프",
            "fishGroup": ["Pacu", "YellowHeadCatfish", "StripedShiner", "Arowana", "Lenok", "CherrySalmon", "FreshwaterEel", "Carp", "RosyBitterling", "SohoBitterling", "Bluegill", "Catfish", "CrucianCarp"],
            "locationColor": "#616CD0",

        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Western Guard Camp*/[[6.49, -42.83],[6.58, -42.83],[6.60, -42.82],[6.64, -42.48],[6.59, -42.47],[6.57, -42.40],[6.59, -42.34],[6.47, -42.01],[6.51, -41.98],[6.45, -41.94],[6.46, -41.74],[6.41, -41.69],[6.49, -41.38],[6.46, -41.32],[6.50, -41.19],[6.49, -41.09],[6.55, -41.01],[6.54, -40.99],[6.45, -40.99],[6.51, -40.90],[6.53, -40.80],[6.44, -40.63],[6.45, -40.46],[6.40, -40.36],[6.41, -40.32],[6.35, -40.20],[6.35, -40.09],[6.32, -40.07],[6.30, -40.02],[6.33, -39.98],[6.34, -39.88],[6.31, -39.79],[5.56, -39.16],[5.38, -39.08],[5.24, -38.95],[5.27, -38.92],[5.24, -38.86],[5.41, -38.70],[5.53, -38.53],[5.62, -38.48],[5.86, -38.41],[6.08, -38.27],[6.13, -38.09],[6.11, -38.03],[5.98, -37.85],[5.50, -37.71],[5.40, -37.73],[5.34, -37.62],[5.26, -37.59],[5.20, -37.53],[5.10, -37.24],[5.00, -37.17],[4.94, -37.08],[4.91, -36.96],[4.93, -36.88],[5.01, -36.74],[5.16, -36.62],[5.26, -36.46],[5.37, -36.41],[5.36, -36.39],[5.39, -36.36],[5.54, -36.32],[5.62, -36.22],[5.54, -36.16],[5.56, -36.08],[5.66, -36.00],[5.65, -35.94],[5.75, -35.75],[5.77, -35.61],[5.74, -35.59],[5.82, -35.52],[5.84, -35.44],[5.91, -35.35],[5.99, -35.29],[5.94, -35.24],[5.96, -35.21],[6.08, -35.18],[6.30, -35.08],[6.09, -34.92],[6.02, -34.94],[6.02, -34.98],[6.04, -34.99],[6.01, -35.02],[5.98, -35.01],[5.84, -35.05],[5.69, -35.16],[5.65, -35.24],[5.64, -35.35],[5.68, -35.38],[5.70, -35.47],[5.52, -35.49],[5.52, -35.63],[5.24, -36.01],[5.23, -36.09],[5.14, -36.20],[5.17, -36.26],[5.05, -36.42],[4.80, -36.65],[4.81, -36.72],[4.72, -36.84],[4.70, -36.96],[4.72, -37.18],[4.95, -37.42],[4.98, -37.46],[4.92, -37.46],[4.99, -37.66],[5.25, -37.82],[5.40, -37.83],[5.46, -38.07],[5.55, -38.07],[5.58, -38.10],[5.54, -38.29],[5.49, -38.35],[5.45, -38.35],[5.41, -38.46],[5.34, -38.46],[5.14, -38.60],[5.13, -38.68],[4.99, -38.79],[4.97, -38.87],[5.21, -39.15],[5.37, -39.31],[5.45, -39.47],[5.84, -39.68],[6.04, -39.85],[6.08, -39.94],[6.10, -39.93],[6.15, -39.97],[6.12, -40.09],[6.23, -40.37],[6.33, -40.39],[6.30, -40.79],[6.33, -40.83],[6.31, -40.92],[6.25, -40.95],[6.32, -41.16],[6.30, -41.19],[6.22, -41.26],[6.23, -41.28],[6.28, -41.30],[6.30, -41.42],[6.26, -41.56],[6.30, -42.09],[6.37, -42.17],[6.32, -42.24],[6.42, -42.37],[6.42, -42.42],[6.53, -42.53],[6.48, -42.61],[6.41, -42.78],[6.43, -42.81]],
            ]]
            }                
        },


    //-----  Mediah  -----//
    {
        "type":"Feature",
        "id":"21",
        "properties":
            {
            "name_EN":"Mediah",
            "name_KR":"메디아",
            "fishGroup": ["Piranha", "LeatherCarp", "YellowHeadCatfish", "StripedShiner", "Arowana", "Lenok", "CherrySalmon", "FreshwaterEel", "Carp", "KuhliaMarginata", "Bleeker", "GobyMinnow", "Perch", "Crawfish"],
            "locationColor": "#0082DE",

        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Mediah*/[[45.41, -51.90],[46.72, -51.90],[46.96, -51.98],[47.01, -52.03],[47.08, -52.03],[47.09, -52.18],[45.91, -52.58],[45.77, -52.54],[45.54, -52.58],[45.38, -52.58],[45.30, -52.52],[45.26, -52.57],[44.38, -52.75],[44.35, -52.72],[44.23, -52.77],[44.25, -52.79],[44.10, -52.84],[43.88, -52.85],[43.83, -52.83],[43.63, -52.83],[43.54, -52.89],[43.49, -52.88],[43.44, -52.89],[43.33, -52.85],[43.27, -52.86],[43.17, -52.92],[43.02, -52.98],[42.96, -52.95],[42.78, -53.00],[42.75, -52.98],[42.65, -53.01],[42.58, -52.98],[42.59, -52.94],[42.54, -52.92],[42.36, -52.92],[42.27, -52.89],[42.21, -52.91],[42.21, -52.95],[42.17, -52.95],[42.11, -52.92],[42.00, -52.99],[41.84, -52.96],[41.73, -52.96],[41.72, -52.98],[41.51, -52.98],[41.46, -52.94],[41.42, -52.98],[41.37, -52.99],[41.33, -52.93],[41.27, -52.94],[41.23, -52.99],[41.28, -53.03],[41.21, -53.04],[40.90, -53.00],[40.86, -53.00],[40.83, -52.99],[40.78, -53.02],[40.75, -53.01],[40.71, -53.06],[40.72, -53.08],[40.61, -53.11],[40.58, -53.08],[40.53, -53.09],[40.51, -53.15],[40.47, -53.15],[40.40, -53.12],[40.31, -53.15],[40.28, -53.18],[39.38, -53.19],[39.23, -53.24],[39.16, -53.22],[39.19, -53.18],[39.19, -53.13],[39.15, -53.09],[39.08, -53.08],[39.04, -53.11],[39.00, -53.06],[38.81, -53.01],[38.68, -53.00],[38.61, -53.06],[38.56, -53.05],[38.55, -52.99],[38.28, -52.80],[38.05, -52.74],[38.02, -52.68],[37.97, -52.66],[37.95, -52.68],[37.91, -52.67],[37.92, -52.63],[37.91, -52.61],[37.83, -52.59],[37.85, -52.57],[37.82, -52.54],[37.73, -52.57],[37.69, -52.53],[37.57, -52.49],[37.54, -52.46],[37.42, -52.44],[37.35, -52.45],[37.26, -52.39],[37.25, -52.36],[37.19, -52.32],[37.01, -52.31],[36.89, -52.24],[36.78, -52.22],[36.75, -52.23],[36.64, -52.23],[36.55, -52.28],[36.46, -52.26],[36.43, -52.23],[36.39, -52.26],[36.35, -52.27],[36.27, -52.25],[35.64, -52.24],[35.55, -52.19],[35.41, -52.20],[35.42, -52.25],[35.27, -52.26],[34.94, -52.16],[34.84, -52.09],[34.78, -52.08],[34.71, -52.09],[34.64, -52.07],[34.57, -52.07],[34.46, -52.09],[34.24, -52.08],[34.24, -52.08],[34.04, -52.13],[34.04, -52.16],[33.98, -52.18],[33.99, -52.22],[33.95, -52.23],[33.89, -52.22],[33.88, -52.18],[33.80, -52.17],[33.12, -51.90],[33.15, -51.85],[33.14, -51.80],[33.16, -51.75],[33.11, -51.72],[33.15, -51.69],[33.15, -51.65],[33.05, -51.64],[33.00, -51.69],[32.84, -51.46],[32.85, -51.38],[32.90, -51.36],[32.89, -51.32],[32.73, -51.23],[32.69, -51.13],[32.67, -51.02],[32.62, -50.93],[32.66, -50.90],[32.58, -50.86],[32.57, -50.65],[32.50, -50.64],[32.49, -50.61],[32.52, -50.60],[32.50, -50.57],[32.47, -50.58],[32.46, -50.56],[32.46, -50.49],[32.34, -50.50],[32.28, -50.47],[32.18, -50.49],[32.07, -50.45],[32.03, -50.34],[31.97, -50.33],[31.97, -50.29],[31.82, -50.21],[31.82, -50.15],[31.75, -50.12],[31.62, -50.13],[31.55, -50.15],[31.43, -50.14],[31.35, -50.04],[31.29, -50.01],[31.25, -50.00],[31.12, -50.06],[30.96, -50.05],[30.96, -50.00],[30.60, -49.83],[30.58, -49.89],[30.29, -49.72],[30.21, -49.73],[30.19, -49.62],[30.23, -49.57],[30.23, -49.51],[30.19, -49.48],[30.15, -49.49],[30.11, -49.42],[30.14, -49.37],[30.10, -49.06],[30.05, -48.99],[30.11, -48.92],[30.12, -48.83],[30.07, -48.79],[30.13, -48.74],[30.18, -48.76],[30.27, -48.72],[30.24, -48.56],[30.27, -48.52],[30.19, -48.47],[30.23, -48.39],[30.18, -48.32],[30.09, -48.27],[30.14, -48.28],[30.15, -48.23],[30.11, -48.23],[30.20, -48.09],[30.20, -48.03],[30.24, -47.99],[30.20, -47.96],[30.19, -47.91],[30.25, -47.78],[30.23, -47.73],[30.25, -47.70],[30.21, -47.64],[30.24, -47.61],[30.19, -47.58],[30.15, -47.58],[30.15, -47.51],[30.11, -47.43],[30.03, -47.42],[29.93, -47.39],[29.90, -47.35],[29.95, -47.29],[29.92, -47.26],[29.95, -47.21],[29.70, -47.09],[29.72, -47.07],[29.66, -47.03],[29.55, -47.03],[29.45, -46.97],[29.34, -46.98],[29.20, -46.88],[29.13, -46.83],[28.89, -46.78],[28.82, -46.74],[28.75, -46.76],[28.75, -46.74],[28.73, -46.71],[28.68, -46.71],[28.64, -46.74],[28.29, -46.55],[28.24, -46.45],[28.12, -46.42],[28.08, -46.37],[28.06, -46.37],[28.04, -46.40],[28.00, -46.31],[28.02, -46.29],[27.96, -46.22],[27.87, -46.15],[27.79, -46.15],[27.60, -46.05],[27.54, -46.04],[27.50, -46.02],[27.53, -45.98],[27.51, -45.92],[27.54, -45.90],[27.50, -45.86],[27.44, -45.86],[27.38, -45.83],[27.36, -45.78],[27.22, -45.73],[27.18, -45.63],[26.97, -45.53],[26.91, -45.48],[26.86, -45.47],[26.80, -45.49],[26.77, -45.46],[26.69, -45.45],[26.65, -45.49],[26.60, -45.45],[26.56, -45.47],[26.48, -45.44],[26.45, -45.35],[26.39, -45.34],[26.32, -45.29],[26.25, -45.29],[26.22, -45.23],[26.26, -45.18],[26.23, -45.13],[26.01, -45.02],[25.97, -44.97],[25.88, -44.97],[25.71, -44.87],[25.53, -44.88],[25.43, -44.87],[25.31, -44.81],[25.17, -44.81],[25.06, -44.77],[24.99, -44.77],[24.95, -44.79],[24.94, -44.76],[24.85, -44.81],[24.77, -44.81],[24.77, -44.75],[24.15, -44.61],[23.89, -44.67],[23.89, -44.58],[24.08, -44.51],[24.17, -44.50],[24.25, -44.54],[24.49, -44.53],[24.58, -44.57],[24.87, -44.52],[25.04, -44.58],[25.20, -44.58],[25.17, -44.55],[25.21, -44.53],[25.31, -44.57],[25.34, -44.53],[25.46, -44.63],[25.49, -44.59],[25.55, -44.59],[25.69, -44.65],[25.72, -44.71],[25.78, -44.68],[25.92, -44.70],[25.97, -44.79],[26.13, -44.78],[26.24, -44.81],[26.27, -44.86],[26.28, -44.86],[26.33, -44.89],[26.32, -44.95],[26.59, -45.01],[26.61, -45.08],[26.66, -45.13],[26.72, -45.16],[26.73, -45.20],[26.85, -45.23],[26.91, -45.27],[26.96, -45.26],[27.41, -45.47],[27.57, -45.67],[27.70, -45.78],[27.77, -45.81],[27.84, -45.88],[27.98, -45.89],[28.00, -45.96],[28.15, -46.06],[28.27, -46.05],[28.29, -46.11],[28.57, -46.22],[28.60, -46.26],[28.80, -46.38],[29.06, -46.40],[29.20, -46.48],[29.42, -46.51],[29.45, -46.57],[29.63, -46.61],[29.89, -46.66],[29.93, -46.64],[30.01, -46.67],[30.17, -46.65],[30.24, -46.67],[30.51, -46.82],[30.60, -46.85],[30.66, -46.93],[30.61, -46.99],[30.57, -46.97],[30.50, -47.03],[30.66, -47.11],[30.65, -47.14],[30.70, -47.16],[30.72, -47.24],[30.81, -47.28],[30.81, -47.33],[30.74, -47.39],[30.83, -47.53],[30.98, -47.54],[30.98, -47.57],[30.93, -47.59],[30.93, -47.64],[30.87, -47.70],[30.83, -47.84],[30.96, -47.91],[30.85, -48.00],[30.79, -47.99],[30.76, -48.03],[30.83, -48.07],[30.82, -48.10],[30.75, -48.11],[30.70, -48.13],[30.71, -48.21],[30.90, -48.29],[30.87, -48.39],[30.79, -48.41],[30.80, -48.51],[30.78, -48.54],[30.81, -48.68],[30.96, -48.69],[31.07, -48.75],[31.07, -48.77],[30.77, -48.89],[30.82, -49.26],[30.99, -49.38],[31.10, -49.40],[31.10, -49.46],[31.17, -49.52],[31.35, -49.55],[31.37, -49.58],[31.51, -49.63],[31.62, -49.58],[31.77, -49.64],[31.97, -49.50],[32.06, -49.50],[32.13, -49.48],[32.17, -49.51],[32.24, -49.51],[32.34, -49.46],[32.34, -49.44],[32.37, -49.42],[32.45, -49.43],[32.50, -49.46],[32.54, -49.43],[32.95, -49.43],[32.97, -49.47],[33.02, -49.47],[33.04, -49.44],[33.11, -49.49],[33.15, -49.48],[33.48, -49.58],[33.67, -49.59],[33.68, -49.64],[33.80, -49.70],[33.83, -49.77],[33.94, -49.85],[33.93, -49.92],[34.04, -49.96],[34.03, -50.03],[34.17, -50.09],[34.30, -50.36],[34.32, -50.35],[34.36, -50.42],[34.31, -50.41],[34.31, -50.44],[34.23, -50.51],[34.18, -50.65],[34.12, -50.67],[34.07, -50.78],[34.09, -50.84],[34.20, -50.86],[34.24, -50.83],[34.31, -50.86],[34.28, -50.90],[34.32, -50.92],[34.42, -50.91],[34.42, -50.94],[34.45, -50.94],[34.49, -50.92],[34.56, -50.91],[34.57, -50.93],[34.66, -50.89],[34.82, -50.95],[34.88, -50.95],[34.92, -50.98],[35.12, -50.98],[35.20, -51.06],[35.25, -51.07],[35.28, -51.04],[35.32, -51.05],[35.36, -51.14],[35.30, -51.16],[35.30, -51.22],[35.46, -51.23],[35.49, -51.20],[35.52, -51.19],[35.56, -51.26],[35.50, -51.29],[35.57, -51.32],[35.55, -51.36],[35.51, -51.36],[35.47, -51.40],[35.56, -51.54],[35.41, -51.62],[35.54, -51.75],[35.62, -51.76],[35.64, -51.79],[35.66, -51.78],[35.71, -51.86],[35.68, -51.88],[35.72, -51.91],[35.79, -51.89],[35.85, -51.92],[35.89, -51.92],[35.95, -51.90],[35.97, -51.95],[35.95, -51.96],[36.04, -51.98],[36.08, -51.95],[36.14, -51.96],[36.14, -51.99],[36.23, -52.00],[36.26, -51.98],[36.39, -51.91],[36.55, -51.85],[36.59, -51.87],[36.74, -51.81],[36.88, -51.77],[36.91, -51.75],[36.88, -51.71],[36.87, -51.65],[37.00, -51.61],[37.21, -51.56],[37.19, -51.60],[37.26, -51.66],[37.35, -51.64],[38.07, -51.78],[38.14, -51.75],[38.21, -51.75],[38.62, -51.87],[38.63, -51.91],[38.69, -51.94],[38.77, -51.89],[38.89, -51.89],[38.98, -51.97],[39.12, -51.97],[39.23, -52.10],[39.30, -52.23],[39.24, -52.24],[39.24, -52.28],[39.29, -52.31],[39.33, -52.30],[39.44, -52.41],[39.40, -52.44],[39.43, -52.48],[39.48, -52.48],[39.48, -52.57],[39.53, -52.63],[39.64, -52.65],[39.66, -52.70],[39.84, -52.73],[39.85, -52.74],[39.81, -52.77],[39.92, -52.83],[39.96, -52.80],[39.99, -52.84],[40.05, -52.86],[40.11, -52.87],[40.16, -52.86],[40.34, -52.86],[40.35, -52.89],[40.42, -52.90],[40.47, -52.87],[40.51, -52.88],[40.73, -52.81],[40.81, -52.80],[40.92, -52.75],[41.04, -52.76],[41.22, -52.69],[41.31, -52.70],[41.40, -52.65],[41.68, -52.63],[41.72, -52.60],[41.88, -52.60],[41.97, -52.61],[41.97, -52.64],[42.07, -52.67],[42.46, -52.63],[42.46, -52.65],[42.57, -52.62],[42.57, -52.60],[42.77, -52.60],[42.87, -52.67],[42.93, -52.65],[43.10, -52.67],[43.15, -52.64],[43.23, -52.66],[43.22, -52.69],[43.25, -52.69],[43.28, -52.68],[43.46, -52.69],[43.55, -52.64],[43.59, -52.60],[43.63, -52.60],[43.70, -52.64],[43.77, -52.62],[43.82, -52.64],[44.00, -52.62],[44.15, -52.53],[44.23, -52.54],[44.23, -52.56],[44.35, -52.56],[44.39, -52.50],[44.53, -52.49],[44.64, -52.51],[44.72, -52.41],[44.81, -52.42],[44.89, -52.38],[45.00, -52.37],[45.05, -52.32],[45.08, -52.32],[45.10, -52.33],[45.17, -52.31],[45.18, -52.29],[45.22, -52.30],[45.25, -52.29],[45.24, -52.25],[45.40, -52.03],[45.36, -51.96]],
            ]]
            }                
        },


    //-----  Valencia  -----//
    {
        "type":"Feature",
        "id":"22",
        "properties":
            {
            "name_EN":"Valencia",
            "name_KR":"발렌시아",
            "fishGroup": ["Pacu", "YellowHeadCatfish", "StripedShiner", "Arowana", "Lenok", "CherrySalmon", "FreshwaterEel", "Carp", "KuhliaMarginata", "Bleeker", "GobyMinnow", "Perch", "Crawfish"],
            "locationColor": "#023EB1",

        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Kunid's Vacation Spot*/[[45.61, -34.67],[45.66, -34.73],[45.62, -34.75],[45.56, -35.13],[45.60, -35.40],[45.50, -35.59],[45.47, -35.70],[45.54, -35.82],[45.63, -35.82],[45.69, -35.86],[45.64, -35.90],[45.52, -35.94],[45.14, -35.92],[45.01, -35.87],[44.92, -35.96],[44.78, -36.00],[44.67, -35.85],[44.87, -35.71],[45.31, -35.75],[45.32, -35.64],[45.51, -35.40],[45.50, -35.15],[45.56, -34.75],[45.54, -34.68]],
            /*Kunid's Vacation Spot(north)*/[[45.75, -32.97],[45.77, -32.89],[45.73, -32.88],[45.67, -32.93]],
            /*Leical Falls*/[[43.89, -33.52],[43.93, -33.49],[43.99, -33.52],[44.00, -33.62],[43.96, -33.68],[43.94, -33.75],[43.86, -33.75],[43.81, -33.77],[43.75, -33.86],[43.69, -33.84],[43.68, -33.92],[43.70, -33.98],[43.71, -34.11],[43.65, -34.17],[43.68, -34.24],[43.68, -34.30],[43.60, -34.36],[43.57, -34.50],[43.46, -34.69],[43.46, -34.74],[43.27, -34.81],[43.10, -34.81],[43.09, -34.67],[43.31, -34.52],[43.38, -34.54],[43.44, -34.45],[43.50, -34.43],[43.54, -34.38],[43.55, -34.31],[43.53, -34.30],[43.53, -34.20],[43.57, -34.17],[43.55, -34.13],[43.49, -34.09],[43.51, -34.05],[43.48, -34.01],[43.55, -33.88],[43.62, -33.85],[43.62, -33.70],[43.67, -33.56],[43.75, -33.53],[43.82, -33.47]],
            /*Kisleev Crag*/[[40.55, -34.41],[40.66, -34.41],[40.73, -34.28],[40.51, -34.28]],
            /*Bashim Base*/[[51.14, -46.92],[51.15, -46.86],[51.24, -46.75],[51.34, -46.74],[51.32, -46.87],[51.23, -46.93]],
            /*Bashim Base(north)*/[[50.88, -44.40],[50.97, -44.43],[51.16, -44.37],[51.34, -43.99],[51.32, -43.91],[51.19, -43.91],[51.14, -43.97],[51.14, -44.05],[51.09, -44.09],[51.11, -44.20],[50.99, -44.24],[50.97, -44.19],[50.91, -44.20],[50.93, -44.28]],
            /*Sand Grain Bazaar*/[[61.76, -40.25],[61.75, -40.35],[61.78, -40.38],[61.85, -40.30],[61.91, -40.31],[61.98, -40.27],[62.04, -40.15],[62.05, -39.95],[62.02, -39.94],[61.94, -40.14],[61.82, -40.25]],
            /*Shakatu Abandoned Pier(west)*/[[52.32, -24.89],[52.34, -24.78],[52.41, -24.77],[52.47, -24.83],[52.47, -25.05],[52.37, -25.07]],
            /*Shakatu*/[[59.40, -23.12],[59.37, -22.98],[59.57, -22.71],[59.61, -22.74],[59.64, -22.72],[59.64, -22.66],[59.67, -22.62],[59.77, -22.56],[60.02, -22.79],[60.06, -22.92],[59.95, -23.03],[59.64, -23.11]],
            /*Yalt Canyon*/[[61.28, -21.09],[61.36, -21.01],[61.43, -21.01],[61.49, -21.13],[61.54, -21.13],[61.55, -21.22],[61.47, -21.29],[61.34, -21.23]],
            /*Gahaz Bandit's Lair*/[[64.37, -18.69],[64.43, -18.79],[64.50, -18.74],[64.69, -18.73],[64.66, -18.61],[64.58, -18.60],[64.47, -18.63]],
            /*Valencia Castle(south)*/[[109.33, -26.06],[109.31, -26.12],[109.45, -26.26],[109.55, -26.20],[109.54, -26.09],[109.45, -26.12],[109.40, -26.07]],
            /*Valencia City(1)*/[[97.11, -29.42],[97.01, -29.49],[97.04, -29.67],[96.99, -29.69],[96.99, -29.74],[97.06, -29.80],[96.97, -29.93],[96.94, -29.91],[96.90, -29.95],[96.89, -29.93],[96.85, -29.97],[96.87, -30.00],[96.81, -30.06],[96.82, -30.18],[96.84, -30.24],[96.80, -30.30],[96.84, -30.33],[96.83, -30.36],[96.80, -30.39],[96.85, -30.44],[97.00, -30.49],[97.04, -30.47],[97.11, -30.48],[97.14, -30.51],[97.11, -30.53],[97.16, -30.62],[97.16, -30.73],[97.19, -30.82],[97.31, -30.89],[97.38, -30.89],[97.38, -30.87],[97.52, -30.80],[97.58, -30.73],[97.69, -30.72],[97.85, -30.90],[97.86, -31.10],[97.80, -31.14],[97.80, -31.21],[97.85, -31.27],[97.82, -31.40],[97.85, -31.51],[97.65, -31.59],[97.63, -31.74],[97.68, -31.87],[97.83, -31.89],[97.90, -31.95],[97.89, -32.01],[98.01, -32.03],[98.11, -31.97],[98.06, -31.87],[98.09, -31.86],[98.17, -31.88],[98.26, -31.84],[98.25, -31.80],[98.32, -31.80],[98.42, -31.76],[98.39, -31.69],[98.31, -31.63],[98.39, -31.61],[98.53, -31.61],[98.54, -31.55],[98.61, -31.57],[98.65, -31.56],[98.67, -31.49],[98.77, -31.46],[98.83, -31.56],[98.82, -31.63],[98.87, -31.65],[98.88, -31.72],[98.97, -31.74],[99.21, -31.65],[99.16, -31.59],[99.22, -31.58],[99.29, -31.61],[99.48, -31.60],[99.44, -31.54],[99.62, -31.43],[99.71, -31.41],[99.72, -31.34],[99.68, -31.30],[99.74, -31.22],[99.74, -31.06],[99.71, -31.05],[99.68, -31.02],[99.68, -30.98],[99.70, -30.94],[99.63, -30.91],[99.67, -30.86],[99.67, -30.81],[99.63, -30.76],[99.65, -30.71],[99.58, -30.58],[99.61, -30.54],[99.60, -30.45],[99.54, -30.37],[99.43, -30.35],[99.39, -30.36],[99.39, -30.31],[99.23, -30.27],[99.23, -30.23],[99.19, -30.20],[99.08, -30.26],[99.07, -30.31],[98.98, -30.32],[98.94, -30.26],[98.86, -30.21],[98.78, -30.24],[98.64, -30.23],[98.59, -30.31],[98.50, -30.37],[98.38, -30.37],[98.29, -30.32],[98.23, -30.28],[98.20, -30.21],[98.14, -30.20],[98.14, -30.14],[98.04, -30.14],[98.01, -30.10],[97.92, -30.08],[97.91, -30.11],[97.84, -30.09],[97.84, -30.06],[97.78, -30.04],[97.70, -29.98],[97.72, -29.97],[97.66, -29.94],[97.65, -29.90],[97.61, -29.88],[97.59, -29.83],[97.39, -29.73],[97.40, -29.70],[97.35, -29.67],[97.36, -29.58],[97.40, -29.54],[97.37, -29.51],[97.37, -29.45],[97.32, -29.41]],
            /*Valencia City(2)*/[[94.92, -28.21],[94.89, -28.29],[94.92, -28.37],[94.96, -28.38],[95.02, -28.38],[95.02, -28.49],[95.08, -28.53],[95.11, -28.50],[95.20, -28.50],[95.29, -28.56],[95.35, -28.73],[95.41, -28.70],[95.49, -28.74],[95.53, -28.72],[95.56, -28.68],[95.62, -28.68],[95.67, -28.64],[95.65, -28.62],[95.85, -28.56],[95.99, -28.47],[95.93, -28.40],[95.81, -28.31],[95.61, -28.22],[95.56, -28.18],[95.49, -28.18],[95.47, -28.21],[95.40, -28.22],[95.31, -28.13],[95.26, -28.19],[95.20, -28.19],[95.14, -28.13],[95.13, -28.18],[95.08, -28.19],[95.03, -28.14]],
            /*Valencia City(east1)*/[[100.24, -28.57],[100.25, -28.69],[100.22, -28.73],[100.15, -28.73],[100.15, -28.70],[100.16, -28.68],[100.16, -28.63],[100.13, -28.61],[100.13, -28.56]],
            /*Valencia City(east2)*/[[100.03, -28.06],[99.92, -28.11],[99.86, -28.07],[99.77, -28.08],[99.69, -27.98],[99.72, -27.96],[99.65, -27.89],[99.61, -27.89],[99.60, -27.84],[99.64, -27.80],[99.69, -27.82],[99.73, -27.86],[99.78, -27.84],[99.84, -27.87],[99.90, -27.85],[99.99, -27.94]],
            /*Valencia Plantation*/[[93.36, -29.09],[93.12, -29.27],[93.18, -29.33],[93.09, -29.41],[93.11, -29.47],[93.27, -29.47],[93.43, -29.35],[93.49, -29.40],[93.50, -29.49],[93.54, -29.52],[93.77, -29.49],[93.84, -29.42],[93.96, -29.40],[93.93, -29.26],[93.86, -29.24],[93.77, -29.18],[93.70, -29.05],[93.61, -29.07],[93.61, -29.12],[93.58, -29.10]],
            /*Arehaza Town(1)*/[[112.78, -28.48],[112.83, -28.52],[113.36, -28.04],[113.34, -27.99],[113.44, -27.98],[113.46, -27.95],[113.56, -27.95],[113.73, -28.12],[113.84, -28.14],[113.92, -28.04],[113.87, -27.90],[113.69, -27.77],[113.67, -27.69],[113.60, -27.63],[113.49, -27.67],[113.43, -27.70],[113.36, -27.81],[113.39, -27.84],[113.38, -27.92],[113.33, -27.91],[113.31, -27.92],[113.30, -27.99]],
            /*Arehaza Town(2)*/[[112.82, -29.14],[113.06, -29.43],[113.21, -29.41],[113.36, -29.50],[113.48, -29.64],[113.54, -29.88],[113.59, -29.98],[113.58, -30.04],[113.80, -30.17],[113.91, -30.21],[114.15, -30.20],[114.20, -30.12],[114.28, -30.09],[114.42, -30.12],[114.48, -30.07],[114.70, -30.05],[114.74, -30.11],[114.89, -30.17],[115.09, -30.15],[115.28, -30.03],[115.32, -29.96],[115.33, -29.84],[115.43, -29.75],[115.51, -29.52],[115.60, -29.46],[115.66, -29.56],[115.61, -29.70],[115.51, -29.74],[115.50, -29.82],[115.39, -29.87],[115.38, -29.98],[115.35, -30.07],[115.24, -30.11],[115.17, -30.20],[114.99, -30.21],[114.88, -30.26],[114.77, -30.24],[114.72, -30.26],[114.45, -30.25],[114.43, -30.22],[114.40, -30.22],[114.26, -30.29],[114.20, -30.29],[113.90, -30.32],[113.62, -30.17],[113.51, -30.01],[113.41, -29.86],[113.40, -29.70],[113.36, -29.60],[113.21, -29.44],[113.13, -29.49],[112.98, -29.43],[112.93, -29.40],[112.82, -29.26]],
            /*Arehaza Town(south)*/[[114.39, -35.03],[114.53, -35.00],[114.64, -35.06],[114.64, -35.14],[114.73, -35.18],[114.78, -35.22],[114.86, -35.18],[114.91, -35.23],[114.82, -35.28],[114.66, -35.45],[114.48, -35.45],[114.38, -35.38]],
            /*Shakatu's Villa(1)*/[[55.66, -23.00],[55.68, -22.92],[55.76, -22.94],[55.74, -23.02]],
            /*Shakatu's Villa(2)*/[[55.99, -23.00],[56.00, -22.94],[55.94, -22.93],[55.93, -22.99]],
            /*Alsabi's Villa*/[[57.30, -22.93],[57.32, -22.87],[57.40, -22.89],[57.38, -22.95]],
            /*Hope Pier*/[[55.41, -21.86],[55.43, -22.02],[55.46, -21.97],[55.52, -21.97],[55.52, -22.08],[55.60, -22.03],[55.61, -21.97],[55.67, -21.96],[55.66, -21.90],[55.55, -21.90],[55.52, -21.85]],
            /*Hope Pier(east villa)*/[[57.94, -21.09],[57.99, -21.12],[57.94, -21.18],[57.89, -21.14]],
            ]]
            }                
        },
    

    //-----  O'dyllita  -----//
    {
        "type":"Feature",
        "id":"23",
        "properties":
            {
            "name_EN":"O\'dyllita",
            "name_KR":"오딜리타",
            "fishGroup": ["Charr", "FlowerIcefish", "DarkChub"],
            "locationColor": "#534BE0",

        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Talibahr's Rope*/[[-18.29, -66.43],[-18.36, -66.47],[-18.24, -66.49],[-18.21, -66.47]],
            /*Olun's Valley(east)*/[[1.01, -66.39],[0.91, -66.40],[1.00, -66.49],[1.12, -66.47],[1.38, -66.48],[1.45, -66.56],[1.51, -66.58],[1.59, -66.58],[1.67, -66.54],[1.93, -66.63],[2.15, -66.70],[2.37, -66.69],[2.54, -66.77],[2.75, -66.81],[2.95, -66.96],[2.96, -67.00],[3.07, -67.02],[3.09, -67.07],[3.14, -67.08],[3.24, -67.07],[3.17, -67.00],[3.20, -66.97],[3.17, -66.93],[3.04, -66.92],[2.82, -66.78],[2.83, -66.72],[2.45, -66.69],[2.38, -66.60],[2.25, -66.59],[2.04, -66.61],[1.89, -66.52],[1.60, -66.49],[1.53, -66.46],[1.38, -66.45],[1.34, -66.43],[1.13, -66.42]],
            /*Olun's Valley(west1)*/[[-2.19, -65.88],[-2.07, -65.89],[-2.11, -65.94],[-2.15, -66.02],[-2.29, -66.07],[-2.34, -66.01],[-2.23, -65.97]],
            /*Olun's Valley(west2)*/[[-2.45, -66.22],[-2.46, -66.26],[-2.13, -66.27],[-2.02, -66.30],[-2.02, -66.34],[-1.91, -66.34],[-1.85, -66.30],[-1.94, -66.26],[-1.93, -66.23],[-1.98, -66.22],[-2.10, -66.24]],
            /*Olun's Valley(west3)*/[[-2.02, -65.18],[-1.99, -65.16],[-1.77, -65.20],[-1.78, -65.26],[-1.85, -65.29],[-1.89, -65.39],[-1.93, -65.46],[-1.91, -65.54],[-1.94, -65.60],[-1.84, -65.73],[-1.92, -65.75],[-2.05, -65.59],[-2.05, -65.43],[-1.95, -65.37],[-1.94, -65.28],[-1.97, -65.24],[-1.88, -65.21]],
            /*Olun's Valley(west4)*/[[-2.06, -66.78],[-2.05, -66.87],[-1.89, -66.86],[-1.99, -66.73],[-1.98, -66.69],[-2.08, -66.69]],
            /*Mountain of Division(west)*/[[-7.76, -63.08],[-7.52, -63.04],[-7.32, -63.14],[-7.47, -63.19],[-7.54, -63.17],[-7.65, -63.18],[-7.68, -63.20],[-7.52, -63.25],[-7.51, -63.33],[-7.61, -63.47],[-7.55, -63.51],[-7.59, -63.54],[-7.50, -63.62],[-7.50, -63.65],[-7.59, -63.67],[-7.63, -63.64],[-7.75, -63.45],[-7.66, -63.42],[-7.90, -63.20],[-7.78, -63.15],[-7.84, -63.13]],
            /*Salun's Border(north)*/[[-12.83, -63.90],[-12.89, -63.90],[-12.90, -63.92],[-12.96, -63.93],[-13.03, -64.00],[-12.87, -64.05],[-12.80, -64.03],[-12.66, -64.08],[-12.52, -64.04],[-12.57, -63.99],[-12.71, -63.98],[-12.74, -63.94]],
            /*Thorny Forest(west)*/[[-14.92, -64.55],[-14.86, -64.53],[-14.79, -64.55],[-14.79, -64.58],[-14.66, -64.64],[-14.45, -64.67],[-14.41, -64.70],[-14.36, -64.76],[-14.16, -64.84],[-14.18, -64.97],[-14.06, -65.02],[-13.59, -65.12],[-13.49, -65.10],[-13.32, -65.14],[-13.22, -65.14],[-13.04, -65.18],[-13.00, -65.22],[-12.94, -65.24],[-12.86, -65.23],[-12.62, -65.23],[-12.47, -65.28],[-12.25, -65.37],[-12.20, -65.37],[-11.95, -65.44],[-11.84, -65.50],[-11.94, -65.51],[-11.98, -65.57],[-11.93, -65.60],[-11.96, -65.64],[-12.17, -65.60],[-12.11, -65.54],[-12.08, -65.55],[-12.02, -65.49],[-12.31, -65.38],[-12.48, -65.33],[-12.55, -65.34],[-12.68, -65.26],[-12.96, -65.27],[-13.11, -65.23],[-13.23, -65.17],[-13.36, -65.19],[-13.56, -65.15],[-13.63, -65.16],[-13.98, -65.08],[-14.15, -65.05],[-14.25, -64.98],[-14.21, -64.85],[-14.42, -64.77],[-14.67, -64.75],[-14.74, -64.71],[-14.72, -64.66],[-14.87, -64.58],[-14.92, -64.58]],
            /*Thorny Forest(east pond1)*/[[-11.07, -65.58],[-10.98, -65.56],[-11.02, -65.53],[-11.14, -65.51],[-11.19, -65.52]],
            /*Thorny Forest(east pond2)*/[[-10.48, -66.43],[-10.36, -66.43],[-10.34, -66.45],[-10.38, -66.46],[-10.46, -66.46]],
            /*Thorny Forest(east river1)*/[[-8.72, -64.87],[-8.48, -64.91],[-8.43, -64.88],[-8.58, -64.83],[-8.80, -64.83],[-8.93, -64.85],[-8.93, -64.88],[-9.18, -64.89],[-9.29, -64.94],[-9.45, -64.94],[-9.60, -64.99],[-9.67, -65.02],[-9.69, -65.11],[-9.59, -65.17],[-9.60, -65.21],[-9.70, -65.25],[-9.66, -65.32],[-9.87, -65.39],[-9.94, -65.51],[-9.80, -65.61],[-9.71, -65.58],[-9.80, -65.52],[-9.77, -65.49],[-9.81, -65.48],[-9.78, -65.43],[-9.70, -65.43],[-9.68, -65.47],[-9.61, -65.45],[-9.53, -65.45],[-9.47, -65.43],[-9.48, -65.40],[-9.64, -65.39],[-9.54, -65.32],[-9.58, -65.26],[-9.49, -65.22],[-9.48, -65.18],[-9.62, -65.09],[-9.61, -65.04],[-9.49, -65.00],[-9.34, -65.00],[-9.20, -64.97],[-9.13, -64.92],[-8.91, -64.91]],
            /*Thorny Forest(east river2)*/[[-9.72, -65.64],[-9.63, -65.60],[-9.55, -65.65],[-9.54, -65.69],[-9.68, -65.69]],
            /*Thorny Forest(east river3)*/[[-9.67, -65.77],[-9.52, -65.74],[-9.36, -65.80],[-9.57, -65.87],[-9.81, -66.02],[-9.85, -66.06],[-9.87, -66.13],[-9.94, -66.13],[-9.94, -66.01],[-9.87, -65.97],[-9.71, -65.91],[-9.63, -65.85]],
            /*Thorny Forest(east river4)*/[[-9.54, -66.76],[-9.48, -66.73],[-9.42, -66.76],[-9.38, -66.87],[-9.23, -66.95],[-9.10, -66.99],[-8.77, -66.99],[-8.68, -66.98],[-8.57, -67.02],[-8.73, -67.04],[-9.10, -67.04],[-9.40, -66.95],[-9.49, -66.89],[-9.50, -66.79]],
            /*Thorny Forest(south)*/[[-12.31, -66.00],[-12.25, -65.92],[-12.21, -65.92],[-12.21, -66.03],[-12.49, -66.20],[-12.60, -66.22],[-12.63, -66.18],[-12.55, -66.16],[-12.49, -66.07],[-12.35, -66.04]],
            /*Delmira Plantation(east)*/[[-2.00, -67.90],[-1.94, -67.89],[-1.94, -67.85],[-1.91, -67.82],[-1.92, -67.77],[-2.01, -67.72],[-2.07, -67.71],[-2.07, -67.74],[-2.01, -67.77],[-2.00, -67.82],[-2.04, -67.85],[-2.02, -67.87]],
            /*Delmira Plantation*/[[-2.77, -67.73],[-2.74, -67.71],[-2.62, -67.73],[-2.56, -67.75],[-2.56, -67.79],[-2.69, -67.76],[-2.93, -67.81],[-3.00, -67.80],[-3.05, -67.82],[-3.16, -67.81],[-3.28, -67.83],[-3.44, -67.83],[-3.48, -67.80],[-3.33, -67.75],[-3.19, -67.77],[-3.08, -67.76],[-3.03, -67.78],[-2.90, -67.78]],
            /*Narcion*/[[-9.65, -68.35],[-9.64, -68.37],[-9.56, -68.37],[-9.55, -68.34],[-9.62, -68.33]],
            /*Narcion(south)*/[[-7.59, -68.84],[-7.54, -68.87],[-7.58, -68.90],[-7.56, -68.94],[-7.51, -68.95],[-7.34, -68.93],[-7.36, -68.90],[-7.41, -68.90],[-7.49, -68.89],[-7.51, -68.88],[-7.51, -68.86],[-7.52, -68.84],[-7.49, -68.82],[-7.46, -68.81],[-7.48, -68.78],[-7.55, -68.77],[-7.63, -68.79],[-7.64, -68.80]],
            /*Narcion(west1)*/[[-10.66, -68.55],[-10.58, -68.53],[-10.50, -68.57],[-10.42, -68.57],[-10.22, -68.65],[-10.25, -68.70],[-10.35, -68.70],[-10.40, -68.72],[-10.55, -68.73],[-10.57, -68.71],[-10.68, -68.67],[-10.62, -68.63],[-10.61, -68.60],[-10.68, -68.57]],
            /*Narcion(west2)*/[[-10.52, -69.20],[-10.35, -69.17],[-10.42, -69.15],[-10.50, -69.12],[-10.45, -69.00],[-10.38, -68.92],[-10.38, -68.88],[-10.35, -68.86],[-10.33, -68.86],[-10.33, -68.82],[-10.31, -68.78],[-10.47, -68.76],[-10.54, -68.79],[-10.50, -68.82],[-10.55, -68.84],[-10.52, -68.85],[-10.53, -68.99],[-10.56, -69.00],[-10.57, -69.06],[-10.62, -69.09],[-10.61, -69.10],[-10.61, -69.14],[-10.63, -69.15]],
            /*Narcion(east)*/[[-7.93, -67.52],[-7.81, -67.51],[-7.76, -67.56],[-7.80, -67.63],[-7.76, -67.80],[-7.81, -67.82],[-7.78, -67.88],[-7.91, -67.99],[-7.91, -68.08],[-7.97, -68.13],[-8.00, -68.43],[-7.96, -68.58],[-7.77, -68.67],[-7.69, -68.72],[-7.77, -68.74],[-7.88, -68.71],[-7.97, -68.66],[-8.03, -68.59],[-8.09, -68.41],[-8.06, -68.11],[-7.98, -68.07],[-7.89, -67.73],[-7.87, -67.64]],
            /*Blade Narrows(1)*/[[-4.40, -69.97],[-4.64, -69.92],[-4.43, -69.86],[-4.45, -69.85],[-4.35, -69.82],[-4.35, -69.78],[-4.22, -69.77],[-4.14, -69.74],[-4.13, -69.72],[-4.17, -69.70],[-4.14, -69.69],[-4.01, -69.74],[-4.02, -69.75],[-4.03, -69.80],[-4.11, -69.82],[-4.16, -69.81],[-4.18, -69.82],[-4.16, -69.85],[-4.22, -69.85],[-4.29, -69.89],[-4.26, -69.93]],
            /*Blade Narrows(2)*/[[-3.84, -70.01],[-3.87, -70.04],[-3.81, -70.05],[-3.75, -70.07],[-3.65, -70.06],[-3.62, -70.05],[-3.73, -70.03],[-3.77, -70.03]],
            /*Blade Narrows(3)*/[[-4.19, -68.93],[-4.17, -68.97],[-4.32, -68.98],[-4.46, -69.00],[-4.53, -68.99],[-4.51, -68.98]],
            /*Odraxia(south)*/[[-2.81, -69.84],[-2.75, -69.86],[-2.62, -69.83],[-2.55, -69.83],[-2.37, -69.78],[-2.19, -69.77],[-2.01, -69.83],[-1.91, -69.78],[-1.86, -69.78],[-1.63, -69.84],[-1.30, -69.78],[-1.00, -69.67],[-0.95, -69.63],[-0.95, -69.59],[-0.87, -69.55],[-0.63, -69.48],[-0.59, -69.44],[-0.69, -69.41],[-0.66, -69.38],[-0.60, -69.33],[-0.58, -69.27],[-0.44, -69.21],[-0.36, -69.21],[-0.33, -69.19],[-0.41, -69.17],[-0.52, -69.18],[-0.72, -69.29],[-0.67, -69.31],[-0.77, -69.41],[-0.79, -69.46],[-0.91, -69.52],[-1.01, -69.55],[-1.08, -69.54],[-1.14, -69.56],[-1.10, -69.57],[-1.13, -69.59],[-1.35, -69.60],[-1.53, -69.67],[-1.48, -69.70],[-1.66, -69.75],[-1.79, -69.70],[-2.09, -69.70],[-2.21, -69.74],[-2.33, -69.72],[-2.39, -69.76],[-2.48, -69.77],[-2.60, -69.75],[-2.77, -69.79]],
            /*Odraxia(west)*/[[-0.16, -67.78],[-0.09, -67.78],[-0.11, -67.86],[0.14, -67.93],[0.06, -67.96],[-0.07, -67.97],[-0.18, -68.02],[-0.31, -68.03],[-0.50, -68.07],[-0.60, -68.06],[-0.74, -68.10],[-0.63, -68.15],[-0.65, -68.18],[-0.84, -68.23],[-0.76, -68.30],[-0.65, -68.31],[-0.52, -68.27],[-0.28, -68.27],[-0.14, -68.31],[-0.11, -68.39],[-0.24, -68.43],[-0.50, -68.43],[-0.66, -68.38],[-0.77, -68.37],[-0.85, -68.38],[-0.97, -68.34],[-1.20, -68.34],[-1.43, -68.44],[-1.77, -68.44],[-1.90, -68.49],[-1.85, -68.52],[-1.98, -68.58],[-2.08, -68.58],[-2.34, -68.65],[-2.52, -68.66],[-2.61, -68.68],[-2.71, -68.69],[-2.85, -68.75],[-3.16, -68.78],[-3.55, -68.78],[-3.60, -68.80],[-3.73, -68.80],[-3.82, -68.76],[-3.87, -68.70],[-4.03, -68.66],[-4.17, -68.66],[-4.35, -68.62],[-4.40, -68.59],[-4.61, -68.54],[-4.75, -68.56],[-4.81, -68.58],[-4.88, -68.65],[-5.03, -68.67],[-5.13, -68.71],[-5.18, -68.69],[-5.07, -68.63],[-4.91, -68.60],[-4.73, -68.51],[-4.68, -68.46],[-4.63, -68.42],[-4.63, -68.39],[-4.71, -68.36],[-4.67, -68.22],[-4.69, -68.13],[-4.67, -67.95],[-4.44, -67.82],[-4.78, -67.68],[-4.96, -67.64],[-5.15, -67.54],[-5.46, -67.45],[-5.64, -67.29],[-5.94, -67.19],[-6.07, -67.08],[-6.02, -66.98],[-5.88, -66.93],[-5.72, -66.80],[-5.92, -66.78],[-6.00, -66.73],[-5.90, -66.67],[-5.71, -66.64],[-5.66, -66.68],[-5.75, -66.73],[-5.74, -66.75],[-5.63, -66.76],[-5.64, -66.82],[-5.68, -66.83],[-5.79, -66.95],[-5.64, -67.01],[-5.60, -67.12],[-5.67, -67.15],[-5.65, -67.21],[-5.47, -67.28],[-5.31, -67.42],[-5.21, -67.47],[-5.05, -67.51],[-4.84, -67.60],[-4.78, -67.61],[-4.75, -67.67],[-4.50, -67.69],[-4.08, -67.66],[-3.97, -67.69],[-4.06, -67.75],[-4.04, -67.97],[-3.86, -68.05],[-3.84, -68.14],[-4.02, -68.15],[-4.02, -68.22],[-4.11, -68.21],[-4.41, -68.23],[-4.51, -68.31],[-4.51, -68.33],[-4.45, -68.33],[-4.51, -68.38],[-4.53, -68.42],[-4.48, -68.44],[-4.54, -68.47],[-4.51, -68.53],[-4.30, -68.58],[-4.19, -68.58],[-3.96, -68.64],[-3.86, -68.67],[-3.81, -68.67],[-3.75, -68.68],[-3.75, -68.72],[-3.59, -68.76],[-3.42, -68.76],[-2.93, -68.71],[-2.85, -68.70],[-2.79, -68.66],[-2.65, -68.65],[-2.58, -68.59],[-2.55, -68.59],[-2.54, -68.56],[-2.35, -68.52],[-2.27, -68.53],[-2.24, -68.51],[-2.04, -68.46],[-1.90, -68.44],[-1.89, -68.41],[-1.72, -68.39],[-1.58, -68.36],[-1.42, -68.36],[-1.30, -68.31],[-1.16, -68.29],[-1.10, -68.29],[-0.96, -68.23],[-0.99, -68.19],[-0.95, -68.14],[-0.82, -68.13],[-0.78, -68.09],[-0.61, -68.04],[-0.56, -68.00],[-0.41, -67.94],[-0.29, -67.93],[-0.21, -67.87]],
            /*Tunkuta*/[[-17.73, -68.08],[-17.70, -68.05],[-17.64, -68.04],[-17.65, -67.97],[-17.59, -67.95],[-17.48, -67.97],[-17.38, -67.97],[-17.30, -67.94],[-17.30, -67.90],[-17.20, -67.90],[-17.10, -67.87],[-17.07, -67.82],[-17.11, -67.78],[-17.11, -67.76],[-16.96, -67.70],[-16.96, -67.61],[-16.83, -67.57],[-16.83, -67.54],[-16.67, -67.47],[-16.56, -67.47],[-16.53, -67.44],[-16.33, -67.35],[-16.45, -67.27],[-16.52, -67.24],[-16.61, -67.22],[-16.60, -67.16],[-16.44, -67.17],[-15.73, -67.00],[-15.61, -66.94],[-15.67, -66.82],[-15.34, -66.65],[-15.10, -66.65],[-14.83, -66.60],[-14.71, -66.51],[-14.63, -66.38],[-14.79, -66.32],[-14.69, -66.29],[-14.59, -66.29],[-14.47, -66.18],[-14.43, -66.18],[-14.40, -66.13],[-14.46, -66.12],[-14.45, -66.07],[-14.35, -66.06],[-14.13, -66.10],[-14.04, -66.11],[-13.93, -66.23],[-13.80, -66.19],[-13.57, -66.20],[-13.46, -66.28],[-13.36, -66.26],[-13.17, -66.25],[-13.01, -66.28],[-12.84, -66.39],[-12.68, -66.41],[-12.49, -66.45],[-12.46, -66.49],[-12.64, -66.60],[-12.87, -66.59],[-12.94, -66.55],[-12.96, -66.48],[-12.93, -66.41],[-13.00, -66.34],[-13.20, -66.47],[-13.27, -66.48],[-13.27, -66.53],[-13.40, -66.58],[-13.22, -66.74],[-13.17, -67.06],[-13.21, -67.12],[-13.13, -67.15],[-13.00, -67.15],[-12.87, -67.10],[-12.65, -67.10],[-12.50, -67.11],[-12.47, -67.14],[-12.55, -67.15],[-12.62, -67.13],[-12.84, -67.13],[-12.99, -67.19],[-13.26, -67.18],[-13.50, -67.25],[-13.83, -67.23],[-14.09, -67.15],[-14.37, -67.12],[-14.47, -67.09],[-14.68, -67.11],[-14.74, -67.06],[-14.84, -67.05],[-14.88, -67.02],[-14.85, -66.96],[-14.77, -66.94],[-14.77, -66.91],[-14.83, -66.88],[-15.11, -66.91],[-15.19, -67.02],[-15.26, -67.03],[-15.26, -67.06],[-15.34, -67.05],[-15.42, -66.95],[-15.60, -66.99],[-15.59, -67.06],[-15.64, -67.08],[-15.61, -67.12],[-15.63, -67.24],[-15.83, -67.24],[-15.94, -67.33],[-16.25, -67.37],[-16.32, -67.41],[-16.33, -67.51],[-16.55, -67.56],[-16.70, -67.56],[-16.74, -67.61],[-16.82, -67.61],[-16.87, -67.65],[-16.88, -67.76],[-16.97, -67.76],[-17.02, -67.82],[-17.04, -67.92],[-17.16, -67.99],[-17.38, -67.99],[-17.48, -68.01],[-17.55, -67.99],[-17.55, -68.07]],
            /*Tunkuta(empty1)*/[[-13.85, -66.50],[-13.85, -66.46],[-13.55, -66.43],[-13.37, -66.44],[-13.32, -66.51],[-13.53, -66.57],[-13.61, -66.57]],
            /*Tunkuta(empty2)*/[[-14.38, -66.14],[-14.31, -66.13],[-14.21, -66.17],[-14.30, -66.20],[-14.35, -66.28],[-14.31, -66.32],[-14.26, -66.28],[-14.23, -66.23],[-14.14, -66.22],[-14.08, -66.24],[-14.06, -66.30],[-13.99, -66.31],[-13.85, -66.24],[-13.63, -66.25],[-13.48, -66.32],[-13.50, -66.37],[-13.61, -66.42],[-14.06, -66.42],[-14.26, -66.50],[-14.26, -66.54],[-14.45, -66.57],[-14.49, -66.54],[-14.58, -66.54],[-14.62, -66.52],[-14.55, -66.39],[-14.58, -66.36],[-14.41, -66.30],[-14.35, -66.18]],
            /*Tunkuta(empty3)*/[[-14.16, -66.58],[-14.15, -66.52],[-14.05, -66.51],[-13.65, -66.59],[-13.60, -66.63],[-13.46, -66.62],[-13.33, -66.78],[-13.27, -66.94],[-13.32, -67.09],[-13.48, -67.19],[-13.60, -67.22],[-13.81, -67.20],[-14.06, -67.12],[-14.25, -67.09],[-14.27, -67.06],[-14.60, -67.06],[-14.68, -67.00],[-14.65, -66.97],[-14.50, -66.93],[-14.46, -66.89],[-14.70, -66.78],[-14.61, -66.66],[-14.67, -66.63],[-14.64, -66.59],[-14.51, -66.58],[-14.39, -66.60]],
            /*Starry Midnight Port*/[[-13.72, -67.84],[-13.52, -67.77],[-13.40, -67.76],[-13.40, -67.72],[-13.54, -67.68],[-13.65, -67.69],[-13.67, -67.71],[-13.72, -67.70],[-13.66, -67.66],[-13.55, -67.65],[-13.31, -67.71],[-13.29, -67.74],[-13.16, -67.73],[-13.09, -67.74],[-13.11, -67.76],[-13.34, -67.77],[-13.50, -67.81],[-13.62, -67.92],[-13.77, -67.92],[-13.89, -67.98],[-13.90, -68.09],[-14.03, -68.16],[-14.00, -68.23],[-14.04, -68.26],[-14.01, -68.34],[-14.37, -68.44],[-14.29, -68.50],[-14.40, -68.54],[-14.45, -68.59],[-14.65, -68.53],[-14.63, -68.47],[-14.57, -68.41],[-14.45, -68.42],[-14.24, -68.34],[-14.25, -68.29],[-14.17, -68.24],[-14.13, -68.23],[-14.17, -68.19],[-14.15, -68.14],[-14.07, -68.03],[-14.09, -67.99],[-14.05, -67.96],[-13.94, -67.94],[-13.93, -67.90],[-13.87, -67.85]],
            ]]
            }                
        },
    {
        "type":"Feature",
        "id":"24",
        "properties":
            {
            "name_EN":"O\'dyllita",
            "name_KR":"오딜리타",
            "fishGroup": ["YellowfinSole", "StippledGunnel", "DarkChub"],
            "locationColor": "#909090",

        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Forgotten Mountain*/[[2.81, -67.84],[2.67, -67.79],[2.50, -67.86],[2.73, -67.86]],
            /*Thorny Forest(east)*/[[-8.29, -65.02],[-8.27, -65.04],[-8.27, -65.09],[-8.09, -65.16],[-8.10, -65.09],[-8.23, -65.02],[-8.24, -65.00],[-8.24, -64.93],[-8.40, -64.89],[-8.45, -64.92],[-8.46, -64.96]],
            /*Salanar Pond(south1)*/[[-5.46, -68.87],[-5.39, -68.91],[-5.50, -68.95],[-5.57, -68.94],[-5.62, -68.96],[-5.62, -68.98],[-5.72, -69.03],[-5.83, -69.04],[-5.85, -69.06],[-5.85, -69.08],[-5.90, -69.12],[-5.93, -69.12],[-6.08, -69.06],[-6.04, -69.03],[-6.00, -69.01],[-6.00, -68.99],[-5.93, -68.98],[-5.82, -68.93],[-5.71, -68.93],[-5.64, -68.92],[-5.61, -68.90],[-5.52, -68.90]],
            /*Salanar Pond(south2)*/[[-8.29, -69.00],[-8.19, -68.99],[-8.24, -68.93],[-8.22, -68.91],[-8.24, -68.90],[-8.20, -68.88],[-8.21, -68.87],[-8.25, -68.85],[-8.29, -68.87],[-8.28, -68.88],[-8.33, -68.91],[-8.33, -68.93],[-8.30, -68.95]],
            /*Narcion(west)*/[[-11.14, -69.18],[-11.31, -69.18],[-11.26, -69.13],[-11.27, -69.11],[-11.24, -69.09],[-11.13, -69.14]],
            /*Odraxia(1)*/[[-1.89, -68.99],[-1.90, -69.01],[-1.86, -69.02],[-1.81, -69.02],[-1.78, -69.03],[-1.89, -69.04],[-1.95, -69.02],[-1.95, -68.99]],
            /*Odraxia(2)*/[[-0.89, -68.76],[-0.80, -68.74],[-0.62, -68.84],[-0.70, -68.86]],
            /*Odraxia(3)*/[[-0.65, -68.71],[-0.57, -68.69],[-0.43, -68.77],[-0.51, -68.79]],
            /*Talibahr's Rope(1)*/[[-17.56, -67.29],[-17.67, -67.32],[-17.72, -67.38],[-17.72, -67.41],[-17.64, -67.42],[-17.53, -67.35]],
            /*Talibahr's Rope(2)*/[[-17.64, -67.54],[-17.57, -67.54],[-17.57, -67.61],[-17.64, -67.62],[-17.68, -67.59]],
            /*Talibahr's Rope(3)*/[[-18.58, -67.91],[-18.47, -67.93],[-18.18, -67.88],[-18.14, -67.79],[-17.93, -67.81],[-17.83, -67.76],[-17.81, -67.70],[-18.56, -67.46],[-18.79, -67.43],[-18.85, -67.53],[-18.24, -67.71],[-18.25, -67.79],[-18.30, -67.86]],
            /*Olun's Valley*/[[-0.66, -65.76],[-0.62, -65.73],[-0.56, -65.73],[-0.50, -65.76],[-0.50, -65.78],[-0.59, -65.78]],
            ]]
            }                
        },
        

    //-----  Papua Crinea  -----//    
    {
        "type":"Feature",
        "id":"25",
        "properties":
            {
            "name_EN":"Papua Crinea - Garden of Birth",
            "name_KR":"파푸아 크리니 - 부화의 정원",
            "fishGroup": ["StumpyBullhead", "GobyMinnow", "Sweetfish"],
            "locationColor": "#909090",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Garden of Hatching*/[[-42.14, -51.41],[-42.15, -51.44],[-42.10, -51.47],[-42.01, -51.48],[-41.94, -51.41],[-41.93, -51.41],[-41.86, -51.35],[-41.76, -51.31],[-41.71, -51.22],[-41.65, -51.23],[-41.53, -51.18],[-41.43, -51.10],[-41.20, -51.02],[-41.24, -50.98],[-41.37, -51.02],[-41.39, -51.06],[-41.58, -51.07],[-41.62, -51.11],[-41.80, -51.19],[-41.80, -51.25],[-41.90, -51.28],[-41.98, -51.38]],
            ]]
            }                
        },  
    {
        "type":"Feature",
        "id":"26",
        "properties":
            {
            "name_EN":"Papua Crinea - Wave's Rest",
            "name_KR":"파푸아 크리니 - 파도의 쉼터",
            "fishGroup": ["Skate", "GoliathGrouper", "StripedBonito", "StripedJewfish", "BlackfinSeaPerch", "GreaterAmberjack", "Cuvier", "Sunfish", "Tilefish", "Nibbler", "SmokeyChromis", "Porgy", "SeaBass", "Tuna", "Swordfish", "YellowSwordfish", "Mudskipper", "Saurel", "Cuttlefish", "Squid", "Sandeel", "TearoftheOcean", "AbyssalGem", "RainbowFishBoneCoin", "RainbowPetalCoin"],
            "locationColor": "#FF4343",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Wave's Rest*/[[-42.94, -51.86],[-42.54, -52.47],[-42.24, -52.70],[-42.21, -52.67],[-42.05, -52.68],[-41.89, -52.64],[-41.81, -52.58],[-41.80, -52.50],[-41.86, -52.49],[-41.83, -52.46],[-41.81, -52.38],[-41.70, -52.32],[-41.55, -52.18],[-41.52, -52.02],[-41.64, -51.91],[-41.77, -51.89],[-42.09, -51.96],[-42.11, -51.91],[-42.21, -51.90],[-42.23, -51.87],[-42.17, -51.83],[-42.19, -51.77],[-42.07, -51.75],[-42.07, -51.71],[-42.17, -51.68],[-42.31, -51.71],[-42.40, -51.80],[-42.50, -51.86],[-42.79, -51.83]],
            ]]
            }                
        },
]};



var SaltwaterData = {"type":"FeatureCollection","features":
[
    //----- Odyllita Sea -----//
    {
        "type":"Feature",
        "id":"0",
        "properties":
            {
            "name_EN":"Zulatia Sea",
            "name_KR":"줄라티아 해역",
            "fishGroup": ["GiantOarfish", "GreenSturgeon", "RedbreastedWrasse", "RedSnowCrab", "StippledGunnel", "YellowfinSole"],
            "locationColor": "#F35280",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Zulatia Sea(A-west)*/[[-14.35, -70.57],[-13.21, -69.96],[-13.20, -69.58],[-13.53, -69.49],[-13.48, -69.45],[-13.53, -69.43],[-13.51, -69.42],[-13.57, -69.39],[-13.62, -69.38],[-13.66, -69.40],[-13.87, -69.38],[-13.85, -69.35],[-13.90, -69.32],[-14.15, -69.30],[-14.27, -69.22],[-14.46, -69.09],[-14.24, -68.93],[-14.44, -68.84],[-14.54, -68.72],[-14.65, -68.65],[-14.56, -68.61],[-14.74, -68.55],[-14.96, -68.55],[-15.00, -68.56],[-15.07, -68.56],[-15.69, -68.30],[-15.74, -68.29],[-15.79, -68.31],[-15.78, -68.31],[-15.83, -68.33],[-15.90, -68.31],[-15.97, -68.33],[-15.97, -68.38],[-16.05, -68.37],[-16.12, -68.40],[-16.15, -68.38],[-16.12, -68.36],[-16.17, -68.35],[-16.21, -68.33],[-16.16, -68.32],[-16.15, -68.29],[-16.27, -68.29],[-16.34, -68.32],[-16.48, -68.29],[-16.76, -68.33],[-16.77, -68.37],[-16.92, -68.39],[-17.22, -68.26],[-17.35, -68.18],[-17.30, -68.14],[-17.45, -68.10],[-17.49, -68.08],[-17.81, -68.10],[-17.88, -68.14],[-17.96, -68.14],[-18.02, -68.11],[-18.07, -68.11],[-18.09, -68.14],[-18.26, -68.18],[-18.48, -68.10],[-18.47, -67.96],[-18.61, -67.93],[-18.76, -67.99],[-18.87, -67.94],[-18.96, -67.91],[-18.86, -67.91],[-18.85, -67.88],[-18.92, -67.86],[-18.97, -67.88],[-19.07, -67.85],[-19.24, -67.95],[-19.45, -67.91],[-19.48, -67.89],[-19.27, -67.83],[-19.43, -67.81],[-19.47, -67.79],[-19.45, -67.63],[-19.32, -67.56],[-19.19, -67.52],[-19.09, -67.53],[-19.05, -67.51],[-19.01, -67.44],[-19.33, -67.33],[-19.34, -67.30],[-19.25, -67.26],[-19.18, -67.25],[-19.14, -67.22],[-19.24, -67.16],[-19.34, -67.15],[-19.38, -67.17],[-19.38, -67.20],[-21.32, -68.12],[-22.09, -68.86],[-14.99, -70.56]],
            /*Zulatia Sea(A-east)*/[[-11.58, -69.38],[-11.34, -69.20],[-11.12, -69.21],[-11.00, -69.27],[-10.79, -69.32],[-10.71, -69.30],[-10.63, -69.29],[-10.58, -69.25],[-10.61, -69.24],[-10.55, -69.22],[-10.31, -69.17],[-10.20, -69.19],[-10.03, -69.16],[-10.00, -69.17],[-9.70, -69.16],[-9.66, -69.13],[-9.49, -69.17],[-9.48, -69.21],[-9.35, -69.24],[-9.23, -69.20],[-9.10, -69.17],[-9.14, -69.14],[-9.09, -69.12],[-9.11, -69.10],[-8.97, -69.10],[-8.93, -69.18],[-8.82, -69.25],[-8.67, -69.22],[-8.60, -69.17],[-8.62, -69.15],[-8.59, -69.13],[-8.51, -69.12],[-8.46, -69.10],[-8.44, -69.04],[-8.28, -69.01],[-8.17, -69.00],[-8.08, -69.07],[-7.95, -69.08],[-7.83, -69.07],[-7.62, -69.06],[-7.51, -69.03],[-7.48, -68.97],[-7.34, -68.95],[-7.22, -68.99],[-7.12, -69.08],[-7.03, -69.07],[-6.96, -69.09],[-6.83, -69.03],[-6.74, -69.03],[-6.74, -69.00],[-6.64, -69.04],[-6.65, -69.09],[-6.58, -69.12],[-6.52, -69.13],[-6.47, -69.11],[-6.36, -69.11],[-6.29, -69.12],[-6.21, -69.09],[-6.21, -69.08],[-6.14, -69.06],[-5.99, -69.13],[-6.04, -69.20],[-6.06, -69.25],[-6.14, -69.25],[-6.12, -69.33],[-6.19, -69.36],[-6.13, -69.39],[-6.26, -69.40],[-6.20, -69.46],[-6.09, -69.44],[-5.99, -69.46],[-5.92, -69.44],[-5.92, -69.39],[-5.80, -69.39],[-5.70, -69.42],[-5.59, -69.49],[-5.58, -69.56],[-5.44, -69.54],[-5.36, -69.56],[-5.30, -69.54],[-5.24, -69.56],[-5.20, -69.56],[-5.12, -69.59],[-5.03, -69.60],[-5.00, -69.62],[-5.07, -69.66],[-5.18, -69.66],[-5.19, -69.68],[-5.00, -69.83],[-4.91, -69.86],[-4.86, -69.91],[-4.68, -69.92],[-4.40, -69.98],[-4.21, -69.98],[-4.06, -70.00],[-3.93, -69.99],[-3.87, -70.00],[-3.99, -70.08],[-4.21, -70.10],[-4.30, -70.11],[-4.31, -70.13],[-4.18, -70.16],[-4.21, -70.20],[-4.32, -70.20],[-4.47, -70.19],[-4.62, -70.22],[-4.65, -70.21],[-4.71, -70.23],[-4.77, -70.26],[-4.74, -70.28],[-4.81, -70.31],[-4.82, -70.34],[-4.78, -70.37],[-4.61, -70.39],[-4.50, -70.42],[-4.54, -70.46],[-4.50, -70.55],[-8.83, -70.53],[-8.80, -69.93],[-10.30, -69.58],[-11.69, -69.78],[-12.36, -69.49],[-12.21, -69.43],[-12.13, -69.31],[-12.04, -69.31],[-12.03, -69.41],[-11.84, -69.45]],
            ]]
            }
        },
    {
        "type":"Feature",
        "id":"1",
        "properties":
            {
            "name_EN":"Zulatia Sea",
            "name_KR":"줄라티아 해역",
            "fishGroup": ["RedbreastedWrasse", "Nibbler", "RedSnowCrab", "AtkaMackerel", "Cero", "Gurnard", "Bigeye", "Pintado", "Dolphinfish", "FlyingFish", "FourfingerThreadfin", "Mullet", "MackerelPike", "Saurel", "Surfperch", "harpoon", "Ribbonfish", "ThresherShark", "BaskingShark", "TigerShark", "RedSnowCrab", "FlowerIcefish", "DarkChub"],
            "locationColor": "#E90043",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Zulatia Sea(B)*/[[-22.14, -68.92],[-23.93, -70.57],[-15.25, -70.57]],
            ]]
            }                
        },
    {
        "type":"Feature",
        "id":"2",
        "properties":
            {
            "name_EN":"Elsana Sea",
            "name_KR":"엘산나 해역",
            "fishGroup": ["Nibbler", "AtkaMackerel", "Cero", "Gurnard", "Bigeye", "Pintado", "Dolphinfish", "FlyingFish", "FourfingerThreadfin", "Mullet", "MackerelPike", "Saurel", "Surfperch", "harpoon", "Hammerhead", "WhaleShark", "AtkaMackerel", "Cero", "Flounder"],
            "locationColor": "#AAFDC9",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Elsana Sea*/[[-36.61, -60.48],[-36.70, -60.45],[-36.80, -60.46],[-37.02, -60.53],[-37.33, -60.53],[-37.50, -60.62],[-37.52, -60.71],[-37.68, -60.76],[-37.96, -61.03],[-38.14, -61.05],[-38.26, -61.15],[-38.22, -61.18],[-38.41, -61.24],[-38.41, -61.30],[-38.27, -61.33],[-38.39, -61.40],[-38.37, -61.43],[-38.54, -61.49],[-38.66, -61.49],[-38.67, -61.67],[-38.60, -61.69],[-38.61, -61.82],[-38.78, -61.94],[-38.78, -61.97],[-38.61, -62.09],[-38.64, -62.14],[-38.53, -62.29],[-38.41, -62.35],[-38.38, -62.41],[-38.44, -62.53],[-38.40, -62.57],[-38.27, -62.60],[-38.18, -62.67],[-38.30, -62.70],[-38.30, -62.78],[-38.35, -62.83],[-38.30, -62.85],[-38.38, -62.91],[-38.26, -63.04],[-38.39, -63.06],[-38.48, -63.11],[-38.40, -63.17],[-38.36, -63.26],[-38.31, -63.29],[-38.19, -63.28],[-38.12, -63.29],[-38.21, -63.34],[-38.18, -63.42],[-38.14, -63.44],[-38.00, -63.44],[-37.93, -63.50],[-37.95, -63.55],[-37.91, -63.59],[-37.75, -63.61],[-37.68, -63.65],[-37.78, -63.69],[-37.77, -63.74],[-37.52, -63.83],[-37.53, -63.92],[-37.37, -63.96],[-37.33, -64.04],[-37.11, -64.10],[-37.10, -64.14],[-37.03, -64.18],[-36.85, -64.21],[-36.61, -64.20],[-36.41, -64.26],[-36.22, -64.24],[-35.98, -64.23],[-35.92, -64.26],[-35.79, -64.26],[-35.49, -64.16],[-35.31, -64.18],[-34.81, -64.01],[-34.80, -63.97],[-34.57, -63.94],[-34.47, -63.95],[-34.38, -63.91],[-34.20, -63.91],[-34.15, -63.83],[-34.05, -63.79],[-33.90, -63.78],[-33.78, -63.80],[-33.37, -63.73],[-33.26, -63.74],[-33.15, -63.79],[-32.97, -63.81],[-32.74, -63.87],[-32.54, -63.95],[-32.51, -64.03],[-32.36, -64.06],[-32.30, -64.06],[-32.12, -64.22],[-32.10, -64.38],[-31.97, -64.43],[-31.96, -64.48],[-32.00, -64.51],[-31.94, -64.54],[-31.91, -64.58],[-32.06, -64.65],[-32.14, -64.65],[-32.30, -64.62],[-32.37, -64.58],[-32.45, -64.58],[-32.56, -64.62],[-32.71, -64.77],[-32.76, -64.85],[-32.84, -64.92],[-32.95, -64.94],[-32.78, -65.02],[-32.75, -65.02],[-32.67, -65.05],[-32.69, -65.08],[-32.90, -65.09],[-32.97, -65.11],[-32.99, -65.16],[-33.04, -65.18],[-33.13, -65.31],[-33.27, -65.43],[-33.28, -65.52],[-33.53, -65.71],[-33.53, -65.77],[-33.65, -65.83],[-33.65, -65.89],[-33.73, -65.95],[-33.67, -65.99],[-33.66, -66.05],[-33.80, -66.14],[-33.80, -66.20],[-33.88, -66.22],[-33.98, -66.20],[-34.18, -66.24],[-34.33, -66.25],[-34.44, -66.31],[-34.43, -66.49],[-34.49, -66.53],[-34.49, -66.58],[-34.43, -66.61],[-34.61, -66.68],[-34.48, -66.77],[-34.56, -66.80],[-34.70, -66.82],[-34.75, -66.91],[-34.71, -66.96],[-34.43, -67.02],[-34.33, -67.05],[-34.11, -67.05],[-34.17, -67.08],[-34.15, -67.12],[-33.93, -67.16],[-33.61, -67.15],[-33.31, -67.21],[-33.14, -67.23],[-33.06, -67.13],[-33.09, -67.11],[-33.03, -67.09],[-32.95, -67.10],[-32.92, -67.09],[-32.94, -67.04],[-32.86, -66.99],[-32.69, -67.00],[-32.58, -66.96],[-32.39, -66.98],[-32.33, -66.96],[-32.37, -66.93],[-32.31, -66.91],[-32.20, -66.90],[-32.14, -66.92],[-31.94, -66.83],[-31.59, -66.87],[-31.54, -66.89],[-31.43, -66.89],[-31.08, -66.91],[-31.01, -66.94],[-31.02, -66.96],[-31.08, -66.97],[-31.08, -66.99],[-30.70, -67.00],[-30.71, -67.04],[-30.69, -67.05],[-30.62, -67.05],[-30.48, -66.99],[-30.12, -67.05],[-29.97, -67.09],[-29.79, -67.05],[-29.62, -67.07],[-29.47, -67.03],[-29.37, -67.03],[-29.35, -67.09],[-29.42, -67.12],[-29.30, -67.21],[-29.19, -67.20],[-29.18, -67.23],[-29.09, -67.25],[-29.01, -67.25],[-28.95, -67.27],[-28.93, -67.33],[-28.48, -67.42],[-28.25, -67.34],[-28.00, -67.32],[-27.91, -67.37],[-27.56, -67.28],[-27.31, -67.32],[-27.25, -67.30],[-27.22, -67.31],[-26.83, -67.22],[-26.71, -67.21],[-26.64, -67.23],[-26.61, -67.30],[-26.52, -67.33],[-26.33, -67.28],[-26.30, -67.31],[-26.21, -67.30],[-26.11, -67.33],[-26.02, -67.31],[-26.00, -67.28],[-25.79, -67.22],[-25.51, -67.21],[-25.26, -67.25],[-25.05, -67.32],[-25.05, -67.34],[-25.14, -67.42],[-25.11, -67.48],[-24.92, -67.53],[-24.83, -67.52],[-24.79, -67.53],[-24.80, -67.55],[-24.70, -67.56],[-24.64, -67.54],[-24.40, -67.58],[-24.20, -67.62],[-24.08, -67.62],[-23.97, -67.57],[-23.81, -67.56],[-23.72, -67.53],[-23.55, -67.52],[-23.38, -67.47],[-23.16, -67.38],[-23.10, -67.38],[-23.06, -67.39],[-22.90, -67.38],[-22.80, -67.33],[-22.73, -67.33],[-22.56, -67.36],[-22.44, -67.36],[-22.22, -67.32],[-22.04, -67.36],[-21.82, -67.33],[-21.78, -67.32],[-21.76, -67.25],[-21.73, -67.24],[-21.67, -67.24],[-21.55, -67.20],[-21.39, -67.18],[-21.22, -67.22],[-21.16, -67.27],[-21.15, -67.32],[-21.07, -67.32],[-21.05, -67.31],[-20.94, -67.32],[-20.81, -67.37],[-20.67, -67.37],[-20.63, -67.39],[-20.42, -67.39],[-20.00, -67.32],[-19.92, -67.25],[-19.91, -67.21],[-19.87, -67.21],[-19.87, -67.25],[-19.81, -67.25],[-19.80, -67.28],[-19.73, -67.29],[-21.40, -68.08],[-24.04, -70.57],[-27.41, -68.97],[-38.27, -67.74],[-42.46, -64.90],[-49.41, -60.46],[-36.59, -60.42]],
            /*Elsana Sea(Grandiha)*/[[-35.33, -64.31],[-36.00, -64.94],[-35.70, -65.20],[-34.23, -65.59],[-33.53, -65.58],[-32.82, -64.65],[-33.41, -64.18]],
            ]]
            }                
        },
    {
        "type":"Feature",
        "id":"3",
        "properties":
            {
            "name_EN":"Serni Sea",
            "name_KR":"세르니 해역",
            "fishGroup": ["Nibbler", "AtkaMackerel", "Cero", "Gurnard", "Bigeye", "Pintado", "Dolphinfish", "FlyingFish", "FourfingerThreadfin", "Mullet", "MackerelPike", "Saurel", "Surfperch", "harpoon", "Hammerhead", "WhaleShark", "AtkaMackerel", "Cero", "Flounder"],
            "locationColor": "#AAFDC9",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Serni Sea*/[[-32.72, -47.83],[-34.96, -47.83],[-35.90, -48.79],[-49.45, -48.78],[-53.51, -48.11],[-53.81, -48.11],[-49.50, -60.39],[-44.05, -60.39],[-36.60, -60.35],[-36.60, -60.22],[-36.66, -60.16],[-36.81, -60.08],[-36.89, -59.97],[-37.05, -59.82],[-37.46, -59.80],[-37.70, -59.69],[-37.74, -59.62],[-37.93, -59.51],[-38.46, -59.33],[-38.48, -59.26],[-38.60, -59.24],[-38.62, -59.18],[-38.64, -59.16],[-38.72, -59.16],[-38.79, -59.10],[-38.79, -59.04],[-38.90, -58.96],[-38.91, -58.90],[-38.83, -58.83],[-38.86, -58.80],[-38.76, -58.73],[-38.78, -58.66],[-38.84, -58.61],[-38.87, -58.47],[-38.54, -58.18],[-38.39, -58.14],[-38.36, -58.09],[-38.41, -58.07],[-38.37, -57.99],[-38.49, -57.92],[-38.49, -57.85],[-38.41, -57.78],[-38.46, -57.74],[-38.45, -57.71],[-38.42, -57.67],[-38.35, -57.65],[-38.32, -57.62],[-38.49, -57.54],[-38.50, -57.47],[-38.55, -57.47],[-38.62, -57.49],[-38.66, -57.46],[-38.61, -57.44],[-38.57, -57.43],[-38.51, -57.37],[-38.51, -57.32],[-38.38, -57.23],[-38.36, -57.17],[-38.29, -57.12],[-38.22, -57.12],[-38.14, -57.06],[-38.06, -56.95],[-37.90, -56.91],[-37.92, -56.88],[-37.82, -56.79],[-37.72, -56.76],[-37.71, -56.67],[-37.60, -56.58],[-37.61, -56.51],[-37.55, -56.44],[-37.50, -56.41],[-37.50, -56.37],[-37.22, -56.23],[-36.99, -56.06],[-36.74, -56.01],[-36.72, -55.98],[-36.74, -55.93],[-36.67, -55.85],[-36.62, -55.85],[-36.55, -55.78],[-36.61, -55.75],[-36.80, -55.75],[-36.83, -55.70],[-36.93, -55.70],[-37.01, -55.73],[-37.05, -55.70],[-37.08, -55.61],[-36.96, -55.49],[-36.92, -55.35],[-36.95, -55.23],[-37.11, -55.14],[-37.07, -55.10],[-36.93, -55.01],[-37.07, -54.90],[-37.06, -54.82],[-36.96, -54.72],[-36.98, -54.59],[-36.90, -54.55],[-36.84, -54.46],[-36.61, -54.39],[-36.56, -54.33],[-36.63, -54.30],[-36.87, -54.25],[-36.88, -54.18],[-36.96, -54.12],[-36.98, -54.05],[-36.83, -53.79],[-36.78, -53.66],[-36.83, -53.57],[-36.83, -53.48],[-36.71, -53.44],[-36.63, -53.31],[-36.39, -53.21],[-36.28, -53.12],[-36.28, -53.07],[-36.20, -53.05],[-35.96, -53.05],[-35.93, -53.08],[-35.89, -53.08],[-35.93, -53.02],[-36.02, -53.02],[-36.21, -52.94],[-36.22, -52.89],[-36.18, -52.79],[-36.09, -52.71],[-36.04, -52.68],[-35.98, -52.61],[-36.03, -52.57],[-35.78, -52.44],[-35.53, -52.40],[-35.35, -52.27],[-35.36, -52.13],[-35.19, -52.03],[-34.98, -52.01],[-34.80, -52.03],[-34.74, -51.99],[-34.76, -51.89],[-34.83, -51.90],[-34.90, -51.86],[-34.87, -51.76],[-34.75, -51.67],[-34.71, -51.67],[-34.67, -51.61],[-34.69, -51.56],[-34.90, -51.45],[-34.93, -51.36],[-34.79, -51.26],[-34.83, -51.17],[-34.80, -51.07],[-34.77, -51.04],[-34.85, -50.98],[-34.84, -50.90],[-34.80, -50.84],[-34.72, -50.81],[-34.72, -50.74],[-34.78, -50.70],[-34.78, -50.57],[-34.72, -50.51],[-34.72, -50.44],[-34.79, -50.42],[-34.79, -50.33],[-34.87, -50.29],[-34.88, -50.09],[-34.77, -50.01],[-34.69, -50.02],[-34.46, -49.80],[-34.26, -49.74],[-34.16, -49.74],[-34.13, -49.71],[-34.14, -49.61],[-33.94, -49.40],[-33.75, -49.36],[-33.70, -49.31],[-33.62, -49.28],[-33.60, -49.22],[-33.56, -49.20],[-33.54, -49.03],[-33.48, -48.99],[-33.27, -48.99],[-33.22, -49.03],[-33.19, -49.01],[-33.18, -48.89],[-33.07, -48.81],[-33.00, -48.81],[-32.87, -48.73],[-32.81, -48.56],[-32.89, -48.56],[-32.96, -48.49],[-32.89, -48.41],[-32.89, -48.35],[-32.98, -48.27],[-32.96, -48.22],[-32.77, -48.11],[-32.72, -48.06],[-32.63, -48.07],[-32.57, -47.93],[-32.68, -47.90]],
            /*Serni Sea(Papua Crinea)[[-43.46, -50.16],[-44.13, -51.06],[-43.77, -51.86],[-44.81, -52.84],[-43.79, -53.80],[-40.32, -53.77],[-39.88, -52.83],[-40.30, -52.18],[-39.71, -51.34],[-41.36, -50.01]],*/
            /*Garden of Hatching*/[[-42.14, -51.41],[-42.15, -51.44],[-42.10, -51.47],[-42.01, -51.48],[-41.94, -51.41],[-41.93, -51.41],[-41.86, -51.35],[-41.76, -51.31],[-41.71, -51.22],[-41.65, -51.23],[-41.53, -51.18],[-41.43, -51.10],[-41.20, -51.02],[-41.24, -50.98],[-41.37, -51.02],[-41.39, -51.06],[-41.58, -51.07],[-41.62, -51.11],[-41.80, -51.19],[-41.80, -51.25],[-41.90, -51.28],[-41.98, -51.38]],
            /*Wave's Rest*/[[-42.94, -51.86],[-42.54, -52.47],[-42.24, -52.70],[-42.21, -52.67],[-42.05, -52.68],[-41.89, -52.64],[-41.81, -52.58],[-41.80, -52.50],[-41.86, -52.49],[-41.83, -52.46],[-41.81, -52.38],[-41.70, -52.32],[-41.55, -52.18],[-41.52, -52.02],[-41.64, -51.91],[-41.77, -51.89],[-42.09, -51.96],[-42.11, -51.91],[-42.21, -51.90],[-42.23, -51.87],[-42.17, -51.83],[-42.19, -51.77],[-42.07, -51.75],[-42.07, -51.71],[-42.17, -51.68],[-42.31, -51.71],[-42.40, -51.80],[-42.50, -51.86],[-42.79, -51.83]],
            /*Papua Crinea(Queekity Thumpity Moon Village)*/[[-41.50, -53.13],[-41.60, -53.07],[-41.48, -53.04],[-41.38, -53.07],[-41.45, -53.08]],
            /*Acher Western Camp(west island)*/[[-40.46, -57.22],[-40.43, -57.20],[-40.57, -57.15],[-40.62, -57.19]],
        ]]
            }                
        },



    //----- Original Sea, Ocean -----//
    {
        "type":"Feature",
        "id":"4",
        "properties":
            {
            "name_EN":"Velia Beach",
            "name_KR":"벨리아 마을 해변",
            "fishGroup": ["BlueBatStar", "Corvina", "Nibbler", "Moray", "Grunt", "Herring", "SeaEel", "Sandeel", "RockHind", "Sandfish", "Mackerel", "Trout", "Beltfish", "Mudskipper"],
            "locationColor": "red",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Velia Beach*/[[11.64, -36.36],[11.64, -36.41],[11.68, -36.43],[12.03, -36.48],[12.03, -36.42],[11.85, -36.322],[11.68, -36.31]],
            ]]
            }                
        },
    {
        "type":"Feature",
        "id":"5",
        "properties":
            {
            "name_EN":"Amberjack area",
            "name_KR":"방어 지역",
            "fishGroup": ["Amberjack", "Sandeel", "Butterflyfish", "FourfingerThreadfin", "Sardine", "Jellyfish"],
            "locationColor": "#BAD0FF",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Amberjack Point*/[[10.88, -36.15],[11.09, -35.46],[11.53, -34.89],[10.95, -35.19],[10.33, -35.12],[10.13, -35.01],[10.01, -36.07],[10.06, -36.08],[10.16, -36.14],[10.18, -36.21],[10.14, -36.29],[10.19, -36.29],[10.24, -36.27],[10.54, -36.26],[10.59, -36.24],[10.64, -36.23],[10.67, -36.22],[10.67, -36.19],[10.72, -36.15]],
            ]]
            }                
        },
    {
        "type":"Feature",
        "id":"6",
        "properties":
            {
            "name_EN":"Crab area",
            "name_KR":"꽃게 지역",
            "fishGroup": ["Crab", "Shellfish", "Dollarfish", "HornFish", "BlackfinSweeper", "Greenling", "Croaker"],
            "locationColor": "#FFB9A6",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Crab Point*/[[7.37, -35.34],[7.53, -35.39],[7.57, -35.44],[7.62, -35.45],[7.81, -35.64],[7.83, -35.70],[7.88, -35.70],[7.89, -35.69],[7.93, -35.70],[7.95, -35.83],[7.98, -35.89],[8.08, -35.91],[8.13, -35.97],[8.20, -35.99],[8.24, -36.05],[8.31, -36.09],[8.34, -36.07],[9.20, -34.53],[9.19, -34.24],[9.22, -34.17],[8.06, -34.15],[6.89, -33.81],[6.71, -33.64],[6.71, -33.75],[7.24, -34.26],[7.34, -34.72]],
            ]]
            }                
        },
    {
        "type":"Feature",
        "id":"7",
        "properties":
            {
            "name_EN":"Flounder area",
            "name_KR":"넙치 지역",
            "fishGroup": ["Flounder", "Sandeel", "TongueSole", "Gunnel", "SilverStripeRoundHerring", "Starfish"],
            "locationColor": "#FFFEBC",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Flounder Point*/[[11.18, -34.44],[11.52, -34.59],[11.52, -34.84],[10.94, -35.15],[10.35, -35.07],[9.58, -34.68],[9.24, -34.53],[9.24, -34.25],[9.27, -34.16],[9.55, -34.12],[10.43, -33.32],[10.58, -32.93],[10.72, -32.74],[10.94, -32.54],[11.10, -32.54],[10.89, -32.75],[10.83, -32.93],[10.71, -33.33],[10.73, -33.60]],
            ]]
            }                
        },
    {
        "type":"Feature",
        "id":"8",
        "properties":
            {
            "name_EN":"Olvia ~ Velia ~ Sausan Garrison Coast",
            "name_KR":"올비아 ~ 벨리아 ~ 소산 주둔지 해안",
            "fishGroup": ["Sandeel", "RockHind", "Sandfish", "Mackerel", "Trout", "Beltfish", "Mudskipper"],
            "locationColor": "#909090",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Velia*/[[8.38, -36.08],[8.67, -36.09],[8.69, -36.12],[8.99, -36.13],[9.06, -36.09],[9.20, -36.10],[9.29, -36.03],[9.32, -36.05],[9.43, -36.04],[9.52, -36.07],[9.61, -36.06],[9.66, -36.08],[9.72, -36.03],[9.81, -36.05],[9.86, -36.04],[9.93, -36.08],[9.98, -36.06],[10.10, -35.00],[9.22, -34.57]],
            /*Olvia*/[[6.65, -33.61],[6.65, -33.77],[7.17, -34.27],[7.27, -34.73],[7.30, -35.34],[7.07, -35.43],[6.70, -35.26],[6.31, -35.02],[6.32, -34.96],[6.27, -34.96],[6.13, -34.87],[6.05, -34.81],[6.06, -34.78],[5.97, -34.71],[5.96, -34.63],[6.08, -34.51],[6.15, -34.56],[6.19, -34.50],[6.14, -34.48],[6.18, -34.46],[6.23, -34.40],[6.19, -34.28],[6.22, -34.21],[6.37, -34.10],[6.40, -34.11],[6.47, -34.07],[6.43, -34.04],[6.47, -34.03],[6.49, -33.99],[6.46, -33.97],[6.42, -33.97],[6.40, -33.89],[6.46, -33.80],[6.40, -33.73],[6.31, -33.71],[6.11, -33.63],[6.07, -33.59],[6.09, -33.54],[5.97, -33.51],[5.86, -33.52],[5.78, -33.50],[5.76, -33.47],[5.72, -33.49],[5.64, -33.47],[5.57, -33.53],[5.56, -33.37],[5.41, -33.22],[5.31, -33.22],[5.26, -33.27],[5.14, -33.22],[4.92, -33.30],[4.88, -33.26],[4.94, -33.18],[4.91, -32.99],[4.83, -32.98],[4.87, -32.91],[4.80, -32.81],[4.74, -32.84],[4.63, -32.73],[4.57, -32.66],[4.50, -32.66],[4.45, -32.54],[4.34, -32.47],[4.31, -32.17],[4.25, -32.14],[4.29, -32.12],[4.24, -32.04],[4.10, -31.93],[4.00, -31.90],[3.99, -31.84],[3.93, -31.81],[3.92, -31.75],[3.98, -31.70],[3.95, -31.68],[3.93, -31.58],[3.78, -31.50],[3.68, -31.50],[3.65, -31.48],[3.69, -31.42],[3.58, -31.36],[3.56, -31.26],[3.41, -31.18],[3.35, -31.05],[3.26, -30.95],[3.20, -30.95],[3.17, -30.81],[2.99, -30.70],[2.99, -30.62],[2.94, -30.56],[3.00, -30.51],[3.03, -30.42],[2.97, -30.37],[2.76, -30.44],[2.71, -30.38],[2.66, -30.39],[2.58, -30.34],[2.59, -30.27],[2.56, -30.22],[2.49, -30.22],[2.46, -30.17],[2.48, -30.14],[2.47, -30.08],[2.42, -30.05],[2.27, -30.11],[2.27, -30.14],[2.22, -30.18],[2.17, -30.18],[2.17, -30.10],[2.13, -30.07],[2.07, -30.07],[2.02, -30.10],[1.97, -30.08],[1.87, -30.15],[1.82, -30.14],[1.77, -30.11],[1.71, -30.16],[1.14, -30.03],[0.93, -30.07],[0.42, -30.37],[-0.01, -30.52],[-0.35, -30.56],[-0.61, -30.47],[-0.74, -30.53],[-1.02, -30.47],[-1.07, -30.42],[-1.12, -30.45],[-1.26, -30.45],[-1.40, -30.51],[-1.79, -30.49],[-1.90, -30.31],[-1.98, -30.27],[-2.15, -30.26],[-2.30, -30.26],[-2.38, -30.31],[-2.49, -30.33],[-2.54, -30.29],[-2.60, -30.29],[-2.66, -30.43],[-2.58, -30.46],[-2.59, -30.51],[-2.67, -30.56],[-2.77, -30.53],[-2.77, -30.60],[-2.72, -30.66],[-2.75, -30.74],[-2.93, -30.78],[-3.25, -31.04],[-3.33, -30.99],[-3.30, -30.91],[-3.31, -30.77],[-3.23, -30.73],[-3.23, -30.59],[-3.29, -30.56],[-3.36, -30.59],[-3.60, -30.48],[-3.68, -30.49],[-3.74, -30.53],[-3.81, -30.51],[-3.84, -30.53],[-3.84, -30.56],[-4.83, -30.37],[-5.11, -30.38],[-5.26, -30.55],[-6.17, -30.56],[-6.44, -30.63],[-6.60, -30.72],[-6.65, -30.80],[-6.59, -30.93],[-6.48, -31.05],[-6.41, -31.22],[-6.44, -31.33],[-6.52, -31.33],[-6.57, -31.32],[-6.61, -31.26],[-6.61, -31.08],[-6.73, -31.02],[-6.86, -31.16],[-7.02, -31.18],[-7.09, -31.13],[-7.15, -31.13],[-7.19, -31.16],[-7.19, -31.12],[-7.22, -31.11],[-7.28, -31.15],[-7.33, -31.06],[-7.40, -31.05],[-7.55, -31.12],[-7.62, -31.12],[-7.61, -31.08],[-7.58, -30.98],[-7.76, -30.96],[-7.89, -31.11],[-8.04, -31.18],[-8.09, -31.24],[-8.22, -31.18],[-8.27, -31.26],[-8.28, -31.30],[-8.20, -31.36],[-8.22, -31.45],[-8.35, -31.46],[-8.37, -31.52],[-8.27, -31.64],[-8.33, -31.68],[-8.34, -31.77],[-8.40, -31.79],[-8.42, -31.83],[-8.39, -31.89],[-8.47, -31.97],[-8.47, -32.04],[-8.53, -32.04],[-8.55, -32.20],[-8.68, -32.48],[-8.78, -32.52],[-9.06, -32.42],[-9.16, -32.41],[-9.36, -31.83],[-8.40, -30.92],[-7.77, -30.48],[-7.42, -30.04],[-6.72, -29.37],[-6.18, -29.43],[-6.12, -29.86],[-5.65, -30.11],[-5.35, -29.52],[-5.06, -29.08],[-4.74, -28.79],[-3.73, -28.94],[-3.40, -29.22],[-2.42, -28.96],[-0.79, -29.58],[-0.10, -30.01],[0.98, -29.85],[1.68, -29.62],[2.43, -29.93],[3.09, -30.29],[3.46, -30.82],[4.20, -31.38],[4.89, -32.41],[5.50, -32.54],[5.99, -32.89],[6.35, -33.30]],
            /*Sausan Garrison*/[[10.92, -36.16],[11.13, -35.47],[11.59, -34.87],[11.58, -34.57],[11.22, -34.42],[10.78, -33.59],[10.76, -33.33],[10.94, -32.77],[11.20, -32.51],[10.98, -32.51],[13.30, -31.45],[14.27, -30.98],[14.31, -31.07],[14.57, -31.12],[15.02, -31.02],[15.91, -31.33],[17.06, -31.55],[17.35, -31.65],[17.78, -32.30],[18.08, -32.43],[18.40, -32.71],[18.40, -32.83],[18.92, -33.21],[19.33, -33.46],[19.57, -33.50],[21.19, -32.95],[22.63, -32.41],[23.35, -32.04],[25.00, -31.90],[26.68, -31.78],[28.70, -31.45],[30.08, -31.42],[30.68, -31.51],[30.58, -31.85],[30.35, -32.05],[30.26, -32.09],[30.15, -32.20],[30.08, -32.23],[30.05, -32.17],[30.10, -32.08],[30.11, -31.98],[30.15, -31.86],[30.27, -31.85],[30.29, -31.72],[30.35, -31.68],[30.30, -31.58],[30.27, -31.59],[30.27, -31.65],[30.12, -31.58],[29.70, -31.57],[28.92, -31.66],[28.83, -31.79],[28.07, -31.93],[27.81, -32.05],[25.82, -32.26],[25.54, -32.36],[25.13, -32.37],[24.98, -32.43],[24.44, -32.46],[24.22, -32.48],[24.23, -32.55],[24.06, -32.57],[24.05, -32.55],[23.90, -32.46],[23.85, -32.50],[23.66, -32.43],[23.23, -32.43],[22.98, -32.49],[22.68, -32.61],[22.53, -32.82],[22.42, -32.79],[22.14, -33.13],[21.50, -33.38],[21.36, -33.39],[21.12, -33.65],[20.80, -33.65],[20.51, -33.81],[20.43, -33.77],[20.43, -33.77],[20.21, -33.91],[20.15, -33.88],[20.05, -33.94],[20.05, -33.94],[20.12, -33.99],[20.11, -34.05],[19.98, -34.04],[19.90, -34.16],[19.93, -34.22],[19.73, -34.28],[19.68, -34.22],[19.54, -34.23],[19.49, -34.27],[19.36, -34.26],[19.24, -34.12],[19.20, -34.12],[19.03, -34.15],[19.05, -34.08],[19.03, -34.03],[18.91, -34.01],[18.81, -33.82],[18.82, -33.72],[18.57, -33.36],[18.45, -33.29],[18.42, -33.07],[18.29, -33.06],[18.03, -32.61],[17.91, -32.58],[17.78, -32.42],[17.72, -32.42],[17.62, -32.49],[17.23, -32.38],[17.17, -32.29],[16.99, -32.24],[16.95, -32.19],[16.84, -32.17],[16.76, -32.25],[16.57, -32.17],[16.56, -32.02],[16.50, -31.97],[16.42, -31.97],[16.35, -32.00],[16.32, -32.09],[16.25, -32.09],[16.06, -31.98],[15.94, -32.01],[15.85, -31.96],[15.78, -31.97],[15.62, -31.82],[15.47, -31.81],[15.37, -31.74],[15.16, -31.55],[14.97, -31.47],[14.80, -31.52],[14.69, -31.53],[14.35, -31.65],[14.04, -31.83],[13.81, -31.89],[13.63, -32.04],[13.43, -32.11],[13.21, -32.27],[13.03, -32.24],[12.70, -32.35],[12.55, -32.33],[12.44, -32.34],[12.41, -32.39],[12.41, -32.45],[12.36, -32.46],[12.28, -32.39],[12.19, -32.40],[12.09, -32.43],[12.06, -32.53],[12.01, -32.60],[11.93, -32.59],[11.86, -32.68],[11.69, -32.79],[11.72, -32.88],[11.84, -32.94],[11.98, -32.93],[12.02, -32.98],[11.99, -33.04],[12.02, -33.06],[12.13, -33.05],[12.27, -33.10],[12.39, -33.20],[12.48, -33.32],[12.47, -33.38],[12.42, -33.38],[12.37, -33.46],[12.42, -33.51],[12.45, -33.60],[12.41, -33.65],[12.51, -33.86],[12.57, -33.87],[12.59, -33.98],[12.65, -34.12],[12.62, -34.20],[12.57, -34.09],[12.52, -34.10],[12.43, -34.05],[12.35, -34.11],[12.26, -34.09],[12.23, -34.18],[12.12, -34.21],[12.09, -34.30],[12.17, -34.36],[12.13, -34.42],[12.20, -34.44],[12.21, -34.50],[12.27, -34.50],[12.32, -34.52],[12.32, -34.59],[12.38, -34.59],[12.46, -34.66],[12.49, -34.67],[12.58, -34.60],[12.57, -34.54],[12.63, -34.49],[12.68, -34.51],[12.70, -34.49],[12.71, -34.38],[12.68, -34.29],[12.74, -34.30],[12.84, -34.50],[12.77, -34.70],[12.79, -34.73],[12.71, -34.74],[12.64, -34.85],[12.66, -34.91],[12.68, -34.91],[12.70, -34.95],[12.62, -34.99],[12.62, -35.05],[12.52, -35.19],[12.47, -35.18],[12.40, -35.21],[12.38, -35.25],[12.32, -35.24],[12.27, -35.29],[12.28, -35.36],[12.31, -35.39],[12.30, -35.45],[12.40, -35.44],[12.40, -35.51],[12.50, -35.54],[12.56, -35.52],[12.56, -35.56],[12.62, -35.58],[12.65, -35.58],[12.67, -35.66],[12.61, -35.69],[12.55, -35.66],[12.54, -35.72],[12.62, -35.78],[12.81, -35.82],[12.83, -35.73],[12.89, -35.75],[12.95, -35.69],[13.02, -35.73],[13.09, -35.70],[13.23, -35.74],[13.23, -35.76],[13.35, -35.79],[13.39, -35.73],[13.51, -35.77],[13.55, -35.82],[13.52, -35.87],[13.47, -35.84],[13.44, -35.84],[13.40, -35.90],[13.04, -35.97],[12.58, -36.02],[12.60, -36.16],[12.63, -36.18],[12.66, -36.15],[12.66, -36.08],[12.69, -36.07],[13.11, -36.02],[13.22, -36.30],[13.36, -36.31],[13.36, -36.40],[13.30, -36.40],[13.13, -36.48],[13.19, -36.55],[13.00, -36.65],[12.83, -36.68],[12.51, -36.66],[12.34, -36.58],[12.17, -36.48],[12.06, -36.48],[12.06, -36.41],[11.86, -36.30],[11.67, -36.29],[11.61, -36.35],[11.61, -36.41],[11.34, -36.21],[11.17, -36.19],[11.16, -36.14],[11.06, -36.14],[10.99, -36.17]],
            ]]
            }                
        },
    {
        "type":"Feature",
        "id":"9",
        "properties":
            {
            "name_EN":"Foot of Terrmian Mountain ~ Epheria ~ Northwestern Calpheon",
            "name_KR":"테르미안 산기슭 ~ 에페리아 ~ 칼페온 서북부",
            "fishGroup": ["Bigeye", "Pintado", "Dolphinfish", "FlyingFish", "FourfingerThreadfin", "Mullet", "MackerelPike", "Saurel", "Surfperch"],
            "locationColor": "#909090",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Foot of Terrmian Mountain ~ Epheria*/[[-18.35, -41.33],[-18.40, -41.17],[-18.33, -41.13],[-18.31, -41.03],[-18.13, -40.92],[-18.20, -40.84],[-18.32, -40.86],[-18.77, -40.73],[-18.82, -40.67],[-18.67, -40.57],[-18.74, -40.51],[-18.84, -40.25],[-18.73, -40.16],[-18.79, -40.12],[-18.87, -40.14],[-19.03, -40.01],[-19.07, -39.95],[-19.03, -39.91],[-18.92, -39.86],[-18.80, -39.87],[-18.80, -39.92],[-18.75, -39.95],[-18.69, -39.94],[-18.63, -39.99],[-18.69, -40.04],[-18.52, -40.07],[-18.41, -40.03],[-18.34, -40.05],[-18.23, -39.99],[-18.09, -40.07],[-17.86, -40.33],[-17.89, -40.46],[-17.81, -40.58],[-17.76, -40.55],[-17.76, -40.45],[-17.68, -40.34],[-17.72, -40.12],[-17.57, -39.90],[-17.68, -39.55],[-17.61, -39.49],[-17.35, -39.44],[-17.24, -39.34],[-17.43, -39.18],[-17.37, -39.14],[-17.31, -39.13],[-17.08, -38.95],[-16.67, -38.38],[-16.69, -38.11],[-17.01, -37.90],[-17.03, -37.80],[-16.99, -37.74],[-16.78, -37.71],[-16.61, -37.52],[-16.58, -37.04],[-16.27, -36.62],[-16.00, -36.16],[-15.91, -35.68],[-15.75, -35.55],[-15.67, -35.41],[-15.49, -35.35],[-15.40, -35.39],[-15.22, -35.23],[-14.86, -35.12],[-14.63, -34.88],[-14.30, -34.81],[-13.91, -34.60],[-13.67, -34.33],[-13.17, -34.20],[-13.24, -34.10],[-13.18, -33.95],[-12.84, -33.99],[-12.79, -34.05],[-12.69, -34.05],[-12.27, -33.93],[-12.22, -33.84],[-11.86, -33.74],[-11.75, -33.78],[-11.27, -33.66],[-11.41, -33.53],[-11.49, -33.55],[-11.58, -33.50],[-11.59, -33.39],[-11.51, -33.34],[-11.61, -33.28],[-11.71, -33.11],[-11.69, -32.93],[-11.62, -32.72],[-11.41, -32.64],[-11.07, -32.67],[-10.88, -32.75],[-10.81, -32.72],[-10.66, -32.83],[-10.55, -32.93],[-10.43, -32.97],[-10.29, -32.83],[-10.36, -32.68],[-10.30, -32.63],[-10.15, -32.67],[-10.05, -32.57],[-9.80, -32.44],[-9.79, -32.38],[-9.70, -32.31],[-9.43, -32.39],[-9.24, -32.41],[-9.42, -31.87],[-9.74, -32.11],[-10.51, -32.44],[-11.80, -32.44],[-12.19, -33.25],[-12.83, -33.72],[-13.91, -33.87],[-16.16, -35.04],[-16.92, -35.90],[-17.35, -36.86],[-17.80, -37.66],[-18.10, -38.53],[-18.32, -39.42],[-19.13, -39.67],[-19.67, -40.36],[-20.24, -40.48],[-20.99, -39.85],[-21.35, -39.70],[-21.25, -39.77],[-21.25, -39.89],[-20.54, -40.86],[-20.46, -41.15],[-20.13, -41.35],[-19.85, -41.44],[-19.42, -41.42],[-19.19, -41.36],[-19.05, -41.38],[-19.03, -41.41],[-18.67, -41.48],[-18.59, -41.57],[-18.63, -41.59],[-18.61, -41.63],[-18.33, -41.50],[-18.39, -41.39]],
            /*Northwestern Calpheon*/[[-22.82, -39.59],[-23.21, -39.44],[-24.36, -39.44],[-25.73, -39.68],[-26.27, -40.76],[-27.13, -41.22],[-27.62, -41.86],[-27.52, -42.21],[-27.53, -42.34],[-27.84, -42.52],[-27.91, -43.06],[-28.09, -43.23],[-28.27, -43.27],[-27.92, -43.51],[-28.20, -43.82],[-29.60, -44.53],[-29.50, -44.49],[-29.33, -44.48],[-29.23, -44.36],[-29.16, -44.35],[-29.14, -44.39],[-28.85, -44.44],[-28.79, -44.47],[-28.77, -44.54],[-28.64, -44.60],[-28.61, -44.73],[-28.66, -44.77],[-28.62, -44.82],[-28.51, -44.78],[-28.45, -44.79],[-28.46, -44.83],[-28.53, -44.89],[-28.56, -44.84],[-28.62, -44.87],[-28.66, -44.95],[-28.61, -45.03],[-28.49, -45.04],[-28.50, -45.08],[-28.43, -45.09],[-28.35, -45.04],[-28.08, -45.07],[-27.91, -45.06],[-27.50, -44.58],[-27.39, -44.20],[-27.41, -43.86],[-27.44, -43.82],[-27.50, -43.85],[-27.63, -43.73],[-27.52, -43.66],[-27.39, -43.65],[-27.34, -43.63],[-27.34, -43.57],[-27.26, -43.50],[-27.16, -43.49],[-27.21, -43.34],[-27.17, -43.22],[-27.37, -43.18],[-27.36, -43.36],[-27.47, -43.50],[-27.63, -43.48],[-27.76, -43.42],[-27.81, -43.31],[-27.77, -43.24],[-27.78, -43.02],[-27.64, -42.95],[-27.52, -43.01],[-27.52, -42.95],[-27.69, -42.80],[-27.69, -42.74],[-27.78, -42.56],[-27.60, -42.43],[-27.37, -42.41],[-27.21, -42.45],[-27.15, -42.42],[-27.19, -42.35],[-27.34, -42.35],[-27.41, -42.27],[-27.41, -42.17],[-27.32, -42.15],[-27.31, -42.06],[-27.21, -41.93],[-27.06, -41.90],[-27.05, -41.83],[-26.94, -41.73],[-26.87, -41.73],[-26.85, -41.63],[-26.77, -41.56],[-26.64, -41.53],[-26.58, -41.57],[-26.27, -41.62],[-26.15, -41.55],[-26.09, -41.55],[-25.97, -41.39],[-25.90, -41.34],[-25.89, -41.21],[-25.96, -41.18],[-25.97, -41.10],[-25.96, -41.06],[-25.86, -41.00],[-25.81, -41.01],[-25.72, -41.07],[-25.54, -40.85],[-25.49, -40.79],[-25.55, -40.72],[-25.18, -40.22],[-25.18, -40.08],[-24.88, -39.87],[-24.69, -39.84],[-24.65, -39.87],[-24.52, -39.82],[-24.43, -39.85],[-24.40, -39.79],[-24.16, -39.74],[-24.10, -39.78],[-23.23, -39.73]],
        ]]
            }                
        },


    {
        "type":"Feature",
        "id":"10",
        "properties":
            {
            "name_EN":"Olvia Sea",
            "name_KR":"올비아 해역",
            "fishGroup": ["BlueBatStar", "Corvina", "SmokeyChromis", "TapertailAnchovy", "ScorpionFish", "Butterflyfish", "Dolphinfish", "Skipjack", "Saurel", "Squid", "StripedCatfish", "Filefish", "Bluefish", "Flatfish", "Clownfish", "Surfperch", "harpoon", "BlackSpottedDolphin", "KillerWhale", "CheckerboardWrasse", "Swordfish", "TapertailAnchovy", "Squid"],
            "locationColor": "#3DA921",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Olvia Sea*/[[1.67, -29.59],[1.61, -29.20],[0.15, -28.16],[-1.00, -26.63],[-1.10, -25.78],[-0.55, -24.64],[0.65, -23.28],[1.33, -22.89],[0.60, -22.66],[-1.38, -20.30],[-2.66, -19.54],[-4.65, -20.64],[-5.91, -20.73],[-7.35, -21.08],[-10.58, -22.61],[-9.71, -24.78],[-9.90, -26.75],[-10.33, -27.98],[-11.24, -29.28],[-10.71, -30.60],[-9.38, -31.76],[-8.46, -30.91],[-7.81, -30.45],[-7.47, -30.02],[-6.75, -29.33],[-6.14, -29.40],[-6.08, -29.84],[-5.67, -30.05],[-5.38, -29.47],[-5.10, -29.04],[-4.76, -28.74],[-3.70, -28.90],[-3.39, -29.16],[-2.43, -28.91],[-0.77, -29.54],[-0.08, -29.96],[0.96, -29.81]],
            /*Staren Island[[-9.24, -27.25],[-9.66, -28.58],[-9.11, -29.18],[-7.93, -29.13],[-7.06, -28.25],[-7.38, -27.23]],*/
            /*Lisz Island[[-9.53, -22.50],[-9.35, -23.27],[-8.12, -24.77],[-7.08, -24.88],[-5.50, -23.76],[-6.21, -22.39],[-9.06, -22.02]],*/
            /*Louruve Island[[-5.98, -24.94],[-6.83, -26.44],[-6.51, -27.01],[-4.93, -27.05],[-4.36, -26.35],[-4.58, -24.85]],*/
            /*Marka Island[[-4.17, -25.09],[-4.00, -26.27],[-2.74, -26.14],[-1.81, -25.37],[-2.08, -23.82],[-3.25, -23.84]],*/
            /*Narvo Island[[-3.65, -20.36],[-4.31, -21.64],[-4.02, -22.47],[-2.20, -22.47],[-1.72, -21.77],[-2.40, -20.40]],*/
        ]]
            }                
        },
    {
        "type":"Feature",
        "id":"11",
        "properties":
            {
            "name_EN":"Balenos Islands",
            "name_KR":"발레노스 군도",
            "fishGroup": ["Nibbler", "Grunt", "Moray", "Butterflyfish", "Dolphinfish", "Skipjack", "Saurel", "Squid", "StripedCatfish", "Filefish", "Bluefish", "Flatfish", "Clownfish", "Surfperch", "harpoon", "KillerWhale", "Mackereltuna", "Pomfret", "Siganid", "Skipjack"],
            "locationColor": "#97F18D",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Balenos Islands*/[[1.39, -22.91],[1.87, -22.81],[2.93, -22.72],[4.05, -21.68],[4.99, -21.43],[8.23, -21.50],[9.21, -21.80],[11.12, -25.15],[11.86, -26.96],[12.15, -28.33],[12.78, -29.22],[13.53, -29.75],[14.15, -30.57],[14.25, -30.94],[10.93, -32.48],[10.68, -32.70],[10.51, -32.92],[10.37, -33.30],[9.53, -34.06],[9.27, -34.10],[8.08, -34.09],[6.93, -33.76],[6.05, -32.85],[5.49, -32.46],[4.94, -32.35],[4.26, -31.34],[3.50, -30.77],[3.14, -30.23],[2.47, -29.87],[1.75, -29.58],[1.67, -29.14],[0.20, -28.11],[-0.93, -26.61],[-1.03, -25.79],[-0.49, -24.67],[0.70, -23.31]],
            /*Angie Island[[0.34, -25.64],[0.36, -26.33],[1.21, -27.13],[1.87, -27.12],[2.69, -25.41],[1.65, -24.92],[0.65, -25.13]],*/
            /*Balvege Island[[3.75, -23.00],[3.58, -23.72],[3.99, -24.34],[4.60, -24.49],[5.03, -24.34],[5.31, -23.31],[4.90, -22.92]],*/
            /*Marlene Island[[6.17, -23.16],[6.31, -24.23],[7.06, -24.58],[7.43, -24.50],[7.55, -24.07],[7.05, -22.93]],*/
            /*Duch Island[[2.09, -27.24],[2.37, -27.78],[3.29, -27.99],[3.80, -28.68],[4.69, -28.64],[4.93, -28.34],[4.48, -27.42],[3.38, -26.78]],*/
            /*Eveto Island[[4.56, -25.41],[4.90, -25.40],[5.78, -26.43],[5.82, -27.50],[5.38, -28.07],[4.81, -27.82],[4.32, -26.76],[3.97, -26.44],[3.97, -26.06]],*/
            /*Mariveno Island[[10.10, -26.06],[10.58, -26.59],[10.52, -27.22],[9.96, -27.32],[9.46, -27.11],[9.31, -26.36]],*/
            /*Luivano Island[[7.18, -30.22],[7.39, -30.63],[8.28, -31.78],[8.89, -31.77],[10.09, -29.75],[8.97, -28.82],[7.95, -28.85]],*/
            /*Ephde Rune Island[[12.32, -30.48],[12.32, -31.22],[12.69, -31.54],[13.10, -31.36],[13.11, -30.63],[12.65, -30.35]],*/
        ]]
            }                
        },
    {
        "type":"Feature",
        "id":"12",
        "properties":
            {
            "name_EN":"Cron Islands",
            "name_KR":"크론 군도",
            "fishGroup": ["BlueBatStar", "Corvina", "Nibbler", "Grunt", "Moray", "Butterflyfish", "Dolphinfish", "Skipjack", "Saurel", "Squid", "StripedCatfish", "Filefish", "Bluefish", "Flatfish", "Clownfish", "Surfperch", "harpoon", "BlackSpottedDolphin", "KillerWhale", "BigeyeTuna", "Maomao", "Swellfish", "Skipjack"],
            "locationColor": "#52BE80",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Cron Islands*/[[9.27, -21.74],[10.88, -18.76],[11.65, -18.17],[12.62, -17.66],[13.84, -19.02],[14.36, -19.02],[15.82, -20.63],[16.91, -21.21],[17.53, -21.83],[17.18, -22.45],[17.25, -23.32],[17.39, -23.60],[18.35, -24.29],[20.14, -24.25],[27.17, -26.23],[27.00, -26.67],[25.30, -27.12],[23.18, -27.29],[21.96, -27.66],[21.14, -28.08],[20.63, -28.81],[19.41, -29.61],[18.49, -29.60],[17.35, -31.57],[17.03, -31.47],[15.92, -31.25],[15.01, -30.94],[14.57, -31.04],[14.38, -31.00],[14.24, -30.53],[13.60, -29.69],[12.85, -29.15],[12.22, -28.29],[11.94, -26.93],[11.19, -25.12]],
            // /*Protty Cave(1)*/[[15.14, -24.56],[15.29, -24.64],[15.42, -24.62],[15.43, -24.48]],
            /*Protty Cave(1)*/[[15.34, -24.63],[15.32, -24.51],[15.42, -24.48],[15.42, -24.61]],
            /*Protty Cave(2)*/[[15.95, -24.90],[15.98, -25.08],[16.08, -25.08],[16.21, -24.99],[16.00, -24.87]],
            /*Protty Cave(3)*/[[15.63, -25.78],[15.60, -25.96],[15.48, -26.10],[15.33, -26.04],[15.06, -26.16],[14.88, -26.04],[14.93, -25.91],[15.34, -25.84],[15.45, -25.80],[15.54, -25.76]],
            /*Protty Cave(4)*/[[14.99, -24.53],[15.00, -24.50],[15.13, -24.52],[15.07, -24.56]],
            /*Protty Cave(surfperch area 1)*/[[15.14, -24.56],[15.29, -24.64],[15.34, -24.63],[15.32, -24.51]],
            /*Protty Cave(surfperch area 2)*/[[14.95, -24.50],[14.97, -24.47],[14.83, -24.36],[15.00, -24.26],[14.95, -24.21],[14.74, -24.34],[14.78, -24.40]],

            /*Baremi Island[[11.76, -20.61],[11.58, -22.10],[12.41, -23.03],[13.62, -23.10],[14.10, -22.62],[14.10, -21.87],[13.15, -20.44]],*/
            /*Weita Island[[13.57, -24.14],[13.24, -24.92],[14.22, -25.38],[15.97, -24.97],[16.10, -24.27],[14.95, -23.68]],*/
            /*Paratama Island[[15.11, -26.75],[13.39, -27.77],[13.38, -28.14],[15.35, -29.09],[16.48, -28.71],[16.63, -28.27],[16.26, -27.34]],*/
            /*Kanvera Island[[18.19, -25.55],[18.13, -26.13],[18.52, -26.45],[19.53, -25.86],[19.80, -25.43],[19.59, -25.07],[18.66, -25.15]],*/
            /*Arakil Island[[19.25, -26.62],[19.30, -27.47],[20.02, -27.72],[20.59, -27.47],[20.42, -26.34],[19.80, -26.30]],*/
        ]]
            }                
        },


    {
        "type":"Feature",
        "id":"13",
        "properties":
            {
            "name_EN":"Peyon Sea",
            "name_KR":"피욘 해역",
            "fishGroup": ["Footballfish", "BlueBatStar", "Corvina", "Nibbler", "AtkaMackerel", "Cero", "Gurnard", "Bigeye", "Pintado", "Dolphinfish", "FlyingFish", "FourfingerThreadfin", "Mullet", "MackerelPike", "Saurel", "Surfperch", "harpoon", "BlackSpottedDolphin", "Hammerhead", "WhaleShark", "AtkaMackerel", "Cero", "Flounder"],
            "locationColor": "#3077FC",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Peyon Sea*/[[-32.76, -47.79],[-35.02, -47.79],[-35.94, -48.74],[-40.39, -48.74],[-36.86, -38.09],[-32.51, -29.99],[-31.78, -29.46],[-30.90, -29.09],[-29.16, -29.10],[-28.13, -29.94],[-28.13, -30.33],[-26.39, -33.39],[-25.36, -33.93],[-24.04, -33.96],[-24.04, -34.20],[-23.30, -34.88],[-22.67, -36.51],[-22.89, -37.60],[-22.34, -39.50],[-22.45, -39.40],[-22.52, -39.42],[-22.50, -39.50],[-22.69, -39.57],[-23.18, -39.37],[-24.37, -39.37],[-25.82, -39.62],[-26.36, -40.71],[-27.21, -41.17],[-27.71, -41.84],[-27.65, -42.08],[-27.81, -42.07],[-27.82, -42.13],[-27.93, -42.13],[-28.00, -42.21],[-28.06, -42.21],[-28.10, -42.37],[-28.05, -42.50],[-27.97, -42.51],[-28.00, -42.85],[-28.11, -42.83],[-28.38, -42.94],[-28.47, -43.02],[-28.47, -43.11],[-28.42, -43.16],[-28.47, -43.19],[-28.38, -43.29],[-28.05, -43.52],[-28.28, -43.79],[-29.70, -44.50],[-29.78, -44.68],[-29.99, -44.70],[-30.04, -44.73],[-30.17, -44.74],[-30.27, -44.77],[-30.34, -44.83],[-30.51, -44.91],[-30.76, -44.86],[-30.81, -44.86],[-31.03, -45.07],[-31.07, -45.04],[-31.05, -44.97],[-31.12, -44.88],[-31.22, -44.88],[-31.28, -44.93],[-31.29, -44.98],[-31.46, -45.09],[-31.38, -45.16],[-31.39, -45.18],[-31.50, -45.24],[-31.57, -45.24],[-31.61, -45.26],[-31.70, -45.33],[-31.75, -45.30],[-31.85, -45.37],[-31.74, -45.47],[-31.85, -45.59],[-31.91, -45.59],[-31.97, -45.63],[-32.00, -45.72],[-32.12, -45.82],[-32.12, -45.88],[-32.01, -45.96],[-31.94, -45.99],[-31.89, -46.07],[-31.91, -46.13],[-31.99, -46.19],[-32.08, -46.19],[-32.12, -46.27],[-32.11, -46.46],[-32.19, -46.50],[-32.18, -46.54],[-32.21, -46.61],[-32.19, -46.68],[-32.23, -46.80],[-32.23, -46.98],[-32.34, -47.05],[-32.44, -47.15],[-32.51, -47.26],[-32.58, -47.35],[-32.56, -47.49],[-32.58, -47.53],[-32.77, -47.63],[-32.81, -47.72],[-32.81, -47.75]],
            /*Teyamal Island[[-31.67, -36.15],[-30.94, -36.24],[-30.45, -37.40],[-30.43, -38.24],[-30.97, -38.45],[-32.03, -38.37],[-32.64, -37.58]],*/
            /*Rameda Island[[-31.18, -30.64],[-30.03, -30.58],[-29.17, -31.05],[-29.16, -32.19],[-28.82, -33.33],[-30.00, -33.50],[-30.92, -32.83],[-31.50, -31.13]],*/
            /*Theonil Island, Modric Island[[-27.61, -32.93],[-26.58, -33.49],[-25.51, -35.39],[-25.53, -36.47],[-27.98, -36.59],[-28.89, -36.31],[-29.08, -34.80]],*/
            /*Baeza Island[[-24.50, -35.19],[-25.02, -36.50],[-24.77, -37.40],[-23.83, -37.55],[-23.15, -36.88],[-23.81, -35.17]],*/
        ]]
            }                
        },
    {
        "type":"Feature",
        "id":"14",
        "properties":
            {
            "name_EN":"Epheria Sea",
            "name_KR":"에페리아 해역",
            "fishGroup": ["Footballfish", "BlueBatStar", "Corvina", "Porgy", "SmokeyChromis", "Tuna", "Maomao", "ScorpionFish", "Bigeye", "Pintado", "Dolphinfish", "FlyingFish", "FourfingerThreadfin", "Mullet", "MackerelPike", "Saurel", "Surfperch", "harpoon", "BlackSpottedDolphin", "WhaleShark", "SawShark", "Maomao", "JohnDory", "Mullet"],
            "locationColor": "#54B4D6",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Epheria Sea*/[[-22.25, -39.49],[-22.79, -37.60],[-22.58, -36.50],[-23.22, -34.84],[-23.98, -34.14],[-23.97, -33.95],[-23.42, -33.96],[-21.08, -32.02],[-17.43, -32.02],[-15.92, -33.91],[-15.23, -34.08],[-14.92, -34.17],[-14.84, -34.26],[-16.23, -34.98],[-17.00, -35.85],[-17.46, -36.85],[-17.90, -37.64],[-18.19, -38.50],[-18.41, -39.36],[-19.20, -39.61],[-19.73, -40.30],[-20.22, -40.39],[-20.90, -39.80],[-21.43, -39.58],[-21.49, -39.53],[-21.42, -39.48],[-21.76, -39.43],[-21.96, -39.47],[-22.09, -39.58],[-22.14, -39.51],[-22.25, -39.49]],
            /*Randis Island, Serca Island[[-19.64, -33.51],[-18.41, -33.74],[-18.54, -35.65],[-18.94, -35.82],[-18.80, -36.68],[-19.60, -37.56],[-20.35, -37.18],[-20.83, -35.96],[-20.45, -35.71],[-20.65, -34.26]],*/
        ]]
            }                
        },


    {
        "type":"Feature",
        "id":"15",
        "properties":
            {
            "name_EN":"Zenato Sea",
            "name_KR":"제나토 해역",
            "fishGroup": ["GoldenAlbacore", "GoldenSeaBass", "Cero", "BlackMarlin", "Bigeye", "Pintado", "Dolphinfish", "FlyingFish", "FourfingerThreadfin", "Mullet", "MackerelPike", "Saurel", "Surfperch", "harpoon", "BlackSpottedDolphin", "WhiteShark", "WhaleShark", "Cero", "BlackMarlin", "Beltfish"],
            "locationColor": "#D35400",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Zenato Sea*/[[-28.21, -17.02],[-27.85, -16.49],[-22.28, -10.48],[-19.94, -8.96],[-18.41, -8.35],[-16.96, -8.10],[-15.21, -7.07],[-7.00, -7.42],[-4.89, -7.75],[-1.77, -7.36],[-0.68, -7.10],[-1.36, -7.67],[-1.36, -7.93],[-1.61, -8.37],[-1.63, -8.75],[-1.88, -9.54],[-2.48, -10.41],[-9.67, -16.19],[-11.41, -17.42],[-13.83, -17.42],[-15.80, -17.09],[-16.98, -17.23],[-18.76, -17.70],[-19.39, -18.03],[-19.97, -18.97],[-20.64, -19.68],[-21.38, -19.87],[-23.33, -17.99],[-23.82, -17.88],[-25.51, -17.09]],
            /*Kuit Islands, Almai Island[[-22.04, -18.18],[-21.95, -19.00],[-20.75, -19.30],[-20.05, -18.91],[-19.46, -17.84],[-18.06, -17.35],[-17.35, -16.32],[-16.44, -15.98],[-15.15, -16.45],[-13.70, -15.79],[-9.47, -15.41],[-8.44, -14.86],[-7.92, -13.91],[-9.83, -11.08],[-13.62, -9.97],[-15.13, -10.19],[-15.64, -10.98],[-16.31, -11.00],[-16.75, -10.34],[-19.23, -9.51],[-20.37, -9.89],[-21.67, -12.62],[-21.32, -13.74],[-22.30, -14.59],[-22.59, -16.37],[-21.91, -17.27]],*/
        ]]
            }                
        },
    {
        "type":"Feature",
        "id":"16",
        "properties":
            {
            "name_EN":"Banto Sea",
            "name_KR":"반토 해역",
            "fishGroup": ["GoldenAlbacore", "GoldenSeaBass", "Herring", "Sailfish", "Bigeye", "Pintado", "Dolphinfish", "FlyingFish", "FourfingerThreadfin", "Mullet", "MackerelPike", "Saurel", "Surfperch", "harpoon", "BlackSpottedDolphin", "GaleocerdoCuvier", "WhaleShark", "Herring", "Sailfish", "Amberjack"],
            "locationColor": "#FF9800",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Banto Sea*/[[-32.42, -29.83],[-31.90, -28.78],[-31.83, -27.86],[-31.98, -27.48],[-32.10, -23.68],[-30.38, -19.33],[-28.23, -17.08],[-25.51, -17.15],[-23.84, -17.96],[-23.37, -18.07],[-21.40, -19.98],[-20.59, -19.74],[-19.91, -19.05],[-19.33, -18.10],[-18.75, -17.77],[-16.94, -17.31],[-15.78, -17.18],[-13.84, -17.51],[-11.37, -17.50],[-9.57, -16.26],[-2.47, -10.50],[-0.38, -14.88],[-0.38, -15.88],[-0.69, -16.85],[-2.69, -19.48],[-4.66, -20.56],[-5.93, -20.66],[-7.38, -21.01],[-10.61, -22.54],[-17.23, -24.69],[-18.67, -24.74],[-20.64, -24.31],[-22.52, -23.42],[-23.92, -23.41],[-25.23, -24.14],[-26.34, -25.25],[-26.87, -26.37],[-27.93, -29.60],[-28.12, -29.86],[-29.16, -29.01],[-30.92, -29.01],[-31.83, -29.39]],
            /*Teste Island[[-25.39, -22.61],[-24.84, -20.58],[-25.36, -19.36],[-24.96, -18.68],[-23.88, -18.11],[-23.42, -18.16],[-21.61, -20.42],[-21.62, -21.93],[-24.27, -22.96]],*/
            /*Padix Island[[-20.19, -19.68],[-20.40, -21.27],[-18.74, -23.02],[-15.83, -23.67],[-15.12, -23.53],[-11.91, -21.71],[-10.94, -20.17],[-13.00, -17.88],[-15.82, -17.27],[-16.91, -17.38],[-18.73, -17.82],[-19.27, -18.12]],*/
            /*Arita Island[[-10.89, -18.35],[-10.94, -19.38],[-10.38, -19.72],[-6.51, -20.26],[-5.87, -19.56],[-5.94, -15.80],[-7.03, -15.24]],*/
            /*Padix Island*/[[-13.64, -19.68],[-13.69, -19.54],[-13.84, -19.49],[-14.05, -19.66],[-13.98, -19.78]],
            /*Padix Island*/[[-17.16, -18.18],[-16.98, -18.58],[-17.08, -18.74],[-17.00, -18.97],[-16.35, -19.04],[-16.18, -18.96],[-16.03, -18.91],[-15.69, -18.88],[-15.48, -18.99],[-15.48, -19.04],[-15.77, -19.24],[-15.75, -19.44],[-15.70, -19.51],[-15.32, -19.83],[-14.73, -20.12],[-14.36, -20.64],[-14.19, -20.63],[-14.17, -20.48],[-14.01, -20.50],[-14.15, -20.70],[-14.33, -20.81],[-14.85, -20.54],[-14.99, -20.24],[-15.64, -19.98],[-15.81, -19.64],[-15.89, -19.25],[-16.76, -19.16],[-16.91, -19.22],[-17.13, -19.01],[-17.22, -18.84],[-17.40, -18.89],[-17.50, -18.70],[-17.34, -18.67],[-17.24, -18.62],[-17.25, -18.45],[-17.36, -18.24]],
        ]]
            }                
        },
    {
        "type":"Feature",
        "id":"17",
        "properties":
            {
            "name_EN":"Ahrmo Sea",
            "name_KR":"아르모 해역",
            "fishGroup": ["GoldenAlbacore", "GoldenSeaBass", "SeaBass", "PorcupineFish", "Swellfish", "Ray", "Bigeye", "Pintado", "Dolphinfish", "FlyingFish", "FourfingerThreadfin", "Mullet", "MackerelPike", "Saurel", "Surfperch", "harpoon", "BlackSpottedDolphin", "GaleocerdoCuvier", "WhaleShark", "PorcupineFish", "Swellfish", "FlyingFish"],
            "locationColor": "#F7DC6F",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Ahrmo Sea*/[[-14.77, -34.24],[-13.94, -33.81],[-12.88, -33.65],[-12.27, -33.21],[-11.85, -32.37],[-10.51, -32.37],[-9.76, -32.05],[-9.45, -31.80],[-10.76, -30.62],[-11.30, -29.27],[-10.39, -27.96],[-9.96, -26.75],[-9.77, -24.79],[-10.63, -22.63],[-17.23, -24.77],[-18.67, -24.82],[-20.65, -24.38],[-22.53, -23.50],[-23.91, -23.49],[-25.17, -24.20],[-26.28, -25.31],[-26.79, -26.40],[-27.86, -29.64],[-28.07, -29.93],[-28.07, -30.31],[-26.36, -33.34],[-25.34, -33.87],[-23.45, -33.90],[-21.10, -31.96],[-17.41, -31.96],[-15.88, -33.86],[-15.22, -34.02],[-14.88, -34.13]],
            /*Ginburrey Island[[-26.58, -31.26],[-25.69, -33.40],[-24.63, -33.57],[-23.18, -32.78],[-22.92, -31.11],[-23.72, -30.55],[-26.27, -30.83]],*/
            /*Daton Island, Netnume Island, Oben Island[[-25.71, -25.86],[-25.99, -29.38],[-25.35, -30.17],[-24.24, -30.20],[-22.91, -29.93],[-20.90, -29.78],[-17.51, -27.54],[-18.04, -26.20],[-19.86, -25.64],[-23.43, -24.84],[-25.21, -25.13]],*/
            /*Dunde Island, Eberdeen Island[[-20.48, -30.28],[-17.15, -27.83],[-16.53, -28.11],[-16.55, -29.94],[-17.16, -30.60],[-20.04, -30.72]],*/
            /*Albresser Island[[-16.18, -30.03],[-16.26, -31.03],[-15.81, -31.50],[-14.32, -31.54],[-13.73, -30.98],[-14.25, -29.60],[-15.61, -29.66]],*/
            /*Barater Island[[-15.77, -32.37],[-16.03, -32.90],[-15.25, -33.11],[-13.99, -32.85],[-13.75, -31.99],[-14.71, -31.74],[-15.50, -31.98]],*/
        ]]
            }                
        },


    {
        "type":"Feature",
        "id":"18",
        "properties":
            {
            "name_EN":"Nox Sea",
            "name_KR":"녹스 해역",
            "fishGroup": ["Footballfish", "BlueBatStar", "Corvina", "Siganid", "Angler", "YellowSwordfish", "Butterflyfish", "Dolphinfish", "Skipjack", "Saurel", "Squid", "StripedCatfish", "Filefish", "Bluefish", "Flatfish", "Clownfish", "Surfperch", "harpoon", "BlackSpottedDolphin", "KillerWhale", "Albacore", "Angler", "YellowSwordfish", "Ray"],
            "locationColor": "#7D3C98",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Nox Sea*/[[-0.65, -7.11],[0.15, -7.00],[5.24, -5.34],[7.98, -4.10],[9.58, -5.29],[12.04, -7.49],[13.69, -9.50],[14.97, -10.66],[15.42, -10.74],[13.73, -12.94],[13.30, -13.76],[12.78, -15.44],[12.63, -17.60],[11.62, -18.12],[10.84, -18.71],[9.60, -20.99],[9.21, -21.74],[8.22, -21.43],[4.98, -21.36],[4.03, -21.61],[2.90, -22.65],[1.89, -22.74],[1.38, -22.84],[0.64, -22.60],[-1.32, -20.26],[-2.63, -19.50],[-0.64, -16.88],[-0.32, -15.88],[-0.32, -14.85],[-2.42, -10.46],[-1.83, -9.60],[-1.57, -8.77],[-1.55, -8.39],[-1.30, -7.94],[-1.30, -7.68]],
            /*Lema Island, Tashu Island[[1.09, -10.09],[1.11, -13.62],[1.78, -14.18],[2.66, -14.18],[4.44, -15.70],[7.82, -15.69],[9.29, -14.66],[8.61, -11.21],[7.29, -10.23],[3.55, -10.34],[2.46, -9.33]],*/
            /*Invernen Island[[-0.47, -19.31],[-0.91, -20.13],[0.10, -21.47],[1.97, -22.28],[3.18, -22.12],[3.49, -21.04],[2.33, -19.46]],*/
            /*Tulu Island[[4.66, -18.38],[4.23, -19.54],[4.98, -19.83],[5.59, -19.68],[5.60, -18.81]],*/
            /*Orffs Island[[6.41, -18.63],[7.24, -17.84],[8.39, -18.23],[8.43, -19.75],[7.71, -19.97],[6.62, -19.67]],*/
            /*Lema Island*/[[7.09, -13.59],[7.10, -13.48],[7.17, -13.54]],
        ]]
            }                
        },
    {
        "type":"Feature",
        "id":"19",
        "properties":
            {
            "name_EN":"Arsha Sea",
            "name_KR":"아르샤 해역",
            "fishGroup": ["Footballfish", "BlueBatStar", "Corvina", "Pomfret", "CheckerboardWrasse", "GoldenThread", "Swordfish", "Butterflyfish", "Dolphinfish", "Skipjack", "Saurel", "Squid", "StripedCatfish", "Filefish", "Bluefish", "Flatfish", "Clownfish", "Surfperch", "harpoon", "BlackSpottedDolphin", "KillerWhale", "YellowfinTuna", "GoldenThread", "Swordfish", "Ray"],
            "locationColor": "#BB78D7",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Arsha Sea*/[[13.38, -13.77],[13.79, -12.96],[15.69, -10.49],[17.14, -10.38],[18.90, -10.44],[25.53, -11.39],[28.72, -12.93],[28.83, -12.93],[32.74, -15.53],[36.17, -18.91],[37.46, -19.97],[36.04, -21.01],[34.77, -22.33],[33.56, -23.78],[31.84, -25.40],[30.31, -26.03],[28.40, -26.18],[27.17, -26.17],[20.13, -24.19],[18.36, -24.23],[17.44, -23.56],[17.30, -23.28],[17.25, -22.45],[17.61, -21.83],[16.96, -21.17],[15.84, -20.58],[14.38, -18.96],[13.86, -18.96],[12.68, -17.64],[12.84, -15.44]],
            /*Iliya Island[[20.61, -22.30],[21.62, -23.42],[26.14, -24.32],[27.38, -23.97],[29.99, -21.23],[30.56, -19.18],[29.67, -17.22],[26.77, -15.28],[24.30, -15.28],[20.58, -17.51]],*/
            /*Pujara Island[[32.79, -19.97],[34.37, -20.32],[34.66, -21.57],[33.71, -23.40],[32.57, -23.24],[32.28, -20.47]],*/
            /*Racid Island[[16.48, -11.86],[16.27, -13.41],[19.32, -14.24],[19.43, -11.90],[17.29, -11.24]],*/
            /*Al-Naha Island[[14.71, -14.25],[14.06, -16.05],[14.19, -17.76],[15.25, -17.72],[17.00, -16.11],[16.06, -14.29]],*/
            /*Ajir Island[[17.14, -18.41],[17.04, -19.68],[18.24, -20.16],[19.09, -20.00],[19.40, -18.68],[18.58, -17.87]],*/
            /*Racid Island*/[[17.51, -11.99],[17.37, -11.94],[17.34, -12.29],[17.39, -12.51],[17.43, -12.91],[17.33, -13.62],[18.46, -13.58],[19.00, -13.94],[19.16, -13.39],[18.95, -13.24],[19.05, -12.89],[18.73, -12.60],[18.36, -12.69],[18.35, -12.24],[17.92, -12.08],[17.53, -12.20]],
            /*Iliya Island(1)*/[[29.75, -19.12],[29.72, -18.97],[29.64, -18.98],[29.67, -19.14]],
            /*Iliya Isalnd(2)*/[[29.62, -18.83],[29.62, -18.76],[29.53, -18.76],[29.54, -18.83]],
            /*Abyssal Zone of the Sycraia Underwater Ruins(1)*/[[24.40, -12.62],[24.58, -12.62],[24.50, -12.55],[24.44, -12.55]],
            /*Abyssal Zone of the Sycraia Underwater Ruins(2)*/[[22.96, -11.96],[22.88, -12.17],[22.94, -12.29],[23.26, -12.34],[23.39, -12.21],[23.35, -12.00]],

        ]]
            }                
        },
    {
        "type":"Feature",
        "id":"20",
        "properties":
            {
            "name_EN":"Eltro Sea",
            "name_KR":"엘토르 해역",
            "fishGroup": ["Footballfish", "BlueBatStar", "Corvina", "Octopus", "Siganid", "TapertailAnchovy", "Marlin", "Butterflyfish", "Dolphinfish", "Skipjack", "Saurel", "Squid", "StripedCatfish", "Filefish", "Bluefish", "Flatfish", "Clownfish", "Surfperch", "harpoon", "BlackSpottedDolphin", "KillerWhale", "BluefinTuna", "Octopus", "Marlin", "Beltfish"],
            "locationColor": "#623873",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Eltro Sea*/[[32.83, -15.47],[36.18, -18.80],[37.54, -19.92],[39.30, -18.56],[41.09, -16.88],[40.97, -16.30],[41.76, -14.33],[42.34, -11.37],[41.99, -7.96],[41.29, -4.72],[40.35, -2.68],[39.35, -1.13],[38.02, 0.23],[35.53, 1.75],[33.89, 2.21],[32.38, 2.14],[31.03, 1.88],[29.37, 1.85],[28.78, 1.82],[28.64, 1.71],[27.58, 1.66],[23.76, 1.04],[17.98, 0.03],[13.23, -1.15],[10.03, -2.72],[8.06, -4.06],[9.64, -5.22],[12.11, -7.43],[13.77, -9.45],[15.03, -10.58],[15.44, -10.66],[15.67, -10.38],[17.13, -10.28],[18.90, -10.33],[25.58, -11.30],[28.72, -12.82],[28.88, -12.82]],
            /*Feltron Island[[13.01, -2.57],[12.26, -4.36],[12.83, -5.54],[13.57, -6.20],[14.21, -6.18],[15.48, -3.80],[14.72, -2.49]],*/
            /*Tinberra Island[[26.18, -6.01],[27.80, -6.50],[28.95, -6.14],[29.76, -4.39],[31.29, -3.70],[33.02, -0.09],[32.67, 0.75],[30.49, 0.94],[29.26, 0.26],[26.69, -3.66]],*/
            /*Lerao Island[[33.66, -0.78],[35.45, -0.51],[36.04, -1.78],[36.16, -3.22],[34.73, -4.90],[32.84, -4.29],[32.60, -2.39]],*/
            /*Portanen Island[[35.97, -6.62],[34.88, -7.23],[34.46, -8.37],[35.29, -9.28],[37.74, -9.21],[38.49, -8.06],[37.36, -7.13]],*/
            /*Shasha Island[[33.49, -10.79],[32.57, -11.38],[32.41, -13.35],[32.94, -14.67],[35.66, -13.56],[36.15, -13.12],[35.99, -11.45],[35.15, -10.69]],*/
            /*Rosevan Island[[36.51, -13.44],[36.31, -10.95],[37.11, -9.97],[39.30, -9.51],[40.84, -10.24],[40.76, -11.45],[38.91, -13.65],[37.64, -13.96]],*/
            /*Feltron Island(1)*/[[13.22, -4.42],[13.35, -4.21],[13.41, -4.24],[13.40, -4.43]],
            /*Feltron Island(2)*/[[14.25, -4.41],[14.27, -4.35],[14.37, -4.32],[14.41, -4.34],[14.34, -4.42]],
            /*Abyssal Zone of the Sycraia Underwater Ruins(3)*/[[23.41, -10.54],[23.54, -10.58],[23.54, -10.82],[23.12, -10.89],[23.18, -10.68]],
            
        ]]
            }                
        },


    {
        "type":"Feature",
        "id":"21",
        "properties":
            {
            "name_EN":"Sausan Islands",
            "name_KR":"소산 군도",
            "fishGroup": ["BlueBatStar", "Corvina", "Grunt", "Rockfish", "RoundHerring", "Whiting", "BlueTang", "Clownfish", "Flatfish", "Starfish", "Surfperch", "Sandeel", "harpoon", "BlackSpottedDolphin", "MinkeWhale", "GiantGrouper", "Grouper", "Swellfish", "Ray"],
            "locationColor": "#C0392B",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Sausan Islands*/[[31.89, -25.48],[33.62, -23.86],[34.86, -22.38],[36.01, -21.16],[39.39, -18.64],[41.12, -17.03],[41.18, -17.20],[40.62, -19.01],[40.55, -20.65],[39.85, -26.72],[39.32, -28.10],[39.36, -28.70],[37.73, -30.13],[35.08, -31.43],[31.64, -32.12],[31.53, -32.25],[31.42, -32.20],[31.49, -32.14],[31.35, -32.06],[31.13, -32.04],[30.72, -31.46],[30.08, -31.35],[28.70, -31.39],[26.65, -31.72],[23.32, -31.98],[22.59, -32.35],[21.14, -32.89],[19.56, -33.42],[19.35, -33.37],[18.96, -33.15],[18.48, -32.78],[18.48, -32.65],[18.14, -32.37],[17.83, -32.25],[17.42, -31.62],[18.53, -29.67],[19.46, -29.68],[20.70, -28.89],[21.23, -28.12],[22.01, -27.73],[23.20, -27.36],[25.31, -27.20],[27.08, -26.72],[27.25, -26.24],[28.40, -26.26],[30.39, -26.11]],
            /*Beiruwa Island[[17.83, -31.67],[17.90, -31.03],[18.77, -30.32],[21.06, -30.22],[21.28, -31.00],[19.62, -32.07],[18.41, -32.12]],*/
            /*Taramura Island[[21.12, -28.59],[21.61, -28.23],[23.08, -28.43],[23.99, -29.25],[24.10, -29.76],[23.37, -30.14],[21.17, -28.88]],*/
            /*Ostra Island[[22.71, -27.88],[23.15, -27.47],[23.48, -27.40],[24.38, -27.34],[24.75, -27.62],[24.76, -28.29],[23.96, -28.60]],*/
            /*Delinghart Island[[28.81, -27.28],[28.18, -27.69],[28.13, -28.96],[28.84, -29.34],[30.17, -29.25],[30.80, -28.82],[30.11, -27.88]],*/
            /*Pilava Island[[31.49, -29.04],[31.49, -30.52],[32.15, -31.08],[33.95, -31.07],[34.64, -30.13],[34.30, -28.22],[32.44, -28.09]],*/
        ]]
            }                
        },
    {
        "type":"Feature",
        "id":"22",
        "properties":
            {
            "name_EN":"Mediah Sea",
            "name_KR":"메디아 해역",
            "fishGroup": ["BlueBatStar", "Corvina", "Grouper", "Moray", "Rockfish", "RoundHerring", "Whiting", "BlueTang", "Clownfish", "Flatfish", "Starfish", "Surfperch", "Sandeel", "harpoon", "BlackSpottedDolphin", "HumpbackWhale", "GiantGrouper", "Grouper", "SeaEel", "Croaker"],
            "locationColor": "#F16E60",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Mediah Sea*/[[31.64, -32.22],[31.68, -32.16],[35.09, -31.48],[37.78, -30.17],[39.36, -28.78],[39.47, -29.80],[39.30, -30.21],[39.20, -30.69],[38.47, -31.26],[38.35, -32.82],[39.00, -33.93],[39.47, -34.14],[39.64, -34.14],[39.94, -34.35],[39.86, -34.45],[39.86, -34.52],[39.90, -34.82],[39.81, -34.91],[39.79, -35.09],[39.68, -35.16],[39.68, -35.25],[39.75, -35.37],[39.75, -35.45],[39.68, -35.55],[39.62, -35.56],[39.63, -35.67],[39.83, -35.85],[39.79, -35.96],[39.67, -35.99],[39.72, -36.27],[39.80, -36.33],[39.81, -36.46],[39.86, -36.49],[39.96, -36.94],[39.91, -36.99],[39.95, -37.12],[39.97, -37.16],[39.96, -37.56],[39.85, -37.65],[39.95, -37.74],[39.93, -37.85],[40.05, -37.98],[40.11, -37.98],[40.19, -38.34],[40.28, -38.38],[40.29, -38.43],[40.40, -38.49],[40.39, -38.55],[40.45, -38.57],[40.50, -38.54],[40.53, -38.71],[40.51, -38.76],[40.65, -38.91],[40.69, -39.03],[40.76, -39.09],[40.81, -39.06],[40.86, -39.22],[40.85, -39.27],[41.09, -39.29],[41.07, -39.38],[40.93, -39.43],[40.89, -39.54],[40.97, -39.58],[41.06, -39.59],[41.11, -39.65],[41.07, -39.78],[41.13, -39.84],[41.09, -39.92],[40.98, -40.04],[41.25, -40.12],[41.29, -40.17],[41.24, -40.19],[41.01, -40.20],[40.93, -40.32],[41.12, -40.40],[41.21, -40.47],[41.19, -40.56],[41.10, -40.59],[41.03, -40.65],[40.09, -40.94],[38.46, -41.73],[38.47, -41.65],[38.35, -41.66],[38.30, -41.60],[38.34, -41.48],[38.20, -41.41],[38.19, -41.31],[38.00, -41.33],[37.99, -41.30],[38.06, -41.22],[38.01, -41.18],[37.90, -41.03],[37.79, -41.00],[37.76, -40.95],[37.66, -40.88],[37.50, -40.93],[37.35, -40.85],[36.90, -40.71],[36.91, -40.68],[36.83, -40.66],[36.80, -40.71],[36.53, -40.66],[36.45, -40.59],[36.49, -40.54],[36.55, -40.51],[36.43, -40.39],[36.45, -40.35],[36.38, -40.32],[36.32, -40.31],[36.33, -40.28],[36.29, -40.28],[36.27, -40.32],[36.18, -40.33],[36.13, -40.28],[36.04, -40.34],[35.84, -40.35],[35.72, -40.32],[35.60, -40.19],[35.57, -40.09],[35.38, -40.03],[35.29, -39.96],[35.04, -39.91],[34.94, -39.85],[34.82, -39.84],[34.63, -39.77],[34.62, -39.73],[34.56, -39.73],[34.56, -39.77],[34.46, -39.74],[34.40, -39.87],[34.45, -39.89],[34.46, -39.95],[34.52, -39.98],[34.58, -39.97],[34.68, -40.06],[34.50, -40.09],[34.24, -40.05],[34.18, -40.00],[34.07, -39.99],[34.00, -39.90],[34.04, -39.82],[34.11, -39.77],[34.11, -39.65],[34.02, -39.62],[33.82, -39.76],[33.80, -39.85],[33.76, -39.82],[33.74, -39.72],[33.67, -39.82],[33.55, -39.80],[33.59, -39.77],[33.52, -39.55],[33.46, -39.57],[33.38, -39.48],[33.50, -39.48],[33.58, -39.52],[33.60, -39.40],[33.50, -39.39],[33.45, -39.41],[33.40, -39.35],[33.33, -39.37],[33.18, -39.35],[33.16, -39.24],[33.05, -39.22],[33.02, -39.16],[32.96, -39.16],[32.90, -39.11],[32.93, -39.04],[33.01, -38.92],[32.96, -38.86],[32.83, -38.93],[32.70, -38.83],[32.63, -38.86],[32.59, -38.83],[32.63, -38.79],[32.65, -38.69],[32.53, -38.60],[32.65, -38.59],[32.84, -38.59],[33.04, -38.55],[33.02, -38.48],[33.15, -38.47],[33.23, -38.52],[33.32, -38.44],[33.45, -38.53],[33.53, -38.55],[33.57, -38.44],[33.80, -38.39],[33.87, -38.35],[33.94, -38.41],[34.06, -38.41],[34.25, -38.34],[34.41, -38.35],[34.48, -38.33],[34.45, -38.28],[34.49, -38.23],[34.52, -38.25],[34.81, -38.04],[34.99, -38.13],[34.96, -38.33],[34.87, -38.44],[34.99, -38.52],[35.16, -38.57],[35.34, -38.56],[35.32, -38.65],[35.35, -38.89],[35.31, -38.91],[35.32, -38.97],[35.39, -39.09],[35.46, -39.09],[35.50, -39.13],[35.55, -39.11],[35.58, -39.06],[35.66, -39.04],[35.69, -38.96],[36.07, -38.41],[36.12, -38.37],[36.12, -38.33],[36.08, -38.31],[36.13, -38.03],[36.16, -37.97],[36.34, -37.69],[36.38, -37.67],[36.34, -37.58],[36.35, -37.49],[36.48, -37.12],[36.52, -36.99],[36.47, -36.99],[36.48, -36.55],[36.38, -36.50],[36.38, -36.42],[36.27, -36.32],[36.13, -36.29],[35.86, -36.32],[35.75, -36.38],[35.70, -36.51],[35.54, -36.51],[35.39, -36.57],[35.37, -36.48],[35.45, -36.46],[35.49, -36.37],[35.36, -36.14],[35.34, -36.08],[35.39, -35.94],[35.57, -35.77],[35.65, -35.79],[35.69, -35.70],[35.76, -35.71],[35.83, -35.69],[35.81, -35.65],[35.80, -35.38],[35.49, -34.82],[35.51, -34.72],[35.58, -34.65],[35.58, -34.61],[35.53, -34.51],[35.34, -34.46],[35.29, -34.40],[35.21, -34.37],[35.16, -34.21],[35.21, -34.17],[35.17, -34.14],[35.10, -34.17],[35.06, -34.13],[35.02, -34.07],[35.03, -33.85],[34.99, -33.73],[34.92, -33.68],[34.69, -33.56],[34.68, -33.50],[34.50, -33.44],[34.45, -33.32],[34.18, -33.16],[33.82, -33.45],[33.57, -33.28],[33.66, -33.20],[33.45, -32.98],[33.18, -32.83],[33.10, -32.91],[32.47, -32.49],[32.49, -32.43],[32.45, -32.39],[32.34, -32.39],[32.35, -32.34],[32.29, -32.30],[32.26, -32.34],[32.11, -32.34],[32.07, -32.28],[31.94, -32.28],[31.89, -32.32],[31.83, -32.26]],
            /*Mediah Castle*/[[36.29, -37.98],[36.19, -38.85],[36.59, -39.74],[37.77, -39.88],[38.76, -39.69],[38.58, -38.08],[37.55, -37.08],[36.87, -36.99],[36.51, -37.32]],
        ]]
            }                
        },
    {
        "type":"Feature",
        "id":"23",
        "properties":
            {
            "name_EN":"Altinova Sea",
            "name_KR":"알티노바 해역",
            "fishGroup": ["BlueBatStar", "Corvina", "Tilefish", "PorcupineFish", "Rockfish", "RoundHerring", "Whiting", "BlueTang", "Clownfish", "Flatfish", "Starfish", "Surfperch", "Sandeel", "harpoon", "BlackSpottedDolphin", "HammerWhale", "GiantGrouper", "PorcupineFish", "SeaEel", "FlyingFish"],
            "locationColor": "#FF6AB0",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Altinova Sea*/[[45.47, -51.85],[46.81, -51.85],[46.87, -51.80],[46.78, -51.64],[46.82, -51.60],[46.53, -51.50],[46.54, -51.40],[46.47, -51.38],[46.46, -51.31],[46.53, -51.29],[46.59, -51.21],[46.56, -51.06],[46.25, -50.95],[46.14, -50.77],[46.35, -50.64],[46.32, -50.57],[46.36, -50.50],[46.45, -50.51],[46.53, -50.46],[46.55, -50.37],[46.48, -50.17],[46.56, -50.10],[46.45, -49.99],[46.45, -49.92],[46.54, -49.90],[46.64, -49.75],[46.56, -49.70],[46.56, -49.64],[46.59, -49.61],[46.56, -49.58],[46.49, -49.60],[46.38, -49.56],[46.26, -49.50],[45.88, -49.14],[45.78, -48.95],[45.83, -48.91],[45.82, -48.86],[45.90, -48.81],[45.87, -48.77],[45.82, -48.78],[45.80, -48.69],[45.85, -48.68],[45.99, -48.27],[45.96, -48.18],[45.89, -48.16],[45.79, -48.15],[45.85, -48.08],[45.74, -48.05],[45.69, -48.01],[45.71, -47.93],[45.67, -47.90],[45.89, -47.79],[45.93, -47.74],[45.88, -47.73],[45.84, -47.75],[45.77, -47.71],[46.01, -47.57],[45.99, -47.51],[45.87, -47.51],[45.86, -47.41],[46.15, -47.07],[46.24, -46.75],[46.17, -46.64],[46.22, -46.49],[46.17, -46.39],[46.30, -46.29],[46.25, -46.22],[46.35, -46.13],[46.33, -46.02],[46.28, -45.94],[46.26, -45.76],[46.32, -45.62],[46.29, -45.55],[46.39, -45.52],[46.43, -45.34],[46.33, -45.17],[46.22, -45.17],[46.11, -44.91],[45.91, -44.85],[45.86, -44.75],[45.89, -44.69],[45.85, -44.46],[45.70, -44.33],[45.61, -44.21],[45.63, -44.12],[45.68, -44.12],[45.69, -44.00],[45.55, -43.91],[45.57, -43.86],[45.49, -43.80],[45.53, -43.71],[45.36, -43.59],[45.41, -43.52],[45.35, -43.39],[45.20, -43.39],[45.23, -43.33],[45.09, -43.23],[45.10, -43.17],[45.18, -43.18],[45.19, -43.13],[45.10, -43.13],[45.04, -43.09],[44.99, -43.11],[44.96, -43.08],[44.94, -42.98],[44.84, -42.93],[44.78, -42.96],[44.63, -42.95],[44.52, -42.85],[44.43, -42.92],[44.38, -42.88],[44.32, -42.88],[44.22, -42.89],[44.18, -42.93],[44.13, -42.93],[44.09, -42.88],[43.87, -42.78],[43.87, -42.72],[43.74, -42.67],[43.61, -42.70],[43.55, -42.80],[43.37, -42.75],[42.87, -42.34],[42.77, -42.35],[42.67, -42.23],[42.57, -42.25],[42.49, -42.20],[42.43, -42.22],[42.35, -42.14],[42.29, -42.15],[42.24, -42.10],[42.12, -42.10],[42.10, -42.06],[42.15, -41.95],[42.13, -41.91],[42.04, -41.94],[41.96, -41.89],[41.91, -41.74],[41.96, -41.74],[41.95, -41.64],[42.05, -41.57],[42.11, -41.58],[42.20, -41.52],[42.16, -41.49],[42.12, -41.50],[41.99, -41.51],[41.95, -41.46],[41.90, -41.48],[41.82, -41.44],[41.79, -41.36],[41.71, -41.25],[41.64, -41.19],[41.51, -41.18],[41.48, -41.15],[41.38, -41.16],[41.30, -41.11],[41.39, -41.08],[41.40, -40.98],[41.43, -40.97],[41.39, -40.90],[41.26, -40.89],[41.20, -40.86],[40.95, -40.87],[40.93, -40.83],[41.00, -40.71],[40.12, -41.00],[38.41, -41.82],[38.37, -42.00],[38.45, -42.18],[38.72, -42.31],[38.72, -42.37],[38.63, -42.42],[38.61, -42.59],[38.46, -42.64],[38.45, -42.71],[38.37, -42.76],[38.39, -42.85],[38.50, -42.80],[38.65, -42.80],[38.71, -42.70],[38.75, -42.68],[38.84, -42.70],[38.87, -42.76],[38.85, -42.89],[38.79, -42.95],[38.81, -43.00],[38.80, -43.05],[38.74, -43.06],[38.65, -43.13],[38.73, -43.15],[38.78, -43.12],[38.84, -43.13],[38.90, -43.17],[38.86, -43.23],[38.75, -43.23],[38.70, -43.21],[38.65, -43.20],[38.64, -43.24],[38.70, -43.28],[38.60, -43.36],[38.63, -43.41],[38.53, -43.50],[38.56, -43.53],[38.72, -43.45],[38.86, -43.48],[38.88, -43.54],[38.77, -43.57],[38.81, -43.69],[38.52, -43.80],[38.51, -43.97],[38.56, -43.98],[38.56, -44.05],[38.51, -44.06],[38.48, -44.09],[38.54, -44.20],[38.49, -44.25],[38.51, -44.28],[38.56, -44.28],[38.57, -44.30],[38.38, -44.32],[38.44, -44.39],[38.62, -44.41],[38.75, -44.41],[38.86, -44.36],[38.92, -44.41],[39.00, -44.43],[39.08, -44.48],[39.17, -44.66],[39.24, -44.73],[39.22, -44.78],[39.24, -44.82],[39.29, -44.85],[39.26, -44.89],[39.18, -44.91],[39.11, -44.91],[39.11, -44.95],[39.18, -44.97],[39.09, -45.05],[39.13, -45.25],[39.23, -45.26],[39.28, -45.30],[39.51, -45.31],[39.51, -45.40],[39.41, -45.43],[39.50, -45.55],[39.46, -45.60],[39.46, -45.74],[39.49, -45.78],[39.45, -45.84],[39.38, -45.84],[39.37, -45.94],[39.39, -46.02],[39.66, -46.38],[39.85, -46.40],[39.97, -46.51],[39.96, -46.79],[40.11, -46.99],[40.02, -47.02],[40.02, -47.08],[40.09, -47.12],[40.25, -47.09],[40.34, -47.11],[40.42, -47.19],[40.51, -47.22],[40.62, -47.17],[40.73, -47.19],[40.79, -47.19],[40.98, -47.38],[40.97, -47.51],[41.06, -47.67],[41.13, -47.67],[41.23, -47.72],[41.23, -47.82],[41.32, -47.89],[41.39, -47.88],[41.42, -47.94],[41.49, -47.98],[41.68, -47.98],[41.74, -48.02],[41.91, -48.03],[42.02, -48.06],[42.08, -48.05],[42.15, -48.09],[42.11, -48.11],[42.29, -48.21],[42.42, -48.22],[42.55, -48.11],[42.84, -48.10],[42.83, -48.06],[42.93, -48.06],[43.27, -48.15],[43.34, -48.12],[43.53, -48.13],[43.55, -48.24],[43.60, -48.28],[43.66, -48.25],[43.93, -48.40],[44.07, -48.40],[44.05, -48.47],[43.88, -48.57],[43.94, -48.62],[44.10, -48.63],[44.13, -48.60],[44.25, -48.62],[44.32, -48.56],[44.44, -48.64],[44.43, -48.68],[44.50, -48.68],[44.57, -48.71],[44.52, -48.84],[44.61, -49.22],[44.81, -49.29],[44.74, -49.32],[44.74, -49.52],[44.91, -49.67],[45.06, -49.65],[45.13, -49.76],[44.94, -49.80],[44.87, -49.87],[44.96, -49.99],[45.04, -50.01],[45.13, -50.08],[45.09, -50.12],[45.15, -50.18],[45.08, -50.27],[45.16, -50.31],[45.03, -50.35],[45.02, -50.47],[44.97, -50.49],[45.06, -50.63],[45.19, -50.67],[45.17, -50.69],[45.24, -50.78],[45.29, -50.77],[45.43, -50.90],[45.26, -50.99],[45.38, -51.08],[45.38, -51.21],[45.42, -51.32],[45.48, -51.33],[45.48, -51.41],[45.39, -51.47],[45.52, -51.60],[45.46, -51.72],[45.50, -51.74]],
            /*Altinova(1)*/[[39.83, -42.24],[39.44, -42.97],[39.86, -44.76],[39.57, -45.20],[39.64, -46.13],[41.94, -47.74],[43.83, -48.15],[44.25, -48.03],[44.63, -45.38],[42.39, -42.92],[40.99, -41.93],[40.63, -42.24]],
            /*Altinova(2)*/[[43.29, -43.73],[44.26, -44.80],[44.99, -45.04],[45.34, -44.70],[44.99, -43.44],[44.35, -42.99],[43.60, -42.82],[43.08, -42.88]],
        ]]
            }                
        },
        // {
        //     "type":"Feature",
        //     "id":"23",
        //     "properties":
        //         {
        //         "name_EN":"Sea of Silence",
        //         "name_KR":"침묵의 바다",
        //         "fishGroup": [/*"BlueBatStar", "Corvina",*/ "Tilefish", "PorcupineFish", "Maomao", "JohnDory", "BlackMarlin", "Marlin", "SeaEel", "Seahorse", "Rosefish", "Gurnard", "Ray", "Flounder", "Cuttlefish", "RockHind", "Surfperch", "Sandeel", "harpoon", "BlackSpottedDolphin", "Narwhale", "BelugaWhale", "BottlenoseDolphin", "BlackMarlin", "Marlin", "Cuttlefish"],
        //         "locationColor": "#FECB66",
        //     },
        //     "geometry":
        //         {
        //         "type":"MultiPolygon",
        //         "coordinates":[[
        //         /*Sea of Silence*/[[39.29, -30.15],[37.77, -30.05],[36.21, -29.16],[35.34, -27.93],[34.96, -26.73],[35.97, -22.14],[36.13, -20.98],[36.26, -18.91],[36.42, -17.75],[36.63, -17.06],[37.22, -16.18],[38.28, -15.45],[40.02, -15.03],[41.98, -15.44],[43.48, -16.35],[43.98, -17.14],[44.65, -19.66],[44.65, -21.02],[44.47, -22.79],[43.97, -24.46],[43.62, -26.11],[42.95, -27.51],[42.03, -28.57],[41.22, -29.42],[40.80, -29.69],[39.92, -30.06]],
        //     ]]
        //         }                
        //     },
    {
        "type":"Feature",
        "id":"24",
        "properties":
            {
            "name_EN":"Al Halam Sea",
            "name_KR":"알 할람 해역",
            "fishGroup": ["BlueBatStar", "Corvina", "Tilefish", "PorcupineFish", "Maomao", "JohnDory", "BlackMarlin", "Marlin", "SeaEel", "Seahorse", "Rosefish", "Gurnard", "Ray", "Flounder", "Cuttlefish", "RockHind", "Surfperch", "Sandeel", "harpoon", "BlackSpottedDolphin", "Narwhale", "BelugaWhale", "BottlenoseDolphin", "BlackMarlin", "Marlin", "Cuttlefish"],
            "locationColor": "#FECB66",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Al Halam Sea*/[[51.03, -18.68],[49.89, -16.47],[49.90, -15.49],[47.65, -11.76],[43.95, -7.83],[41.02, -3.16],[40.48, -2.79],[41.39, -4.71],[42.09, -7.96],[42.44, -11.37],[41.85, -14.34],[41.50, -15.25],[41.08, -16.29],[41.27, -17.20],[40.70, -19.00],[40.64, -20.66],[39.93, -26.73],[39.40, -28.10],[39.55, -29.80],[39.38, -30.22],[39.28, -30.72],[38.56, -31.29],[38.44, -32.82],[39.06, -33.88],[39.49, -34.08],[39.72, -34.08],[39.95, -34.25],[40.03, -34.15],[40.18, -34.10],[40.20, -34.05],[40.42, -34.03],[40.52, -34.08],[40.63, -34.01],[40.55, -33.84],[40.48, -33.87],[40.45, -33.80],[40.50, -33.73],[40.52, -33.77],[40.68, -33.70],[40.64, -33.67],[40.81, -33.58],[40.84, -33.44],[40.76, -33.39],[40.76, -33.31],[40.85, -33.23],[40.84, -33.12],[40.89, -32.98],[40.92, -32.98],[40.98, -32.92],[40.97, -32.88],[40.86, -32.91],[40.79, -32.85],[40.79, -32.56],[40.89, -32.49],[40.95, -32.49],[40.94, -32.37],[40.84, -32.25],[40.78, -32.05],[40.84, -32.00],[40.81, -31.90],[40.86, -31.74],[40.95, -31.72],[41.03, -31.74],[41.08, -31.70],[41.26, -31.70],[41.36, -31.64],[41.46, -31.64],[41.68, -31.73],[41.87, -31.94],[42.20, -32.02],[42.43, -31.99],[42.52, -31.91],[42.71, -31.85],[43.01, -31.84],[43.17, -31.86],[43.29, -31.82],[43.37, -31.83],[43.58, -31.74],[43.70, -31.63],[43.82, -31.63],[44.03, -31.37],[44.03, -31.27],[44.23, -31.29],[44.25, -31.25],[44.49, -31.31],[44.74, -31.35],[44.81, -31.41],[45.05, -31.48],[45.14, -31.45],[45.18, -31.33],[45.25, -31.27],[45.40, -31.29],[45.54, -31.18],[45.59, -31.02],[45.90, -30.94],[46.00, -30.83],[46.19, -30.76],[46.25, -30.64],[46.41, -30.58],[46.46, -30.65],[46.71, -30.63],[46.83, -30.51],[47.02, -30.48],[46.85, -30.33],[46.84, -30.24],[46.89, -30.19],[47.19, -30.43],[47.53, -30.16],[47.80, -29.98],[47.64, -29.66],[47.45, -29.47],[47.52, -29.45],[47.59, -29.49],[47.70, -29.42],[47.56, -29.36],[47.66, -29.17],[47.80, -29.07],[47.75, -28.88],[47.70, -28.84],[47.71, -28.78],[47.85, -28.71],[47.86, -28.66],[48.13, -28.56],[48.26, -28.55],[48.30, -28.28],[48.34, -28.24],[48.45, -28.24],[48.64, -28.13],[48.65, -28.00],[48.77, -27.81],[48.92, -27.73],[49.10, -27.67],[49.25, -27.46],[49.27, -27.32],[49.39, -27.26],[50.29, -26.94],[50.46, -26.65],[50.37, -26.18],[50.41, -26.10],[50.37, -25.87],[50.42, -25.82],[50.18, -25.47],[50.21, -25.42],[50.21, -25.24],[50.16, -25.18],[50.16, -25.01],[50.20, -24.92],[50.19, -24.79],[50.26, -24.66],[50.69, -24.28],[50.84, -24.02],[50.82, -23.82],[51.10, -23.46],[51.39, -23.30],[51.59, -23.02],[51.75, -22.95],[51.85, -23.01],[51.99, -22.89],[52.27, -22.82],[52.29, -22.77],[52.39, -22.72],[52.84, -22.79],[52.97, -22.89],[53.14, -23.20],[53.12, -23.33],[53.07, -23.41],[53.25, -23.53],[53.43, -23.79],[53.66, -23.85],[53.84, -23.77],[53.90, -23.50],[53.98, -23.42],[54.00, -23.28],[53.93, -23.17],[53.91, -23.02],[53.98, -22.93],[53.89, -22.72],[54.01, -22.64],[54.14, -22.64],[54.17, -22.45],[54.61, -22.32],[54.73, -22.44],[54.79, -22.42],[54.75, -22.36],[54.76, -22.30],[54.82, -22.26],[54.79, -22.13],[55.12, -22.06],[55.13, -21.98],[55.22, -22.02],[55.29, -21.97],[55.38, -22.01],[55.37, -21.85],[55.33, -21.79],[55.18, -21.93],[54.96, -21.79],[54.83, -21.82],[54.73, -21.63],[54.76, -21.57],[54.72, -21.32],[54.79, -21.20],[54.83, -21.25],[55.05, -21.12],[55.09, -21.02],[55.55, -20.96],[55.68, -21.00],[55.93, -21.29],[56.04, -21.16],[56.00, -20.47],[56.05, -20.44],[56.01, -20.39],[56.20, -20.25],[56.24, -20.31],[56.28, -20.19],[56.45, -20.17],[56.73, -19.96],[56.79, -19.83],[56.92, -19.82],[56.99, -19.71],[57.09, -19.70],[57.21, -19.87],[57.06, -20.49],[57.38, -20.61],[57.52, -20.58],[57.68, -20.46],[57.67, -20.43],[57.57, -20.45],[57.51, -20.29],[57.55, -20.24],[57.77, -20.16],[57.88, -20.21],[57.86, -20.31],[57.77, -20.35],[57.80, -20.40],[58.07, -20.31],[58.09, -20.24],[58.44, -20.25],[58.60, -20.13],[58.63, -20.04],[58.75, -20.04],[58.80, -19.86],[58.95, -19.79],[59.21, -19.48],[59.28, -19.13],[59.37, -19.02],[59.33, -18.97],[59.32, -18.81],[59.66, -18.31],[59.94, -18.17],[60.03, -18.22],[60.14, -18.15],[60.11, -18.06],[60.19, -17.92],[60.47, -17.85],[60.49, -17.79],[60.55, -17.69],[60.91, -17.64],[61.21, -17.43],[61.33, -17.42],[61.44, -17.54],[61.55, -17.46],[61.50, -17.42],[61.57, -17.32],[62.32, -17.26],[62.47, -17.12],[62.58, -16.50],[62.51, -16.43],[62.51, -16.28],[62.67, -16.29],[62.59, -15.98],[62.71, -15.94],[62.79, -16.06],[62.86, -16.07],[62.86, -15.99],[62.79, -15.99],[62.75, -15.91],[62.70, -15.50],[62.84, -15.44],[62.78, -15.28],[62.91, -15.11],[63.13, -15.05],[63.35, -15.05],[63.40, -14.96],[63.52, -14.94],[63.57, -14.96],[63.59, -14.66],[63.80, -14.54],[64.01, -14.57],[64.52, -14.28],[64.89, -14.25],[65.29, -13.99],[65.48, -13.99],[66.20, -13.60],[66.26, -13.51],[66.26, -13.48],[66.33, -13.43],[66.46, -13.43],[67.08, -12.92],[67.08, -12.85],[67.13, -12.79],[67.17, -12.81],[67.31, -12.68],[67.32, -12.58],[67.45, -12.45],[67.77, -12.29],[68.08, -12.28],[68.82, -12.00],[68.93, -11.88],[69.41, -11.84],[69.91, -11.57],[69.94, -11.30],[70.07, -11.15],[69.96, -11.11],[70.08, -10.89],[70.01, -10.76],[70.44, -10.31],[70.86, -10.33],[70.87, -10.41],[70.96, -10.40],[71.00, -10.19],[71.08, -10.12],[71.10, -9.99],[71.18, -9.94],[71.56, -9.88],[71.67, -9.78],[72.14, -9.79],[72.31, -9.74],[72.45, -9.58],[72.77, -9.51],[73.07, -9.61],[73.65, -9.52],[73.97, -9.57],[74.55, -9.46],[74.79, -9.54],[74.99, -9.44],[75.28, -9.43],[75.29, -9.35],[75.16, -9.18],[75.17, -9.10],[75.27, -9.04],[75.48, -9.10],[75.87, -8.95],[75.99, -9.09],[76.10, -8.99],[76.30, -9.04],[76.28, -9.13],[76.77, -9.30],[77.00, -9.23],[77.52, -9.34],[77.53, -9.49],[77.59, -9.51],[77.77, -10.22],[77.63, -10.41],[77.62, -10.63],[77.85, -10.90],[77.96, -10.91],[78.09, -11.03],[78.10, -11.20],[78.34, -11.39],[78.45, -11.35],[78.53, -11.40],[78.54, -11.52],[78.76, -11.70],[78.87, -11.67],[79.15, -12.28],[79.05, -12.94],[79.07, -13.17],[79.78, -13.78],[79.87, -13.72],[80.06, -13.77],[80.14, -13.65],[80.41, -13.59],[80.72, -13.75],[80.90, -14.01],[81.02, -14.05],[81.18, -13.89],[81.30, -13.60],[82.02, -13.15],[82.26, -13.09],[82.47, -13.10],[82.73, -13.00],[83.27, -13.11],[83.61, -13.14],[83.80, -13.10],[84.41, -13.13],[84.53, -13.23],[85.07, -13.37],[85.38, -13.68],[85.61, -14.17],[85.57, -14.25],[85.73, -14.79],[86.61, -15.16],[86.65, -15.14],[86.92, -15.35],[86.90, -15.55],[87.05, -16.08],[87.00, -16.12],[87.13, -16.33],[87.24, -16.33],[87.41, -16.19],[87.69, -16.20],[88.18, -16.49],[88.36, -16.54],[88.60, -16.35],[88.81, -16.35],[89.12, -16.00],[89.30, -15.97],[89.51, -16.04],[90.02, -15.90],[90.12, -15.70],[90.27, -15.68],[91.02, -15.89],[91.34, -16.10],[91.32, -16.22],[91.56, -16.62],[91.86, -16.76],[91.82, -16.95],[91.94, -17.06],[92.01, -17.03],[92.10, -17.09],[92.05, -17.13],[92.16, -17.28],[92.11, -17.37],[92.15, -17.64],[92.73, -17.78],[92.75, -17.86],[93.02, -18.04],[93.25, -18.08],[93.52, -18.09],[93.67, -18.03],[93.87, -17.85],[93.89, -17.67],[93.97, -17.60],[94.09, -17.63],[94.20, -17.43],[94.21, -17.22],[93.93, -17.03],[93.80, -16.86],[93.67, -16.88],[93.62, -16.82],[93.67, -16.77],[93.61, -16.64],[93.74, -16.46],[93.53, -16.28],[93.38, -16.23],[93.32, -16.05],[93.22, -16.00],[93.03, -15.68],[92.68, -15.55],[92.63, -15.49],[92.40, -15.41],[92.20, -15.20],[92.09, -15.19],[91.98, -15.24],[91.90, -15.12],[91.75, -15.13],[91.53, -14.93],[91.24, -14.93],[91.11, -14.89],[91.06, -14.82],[90.85, -14.79],[90.77, -14.85],[90.38, -14.65],[90.24, -14.63],[90.18, -14.66],[89.99, -14.65],[89.95, -14.55],[89.68, -14.30],[89.58, -13.77],[89.67, -13.20],[89.55, -13.02],[89.47, -12.68],[89.54, -12.53],[89.77, -12.43],[89.85, -12.27],[90.12, -12.13],[90.19, -11.93],[90.44, -11.75],[90.44, -11.67],[90.59, -11.49],[90.63, -11.16],[90.71, -11.05],[90.77, -10.67],[90.86, -10.51],[90.95, -10.49],[91.00, -10.39],[90.91, -10.17],[90.44, -9.87],[90.44, -9.73],[90.16, -9.61],[90.11, -9.68],[90.01, -9.60],[89.66, -9.61],[89.57, -9.57],[89.32, -9.62],[89.13, -9.52],[89.08, -9.44],[88.87, -9.31],[88.47, -8.89],[88.39, -8.60],[88.19, -8.28],[88.13, -8.09],[87.96, -7.79],[87.96, -7.59],[88.08, -7.52],[88.23, -6.96],[88.37, -6.89],[88.40, -6.81],[88.35, -6.77],[88.15, -6.31],[88.46, -5.59],[88.65, -5.46],[89.01, -5.29],[89.21, -4.90],[89.17, -4.78],[89.19, -4.72],[89.46, -4.54],[89.63, -4.34],[89.70, -4.19],[90.03, -3.87],[90.19, -3.62],[90.24, -3.40],[90.42, -3.29],[90.54, -3.13],[90.54, -2.88],[90.65, -2.73],[90.62, -2.64],[90.69, -2.49],[90.87, -2.48],[90.93, -2.34],[90.88, -2.31],[90.90, -2.17],[91.03, -2.08],[91.01, -1.92],[91.13, -1.64],[91.28, -1.52],[91.46, -1.23],[91.74, -1.10],[91.86, -0.96],[92.04, -1.00],[92.11, -1.14],[92.23, -1.21],[92.49, -1.19],[92.76, -0.92],[92.87, -0.91],[92.90, -0.74],[93.13, -0.74],[93.62, -0.67],[94.61, -0.36],[94.63, -0.16],[95.70, 0.11],[95.94, 0.02],[96.15, 0.02],[96.45, 0.12],[97.14, -0.09],[97.84, 0.10],[98.09, 0.07],[98.49, 0.19],[98.82, 0.18],[99.28, 0.41],[99.69, 0.31],[100.03, 0.35],[100.12, 0.28],[100.32, 0.27],[100.45, 0.15],[100.49, 0.22],[100.67, 0.10],[101.18, 0.05],[101.30, 0.09],[101.43, 0.05],[101.45, -0.13],[101.52, -0.18],[101.71, -0.16],[102.37, -0.40],[102.48, -0.66],[103.00, -0.80],[103.21, -0.88],[103.41, -0.78],[103.83, -0.78],[103.94, -0.85],[104.53, -0.82],[104.71, -0.75],[104.85, -0.75],[104.88, -0.68],[104.92, -0.68],[105.01, -0.79],[105.31, -0.89],[105.46, -0.88],[105.56, -0.82],[105.83, -0.97],[105.94, -0.98],[106.29, -0.87],[106.73, -1.07],[107.57, -1.59],[107.68, -1.59],[107.87, -1.79],[108.90, -0.21],[108.92, 3.22],[108.65, 3.10],[107.90, 3.12],[107.10, 3.29],[106.81, 3.28],[106.54, 3.46],[106.20, 3.57],[106.05, 3.51],[105.91, 3.63],[104.50, 4.11],[104.02, 4.13],[103.68, 4.46],[103.39, 4.37],[102.96, 4.44],[102.88, 4.54],[101.85, 4.80],[101.55, 5.06],[101.35, 5.08],[101.17, 4.89],[100.61, 4.85],[100.34, 4.69],[100.18, 4.77],[99.99, 4.74],[99.81, 4.58],[99.20, 4.35],[98.99, 4.15],[98.85, 3.66],[98.62, 3.45],[98.54, 3.23],[98.42, 3.10],[98.08, 2.93],[97.99, 2.66],[97.76, 2.50],[97.25, 1.91],[96.81, 1.83],[96.20, 2.13],[95.58, 2.13],[95.22, 2.27],[94.98, 2.25],[94.81, 2.08],[94.56, 2.31],[94.36, 2.44],[94.03, 2.41],[93.38, 2.14],[93.30, 2.13],[93.12, 1.94],[92.96, 1.88],[92.83, 1.94],[92.64, 1.85],[92.34, 1.81],[92.20, 1.97],[92.00, 1.85],[91.71, 1.77],[91.55, 1.57],[91.41, 1.58],[91.27, 1.29],[91.09, 1.18],[91.09, 1.11],[91.01, 1.00],[90.58, 0.74],[90.46, 0.74],[90.22, 0.82],[90.08, 0.82],[89.79, 0.74],[89.69, 0.82],[89.56, 0.85],[89.32, 0.73],[89.17, 0.82],[89.04, 0.78],[88.99, 0.68],[88.59, 0.66],[88.39, 0.43],[87.03, -0.48],[86.62, -0.91],[86.19, -1.04],[85.49, -1.18],[85.33, -1.40],[85.34, -1.58],[85.23, -1.69],[85.02, -1.74],[84.89, -1.70],[84.63, -1.92],[84.63, -2.04],[84.54, -2.21],[84.40, -2.31],[84.34, -2.41],[84.41, -2.61],[84.27, -2.79],[84.17, -3.00],[84.35, -3.49],[84.86, -4.25],[85.13, -4.41],[85.24, -4.54],[85.29, -4.83],[85.17, -5.20],[85.26, -5.68],[85.19, -6.19],[85.03, -6.45],[84.85, -6.58],[84.87, -6.80],[85.00, -6.91],[85.24, -7.04],[85.33, -7.23],[85.74, -7.51],[85.92, -7.53],[86.19, -7.70],[86.29, -8.18],[86.60, -9.25],[86.59, -9.32],[86.62, -9.64],[86.50, -9.99],[86.76, -10.68],[87.15, -10.95],[87.69, -11.06],[87.74, -11.12],[87.98, -11.15],[88.07, -11.21],[88.23, -11.24],[88.35, -11.36],[88.62, -11.50],[88.76, -11.77],[88.92, -11.84],[88.96, -12.16],[88.88, -12.35],[88.91, -12.40],[88.81, -12.53],[88.76, -12.71],[88.80, -12.89],[88.78, -12.99],[88.85, -13.34],[88.80, -13.41],[88.84, -13.50],[88.78, -13.56],[88.90, -13.85],[88.88, -13.97],[88.96, -14.15],[88.88, -14.40],[88.92, -14.53],[88.88, -14.58],[88.44, -14.70],[88.42, -14.76],[88.22, -14.77],[88.04, -14.72],[87.86, -14.52],[87.88, -14.43],[87.59, -14.26],[87.46, -13.86],[87.08, -13.54],[87.03, -13.42],[86.72, -13.26],[86.44, -13.17],[86.33, -13.20],[86.21, -13.09],[86.15, -13.10],[86.11, -13.05],[85.79, -11.92],[85.70, -11.92],[85.28, -11.44],[85.26, -11.26],[85.19, -11.12],[85.28, -10.74],[85.36, -10.64],[85.36, -10.57],[85.24, -10.49],[84.92, -10.50],[84.64, -10.32],[84.45, -10.30],[84.39, -10.22],[84.07, -10.31],[83.98, -10.40],[83.73, -10.45],[83.63, -10.40],[83.38, -10.40],[83.25, -10.21],[83.11, -10.16],[82.96, -9.93],[82.55, -9.79],[82.37, -9.66],[82.28, -9.73],[82.04, -9.62],[81.86, -9.63],[81.72, -9.59],[81.51, -9.67],[81.42, -9.78],[81.26, -9.88],[81.17, -9.84],[80.17, -10.27],[80.08, -10.21],[79.43, -10.21],[79.26, -10.12],[79.26, -10.03],[79.19, -9.84],[78.88, -9.61],[78.75, -9.41],[78.73, -9.27],[78.79, -9.18],[78.74, -8.99],[78.82, -8.83],[79.22, -8.56],[79.18, -8.01],[78.67, -8.02],[78.44, -8.33],[78.31, -8.24],[78.34, -8.13],[78.24, -8.20],[78.17, -8.12],[78.26, -8.04],[78.19, -7.98],[78.08, -8.09],[77.98, -8.09],[77.41, -7.59],[76.67, -7.20],[76.60, -7.26],[76.03, -7.25],[75.71, -7.05],[75.62, -6.84],[75.32, -6.75],[75.22, -6.92],[74.99, -6.84],[74.72, -6.95],[74.10, -7.23],[73.40, -7.10],[73.31, -7.17],[73.17, -7.08],[72.93, -7.13],[72.87, -7.06],[72.72, -7.10],[72.57, -7.23],[72.29, -7.61],[72.13, -7.68],[72.00, -7.84],[71.69, -7.89],[71.54, -8.03],[71.48, -8.02],[71.41, -7.89],[71.16, -7.83],[71.01, -7.87],[70.93, -7.98],[70.75, -7.99],[70.44, -8.23],[70.28, -8.60],[70.26, -8.78],[70.34, -8.87],[70.35, -9.02],[69.83, -9.32],[69.70, -9.21],[69.58, -9.15],[69.04, -9.32],[68.62, -9.95],[68.70, -10.48],[68.76, -10.54],[68.69, -10.70],[68.57, -10.77],[68.58, -10.83],[68.68, -10.82],[68.74, -11.00],[68.69, -11.04],[68.75, -11.09],[68.63, -11.31],[68.49, -11.27],[68.39, -11.41],[68.24, -11.48],[68.03, -11.49],[68.01, -11.45],[67.89, -11.44],[67.35, -11.06],[67.17, -11.15],[67.01, -11.02],[66.67, -11.09],[66.65, -11.21],[65.92, -11.45],[65.35, -11.72],[65.09, -11.74],[64.62, -11.58],[64.42, -11.70],[63.81, -11.88],[63.72, -12.16],[64.04, -12.41],[64.09, -12.60],[64.06, -12.72],[63.91, -12.73],[63.87, -12.81],[63.94, -12.89],[63.78, -13.19],[63.69, -13.23],[63.59, -13.24],[63.39, -13.49],[63.25, -13.52],[63.06, -13.86],[63.06, -13.96],[62.92, -14.04],[62.40, -14.02],[62.34, -13.93],[62.23, -13.95],[62.16, -14.05],[61.91, -14.04],[61.34, -14.30],[60.93, -14.47],[60.50, -14.46],[58.97, -15.23],[58.71, -15.53],[58.01, -15.87],[58.02, -15.93],[57.89, -15.97],[57.84, -15.89],[57.76, -15.88],[57.06, -16.14],[56.89, -16.39],[56.93, -16.63],[57.06, -16.83],[57.13, -16.85],[57.21, -16.77],[57.28, -16.77],[57.33, -16.87],[57.53, -16.95],[57.63, -16.93],[57.63, -16.83],[57.70, -16.84],[57.84, -16.98],[57.80, -17.04],[57.92, -17.08],[57.86, -17.14],[57.64, -17.11],[57.29, -17.37],[57.32, -17.52],[57.11, -17.69],[56.89, -17.72],[56.74, -17.87],[56.60, -17.86],[56.50, -17.76],[56.34, -17.70],[56.31, -17.97],[56.04, -18.01],[55.99, -17.97],[55.67, -17.98],[55.22, -18.29],[55.07, -18.35],[55.01, -18.50],[54.92, -18.48],[54.84, -18.43],[54.68, -18.43],[54.48, -18.56],[54.42, -18.55],[54.33, -18.33],[54.22, -18.35],[54.06, -18.27],[54.03, -18.22],[53.94, -18.27],[53.89, -18.19],[53.80, -18.20],[53.64, -18.12],[53.59, -18.06],[53.45, -18.11],[53.38, -18.09],[53.33, -18.18],[53.25, -18.23],[53.27, -18.38],[53.21, -18.51],[53.06, -18.64],[52.98, -18.59],[52.84, -18.61],[52.84, -18.71],[52.72, -18.76],[52.63, -18.96],[52.59, -19.32],[52.48, -19.63],[52.39, -19.62],[52.30, -19.63],[52.28, -19.77],[52.16, -19.80],[52.10, -19.77],[52.09, -19.90],[51.98, -19.90],[51.92, -20.04],[51.76, -20.02],[51.60, -19.92],[51.13, -19.84],[51.09, -19.74],[51.14, -19.67],[51.14, -19.58],[51.09, -19.54],[51.11, -19.48],[51.17, -19.46],[51.12, -19.37],[51.09, -19.24],[51.20, -19.17],[51.20, -19.09],[51.14, -19.10],[51.05, -19.04],[50.84, -18.96],[50.88, -18.84],[50.96, -18.80],[50.96, -18.72]],
            /*Sokota Island[[38.56, -32.39],[38.50, -32.78],[39.12, -33.85],[39.49, -34.02],[40.24, -33.39],[40.62, -31.43],[40.30, -30.96],[39.79, -30.90],[39.14, -31.35]],*/
            /*Riyed Island[[43.35, -30.21],[43.75, -30.82],[45.34, -30.77],[45.89, -30.01],[45.12, -28.71],[44.10, -28.86]],*/
            /*Esfah Island[[46.15, -25.53],[45.96, -26.51],[46.31, -26.69],[47.42, -26.27],[47.71, -25.26],[46.80, -24.96]],*/
            /*Tigris Island[[45.62, -23.87],[44.96, -24.34],[44.99, -24.77],[45.75, -25.01],[46.41, -24.65],[46.35, -24.10]],*/
            /*Shirna Island[[48.76, -23.00],[48.28, -23.53],[47.97, -24.20],[48.51, -24.99],[49.36, -24.95],[49.76, -23.85],[49.50, -23.06]],*/
            /*Orisha Island[[45.77, -18.29],[47.15, -17.48],[47.98, -17.77],[48.41, -18.98],[47.14, -20.69],[45.69, -20.06]],*/
            /*Boa Island[[45.16, -15.36],[46.34, -14.56],[47.75, -15.54],[47.05, -16.60]],*/
            /*Halmad Island[[57.61, -17.83],[56.94, -18.83],[57.48, -19.44],[59.13, -18.86],[58.97, -17.78]],*/
            /*Kashuma Island[[59.22, -15.26],[59.01, -16.15],[59.04, -17.09],[59.47, -17.27],[61.26, -16.35],[62.20, -15.40],[62.02, -14.46],[60.30, -14.70]],*/
            /*Derko Island[[79.12, -11.24],[79.07, -11.79],[79.56, -12.88],[81.16, -13.20],[83.11, -12.62],[83.18, -11.99],[82.12, -10.23],[80.60, -10.33]],*/
            /*Halmad Island(1)*/[[58.41, -18.72],[58.51, -18.65],[58.62, -18.73],[58.44, -18.80]],
            /*Kashuma Island*/[[61.36, -15.69],[61.23, -15.73],[60.85, -15.32],[60.93, -15.08],[61.12, -15.00],[61.25, -14.73],[61.35, -14.74],[61.31, -14.93],[61.20, -15.10],[61.01, -15.16],[60.97, -15.27]],
        ]]
            }                
        },
    {
        "type":"Feature",
        "id":"25",
        "properties":
            {
            "name_EN":"Valencia Sea",
            "name_KR":"발렌시아 해역",
            "fishGroup": ["BlueBatStar", "Corvina", "Tilefish", "PorcupineFish", "Maomao", "JohnDory", "BlackMarlin", "Marlin", "SeaEel", "Seahorse", "Rosefish", "Gurnard", "Ray", "Flounder", "Cuttlefish", "RockHind", "Surfperch", "Sandeel", "harpoon", "BlackSpottedDolphin", "Narwhale", "BelugaWhale", "BottlenoseDolphin", "BlackMarlin", "Marlin", "Cuttlefish"],
            "locationColor": "#FECB66",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Al Halam Sea*/[[108.00, -1.87],[108.86, -2.25],[109.22, -2.32],[109.56, -2.68],[110.06, -2.96],[110.17, -3.64],[110.07, -3.83],[110.06, -4.35],[109.91, -4.42],[111.25, -6.85],[111.62, -7.20],[112.02, -8.23],[112.13, -8.21],[112.47, -8.58],[112.43, -8.85],[112.78, -9.41],[112.86, -10.16],[112.96, -10.43],[113.22, -10.62],[113.23, -10.81],[113.36, -11.28],[113.52, -11.39],[113.51, -11.66],[113.66, -11.88],[113.59, -11.99],[113.70, -12.40],[113.95, -12.91],[114.24, -13.23],[114.55, -13.30],[114.83, -13.49],[114.88, -13.80],[115.04, -14.11],[115.26, -14.35],[115.26, -14.51],[115.37, -14.67],[115.36, -14.76],[115.43, -14.96],[115.78, -15.11],[115.97, -15.25],[116.56, -16.24],[116.72, -16.30],[116.77, -16.43],[116.94, -16.55],[117.37, -17.51],[117.38, -17.82],[117.55, -18.05],[117.76, -18.45],[117.71, -18.68],[117.86, -19.04],[118.10, -19.29],[118.19, -19.58],[118.13, -19.95],[118.17, -20.22],[118.78, -21.15],[118.81, -21.30],[118.74, -21.45],[118.73, -21.59],[119.03, -21.97],[119.12, -22.29],[119.27, -23.64],[119.15, -23.77],[119.19, -24.11],[119.14, -24.28],[119.17, -24.48],[119.14, -24.77],[119.17, -25.03],[118.99, -25.22],[118.98, -25.55],[118.84, -25.84],[118.62, -25.93],[118.55, -26.06],[118.64, -26.11],[118.52, -26.22],[118.52, -26.43],[118.38, -26.62],[118.34, -26.83],[118.15, -27.22],[117.93, -27.42],[117.83, -27.66],[117.75, -28.38],[117.62, -28.67],[117.67, -28.91],[117.53, -29.21],[117.47, -29.89],[117.68, -30.36],[118.08, -30.41],[118.16, -30.47],[118.21, -30.77],[118.28, -30.81],[118.66, -30.74],[118.84, -30.81],[118.97, -30.81],[119.12, -30.85],[119.46, -31.42],[119.69, -31.49],[119.82, -31.64],[119.82, -31.75],[119.92, -31.98],[120.00, -32.00],[120.06, -32.07],[120.05, -32.24],[119.98, -32.33],[120.01, -32.66],[120.12, -32.73],[120.05, -32.95],[119.93, -32.98],[119.90, -33.28],[119.72, -33.40],[119.65, -33.30],[119.53, -33.56],[119.62, -33.78],[119.70, -33.79],[119.74, -33.86],[119.69, -33.87],[119.72, -34.16],[119.64, -34.23],[119.69, -34.29],[119.72, -34.76],[119.90, -34.80],[119.98, -35.10],[120.14, -35.20],[120.04, -35.24],[120.04, -35.38],[119.91, -35.43],[119.80, -35.56],[119.68, -35.59],[119.60, -35.68],[119.63, -35.88],[119.87, -36.05],[119.86, -36.28],[119.79, -36.32],[119.77, -36.61],[119.55, -36.93],[119.46, -36.95],[119.23, -37.12],[119.26, -37.42],[119.43, -37.51],[119.48, -37.62],[119.30, -37.78],[119.36, -38.00],[119.38, -38.21],[119.28, -38.24],[119.44, -38.57],[119.45, -38.72],[119.37, -38.79],[119.89, -39.05],[120.00, -39.30],[119.91, -39.50],[119.71, -39.66],[119.67, -40.02],[119.80, -40.19],[119.76, -40.40],[119.53, -40.43],[119.52, -40.58],[120.00, -41.32],[120.04, -41.55],[119.78, -41.61],[119.57, -41.73],[119.66, -41.89],[119.55, -42.35],[119.29, -42.41],[119.23, -42.56],[119.06, -42.63],[118.84, -42.59],[118.56, -42.90],[118.43, -42.83],[118.00, -42.90],[117.87, -43.31],[118.04, -43.40],[118.10, -43.37],[118.23, -43.48],[118.25, -43.56],[118.43, -43.68],[118.37, -44.13],[118.13, -44.17],[117.86, -44.41],[117.83, -44.58],[118.32, -44.77],[118.27, -44.97],[117.87, -45.31],[117.87, -45.49],[118.46, -45.63],[118.92, -45.49],[119.24, -45.54],[128.5, -43.58],[128.5, 3.07],[112.52, 4.58],[109.80, 4.57],[109.69, 4.24],[109.47, 4.08],[109.29, 3.44],[109.04, 3.28],[109.04, -0.228],],
            /*Hakoven Island[[113.29, 0.62],[115.24, 1.13],[115.95, 0.87],[116.24, -1.26],[116.05, -3.10],[114.29, -3.37],[113.37, -2.53]],*/
        ]]
            }                
        },


    {
        "type":"Feature",
        "id":"26",
        "properties":
            {
            "name_EN":"Oquilla Coast",
            "name_KR":"오킬루아 해역",
            "fishGroup": ["WhiteGrouper", "StripedJewfish", "Skate", "BlackfinSeaPerch", "Cuvier", "GoliathGrouper", "GreaterAmberjack", "StripedBonito", "Sunfish", "Tilefish", "Tuna", "Porgy", "SeaBass", "SmokeyChromis", "Nibbler", "YellowSwordfish", "Swordfish", "Cuttlefish", "Squid", "Saurel", "Mudskipper", "Sandeel", "harpoon", "GiantBlackSquid", "MinkeWhale", "Mackereltuna", "YellowSwordfish", "Swordfish", "Cuttlefish"],
            "locationColor": "#81C5F3",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Oquilla Coast*/[[-19.91, -8.86],[-14.04, -2.52],[-12.72, -2.09],[-11.02, -2.06],[-9.93, -1.89],[-7.82, -0.54],[-4.64, 1.22],[-2.97, 3.81],[-2.86, 4.70],[-1.34, 7.41],[-0.08, 8.39],[1.87, 9.19],[3.96, 9.25],[6.28, 8.61],[11.83, 6.70],[14.62, 6.40],[15.75, 6.62],[17.17, 6.70],[19.73, 5.99],[21.02, 5.32],[26.06, 2.81],[27.98, 2.12],[28.61, 1.83],[27.56, 1.77],[17.93, 0.13],[13.15, -1.05],[9.90, -2.65],[7.98, -3.97],[5.21, -5.23],[0.12, -6.88],[-0.68, -6.99],[-1.78, -7.24],[-4.89, -7.62],[-6.99, -7.29],[-15.23, -6.94],[-17.00, -8.00],[-18.45, -8.25]],
            /*Oquilla Coast(island 1)*/[[13.36, 2.90],[13.40, 2.85],[13.48, 2.87],[13.42, 2.90]],
            /*Oquilla Coast(island 2)*/[[12.79, 3.03],[12.81, 3.07],[12.99, 3.11],[13.07, 2.96],[12.95, 2.81],[12.87, 2.78],[12.79, 2.87]],
            
            /*Oquilla's Eye[[0.29, 6.59],[-0.05, 4.63],[3.16, 1.81],[5.46, 1.76],[6.87, 3.41],[6.30, 5.74],[4.04, 7.23]],*/
        ]]
            }                
        },
    {
        "type":"Feature",
        "id":"27",
        "properties":
            {
            "name_EN":"Oquilla Coast",
            "name_KR":"오킬루아 해역",
            "fishGroup": ["Cuttlefish", "Squid", "Saurel", "Mudskipper", "Sandeel"],
            "locationColor": "#909090",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Oquilla Coast(island 1)*/[[13.36, 2.90],[13.40, 2.85],[13.48, 2.87],[13.42, 2.90]],
            /*Oquilla Coast(island 2)*/[[12.79, 3.03],[12.81, 3.07],[12.99, 3.11],[13.07, 2.96],[12.95, 2.81],[12.87, 2.78],[12.79, 2.87]],
        ]]
            }                
        },
    {
        "type":"Feature",
        "id":"28",
        "properties":
            {
            "name_EN":"Ross Sea",
            "name_KR":"로스 해역",
            "fishGroup": ["WhiteGrouper", "StripedJewfish", "Skate", "BlackfinSeaPerch", "Cuvier", "GoliathGrouper", "GreaterAmberjack", "StripedBonito", "Sunfish", "Tilefish", "Tuna", "Porgy", "SeaBass", "SmokeyChromis", "Nibbler", "YellowSwordfish", "Swordfish", "Cuttlefish", "Squid", "Saurel", "Mudskipper", "Sandeel", "harpoon", "GiantBlackSquid", "MinkeWhale", "Mackereltuna", "YellowSwordfish", "Swordfish", "Cuttlefish"],
            "locationColor": "#81D1F3",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Ross Sea*/[[49.89, -15.20],[48.26, -6.98],[48.38, 14.82],[47.66, 19.02],[40.96, 18.96],[33.16, 17.46],[12.04, 15.52],[-6.83, 12.06],[-15.45, 8.95],[-35.75, 3.36],[-42.87, -7.28],[-46.27, -20.22],[-48.19, -36.42],[-52.47, -45.01],[-54.23, -46.89],[-54.25, -47.52],[-53.88, -48.02],[-53.50, -48.02],[-49.47, -48.68],[-40.58, -48.68],[-37.02, -38.07],[-32.12, -28.76],[-32.06, -27.88],[-32.20, -27.49],[-32.32, -23.64],[-30.53, -19.20],[-28.41, -16.99],[-28.06, -16.40],[-22.39, -10.34],[-20.16, -8.91],[-14.14, -2.37],[-12.73, -1.92],[-11.05, -1.89],[-10.00, -1.72],[-7.93, -0.39],[-4.77, 1.35],[-3.16, 3.86],[-3.05, 4.80],[-1.49, 7.54],[-0.16, 8.60],[1.87, 9.41],[3.99, 9.46],[6.31, 8.82],[11.87, 6.91],[14.61, 6.59],[15.74, 6.82],[17.17, 6.91],[19.82, 6.17],[26.12, 3.03],[28.02, 2.32],[28.65, 2.05],[31.03, 2.10],[32.36, 2.37],[33.93, 2.43],[35.64, 1.95],[38.22, 0.35],[39.57, -1.07],[40.50, -2.54],[41.26, -3.09],[44.11, -7.73],[47.80, -11.66]],
        ]]
            }                
        },
    {
        "type":"Feature",
        "id":"29",
        "properties":
            {
            "name_EN":"Vadabin Sea",
            "name_KR":"바다빈 해역",
            "fishGroup": ["Rosefish", "Shellfish", "FlyingFish", "Starfish", "Sandeel"],
            "locationColor": "#909090",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Vadabin Sea(green fish area)*/[[-117.83, 40.21],[-116.85, 39.61],[-110.89, 38.97],[-107.64, 39.53],[-106.12, 40.88],[-105.56, 41.60],[-105.41, 42.87],[-106.03, 44.17],[-106.01, 46.03],[-106.47, 47.23],[-106.59, 48.79],[-107.51, 50.73],[-108.80, 52.10],[-111.28, 53.84],[-111.87, 53.85],[-114.24, 53.52],[-114.36, 53.85],[-113.55, 54.51],[-111.86, 54.48],[-108.68, 54.71],[-105.84, 53.91],[-101.68, 53.94],[-99.32, 54.53],[-96.95, 57.42],[-95.52, 59.65],[-93.89, 59.83],[-93.24, 60.36],[-93.78, 61.02],[-92.07, 60.90],[-90.96, 60.95],[-89.59, 60.71],[-89.34, 60.59],[-89.36, 60.47],[-86.79, 60.55],[-86.74, 61.01],[-86.33, 61.12],[-85.65, 61.10],[-85.10, 60.64],[-84.84, 60.61],[-84.56, 60.50],[-84.55, 60.42],[-82.47, 60.22],[-77.16, 59.47],[-75.55, 60.40],[-75.00, 61.85],[-71.70, 62.79],[-66.07, 63.57],[-43.57, 67.43],[-33.46, 68.30],[-30.31, 68.64],[-30.91, 68.64],[-33.52, 68.41],[-42.47, 67.97],[-43.93, 67.96],[-44.22, 67.71],[-66.12, 63.78],[-71.83, 63.07],[-76.24, 61.82],[-76.28, 61.66],[-76.68, 61.39],[-76.67, 61.25],[-76.75, 61.18],[-76.74, 60.99],[-76.67, 60.97],[-76.65, 60.88],[-76.55, 60.84],[-76.51, 60.78],[-76.65, 60.69],[-76.69, 60.57],[-76.60, 60.50],[-76.60, 60.46],[-76.71, 60.39],[-76.75, 60.28],[-77.15, 60.09],[-77.20, 60.10],[-77.26, 60.08],[-77.23, 60.05],[-77.34, 59.95],[-77.45, 59.95],[-77.77, 59.92],[-77.81, 59.89],[-77.90, 59.94],[-78.03, 59.96],[-78.12, 60.03],[-78.18, 60.04],[-78.29, 60.00],[-78.40, 60.00],[-78.76, 60.14],[-78.98, 60.11],[-79.26, 60.17],[-79.30, 60.26],[-79.44, 60.28],[-79.57, 60.20],[-79.71, 60.21],[-79.76, 60.29],[-79.79, 60.32],[-79.99, 60.33],[-80.07, 60.37],[-80.05, 60.48],[-80.10, 60.53],[-80.07, 60.58],[-80.23, 60.65],[-80.39, 60.64],[-80.65, 60.57],[-80.91, 60.56],[-81.10, 60.54],[-81.26, 60.47],[-81.40, 60.47],[-81.50, 60.53],[-81.69, 60.57],[-81.91, 60.58],[-82.15, 60.58],[-82.29, 60.60],[-82.45, 60.68],[-82.71, 60.72],[-83.08, 60.69],[-83.52, 60.62],[-83.73, 60.62],[-83.83, 60.65],[-83.94, 60.62],[-83.98, 60.64],[-84.03, 60.69],[-84.18, 60.72],[-84.41, 60.86],[-84.69, 60.91],[-84.82, 60.87],[-84.89, 60.91],[-85.00, 60.92],[-85.01, 60.97],[-85.05, 61.00],[-85.01, 61.03],[-85.02, 61.08],[-85.09, 61.13],[-85.12, 61.21],[-85.40, 61.35],[-85.39, 61.39],[-85.58, 61.44],[-85.61, 61.52],[-85.89, 61.59],[-85.85, 61.66],[-86.09, 61.85],[-86.19, 61.87],[-86.34, 61.82],[-86.64, 61.54],[-86.70, 61.35],[-87.06, 61.12],[-87.18, 61.12],[-87.31, 61.08],[-87.40, 60.98],[-87.57, 60.91],[-87.75, 60.90],[-87.88, 60.84],[-87.93, 60.79],[-88.04, 60.79],[-87.98, 60.83],[-88.04, 60.85],[-88.12, 60.80],[-88.22, 60.84],[-88.33, 60.80],[-88.46, 60.81],[-88.46, 60.89],[-88.64, 60.95],[-88.93, 61.12],[-89.51, 61.15],[-89.52, 61.12],[-89.28, 61.08],[-89.24, 60.90],[-89.27, 60.82],[-89.37, 60.82],[-89.42, 60.87],[-89.64, 60.87],[-89.71, 60.97],[-89.64, 61.10],[-89.75, 61.10],[-89.85, 61.14],[-89.85, 61.19],[-89.95, 61.17],[-89.99, 61.19],[-90.01, 61.28],[-90.44, 61.35],[-90.52, 61.40],[-90.59, 61.56],[-90.66, 61.59],[-90.77, 61.60],[-91.03, 61.57],[-91.07, 61.59],[-91.21, 61.59],[-91.28, 61.56],[-91.48, 61.51],[-91.57, 61.47],[-91.58, 61.40],[-91.64, 61.40],[-91.72, 61.37],[-91.76, 61.34],[-91.81, 61.34],[-91.91, 61.14],[-92.35, 61.14],[-92.49, 61.30],[-92.61, 61.32],[-92.76, 61.22],[-93.16, 61.21],[-93.59, 61.38],[-93.72, 61.35],[-93.89, 61.39],[-94.38, 61.16],[-94.44, 61.08],[-94.38, 61.01],[-94.50, 60.90],[-94.37, 60.67],[-94.03, 60.57],[-93.97, 60.50],[-93.99, 60.47],[-93.88, 60.42],[-93.63, 60.40],[-93.59, 60.37],[-93.60, 60.26],[-93.83, 60.11],[-93.96, 60.08],[-94.01, 59.98],[-94.13, 59.91],[-94.30, 59.90],[-94.45, 59.95],[-94.65, 60.06],[-94.58, 60.14],[-94.58, 60.22],[-94.63, 60.27],[-94.75, 60.28],[-94.93, 60.38],[-95.11, 60.38],[-95.26, 60.32],[-95.37, 60.24],[-95.56, 60.25],[-96.09, 60.05],[-96.10, 60.01],[-96.48, 59.91],[-96.78, 59.89],[-96.92, 59.85],[-96.94, 59.80],[-96.85, 59.71],[-96.96, 59.11],[-97.06, 59.08],[-97.49, 58.40],[-97.44, 58.32],[-97.61, 58.23],[-97.79, 57.57],[-98.00, 57.43],[-98.03, 57.27],[-98.45, 57.12],[-98.46, 57.07],[-98.60, 57.05],[-98.84, 56.94],[-98.95, 56.96],[-99.24, 56.94],[-99.47, 56.87],[-99.54, 56.82],[-99.91, 56.91],[-100.03, 56.88],[-100.01, 56.83],[-99.87, 56.78],[-99.89, 56.72],[-99.82, 56.60],[-99.94, 56.50],[-99.89, 56.42],[-99.92, 56.36],[-99.71, 56.28],[-99.40, 56.04],[-99.42, 55.94],[-99.54, 55.88],[-99.61, 55.79],[-99.61, 55.46],[-99.76, 55.48],[-100.10, 55.04],[-100.07, 54.91],[-100.17, 54.81],[-100.26, 54.78],[-100.34, 54.79],[-100.54, 54.65],[-100.71, 54.63],[-101.25, 54.64],[-101.63, 54.71],[-101.97, 54.97],[-101.94, 55.00],[-102.16, 55.06],[-102.41, 55.07],[-102.55, 55.11],[-102.67, 55.22],[-102.65, 55.32],[-102.80, 55.53],[-102.91, 55.56],[-103.02, 55.52],[-103.11, 55.56],[-103.14, 55.62],[-103.32, 55.67],[-103.45, 55.63],[-103.53, 55.64],[-103.64, 55.72],[-103.78, 55.71],[-103.89, 55.69],[-103.98, 55.74],[-103.99, 55.83],[-104.19, 55.88],[-104.27, 55.90],[-104.40, 55.86],[-104.75, 55.87],[-104.84, 55.85],[-105.03, 55.88],[-105.07, 55.84],[-105.36, 55.85],[-105.47, 55.88],[-105.80, 55.73],[-105.92, 55.71],[-106.06, 55.60],[-105.94, 55.25],[-105.72, 55.14],[-105.64, 55.05],[-105.35, 54.90],[-105.13, 54.86],[-104.99, 54.79],[-104.94, 54.71],[-104.86, 54.74],[-104.76, 54.70],[-104.71, 54.60],[-104.83, 54.58],[-104.89, 54.59],[-104.84, 54.49],[-104.92, 54.43],[-105.64, 54.38],[-105.72, 54.34],[-106.01, 54.43],[-106.14, 54.53],[-106.23, 54.65],[-106.43, 54.75],[-106.75, 54.77],[-107.05, 54.83],[-107.50, 54.87],[-107.62, 54.79],[-107.75, 54.81],[-107.97, 54.97],[-108.46, 54.99],[-108.95, 54.96],[-109.83, 55.22],[-110.00, 55.22],[-110.42, 55.12],[-110.55, 55.05],[-111.09, 55.09],[-111.28, 55.01],[-111.82, 54.60],[-112.12, 54.58],[-112.55, 54.67],[-112.75, 54.96],[-112.98, 55.11],[-113.72, 55.13],[-114.26, 55.03],[-114.28, 54.99],[-114.09, 54.76],[-114.12, 54.67],[-114.26, 54.60],[-114.44, 54.61],[-114.49, 54.68],[-114.59, 54.62],[-114.58, 54.50],[-114.82, 54.35],[-114.89, 54.24],[-114.97, 54.04],[-115.28, 53.82],[-115.58, 53.78],[-115.50, 53.61],[-115.34, 53.42],[-114.88, 53.25],[-113.94, 53.21],[-113.61, 53.33],[-112.93, 53.33],[-112.59, 53.47],[-112.30, 53.69],[-111.86, 53.69],[-111.63, 53.77],[-111.46, 53.74],[-111.27, 53.56],[-110.98, 52.70],[-110.83, 52.50],[-110.59, 52.44],[-110.35, 52.23],[-110.21, 52.18],[-110.09, 52.00],[-110.18, 51.88],[-110.16, 51.64],[-109.91, 51.41],[-109.65, 50.89],[-109.46, 50.80],[-109.33, 50.82],[-109.23, 50.76],[-109.22, 50.70],[-109.30, 50.65],[-109.28, 50.59],[-109.11, 50.53],[-109.14, 50.44],[-109.30, 50.41],[-109.32, 50.30],[-108.89, 49.87],[-108.44, 49.53],[-108.42, 49.47],[-108.18, 49.24],[-108.01, 49.02],[-108.03, 48.93],[-108.00, 48.89],[-107.91, 48.88],[-107.87, 48.81],[-107.95, 48.75],[-107.90, 48.68],[-107.81, 48.73],[-107.66, 48.68],[-107.66, 48.52],[-107.74, 48.47],[-107.72, 48.38],[-107.48, 48.10],[-107.45, 48.02],[-107.49, 47.94],[-107.34, 47.84],[-107.24, 47.71],[-107.29, 47.67],[-107.29, 47.58],[-107.23, 47.51],[-107.17, 46.95],[-107.21, 46.85],[-107.18, 46.71],[-106.86, 46.28],[-106.92, 46.17],[-106.66, 46.03],[-106.66, 45.94],[-106.78, 45.88],[-106.57, 45.64],[-106.67, 45.51],[-106.62, 45.35],[-106.85, 45.25],[-106.85, 45.19],[-106.97, 45.16],[-106.99, 45.10],[-106.89, 44.96],[-106.78, 44.92],[-106.75, 44.81],[-106.85, 44.76],[-106.83, 44.67],[-106.94, 44.65],[-106.98, 44.53],[-107.11, 44.51],[-107.12, 44.45],[-107.24, 44.38],[-107.21, 44.10],[-106.91, 43.65],[-106.78, 43.62],[-106.74, 43.64],[-106.67, 43.76],[-106.53, 43.75],[-106.50, 43.69],[-106.53, 43.62],[-106.74, 43.56],[-106.91, 43.37],[-106.92, 43.03],[-106.84, 42.74],[-106.74, 42.61],[-106.62, 42.55],[-106.63, 42.42],[-106.57, 42.32],[-106.64, 42.23],[-106.61, 41.97],[-106.66, 41.85],[-106.59, 41.71],[-106.64, 41.55],[-106.65, 41.37],[-106.81, 41.13],[-107.34, 40.74],[-107.42, 40.58],[-107.73, 40.54],[-107.98, 40.46],[-108.47, 40.20],[-108.51, 40.09],[-108.68, 40.06],[-108.80, 39.97],[-108.97, 39.95],[-109.11, 39.83],[-109.52, 39.72],[-109.81, 39.70],[-109.92, 39.64],[-109.99, 39.72],[-110.08, 39.64],[-110.31, 39.62],[-110.73, 39.72],[-110.93, 39.69],[-111.06, 39.74],[-111.40, 39.74],[-111.59, 39.81],[-111.64, 39.88],[-111.65, 39.96],[-111.75, 40.02],[-111.83, 40.08],[-112.23, 40.10],[-112.46, 40.23],[-112.52, 40.30],[-113.35, 40.49],[-113.42, 40.36],[-113.54, 40.32],[-113.71, 40.22],[-113.92, 40.21],[-113.96, 40.27],[-114.03, 40.27],[-114.08, 40.24],[-114.22, 40.24],[-114.60, 40.33],[-114.81, 40.46],[-115.07, 40.43],[-115.27, 40.47],[-115.48, 40.59],[-115.88, 40.65],[-116.26, 40.59],[-116.65, 40.38],[-117.20, 40.24]],
        ]]
            }                
        },
    {
        "type":"Feature",
        "id":"30",
        "properties":
            {
            "name_EN":"Vadabin Sea",
            "name_KR":"바다빈 해역",
            "fishGroup": ["StripedJewfish", "Skate", "BlackfinSeaPerch", "Cuvier", "GoliathGrouper", "GreaterAmberjack", "StripedBonito", "Sunfish", "Tilefish", "Tuna", "Porgy", "SeaBass", "SmokeyChromis", "Nibbler", "Marlin", "Swordfish", "Rosefish", "Shellfish", "FlyingFish", "Starfish", "Sandeel", "harpoon", "BelugaWhale", "GiantGrouper", "Marlin", "Swordfish", "Cuttlefish"],
            "locationColor": "#96D765",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Vadabin Sea*/[[-116.85, 39.43],[-110.90, 38.77],[-107.45, 39.37],[-105.82, 40.80],[-105.23, 41.52],[-105.06, 42.96],[-105.69, 44.27],[-105.66, 46.05],[-106.14, 47.29],[-106.23, 48.85],[-107.15, 50.84],[-108.47, 52.21],[-110.98, 53.98],[-111.91, 54.01],[-114.00, 53.70],[-114.04, 53.83],[-113.45, 54.33],[-111.83, 54.30],[-108.78, 54.46],[-106.01, 53.69],[-101.46, 53.73],[-98.87, 54.34],[-96.53, 57.31],[-95.11, 59.50],[-93.59, 59.66],[-92.76, 60.35],[-93.08, 60.76],[-91.96, 60.69],[-90.91, 60.74],[-89.98, 60.55],[-89.86, 60.31],[-89.68, 60.24],[-89.26, 60.28],[-86.44, 60.39],[-85.94, 60.57],[-85.79, 60.81],[-85.50, 60.59],[-85.58, 60.52],[-85.54, 60.40],[-85.03, 60.26],[-84.84, 60.26],[-84.75, 60.29],[-82.58, 60.08],[-77.03, 59.28],[-75.14, 60.35],[-74.64, 61.73],[-71.36, 62.65],[-65.81, 63.41],[-43.55, 67.3041],[-33.35, 68.18],[-29.54, 68.64],[-28.75, 68.64],[-32.20, 67.83],[-65.92, 54.38],[-101.12, 36.46],[-104.92, 34.62],[-107.49, 32.81],[-109.95, 30.60],[-114.68, 27.49],[-116.74, 36.30]],
        ]]
            }                
        },
    {
        "type":"Feature",
        "id":"31",
        "properties":
            {
            "name_EN":"Juur Sea",
            "name_KR":"유르 해역",
            "fishGroup": ["GoldenAlbacore", "StripedJewfish", "Skate", "BlackfinSeaPerch", "Cuvier", "GoliathGrouper", "GreaterAmberjack", "StripedBonito", "Sunfish", "Tilefish", "Tuna", "Porgy", "SeaBass", "SmokeyChromis", "Nibbler", "Sailfish", "Swordfish", "MackerelPike", "StripedCatfish", "Beltfish", "Dolphinfish", "Surfperch", "harpoon", "BluefinTuna", "Sturgeon", "Sailfish", "Swordfish", "Cuttlefish"],
            "locationColor": "#2BB69A",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Juur Sea*/[[-114.65, 27.16],[-114.21, 9.67],[-113.31, 4.35],[-113.31, 7.99],[-111.82, 13.60],[-99.07, 19.85],[-82.68, 34.45],[-45.15, 52.68],[-14.46, 65.93],[-11.93, 66.80],[-11.10, 66.80],[-11.10, 66.96],[-19.53, 68.69],[-28.29, 68.64],[-31.96, 67.73],[-65.71, 54.24],[-100.97, 36.28],[-104.75, 34.42],[-107.28, 32.66],[-109.75, 30.39]],
        ]]
            }                
        },
    {
        "type":"Feature",
        "id":"32",
        "properties":
            {
            "name_EN":"Margoria Sea (South)",
            "name_KR":"마고리아 해역 (남부)",
            "fishGroup": ["WhiteGrouper", "AlbinoCoelacanth", "StripedJewfish", "Skate", "BlackfinSeaPerch", "Cuvier", "GoliathGrouper", "GreaterAmberjack", "StripedBonito", "Sunfish", "Tilefish", "Tuna", "Porgy", "SeaBass", "SmokeyChromis", "Nibbler", "Marlin", "YellowSwordfish", "Rockfish", "Jellyfish", "RockHind", "Sandeel", "harpoon", "GiantBlackSquid", "HumpbackWhale", "BigeyeTuna", "Marlin", "YellowSwordfish", "Cuttlefish"],
            "locationColor": "#628BB3",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Margoria Sea (South)*/[[-67.41, -44.72],[-54.68, -48.03],[-55.07, -47.49],[-55.04, -46.84],[-53.12, -44.82],[-48.78, -36.33],[-47.02, -20.16],[-43.57, -7.10],[-36.19, 3.91],[-15.75, 9.51],[-7.08, 12.66],[11.87, 16.13],[33.00, 18.02],[40.85, 19.56],[47.64, 19.62],[45.00, 27.64],[43.95, 37.02],[33.53, 46.04],[14.99, 39.67],[-7.60, 34.74],[-15.03, 32.44],[-40.96, 17.73],[-48.30, 10.92],[-52.60, 2.77],[-56.69, -1.98],[-63.50, -8.28],[-86.66, -31.39]],
        ]]
            }                
        },
    {
        "type":"Feature",
        "id":"33",
        "properties":
            {
            "name_EN":"Margoria Sea (Middle)",
            "name_KR":"마고리아 해역 (중부)",
            "fishGroup": ["WhiteGrouper", "AlbinoCoelacanth", "StripedJewfish", "Skate", "BlackfinSeaPerch", "Cuvier", "GoliathGrouper", "GreaterAmberjack", "StripedBonito", "Sunfish", "Tilefish", "Tuna", "Porgy", "SeaBass", "SmokeyChromis", "Nibbler", "Sailfish", "Marlin", "Butterflyfish", "Filefish", "Seahorse", "Mackerel", "Surfperch", "harpoon", "RequiemShark", "KillerWhale", "YellowfinTuna", "Sailfish", "Marlin", "Cuttlefish",],
            "locationColor": "#415895",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Margoria Sea (Middle)*/[[14.61, 40.31],[33.02, 46.63],[26.41, 56.34],[13.32, 63.02],[6.77, 63.53],[-15.60, 47.03],[-42.32, 33.28],[-63.11, 22.72],[-74.49, 13.67],[-81.04, 6.71],[-90.13, -4.96],[-104.24, -15.37],[-87.43, -30.56],[-64.03, -7.49],[-57.41, -1.45],[-53.42, 3.10],[-49.09, 11.35],[-41.55, 18.31],[-15.31, 33.12],[-7.89, 35.41]],
        ]]
            }                
        },
    {
        "type":"Feature",
        "id":"34",
        "properties":
            {
            "name_EN":"Margoria Sea (North)",
            "name_KR":"마고리아 해역 (북부)",
            "fishGroup": ["Footballfish", "StripedJewfish", "Skate", "BlackfinSeaPerch", "Cuvier", "GoliathGrouper", "GreaterAmberjack", "StripedBonito", "Sunfish", "Tilefish", "Tuna", "Porgy", "SeaBass", "SmokeyChromis", "Nibbler", "Sailfish", "BlackMarlin", "ScorpionFish", "Flounder", "TongueSole", "Squid", "Surfperch", "harpoon", "GiantBlackSquid", "BlackSpottedDolphin", "HumpbackWhale", "BigeyeTuna", "Marlin", "YellowSwordfish", "Cuttlefish"],
            "locationColor": "#282472",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Margoria Sea (North)*/[[-113.27, 4.11],[-111.67, -7.97],[-110.08, -11.70],[-104.99, -14.86],[-90.75, -4.43],[-81.83, 7.19],[-75.32, 14.14],[-63.72, 23.36],[-42.80, 34.09],[-16.35, 47.52],[5.63, 63.66],[-9.12, 66.58],[-11.62, 66.57],[-44.65, 52.19],[-82.18, 33.78],[-98.48, 19.21],[-111.13, 13.05],[-112.46, 8.02],[-112.54, 4.11]],
            /*Ghost Whale area*/[[-93.08, 17.75],[-93.08, 12.32],[-87.21, 12.32],[-87.21, 17.75]],
        ]]
            }                
        },
    {
        "type":"Feature",
        "id":"35",
        "properties":
            {
            "name_EN":"Margoria Sea (Ghost Whale area)",
            "name_KR":"마고리아 해역 (귀신고래 지역)",
            "fishGroup": ["Footballfish", "StripedJewfish", "Skate", "BlackfinSeaPerch", "Cuvier", "GoliathGrouper", "GreaterAmberjack", "StripedBonito", "Sunfish", "Tilefish", "Tuna", "Porgy", "SeaBass", "SmokeyChromis", "Nibbler", "Sailfish", "BlackMarlin", "ScorpionFish", "Flounder", "TongueSole", "Squid", "Surfperch", "harpoon", "GhostWhale", "BlackSpottedDolphin", "HammerWhale", "Albacore", "Sailfish", "BlackMarlin", "Cuttlefish"],
            "locationColor": "#FF4343",
        },
        "geometry":
            {
            "type":"MultiPolygon",
            "coordinates":[[
            /*Margoria Sea (Ghost Whale area)*/[[-93.08, 17.75],[-93.08, 12.32],[-87.21, 12.32],[-87.21, 17.75]],
        ]]
            }                
        },
]};






//----------------------------------------------//
//----------       Marker Icons       ----------//
//----------------------------------------------//
//----  Node Icons  ----//
var IconCity = L.icon({
    iconUrl: 'icons/City.png',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    tooltipAnchor: [21, 30]
});
var IconTown = L.icon({
    iconUrl: 'icons/Town.png',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    tooltipAnchor: [18, 26]
});
var IconNode1 = L.icon({
    iconUrl: 'icons/Node1.png',
    iconSize: [34, 30],
    iconAnchor: [17, 15],
    tooltipAnchor: [17, 21]
});
var IconNode2 = L.icon({
    iconUrl: 'icons/Node2.png',
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    tooltipAnchor: [19, 25]
});
var IconNode3 = L.icon({
    iconUrl: 'icons/Node3.png',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    tooltipAnchor: [17, 23]
});
var IconNode4 = L.icon({
    iconUrl: 'icons/Node4.png',
    iconSize: [34, 32],
    iconAnchor: [17, 16],
    tooltipAnchor: [17, 23]
});
//----  Node Small Icons  ----//
var IconCitySmall = L.icon({
    iconUrl: 'icons/City.png',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    tooltipAnchor: [11, 20]
});
var IconTownSmall = L.icon({
    iconUrl: 'icons/Town.png',
    iconSize: [19, 19],
    iconAnchor: [9.5, 9.5],
    tooltipAnchor: [9.5, 15.5]
});
var IconNode1Small = L.icon({
    iconUrl: 'icons/Node1.png',
    iconSize: [17, 15],
    iconAnchor: [8.5, 7.5],
    tooltipAnchor: [8.5, 13.5]
});
var IconNode2Small = L.icon({
    iconUrl: 'icons/Node2.png',
    iconSize: [19, 19],
    iconAnchor: [9.5, 9.5],
    tooltipAnchor: [9.5, 15.5]
});
var IconNode3Small = L.icon({
    iconUrl: 'icons/Node3.png',
    iconSize: [17, 17],
    iconAnchor: [8.5, 8.5],
    tooltipAnchor: [8.5, 14.5]
});
var IconNode4Small = L.icon({
    iconUrl: 'icons/Node4.png',
    iconSize: [17, 16],
    iconAnchor: [8.5, 8],
    tooltipAnchor: [8.5, 15]
});


//----  Monster Icons  ----//
var IconVell = L.icon({
    iconUrl: 'icons/Vell.png',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    tooltipAnchor: [25, 30]
});
var IconYoungSeaMonster = L.icon({
    iconUrl: 'icons/YoungSeaMonster.png',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    tooltipAnchor: [25, 28]
});
var IconHekaru = L.icon({
    iconUrl: 'icons/Hekaru.png',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    tooltipAnchor: [25, 25]
});
var IconOceanStalker = L.icon({
    iconUrl: 'icons/OceanStalker.png',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    tooltipAnchor: [25, 25]
});
var IconNineshark = L.icon({
    iconUrl: 'icons/Nineshark.png',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    tooltipAnchor: [25, 25]
});
var IconCandidum = L.icon({
    iconUrl: 'icons/Candidum.png',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    tooltipAnchor: [25, 27]
});
var IconBlackRust = L.icon({
    iconUrl: 'icons/BlackRust.png',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    tooltipAnchor: [25, 24]
});
var IconSaltwaterCrocodile = L.icon({
    iconUrl: 'icons/SaltwaterCrocodile.png',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    tooltipAnchor: [25, 26]
});
var IconCoxPiratesShadowGhost = L.icon({
    iconUrl: 'icons/CoxPiratesShadowGhost.png',
    iconSize: [40, 40],
    iconAnchor: [17.5, 17.5],
});
var IconCargoShip = L.icon({
    iconUrl: 'icons/CargoShip.png',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});
var IconDrunkSniper = L.icon({
    iconUrl: 'icons/DrunkSniper.png',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});
var IconPirateFlag = L.icon({
    iconUrl: 'icons/PirateFlag.png',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

var IconBlackRust2 = L.icon({
    iconUrl: 'icons/BlackRust2.png',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    tooltipAnchor: [25, 26]
});
var IconGoldmontPirate = L.icon({
    iconUrl: 'icons/GoldmontPirate.png',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    tooltipAnchor: [25, 27]
});
var IconLekrashan = L.icon({
    iconUrl: 'icons/Lekrashan.png',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    tooltipAnchor: [25, 27]
});


//----  Monster Small Icons  ----//
var IconVellSmall = L.icon({
    iconUrl: 'icons/Vell.png',
    iconSize: [35, 35],
    iconAnchor: [17.5, 17.5],
    tooltipAnchor: [17.5, 24.5]
});
var IconYoungSeaMonsterSmall = L.icon({
    iconUrl: 'icons/YoungSeaMonster.png',
    iconSize: [35, 35],
    iconAnchor: [17.5, 17.5],
    tooltipAnchor: [17.5, 21.5]
});
var IconHekaruSmall = L.icon({
    iconUrl: 'icons/Hekaru.png',
    iconSize: [35, 35],
    iconAnchor: [17.5, 17.5],
    tooltipAnchor: [17.5, 20.5]
});
var IconOceanStalkerSmall = L.icon({
    iconUrl: 'icons/OceanStalker.png',
    iconSize: [35, 35],
    iconAnchor: [17.5, 17.5],
    tooltipAnchor: [17.5, 20.5]
});
var IconNinesharkSmall = L.icon({
    iconUrl: 'icons/Nineshark.png',
    iconSize: [35, 35],
    iconAnchor: [17.5, 17.5],
    tooltipAnchor: [17.5, 20.5]
});
var IconCandidumSmall = L.icon({
    iconUrl: 'icons/Candidum.png',
    iconSize: [35, 35],
    iconAnchor: [17.5, 17.5],
    tooltipAnchor: [17.5, 23.5]
});
var IconBlackRustSmall = L.icon({
    iconUrl: 'icons/BlackRust.png',
    iconSize: [35, 35],
    iconAnchor: [17.5, 17.5],
    tooltipAnchor: [17.5, 19.5]
});
var IconSaltwaterCrocodileSmall = L.icon({
    iconUrl: 'icons/SaltwaterCrocodile.png',
    iconSize: [35, 35],
    iconAnchor: [17.5, 17.5],
    tooltipAnchor: [17.5, 20.5]
});
var IconCoxPiratesShadowGhostSmall = L.icon({
    iconUrl: 'icons/CoxPiratesShadowGhost.png',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

var IconBlackRust2Small = L.icon({
    iconUrl: 'icons/BlackRust2.png',
    iconSize: [35, 35],
    iconAnchor: [17.5, 17.5],
    tooltipAnchor: [17.5, 20.5]
});
var IconGoldmontPirateSmall = L.icon({
    iconUrl: 'icons/GoldmontPirate.png',
    iconSize: [35, 35],
    iconAnchor: [17.5, 17.5],
    tooltipAnchor: [17.5, 21.5]
});
var IconLekrashanSmall = L.icon({
    iconUrl: 'icons/Lekrashan.png',
    iconSize: [35, 35],
    iconAnchor: [17.5, 17.5],
    tooltipAnchor: [17.5, 20.5]
});


//----  NPC Icons  ----//
var IconHarbor = L.icon({
    iconUrl: 'icons/Harbor.png',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
});
var IconImperialFishingDelivery = L.icon({
    iconUrl: 'icons/ImperialFishingDelivery.png',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
});
var IconTradeManager = L.icon({
    iconUrl: 'icons/TradeManager.png',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
});
var IconBarterer = L.icon({
    iconUrl: 'icons/Barterer.png',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});
var IconBartererOcean = L.icon({
    iconUrl: 'icons/BartererOcean.png',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    tooltipAnchor: [10, 22]
});


//----- Seagull Fishing Point -----//
var seagullSize = [25, 25];
var seagullAnchor = [12.5, 12.5];

var IconCoelacanth = L.icon({
    iconUrl: 'icons/seagull/Coelacanth.png',
    iconSize: seagullSize,
    iconAnchor: seagullAnchor,
    className: 'Coelacanth',
});
var IconGrunt = L.icon({
    iconUrl: 'icons/seagull/Grunt.png',
    iconSize: seagullSize,
    iconAnchor: seagullAnchor,
    className: 'Grunt',
});
var IconTuna = L.icon({
    iconUrl: 'icons/seagull/Tuna.png',
    iconSize: seagullSize,
    iconAnchor: seagullAnchor,
    className: 'Tuna',
});
var IconGiantOctopus = L.icon({
    iconUrl: 'icons/seagull/GiantOctopus.png',
    iconSize: seagullSize,
    iconAnchor: seagullAnchor,
    className: 'GiantOctopus',
});
var IconSpottedSeaBass = L.icon({
    iconUrl: 'icons/seagull/SpottedSeaBass.png',
    iconSize: seagullSize,
    iconAnchor: seagullAnchor,
    className: 'SpottedSeaBass',
});
var IconTilefish = L.icon({
    iconUrl: 'icons/seagull/Tilefish.png',
    iconSize: seagullSize,
    iconAnchor: seagullAnchor,
    className: 'Tilefish',
});
var IconBlueGrouper = L.icon({
    iconUrl: 'icons/seagull/BlueGrouper.png',
    iconSize: seagullSize,
    iconAnchor: seagullAnchor,
    className: 'BlueGrouper',
});
var IconPorgy = L.icon({
    iconUrl: 'icons/seagull/Porgy.png',
    iconSize: seagullSize,
    iconAnchor: seagullAnchor,
    className: 'Porgy',
});
var IconBlackPorgy = L.icon({
    iconUrl: 'icons/seagull/BlackPorgy.png',
    iconSize: seagullSize,
    iconAnchor: seagullAnchor,
    className: 'BlackPorgy',
});
var IconSmokeyChromis = L.icon({
    iconUrl: 'icons/seagull/SmokeyChromis.png',
    iconSize: seagullSize,
    iconAnchor: seagullAnchor,
    className: 'SmokeyChromis',
});
var IconSeaBass = L.icon({
    iconUrl: 'icons/seagull/SeaBass.png',
    iconSize: seagullSize,
    iconAnchor: seagullAnchor,
    className: 'SeaBass',
});
var IconNibbler = L.icon({
    iconUrl: 'icons/seagull/Nibbler.png',
    iconSize: seagullSize,
    iconAnchor: seagullAnchor,
    className: 'Nibbler',
});
var IconEyespotPuffer = L.icon({
    iconUrl: 'icons/seagull/EyespotPuffer.png',
    iconSize: seagullSize,
    iconAnchor: seagullAnchor,
    className: 'EyespotPuffer',
});



//----------  Markers  ----------//
var City = L.layerGroup(),
    Town = L.layerGroup(),
    Node1 = L.layerGroup(),
    Node2 = L.layerGroup(),
    Node3 = L.layerGroup(),
    Node4 = L.layerGroup(),
    IslandYShape = L.layerGroup(),
    IslandCircle = L.layerGroup(),
    Harbor = L.layerGroup(),
    ImperialFishingDelivery = L.layerGroup(),
    TradeManager = L.layerGroup(),
    Barterer = L.layerGroup(),
    BartererOcean = L.layerGroup(),

    Vell = L.layerGroup(),
    YoungSeaMonster = L.layerGroup(),
    Hekaru = L.layerGroup(),
    OceanStalker = L.layerGroup(),
    Nineshark = L.layerGroup(),
    Candidum = L.layerGroup(),
    BlackRust = L.layerGroup(),
    SaltwaterCrocodile = L.layerGroup(),
    CoxPiratesShadowGhost = L.layerGroup(),
    CargoShip = L.layerGroup(),
    DrunkSniper = L.layerGroup(),
    PirateFlag = L.layerGroup(),
    BlackRust2 = L.layerGroup(),
    GoldmontPirate = L.layerGroup(),
    Lekrashan = L.layerGroup(),

    Coelacanth = L.layerGroup(),
    Grunt = L.layerGroup(),
    Tuna = L.layerGroup(),
    GiantOctopus = L.layerGroup(),
    SpottedSeaBass = L.layerGroup(),
    Tilefish = L.layerGroup(),
    BlueGrouper = L.layerGroup(),
    Porgy = L.layerGroup(),
    BlackPorgy = L.layerGroup(),
    SmokeyChromis = L.layerGroup(),
    SeaBass = L.layerGroup(),
    Nibbler = L.layerGroup(),
    EyespotPuffer = L.layerGroup();



//--------------------------------------//
//----------       City       ----------//
//--------------------------------------//
var markerCity = [
    [-37.1, 13.2, "Velia", "벨리아 마을"],
    [-44.2, 15.7, "Heidel", "하이델"],
    [-45.8, -8, "Calpheon", "칼페온"],
    [-64.2, -30.1, "Grana", "그라나"],
    [-62.3, 8.3, "Duvencrune", "드벤크룬"],
    [-45.9, 42, "Altinova", " 알티노바"],
    [-28.3, 97, "Valencia City", "수도 발렌시아"],
    [-68.65, -0.72, "O'draxxia", "오드락시아"],
];
for (var i = 0; i < markerCity.length; i++) {
    marker = new L.marker([markerCity[i][0], markerCity[i][1]], {icon: IconCity})
        .bindTooltip(markerCity[i][langNum], {permanent: true, direction: 'center', className: "city-tooltip all-tooltip"})
        .addTo(City);
}


//--------------------------------------//
//----------       Town       ----------//
//--------------------------------------//
var markerTown = [
    [-34.1, 0.1, "Olvia", "올비아 마을"],
    [-39.9, -16.9, "Port Epheria", "에페리아 항구"],
    [-38.5, -1.8, "Florin", "플로린 마을"],
    [-39.2, 7, "Western Guard Camp", "서부 경비 캠프"],
    [-42.3, -5.5, "Northern Wheat<br>Plantation", "북부 밀농장"],
    [-48.9, 10.6, "Glish", "글리시 마을"],
    [-50.6, -0.6, "Keplan", "케플란"],
    [-54.8, -11.3, "Behr", "베어 마을"],
    [-54.6, -19.2, "Trent", "트렌트 마을"],
    [-63.5, -17.9, "Old Wisdom Tree", "지혜의 고목"],
    [-59.2, -32.5, "Tooth Fairy Cabin", "이빨요정 다락집"],
    [-46.6, 30.9, "Tarif", "타리프 마을"],
    [-37.4, 30.6, "Kusha", "쿠샤 마을"],
    [-50.1, 44, "Abun", "아분 마을"],
    [-39.2, 61, "Sand Grain Bazaar", "모래알 바자르"],
    [-22.9, 59.7, "Shakatu", "샤카투"],
    [-18, 92.4, "Ancado Inner Harbor", "안카도 내항"],
    [-30.3, 116.6, "Arehaza Town", "아레하자 마을"],
    [-49.9, 102, "Muiquun", "무이쿤"],
    [-21.6, 25.3, "Iliya Island", "일리야섬"],
    [-13.7, 7.4, "Lema Island", "레마섬"],
    [61.7, -91.8, "Port Ratt", "랏 항구 마을"],
];
for (var i = 0; i < markerTown.length; i++) {
    marker = new L.marker([markerTown[i][0], markerTown[i][1]], {icon: IconTown})
        .bindTooltip(markerTown[i][langNum], {permanent: true, direction: 'center', className: "town-tooltip all-tooltip"})
        .addTo(Town);
}


//------------------------------------------------//
//----------       Node1(Y shape)       ----------//
//------------------------------------------------//
var markerNode1 = [
    [-36.2, 10, "Coastal Cave", "해안 동굴"],
    [-35.9, 7.4, "Coastal Cliff", " 해안 절벽"],
    [-38.2, 9.2, "Imp Cave", "임프 동굴"],
    [-37.5, 7.2, "Altar of Agris", "아그리스 제단"],
    [-34.5, 14.9, "Cron Castle Site", "크론 성터"],
    [-36.1, 17.1, "Ehwaz Hill", "애화저 언덕"],
    [-38, 15.5, "Forest of Plunder", "약탈의 숲"],
    [-41.6, 14.8, "Northern Heidel Quarry", "하이델 북부 채석장"],
    [-41.5, 8.6, "Ancient Stone Chamber", "고대인의 석실"],
    [-44.7, 7.6, "Northern Plain of Serendia", "세렌디아 북부 평원"],
    [-44.2, 10.6, "Lynch Farm Ruins", "린치 농장 폐허"],
    [-47.6, 5, "Orc Camp", "오크 캠프"],
    [-48.2, 6.6, "Watchtower", "감시탑"],
    [-48.3, 9.4, "Glish Swamp", "글리시 늪지"],
    [-48.3, 14.8, "Glish Ruins", "글리시 폐허"],
    [-49.6, 13, "Southern Cienaga", "남쪽 늪지대"],
    [-35.6, 4.6, "Balenos River Mouth", "발레노스강 어귀"],
    [-36.2, 3, "Wolf Hills", "늑대 언덕"],
    [-33.1, 4, "Olvia Coast", "올비아 해안"],
    [-34.4, 2, "Casta Farm", "카스타 농장"],
    [-32.9, 0.3, "Wale Farm", "웨일 농장"],
    [-32, -3, "Terrmian Cliff", "테르미안 절벽"],
    [-33.4, -4.3, "Florin Gateway", "플로린 관문"],
    [-36.4, -5, "Mask Owl's Forest", "가면 올빼미의 숲"],
    [-35.1, -10, "Elder's Bridge", "노인의 다리"],
    [-33.8, -10.4, "Foot of Terrmian<br>Mountain", "테르미안 산기슭"],
    [-37.2, -15.2, "Epheria Ridge", "에페리아 고개"],
    [-41.9, -16.2, "Epheria Valley", "에페리아 계곡"],
    [-40.7, -12.7, "Quint Hill", "귄트 언덕"],
    [-43.8, -10.7, "Abandoned Land", "버림받은 땅"],
    [-46.2, -14.8, "Calpheon Castle Site", "칼페온 성터"],
    [-46.7, -1.8, "Marni Farm Ruins", "마르니 농장 폐허"],
    [-49.6, -0.6, "Keplan Quarry", "케플란 채굴장"],
    [-50, 2.1, "Keplan Vicinity", "케플란 길목"],
    [-51.1, 0, "Keplan Hill", "케플란 언덕"],
    [-51.2, -3.4, "Tarte Rock Fork", "타트 바위 삼거리"],
    [-53.3, 0.9, "Gehaku Plain", "게아쿠 평원"],
    [-55.1, -2, "Hexe Stone Wall", "헥세 돌담"],
    [-55.4, -3.6, "Marie Cave", "마리 동굴"],
    [-51.6, -10.6, "Phoniel's Cabin Entrance", "포니엘 산장 입구"],
    [-52.4, -12.7, "Behr Riverhead", "베어강 수원지"],
    [-53.1, -10.3, "Behr Downstream", "베어강 하류"],
    [-53.5, -8.6, "Rhua Tree Stub", "루아 나무 둥치"],
    [-53.5, -20, "Lumberjack's Rest Area", "벌목장 쉼터"],
    [-60.4, -11.2, "Atanis Pond", "아타니스 못"],
    [-61, -13.2, "Caduil Forest", "카두일 숲"],
    [-57.9, -16.1, "Valtarra Mountains", "발타라 산맥"],
    [-64.5, -19.8, "Shady Tree Forest", "그늘나무 숲"],
    [-65.5, -28.5, "Southern Kamasylvia", "카마실비아 남부"],
    [-64.7, -27.3, "Okiara River", "오기에르 강"],
    [-63.3, -35.3, "Looney Cabin", "러니 산장"],
    [-62.6, -33.9, "Polly's Forest", "폴리숲"],
    [-62.2, -36.2, "Krogdalo's Trace", "크로그달로의 자취"],
    [-60.9, -36, "Weenie Cabin", "위니 사장"],
    [-60, -24.2, "Holo Forest", "홀로 숲"],
    [-60.5, -29.1, "White Wood Forest", "흰가지나무 숲"],
    [-56, -26.6, "Yianaros's Field", "이아나로스의 들"],
    [-55.3, -25.3, "Western Valtarra Mountains", "발타라 서부 산맥"],
    [-40.7, -21.5, "Brellin Farm", "브렐린 농장"],
    [-40.4, -24.8, "Outpost Supply Port", "전진 기지 보급항"],
    [-62.7, -5.4, "Khalk Canyon", "칼크 협곡"],
    [-63.5, 1.5, "Gayak Altar", "가야크 제단"],
    [-60.4, -0.7, "Sherekhan Necropolis", "셰레칸의 묘"],
    [-58.4, -0.3, "Fountain of Origin", "기원의 샘"],
    [-62.5, 6, "Duvencrune Farmland", "드벤크룬 경작지"],
    [-61.3, 3, "Harak's Shelter", "하락의 쉼터"],
    [-60.5, 5.2, "Morning Fog Post", "새벽 안개 초소"],
    [-58.8, 5.2, "Windy Peak", "바람깃 봉우리"],
    [-61.7, 12.2, "Marak Farm", "마라크 농장"],
    [-56.7, 13.2, "Gervish Mountains", "게르비슈 산맥"],
    [-56.5, 20.7, "Tshira Ruins", "트쉬라 폐허"],
    [-51, 27.6, "Hasrah Cliff", "하스라 절벽"],
    [-44.1, 24.3, "Kamasylve Temple", "카마실브 사원"],
    [-41.4, 23.7, "Rumbling Land", "울림의 땅"],
    [-41.4, 25.7, "Ancient Ruins<br>Excavation Site", "고대 유적 발굴지"],
    [-40.4, 22.8, "Ancient Fissure", "고대의 틈"],
    [-33.8, 22.5, "The Mausoleum", "대족장의 영묘"],
    [-33.8, 25.2, "Mediah Northern<br>Highlands", "메디아 북부 고원"],
    [-32.8, 32.7, "Sausan Garrison<br>Wharf", "소산 주둔지 선착장"],
    [-37, 29.3, "Stonetail Wasteland", "돌꼬리 황무지"],
    [-39.6, 32.5, "Mediah Shore", "메디아 해안"],
    [-43.3, 29, "Ahto Farm", "아토 농장"],
    [-42.2, 37.1, "Stonebeak Shore", "돌부리 해안"],
    [-43.5, 36.3, "Awakening Bell", "경각의 종"],
    [-44.5, 32.7, "Asula Highland", "아술라 고원"],
    [-46.6, 34.3, "Highland Junction", "고원 삼거리"],
    [-46.2, 38.7, "Altinova Entrance", "알티노바 입구"],
    [-48.5, 35.4, "Abandoned Iron Mine<br>Entrance", "폐철광산 입구"],
    [-51.2, 37, "Alumn Rock Valley", "알룸바위 계곡"],
    [-42.6, 43.7, "Altinova Gateway", "알티노바 관문"],
    [-43.6, 47.3, "Pujiya Canyon", "푸지야 협곡"],
    [-39.65, 44.5, "Gorgo Rock Belt", "고르고 암석지대"],
    [-39.1, 46.9, "Veteran's Canyon", "노병의 협곡"],
    [-37.2, 50.2, "Pila Fe", "필라 페"],
    [-35.8, 45.3, "Kunid's Vacation Spot", "쿠니드의 쉼터"],
    [-35.3, 42.2, "Kisleev Crag", "키슬리브 암석지대"],
    [-33.5, 44, "Leical Falls", "라이칼 폭포"],
    [-39.6, 57.5, "Capotia", "카포티아"],
    [-40.4, 59.7, "Bazaar Farmland", "바자르 경작지"],
    [-42.7, 61.9, "Valencia Western<br>Highlands", "발렌시아 서부 고원"],
    [-51.7, 76, "Crescent Mountains", "초승달 산맥"],
    [-50.8, 108, "Cantusa Desert", "칸투사 사막"],
    [-41.8, 108.35, "Dona Rocky Mountain", "도나 바위산"],
    [-38.8, 114.5, "Central Cantusa", "칸투사 중부"],
    [-28.7, 113.7, "Areha Palm Forest", "아레하 야자숲"],
    [-22.3, 116.2, "Northern Sand Dune", "북부 모래 언덕"],
    [-9.9, 108.2, "Gavinya Volcano Zone", "가비냐 화산지대"],
    [-4.1, 108, "Gavinya Coastal Cliff", "가비냐 해안 절벽"],
    [-9.7, 103.5, "Roud Sulfur Mine", "루드 유황 광산"],
    [-6.2, 102.2, "Gavinya Great Crater", "가비냐 대분화구"],
    [-5.5, 95.2, "Ivory Wasteland", "상아 황무지"],
    [-7.8, 88.6, "Ivero Cliff", "이베로 절벽"],
    [-18.6, 94.3, "Altas Farmland", "알타스 경작지"],
    [-24.7, 90.3, "Rakshan Observatory", "라크샨 천문대"],
    [-26.8, 94.1, "Erdal Farm", "에르달 농장"],
    [-28.8, 93.7, "Valencia Plantation", "발렌시아 대농장"],
    [-30.4, 93.4, "Fohalam Farm", "포할람 농장"],
    [-26.7, 102.8, "Valencia Castle Site", "발렌시아 성터"],
    [-17, 85.6, "Ancado Coast", "안카도 해안"],
    [-12.9, 74.8, "Iris Canyon", "아이리스 협곡"],
    [-16.8, 75.2, "Kmach Canyon", "크마흐 협곡"],
    [-15.6, 71.9, "Bambu Valley", "밤부 골짜기"],
    [-20.8, 62, "Yalt Canyon", "얄트 협곡"],
    [-22.3, 58.9, "Shakatu Farmland", "샤카투 경작지"],
    [-21.2, 56.4, "Hope Pier", "희망나루"],
    [-24.2, 53.8, "Shakatu Abandoned Pier", "샤카투 폐 나루터"],
    [-35.3, 68.1, "Pilgrim's Haven", "순교자의 안식처"],
    [-32.6, 73.4, "Pilgrim's Sanctum:<br>Abstinence", "순례자의 성소 - 절제"],
    [-22.8, 79.3, "Pilgrim's Sanctum:<br>Obedience", "순례자의 성소 - 순종"],
    [-31.4, 90.2, "Pilgrim's Sanctum:<br>Fast", "순례자의 성소 - 금식"],
    [-38.1, 85.6, "Pilgrim's Sanctum:<br>Sharing", "순례자의 성소 - 분배"],
    [-43.2, 79.8, "Pilgrim's Sanctum:<br>Sincerity", "순례자의 성소 - 성실"],
    [-42, 92.1, "Pilgrim's Sanctum:<br>Purity", "순례자의 성소 - 순결"],
    [-45.6, 85.6, "Pilgrim's Sanctum:<br>Humility", "순례자의 성소 - 겸손"],
    [-38, -31.1, "Teyamal Island", "테야말 섬"],
    [-31.9, -30.1, "Rameda Island", "라메다 섬"],
    [-32.4, -25, "Ginburrey Island", "진버레이 섬"],
    [-35.8, -26.5, "Modric Island", "모드릭 섬"],
    [-36.7, -24, "Baeza Island", "바에자 섬"],
    [-36.6, -19.6, "Serca Island", "세르카 섬"],
    [-29.3, -22.2, "Netnume Island", "네트넘 섬"],
    [-28.3, -20.3, "Oben Island", "오벤 섬"],
    [-30.3, -19.3, "Dunde Island", "던데 섬"],
    [-29.6, -17.5, "Eberdeen Island", "에버딘 섬"],
    [-32.6, -14.6, "Barater Island", "바라테르 섬"],
    [-21.3, -23.1, "Teste Island", "테스테 섬"],
    [-18.5, -20.4, "Almai Island", "알마이 섬"],
    [-14.2, -16.55, "Kuit Islands", "쿠이트 제도"],
    [-21.7, -16.6, "Padix Island", "파딕스 섬"],
    [-18, -7.6, "Arita Island", "아리타 섬"],
    [-28.2, -8.3, "Staren Island", "스타렌 섬"],
    [-23.8, -7.2, "Lisz Island", "리스즈 섬"],
    [-21.6, -3, "Narvo Island", "나르보 섬"],
    [-25.25, -2.9, "Marka Island", "마르카 섬"],
    [-10.9, 2.1, "Tashu Island", "타슈 섬"],
    [-21.1, 1.9, "Invernen Island", "인버넨 섬"],
    [-26, 1.3, "Angie Island", "앙쥬 섬"],
    [-23.8, 4.4, "Balvege Island", "발베쥬 섬"],
    [-23.9, 6.9, "Marlene Island", "마를레느 섬"],
    [-27.3, 5.2, "Eveto Island", "에베토 섬"],
    [-19.3, 4.95, "Tulu Island", "툴루 섬"],
    [-18.9, 7.6, "Orffs Island", "오르프스 섬"],
    [-26.9, 10, "Mariveno Island", "마리베노 섬"],
    [-30.8, 12.7, "Ephde Rune Island", "에프데 룬 섬"],
    [-15.7, 15.2, "Al-Naha Island", "알나하 섬"],
    [-19.3, 18.25, "Ajir Island", "아지르 섬"],
    [-24.45, 15.2, "Weita Island", "웨이타 섬"],
    [-28.2, 15.7, "Paratama Island", "파라타마 섬"],
    [-25.75, 18.8, "Kanvera Island", "칸베라 섬"],
    [-27.15, 20.17, "Arakil Island", "아라킬 섬"],
    [-29.3, 22.9, "Taramura Island", "타라무라 섬"],
    [-27.9, 23.8, "Ostra Island", "오스트라 섬"],
    [-28.7, 29, "Delinghart Island", "델링하트 섬"],
    [-21.5, 33.5, "Pujara Island", "푸자라 섬"],
    [-2.8, 30.2, "Tinberra Island", "틴베라 섬"],
    [-3.5, 34.2, "Lerao Island", "레라오 섬"],
    [-8.1, 36.1, "Portanen Island", "포르타넨 섬"],
    [-12.25, 34.1, "Shasha Island", "샤샤 섬"],
    [-12.1, 37.6, "Rosevan Island", "로즈반 섬"],
    [-15.5, 46.6, "Boa Island", "보아 섬"],
    [-33, 39.4, "Sokota Island", "소코타 섬"],
    [-30.1, 44.6, "Riyed Island", "리에드 섬"],
    [-25.8, 46.8, "Esfah Island", "에스파 섬"],
    [-24.55, 45.6, "Tigris Island", "티그리스 섬"],
    [-24.2, 48.75, "Shirna Island", "시르나 섬"],
    [-18.6, 58.2, "Halmad Island", "할마드 섬"],
    [-15.7, 60.65, "Kashuma Island", "카슈마 섬"],
    [-12.1, 81.5, "Derko Island", "더코 섬"],
    [-1.3, 115.1, "Hakoven Island", "하코번 섬"],
    [5.1, 4.2, "Oquilla's Eye", "오킬루아의 눈"],
    [11.6, 33.6, "Crow's Nest", "까마귀의 둥지"],
    [54.1, -96.5, "Mariul Island", "마리울 섬"],
    [49.8, -101.2, "Nada Island", "나다 섬"],
    [49.5, -93.3, "Zagam Island", "자감 섬"],
    [-3.8, 13.94, "Feltron Island", "펠트런 섬"],
    [-68.64, -14.35, "Starry Midnight Port", "깊은 밤의 항구"],
    [-67.71, -17.4, "Talibahr's Rope", "탈리바르의 끈"],
    [-69.45, -12.88, "Thornwood Castle", "가시나무 성"],
    [-68.73, -12.77, "La O'delle", "라 오델"],
    [-68.51, -9.43, "Narcion", "낙시온"],
    [-66.15, -14.06, "Tunkuta", "툰크타"],
    [-64.86, -14.1, "Salun's Border", "살룬의 경계"],
    [-65.35, -11.23, "Thornwood Forest", "가시나무 숲"],
    [-63.63, -6.35, "Mountain of Division", "구분 짓는 산"],
    [-64.81, -5.11, "Bahit Sanctum", "바히트 성소"],
    [-66.12, -7.03, "Crypt of Resting Thoughts", "생각이 잠든 묘"],
    [-67.75, -5.33, "Salanar Pond", "살라나르 못"],
    [-68.99, -3.55, "Shiv Valley Road", "칼날협로"],
    [-67.61, -2.81, "Delmira Plantation", "델리모르 농원"],
    [-66.79, -0.37, "Forgotten Mountain", "지워진 산"],
    [-66.18, -0.68, "Olun's Valley", "올룬의 계곡"],
];
for (var i = 0; i < markerNode1.length; i++) {
    marker = new L.marker([markerNode1[i][0], markerNode1[i][1]], {icon: IconNode1})
        .bindTooltip(markerNode1[i][langNum], {permanent: true, direction: 'center', className: "node-tooltip all-tooltip"})
        .addTo(Node1);
}



//-----------------------------------------------//
//----------       Node2(Circle)       ----------//
//-----------------------------------------------//
var markerNode2 = [
    [-37.1, 11, "Loggia Farm", "로기아 농장"],
    [-36.8, 15.2, "Finto Farm", "핀토 농장"],
    [-38.4, 13.1, "Bartali Farm", "바탈리 농장"],
    [-38.9, 12.2, "Marino Farm", "마리노 농장"],
    [-39, 14.5, "Balenos Forest", "발레노스 숲"],
    [-40.3, 9.5, "Toscani Farm", "토스카니 농장"],
    [-42.9, 12.9, "Alejandro Farm", "알레한드로 농장"],
    [-42.3, 8.8, "Lynch Ranch", "린치 목장"],
    [-45.5, 13.2, "Costa Farm", "코스타 농장"],
    [-46.1, 15.9, "Northern Cienaga", "북쪽 늪지대"],
    [-46.2, 18.3, "Moretti Plantation", "모레티 거대 농장"],
    [-41.3, -6.8, "Bernianto Farm", "베르니안토 농장"],
    [-43.48, -8.01, "Contaminated Farm", "오염된 농장지"],
    [-44, -5.3, "Dias Farm", "디아스 농장"],
    [-45.8, -4.3, "Falres Dirt Farm", "팔르스 소농장"],
    [-46.1, -11.8, "Gabino Farm", "가비노 농장"],
    [-44.5, -13.8, "Cohen Farm", "코헨 농장"],
    [-48.5, 2, "Quarry Byway", "채굴장 사잇길"],
    [-52, 2.4, "Gianin Farm", "지아닌 농장"],
    [-54.3, 9.2, "Dormann Lumber Camp", "도르만 벌목장"],
    [-53.4, 21.1, "Khimut Lumber Camp", "히무트 벌목장"],
    [-52.3, -0.9, "Abandoned Quarry", "폐채굴장"],
    [-53.1, -3.6, "Dane Canyon", "데인 협곡"],
    [-48.4, -6.9, "Oberen Farm", "오베렌 농장"],
    [-49.4, -5.7, "Beacon Entrance Post", "봉화대 입구 초소"],
    [-49.8, -8.3, "Bain Farmland", "바인 농장지"],
    [-49.5, -15, "Rhutum Sentry Post", "루툼 감시초소"],
    [-50.5, -13, "Phoniel Cabin", "포니엘 산장"],
    [-49.1, -18.5, "Mansha Forest", "만샤 숲"],
    [-50.3, -19.3, "Tobare's Cabin", "토바레 오두막"],
    [-55.7, -16.4, "Longleaf Tree<br>Sentry Post", "긴잎나무 정찰 초소"],
    [-55.9, -15, "Crioville", "크리오 마을"],
    [-58.1, -13.8, "Viv Foretta Hamlet", "빕 포레타 산장"],
    [-62.5, -26.7, "Lake Flondor", "플롱도르 호수"],
    [-40.5, 28.3, "Shuri Farm", "슈리 농장"],
    [-41.9, 30.3, "Stonetail Horse Ranch", "돌꼬리 언덕 목장"],
    [-42.8, 32.5, "Omar Lava Cave", "오마르 용암 동굴"],
    [-46.6, 32.2, "Kasula Farm", "카술라 농장"],
    [-51.7, 37.5, "Spalshing Point", "물텀벙 마을"],
    [-30.4, 51.4, "Deserted City of Runn", "폐허도시 룬"],
    [-28.9, 72.6, "Ibellab Oasis", "이벨랍 오아시스"],
    [-48.4, 79.2, "Aakman", "아크만"],
    [-34.7, -27.8, "Theonil Island", "시오닐 섬"],
    [-35, -19.4, "Randis Island", "란디스 섬"],
    [-27.7, -24.3, "Daton Island", "데이튼 섬"],
    [-30.8, -14.8, "Albresser Island", "알브레서 섬"],
    [-26.2, -5.4, "Louruve Island", "루루브 섬"],
    [-28.1, 4.2, "Duch Island", "두흐 섬"],
    [-30, 8.5, "Luivano Island", "루이바노 섬"],
    [-22, 12.7, "Baremi Island", "바레미 섬"],
    [-31.3, 19.2, "Beiruwa Island", "베이루와 섬"],
    [-12.8, 17.9, "Racid Island", "라시드 섬"],
    [-29.5, 33.1, "Pilava Island", "필바라 섬"],
    [-19.5, 46.6, "Orisha Island", "오리샤 섬"],
    [-52.5, -43.7, "Papua Crinea", "파푸아 크리니"],
    [-64.64, -33.94, "Grandiha", "그란디하"],
];
for (var i = 0; i < markerNode2.length; i++) {
    marker = new L.marker([markerNode2[i][0], markerNode2[i][1]], {icon: IconNode2})
        .bindTooltip(markerNode2[i][langNum], {permanent: true, direction: 'center', className: "node-tooltip all-tooltip"})
        .addTo(Node2);
}



//-----------------------------------------//
//-------       Node3(Gateway)      -------//
//-----------------------------------------//
var markerNode3 = [
    [-40.1, 15.8, "Heidel Pass", "하이델 길머리"],
    [-38.8, 5.3, "Western Gateway", "서부 관문"],
    [-42.3, 6.2, "Bandit's Den Byway", "산채 사잇길"],
    [-42.6, 15.3, "Northern Guard Camp", "북부 경비 캠프"],
    [-44.4, 20.4, "Eastern Border", "동부 경계"],
    [-47.1, 17.9, "Eastern Gateway", "동부 관문"],
    [-47.2, 13.9, "Central Guard Camp", "중부 경비 캠프"],
    [-46.7, 9.1, "Northwestern<br>Gateway", "서북부 관문"],
    [-49.7, 15.3, "Southern Guard Camp", "남부 경비 캠프"],
    [-49.6, 8.3, "Southwestern<br>Gateway", "서남부 관문"],
    [-41.7, 1.9, "Delphe Outpost", "델페 전진기지"],
    [-44.7, 1.2, "Delphe Knights Castle", "델페 기사단 성"],
    [-51.8, 4.2, "Serendia Western<br>Gateway", "세렌디아 서부 관문"],
    [-48.3, -3.8, "Marni Cave Path", "마르니 동굴길"],
    [-50.1, -6.6, "Trina Beacon Towers", "트리나 봉화대"],
    [-51.1, -5.8, "Trina Fort", " 트리나 요새"],
    [-38.2, -9.5, "Elder's Bridge Post", "노인의 다리 초소"],
    [-41.5, -9.2, "Anti-Troll<br>Fortification", "트롤 방어기지"],
    [-42, -11.5, "Isolated Sentry Post", "고립된 초소"],
    [-40.3, -18.3, "Epheria Sentry Post", "에페리아 초소"],
    [-45.3, -16.7, "Calpheon Castle", "칼페온 성"],
    [-47.1, -14, "North Kaia Pier", "북 카이아 나루"],
    [-48.1, -14.6, "South Kaia Pier", "남 카이아 나루"],
    [-51.9, -18.3, "Abandoned Monastery", "버려진 수도원"],
    [-59.4, -9.4, "Lemoria Guard Post", "레모리아 경비초소"],
    [-61, -24, "Central Lemoria Camp", "레모리아 중부 캠프"],
    [-64.5, -25, "Lemoria Beacon Towers", "레모리아 봉화대"],
    [-65.2, -29.6, "Acher Southern Camp", "아케르 남부 캠프"],
    [-57.2, -37.7, "Acher Western Camp", "아케르 서부 캠프"],
    [-54.2, -30.3, "Acher Guard Post", "아케르 경비초소"],
    [-41.9, -24.5, "Calpheon Northwestern<br>Outpost", "칼페온 서북부 전진 기지"],
    [-61.9, -8, "Ahib Conflict Zone", "아히브 분쟁지역"],
    [-63.7, -2.1, "Marcha Outpost", "마르차 전초기지"],
    [-59.2, 13.7, "Night Crow Post", "밤 까마귀 초소"],
    [-56, 22.3, "Forgotten Gateway", "잊혀진 관문"],
    [-34.6, 20.3, "Mediah Northern<br>Gateway", "메디아 북부 관문"],
    [-36.6, 32.3, "Sarma Outpost", "사르마 기지"],
    [-38, 37.3, "Mediah Castle", "메디아 성"],
    [-41.4, 46.7, "Rock Post", "바윗돌 초소"],
    [-40, 55.4, "Barhan Gateway", "바르한 관문"],
    [-28.7, 52.2, "Runn Gateway<br>Intersection", "룬 관문 삼거리"],
    [-21.75, 106.85, "Valencia Castle", "발렌시아 성"],
];
for (var i = 0; i < markerNode3.length; i++) {
    marker = new L.marker([markerNode3[i][0], markerNode3[i][1]], {icon: IconNode3})
        .bindTooltip(markerNode3[i][langNum], {permanent: true, direction: 'center', className: "node-tooltip all-tooltip"})
        .addTo(Node3);
}



//-------------------------------------------------//
//----------       Node4(Triangle)       ----------//
//-------------------------------------------------//
var markerNode4 = [
    [-33.9, 13.3, "Cron Castle", "크론성"],
    [-38.9, 16.7, "Goblin Cave", "고블린 동굴"],
    [-40.5, 8.3, "Forest of Seclusion", "은둔의 숲"],
    [-43.8, 4.5, "Biraghi Den", "비라기 산채"],
    [-40, 2.1, "Karanda Ridge", "카란다 능선"],
    [-42.3, -1.4, "Khuruto Cave", "쿠루토 동굴"],
    [-43.1, -1.6, "Old Dandelion", "구 단델리온"],
    [-38.8, -3.3, "Caphras Cave", "카프라스 동굴"],
    [-38.7, -6, "Bree Tree Ruins", "브리 나무 유적지"],
    [-47.5, 26, "Tungrad Forest", "툰그라드 숲"],
    [-45.8, 24, "Soldier's Grave", "병사의 무덤"],
    [-47.8, 20.4, "Castle Ruins", "폐성터"],
    [-51.2, 15.4, "Serendia Shrine", "세렌디아 신전"],
    [-51.5, 9.8, "Bloody Monastery", "핏빛 수도원"],
    [-46.3, 4.2, "Bradie Fortress", "브레디 요새"],
    [-47.1, 0.4, "Oze Pass", "오제 고개"],
    [-48.2, 0, "Oze's House", "오제의 집"],
    [-49.3, -0.3, "North Abandoned<br>Quarry", "버려진 채굴장"],
    [-49.6, -3.2, "Marni's Lab", "마르니의 실험터"],
    [-50.2, -2.5, "Glutoni Cave", "글루토니 동굴"],
    [-50, 4.9, "Southern Neutral Zone", "남부 중립 지역"],
    [-54.5, 0.9, "Primal Giant Post", "거인족 주둔지"],
    [-52.8, -5.3, "Saunil Camp", "사우닐 캠프"],
    [-52.4, -8.4, "Saunil Battlefield", "사우닐 전장"],
    [-48.3, -10.9, "North Kaia<br>Mountaintop", "북 카이아산 정상"],
    [-48.3, -16, "Lake Kaia", "카이아 호수"],
    [-47.7, -17.2, "Catfishman Camp", "메기맨 캠프"],
    [-47.6, -19.4, "Calpheon Castle W.<br>Forest", "칼페온 성터 서쪽 숲"],
    [-50.7, -16.3, "Rhutum Outstation", "루툼족 주둔지"],
    [-51.7, -21.5, "Treant Forest", "엔트 숲"],
    [-55.6, -7, "Hexe Sanctuary", "헥세 성역"],
    [-56.9, -4.3, "Witch's Chapel", "마녀의 예배당"],
    [-56.1, -13, "Longleaf Tree<br>Forest", "긴잎나무 숲"],
    [-58, -8.6, "Kamasylvia Vicinity", "카마실비아 진입로"],
    [-57.8, -19, "Valtarra - Altar of Training", "발타라 - 수련의 제단"],
    [-60.3, -18.8, "Manshaum Forest", "만샤움 숲"],
    [-58.6, -24.3, "Mirumok Ruins", "미루목 유적지"],
    [-63.1, -21.7, "Navarn Steppe", "나반 초원"],
    [-66.1, -27.9, "Gyfin Rhasia Temple", "가이핀라시아 사원"],
    [-58.4, -36.2, "Tooth Fairy Forest", "이빨요정 산림"],
    [-53.6, -32.5, "Loopy Tree Forest", "고리나무 숲"],
    [-51, -29.4, "Ash Forest", "잿빛 숲"],
    [-46, -29, "Star's End", "별무덤"],
    [-61.3, -7.1, "Akum Rocky Mountain", "아쿰 바위산"],
    [-58.6, 10.5, "Garmoth's Nest", "가모스의 둥지"],
    [-59.7, 17.6, "Blood Wolf Settlement", "붉은늑대 부락"],
    [-38.1, 22.1, "Helms Post", "투구족 주둔지"],
    [-37, 26.2, "Elric Shrine", "엘릭 사원"],
    [-39.3, 26.7, "Canyon of Corruption", "부패의 협곡"],
    [-33.8, 30.7, "Sausan Garrison", "소산 주둔지"],
    [-44.1, 27.9, "Manes Hideout", "갈기족 소굴"],
    [-48.2, 32.1, "Wandering Rogue Den", "방랑도적 주둔지"],
    [-49.3, 38.4, "Abandoned Iron Mine", "폐철광산"],
    [-49.3, 41.6, "Abdn. Iron Mine<br>Rhutum Dt.", "폐철광산 루툼 지구"],
    [-51.1, 40, "Abdn. Iron Mine<br>Saunil Dt.", "폐철광산 사우닐 지구"],
    [-51.8, 44.2, "Marni's 2nd Lab", "마르니 제 2 실험터"],
    [-39.6, 42.1, "Basilisk Den", "바실리스크 소굴"],
    [-36.8, 48.1, "Cadry Ruins", "카드리 폐허"],
    [-40.3, 52.2, "Taphtar Plain", "타프타르 평야"],
    [-33, 55.2, "Scarlet Sand Chamber", "붉은 모래 석실"],
    [-36.4, 57.1, "Desert Naga Temple", "사막 나가 성전"],
    [-46.8, 51.6, "Bashim Base", "바심족 주둔지"],
    [-47.1, 59.3, "Waragon Nest", "와라곤 둥지"],
    [-18.3, 65.7, "Gahaz Bandit's Lair", "가하즈 도적단 소굴"],
    [-53.2, 72.3, "Crescent Shrine", "초승달 신전"],
    [-51.3, 94.7, "Titium Valley", "티티움 계곡"],
    [-46.6, 106.4, "Pila Ku Jail", "필라 쿠 감옥"],
    [-11.9, 101.5, "Roud Sulfur Works", "루드 유황 작업장"],
];
for (var i = 0; i < markerNode4.length; i++) {
    marker = new L.marker([markerNode4[i][0], markerNode4[i][1]], {icon: IconNode4})
        .bindTooltip(markerNode4[i][langNum], {permanent: true, direction: 'center', className: "node-tooltip all-tooltip"})
        .addTo(Node4);
}



//--------------------------------------//
//---------       Island       ---------//
//--------------------------------------//
var markerIslandYShape = [
    [-38, -31.1, "Teyamal Island", "테야말 섬"],
    [-31.9, -30.1, "Rameda Island", "라메다 섬"],
    [-32.4, -25, "Ginburrey Island", "진버레이 섬"],
    [-35.8, -26.5, "Modric Island", "모드릭 섬"],
    [-36.7, -24, "Baeza Island", "바에자 섬"],
    [-36.6, -19.6, "Serca Island", "세르카 섬"],
    [-29.3, -22.2, "Netnume Island", "네트넘 섬"],
    [-28.3, -20.3, "Oben Island", "오벤 섬"],
    [-30.3, -19.3, "Dunde Island", "던데 섬"],
    [-29.6, -17.5, "Eberdeen Island", "에버딘 섬"],
    [-32.6, -14.6, "Barater Island", "바라테르 섬"],
    [-21.3, -23.1, "Teste Island", "테스테 섬"],
    [-18.5, -20.4, "Almai Island", "알마이 섬"],
    [-14.2, -16.55, "Kuit Islands", "쿠이트 제도"],
    [-21.7, -16.6, "Padix Island", "파딕스 섬"],
    [-18, -7.6, "Arita Island", "아리타 섬"],
    [-28.2, -8.3, "Staren Island", "스타렌 섬"],
    [-23.8, -7.2, "Lisz Island", "리스즈 섬"],
    [-21.6, -3, "Narvo Island", "나르보 섬"],
    [-25.25, -2.9, "Marka Island", "마르카 섬"],
    [-10.9, 2.1, "Tashu Island", "타슈 섬"],
    [-21.1, 1.9, "Invernen Island", "인버넨 섬"],
    [-26, 1.3, "Angie Island", "앙쥬 섬"],
    [-23.8, 4.4, "Balvege Island", "발베쥬 섬"],
    [-23.9, 6.9, "Marlene Island", "마를레느 섬"],
    [-27.3, 5.2, "Eveto Island", "에베토 섬"],
    [-19.3, 4.95, "Tulu Island", "툴루 섬"],
    [-18.9, 7.6, "Orffs Island", "오르프스 섬"],
    [-26.9, 10, "Mariveno Island", "마리베노 섬"],
    [-30.8, 12.7, "Ephde Rune Island", "에프데 룬 섬"],
    [-15.7, 15.2, "Al-Naha Island", "알나하 섬"],
    [-19.3, 18.25, "Ajir Island", "아지르 섬"],
    [-24.45, 15.2, "Weita Island", "웨이타 섬"],
    [-28.2, 15.7, "Paratama Island", "파라타마 섬"],
    [-25.75, 18.8, "Kanvera Island", "칸베라 섬"],
    [-27.15, 20.17, "Arakil Island", "아라킬 섬"],
    [-29.3, 22.9, "Taramura Island", "타라무라 섬"],
    [-27.9, 23.8, "Ostra Island", "오스트라 섬"],
    [-28.7, 29, "Delinghart Island", "델링하트 섬"],
    [-21.5, 33.5, "Pujara Island", "푸자라 섬"],
    [-2.8, 30.2, "Tinberra Island", "틴베라 섬"],
    [-3.5, 34.2, "Lerao Island", "레라오 섬"],
    [-8.1, 36.1, "Portanen Island", "포르타넨 섬"],
    [-12.25, 34.1, "Shasha Island", "샤샤 섬"],
    [-12.1, 37.6, "Rosevan Island", "로즈반 섬"],
    [-15.5, 46.6, "Boa Island", "보아 섬"],
    [-33, 39.4, "Sokota Island", "소코타 섬"],
    [-30.1, 44.6, "Riyed Island", "리에드 섬"],
    [-25.8, 46.8, "Esfah Island", "에스파 섬"],
    [-24.55, 45.6, "Tigris Island", "티그리스 섬"],
    [-24.2, 48.75, "Shirna Island", "시르나 섬"],
    [-18.6, 58.2, "Halmad Island", "할마드 섬"],
    [-15.7, 60.65, "Kashuma Island", "카슈마 섬"],
    [-12.1, 81.5, "Derko Island", "더코 섬"],
    [-1.3, 115.1, "Hakoven Island", "하코번 섬"],
    [5.1, 4.2, "Oquilla's Eye", "오킬루아의 눈"],
    [11.6, 33.6, "Crow's Nest", "까마귀의 둥지"],
    [54.1, -96.5, "Mariul Island", "마리울 섬"],
    [49.8, -101.2, "Nada Island", "나다 섬"],
    [49.5, -93.3, "Zagam Island", "자감 섬"],
    [-3.8, 13.94, "Feltron Island", "펠트런 섬"],
];
for (var i = 0; i < markerIslandYShape.length; i++) {
    marker = new L.marker([markerIslandYShape[i][0], markerIslandYShape[i][1]], {icon: IconNode1Small})
        .bindTooltip(markerIslandYShape[i][langNum], {permanent: true, direction: 'center', className: "node-tooltip all-tooltip"})
        .addTo(IslandYShape);
}

var markerIslandCircle = [
    [-34.7, -27.8, "Theonil Island", "시오닐 섬"],
    [-35, -19.4, "Randis Island", "란디스 섬"],
    [-27.7, -24.3, "Daton Island", "데이튼 섬"],
    [-30.8, -14.8, "Albresser Island", "알브레서 섬"],
    [-26.2, -5.4, "Louruve Island", "루루브 섬"],
    [-28.1, 4.2, "Duch Island", "두흐 섬"],
    [-30, 8.5, "Luivano Island", "루이바노 섬"],
    [-22, 12.7, "Baremi Island", "바레미 섬"],
    [-31.3, 19.2, "Beiruwa Island", "베이루와 섬"],
    [-12.8, 17.9, "Racid Island", "라시드 섬"],
    [-29.5, 33.1, "Pilava Island", "필바라 섬"],
    [-19.5, 46.6, "Orisha Island", "오리샤 섬"],
    [-52.5, -43.7, "Papua Crinea", "파푸아 크리니"],
];
for (var i = 0; i < markerIslandCircle.length; i++) {
    marker = new L.marker([markerIslandCircle[i][0], markerIslandCircle[i][1]], {icon: IconNode2Small})
        .bindTooltip(markerIslandCircle[i][langNum], {permanent: true, direction: 'center', className: "node-tooltip all-tooltip"})
        .addTo(IslandCircle);
}



//---------------------------//
//----------  NPC  ----------//
//---------------------------//
var markerHarbor = [
    [-36.05, 12.7],/*Velia*/
    [-45.05, 15.15],/*Heidel*/
    [-39.61, 6.03],/*Balenos River*/
    [5.36, 3.48],/*Oquilla's Eye*/
    [-14.13, 7.63],/*Lema Island*/
    [-21.88, 24.7],/*Iliya Island*/
    [-30.27, 47.3],/*Abandoned Pier-Torio*/
    [-23.83, 53.7],/*Shakatu Abandoned Pier*/
    [-46.08, 5.5],/*Demi River*/
    [-39.44, -17.82],/*Port Epheria*/
    [-39.93, -25.2],/*Outpost Supply Port*/
    [-44.95, -8.02],/*Calpheon*/
    [-15.62, -15.85],/*Kuit Islands*/
    [61.38, -92.23],/*Port Ratt*/
    [-32.44, 32.88],/*Sausan Garrison Wharf*/
    [-43.68, 42.8],/*Altinova*/
    [-47.01, 30.5],/*Tarif*/
    [-30.05, 117.92],/*Arehaza Town*/
    [-17.8, 92.7],/*Ancado Inner Harbor*/ 
    [-65.36, -34.37],/*Grandiha*/
    [-53.51, -41.55],/*Papua Crinea - Crionia*/
    [-50.50, -41.43],/*Papua Crinea - Papuraora*/
    [-68.99, -14.36],/*Starry Midnight Port*/
    [10.81, 31.66],/*Crow's Nest*/
];
for (var i = 0; i < markerHarbor.length; i++) {
    marker = new L.marker([markerHarbor[i][0], markerHarbor[i][1]], {icon: IconHarbor})
        .bindTooltip(markerHarbor[i][2], {permanent: true, direction: 'center', className: "npc-tooltip all-tooltip"})
        .addTo(Harbor);
}


var markerImperialFishingDelivery = [
    [-36.65, 12.8],/*Velia*/
    [-62.2, 7.9],/*Duvencrune*/
    [-51.15, 38.3],/*Splashing Point*/
    [-28.1, 98.7],/*Valencia City*/
    [-49.02, 10.3],/*Glish*/
    [-64, -30.2],/*Grana*/
    [-39.49, -17.91],/*Port Epheria*/
    [-68.46, -0.33],/*Odraxia*/
];
for (var i = 0; i < markerImperialFishingDelivery.length; i++) {
    marker = new L.marker([markerImperialFishingDelivery[i][0], markerImperialFishingDelivery[i][1]], {icon: IconImperialFishingDelivery})
        .bindTooltip(markerImperialFishingDelivery[i][2], {permanent: true, direction: 'center', className: "npc-tooltip all-tooltip"})
        .addTo(ImperialFishingDelivery);
}

var markerTradeManager = [
    [61.34, -92.23],/*Port Ratt*/
    [-35.66, -28.44],/*Theonil Island*/
    [-34.55, -19.67],/*Randis Island*/
    [-30.88, -15.61],/*Albresser Island*/
    [-27.84, -23.53],/*Daton Island*/
    [-26.14, -5.99],/*Louruve Island*/
    [-28.27, 4.28],/*Duch Island*/
    [-29.37, 8.07],/*Luivano Island*/
    [-22.02, 13.6],/*Baremi Island*/
    [-30.82, 19.09],/*Beiruwa Island*/
    [-21.79, 25.12],/*Iliya Island*/
    [-12.06, 18.17],/*Racid Island*/
    [-28.75, 32.7],/*Pilava Island*/
    [-19.52, 46.76],/*Orisha Island*/

    [-37.23, 11.07],/*Loggia Farm*/
    [-37.19, 13.94],/*Velia*/
    [-36.99, 15.31],/*Finto Farm*/
    [-38.51, 13.08],/*Bartali Farm*/
    [-39.09, 11.95],/*Marino Farm*/
    [-39.09, 14.67],/*Balenos Forest*/
    [-39.48, 6.79],/*Western Guard Camp*/
    [-40.41, 9.69],/*Toscani Farm*/
    [-34.53, 20.66],/*Mediah Northern Gateway*/
    [-42.94, 12.93],/*Alejandro Farm*/
    [-42.46, 8.66],/*Lynch Ranch*/
    [-43.80, 15.29],/*Heidel*/
    [-41.64, 2.01],/*Delphe Outpost*/
    [-44.78, 1.15],/*Delphe Knights Castle*/
    [-33.74, 0.44],/*Olvia*/
    [-38.90, -2.37],/*Florin*/
    [-40.38, -17.21],/*Port Epheria*/
    [-41.54, -9.29],/*Anti-Troll Fortification*/
    [-41.35, -6.83],/*Bernianto Farm*/
    [-42.42, -5.66],/*Northern Wheat Plantation*/
    [-44.02, -5.39],/*Dias Farm*/
    [-43.43, -7.93],/*Contaminated Farm*/
    [-43.93, -8.79],/*Calpheon 1*/
    [-44.90, -7.11],/*Calpheon 2*/
    [-46.52, -8.38],/*Calpheon 3*/
    [-46.08, -11.87],/*Gabino Farm*/
    [-44.59, -13.8],/*Cohen Farm*/

    [-45.72, -4.24],/*Falres Dirt Farm*/
    [-46.99, -13.16],/*North Kaia Pier*/
    [-48.11, -14.67],/*South Kaia Pier*/
    [-49.60, -14.97],/*Rhutum Sentry Post*/
    [-50.37, -13.05],/*Phoniel Cabin*/
    [-49.14, -18.85],/*Mansha Forest*/
    [-50.48, -19.31],/*Tobare's Cabin*/
    [-51.82, -18.34],/*Abandoned Monastery*/
    [-54.54, -19.06],/*Trent*/
    [-54.53, -11.31],/*Behr*/
    [-48.53, -6.9],/*Oberen Farm*/
    [-49.89, -8.29],/*Bain Farmland*/
    [-49.59, -5.56],/*Beacon Entrance Post*/
    [-48.47, -3.96],/*Marni Cave Path*/
    [-51.03, -4.71],/*Trina Fort*/
    [-48.48, 1.98],/*Quarry Byway*/
    [-50.30, -0.16],/*Keplan*/
    [-51.97, 2.26],/*Gianin Farm*/
    [-51.93, 4.18],/*Serendia Western Gateway*/
    [-52.34, -0.9],/*Abandoned Quarry*/
    [-53.23, -3.49],/*Dane Canyon*/

    [-50.61, -29.66],/*Ash Forest*/
    [-54.23, -29.78],/*Acher Guard Post*/
    [-55.62, -16.52],/*Longleaf Tree Sentry Post*/
    [-55.69, -14.48],/*Crioville*/
    [-52.27, -43.65],/*Papua Crinea*/
    [-58.89, -32],/*Tooth Fairy Cabin*/
    [-58.27, -13.50],/*Viv Foretta Hamlet*/
    [-59.65, -9.99],/*Lemoria Guard Post*/
    [-61.99, -30.42],/*Lake Flondor*/
    [-64.65, -30.12],/*Grana*/
    [-64.84, -32.51],/*Grandiha*/  
    [-63.34, -17.43],/*Old Wisdom Tree*/
    [-62.05, -8.15],/*Ahib Conflict Zone*/
    [-60.32, -0.87],/*Sherekhan Necropolis*/
    [-63.69, -2.15],/*Marcha Outpost*/
    [-62.73, 6.79],/*Duvencrune 1*/
    [-62.09, 8.26],/*Duvencrune 2*/
    [-54.45, 9.28],/*Dormann Lumber Camp*/
    [-53.47, 21.44],/*Khimut Lumber Camp*/

    [-45.93, 12.57],/*Costa Farm*/
    [-45.86, 15.01],/*Northern Cienaga*/
    [-46.22, 18.21],/*Moretti Plantation*/
    [-47.01, 17.95],/*Eastern Gateway*/
    [-47.24, 14.05],/*Central Guard Camp*/
    [-46.89, 9.04],/*Northwestern Gateway*/
    [-48.96, 10.3],/*Glish*/
    [-49.77, 8.6],/*Southwestern Gateway*/
    [-49.75, 15.42],/*Southern Guard Camp*/

    [-37.68, 30.31],/*Kusha*/
    [-40.53, 28.26],/*Shuri Farm*/
    [-42.01, 30.26],/*Stonetail Horse Ranch*/
    [-42.82, 32.43],/*Omar Lava Cave*/
    [-46.17, 30.85],/*Tarif*/
    [-46.61, 32.2],/*Kasula Farm*/
    [-51.15, 38.12],/*Spalshing Point*/
    [-49.89, 43.78],/*Abun*/
    [-45.88, 40.24],/*Altinova 1*/
    [-46.39, 41.97],/*Altinova 2*/
    [-41.33, 47.2],/*Rock Post*/
    [-30.16, 50.86],/*Deserted City of Runn*/
    [-39.01, 61.01],/*Sand Grain Bazaar*/
    [-22.55, 60.07],/*Shakatu*/
    [-18.09, 92.37],/*Ancado Inner Harbor*/
    [-29.69, 117.4],/*Arehaza Town*/
    [-28.78, 72.50],/*Ibellab Oasis*/
    [-29.57, 95.26],/*Valencia City 1*/
    [-26.90, 98.05],/*Valencia City 2*/
    [-49.77, 102.04],/*Muiquun*/

];
for (var i = 0; i < markerTradeManager.length; i++) {
    marker = new L.marker([markerTradeManager[i][0], markerTradeManager[i][1]], {icon: IconTradeManager})
        .bindTooltip(markerTradeManager[i][2], {permanent: true, direction: 'center', className: "npc-tooltip all-tooltip"})
        .addTo(TradeManager);
}


var markerBarterer = [
    [-37.2, -31.3],/*Teyamal Island*/
    [-31.9, -29.6],/*Rameda Island*/
    [-35.75, -28.31],/*Theonil Island*/
    [-35.8, -26],/*Modric Island*/
    [-36.6, -24.5],/*Baeza Island*/
    [-32.4, -25.6],/*Ginburrey Island*/
    [-36.2, -19.35],/*Serca Island*/
    [-34.6, -20.1],/*Randis Island*/
    [-27.825, -23.325],/*Daton Island*/
    [-28.6, -22.3],/*Netnume Island*/
    [-27.7, -21.4],/*Oben Island*/
    [-30.3, -19.2],/*Dunde Island*/
    [-29.9, -18],/*Eberdeen Island*/
    [-31.1, -15.7],/*Albresser Island*/
    [-32.6, -14.9],/*Barater Island*/
    [-19.8, -23.1],/*Teste Island*/
    [-19, -20.75],/*Almai Island*/
    [-15.4, -16.5],/*Kuit Islands*/
    [-17.5, -16.5],/*Padix Island*/
    [-19.7, -6.5],/*Arita Island*/
    [-10.1, 1.9],/*Tashu Island*/
    [-12.1, 8.1],/*Lema Island*/
    [-28.8, -8.6],/*Staren Island*/
    [-23.2, -6.3],/*Lisz Island*/
    [-26.1, -6.2],/*Louruve Island*/
    [-25.6, -3.1],/*Marka Island*/
    [-22.1, -2.4],/*Narvo Island*/
    [-26.4, 1.1],/*Angie Island*/
    [-21.75, 2.95],/*Invernen Island*/
    [-19.1, 4.6],/*Tulu Island*/
    [-19.4, 7],/*Orffs Island*/
    [-23.5, 4],/*Balvege Island*/
    [-23.3, 6.75],/*Marlene Island*/
    [-28.4, 4.55],/*Duch Island*/
    [-26.6, 5.5],/*Eveto Island*/
    [-29.35, 7.9],/*Luivano Island*/
    [-26.4, 9.7],/*Mariveno Island*/
    [-31.1, 12.8],/*Ephde Rune Island*/
    [-28.8, 15.2],/*Paratama Island*/
    [-24.8, 15.2],/*Weita Island*/
    [-21.99, 13.66],/*Baremi Island*/
    [-16.05, 15.6],/*Al-Naha Island*/
    [-12.03, 18.25],/*Racid Island*/
    [-18.7, 18.85],/*Ajir Island*/
    [-25.4, 18.65],/*Kanvera Island*/
    [-27.1, 19.85],/*Arakil Island*/
    [-30.8, 19.1],/*Beiruwa Island*/
    [-29.4, 23.7],/*Taramura Island*/
    [-27.45, 24.1],/*Ostra Island*/
    [-28.6, 29.5],/*Delinghart Island*/
    [-28.77, 32.61],/*Pilava Island*/
    [-21.91, 24.96],/*Iliya Island*/
    [-21.8, 33],/*Pujara Island*/
    [-2.6, 31],/*Tinberra Island*/
    [-1.6, 34.7],/*Lerao Island*/
    [-8.85, 35.75],/*Portanen Island*/
    [-13.95, 33],/*Shasha Island*/
    [-12.6, 36.8],/*Rosevan Island*/
    [-15.85, 46.3],/*Boa Island*/
    [-18.1, 47.55],/*Orisha Island*/
    [-32.45, 39.9],/*Sokota Island*/
    [-30.05, 43.75],/*Riyed Island*/
    [-24.13, 45.63],/*Tigris Island*/
    [-26.2, 46.7],/*Esfah Island*/
    [-24.05, 49.15],/*Shirna Island*/
    [-18.25, 57.7],/*Halmad Island*/
    [-16.9, 59.3],/*Kashuma Island*/
    [-10.8, 80.55],/*Derko Island*/
    [0.1, 114.1],/*Hakoven Island*/   
];
for (var i = 0; i < markerBarterer.length; i++) {
    marker = new L.marker([markerBarterer[i][0], markerBarterer[i][1]], {icon: IconBarterer})
        .bindTooltip(markerBarterer[i][2], {permanent: true, direction: 'center', className: "npc-tooltip all-tooltip"})
        .addTo(Barterer);
}


var markerBartererOcean = [
    [11.1, 33.1, 'Ravinia<br>(Crow Coin Exchange)', '라비니아<br>(까마귀 주화 교환원)'],
    [-14.15, 7.52, 'Rebinia<br>(Crow Coin Exchange)', '르비니아<br>(까미귀 주화 교환원)'],
    [61.45, -92.08, 'Ravinia<br>(Crow Coin Exchange)', '리비니아<br>(까미귀 주화 교환원)'],
    [37.31, -72, 'Haran<br>(Shipwrecked Cargo Ship)', '하란<br>(난파된 하란의 수송선)'],
    [39.3, -60.69, 'Popo<br>(Old Moon Carrack)', '포포<br>(그믐달 길드의 중범선)'],
    [48.75, -46.74, 'Heracio<br>(Incomplete Ship)', '헤라치오<br>(떠내려온 미완성 선박)'],
    [43.02, -40.09, 'Lantinia<br>(Langtia\'\s Combat Raft)', '랑티니아<br>(랑티니아의 전투 뗏목)'],
    [27.84, -58.49, 'Cholace Chiko<br>(Cholace Chiko\'\s Pirate Union)', '숄라스 치코<br>(숄라스 치코의 해적 연합)'],
    [36.68, -32.49, 'Harus<br>(Wandering Merchant Ship)', '하루스<br>(떠돌이 상인의 배)'],
    [23.44, -30.16, 'Olcia Viano<br>(Crow Merchant Ship)', '올시아 비아노<br>(까마귀 상단 소유의 선박)'],
    [19.9, -42.61, 'Atinia<br>(Shipwrecked Ancient Relic Transport Vessel)', '아티니아<br>(난파된 고대 유적 수송선)'],
    [9.36, -56.25, 'Rickun<br>(Rikkun\'\s Shipwreck Boat)', '릭쿤<br>(난파된 릭쿤의 배)'],
    [0.4, -67.91, 'Donalia<br>(Shipwrecked Naval Ship)', '도날리아<br>(난파된 해상군의 배)'],
    [-3.25, -51.15, 'Picira Baho<br>(Shipwrecked Cox Pirate\'\s Ship)', '피치라 바호<br>(난파된 콕스 해적선)'],
    [44.27, -16.15, 'Pakio<br>(Pakio\'\s Combat Raft)', '파키오<br>(파키오의 전투 뗏목)'], 
];
for (var i = 0; i < markerBartererOcean.length; i++) {
    marker = new L.marker([markerBartererOcean[i][0], markerBartererOcean[i][1]], {icon: IconBartererOcean})
        .bindTooltip(markerBartererOcean[i][langNum], {permanent: true, direction: 'center', className: "npc-tooltip all-tooltip"})
        .addTo(BartererOcean);
}



//---------------------------------------------//
//----------       Sea Enimies       ----------//
//---------------------------------------------//
var markerSeaMonster =[
    [30.71, 3.77, 'Vell', '벨', IconVell, Vell],
    [7.56, -19.44, 'Ocean Stalker', '표류추적자', IconOceanStalker, OceanStalker],
    [-34.18, -46.45, 'Ocean Stalker', '표류추적자', IconOceanStalker, OceanStalker],
    [-9.13, -40.75, 'Hekaru', '헤카루', IconHekaru, Hekaru],
    [19.15, 24.59, 'Hekaru', '헤카루', IconHekaru, Hekaru],
    [-3, 4.65, 'Young Sea Monster', '어린 해왕류', IconYoungSeaMonster, YoungSeaMonster],
    [-26.12, -13.09, 'Young Sea Monster', '어린 해왕류', IconYoungSeaMonster, YoungSeaMonster],
    [41.74, -51.96, 'Nineshark', '나인샤크', IconNineshark, Nineshark],
    [47.5, -0.24, 'Candidum', '칸디둠', IconCandidum, Candidum],
    [-13.84, -73.61, 'Black Rust', '검은무쇠이빨', IconBlackRust, BlackRust],
    [57.04, -27.4, 'Saltwater Crocodile', '바다 악어', IconSaltwaterCrocodile, SaltwaterCrocodile],
    [54.42, -69.3, 'Black Rust', '검은무쇠이빨', IconBlackRust2, BlackRust2],
    [48.31, -87.18, 'Goldmont Pirate', '골드몬트 해적단', IconGoldmontPirate, GoldmontPirate],
    [24.29, -98.39, 'Lekrashan', '레크라샨', IconLekrashan, Lekrashan],
];
for (var i = 0; i < markerSeaMonster.length; i++) {
    marker = new L.marker([markerSeaMonster[i][0], markerSeaMonster[i][1]], {icon: markerSeaMonster[i][4]})
    .bindTooltip(markerSeaMonster[i][langNum], {permanent: true, direction: 'center', className: "monster-tooltip all-tooltip"})
    .addTo(markerSeaMonster[i][5]);
}


var markerCoxPiratesShadowGhost = [
    [-37.16, -29.11],
    [-31.28, -28.27],
    [-34.51, -23.01],
    [-32.83, -19.65],
    [-27.6, -22.12],
    [-23.73, -23.68],
    [-17.72, -24.42],
    [-26.62, -7.45],
    [-21, -1.2],
    [-21.8, -5.15],
    [-15.17, -7.44],
    [-24.56, 3.05],
    [-23.62, 5.71],
    [-17.1, 5.59],
    [-30.66, 10.72],
    [-27.86, 9.09],
    [-17.39, 9.88],
    [-10.83, 12.56],
    [-23.6, 13.49],
    [-13.64, 16.15],
    [-17.82, 16.41],
    [-18.84, 20.08],
    [-29.82, 17.18],
    [-29.85, 20.84],
    [-25.84, 22.39],
    [-26.55, 26.78],
    [-20.69, 30.75],
    [-10.25, 36.05],
    [-2.97, 32.15],
];
for (var i = 0; i < markerCoxPiratesShadowGhost.length; i++) {
    marker = new L.marker([markerCoxPiratesShadowGhost[i][0], markerCoxPiratesShadowGhost[i][1]], {icon: IconCoxPiratesShadowGhost})
        .closeTooltip('')
        .addTo(CoxPiratesShadowGhost);
}

var markerCargoShip = [
    [-35.36, -22],
    [-36.87, -27.75],
    [-30.54, -25.95],
    [-25.21, -8.63],
    [-23.23, -2.22],
    [-21.95, 5.95],
    [-18.78, 11.75],
    [-10.33, 16.17],
    [-14.98, 28.74],
    [-30.09, 29.22],
    //[-16.67, -2.39],
    //[-17.84, 1.93],
    //[-13.51, 23.66],
    //[-14.51, 13.25],
    //[-21.789, 10.92],
];
for (var i = 0; i < markerCargoShip.length; i++) {
    marker = new L.marker([markerCargoShip[i][0], markerCargoShip[i][1]], {icon: IconCargoShip})
        .closeTooltip('')
        .addTo(CargoShip);
}

var markerDrunkSniper = [
    [-35.94, -19.71],
    [-35.32, -19.94],
    [-31.05, -14.46],
    [-26.65, -18.52],
    [-20.25, -22.77],
    [-23.72, -6.13],
    [-20.86, -2.54],
    [-19.17, 8.01],
    [-23.61, 6.52],
    [-26.8, 10.33],
    [-24.13, 14.51],
    [-15.1, 14.8],
    [-27.15, 20.26],
    [-31.45, 20.12],
    [-16.08, 24.37],
    [-28.33, 28.51],
    [-29.41, 32.05],
    [-8.73, 36.68],
    [-3.04, 30.95],
    [-20.71, 34.07],
];
for (var i = 0; i < markerDrunkSniper.length; i++) {
    marker = new L.marker([markerDrunkSniper[i][0], markerDrunkSniper[i][1]], {icon: IconDrunkSniper})
        .closeTooltip('')
        .addTo(DrunkSniper);
}

var markerPirateFlag = [
    [-36.11, -23.79],
    [-37.93, -30.76],
    [-35.96, -28.49],
    [-34.9, -26.54],
    [-32.66, -25.13],
    [-32.6, -30.48],
    [-31.36, -29.52],
    [-28.62, -25.27],
    [-29.27, -22.53],
    [-36.41, -20.07],
    [-35.18, -18.89],
    [-30.1, -18.78],
    [-29.45, -18.17],
    [-26.94, -18.31],
    [-32.68, -15.47],
    [-30.76, -14.29],
    [-28.64, -8],
    [-26.41, -4.83],
    [-22.88, -6.61],
    [-25.5, -2.93],
    [-22.08, -3.1],
    [-26.49, 1.72],
    [-21.11, 3.06],
    [-18.86, 4.82],
    [-23.34, 5],
    [-27.94, 3.76],
    [-26.75, 5.31],
    [-30.33, 7.83],
    [-31.27, 12.83],
    [-21.37, 13.18],
    [-24.56, 13.81],
    [-15.59, 16.12],
    [-11.77, 17.55],
    [-18.94, 17.54],
    [-30.64, 18.72],
    [-28.59, 21.47],
    [-27.94, 24.53],
    [-8.62, 36.98],
    [-26.84, 20.08],
];
for (var i = 0; i < markerPirateFlag.length; i++) {
    marker = new L.marker([markerPirateFlag[i][0], markerPirateFlag[i][1]], {icon: IconPirateFlag})
        .closeTooltip('')
        .addTo(PirateFlag);
}



//---------------------------------------------//
//-----       Seagull Fishing Spot       ------//
//---------------------------------------------//

function SeagullHighlightOff() {
    $('.Coelacanth').removeClass("CoelacanthON");
    $('.Grunt').removeClass("GruntON");
    $('.Tuna').removeClass("TunaON");
    $('.GiantOctopus').removeClass("GiantOctopusON");
    $('.SpottedSeaBass').removeClass("SpottedSeaBassON");
    $('.Tilefish').removeClass("TilefishON");
    $('.BlueGrouper').removeClass("BlueGrouperON");
    $('.Porgy').removeClass("PorgyON");
    $('.BlackPorgy').removeClass("BlackPorgyON");
    $('.SmokeyChromis').removeClass("SmokeyChromisON");
    $('.SeaBass').removeClass("SeaBassON");
    $('.Nibbler').removeClass("NibblerON");
    $('.EyespotPuffer').removeClass("EyespotPufferON");
}

function CoelacanthHL() {
    $('.Coelacanth').toggleClass("CoelacanthON");
}
function GruntHL() {
    $('.Grunt').toggleClass("GruntON");
}
function TunaHL() {
    $('.Tuna').toggleClass("TunaON");
}
function GiantOctopusHL() {
    $('.GiantOctopus').toggleClass("GiantOctopusON");
}
function SpottedSeaBassHL() {
    $('.SpottedSeaBass').toggleClass("SpottedSeaBassON");
}
function TilefishHL() {
    $('.Tilefish').toggleClass("TilefishON");
}
function BlueGrouperHL() {
    $('.BlueGrouper').toggleClass("BlueGrouperON");
}
function PorgyHL() {
    $('.Porgy').toggleClass("PorgyON");
}
function BlackPorgyHL() {
    $('.BlackPorgy').toggleClass("BlackPorgyON");
}
function SmokeyChromisHL() {
    $('.SmokeyChromis').toggleClass("SmokeyChromisON");
}
function SeaBassHL() {
    $('.SeaBass').toggleClass("SeaBassON");
}
function NibblerHL() {
    $('.Nibbler').toggleClass("NibblerON");
}
function EyespotPufferHL() {
    $('.EyespotPuffer').toggleClass("EyespotPufferON");
}


var markerCoelacanth = [
    // Velia
    [-30.51, 5.41],
    [-35.69, 11.87],
    [-35.61, 10.65],
    [-35.69, 8.94],
    [-34.50, 8.90],
    [-33.77, 10.37],
    [-33.59, 9.57],
    [-32.87, 10.34],
    [-31.79, 11.11],

    // Iliya Island
    [-15.75, 30.43],
    [-19.61, 31.11],

    // Epheria
    [-40.64, -19.87],
    [-39.64, -21],
    [-39.02, -19.83],
    [-37.52, -18.08],
    [-37.70, -20.57],
    [-34.42, -33.07],
    [-35.55, -32.37],

    [-26.25, -16.08],
    [-28.13, -10.54],
    [-38.29, -28.54],
    [-25.77, -11.06],
    [-19.04, -4.69],
    [-25.52, -26.22],
    [-9.8, -9.6],
    [-18.9, -1.30],
    [-16.47, -0.59],
    [-25.36, 6.17],
    [-25.74, 7.88],
    [-9.3, 16.36],
    [-24.96, 39.51],
    [-17.56, 37.57],
    [-9.66, 28.81],
    [-1.01, 26.5],
    [-16.65, 44.55],
    [-23.01, 44.59],
    [-18.56, 45.11],
    [-3.57, 16.51],

    // Valencia
    [-28.94, 118.88],
    [-27.25, 119.51],
    [-30.61, 120.43],
    [-28.94, 122.1],
];
for (var i = 0; i < markerCoelacanth.length; i++) {
    marker = new L.marker([markerCoelacanth[i][0], markerCoelacanth[i][1]], {icon: IconCoelacanth})
        .closeTooltip('').addTo(Coelacanth).on('click', CoelacanthHL);
}

var markerGrunt = [
    [-24.28, 2.71],
    [-21.34, 4.9],
    [-33.64, 10.31],
    [-29.5, 18.64],
    [-25.63, 25.16],
    [-34.05, 9.35],
    [-34.07, 7.41],
    [-32.93, 7.61],
    [-33.05, 9.45],
    [-28.34, 11.32],
    [-27.18, 17.99],
    [-21.37, 6.5],
    [-19.75, 3.51],
    [-21.17, -4.62],
    [-24.50, -4.76],
    [-20.99, -7.95],
    [-23.74, -8.56],
    [-8.43, 6.87],
    [-15.92, 18.9],
    [-5.92, 19.79],
    [-3.24, 32.12],
    [-7.8, 29.76],
    [-4.72, 37.75],
    [-12.97, 40.49],
    [-25.10, 32.04],
    [-22.77, 18.98],
];
for (var i = 0; i < markerGrunt.length; i++) {
    marker = new L.marker([markerGrunt[i][0], markerGrunt[i][1]], {icon: IconGrunt})
        .closeTooltip('').addTo(Grunt).on('click', GruntHL);
}

var markerTuna = [
    [-23.19, 18.07],
    [-12.42, 16.22],
    [-3.03, 12.12],
    [-7.54, 9.3],
    [-16.76, 6.77],
    [-22.26, -0.16],
    [-25.09, -0.65],
    [-22.7, -5.14],
    [-25.21, 25.8],
    [-28.18, 26.11],
    [-13.84, 22.1],
    [-1.50, 27],
    [1.05, 32],
    [-4.57, 32.34],
    [-5.66, 34.83],
    [-9.71, 36.06],
    [-21.24, 37.33],
    [-18.62, 36.71],
    [-26.49, 38.52],
    [-28.98, 27.51],
    [-12.40, 24.84],
];
for (var i = 0; i < markerTuna.length; i++) {
    marker = new L.marker([markerTuna[i][0], markerTuna[i][1]], {icon: IconTuna})
        .closeTooltip('').addTo(Tuna).on('click', TunaHL);
}

var markerGiantOctopus = [
    [-15.37, 44.49],
    [-20.97, 48.57],
    [-22.88, 45.78],
    [-20.29, 47.85],
    [-17.87, 49.01],
    [-23.43, 47.17],
    [-13.89, 45.64],
    [-15.23, 48.6],
    [-19.17, 49.29],
    [-21.96, 46.5],

    // Valencia
    [-15.04, 132.61],
    [4.127, 122.56],
    [-35.48, 122.86],
];
for (var i = 0; i < markerGiantOctopus.length; i++) {
    marker = new L.marker([markerGiantOctopus[i][0], markerGiantOctopus[i][1]], {icon: IconGiantOctopus})
        .closeTooltip('').addTo(GiantOctopus).on('click', GiantOctopusHL);
}

var markerSpottedSeaBass = [
    [-26.2, 10.64],
    [-26.6, -2.45],
    [-25.85, 16.5],
    [-23.17, 17],
    [-21.72, 17.17],
    [-24.96, 12.15],
    [-24.76, 30.6],
    [-17.9, 36.45],
    [-12.95, 36.27],
    [-11.04, 36.15],
    [-11.33, 28],
    [0.44, 34.04],
    [-15.26, 20.13],
    [-12.88, 10.22],
    [-17.17, 13.71],
    [-5.65, 10.53],
    [-1.95, 14.72],
    [-7.67, 4.4],
    [-24.06, 1.51],
    [-23.20, -1.06],
    [-19.87, -1.9],
    [-27.04, -0.25],
    [-23.44, -3.85],
    [-12.75, -0.02],
];
for (var i = 0; i < markerSpottedSeaBass.length; i++) {
    marker = new L.marker([markerSpottedSeaBass[i][0], markerSpottedSeaBass[i][1]], {icon: IconSpottedSeaBass})
        .closeTooltip('').addTo(SpottedSeaBass).on('click', SpottedSeaBassHL);
}

var markerTilefish = [
    [-16.53, 49.47],
    [-21.42, 49.33],
    [-17.20, 49.91],
    [-22.82, 44.43],

    // Valencia
    [-37.9, 124.18],
    [-29.77, 125.08],
    [-15.73, 121.05],
    [0.912, 124.53],
    [1.11, 126.78],
];
for (var i = 0; i < markerTilefish.length; i++) {
    marker = new L.marker([markerTilefish[i][0], markerTilefish[i][1]], {icon: IconTilefish})
        .closeTooltip('').addTo(Tilefish).on('click', TilefishHL);
}

var markerBlueGrouper = [
    [-26.6, 43.67],
    [-20.04, 43.69],
    [-14.46, 44.14],
    [-12.58, 44.65],
    [-15.88, 43.74],
    [-28.03, 44.56],

    // Valencia
    [-28.51, 123.31],
    [-40.45, 126.59],
    [-42.58, 125.96],
    [-6.62, 123.1],
];
for (var i = 0; i < markerBlueGrouper.length; i++) {
    marker = new L.marker([markerBlueGrouper[i][0], markerBlueGrouper[i][1]], {icon: IconBlueGrouper})
        .closeTooltip('').addTo(BlueGrouper).on('click', BlueGrouperHL);
}

var markerPorgy = [
    [-17.36, -23.38],
    [-28.65, -13.56],
    [-20.25, -8.69],
    [-16.84, -11.58],
    [-14.88, -3.77],
    [-10.75, -6.48],
    [-11.68, -22.14],
    [-17.01, -24.89],
    [-21.05, -27.73],
    [-23.70, -20.57],
    [-33.82, -21.53],
    [-37.46, -22.14],
    [-30.45, -28.12],
    [-35.89, -31.71],
    [-38.29, -33],
    [-37.64, -28.09],
];
for (var i = 0; i < markerPorgy.length; i++) {
    marker = new L.marker([markerPorgy[i][0], markerPorgy[i][1]], {icon: IconPorgy})
        .closeTooltip('').addTo(Porgy).on('click', PorgyHL);
}

var markerBlackPorgy = [
    [-26.92, 21.84],
    [-25.06, 6.01],
    [-27.99, -0.05],
    [-25.53, -7.7],
    [-24.98, 4.68],
    [-25.17, 10.61],
    [-15.76, 31.74],
    [-25.18, 7.87],
    [-27.73, 32.65],
    [-27.8, 1.17],
    [-28.04, 2.40],
    [-24.22, 8.04],
    [-22.8, 9.69],
    [-25.17, 10.55],
    [-19.95, 15.9],
    [-21.72, 18.15],
    [-24.55, 21.06],
    [-23.73, 22.22],
    [-15.85, 2.52],
    [-10.5, 0.10],
    [-3.12, 20.85],
    [-17.97, 36.9],
    [-8.93, 39.49],
    [-1.46, 37],
    [-4.44, 31.51],
    [-26.86, -8.24],
];
for (var i = 0; i < markerBlackPorgy.length; i++) {
    marker = new L.marker([markerBlackPorgy[i][0], markerBlackPorgy[i][1]], {icon: IconBlackPorgy})
        .closeTooltip('').addTo(BlackPorgy).on('click', BlackPorgyHL);
}

var markerSmokeyChromis = [
    [-18.53, -4.75],
    [-25.23, -18.1],
    [-23.06, -20.88],
    [-36.22, -21.66],
    [-37.32, -21.42],
    [-34.76, -24.55],
    [-39.69, -30.17],
    [-33.86, -30.78],
    [-31.12, -31.68],
    [-30.79, -25.89],
    [-30.34, -23.98],
    [-31.84, -18.87],
    [-31.18, -17.61],
    [-32.69, -16.51],
    [-30.06, -13.71],
    [-28.73, -12.77],
    [-17.94, -11.34],
    [-14.33, -23.48],
    [-9.81, -18.39],
    [-8.31, -8.44],
    [-23.21, -21.87],
    [-29.66, -27.88],
];
for (var i = 0; i < markerSmokeyChromis.length; i++) {
    marker = new L.marker([markerSmokeyChromis[i][0], markerSmokeyChromis[i][1]], {icon: IconSmokeyChromis})
        .closeTooltip('').addTo(SmokeyChromis).on('click', SmokeyChromisHL);
}

var markerSeaBass = [
    [-22.42, -21.11],
    [-30.6, -12.4],
    [-37.67, -27.06],
    [-37.22, -28.06],
    [-36.45, -33.09],
    [-30.41, -21.73],
    [-31.81, -22.64],
    [-28.15, -16.67],
    [-27.27, -16.94],
    [-31.67, -13.42],
    [-26.41, -13.85],
    [-26.78, -12.82],
    [-22.31, -11.12],
    [-20.9, -11.01],
    [-15.82, -9.42],
    [-13.11, -4.68],
    [-10.61, -3.42],
    [-10.58, -9.9],
    [-9.76, -16.54],
    [-13.30, -22.78],
    [-20.7, -21.05],
    [-21.03, -27.32],
    [-23.73, -21],
];
for (var i = 0; i < markerSeaBass.length; i++) {
    marker = new L.marker([markerSeaBass[i][0], markerSeaBass[i][1]], {icon: IconSeaBass})
        .closeTooltip('').addTo(SeaBass).on('click', SeaBassHL);
}

var markerNibbler = [
    [-21.90, 43.08],
    [-13.48, 45.76],
    [-22.11, 46.33],
    [-21.84, 48.12],
    [-17.32, 48.12],
    [-19.35, 41.95],

    // Valencia
    [-14.01, 124.84],
    [-6.752, 125.63],
    [-18.07, 126.69],
    [-35.79, 127.03],
];
for (var i = 0; i < markerNibbler.length; i++) {
    marker = new L.marker([markerNibbler[i][0], markerNibbler[i][1]], {icon: IconNibbler})
        .closeTooltip('').addTo(Nibbler).on('click', NibblerHL);
}

var markerEyespotPuffer = [
    [-19.94, -21.89],
    [-20.28, -5.21],
    [-15.52, -23.74],
    [-23.98, -13.24],
    [-23.85, -11.21],
    [-19.64, -20.51],
    [-19.46, -4.86],
    [-37.21, -30.3],
    [-35.93, -29.44],
    [-32.98, -32.07],
    [-34.01, -23.1],
    [-31.61, -20.13],
    [-27.50, -22.2],
    [-32.45, -16.71],
    [-23.76, -22.86],
    [-23.9, -19.27],
    [-15.17, -23.04],
    [-10.71, -21.12],
    [-17, -16.27],
    [-16.28, -13.57],
    [-13.53, -6.54],
    [-11.97, -8.21],
    [-9.36, -11.26],
];
for (var i = 0; i < markerEyespotPuffer.length; i++) {
    marker = new L.marker([markerEyespotPuffer[i][0], markerEyespotPuffer[i][1]], {icon: IconEyespotPuffer})
        .closeTooltip('').addTo(EyespotPuffer).on('click', EyespotPufferHL);
}



//------------------------//
//      Unknown Area      //
//------------------------//
    var UnknownArea = L.layerGroup();
    var UnknownAreaLeft = [
    //top left
    [[69.17,-90.07],[69.56, -89.94],[69.65, -90.21],[69.66, -90.77],[69.80, -91.19],[69.95, -91.11],[70.01, -90.61],[69.99, -89.90],[70.19, -89.15],[70.31, -88.96],[70.27, -88.58],[69.91, -88.83],[69.79, -88.58],[69.78, -88.39],[69.85, -88.10],[69.78, -87.87],[69.40, -87.52],[69.26, -87.03],[69.53, -86.76],[69.53, -83.02],[69.86, -82.37],[69.90, -80.07],[69.90, -79.49],[70.30, -79.05],[70.45, -75.48],[69.85, -74.22],[69.76, -72.85],[70.18, -72.39],[70.80, -73.06],[71.13, -72.67],[71.03, -71.37],[70.60, -70.32],[70.53, -69.69],[70.59, -69.26],[70.83, -69.40],[71.06, -68.95],[71.31, -65.36],[71.60, -65.19],[71.55, -64.55],[71.25, -63.75],[70.60, -63.85],[70.47, -61.67],[71.07, -62.23],[71.49, -61.49],[71.88, -62.37],[72.10, -60.33],[72.27, -60.13],[72.59, -60.98],[73.17, -60.27],[73.80, -62.71],[68.58, -114.59],[62.82, -130.05],[40.19, -131.19],[39.59, -130.49],[39.62, -129.20],[44.88, -128.82],[46.59, -125.37],[51.30, -122.07],[56.56, -120.91],[61.24, -117.46],[65.18, -101.43],[68.27, -93.84],[69.07, -91.68]],
    ];
    var UnknownAreaRight = [
    //top right
    [[18.62,52.66],[18.66, 52.75],[18.66, 54.32],[18.57, 57.09],[18.52, 57.22],[18.26, 57.47],[18.25, 57.57],[18.40, 57.71],[18.60, 57.76],[18.61, 57.82],[18.60, 58.00],[18.51, 58.05],[18.50, 58.09],[18.54, 58.17],[18.54, 58.21],[18.36, 59.19],[16.90, 59.58],[16.14, 61.12],[14.53, 60.94],[14.40, 63.93],[13.97, 65.82],[14.44, 66.61],[14.53, 68.19],[19.19, 68.33],[19.28, 69.25],[20.60, 70.66],[22.60, 70.74],[22.64, 71.80],[23.45, 71.89],[23.45, 72.90],[24.33, 72.94],[24.41, 74.04],[25.13, 75.67],[25.61, 77.60],[25.61, 78.87],[25.21, 80.24],[24.69, 81.82],[24.21, 84.01],[22.52, 86.08],[22.52, 87.84],[18.99, 93.24],[18.86, 94.56],[19.11, 96.19],[17.90, 103.00],[17.94, 105.81],[18.36, 106.56],[20.52, 106.38],[21.21, 105.28],[21.70, 105.28],[22.36, 105.94],[23.53, 105.99],[23.85, 106.43],[23.81, 106.65],[23.33, 107.09],[22.97, 108.58],[21.01, 108.71],[20.80, 109.50],[20.39, 109.72],[19.90, 109.77],[18.86, 109.46],[17.86, 108.40],[17.57, 108.36],[14.27, 109.68],[10.37, 110.69],[7.72, 110.21],[6.93, 109.33],[6.67, 90.65],[-2.71, 79.26],[-2.41, 76.37],[-0.30, 76.32],[0.58, 77.34],[2.03, 77.07],[2.51, 74.48],[1.68, 73.20],[0.84, 73.56],[0.14, 73.29],[-2.06, 73.64],[-1.88, 70.92],[-4.56, 68.33],[-7.79, 59.36],[-7.75, 57.16],[-2.45, 54.44],[10.75, 54.79],[13.12, 52.73]],
    ];
    var UnknownAreaBottom = [
    //bottom
    [[-72.57,10.58],[-72.47, 11.81],[-71.63, 13.39],[-71.43, 14.98],[-71.60, 15.42],[-71.77, 14.27],[-71.96, 13.92],[-72.04, 14.80],[-71.82, 15.77],[-71.85, 16.29],[-72.47, 16.38],[-72.70, 14.54],[-73.12, 14.45],[-73.17, 15.33],[-73.89, 16.21],[-72.99, 22.18],[-72.23, 23.77],[-72.41, 25.35],[-73.01, 25.70],[-73.87, 28.60],[-74.42, 29.30],[-75.22, 28.86],[-75.45, 29.21],[-75.56, 31.50],[-75.42, 33.70],[-74.98, 35.10],[-74.93, 35.81],[-75.13, 36.42],[-75.92, 37.92],[-76.07, 38.88],[-76.09, 42.49],[-76.18, 43.45],[-77.01, 45.12],[-77.35, 49.61],[-77.74, 51.63],[-77.80, 55.32],[-77.36, 58.13],[-76.51, 61.03],[-76.20, 63.58],[-75.64, 65.34],[-75.47, 66.66],[-75.31, 70.26],[-74.95, 71.14],[-74.79, 73.07],[-74.28, 74.13],[-73.79, 73.51],[-73.50, 73.51],[-73.24, 75.01],[-72.81, 75.53],[-72.49, 74.48],[-71.88, 74.30],[-70.72, 75.45],[-69.31, 74.74],[-68.65, 72.46],[-66.71, 70.70],[-65.10, 71.67],[-64.08, 77.55],[-62.66, 79.40],[-62.75, 80.92],[-63.35, 81.49],[-63.35, 82.99],[-62.65, 86.63],[-62.83, 87.29],[-62.83, 90.41],[-62.65, 91.51],[-60.60, 91.78],[-59.86, 92.48],[-58.26, 91.07],[-58.58, 89.40],[-58.30, 88.96],[-57.88, 88.96],[-57.79, 88.39],[-57.41, 88.39],[-57.08, 89.31],[-57.67, 91.07],[-57.27, 92.30],[-56.36, 93.47],[-54.51, 89.31],[-54.54, 82.33],[-55.15, 78.20],[-55.15, 66.95],[-52.90, 60.27],[-52.90, 56.00],[-54.08, 53.80],[-55.02, 53.80],[-55.02, 51.10],[-56.22, 45.23],[-56.23, 36.24],[-57.28, 35.69],[-57.30, 33.12],[-69.76, 9.24],[-72.13, 9.19]],
    ];
    L.polygon(UnknownAreaLeft, {color: '#646047', weight: 0, fillOpacity: 1}).addTo(UnknownArea);
    L.polygon(UnknownAreaRight, {color: '#f9daac', weight: 0, fillOpacity: 1}).addTo(UnknownArea);
    L.polygon(UnknownAreaBottom, {color: '#9b8d7a', weight: 0, fillOpacity: 1}).addTo(UnknownArea);


//----------------------------------------//
//------      var map = L.map();    ------//
//----------------------------------------//
    //var allMarkers = L.layerGroup([City, Town, Node1, Node2, Node3, Node4, Island, Harbor, ImperialFishingDelivery, TradeManager, Barterer, BartererOcean, Vell, YoungSeaMonster, Hekaru, OceanStalker, Nineshark, Candidum, BlackRust, SaltwaterCrocodile, CoxPiratesShadowGhost, CargoShip, DrunkSniper, PirateFlag, Coelacanth, Grunt, Tuna, GiantOctopus, SpottedSeaBass, Tilefish, BlueGrouper, Porgy, BlackPorgy, SmokeyChromis, SeaBass, Nibbler, EyespotPuffer]);  
    var SeaMonster = L.layerGroup([Vell, YoungSeaMonster, Hekaru, OceanStalker, Nineshark, Candidum, BlackRust, SaltwaterCrocodile, BlackRust2, GoldmontPirate, Lekrashan]);
    var SeagullFishingSpot = L.layerGroup([Coelacanth, Grunt, Tuna, GiantOctopus, SpottedSeaBass, Tilefish, BlueGrouper, Porgy, BlackPorgy, SmokeyChromis, SeaBass, Nibbler, EyespotPuffer]);
    var CityAndTown = L.layerGroup([City, Town]);
    var Island = L.layerGroup([IslandYShape, IslandCircle]);

    var map = L.map('map', {
        center: [0,0],
        zoom: 2, 
        layers: [CityAndTown, Island, Harbor, ImperialFishingDelivery, BartererOcean, SeaMonster, UnknownArea],
        attributionControl: false
    });

    L.tileLayer('map/{z}/{x}/{y}.jpg',{
        minZoom: 2,
        maxNativeZoom: 7,
        maxZoom: 8,
        noWrap: true,
    }).addTo(map);

    var mapSW = [-300, 300],
        mapNE = [300, -300];

    map.setMaxBounds([mapSW,mapNE]);
    /*
    map.setMaxBounds(new L.LatLngBounds(
        map.unproject(mapSW, 7), //7, 7 default
        map.unproject(mapNE, 7)
    ));
    */


//-----------------------------------------------------------------------------//
//---------------  Polygon Click Control, Short Key, Highlight  ---------------//
//-----------------------------------------------------------------------------//
    var fishdisplayInfo = L.control();
    var highLightCheck = false;
    var clickCheck = false;
    var fishListClickCheck = false;
    var checkM = false;
    var checkF = false;
    var checkN = false;
    var pixelTwentyFive = 0;
    var Freshwater;
    var Saltwater;
    var HLcolor = '#00ff37';  // '#00ff37'

    function closeMenu(){
        document.querySelector("#sidebar").classList.add("collapsed");
        document.querySelector("#fishbtn").classList.remove("active");
        document.querySelector("#fish").classList.remove("active");
        document.querySelector("#markerbtn").classList.remove("active");
        document.querySelector("#marker").classList.remove("active");
        document.querySelector("#noticebtn").classList.remove("active");
        document.querySelector("#notice").classList.remove("active");
        checkM = false;
        checkF = false;
        checkN = false;
    }

    function checkMClick(){
        if(checkM == false){
            checkM = true;
        }
        else{
            checkM = false;
        }
    }
    function checkFClick(){
        if(checkF == false){
            checkF = true;
        }
        else{
            checkF = false;
        }
    }
    function checkNClick(){
        if(checkN == false){
            checkN = true;
        }
        else{
            checkN = false;
        }
    }

    function clickSearch(fishName){  // searchbox after clicking fish icon
        closeMenu();
        document.querySelector("#sidebar").click();
        document.querySelector("#sidebar").classList.remove("collapsed");
        document.querySelector("#fishbtn").classList.add("active");
        document.querySelector("#fish").classList.add("active");
        document.querySelector("#keyword").value = fishName;
        $('#keyword').keyup();
        checkF=true;
    }

    $(document).keyup(function(e) {  // ESC to close menu and highlights
        if (e.key === "Escape") { 
            if (checkM == false && checkF == false && checkN == false){
                SeagullHighlightOff();
                resetHighlightESC();
            }
            closeMenu();
        }
    });

    $(document).keyup(function(e) {  // M to open Marker menu
        if (e.key === 'm') { 
            if(checkM == false && document.activeElement.id !='keyword')
            {
                closeMenu();
                document.querySelector("#sidebar").classList.remove("collapsed");
                document.querySelector("#markerbtn").classList.add("active");
                document.querySelector("#marker").classList.add("active");
                checkM=true;
            }
        }
    });

    $(document).keyup(function(e) {  // F to open Fish List menu
        if (e.key === 'f') { 
            if(checkF == false)
            {
                closeMenu();
                document.querySelector("#sidebar").classList.remove("collapsed");
                document.querySelector("#fishbtn").classList.add("active");
                document.querySelector("#fish").classList.add("active");
                $('#keyword').focus().select();
                checkF=true;
            }
        }
    });

    $(document).keyup(function(e) {  // N to open Notice menu
        if (e.key === 'n') { 
            if(checkN == false && document.activeElement.id !='keyword')
            {
                closeMenu();
                document.querySelector("#sidebar").classList.remove("collapsed");
                document.querySelector("#noticebtn").classList.add("active");
                document.querySelector("#notice").classList.add("active");
                checkN=true;
            }
        }
    });

    function fishListClick() {
        if(fishListClickCheck == false){
            fishListClickCheck = true;
            highLightCheck = true;
            clickCheck = true;
        }
        else{
        }
    }
    function fishListMouseOut() {
        if(fishListClickCheck == false) {
            resetHighlight();
        }
    }

    function findPolygon(e) {
        Freshwater.eachLayer(function (layer) {
            Freshwater.resetStyle(layer);
        });
        Saltwater.eachLayer(function (layer) {
            Saltwater.resetStyle(layer);
        });
        fishdisplayInfo.update();

        for(i=0;i<FreshwaterData.features.length;i++)
        {
            if(FreshwaterData.features[i].properties.fishGroup.find(search => search === e) == e)
            {
                Freshwater.eachLayer(function(layer){
                    if(layer._polygonId == i)
                    {
                        layer.setStyle({
                            weight: 4,
                            color: HLcolor,
                            dashArray: '',
                            fillOpacity: 0.7
                        });
                        highLightCheck = false;
                        clickCheck = false;
                        fishListClickCheck = false;
                    }
                });
            }
        }

        for(i=0;i<SaltwaterData.features.length;i++)
        {
            if(SaltwaterData.features[i].properties.fishGroup.find(search => search === e) == e)
            {
                Saltwater.eachLayer(function(layer){
                    if(layer._polygonId == i)
                    {
                        layer.setStyle({
                            weight: 4,
                            color: HLcolor,
                            dashArray: '',
                            fillOpacity: 0.7
                        });
                        highLightCheck = false;
                        clickCheck = false;
                        fishListClickCheck = false;
                    }
                });
            }
        }
    }


    function polygonHighlight(e) {
        if(clickCheck == false)
        {
            var layer = e.target;
            layer.setStyle({
                weight: 4,
                color: HLcolor,
                dashArray: '',
                fillOpacity: 0.7
            });
            // if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            //     layer.bringToFront();
            // }
            fishdisplayInfo.update(layer.feature.properties);
        }

    }

    function resetHighlight() {  
        if(highLightCheck == true)
        {
        }
        else{
            Freshwater.eachLayer(function (layer) {
                Freshwater.resetStyle(layer);
            });
            Saltwater.eachLayer(function (layer) {
                Saltwater.resetStyle(layer);
            });
            highLightCheck = false;
            clickCheck = false;
            fishListClickCheck = false;
            infoData = "";
            fishdisplayInfo.update();
        }
        //fishdisplayInfo.update(layer.feature.properties);
    }

    function resetHighlightESC() {
        Freshwater.eachLayer(function (layer) {
            Freshwater.resetStyle(layer);
        });
        Saltwater.eachLayer(function (layer) {
            Saltwater.resetStyle(layer);
        });
        highLightCheck = false;
        clickCheck = false;
        fishListClickCheck = false;
        infoData = "";
        fishdisplayInfo.update();
    }

    function polygonClick(e) {
        if(clickCheck == true)
        {   
            if(e.target.options.color == HLcolor) {
                Freshwater.eachLayer(function (layer) {
                    Freshwater.resetStyle(layer);
                });
                Saltwater.eachLayer(function (layer) {
                    Saltwater.resetStyle(layer);
                });
                fishdisplayInfo.update();
                highLightCheck = false;
                clickCheck = false;
                infoData = "";
            }
            else {
                Freshwater.eachLayer(function (layer) {
                    Freshwater.resetStyle(layer);
                });
                Saltwater.eachLayer(function (layer) {
                    Saltwater.resetStyle(layer);
                });
                fishdisplayInfo.update();
                highLightCheck = false;
                clickCheck = false;
                infoData = "";

                var layer = e.target;
                layer.setStyle({
                    weight: 4,
                    color: HLcolor,
                    dashArray: '',
                    fillOpacity: 0.7
                });
                fishdisplayInfo.update(layer.feature.properties);
                highLightCheck = true;
                clickCheck = true;
            }
        }
        else{
            infoData = "";
            var layer = e.target;
            layer.setStyle({
                weight: 4,
                color: HLcolor,
                dashArray: '',
                fillOpacity: 0.7
            });
            // if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            //     layer.bringToFront();
            // }
            fishdisplayInfo.update(layer.feature.properties);
            //map.fitBounds(e.target.getBounds());
            highLightCheck = true;
            clickCheck = true;
        }
    }


    function style(feature) {
        return {
            weight: 1,
            opacity: 1,
            color: '#FFFFFF',
            dashArray: '',
            fillOpacity: 0.5,
            fillColor: feature.properties.locationColor
        };
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: polygonHighlight,
            mouseout: resetHighlight,
            click: polygonClick
        });
        layer._polygonId = feature.id;
    }

    Freshwater = L.geoJson(FreshwaterData, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);

    Saltwater = L.geoJson(SaltwaterData, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);



//-----------------------------------------//
//------        Language Data        ------//
//-----------------------------------------//
    var htmlData = [
        [0,0,
        'This website is fully functioning on <span style="color:#5995fa"><b>Chrome</b></span>, <span style="color:#FB9443"><b>Mozilla</b></span> and <span style="color:#fa4554"><b>Opera</b></span>.',
        '이 웹사이트는 <span style="color:#5995fa"><b>Chrome</b></span>, <span style="color:#FB9443"><b>Mozilla</b></span> 그리고 <span style="color:#fa4554"><b>Opera</b></span> 에서 완벽하게 동작합니다.'],
        [1,1,'Shortcut Key <b>[M]</b>','단축키 <b>[M]</b>'],
        [2,2,'Shortcut Key <b>[F]</b>','단축키 <b>[F]</b>'],
        [3,3,'Shortcut Key <b>[N]</b>','단축키 <b>[N]</b>'],
        [4,4,'Close Menu <b>[ESC]</b>','창 닫기 <b>[ESC]</b>'],
        [5,5,'This map is based on <b>KR</b> server. (<b>12 NOV 2020</b>)','이 지도는 <b>한국</b> 서버 기준으로 되어있습니다. (<b>2020-11-12</b>)'],
        [6,6,'Worker Stamina Recovery +5','일꾼 행동력 5 회복'],
        
        [7,7,'Type','종류'],
        [8,8,'Freshwater','민물'],
        [9,9,'Saltwater','바닷물'],
        [10,10,'Other','그 외'],
        [11,11,'Method','방식'],
        [12,12,'Fishing','낚시'],
        [13,13,'Seagull','갈매기'],
        [14,14,'Harpoon','작살'],
        [15,15,'Grade','등급'],
        [16,16,'RESET','초기화'],
        [17,17,'Click <b>icon</b> to<br><b>show location</b>','<b>아이콘</b> 클릭 시<br><b>위치</b> 표시'],
        [18,18,'Please contact me if there is an error in the map.<br>bdofish.com@gmail.com</b> / Discord: <b>bdofish#4645</b>','만약 지도에 오류가 있다면 알려주세요.<br>bdofish.com@gmail.com</b> / 디스코드: <b>bdofish#4645</b>'],
    ];


    var OTarray = [
        ['<span class="FlexAlignCenter"><img class="markerIcon" src="icons/'],
        ['<span style="padding-left:3px;">'],
        ['<th class="seagullspottable"><div class="FlexAlignCenter"><img class="seagullspotfish" '],
        ['<span class="seagullspottext">'],
        [4,4,
        ' style="left: -47px;">※Added node icons on <b>Oquilla\'s Eye</b>, <b>Crow\'s Nest</b> and <b>Feltron Island</b> to help locate them. (Currently these are not included in-game yet.)',
        ' style="left: -39px;">※보기 편하도록 <b>오킬루아의 눈</b>, <b>까마귀 둥지</b> 그리고 <b>펠트런 섬</b>에 노드 아이콘을 추가했습니다. (현재 게임 내에는 없습니다.)'],
        [5,5,
        ' style="left: -89px;">※Click on a fishing zone for a fixed fish table, and click the fish icon on the table to search in the fish list.<br><br>※\'(no fish)\' zone includes both null cast water zones and trash-only table zones.',
        ' style="left: -64px;">※낚시 지역을 클릭하면 물고기 표를 고정시킬 수 있고, 표시된 물고기 아이콘을 클릭하면 물고기 목록에서 검색이 됩니다.<br><br>※\'(물고기 없음)\' 지역은 낚시 캐스팅이 되지 않는 물 지역과, 잡동사니만 낚이는 지역 모두를 포함합니다.'],
        [6,6,
        ' style="left: -116px;">※Two fishing zones near <b>Glish</b>(located in <b>Serendia</b>) have been included in the <b>Calpheon</b> group since they have same species as the <b>Calpheon</b> fish table.',
        ' style="left: -76px;">※<b>세렌디아</b>에 위치한 <b>글리시 마을</b> 근처 두 개의 낚시 지역은 <b>칼페온</b> 지역과 같은 물고기 표를 가지고 있어서 <b>칼페온</b> 그룹에 포함되었습니다.'],
        [7,7,
        ' style="left: -108px;"><div class="TooltipHeight150">※When fishing at sea: it is advised to fish in deep water, farther away from the coast and islands. This is because fishing too close to the coast or islands may result in catching only <span class="shadowGreen">Common</span> fish or fishing in a similar table with no <span class="shadowOrange">Prize Catch</span> fish.<br>(Known Exceptions: Velia Beach, Starry Midnight Port, Oquilla\'s Eye and Crow\'s Nest; all fish from these tables may be caught in every spot.)<br><br>※When fishing in the Great Ocean: confirm you have the correct species by comparing the fish you are catching with the fish listed in the provided table, since the fish tables do not always align correctly with the sea borders.<br><br>※If harpoon fishing does not work, try it again farther away from the coast and islands, switching from harpoon to fishing rod and back to harpoon, or changing to another character and back to your fishing character.',
        ' style="left: -87px;"><div class="TooltipHeight150">※바다에서 낚시를 할 때, 해안과 섬에서 멀리 떨어진 수심이 깊은 곳에서 낚시하는 것이 좋습니다. 해안과 섬에 너무 가까운 곳에서 낚시를 하게 되면 <span class="shadowGreen">일반</span> 물고기만 낚이거나, <span class="shadowOrange">보물</span> 물고기를 제외한 나머지 물고기들만 낚일 수도 있기 때문입니다.<br>(알려진 예외: <b>벨리아 마을 해변</b>, <b>깊은 밤의 항구</b>, <b>오킬루아의 눈</b> 그리고 <b>까마귀의 둥지</b>; 이 지역 물고기 표의 물고기들은 어떤 위치에서 낚시를 하더라도 모든 물고기들을 낚을 수 있습니다.)<br><br>※대양에서 낚시를 할 때, 바다 경계선에 따라 물고기 표가 항상 정확하게 나누어지지 않기 때문에 원하는 물고기가 잘 낚이고 있는지 확인을 해야 합니다.<br><br>※만약 작살 낚시가 작동되지 않는다면, 해안과 섬에서 멀리 떨어진 곳에서 다시 시도해보거나, 작살을 재장착 해보거나, 다른 캐릭터로 교체했다가 다시 접속해보세요.'],
        [8,8,
        ' style="left: -106px;"><div class="TooltipHeight150">※Click the fish icon on the map to highlight seagull hotspot locations. Press [<b>ESC</b>] to turn off all highlights.<br><br>※Each type of seagull hotspot fish has its own textures.',
        ' style="left: -113px;"><div class="TooltipHeight150">※지도 위에 물고기 아이콘을 눌러서 갈매기 낚시 포인트에 하이라이트를 켜거나 끌 수 있으며, [<b>ESC</b>]버튼을 누르면 모든 하이라이트를 끌 수 있습니다.<br><br>※갈매기 낚시 포인트의 물고기들은 각각 고유의 텍스처를 가지고 있습니다.'],
        [9,9,
        '※Seagull hotspots do not appear in fixed positions. Check around where the fish icon is located and find the same texture type of fish jumping out of water.<br><br>※Due to seagull hotspots having differing visibility settings based on Fishing level, it is recommended to start hotspot fishing after [Master 1].',
        '※갈매기 낚시 포인트는 항상 고정된 자리에서 등장하지 않습니다. 물고기 아이콘이 위치한 곳 주변을 둘러보면서 같은 텍스처 모양의 물고기가 튀어 오르는 장소를 찾아보세요.<br><br>※갈매기 낚시 포인트들은 각 포인트를 발견할 수 있는 낚시 레벨이 다르게 설정되어 있기 때문에, [명장 1] 이후부터 갈매기 낚시를 하는 것을 권장합니다.'],
        [10,10,
        ' style="left: -181px;">※This just shows approximate locations. For an accurate location it is recommended the player uses a compass.',
        ' style="left: -140px;">※이것은 대략적인 위치만 보여줍니다. 정확한 위치는 나침반 아이템을 사용할 것을 권장합니다.'],
        [11,11,'All','전체'],
        [12,12,'Node','노드'],
        [13,13,'City & Town','도시 & 마을'],
        [14,14,'Node1','노드1'],
        [15,15,'Node2','노드2'],
        [16,16,'Node3','노드3'],
        [17,17,'Node4','노드4'],
        [18,18,'Island','섬'],
        [19,19,'Turn off Node1, 2','노드1, 2 를 해제하세요'],
        [20,20,'Fishing Zone','낚시 지역'],
        [21,21,'Freshwater','민물'],
        [22,22,'Saltwater','바닷물'],
        [23,23,'Seagull Hotspot','갈매기 낚시 포인트'],
        [24,24,'Middle','중앙'],
        [25,25,'West','서쪽'],
        [26,26,'East','동쪽'],
        [27,27,'Barterer','물물교환원'],
        [28,28,'Barterer (Great Ocean)','물물교환원 (대양)'],
        [29,29,'Harbor','선착장'],
        [30,30,'Imperial Fishing Delivery','황실낚시 납품'],
        [31,31,'Trade Manager','무역관리인'],
        [32,32,'Monsters','몬스터'],
        [33,33,'Sea Monster','해왕류'],
        [34,34,'Cox Pirate\'s Shadow Ghost','콕스 해적단의 그림자 망령'],
        [35,35,'Cargo Ship','수상한 수송선'],
        [36,36,'Drunk Sniper','주정뱅이 저격수'],
        [37,37,'Pirate Flag','콕스 해적단의 깃발']
    ]

    var SeagullFishList = [
        [0,0,'Coelacanth','실러캔스'],
        [1,1,'Grunt','벤자리'],
        [2,2,'Tuna','참치'],
        [3,3,'Giant Octopus','대왕문어'],
        [4,4,'Spotted Sea Bass','점농어'],
        [5,5,'Tilefish','옥돔'],
        [6,6,'Blue Grouper','블루그루퍼'],
        [7,7,'Porgy','돔'],
        [8,8,'Black Porgy','감성돔'],
        [9,9,'Smokey Chromis','연무자리돔'],
        [10,10,'SeaBass','농어'],
        [11,11,'Nibbler','벵에돔'],
        [12,12,'Eyespot Puffer','참복']
    ];



//---------------------------------------------------------------//
//------------------      document.write      -------------------//   전체적인 html 틀
//---------------------------------------------------------------//
    document.write(
        '<div id="sidebar" class="sidebar collapsed sidebarHeight sidebarWidth">'+
            '<div class="sidebar-tabs">'+
                '<ul role="tablist">'+
                    '<li id="markerbtn" onclick="checkMClick()"><a href="#marker" role="tab"><i class="fas fa-map-marker-alt" style="font-size:15px;" title="Marker"></i></a></li>'+
                    '<li id="fishbtn" onclick="checkFClick()"><a href="#fish" role="tab"><i class="fas fa-fish" style="font-size:15px;" title="Fish List"></i></a></li>'+
                    '<li id="noticebtn" onclick="checkNClick()"><a href="#notice" role="tab"><i class="fas fa-bullhorn" style="font-size:15px;" title="Notice"></i></a></li>'+
                '</ul>'+
            '</div>'+
            '<div class="sidebar-content">'+
                '<div class="sidebar-pane" id="marker">'+
                    '<h1 class="sidebar-header">Marker<span class="menuTitleIcon"><i class="fas fa-map-marker-alt"></i></span><span class="sidebar-close"><i class="fa fa-caret-right"></i></span></h1>'+
                    '<div class="MenuTextBottom">'+
                        '<div class="MenuTextBottomLeft">' + htmlData[1][langNum] + '</div>'+
                        '<div class="MenuTextBottomRight" onclick="closeMenu()">' + htmlData[4][langNum] + '</div>'+
                    '</div>'+
                '</div>'+
                '<div class="sidebar-pane" id="fish">'+
                    '<h1 class="sidebar-header">Fish List<span class="menuTitleIcon"><i class="fas fa-fish"></i></span><span class="sidebar-close"><i class="fa fa-caret-right"></i></span></h1>'+
                    '<div style="padding-top:5px; padding-bottom:5px; font-size:1.2em;">'+
                        '<div style="display:flex; padding-left:3px;">'+
                            '<b>' + htmlData[7][langNum] + '</b>'+
                                '<label for="fw" class="labelStyle">'+
                                    '<input type="checkbox" id="fw" class="user-filter" data-filter="fw" value="fw" unchecked>' + htmlData[8][langNum] +
                                '</label>'+
                            '<label for="sw" class="labelStyle">'+
                                '<input type="checkbox" id="sw" class="user-filter" data-filter="sw" value="sw" unchecked>' + htmlData[9][langNum] +
                            '</label>'+
                            '<label for="etc" class="labelStyle">'+
                                '<input type="checkbox" id="etc" class="user-filter" data-filter="etc" value="etc" unchecked>' + htmlData[10][langNum] +
                            '</label><br>'+
                        '</div>'+
                        '<div style="display:flex; padding-left:3px;">'+
                            '<b>' + htmlData[11][langNum] + '</b>'+
                            '<label for="fs" class="labelStyle">'+
                                '<input type="checkbox" id="fs" class="user-filter" data-filter="fs" value="fs" unchecked>' + htmlData[12][langNum] +
                            '</label>'+
                            '<label for="sg" class="labelStyle">'+
                                '<input type="checkbox" id="sg" class="user-filter" data-filter="sg" value="sg" unchecked>' + htmlData[13][langNum] +
                            '</label>'+
                            '<label for="hp" class="labelStyle">'+
                                '<input type="checkbox" id="hp" class="user-filter" data-filter="hp" value="hp" unchecked>' + htmlData[14][langNum] +
                            '</label><br>'+
                        '</div>'+
                        '<div style="display:flex; padding-left:3px;">'+
                            '<b>' + htmlData[15][langNum] + '</b>'+
                            '<label for="or" class="labelStyle">'+
                                '<input type="checkbox" id="or" class="user-filter" data-filter="or" value="or" unchecked><img class="gradeIcon" src="icons/GradeIcon.png" style="border:2.4px solid #FD6B49" title="Orange">'+
                            '</label>'+
                            '<label for="yw" class="labelStyle">'+
                                '<input type="checkbox" id="yw" class="user-filter" data-filter="yw" value="yw" unchecked><img class="gradeIcon" src="icons/GradeIcon.png" style="border:2.4px solid #EDC845" title="Yellow">'+
                            '</label>'+
                            '<label for="bl" class="labelStyle">'+
                                '<input type="checkbox" id="bl" class="user-filter" data-filter="bl" value="bl" unchecked><img class="gradeIcon" src="icons/GradeIcon.png" style="border:2.4px solid #56B3E0" title="Blue">'+
                            '</label>'+
                            '<label for="gr" class="labelStyle">'+
                                '<input type="checkbox" id="gr" class="user-filter" data-filter="gr" value="gr" unchecked><img class="gradeIcon" src="icons/GradeIcon.png" style="border:2.4px solid #A2BF40" title="Green">'+
                            '</label>'+
                            '<label for="wh" class="labelStyle">'+
                                '<input type="checkbox" id="wh" class="user-filter" data-filter="wh" value="wh" unchecked><img class="gradeIcon" src="icons/GradeIcon.png" style="border:2.4px solid #a2a2a2" title="White">'+
                            '</label>'+
                        '</div>'+
                        '<div class="SearchBar">'+
                            '<input autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" class="input-text SearchBox" type="text" id="keyword" placeholder="  Search.."/>'+
                            '<div><button class="SearchBarButton" onclick="resetFilter()"><b>' + htmlData[16][langNum] + '</b></button></div>'+
                            '<div class="SearchBarText">'+ htmlData[17][langNum] + '</b><br>'+
                            '</div>'+
                        '</div>'+
                        '<div div id="fishInfo"></div>'+
                        '<div class="MenuTextBottom">'+
                            '<div class="MenuTextBottomLeft">' + htmlData[2][langNum] + '</div>'+
                            '<div class="MenuTextBottomRight" onclick="closeMenu()">' + htmlData[4][langNum] + '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
                '<div class="sidebar-pane" id="notice">'+
                    '<h1 class="sidebar-header">Notice<span class="menuTitleIcon"><i class="fas fa-bullhorn" ondblclick="advancedMode(); this.ondblclick=null;"></i></span><span class="sidebar-close"><i class="fa fa-caret-right"></i></span></h1>'+
                    '<div class="noticeScroll">'+
                        '<br>'+
                        '<div class="noticeBox">'+
                            '<div class="noticeText">' + htmlData[5][langNum] + '<br></div>'+
                            '<div id="noticeInfo" class="noticeBoxText"></div>'+
                        '</div>'+
                        '<br>'+
                        '<div class="noticeText">Special thanks to <span style="color:#321700;text-shadow: 0px 0px 2px #A58A58, 0px 0px 2px #A58A58;">Moonraker</span>, <span style="color: #806889; text-shadow: 0px 0px 2px #BB887E, 0px 0px 2px #BEBCC8;">Adlan</span> and<br>all fisherman in <span style="color:#e37293; text-shadow: 0px 0px 1px #e3729391, 0px 0px 4px #2ddcff;">MaoMaoPrince Fishing Community</span>.</div>'+
                        '<br>'+
                        '<div class="buymeacoffee">'+
                            '<a class="bmc-button" target="_blank" href="https://www.buymeacoffee.com/bdofish">'+
                                '<div class="coffee-alt-emoji" style="display:flex;">🍺</div><span class="buymeacoffeeText">' + htmlData[6][langNum] + '</span>'+
                            '</a>'+
                        '</div>'+
                        '<div class="noticeText">' + htmlData[18][langNum] + '</div>'+
                    '</div>'+
                    '<div class="MenuTextBottom">'+
                        '<div class="MenuTextBottomLeft">' + htmlData[3][langNum] + '</div>'+
                        '<div class="MenuTextBottomRight" onclick="closeMenu()">' + htmlData[4][langNum] + '</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>' +

        '<div class="leaflet-bottom" style="right:10px">'+
            '<a href="http://www.bdofish.com/" target="_self"><img src="icons/unitedstates.png" class="flag"></a>'+
            '<a href="kr.html" target="_self"><img src="icons/korea.png" class="flag"></a>'+
        '</div>'+
        '<div class="WebBrowser">'+
            '<div style="position:relative;top:7px;">' + htmlData[0][langNum] + '</div>'+
        '</div>'
    );



//-----------------------------------------//
//      Json Request, Fish List Table      //   Json 파일 불러들여서 Fish List 테이블이랑 메뉴를 만들기
//-----------------------------------------//
    var fishContainer = document.getElementById("fishInfo");
    var noticeContainer = document.getElementById("noticeInfo");
    var fishbtn = document.getElementById("fishbtn");
    var noticebtn = document.getElementById("noticebtn");
    var fishJson = [];
    var noticeJson = [];
    var FishListString = "";
    var NoticeString = "";
    var fishJsonData = "";
    var noticeJsonData = "";
    var spriteSort = [];


    var fishRequest = new XMLHttpRequest();
        fishRequest.open('GET', 'https://raw.githubusercontent.com/bdofish/bdofish.github.io/master/scripts/fish-data.json');
        fishRequest.onload = function() {
            fishJsonData = JSON.parse(fishRequest.responseText);
            fishJson = fishJsonData;
            renderFishList(fishJsonData);
        };
        fishRequest.send();


    var noticeRequest = new XMLHttpRequest();
        noticeRequest.open('GET', 'https://raw.githubusercontent.com/bdofish/bdofish.github.io/master/scripts/notice.json');
        noticeRequest.onload = function() {
            noticeJsonData = JSON.parse(noticeRequest.responseText);
            noticeJson = noticeJsonData;
            renderNotice(noticeJsonData);
        };
        noticeRequest.send();


    function renderNotice(noticeJsonData) {
        NoticeString += "<div style=\"margin: 7px;\">";
        for(i = 0; i < noticeJsonData.length; i++)
        {
            if(langNum == 2){
                NoticeString += 
                "<div>" +         
                "<div style=\"font-size:11px;\"><b>" + noticeJsonData[i].date_EN + "</b></div>" + noticeJsonData[i].notice_EN + 
                "<div style=\"text-align:center;\"><div class=\"dividingLine\"></div></div>" +
                "</div>";
            }
            else if(langNum == 3){
                NoticeString += 
                "<div>" +         
                "<div style=\"font-size:11px;\"><b>" + noticeJsonData[i].date_KR + "</b></div>" + noticeJsonData[i].notice_KR +  
                "<div style=\"text-align:center;\"><div class=\"dividingLine\"></div></div>" +
                "</div>";
            }

        }
        NoticeString += "<div>";
        noticeContainer.insertAdjacentHTML('beforeend', NoticeString);
    }


    //white = #E5E5E5, green = #A2BF40, blue = #56B3E0, yellow = #EDC845, orange = #FD6B49
    function renderFishList(fishJsonData) {
        if(langNum == 2){
            FishListString +=
            "<div class=\"tableHeight\">" +
            "<table class=\"tableStyle\" id=\"myTable\">" +
            "<thead style=\"font-size:10px;\">" +
            "<tr style=\"z-index: 20; color:black; background-color:#FC7B27;\">" +
                    "<th style=\"width:4em; pointer-events:none\" class=\"sticky\">Type</th>" +
                    "<th style=\"width:3.3em; pointer-events:none\" class=\"sticky\">Method</th>" +
                    "<th style=\"width:3.3em; pointer-events:none\" class=\"sticky\">Icon</th>" +
                    "<th style=\"width:10em; cursor:pointer\" class=\"sticky\" title=\"Sort\">Name<span style=\"font-size:10px; font-weight:normal; position:absolute; right:5px;\">↑A-Z↓</span></th>" +
            "</tr>" +
            //"</div>" +
            "</thead>";
            "<tbody style=\"font-size:1.2em;\" id=\"tbodycolor\">";
        }
        else if(langNum == 3){
            FishListString +=
            "<div class=\"tableHeight\">" +
            "<table class=\"tableStyle\" id=\"myTable\">" +
            "<thead style=\"font-size:10px;\">" +
            "<tr style=\"z-index: 20; color:black; background-color:#FC7B27;\">" +
                    "<th style=\"width:4em; pointer-events:none\" class=\"sticky\">종류</th>" +
                    "<th style=\"width:3.3em; pointer-events:none\" class=\"sticky\">방식</th>" +
                    "<th style=\"width:3.3em; pointer-events:none\" class=\"sticky\">아이콘</th>" +
                    "<th style=\"width:10em; cursor:pointer\" class=\"sticky\" title=\"정렬\">이름<span style=\"font-size:10px; font-weight:normal; position:absolute; right:5px;\">↑ㄱ-ㅎ↓</span></th>" +
            "</tr>" +
            //"</div>" +
            "</thead>";
            "<tbody style=\"font-size:1.2em;\" id=\"tbodycolor\">";
        }

        $(document).ready(function() {
            $("#myTable").tablesorter();
        });

        //----------  Fish Image Sort  -----------//
        var gradeColor = "";
        var pixelThirty = 0;
        for(i = 0; i < fishJsonData.length; i++)
        {
            spriteSort.push(fishJsonData[i].file);
        }
        spriteSort.sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });
        // var splice = spriteSort.splice(0, 3); // sort 이후 앞에 한글이름 3개만 다시 뒤에 추가하기 ->  다 영어이름 파일로 변경해서 이제 필요없음.
        // for(i=0;i<splice.length;i++)
        // {
        //     spriteSort.push(splice[i]);
        // }

        //----------  Fish Table  -----------//
        for(i = 0; i < fishJsonData.length; i++) {
            pixelThirty = (spriteSort.indexOf(fishJsonData[i].file))*-30;
            if(fishJsonData[i].grade == "#E5E5E5") {
                gradeColor = "black";
            }
            else{
                gradeColor = fishJsonData[i].grade;
            }

            if(langNum == 2){
                FishListString += 
                "<tr class=\"trclass " + fishJsonData[i].class + "\";style=\"padding:3px;\">" +
                    "<td class=\"tdStyle\">" + fishJsonData[i].type_EN + "</td>" +
                    "<td class=\"tdStyle\">" + fishJsonData[i].method_EN + "</td>" + 
                    "<td><div style=\"text-align:-webkit-center;\";><div id=\"fishbackground\" style=\"margin:0.4em; width:3em; height:3em; border: 1px solid " + gradeColor + ";\"><div class=\"spriteCSS\" style=\"background-position: 0px " + pixelThirty + "px; width:30px; height:30px;\" onclick=\"fishListClick();\" onmouseover=\"findPolygon('" + fishJsonData[i].file + "')\" onmouseout=\"fishListMouseOut();\"></div></div></div></td>";
                    
                if(fishJsonData[i].tooltip_EN == "") { // add question mark if tooltip exists
                    if(fishJsonData[i].price == "") {
                        FishListString +=
                        "<td class=\"searchName\" style=\"color:" + fishJsonData[i].grade + "\"><div>" + fishJsonData[i].name_EN + "</div></td></tr>";
                    }
                    else {
                        FishListString +=
                        "<td class=\"searchName\" style=\"color:" + fishJsonData[i].grade + "\"><div>" + fishJsonData[i].name_EN + "</div><div class=\"priceCSS\">" + fishJsonData[i].price + "<img class=\"silverCSS\" src=\"icons/Silver.png\"></div></td></tr>";
                    }
                }
                else{
                    if(fishJsonData[i].price == "") {
                        FishListString +=
                        "<td class=\"searchName\" style=\"color:" + fishJsonData[i].grade + "\"><div>" + fishJsonData[i].name_EN + "</div><div class=\"qMark\"><span id=\"tooltipIcon\">?<div class=\"tooltipText\">" + fishJsonData[i].tooltip_EN + "</div></span></div></td></tr>";
                    }
                    else {
                        FishListString +=
                        "<td class=\"searchName\" style=\"color:" + fishJsonData[i].grade + "\"><div>" + fishJsonData[i].name_EN + "</div><div class=\"qMark\"><span id=\"tooltipIcon\">?<div class=\"tooltipText\">" + fishJsonData[i].tooltip_EN + "</div></span></div><div class=\"priceCSS\">" + fishJsonData[i].price + "<img class=\"silverCSS\" src=\"icons/Silver.png\"></div></td></tr>";
                    }
                }
            }
            else if(langNum == 3){
                FishListString += 
                "<tr class=\"trclass " + fishJsonData[i].class + "\";style=\"padding:3px;\">" +
                    "<td class=\"tdStyle\">" + fishJsonData[i].type_KR + "</td>" +
                    "<td class=\"tdStyle\">" + fishJsonData[i].method_KR + "</td>" + 
                    "<td><div style=\"text-align:-webkit-center;\";><div id=\"fishbackground\" style=\"margin:0.4em; width:3em; height:3em; border: 1px solid " + gradeColor + ";\"><div class=\"spriteCSS\" style=\"background-position: 0px " + pixelThirty + "px; width:30px; height:30px;\" onclick=\"fishListClick();\" onmouseover=\"findPolygon('" + fishJsonData[i].file + "')\" onmouseout=\"fishListMouseOut();\"></div></div></div></td>";
                    
                if(fishJsonData[i].tooltip_KR == "") { // add question mark if tooltip exists
                    if(fishJsonData[i].price == "") {
                        FishListString +=
                        "<td class=\"searchName\" style=\"color:" + fishJsonData[i].grade + "\"><div>" + fishJsonData[i].name_KR + "</div></td></tr>";
                    }
                    else {
                        FishListString +=
                        "<td class=\"searchName\" style=\"color:" + fishJsonData[i].grade + "\"><div>" + fishJsonData[i].name_KR + "</div><div class=\"priceCSS\">" + fishJsonData[i].price + "<img class=\"silverCSS\" src=\"icons/Silver.png\"></div></td></tr>";
                    }
                }
                else{
                    if(fishJsonData[i].price == "") {
                        FishListString +=
                        "<td class=\"searchName\" style=\"color:" + fishJsonData[i].grade + "\"><div>" + fishJsonData[i].name_KR + "</div><div class=\"qMark\"><span id=\"tooltipIcon\">?<div class=\"tooltipText\">" + fishJsonData[i].tooltip_KR + "</div></span></div></td></tr>";
                    }
                    else {
                        FishListString +=
                        "<td class=\"searchName\" style=\"color:" + fishJsonData[i].grade + "\"><div>" + fishJsonData[i].name_KR + "</div><div class=\"qMark\"><span id=\"tooltipIcon\">?<div class=\"tooltipText\">" + fishJsonData[i].tooltip_KR + "</div></span></div><div class=\"priceCSS\">" + fishJsonData[i].price + "<img class=\"silverCSS\" src=\"icons/Silver.png\"></div></td></tr>";
                    }
                }
            }
        }

        FishListString +=
            "</tbody></table>" +
            "</div>"
        fishContainer.insertAdjacentHTML('beforeend', FishListString);
    }

    
        



//----------------------------------------//
//              overlaysTree              //     Marker 메뉴 만들기. Json 파일 불러들이는 것 이후에 배치해야 함.
//----------------------------------------//
    var overlaysTree = {
        label: '<b>' + OTarray[11][langNum] + '</b>',
        selectAllCheckbox: 'Un/select All',
        children: [
            //{label: '<div id="onlysel">> Show Only Selected <</div>'},
            {label: '<div class="leaflet-control-layers-separator"></div>'},
            

            {label: '<b>' + OTarray[12][langNum] + '</b><span id="MarkertooltipIcon">?<div class="MarkertooltipText"' + OTarray[4][langNum] + '</div></span>', selectAllCheckbox: true, children: [
                {label: OTarray[0] + 'City.png">' + OTarray[1] + '<span>' + OTarray[13][langNum] + '</span></span>', layer: CityAndTown},
                {label: OTarray[0] + 'Node1.png">' + OTarray[1] + '<span>' + OTarray[14][langNum] + '</span></span>', layer: Node1},
                {label: OTarray[0] + 'Node2.png">' + OTarray[1] + '<span>' + OTarray[15][langNum] + '</span></span>', layer: Node2},
                {label: OTarray[0] + 'Node3.png">' + OTarray[1] + '<span>' + OTarray[16][langNum] + '</span></span>', layer: Node3},
                {label: OTarray[0] + 'Node4.png">' + OTarray[1] + '<span>' + OTarray[17][langNum] + '</span></span>', layer: Node4},
                {label: OTarray[0] + 'Island.png">' + OTarray[1] + '<span>' + OTarray[18][langNum] + '<i style="margin-left:7px; color:#c3c3c3;">(' + OTarray[19][langNum] + ')</i></span></span>', layer: Island},
            ]},
            {label: '<div class="leaflet-control-layers-separator"></div>'},


            {label: '<b>' + OTarray[20][langNum] + '</b><span id="MarkertooltipIcon">?<div class="MarkertooltipText"' + OTarray[5][langNum] + '</div></span>', selectAllCheckbox: true, children: [
                {label: OTarray[0] + 'IconFreshwater.png">' + OTarray[1] + '<span>' + OTarray[21][langNum] + '</span></span><span id="MarkertooltipIcon">?<div class="MarkertooltipText"' + OTarray[6][langNum] + '</div></span>', layer: Freshwater},
                {label: OTarray[0] + 'IconSaltwater.png">' + OTarray[1] + '<span>' + OTarray[22][langNum] + '</span></span><span id="MarkertooltipIcon">?<div class="MarkertooltipText"' + OTarray[7][langNum] + '</div></div></span>', layer: Saltwater},    
            ]},
            {label: '<div class="leaflet-control-layers-separator"></div>'},


            {label: '<b>' + OTarray[23][langNum] + '</b><span id="MarkertooltipIcon">?<div class="MarkertooltipText"' + OTarray[8][langNum] + '<br>' +                           
            '<table style="display:inline-block;">'+
                '<thead>'+
                    '<tr>'+
                    '<th><img class="seagullspot" src="icons/seagull/seagull1.png"></th>' +
                        OTarray[2] + 'src="icons/seagull/Coelacanth.png">' + OTarray[3] + SeagullFishList[0][langNum] + '</span></div></th>' +
                    '</tr>'+
                '</thead>'+
                '<tbody>'+
                    '<tr>'+
                    '<td rowspan="3" style="background-color:black;"><img class="seagullspot" src="icons/seagull/seagull2.png"></td>'+
                        OTarray[2] + 'src="icons/seagull/Grunt.png">' + OTarray[3] + SeagullFishList[1][langNum] + '</span></div></td>'+
                    '</tr>'+
                    '<tr>'+
                        OTarray[2] + 'src="icons/seagull/Tuna.png">' + OTarray[3] + SeagullFishList[2][langNum] + '</span></div></td>'+
                    '</tr>'+
                    '<tr>'+
                        OTarray[2] + 'src="icons/seagull/GiantOctopus.png">' + OTarray[3] + SeagullFishList[3][langNum] + '</span></div></td>'+
                    '</tr>'+
                    '<tr>'+
                    '<td rowspan="3" style="background-color:black;"><img class="seagullspot" src="icons/seagull/seagull3.png"></td>'+
                        OTarray[2] + 'src="icons/seagull/SpottedSeaBass.png">' + OTarray[3] + SeagullFishList[4][langNum] + '</span></div></td>'+
                    '</tr>'+
                    '<tr>'+
                        OTarray[2] + 'src="icons/seagull/Tilefish.png">' + OTarray[3] + SeagullFishList[5][langNum] + '</span></div></td>'+
                    '</tr>'+
                    '<tr>'+
                        OTarray[2] + 'src="icons/seagull/BlueGrouper.png">' + OTarray[3] + SeagullFishList[6][langNum] + '</span></div></td>'+
                    '</tr>'+
                    '<tr>'+
                    '<td rowspan="3" style="background-color:black;"><img class="seagullspot" src="icons/seagull/seagull4.png"></td>'+
                        OTarray[2] + 'src="icons/seagull/Porgy.png">' + OTarray[3] + SeagullFishList[7][langNum] + '</span></div></td>'+
                    '</tr>'+
                    '<tr>'+
                        OTarray[2] + 'src="icons/seagull/BlackPorgy.png">' + OTarray[3] + SeagullFishList[8][langNum] + '</span></div></td>'+
                    '</tr>'+
                    '<tr>'+
                        OTarray[2] + 'src="icons/seagull/SmokeyChromis.png">' + OTarray[3] + SeagullFishList[9][langNum] + '</span></div></td>'+
                    '</tr>'+
                    '<tr>'+
                    '<td rowspan="2" style="background-color:black;"><img class="seagullspot" src="icons/seagull/seagull5.png"></td>'+
                        OTarray[2] + 'src="icons/seagull/SeaBass.png">' + OTarray[3] + SeagullFishList[10][langNum] + '</span></div></td>'+
                    '</tr>'+
                    '<tr>'+
                        OTarray[2] + 'src="icons/seagull/Nibbler.png">' + OTarray[3] + SeagullFishList[11][langNum] + '</span></div></td>'+
                    '</tr>'+
                    '<tr>'+
                        '<td><img class="seagullspot" src="icons/seagull/seagull6.png"></td>' +
                        OTarray[2] + 'src="icons/seagull/EyespotPuffer.png">' + OTarray[3] + SeagullFishList[12][langNum] + '</span></div></td>' +
                    '</tr>'+
                '</tbody>'+
            '</table><br>' + OTarray[9][langNum] + '</div></div></span>', selectAllCheckbox: true, children: [
                {label: OTarray[0] + 'seagull/Coelacanth.png">' + OTarray[1] + '<span>' + SeagullFishList[0][langNum] + '</span></span>', layer: Coelacanth},
                
                {label: '<b>' + OTarray[24][langNum] + '</b>', selectAllCheckbox: true, children: [
                    {label: OTarray[0] + 'seagull/Grunt.png">' + OTarray[1] + '<span>' + SeagullFishList[1][langNum] + '</span></span>', layer: Grunt},
                    {label: OTarray[0] + 'seagull/BlackPorgy.png">' + OTarray[1] + '<span>' + SeagullFishList[8][langNum] + '</span></span>', layer: BlackPorgy},
                    {label: OTarray[0] + 'seagull/Tuna.png">' + OTarray[1] + '<span>' + SeagullFishList[2][langNum] + '</span></span>', layer: Tuna},
                    {label: OTarray[0] + 'seagull/SpottedSeaBass.png">' + OTarray[1] + '<span>' + SeagullFishList[4][langNum] + '</span></span>', layer: SpottedSeaBass},
                ]},
                
                {label: '<b>' + OTarray[25][langNum] + '</b>', selectAllCheckbox: true, children: [
                    {label: OTarray[0] + 'seagull/Porgy.png">' + OTarray[1] + '<span>' + SeagullFishList[7][langNum] + '</span></span>', layer: Porgy},
                    {label: OTarray[0] + 'seagull/SmokeyChromis.png">' + OTarray[1] + '<span>' + SeagullFishList[9][langNum] + '</span></span>', layer: SmokeyChromis},
                    {label: OTarray[0] + 'seagull/SeaBass.png">' + OTarray[1] + '<span>' + SeagullFishList[10][langNum] + '</span></span>', layer: SeaBass},
                    {label: OTarray[0] + 'seagull/EyespotPuffer.png">' + OTarray[1] + '<span>' + SeagullFishList[12][langNum] + '</span></span>', layer: EyespotPuffer},
                ]},

                {label: '<b>' + OTarray[26][langNum] + '</b>', selectAllCheckbox: true, children: [
                    {label: OTarray[0] + 'seagull/Tilefish.png">' + OTarray[1] + '<span>' + SeagullFishList[5][langNum] + '</span></span>', layer: Tilefish},
                    {label: OTarray[0] + 'seagull/BlueGrouper.png">' + OTarray[1] + '<span>' + SeagullFishList[6][langNum] + '</span></span>', layer: BlueGrouper},
                    {label: OTarray[0] + 'seagull/GiantOctopus.png">' + OTarray[1] + '<span>' + SeagullFishList[3][langNum] + '</span></span>', layer: GiantOctopus},
                    {label: OTarray[0] + 'seagull/Nibbler.png">' + OTarray[1] + '<span>' + SeagullFishList[11][langNum] + '</span></span>', layer: Nibbler},
                ]},

            ]},
            {label: '<div class="leaflet-control-layers-separator"></div>'},
        

            {label: '<b>Npc</b>', selectAllCheckbox: true, children: [
                {label: OTarray[0] + 'Barterer.png">' + OTarray[1] + '<span>' + OTarray[27][langNum] + '</span></span>', layer: Barterer},
                {label: OTarray[0] + 'BartererOcean.png">' + OTarray[1] + '<span>' + OTarray[28][langNum] + '</span></span><span id="MarkertooltipIcon">?<div class="MarkertooltipText"' + OTarray[10][langNum] + '</div></span>', layer: BartererOcean},
                {label: OTarray[0] + 'Harbor.png">' + OTarray[1] + '<span>' + OTarray[29][langNum] + '</span></span>', layer: Harbor},
                {label: OTarray[0] + 'ImperialFishingDelivery.png">' + OTarray[1] + '<span>' + OTarray[30][langNum] + '</span></span>', layer: ImperialFishingDelivery},
                {label: OTarray[0] + 'TradeManager.png">' + OTarray[1] + '<span>' + OTarray[31][langNum] + '</span></span>', layer: TradeManager},
                ]},
            {label: '<div class="leaflet-control-layers-separator"></div>'},

        
            {label: '<b>' + OTarray[32][langNum] + '</b>', selectAllCheckbox: true, children: [
                {label: OTarray[0] + 'SeaMonster.png">' + OTarray[1] + '<span>' + OTarray[33][langNum] + '</span></span>', layer: SeaMonster},
                {label: OTarray[0] + 'IconCoxPiratesShadowGhost.png">' + OTarray[1] + '<span>' + OTarray[34][langNum] + '</span></span>', layer: CoxPiratesShadowGhost},
                {label: OTarray[0] + 'CargoShip.png">' + OTarray[1] + '<span>' + OTarray[35][langNum] + '</span></span>', layer: CargoShip},
                {label: OTarray[0] + 'DrunkSniper.png">' + OTarray[1] + '<span>' + OTarray[36][langNum] + '</span></span>', layer: DrunkSniper},
                {label: OTarray[0] + 'PirateFlag.png">' + OTarray[1] + '<span>' + OTarray[37][langNum] + '</span></span>', layer: PirateFlag},
                ]},
            {label: '<div class="leaflet-control-layers-separator"></div>'},
        ]
    };




    var options = {
        namedToggle: true,
        selectorBack: false,
        collapsed: false,
    };  

    var sidebar = L.control.sidebar('sidebar').addTo(map);
    var layerControl = L.control.layers.tree(null, overlaysTree, options).addTo(map).collapseTree().expandSelected().collapseTree(false);
    var htmlObject = layerControl.getContainer();
    var a = document.getElementById('marker');
    function setParent(el, newParent) {
    newParent.appendChild(el);
    }
    setParent(htmlObject, a);

//-------------      MarkerList remove box-shadow      -------------//
    document.querySelector("#marker > div.leaflet-control-layers.leaflet-control-layers-expanded.leaflet-control").classList.remove('leaflet-control-layers');
    

//---------------------------  Zoom  --------------------------------//
    var NodeZoomMarker = [City, Town, Node1, Node2, Node3, Node4];
    var NodeZoomMarkerArray = ['City', 'Town', 'Node1', 'Node2', 'Node3', 'Node4'];
    var SeaMonsterBartererOceanMarker = [BartererOcean, Vell, YoungSeaMonster, Hekaru, OceanStalker, Nineshark, Candidum, BlackRust, SaltwaterCrocodile, BlackRust2, GoldmontPirate, Lekrashan];
    var SeaMonsterBartererOceanMarkerArray = ['BartererOcean', 'Vell', 'YoungSeaMonster', 'Hekaru', 'OceanStalker', 'Nineshark', 'Candidum', 'BlackRust', 'SaltwaterCrocodile', 'BlackRust2', 'GoldmontPirate', 'Lekrashan'];
    var NodeZoom = 1234;
    var SeaMonsterZoom = 1234;

//-------------- Node 'marker icon and tooltip' --------------//
    if (NodeZoom == 1234 && map.getZoom() <= 4) {
        for(i = 0; i < NodeZoomMarker.length; i++)
        {
            NodeZoomMarker[i].eachLayer(function (layer) {
            layer.setIcon(eval('Icon' + NodeZoomMarkerArray[i] + 'Small')).closeTooltip();
            });
        }
        IslandYShape.eachLayer(function (layer) {
            layer.setIcon(IconNode1Small).closeTooltip();
        });
        IslandCircle.eachLayer(function (layer) {
            layer.setIcon(IconNode2Small).closeTooltip();
        });

        NodeZoom = 567;
    }
    else if (NodeZoom == 567 && map.getZoom() >= 5) {
        for(i = 0; i < NodeZoomMarker.length; i++)
        {
            NodeZoomMarker[i].eachLayer(function (layer) {
            layer.setIcon(eval('Icon' + NodeZoomMarkerArray[i])).openTooltip();
            });
        }
        IslandYShape.eachLayer(function (layer) {
            layer.setIcon(IconNode1).openTooltip();
        });
        IslandCircle.eachLayer(function (layer) {
            layer.setIcon(IconNode2).openTooltip();
        });

        NodeZoom = 1234;
    }
        
//-------------- Sea Monster, Barterer Ocean 'tooltip' --------------//
    if (map.getZoom() <= 2){ 
        for(i = 0; i < SeaMonsterBartererOceanMarker.length; i++)
        {
            SeaMonsterBartererOceanMarker[i].eachLayer(function (layer) {
            layer.closeTooltip();
            });
        }
    }
    else {
        for(i = 0; i < SeaMonsterBartererOceanMarker.length; i++)
        {
            SeaMonsterBartererOceanMarker[i].eachLayer(function (layer) {
            layer.openTooltip();
            });
        }
    }

//-------------- Sea Monster 'marker icon', except Barterer Ocean --------------//
    if (SeaMonsterZoom == 1234 && map.getZoom() <= 4){     
        
        for(i = 1; i < SeaMonsterBartererOceanMarker.length; i++)
        {
            SeaMonsterBartererOceanMarker[i].eachLayer(function (layer) {
            layer.setIcon(eval('Icon' + SeaMonsterBartererOceanMarkerArray[i] + 'Small'));
            });
        }
        SeaMonsterZoom = 567;
    }
    else if (SeaMonsterZoom == 567 && map.getZoom() >= 5) {

        for(i = 0; i < SeaMonsterBartererOceanMarker.length; i++)
        {
            SeaMonsterBartererOceanMarker[i].eachLayer(function (layer) {
            layer.setIcon(eval('Icon' + SeaMonsterBartererOceanMarkerArray[i]));
            });
        }
        SeaMonsterZoom = 1234;
    }


//-------------- Zoom End --------------//
    map.on('zoomend', ZoomMarker);
    function ZoomMarker(){            
        //-------------- Node 'marker icon and tooltip' --------------//
        if (NodeZoom == 1234 && map.getZoom() <= 4) {
            for(i = 0; i < NodeZoomMarker.length; i++)
            {
                NodeZoomMarker[i].eachLayer(function (layer) {
                layer.setIcon(eval('Icon' + NodeZoomMarkerArray[i] + 'Small')).closeTooltip();
                });
            }
            IslandYShape.eachLayer(function (layer) {
                layer.setIcon(IconNode1Small).closeTooltip();
            });
            IslandCircle.eachLayer(function (layer) {
                layer.setIcon(IconNode2Small).closeTooltip();
            });

            NodeZoom = 567;
        }
        else if (NodeZoom == 567 && map.getZoom() >= 5) {
            for(i = 0; i < NodeZoomMarker.length; i++)
            {
                NodeZoomMarker[i].eachLayer(function (layer) {
                layer.setIcon(eval('Icon' + NodeZoomMarkerArray[i])).openTooltip();
                });
            }
            IslandYShape.eachLayer(function (layer) {
                layer.setIcon(IconNode1).openTooltip();
            });
            IslandCircle.eachLayer(function (layer) {
                layer.setIcon(IconNode2).openTooltip();
            });

            NodeZoom = 1234;
        }
        //-------------- Sea Monster, Barterer Ocean 'tooltip' --------------//
        if (map.getZoom() <= 2){ 
            for(i = 0; i < SeaMonsterBartererOceanMarker.length; i++)
            {
                SeaMonsterBartererOceanMarker[i].eachLayer(function (layer) {
                layer.closeTooltip();
                });
            }
        }
        else {
            for(i = 0; i < SeaMonsterBartererOceanMarker.length; i++)
            {
                SeaMonsterBartererOceanMarker[i].eachLayer(function (layer) {
                layer.openTooltip();
                });
            }
        }
        //-------------- Sea Monster 'marker' --------------//
        if (SeaMonsterZoom == 1234 && map.getZoom() <= 4){     
            
            for(i = 1; i < SeaMonsterBartererOceanMarker.length; i++) // start with 1 (for avoid BartererOcean)
            {
                SeaMonsterBartererOceanMarker[i].eachLayer(function (layer) {
                layer.setIcon(eval('Icon' + SeaMonsterBartererOceanMarkerArray[i] + 'Small')).closeTooltip().openTooltip();
                });
            }
            SeaMonsterZoom = 567;
        }
        else if (SeaMonsterZoom == 567 && map.getZoom() >= 5) {

            for(i = 0; i < SeaMonsterBartererOceanMarker.length; i++)
            {
                SeaMonsterBartererOceanMarker[i].eachLayer(function (layer) {
                layer.setIcon(eval('Icon' + SeaMonsterBartererOceanMarkerArray[i])).closeTooltip().openTooltip();
                });
            }
            SeaMonsterZoom = 1234;
        }
    }


//---------------------------- Polygon Data -------------------------------//
    fishdisplayInfo.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'fishDisplay');
    var divInfo = document.querySelector("#map > div.leaflet-control-container > div.leaflet-top.leaflet-right");
    divInfo.classList.remove('leaflet-right');
    divInfo.classList.remove('leaflet-left');
    divInfo.classList.remove('leaflet-top');
    this.update();
    return this._div;
    };

    fishdisplayInfo.update = function (p) {
        var infoData = '';
        var DisplayFish = '';
        if(langNum == 2){
            infoData = "<p class='displayMargin'><img class='fishingTool' src='icons/fishingrod.png' title='Fishing Rod'>";
            if(p) {
                for(i=0;i<p.fishGroup.length;i++)
                {
                    pixelTwentyFive = (spriteSort.indexOf(p.fishGroup[i]))*-25;
    
                    if(p.fishGroup[i]=="harpoon")
                    {
                        infoData += "<br><img class='fishingTool' src='icons/harpoon.png' title='Harpoon'>";
                    }
                    else
                    {
                        var findFishData = fishJson.findIndex(search => search === fishJson.find(search => search.file === p.fishGroup[i]));
                        if(fishJson[findFishData].grade == "#E5E5E5"){
                            gradeColor = "black";
                        }
                        else{
                            gradeColor = fishJson[findFishData].grade;
                        }
                        DisplayFish = "<span class=\"fishDisplayIcon\" style='border: 1px solid " + gradeColor + "'><span class=\"spriteCSS\" style=\"background-position: 0px " + pixelTwentyFive + "px; width:25px; height:25px; display: block;\"' onclick=\"clickSearch('" + fishJson[findFishData].name_EN + "')\" title='" + fishJson[findFishData].name_EN + "'></span></span>";
                        infoData += DisplayFish;
                    }
                }
                infoData += "</p>";
            }
            this._div.innerHTML = p ? '<div class="displayText">' + p.name_EN + '</div>' + infoData : ''; 
        }
        else if(langNum == 3){
            infoData = "<p class='displayMargin'><img class='fishingTool' src='icons/fishingrod.png' title='낚싯대'>";
            if(p) {
                for(i=0;i<p.fishGroup.length;i++)
                {
                    pixelTwentyFive = (spriteSort.indexOf(p.fishGroup[i]))*-25;
    
                    if(p.fishGroup[i]=="harpoon")
                    {
                        infoData += "<br><img class='fishingTool' src='icons/harpoon.png' title='작살'>";
                    }
                    else
                    {
                        var findFishData = fishJson.findIndex(search => search === fishJson.find(search => search.file === p.fishGroup[i]));
                        if(fishJson[findFishData].grade == "#E5E5E5"){
                            gradeColor = "black";
                        }
                        else{
                            gradeColor = fishJson[findFishData].grade;
                        }
                        DisplayFish = "<span class=\"fishDisplayIcon\" style='border: 1px solid " + gradeColor + "'><span class=\"spriteCSS\" style=\"background-position: 0px " + pixelTwentyFive + "px; width:25px; height:25px; display: block;\"' onclick=\"clickSearch('" + fishJson[findFishData].name_KR + "')\" title='" + fishJson[findFishData].name_KR + "'></span></span>";
                        infoData += DisplayFish;
                    }
                }
                infoData += "</p>";
            }
            this._div.innerHTML = p ? '<div class="displayText">' + p.name_KR + '</div>' + infoData : ''; 
        }
    };
    fishdisplayInfo.addTo(map);



//-------------------------------------------------------------//
//------------------      Leaflet.Draw      -------------------//
//-------------------------------------------------------------//
L.drawLocal.draw.toolbar.buttons.polyline = '';
L.drawLocal.draw.toolbar.buttons.polygon = '';
L.drawLocal.draw.toolbar.buttons.rectangle = '';
L.drawLocal.draw.toolbar.buttons.circle = '';
L.drawLocal.draw.toolbar.buttons.marker = '';
L.drawLocal.draw.toolbar.buttons.circlemarker = '';
L.drawLocal.edit.toolbar.buttons.edit = '';
L.drawLocal.edit.toolbar.buttons.remove = '';

    var editableLayers = new L.FeatureGroup();
    map.addLayer(editableLayers);

    var MyCustomMarker = L.Icon.extend({
    options: {
    iconUrl: 'icons/marker.png',
    iconSize: new L.Point(32, 48),
    iconAnchor: new L.Point(16, 48),
    popupAnchor: new L.Point(0, -48),

    shadowUrl: 'icons/marker-shadow.png',
    shadowSize: new L.Point(40, 15),
    shadowAnchor: new L.Point(12, 15),
    }
    });


    var options = {
    position: 'topleft',
    draw: {
    polyline: {
        shapeOptions: {
            color: '#FF0051',
            //weight: 10
        },
        showLength: false
    },
    polygon: {
        allowIntersection: false, // Restricts shapes to simple polygons
        drawError: {
            color: '#e1e100', // Color the shape will turn when intersects
            message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
        },
        shapeOptions: {
            color: '#000000'
        },
        showArea: false,
        showLength: false,
    },
    circle: {
        shapeOptions: {
            clickable: false,
            color: '#FFBD10'
        },
        showRadius: false,
    }, // Turns off this drawing tool
    rectangle: {
        shapeOptions: {
            clickable: false,
            color: '#1AB1FF'
        },
        showArea: false,
    },
    marker: {
        icon: new MyCustomMarker()
    },
    circlemarker : {
        clickable: false,
        color: '#000000'
    }
    },
    edit: {
    featureGroup: editableLayers, //REQUIRED!!
    remove: true
    }
    };
    var drawControl = new L.Control.Draw(options);
    map.addControl(drawControl);
    map.on(L.Draw.Event.CREATED, function (e) {
    var type = e.layerType,
        layer = e.layer;
    editableLayers.addLayer(layer);  // .bringToBack()
    });


    function advancedMode() {
    alert('Advanced Mode : New marker and polygon will show LatLng!');
    //---------- Marker Latlng ----------//
    map.on(L.Draw.Event.CREATED, function (e) {
    var type = e.layerType,
        layer = e.layer;

    if (type === 'marker') {
        var markerLatLng = layer.getLatLng();
        markerLatLng = '[' + [markerLatLng.lat.toFixed(2) + ', ' + markerLatLng.lng.toFixed(2) + ']'];
        markerLatLng.toString();
        layer.bindPopup(markerLatLng);
    }
    map.addLayer(layer);
    });

    //---------- Polygon Latlng ----------//
    options.draw.polygon.shapeOptions.color = '#f78c00';
    var drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    map.on('draw:created', function (e) {
    var type = e.layerType,
        layer = e.layer;
    if (type === 'polygon') {
        layer.on('click', function() {
            var polygonLatLng = layer.getLatLngs();
            var polygonLatLngChange = '';

            for(i = 0; i < polygonLatLng[0].length; i++){
                polygonLatLngChange += '[' + polygonLatLng[0][i].lng.toFixed(2).toString() + ', ' + polygonLatLng[0][i].lat.toFixed(2).toString() + '],'; // for geojson, (lng,lat)
            }
            polygonLatLngChange = polygonLatLngChange.substr(0, polygonLatLngChange.length -1);

            layer.bindPopup(polygonLatLngChange);
            layer.openPopup();  
        });
    }
    drawnItems.addLayer(layer);
    });

    //--------------------- Draggable Marker ---------------------//
    var DraggableMarkerIcon = L.icon({
    iconUrl: 'icons/marker2.png',
    iconSize: new L.Point(32, 48),
    iconAnchor: new L.Point(16, 48),
    popupAnchor: new L.Point(0, -48),

    shadowUrl: 'icons/marker-shadow.png',
    shadowSize: new L.Point(40, 15),
    shadowAnchor: new L.Point(12, 15),
    });

    var DraggableMarker = L.marker([-5, 5], {draggable: true, icon: DraggableMarkerIcon}).bindPopup('Move the marker').addTo(map);
    DraggableMarker.openPopup();
    DraggableMarker.on('dragend', function(e)
    {
        var DraggableMarkerText = DraggableMarker.getLatLng();
        DraggableMarkerText = '[' + [DraggableMarkerText.lat.toFixed(2) + ', ' + DraggableMarkerText.lng.toFixed(2) + ']'];
        DraggableMarkerText.toString();
        DraggableMarker.bindPopup(DraggableMarkerText).addTo(map).openPopup();
    });
    }



//--------------------------------------------------------------------//
//-----------------------  Fish List Control  ------------------------//
//--------------------------------------------------------------------//

    //-------- Checkbox Filter --------//
    var filterChecked = "";
    $(function() {
    $('.user-filter').click(function() {
        $(".trclass").each(function(){
            $(this).hide();/// reset
        });
        
        filterChecked = "";
    $('.user-filter').each(function() 
        { 
        if(this.checked == true)
        {
                filterChecked += $(this).data("filter") + " ";
        }
        });
        $(document.getElementsByClassName(filterChecked)).show();        
        if(filterChecked == "")
        {
            $(".trclass").each(function(){
                $(this).show();
            });
        }
    });
    });


    //------- Reset Filter Button ------//
    var inputText = "";
    function resetFilter(){
    $("input.user-filter:checkbox").each(function() 
    { 
        this.checked = false;
        $(".trclass").each(function(){
            $(this).show();
        });
    });
    $('table').trigger('sortReset');
    $('#keyword').val('');
    }


    //---------- Search Textbox ------------//
    $("#keyword").on("keyup", function() {
    var val = $(this).val();
    if (val) {
        $(".trclass").hide();
        $(".trclass:contains(" + val + ")").show();
    } else {
        $(".trclass").show();
    }
    });

    jQuery.expr[':'].contains = function(a, i, m) {
    return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
    };


    //---------- Web Browser Hide ------------//
    $('.WebBrowser').animate({opacity: '0'}, 7000, function() {$(this).hide();});
