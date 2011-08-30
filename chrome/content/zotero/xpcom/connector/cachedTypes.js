/*
    ***** BEGIN LICENSE BLOCK *****
    
    Copyright © 2011 Center for History and New Media
                     George Mason University, Fairfax, Virginia, USA
                     http://zotero.org
    
    This file is part of Zotero.
    
    Zotero is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    
    Zotero is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.
    
    You should have received a copy of the GNU Affero General Public License
    along with Zotero.  If not, see <http://www.gnu.org/licenses/>.
    
    ***** END LICENSE BLOCK *****
*/

/**
 * Emulates very small parts of cachedTypes.js and itemFields.js APIs for use with connector
 */

/**
 * @namespace
 */
Zotero.Connector_Types = new function() {
	/**
	 * Initializes types
	 * @param {Object} typeSchema typeSchema generated by Zotero.Connector.GetData#_generateTypeSchema
	 */
	this.init = function() {
		const schemaTypes = ["itemTypes", "creatorTypes", "fields"];
		
		// attach IDs and make referenceable by either ID or name
		for(var i=0; i<schemaTypes.length; i++) {
			var schemaType = schemaTypes[i];
			this[schemaType] = Zotero.Utilities.deepCopy(Zotero.Connector_Types.schema[schemaType]);
			for(var id in this[schemaType]) {
				var entry = this[schemaType][id];
				entry.id = parseInt(id);
				this[schemaType][entry.name] = entry;
			}
		}
	};
	
	/**
	 * Passes schema to a callback
	 * @param {Function} callback
	 */
	this.getSchema = function(callback) {
		callback(Zotero.Connector_Types.schema);
	};
}

Zotero.CachedTypes = function() {
	this.getID = function(idOrName) {
		if(!Zotero.Connector_Types[this.schemaType][idOrName]) return false;
		return Zotero.Connector_Types[this.schemaType][idOrName].id;
	};
	
	this.getName = function(idOrName) {
		if(!Zotero.Connector_Types[this.schemaType][idOrName]) return false;
		return Zotero.Connector_Types[this.schemaType][idOrName].name;
	};
	
	this.getLocalizedString = function(idOrName) {
		if(!Zotero.Connector_Types[this.schemaType][idOrName]) return false;
		return Zotero.Connector_Types[this.schemaType][idOrName].localizedString;
	};
}

Zotero.ItemTypes = new function() {
	this.schemaType = "itemTypes";
	Zotero.CachedTypes.call(this);
	
	this.getImageSrc = function(idOrName) {
		if(!Zotero.Connector_Types["itemTypes"][idOrName]) return false;
		
		if(Zotero.isBookmarklet) {
			return ZOTERO_CONFIG.BOOKMARKLET_URL+"icons/"+Zotero.Connector_Types["itemTypes"][idOrName].icon;
		} else if(Zotero.isFx) {
			return "chrome://zotero/skin/"+Zotero.Connector_Types["itemTypes"][idOrName].icon;
		} else if(Zotero.isChrome) {
			return chrome.extension.getURL("images/"+Zotero.Connector_Types["itemTypes"][idOrName].icon);
		} else if(Zotero.isSafari) {
			return safari.extension.baseURI+"images/itemTypes/"+Zotero.Connector_Types["itemTypes"][idOrName].icon;
		}
	};
}

Zotero.CreatorTypes = new function() {
	this.schemaType = "creatorTypes";
	Zotero.CachedTypes.call(this);
	
	this.getTypesForItemType = function(idOrName) {
		if(!Zotero.Connector_Types["itemTypes"][idOrName]) return false;
		var itemType = Zotero.Connector_Types["itemTypes"][idOrName];
		var creatorTypes = [];
		for(var i=0; i<itemType.creatorTypes.length; i++) {
			creatorTypes.push(Zotero.Connector_Types["creatorTypes"][itemType.creatorTypes[i]]);
		}
		return creatorTypes;
	};
}

Zotero.ItemFields = new function() {
	this.schemaType = "fields";
	Zotero.CachedTypes.call(this);
	
	this.isValidForType = function(fieldIdOrName, typeIdOrName) {
		// mimics itemFields.js
		if(!Zotero.Connector_Types["fields"][fieldIdOrName]
		   || !Zotero.Connector_Types["itemTypes"][typeIdOrName]) return false;
		
		return Zotero.Connector_Types["itemTypes"][typeIdOrName].fields.indexOf(
			Zotero.Connector_Types["fields"][fieldIdOrName].id) !== -1;
	};
	
	this.getFieldIDFromTypeAndBase = function(itemType, baseField) {
		if(!Zotero.Connector_Types["fields"][baseField]
		   || !Zotero.Connector_Types["itemTypes"][itemType]) throw new Error("Invalid field or type ID");
		
		// get as ID
		baseField = Zotero.Connector_Types["fields"][baseField].id;
		
		
		// loop through base fields for item type
		var baseFields = Zotero.Connector_Types["itemTypes"][itemType]["baseFields"];
		for(var i in baseFields) {
			if(baseFields[i] === baseField) {
				return i;
			}
		}
		
		return false;
	};
	
	this.getBaseIDFromTypeAndField = function(itemType, fieldIdOrName) {
		if(!Zotero.Connector_Types["fields"][fieldIdOrName]
		   || !Zotero.Connector_Types["itemTypes"][itemType]) throw new Error("Invalid field or type ID");
		
		fieldIdOrName = Zotero.Connector_Types["fields"][fieldIdOrName].id;
		
		var baseField = Zotero.Connector_Types["itemTypes"][itemType]["baseFields"][fieldIdOrName];
		return baseField ? baseField : false;
	};
	
	this.getItemTypeFields = function(typeIdOrName) {
		return Zotero.Connector_Types["itemTypes"][typeIdOrName].fields.slice();
	};
}