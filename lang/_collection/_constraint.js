
// 18/12/2016 - Will take this out of use. Will use much simpler, functional constraints. Maybe is_array or similar will suffice in many cases.




class Collection_Constraint extends Constraint {

	'constructor'(spec) {
		// if the spec is a string, then parse the string.

		// it may make reference to various data types.
		//  text, restricted or unrestricted length
		//  ints, numbers, etc
		//  various tests will be carried out, beyond tof.
		this.__data_type = 'collection_constraint';
		//if (tof(spec) == 'string') {
		//}
		// A constraint can be / contain multiple other constraints.
		//  Maybe it should have that logic inside it, and these other constraints can be particular ones.

		// Code execution path... may be important getting that working before long, but now it does seem that specifying and
		//  validating these various types in JavaScript seems like an important thing to do.
		//
	}
// 'matches'
}


class Collection_Data_Def_Constraint extends Collection_Constraint {

	'constructor'(spec) {

		super();

		//if (tof(spec) == 'function' && is_constructor_fn(spec)) {
		//	this.data_type_constructor = spec;
		//}
		//console.log('tof(spec) ' + tof(spec));
		//console.log('tof(String) ' + tof(String));

		if (tof(spec) === 'object') {
			this.data_def = spec;
		}

		// Def is not the data_type in terms of a constructor
		this._constraint_type = 'data_def';

	}

	'match'(value) {
		// value must be an object?
		var that = this;

		var tv = tof(value);
		if (tv == 'object') {
			//console.log('value ' + stringify(value));

			// need to see if the value matches the items in the data_def.
			var allMatch = true;

			each(this.data_def, function(field_name, field_def, stop) {
				var match = object_matches_def(value[field_name], field_def);
				//console.log('match ' + match);

				allMatch = allMatch && match;
				//console.log('allMatch ' + allMatch);
				if (!allMatch) stop();
			});
			return allMatch;
			//throw 'stop';
		}

	}
}


// Perhaps rename to Collection_Data_Type_Constructor_Constraint
class Collection_Data_Type_Constraint extends Collection_Constraint {
	'constructor'(spec) {
		super(spec);
		//if (tof(spec) == 'function' && is_constructor_fn(spec)) {
		//	this.data_type_constructor = spec;
		//}
		//console.log('tof(spec) ' + tof(spec));
		//console.log('tof(String) ' + tof(String));
		if (tof(spec) === 'function') {
			this.data_type_constructor = spec;
		}
		this._constraint_type = 'data_type';
	}
	'match': fp(function (a, sig) {
		//console.log('');
		//console.log('*  match sig ' + sig);
		//console.log('this.data_type_constructor ' + this.data_type_constructor);
		//console.log('a[0] ' + a[0]);
		//console.log('tof(a[0]) ' + tof(a[0]));
		//console.log('a[0] instanceof this.data_type_constructor ' + (a[0] instanceof this.data_type_constructor));

		var ta0 = tof(a[0]);
		//console.log('ta0 ' + ta0);
		if (ta0 == 'number') {
			//console.log(this.data_type_constructor === Number);
			if (this.data_type_constructor === Number) return true;
		}
		// But can perform casting / conversion.
		if (ta0 == 'string') {
			//console.log(this.data_type_constructor === Number);
			if (this.data_type_constructor === String) return true;
		}

		if (this.data_type_constructor && a[0] instanceof this.data_type_constructor) {
			return true;
		}

		//if (sig == '[D]') {
		//	// matching a Data_Object against these constraints.

		//	//var c_res = this.data_object.obj_matches_field_constraints(a[0]);
		//	//return c_res;

		//	if (this.data_type_constructor) {
		//		return a[0] instanceof this.data_type_constructor;
		//	}

		//	//return

		//}

		//// May be given a collection here.
		//if (sig == '[C]') {
		//	// A collection may hold constraints for a type of collection.

		//	// Database holds Tables Collection, which is of the Table item.

		//	// let's have a look at that collection.
		//	var obj = a[0];
		//	//console.log('obj ' + stringify(obj));

		//	// eg collection of tables.
		//	///  probably should have its data type constraint?

		//	var obj_name = obj.get('name');
		//	//console.log('obj_name ' + obj_name);



		//	// we may be able to get the data_type_constraint of that collection.
		//	//  It may be a dtc that implies it can take a collection, maybe a collection of a particular type of object.

		//	//console.log('obj._data_type_constraint ' + stringify(obj._data_type_constraint));
		//	// so, a collection when given a typed collection as it's data_type will need to respond correctly.
		//	//  setting its _data_type_constraint

		//	//console.log('obj._data_type_constraint.data_type_constructor ' + stringify(obj._data_type_constraint.data_type_constructor));

		//	//data_type_constructor

		//	//console.log('this.data_type_constructor ' + stringify(this.data_type_constructor));
		//	//var stack = new Error().stack
		//	//console.log( stack )
		//	//throw('13) stop');

		//	//var res = obj instanceof obj._data_type_constraint.data_type_constructor;
		//	var res = obj instanceof this.data_type_constructor;
		//	//console.log('res ' + res);
		//	// nice, seems to work.

		//	return res;
		//	// see if the collection's _data_type_constraint matches the constructor in this constraint.


		//	// this does get a bit complicated with the same code being used on different nested levels.
		//	//  I'll need to cut down on feature addition on this, and make sure the API is working and stable.
		//	//  Document it too.

		//	// Just need it to generate these relational, or semi-relational databases.
		//	//  Need to get the whole web platform running.

		//	// The system has got pretty big, still will need a bit more for the whole database support.
		//	//  Will likely make some database connected extensions... or maybe more sync code in the 'Database' class.

		//	//return
		//}
		//
		return false;

	})
});

