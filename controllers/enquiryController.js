var Enquiry = require('../models/enquiry')
var Product = require('../models/product')

// Dummy local mailer — logs email to console instead of sending via SendGrid
function sendMail(email) {
	console.log('📧 [LOCAL MAILER] Email would be sent:')
	console.log('   To:      ', email.to)
	console.log('   From:    ', email.from)
	console.log('   Subject: ', email.subject)
	console.log('   Body:    ', email.html)
}

// Display list of all Enquirys.
exports.enquiry_list = function(req, res) {
	Enquiry.find({}, '_id comment status', {
		sort: {
			date: -1 //Sort by Date Added DESC
		}
	}).exec(function(err, list_all) {
		if (err) {
			throw err
		}
		//Successful, so render
		res.render('dashboard', {
			enquiries: list_all
		})
	})
}

// Display list of all Enquirys.
exports.dashboard_list = function(req, res) {
	Enquiry.find(
		{
			status: true
		},
		'_id comment status',
		{
			sort: {
				date: -1 //Sort by Date Added DESC
			}
		}
	).exec(function(err, list_unread) {
		if (err) {
			throw err
		}
		//Successful, so render
		res.render('dashboard', {
			enquiries: list_unread
		})
	})
}

// Display detail page for a specific Enquiry.
exports.enquiry_detail = function(req, res) {
	Enquiry.findById(req.params.id).exec(function(err, enquiry) {
		if (err) {
			throw err
		}
		res.send(enquiry)
		enquiry.status = false
		Enquiry.findByIdAndUpdate(req.params.id, enquiry, {}, function(err) {
			if (err) {
				throw err
			}
		})
	})
}

// Handle Enquiry create on POST.
exports.enquiry_create_post = function(req, res) {
	Product.findById(req.body.productid).exec(function(err, pro) {
		var enquiry = new Enquiry({
			name: req.body.name,
			comment: req.body.comment,
			email: req.body.email,
			phone: req.body.phone
		})

		if (enquiry.comment == 'nothing') {
			enquiry.comment = 'About: ' + pro.name
		}

		sendMail({
			to: 'sparc.ideas@gmail.com',
			from: `SpArc Enquiry <sparc@root-kings.com>`,
			subject: `Enquiry: ${enquiry.comment}`,
			html: `<p>Body: ${enquiry.comment}.<br>From: ${enquiry.name}<br>Email: ${enquiry.email}<br>Phone: ${enquiry.phone}</p>`
		})

		enquiry.save(function(err) {
			if (err) {
				throw err
			}
			res.send(pro)
		})
	})
}

// Handle Enquiry create on POST (contact form).
exports.enquiry_contact_create_post = function(req, res) {
	var enquiry = new Enquiry({
		name: req.body.name,
		comment: req.body.comment,
		email: req.body.email,
		phone: req.body.phone
	})

	sendMail({
		to: 'sparc.ideas@gmail.com',
		from: `SpArc Enquiry <sparc@root-kings.com>`,
		subject: `Enquiry: ${enquiry.comment}`,
		html: `<p>Body: ${enquiry.comment}.<br>From: ${enquiry.name}<br>Email: ${enquiry.email}<br>Phone: ${enquiry.phone}</p>`
	})

	enquiry.save(function(err) {
		if (err) {
			throw err
		}
		res.render('contact', {
			status: true
		})
	})
}

// Display Enquiry delete form on GET.
exports.enquiry_delete_get = function(req, res) {
	Enquiry.findByIdAndRemove(req.params.id, function(err) {
		if (err) {
			throw err
		}
		res.send(true)
	})
}
