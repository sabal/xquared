/**
 * @requires Xquared.js
 * @requires Browser.js
 * @requires Editor.js
 * @requires plugin/Base.js
 * @requires ui/Control.js
 */
xq.plugin.CustomStylePlugin = xq.Class(xq.plugin.Base,
	/**
	 * @name xq.plugin.CustomStylePlugin
	 * @lends xq.plugin.CustomStylePlugin.prototype
	 * @extends xq.plugin.Base
	 * @constructor
	 */
	{
	onAfterLoad: function(xed) {
		xed.config.defaultToolbarButtonGroups.block.push(
			{className:"lineHeight", title:"Line Height", list: [
				{html:"50%25", style: {marginBottom: "3px"}, handler:"xed.handleLineHeight('50%')"},
				{html:"80%25", style: {marginBottom: "3px"}, handler:"xed.handleLineHeight('80%')"},
				{html:"100%25", style: {marginBottom: "3px"}, handler:"xed.handleLineHeight('100%')"},
				{html:"120%25", style: {marginBottom: "3px"}, handler:"xed.handleLineHeight('120%')"},
				{html:"150%25", style: {marginBottom: "3px"}, handler:"xed.handleLineHeight('150%')"},
				{html:"180%25", style: {marginBottom: "3px"}, handler:"xed.handleLineHeight('180%')"},
				{html:"200%25", style: {marginBottom: "3px"}, handler:"xed.handleLineHeight('200%')"}
			]}
		)
			
		xed.handleLineHeight = function(value){
			if(xed.rdom.hasSelection(true)) {
				var blocks = xed.rdom.getBlockElementsAtSelectionEdge(true, true);
				if(blocks.first() !== blocks.last()) {
					var affected = xed.rdom.applyLineHeights(blocks.first(), blocks.last(), value);
					xed.rdom.selectBlocksBetween(affected.first(), affected.last());
					
					var historyAdded = xed.editHistory.onCommand();
					xed._fireOnCurrentContentChanged(xed);
					
					return true;
				}
			}
			
			var affected = xed.rdom.applyLineHeight(value);
			
			if(affected && !xed.rdom.tree.isAtomic(xed.rdom.getCurrentElement())) {
				xed.rdom.placeCaretAtStartOf(affected);
				
				var historyAdded = xed.editHistory.onCommand();
				xed._fireOnCurrentContentChanged(this);
			}
			
			return true;
		}
		
		xed.rdom.applyLineHeight = function(value, element){
			element = element || xed.rdom.getCurrentBlockElement();
			
			var root = xed.rdom.getRoot();
			if(!element || element === root) return null;
			if (element.parentNode !== root && !element.previousSibling) element=element.parentNode;
		
			element.style.lineHeight = value;
			
			return element;
		}
		
		xed.rdom.applyLineHeights = function(from, to, value){
			var blocks = xed.rdom.getBlockElementsBetween(from, to);
			var top = xed.rdom.tree.findCommonAncestorAndImmediateChildrenOf(from, to);
			
			var affect = [];
			
			leaves = xed.rdom.tree.getLeavesAtEdge(top.parent);
			if (blocks.includeElement(leaves[0])) {
				var affected = xed.rdom.applyLineHeight(value, top.parent);
				if (affected)
					return [affected];
			}
			
			var children = xq.$A(top.parent.childNodes);
			for (var i=0; i < children.length; i++) {
				xed.rdom._applyLineHeights(children[i], blocks, affect, value);
			}
			
			affect = affect.flatten()
			return affect.length > 0 ? affect : blocks;
		}
		
		xed.rdom._applyLineHeights = function(node, blocks, affect, value){
			for (var i=0; i < affect.length; i++) {
				if (affect[i] === node || xed.rdom.tree.isDescendantOf(affect[i], node))
					return;
			}
			leaves = xed.rdom.tree.getLeavesAtEdge(node);
			
			if (blocks.includeElement(leaves[0])) {
				var affected = xed.rdom.applyLineHeight(value, node);
				if (affected) {
					affect.push(affected);
					return;
				}
			}
			
			if (blocks.includeElement(node)) {
				var affected = xed.rdom.applyLineHeight(value, node);
				if (affected) {
					affect.push(affected);
					return;
				}
			}
	
			var children=xq.$A(node.childNodes);
			for (var i=0; i < children.length; i++)
				xed.rdom._applyLineHeights(children[i], blocks, affect, value);
			return;
		}
	}
});