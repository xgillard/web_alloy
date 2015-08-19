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
    
    function fireChanged(self){
        $(self).trigger("changed", self.val());
    };
    
    function mkLayout(){
        var select = $("<select></select>");
        _.each(layout, function(l){
            select.append("<option value='"+l+"'>"+l+"</option>");
        });
        return select;
    };
    
    function mkOrientation(){
        var select = $("<select></select>");
        _.each(_.keys(orientation), function(k){
            select.append("<option value='"+k+"'>"+k+"</option>");
        });
        return select;
    };
    
    function mkColorPalette(){
        var select = $("<select></select>");
        _.each(_.keys(palette), function(k){
            select.append("<option value='"+k+"'>"+k+"</option>");
        });
        return select;
    };
    
    function mkFont(){
        var select = $("<select></select>");
        _.each(_.keys(font), function(k){
            select.append("<option value='"+k+"'>"+k+"</option>");
        });
        return select;
    };
    
    function mkCheckbox(initial){
        return $("<input type='checkbox' />").prop('checked', initial);
    };
    
    function mkApplyButton(text){
        return $("<button type='button' class='fill btn btn-sm btn-primary'>"+text+"</button>");
    };
    
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