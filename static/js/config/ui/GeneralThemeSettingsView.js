define(
 [
 'jquery', 'util/_',
 'config/Layouts', 'config/Orientation', 'config/Palettes',
 'config/Fonts'
 ],
 function($, _, layout, orientation, palette, font){
 
    function GeneralThemeSettingsView(theme){
        this.theme             = theme;
        this.layout            = mkLayout();
        this.orientation       = mkOrientation();
        this.node_palette      = mkColorPalette();
        this.edge_palette      = mkColorPalette();
        this.font              = mkFont();
        this.alphabetical      = mkCheckbox(false);
        this.hide_private_sigs = mkCheckbox(true);
        this.hide_private_rels = mkCheckbox(true);
        this.automatic_shape   = mkCheckbox(false);
        this.automatic_color   = mkCheckbox(false);
        this.show_skolem_const = mkCheckbox(false);
        this.apply_btn         = mkApplyButton("Apply");
        this.tag               = mkTag(this);
        
        $(this.apply_btn).on("click", _.partial(commit, this));
        $(theme).on("changed", _.partial(set_values, this));
        set_values(this);
    };
    
    function set_values(self){
        self.layout.val(self.theme.layout);
        self.orientation.val(self.theme.orientation_name);
        self.node_palette.val(self.theme.node_palette_name);
        self.edge_palette.val(self.theme.edge_palette_name);
        self.font.val(self.theme.font_name);
        
        self.alphabetical.prop("checked", self.theme.force_alphabetical);
        self.hide_private_sigs.prop("checked", self.theme.hide_private_sigs);
        self.hide_private_rels.prop("checked", self.theme.hide_private_rels);
        self.show_skolem_const.prop("checked", self.theme.show_skolem_const);
        self.automatic_shape.prop("checked", self.theme.automatic_shapes);
        self.automatic_color.prop("checked", self.theme.automatic_colors);
    };
    
    function commit(self){
        self.theme.layout = self.layout.val();
        self.theme.orientation_name = self.orientation.val();
        self.theme.node_palette_name = self.node_palette.val();
        self.theme.edge_palette_name = self.edge_palette.val();
        self.theme.font_name = self.font.val();
        self.theme.force_alphabetical = self.alphabetical.prop("checked");
        self.theme.hide_private_sigs = self.hide_private_sigs.prop("checked");
        self.theme.hide_private_rels = self.hide_private_rels.prop("checked");
        self.theme.automatic_shapes = self.automatic_shape.prop("checked");
        self.theme.automatic_colors = self.automatic_color.prop("checked");
        self.theme.show_skolem_const= self.show_skolem_const.prop("checked");
        
        $(self).trigger("done");
        self.theme.setChanged();
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
        '<tr><td>Node Colors</td><td data-name="node_palette" class="fill"></td></tr>' +
        '<tr><td>Edge Colors</td><td data-name="edge_palette" class="fill"></td></tr>' +
        '<tr><td>Font       </td><td data-name="font"         class="fill"></td></tr>' +
        '<tr><td>Nodes in alphabetical order</td>'                                     +
        '    <td data-name="alphabetical" class="fill"></td>'                          +
        '</tr>'                                                                        +
        '<tr><td>Show/Hide private sigs</td>'                                          +
        '    <td data-name="private_sigs" class="fill"></td>'                          +
        '</tr>'                                                                        +
        '<tr><td>Show/Hide private rel</td><td data-name="private_rels" class="fill"></td></tr>' +
        '<tr><td>Show Skolem constants</td><td data-name="skolems" class="fill"></td></tr>' +
        '<tr><td>Automatically choose shape</td><td data-name="auto_shape" class="fill"></td></tr>'+
        '<tr><td>Automatically choose color</td><td data-name="auto_color" class="fill"></td></tr>'+
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
        $html.find("[data-name='auto_shape']").append(self.automatic_shape);
        $html.find("[data-name='auto_color']").append(self.automatic_color);
        $html.find("[data-name='apply']").append(self.apply_btn);
        
        return $html;
    };
    
    return GeneralThemeSettingsView;
});