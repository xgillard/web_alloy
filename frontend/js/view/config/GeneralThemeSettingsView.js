/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Xavier Gillard
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */


/**
 * This view defines the content that is shown when user decides to update the visual 
 * settings (general settings) used to render the graph.
 */
define(
 [
 'jquery', 
 'util/_',
 'model/config/Layouts', 
 'model/config/Orientation', 
 'model/config/Palettes',
 'model/config/Fonts'
 ],
 function($, _, layout, orientation, palette, font){
    /** constructs a new instance using the shared application context */
    function GeneralThemeSettingsView(app){
        this.app               = app;
        this.layout            = mkLayout();
        this.orientation       = mkOrientation();
        this.node_palette      = mkColorPalette();
        this.edge_palette      = mkColorPalette();
        this.font              = mkFont();
        this.alphabetical      = mkCheckbox(false);
        this.hide_private_sigs = mkCheckbox(true);
        this.hide_private_rels = mkCheckbox(true);
        this.group_atoms_by_sig= mkCheckbox(true);
        this.show_skolem_const = mkCheckbox(false);
        this.apply_btn         = mkApplyButton("Apply");
        this.tag               = mkTag(this);
        
        
        $(this.apply_btn)[0].onclick = _.partial(fireChanged, this);
        $(app).on("changed:theme",    _.partial(set_values, this));
        
        set_values(this);
    };
    /** 
     * Returns the configuration as the user has chosen to edit it. 
     * NOTE: this has - per se - no impact on the real configuration that is stored in the application context.
     * @returns the configuration as the user has chosen to edit it. 
     */
    GeneralThemeSettingsView.prototype.val = function(){
        return {
            layout              : this.layout.val(),
            orientation_name    : this.orientation.val(),
            node_palette_name   : this.node_palette.val(),
            edge_palette_name   : this.edge_palette.val(),
            font_name           : this.font.val(),
            force_alphabetical  : this.alphabetical.prop("checked"),
            hide_private_sigs   : this.hide_private_sigs.prop("checked"),
            hide_private_rels   : this.hide_private_rels.prop("checked"),
            group_atoms_by_sig  : this.group_atoms_by_sig.prop("checked"),
            show_skolem_const   : this.show_skolem_const.prop("checked")
        };
    };
    /**
     * Updates the values that are displayed on screen
     * @param {GeneralThemeSettingsView} self - this instance (used to make this method private)
     */
    function set_values(self){
        self.layout.val(self.app.theme.layout);
        self.orientation.val(self.app.theme.orientation_name);
        self.node_palette.val(self.app.theme.node_palette_name);
        self.edge_palette.val(self.app.theme.edge_palette_name);
        self.font.val(self.app.theme.font_name);
        
        self.alphabetical.prop("checked", self.app.theme.force_alphabetical);
        self.hide_private_sigs.prop("checked", self.app.theme.hide_private_sigs);
        self.hide_private_rels.prop("checked", self.app.theme.hide_private_rels);
        self.show_skolem_const.prop("checked", self.app.theme.show_skolem_const);
        self.group_atoms_by_sig.prop("checked", self.app.theme.group_atoms_by_sig);
    };
    /**
     * Tells to whoever listens to it that the user has decided to apply some changes.
     * @param {GeneralThemeSettingsView} self - this instance (used to make this method private)
     */
    function fireChanged(self){
        $(self).trigger("changed", self.val());
    };
    
    /** makes a dropdown box initialized with all the possible layout options */
    function mkLayout(){
        var select = $("<select></select>");
        _.each(layout, function(l){
            select.append("<option value='"+l+"'>"+l+"</option>");
        });
        return select;
    };
    /** makes a dropdown box initialized with all the possible orientation options */
    function mkOrientation(){
        var select = $("<select></select>");
        _.each(_.keys(orientation), function(k){
            select.append("<option value='"+k+"'>"+k+"</option>");
        });
        return select;
    };
    /** makes a dropdown box intialized with all possible color palette options */
    function mkColorPalette(){
        var select = $("<select></select>");
        _.each(_.keys(palette), function(k){
            select.append("<option value='"+k+"'>"+k+"</option>");
        });
        return select;
    };
    /** creates a dropdown box initialized with all the accepted fonts */
    function mkFont(){
        var select = $("<select></select>");
        _.each(_.keys(font), function(k){
            select.append("<option value='"+k+"'>"+k+"</option>");
        });
        return select;
    };
    /** creates a new checkbox that is checked or not according to the value of 'initial' */
    function mkCheckbox(initial){
        return $("<input type='checkbox' />").prop('checked', initial);
    };
    /** creates the apply button whose text is given as parameter */
    function mkApplyButton(text){
        return $("<button type='button' class='fill btn btn-sm btn-primary'>"+text+"</button>");
    };
    /**
     * This function creates the HTML structure used to display this widget on screen
     */
    function mkTag(self){
        var $html = $('<table class="small" width="310px">'+
        '<tr><td width="65%">Layout     </td><td data-name="layout"       class="fill"></td></tr>' +
        '<tr><td>Orientation</td><td data-name="orientation"  class="fill"></td></tr>' +
        '<tr><td>Magic Layout Node Colors</td><td data-name="node_palette" class="fill"></td></tr>' +
        '<tr><td>Magic Layout Edge Colors</td><td data-name="edge_palette" class="fill"></td></tr>' +
        '<tr><td>Font       </td><td data-name="font"         class="fill"></td></tr>' +
        '<tr><td>Nodes in alphabetical order</td>'                                     +
        '    <td data-name="alphabetical" class="fill"></td>'                          +
        '</tr>'                                                                        +
        '<tr><td>Hide private sigs</td>'                                          +
        '    <td data-name="private_sigs" class="fill"></td>'                          +
        '</tr>'                                                                        +
        '<tr><td>Hide private rel</td><td data-name="private_rels" class="fill"></td></tr>' +
        '<tr><td>Show Skolem constants</td><td data-name="skolems" class="fill"></td></tr>' +
        '<tr><td>Group atoms by signature</td><td data-name="group_by_sig" class="fill"></td></tr>'+
        '<tr><td></td><td data-name="apply" style="padding-top: 1em"></td></tr>'+
        '</table>');

        $html.find("[data-name='layout']").append(self.layout);
        $html.find("[data-name='orientation']").append(self.orientation);
        $html.find("[data-name='node_palette']").append(self.node_palette);
        $html.find("[data-name='edge_palette']").append(self.edge_palette);
        $html.find("[data-name='font']").append(self.font);
        $html.find("[data-name='alphabetical']").append(self.alphabetical);
        $html.find("[data-name='private_sigs']").append(self.hide_private_sigs);
        $html.find("[data-name='private_rels']").append(self.hide_private_rels);
        $html.find("[data-name='skolems']").append(self.show_skolem_const);
        $html.find("[data-name='group_by_sig']").append(self.group_atoms_by_sig);
        $html.find("[data-name='apply']").append(self.apply_btn);
        
        return $html;
    };
    
    return GeneralThemeSettingsView;
});