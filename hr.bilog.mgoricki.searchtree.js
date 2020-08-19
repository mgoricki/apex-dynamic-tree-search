$(function() {
    $.widget("custom.dynamicTreeSearch", {
      options:{
        treeRegion:null,
        delay:200,
        ajaxId:null,
        filterOnLoad:'Y'
      },     
      _privateSorage: function(){
        var uiw = this;
        
        uiw._vals = {
          keyTimeout:null,
          lastVal:'',
          filterVal:'',
          item:'',
          onLoad:'Y'
        },
        
        uiw._obj = {
          $item: null,
          $treeList: null,
          $treeRegion: null
        };
        
      },
      _init: function() {
        var uiw = this;        
        apex.debug.log("APEX Dynamic Tree Search", "APEX Init, Tree Region ID = ", uiw.options.treeRegion);
        
        // set vals
        uiw._privateSorage();
        uiw._obj.$item = $(uiw.element);
        uiw._obj.$treeRegion = $('#'+uiw.options.treeRegion);
        uiw._obj.$treeList = uiw._obj.$treeRegion.find(".tree ul,.a-TreeView ul");
        uiw._vals.item = uiw._obj.$item.attr('id');        
        
        // init
        uiw._obj.$item
          .on('change', function(){
            uiw._change();
          })
          .on('keydown', function(){
            uiw._keydown();
          });
          
        // call search on load 
        if(uiw.options.filterOnLoad === 'Y'){
          if(uiw._obj.$item.val().length > 0){
            uiw._obj.$treeList.ready(function() {            
              uiw._vals.lastVal = uiw._obj.$item.val();
              uiw._change();  
            });
          }           
        }
        

      },
      // main filter function
      _filter: function(pListObj,pFilterVal){
        var uiw = this;
        apex.debug.log("APEX Dynamic Tree Search", "Filter Loop");
        if (!pListObj.is('ul') && !pListObj.is('ol')) {
          return false;
        }    
        var vChild = pListObj.children();
        var vRes = false;
        for (var i = 0; i < vChild.length; i++) {
          var $liObj = $(vChild[i]);
          if($liObj.is('li')) {
            var vDisp = false;
            if ($liObj.children().length > 0) {
              for (var j = 0; j < $liObj.children().length; j++) {
                var vSubDisp = uiw._filter($($liObj.children()[j]), pFilterVal);
                vDisp = vDisp || vSubDisp;
              }
            }
            if (!vDisp) {
              var vTxt = $liObj.text();
              vDisp = vTxt.toLowerCase().indexOf(pFilterVal) >= 0;
            }			
            $liObj.css('display', vDisp ? '' : 'none');
            vRes = vRes || vDisp;
          } 
        }
        return vRes;        
      },
      // keydown action
      _keydown: function(){        
        var uiw = this;        
        apex.debug.log("APEX Dynamic Tree Search", "Keydown");
        uiw._vals.onLoad = 'N';
        clearTimeout(uiw._vals.keyTimeout);
        uiw._vals.keyTimeout = setTimeout(function() {
          var vCurrVal = uiw._obj.$item.val();
          if(vCurrVal === uiw._vals.lastVal) return;
          uiw._vals.lastVal = vCurrVal;
          uiw._change();          
        }, uiw.options.delay);   
      },    
      // change action
      _change: function(){
        var uiw = this;
        apex.debug.log("APEX Dynamic Tree Search", "Change");
        uiw._obj.$treeList = uiw._obj.$treeRegion.find(".tree ul,.a-TreeView ul");
        uiw._vals.filterVal = uiw._vals.lastVal.toLowerCase();
        
        // expand tree before search
        apex.widget.tree.expand_all(uiw._obj.$treeRegion.find(".tree,.a-TreeView").attr("id"));
        
        uiw._filter(uiw._obj.$treeList,uiw._vals.filterVal);
        if(uiw.options.filterOnLoad === 'Y' && uiw._vals.onLoad != 'Y'){
          apex.server.plugin  (uiw.options.ajaxId, {pageItems: "#"+uiw._vals.item}, {dataType:"text"});        
        }
      }
    });
});
