/* eslint-env node */

const fs = require('fs')
const path = require('path')
const mime = require('mime')
const multer = require('multer')

// Local storage for project images
const storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, './www/images/projects')
	},
	filename: function(req, file, cb) {
		const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + '.' + mime.getExtension(file.mimetype)
		cb(null, uniqueName)
	}
})

const upload = multer({ storage: storage })

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
	})
}

exports.project_edit = function(req, res) {
	res.render('edit-projects')
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
		res.send(project)
	})
}

// Handle Project create on POST.
exports.project_create_post = function(req, res) {
	var project = new Project(req.body)

	project.save(function(err) {
		if (err) {
			throw err
		}
		res.send(project)
	})
}

// Handle Project delete on POST.
exports.project_delete_post = function(req, res) {
	Project.findById(req.params.id, function(err, data) {
		if (err) return res.status(500).send(err)

		// Delete local image files
		if (data && data.images) {
			data.images.forEach(function(imageUrl) {
				// imageUrl is like /images/projects/filename.jpg
				var filePath = path.join('./www', imageUrl)
				fs.unlink(filePath, function(err) {
					if (err) console.error('Could not delete file:', filePath, err)
				})
			})
		}

		Project.findByIdAndRemove(req.params.id, function(err) {
			if (err) return res.status(500).send(err)
			return res.send(true)
		})
	})
}

// Handle Project update on POST.
exports.project_update_post = function(req, res) {
	var project = new Project(req.body)

	Project.findByIdAndUpdate(req.params.id, project, {}, function(err) {
		if (err) {
			throw err
		}
		res.send(project)
	})
}

// Upload a project image to local filesystem.
exports.project_image_upload_post = function(req, res) {
	upload.single('file')(req, res, function(err) {
		if (err) {
			console.error(err)
			return res.status(500).send(err)
		}
		if (!req.file) {
			return res.status(400).send('No file uploaded.')
		}
		// Return the public URL path
		var url = '/images/projects/' + req.file.filename
		res.send(JSON.stringify({ url: url }))
	})
}

// Delete a project image from local filesystem.
exports.project_image_delete_get = function(req, res) {
	var filename = req.query.fileName
	var filePath = path.join('./www/images/projects', filename)

	fs.unlink(filePath, function(err) {
		if (err) {
			console.error(err)
			return res.status(500).send(err)
		}
		res.send(true)
	})
}
