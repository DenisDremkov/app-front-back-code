'use strict'
var	mongoose,
		Schema,
		schema_user,
		schema_allBrend,
		schema_minAndMaxVal,
		schema_tablet,
		schema_laptop,
		schema_analitika_day,
		schema_analitika_arhiv_month,
		schema_analitika_arhiv_year,
		schema_comments_laptop,
		schema_comments_tablet,
		schema_comments_users,
		model_user,
		model_allBrend,
		model_minAndMax,
		model_tablet,
		model_laptop,
		model_analitika_day,
		model_analitika_arhiv_month,
		model_analitika_arhiv_year,
		model_comments_laptop,
		model_comments_tablet,
		model_comments_users;
mongoose = require("mongoose");
Schema = mongoose.Schema;

schema_user = new Schema ({
	"username" : String,
	"password" : String,
	"email" : String,
	"rights" : String,
	"visits" : Number,
	"session" : Boolean,
	"basket" : [{
		kind: String,
		_id : String,
		brand : String,
		model : String,
		price : Number,
		imgSmall : String
	}],
	"raitings" : [String],
	"avatarId" : String,
	"commentsId" : String,
	"adminInSession" : Boolean
});
schema_comments_users = new Schema ({
	idUser : String,
	comments : [{
		product : String,
		productKind : String,
		dateMilisec : Number,
		text : String
	}]	
});
schema_tablet  = new Schema ({
	kind : String,
	brand : String,
	model : String,
	guarantee : Number,
	price : Number,
	operSystem : String,
	cpu : String,
	numCores : Number,
	memory : Number,
	ramMemory : Number,
	screenDiagonal : Number,
	screenResolution : String,
	frontCamera : Number,
	mainCamera : Number,
	battery : Number,
	colours : [String],
	img : {
		small : String,
		big : String,
		slide1 : String,
		slide2 : String,
		slide3 : String,
		slide4 : String
	},
	sale : {
		bool : Boolean,
		discount : Number,
		descript : String
	},
	raiting : {
		val : Number,
		num : Number,
		sum : Number
	},
	comments : {
		summ : Number,
		idComments : String
	} 
});
schema_comments_tablet = new Schema ({
	idProduct : String,
	comments : [{
		user : String,
		dateMilisec : Number,
		text : String
	}]	
});
schema_laptop   = new Schema ({
	kind : String,
	brand : String,
	model : String,
	guarantee : Number,
	price : Number,
	operSystem : String,
	cpu : String,
	numCores : Number,
	memory : Number,
	ramMemory : Number,
	screenDiagonal : Number,
	screenResolution : String,
	frontCamera : Number,
	mainCamera : Number,
	battery : Number,
	colours : [String],
	img : {
		small : String,
		big : String,
		slide1 : String,
		slide2 : String,
		slide3 : String,
		slide4 : String
	},
	sale : {
		bool : Boolean,
		discount : Number,
		descript : String
	},
	raiting : {
		val : Number,
		num : Number,
		sum : Number
	},
	comments : {
		summ : Number,
		idComments : String
	} 
});
schema_comments_laptop = new Schema ({
	idProduct : String,
	comments : [{
		user : String,
		dateMilisec : Number,
		text : String
	}]	
});
schema_allBrend = new Schema ({
	"laptop" : [String],
	"tablet" : [String]
});
schema_minAndMaxVal = new Schema ({
	"laptop": {
		"price" : {
			"rus" : String,
			"min": Number,
			"max": Number
		},
		"raiting" : {
			"rus" : String,
			"min": Number,
			"max": Number
		},
		"screenDiagonal" : {
			"rus" : String,
			"min": Number,
			"max": Number
		},
		"numCores" : {
			"rus" : String,
			"min": Number,
			"max": Number
		},
		"frontCamera" :{
			"rus" : String,
			"min": Number,
			"max": Number
		},
		"mainCamera" : {
			"rus" : String,
			"min": Number,
			"max": Number
		},
		"memory" : {
			"rus" : String,
			"min": Number,
			"max": Number
		},   
		"ramMemory" : {
			"rus" : String,
			"min": Number,
			"max": Number
		}    
	},
	"tablet": {
		"price" : {
			"rus" : String,
			"min": Number,
			"max": Number
		},
		"raiting" : {
			"rus" : String,
			"min": Number,
			"max": Number
		},
		"screenDiagonal" : {
			"rus" : String,
			"min": Number,
			"max": Number
		},
		"numCores" : {
			"rus" : String,
			"min": Number,
			"max": Number
		},
		"frontCamera" :{
			"rus" : String,
			"min": Number,
			"max": Number
		},
		"mainCamera" : {
			"rus" : String,
			"min": Number,
			"max": Number
		},
		"memory" : {
			"rus" : String,
			"min": Number,
			"max": Number
		},   
		"ramMemory" : {
			"rus" : String,
			"min": Number,
			"max": Number
		}    
	}
})

schema_analitika_day = new Schema ({
	"day" : Number,
	"visits" : Number,
	"uniqVisits" : Number,
	"ipArray" : [String]	
});

schema_analitika_arhiv_month = new Schema ({
	"month" : Number,
	"visits" : Number,
	"uniqVisits" : Number,
	"days" : [{
		"day" : Number,
		"visits" : Number,
		"uniqVisits" : Number,
	}] 
});

schema_analitika_arhiv_year = new Schema ({
	"year" : String,
	"months" : [String]  
});


model_user = mongoose.model('user', schema_user);
model_allBrend = mongoose.model('property_product_allBrend', schema_allBrend);
model_minAndMax = mongoose.model('property_product_minAndMax', schema_minAndMaxVal);
model_tablet = mongoose.model('product_tablet', schema_tablet);
model_laptop = mongoose.model('product_laptop', schema_laptop);
model_analitika_day = mongoose.model('analitika_Today', schema_analitika_day);
model_analitika_arhiv_month = mongoose.model('analitika_arhiv_Month', schema_analitika_arhiv_month);
model_analitika_arhiv_year = mongoose.model('analitika_arhiv_Year', schema_analitika_arhiv_year);
model_comments_laptop = mongoose.model('comments_db_laptop', schema_comments_laptop);
model_comments_tablet = mongoose.model('comments_db_tablet', schema_comments_tablet);
model_comments_users = mongoose.model('comments_db_users', schema_comments_users);

module.exports = {	
	"user" : model_user,
	"brands" : model_allBrend,
	"minAndMaxVal" : model_minAndMax,
	"tablet" : model_tablet,
	"laptop" : model_laptop,
	"analitikaDay" : model_analitika_day,
	"analitikaMonth" : model_analitika_arhiv_month,
	"analitikaYear" : model_analitika_arhiv_year,
	"comments_laptop" : model_comments_laptop,
	"comments_tablet" : model_comments_tablet,
	"comments_users" : model_comments_users
};

