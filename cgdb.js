var cgdb = function () {
	/**
	*	Internal database handle
	*/
	this.db = null;
	/**
	*	Name of your database
	*/
	this.db_name = 'DefaultDB';
	/**
	*	Versionnumber of your database
	*/
	this.db_version = '1.0';
	/**
	*	Displayname of your database
	*/
	this.db_display_name = 'DefaultDisplay';
	/**
	*	Size of your database in bytes
	*/
	this.db_size = 2 * 1024 * 1024;
	/**
	*	Last AUTOINCREMENT value
	*/
	this.lastID = '';
	/**
	* Just for performance testing
	*/
	this.time = 0;
	
	/**
	*	Open/Create the database
	*	@param {String} db_name Name of the database
	*	@param {Float} db_version Versionnumber of your database
	*	@param {String} db_display_name Name that will be displayed in the browser
	*	@param {Int} db_size Desired size of the database in bytes (default is 5MB)
	*/
	this.init = function(db_name, db_version, db_display_name, db_size) {
		if(db_name) this.db_name = db_name;
		if(db_version) this.db_version = db_version;
		if(db_display_name) this.db_display_name = db_display_name;
		if(db_size) this.db_size = db_size;
		this.db = openDatabase(this.db_name, this.db_version, this.db_display_name, this.db_size);
	}
	
	/**
	*	Creates the tables defined in install.js
	*	@param {Object} structure A JSON object describing the tables (see the sample install.js)
	*/
	this.install = function(structure) {
		for(var i in structure) {
			var fields = [];
			for(var z in structure[i]) {
				fields.push(z + " " + structure[i][z].type + " " + structure[i][z].config);
			}
			this.createTable(i, fields);
		}
	}
	
	/**
	*	Create a new table in your database
	*	@param {String} table The name of the table
	*/
	this.createTable = function(table, fields) {
		if(table && fields) {
			this.db.transaction(function(tx) {
				tx.executeSql('CREATE TABLE IF NOT EXISTS ' + table + ' (' + fields.join(',') + ')', [], function(){ }, function(tx, error){console.log(error.message);});
			});
		}
	}
	
	/**
	*	Delete a table from the database
	*	@param {String} table The name of the table
	*/
	this.deleteTable = function(table) {
		if(table) {
			this.db.transaction(function(tx) {
				tx.executeSql('DROP TABLE ' + table, [], function(){}, function(tx, error){console.log(error.message);});
			});
		}
	}
	
	/**
	*	Add a column to an existing table
	*	@param {String} table The name of the table to manipulate
	*	@param {Object} column A JSON object that describes the new column (see docs for details) 
	*/
	this.addColumnToTable = function(table, column) {
		if(table && column) {
			this.db.transaction(function(tx){
				tx.executeSql("ALTER TABLE " + table + ' ADD ' + column.name + ' INTEGER', [], function(){ }, function(tx, error){console.log(error.message);});
			});
		}
	}
	
	/**
	*	Insert a new dataset into a table
	*	@param {String} table The table in which the data should be inserted
	*	@param {Array} fields Array containing the name of the database fields
	*	@param {Array} vals Array containing the values
	*/
	this.insertIntoTable = function(table, fields, vals) {
		var me = this;
		if(table && fields && vals) {
			this.db.transaction(function(tx){
				var placeholders = me.preparePlaceholders(vals);
				tx.executeSql("INSERT INTO " + table + ' (' + fields.join(',') + ') VALUES ('+placeholders+')', vals, function(tx, result){ }, function(tx, error){console.log(error.message);});
			}); 
		}
	}
	
	/**
	*	Creates a string from the value array where the values get
	*	represented by a question-mark placeholder
	* 	This is optional as it impacts performance in a negative way
	*
	*	@param {Array} array The value array
	*	@returns {String} The string with the placeholders
	*/
	this.preparePlaceholders = function(array) {
		var placeholders = '';
		for (var i=0, il=array.length; i<il; i++) {
			placeholders += '?,';
		}
		// remove trailing , and return the string
		return placeholders.substr(0, (placeholders.length-1));
	}
	
	/**
	*	Deletes a dataset from a table that matches the requirements of {condition}
	*	@param {String} table The table from that we want to delete the dataset
	*	@param {Object} condition The requirements a dataset has to meet to get deleted
	*/
	this.deleteFromTable = function(table, condition) {
		if(table) {
			this.db.transaction(function(tx){								
				tx.executeSql("DELETE FROM " + table + " WHERE " + condition.field + "='" + condition.value + "'");
			});
		}
	}
	
	/**
	*	Execute the given query on the database
	*	@param {String} query The query to execute
	*	@param {Function} sCallback The callback function to call if everything works well
	*	@param {Function} eCallback The callback function to call if an error occurs
	*/
	this.query = function(query, sCallback, eCallback) {
		if(query) {
			this.db.transaction(function(tx){
				tx.executeSql(query, [], sCallback, eCallback);
			});
		}
	}
}

function initCGDB() {
	if(typeof openDatabase != "undefined") window.cgdb = new cgdb();
		else alert('Your browser is currently not supporting Web databases. Switch to Safari 4.0+ or Google Chrome 5.0+.');
}

window.onload = initCGDB();