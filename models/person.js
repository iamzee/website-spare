var mongoose = require('mongoose')

var Schema = mongoose.Schema

var PersonData = new Schema({
	name: {
		type: String,
		required: true,
		max: 100,
		default: 'unknown'
	},
	position: {
		type: String,
		max: 100,
		default: 'unknown'
	},
	education: {
		type: String,
		required: true,
		max: 100,
		default: 0
	},
	thought: {
		type: String,
		max: 1000,
		required: true
	},
	imageLink: {
		type: String,
		max: 1000
	}
})

//Export model
module.exports = mongoose.model(' ', PersonData)
