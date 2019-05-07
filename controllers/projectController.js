/* eslint-env node */

const fs = require('fs')
const mime = require('mime')
const multer = require('multer')

const aws = require('aws-sdk')
const S3_BUCKET = process.env.S3_BUCKET
aws.config.region = process.env.AWS_REGION

const s3 = new aws.S3()
// -----

var Project = require('../models/project')

// Display list of all Projects.
exports.project_list = function(req, res) {
	Project.find({}).exec(function(err, list_projects) {
		if (err) {
			throw err
		}
		//Successful, so render
		res.render('gallery', {
			projects: list_projects
		})
		//res.send(list_projects);
	})
	//res.send('NOT IMPLEMENTED: Project list');
}

exports.project_edit = function(req, res) {
	// Project.find({})
	//     .exec(function (err, list_projects) {
	//         if (err) {
	//             throw err;
	//         }
	//Successful, so render
	res.render('edit-projects' /* , {
                projects: list_projects
            } */)
	//res.send(list_projects);
	// });
}

exports.project_list_api = function(req, res) {
	Project.find({}).exec(function(err, list_projects) {
		if (err) {
			throw err
		}
		res.send(list_projects)
	})
}

// Display detail page for a specific Project.
exports.project_detail = function(req, res) {
	Project.findById(req.params.id).exec(function(err, project) {
		if (err) {
			throw err
		}
		//Successful, so render
		//console.log(product)
		res.send(project)
		//res.send(list_products);
	})
}

// Handle Project create on POST.
exports.project_create_post = function(req, res) {
	// Create a Book object with escaped and trimmed data.
	var project = new Project(req.body)

	// var storage = multer.diskStorage({
	// 	destination: './uploads',
	// 	filename: function(req, file, cb) {
	// 		cb(null, project._id + '.' + mime.getExtension(file.mimetype))
	// 	}
	// })

	// var upload = multer({
	// 	storage: storage
	// }).any()

	// upload(req, res, function(err) {
	// 	if (err) {
	// 		throw err
	// 		//return res.end('Error uploading file.');
	// 	} else {
	// 		//console.log(req.body);
	// 		//console.log(req.files);

	// 		/* */
	// 		project.name = req.body.project_name
	// 		project.owner = req.body.project_owner
	// 		project.description = req.body.project_description
	// 		project.date = req.body.project_date
	// 		project.cost = req.body.project_cost
	// 		project.url = req.body.project_url
	// 		project.categories = req.body.project_categories

	// 		project.image.data = fs.readFileSync(req.files[0].path)
	// 		project.image.contentType = req.files[0].mimetype
	// 		//console.log(product);

	project.save(function(err) {
		if (err) {
			throw err
		}
		//successful - redirect to new book record.
		// res.redirect('/dashboard/projects')
		res.send(project)
	})
	// fs.unlink(req.files[0].path, function(err) {
	// 	if (err) {
	// 		throw err
	// 	}
	// })
	// //res.end("File has been uploaded");
	// /**/
	// }
	// })

	//res.send('NOT IMPLEMENTED: Project create POST');
}

// Handle Project delete on POST.
exports.project_delete_post = function(req, res) {
	Project.findById(req.params.id, function(err, data) {
		var params = {
			Bucket: S3_BUCKET,
			Delete: {
				Objects: []
			}
		}

		// console.log(data)

		data.images.forEach(image => {
			params.Delete.Objects.push({ Key: image.split('/').slice(-1)[0] })
		})

		s3.deleteObjects(params, function(err, data) {
			// console.log(data)

			if (err) return res.status(500).send(error)
			Project.findByIdAndRemove(req.params.id, function(err) {
				if (err) return res.status(500).send(error)
				return res.send(true)
			})
		})
	})

	// res.send('NOT IMPLEMENTED: Project delete POST');
}

// Handle Project update on POST.
exports.project_update_post = function(req, res) {
	// Create a Book object with escaped and trimmed data.
	var project = new Project(req.body)

	Project.findByIdAndUpdate(req.params.id, project, {}, function(err) {
		if (err) {
			throw err
		}
		//successful - redirect to new book record.
		// res.redirect('/dashboard/projects')
		res.send(project)
	})

	// var storage = multer.diskStorage({
	//     destination: './www/catalog/project',
	//     filename: function (req, file, cb) {

	//         cb(null, req.params.id + '.' + mime.getExtension(file.mimetype));
	//     }
	// });

	// var upload = multer({
	//     storage: storage
	// }).any();

	// upload(req, res, function (err) {
	//     if (err) {
	//         throw err;
	//         //return res.end('Error uploading file.');
	//     } else {
	//         //console.log(req.body);
	//         //console.log(req.files);

	//         project.name = req.body.project_name;
	//         project.owner = req.body.project_owner;
	//         project.description = req.body.project_description;
	//         project.date = req.body.project_date;
	//         project.cost = req.body.project_cost;
	//         project.url = req.body.project_url;
	//         project._id = req.params.id;
	//         project.categories = req.body.project_categories;
	//         project.imagetype = mime.getExtension(req.files[0].mimetype);
	//         //console.log(product);

	//         Project.findByIdAndUpdate(req.params.id, project, {}, function (err) {
	//             if (err) {
	//                 throw err;
	//             }
	//             //successful - redirect to new book record.
	//             res.redirect('/dashboard/projects');
	//         });

	//         //res.end("File has been uploaded");
	//     }
	// });

	//res.send('NOT IMPLEMENTED: Project update POST');
}

// Display detail image for a specific Enquiry.
exports.project_image_get = function(req, res) {
	Project.findById(req.params.id).exec(function(err, project) {
		if (err) {
			throw err
		}

		res.contentType(project.image.contentType)
		res.send(project.image.data)

		//res.send(list_products);
	})
	// res.send('NOT IMPLEMENTED: Enquiry detail: ' + req.params.id);
}

exports.project_sign_s3_put_get = (req, res) => {
	const fileName = req.query.fileName
	const fileType = req.query.fileType

	const s3Params = {
		Bucket: S3_BUCKET,
		Key: fileName,
		Expires: 60,
		ContentType: fileType,
		ACL: 'public-read'
	}

	s3.getSignedUrl('putObject', s3Params, (err, data) => {
		if (err) {
			console.error(err)
			return res.status(500).send(err)
		}
		const returnData = {
			signedRequest: data,
			url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
		}
		res.send(JSON.stringify(returnData))
	})
}

exports.project_s3_delete_get = (req, res) => {
	const filenameToRemove = req.query.fileName

	const s3Params = {
		Bucket: S3_BUCKET,
		Key: filenameToRemove
	}

	s3.deleteObject(s3Params, function(err, data) {
		if (err) {
			console.error(err)
			return res.status(500).send(err)
		}
		res.send(true)
	})
}
