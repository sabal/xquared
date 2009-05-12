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
			{className:"lineHeight", title:xed._("Line height"), list: [
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
			xed.handleInlineStyle('lineHeight', value);
		}
	}
});