// Will be used for checking every Table that gets put into a Database is a Table etc.
//  Used to enforce ststic typing.

// Something very similar could be used to enforce static typing on Data_Objects.
//  That will restrict the objects that can get put into Data_Objects to being a particular class / subclass chain.

// Collection_Data_Object_Constraint
//  Used for making a Collection like a Table in a DB.
//  This way the Collection is constrained to storing one type of object.

// Could be a data type constraint... used for holding the required fields.
//  Not just for checking the data_type... must check that the objects conform to the Data_Object's constraints.
//  May be able to make a data_object that can't be constructed without the right fields...

//var Collection_Data_Object_Constraint = Collection_Constraint.extend({
//	'constructor'(spec) {
//		if (tof(spec) == 'data_object') {
//			this.data_object = spec;
//		}

//		// May also want to define a table data object constraint like:
//		//  {"address": "string", "family": "string", "internal": "boolean"}
//		//  (is it a constraint really? or just a collection of fields?)
//		//   I think it's a constraint because it restricts their types.

//		//console.log('Collection_Data_Object_Constraint tof(spec) ' + tof(spec));

//		this._constraint_type = 'data_object';

//	},
//	'match': fp(function(a, sig) {
//		//console.log('match sig ' + sig);
//		//console.log('match a ' + stringify(a));
//		if (sig == '[D]') {
//			// matching a Data_Object against these constraints.

//			var c_res = this.data_object.obj_matches_field_constraints(a[0]);
//			return c_res;
//		}

//		// May be given a collection here.
//		if (sig == '[C]') {
//			// A collection may hold constraints for a type of collection.

//			// Database holds Tables Collection, which is of the Table item.

//			// let's have a look at that collection.
//			var obj = a[0];
//			//console.log('obj ' + stringify(obj));

//			// get the constraint for that field...
//			//  it should have been put in when the field gets specified.

//			//each(obj, function(i, v) {
//			//	console.log('i ' + i);
//			//	console.log('v ' + v);
//			//});

//			// a lower level each?
//			//  The Collection object has got fairly big and complicated.
//			//  want to be able to view all its constraints easily.

//			// it may have a data_type_constraint.
//			/*
//			var coll_dtc = obj._data_type_constraint;
//			console.log('coll_dtc ' + coll_dtc);
//			//console.log('coll_dtc ' + stringify(coll_dtc));


//			var stack = new Error().stack
//			console.log( stack )


//			throw('14) stop');
//			*/
//			return true;

//		}
//	})

//});

// One of these can be set to primary. The first one is by default.
//  The order of the unique indexes matters.

var Unique_Constraint extends Collection_Constraint {

	'constructor': function (spec) {
		super(spec);
		//this.set('constraint_type', 'unique');
		this._constraint_type = 'unique';
		// field (name) or actual field (reference to a field constraint).

		// but field could be plural too
		//  will be a convention that the singular here can sometimes refer to plural.
		//  maybe plural would be better?
		if (is_defined(spec.fields)) this.fields = spec.fields;

		if (tof(this.fields) == 'array') {
			this._sorted_fields = clone(this.fields).sort();
		}
	}
	// not really sure the constraint will do much here... it requires an index to be set up.
	//  perhaps tells the index not to accept duplicates?

	// test the constraint?
	//  do that outside for the moment
}