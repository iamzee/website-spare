let projectsVue

document.addEventListener('DOMContentLoaded', function() {
	// showWait()
	projectsVue = new Vue({
		el: '#projectList',
		data: {
			projects: [],
			selectedProject: {
				description: '',
				cost: '',
				owner: '',
				url: '',
				name: '',
				date: '',
				projectUrl: '',
				youtubeUrl: '',
				images: []
			},
			requestURL: '/project/create'
		},

		methods: {
			poplateProjects: function() {
				let currentVue = this

				fetch('/api/projects')
					.then(function(response) {
						return response.json()
					})
					.then(function(projects) {
						currentVue.projects = projects
					})
					.catch(function(error) {
						M.toast({ html: 'Error occured! Check console for details.' })
						console.error(error)
					})
			},
			viewProject: function(id) {
				localStorage.setItem('selectedProject', id)
				window.location.href = '/project'
			},
			onSubmit: function() {
				fetch(projectsVue.requestURL, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(projectsVue.selectedProject)
				})
					.then(function(response) {
						M.toast({ html: 'Project details sent!' })
						$('#edit-modal').modal('close')
						projectsVue.poplateProjects()

						// TODO: redirect to success page
					})
					.catch(function(error) {
						M.toast({ html: 'Error occured! Check console for details.' })
						console.error(error)
					})
					.then(function() {
						// hideWait()
					})
			}
		},

		mounted: function() {
			this.poplateProjects()
			M.AutoInit()
			// hideWait()
		}
	})

	/* document.querySelector('#project-image').addEventListener('change',function(){

	}) */
})

function deleteproject(id) {
	if (confirm('Are you sure you want to delete?')) {
		$.post('/project/' + id + '/delete', {}, function(status) {
			if (status) {
				project.location.reload()
			}
		})
	}
}

function populate(id) {
	$.get('/project/' + id, {}, function(project) {
		projectsVue.selectedProject = project
		/*M.toast({
            html: 'Product Found ' + product.name
        });*/
		$('#edit-modal').modal('open')
		$('#modal-heading').html('Edit project')

		// $('#project-description')
		// 	// .val(project.description)
		// 	.focus()
		// $('#project-cost')
		// 	// .val(project.cost)
		// 	.focus()
		// $('#project-owner')
		// 	// .val(project.owner)
		// 	.focus()
		// $('#project-url')
		// 	// .val(project.url)
		// 	.focus()
		// $('#project-name')
		// 	// .val(project.name)
		// 	.focus()

		// $('#project-form').attr('action', '/project/' + id + '/update')
		projectsVue.requestURL = '/project/' + id + '/update'
		$('#delete-btn').attr('href', 'javascript:deleteproject("' + id + '");')

		//console.log(product._id)
	})
}

function clearproject() {
	$('#edit-modal').modal('open')
	$('#modal-heading').html('Create project')

	projectsVue.selectedProject = {
		description: '',
		cost: '',
		owner: '',
		url: '',
		name: '',
		date: '',
		projectUrl: '',
		youtubeUrl: '',
		images: []
	}

	// $('#project-description')
	// 	// .val('')
	// 	.focus()
	// // $('#project-image')
	// // .val('')
	// // 	.focus()
	// $('#project-cost')
	// 	// .val('')
	// 	.focus()
	// $('#project-owner')
	// 	// .val('')
	// 	.focus()
	// $('#project-url')
	// 	// .val('')
	// 	.focus()
	// $('#project-name')
	// 	// .val('')
	// 	.focus()

	// $('#project-form').attr('action', '/project/create')
	projectsVue.requestURL = '/project/create'

	$('#delete-btn').attr('href', '!#')
}

const uploadFile = function(file, signedRequest, url) {
	// showWait()
	// currentVue = this

	fetch(signedRequest, {
		method: 'PUT',
		mode: 'cors',
		body: file
	})
		.then(function(response) {
			// projectsVue.selectedProject.images.push(file)
			projectsVue.selectedProject.images.push(url)
		})
		.catch(function(error) {
			M.toast({ html: 'Error occured! Check console for details.' })
			console.error(error)
		})
		.then(function() {
			// hideWait()
		})
}

const getSignedRequest = function(file) {
	// console.log(file)

	fetch(`/api/project/sign-s3/put?fileName=${file.name}&fileType=${file.type}`)
		.then(function(response) {
			return response.json()
		})
		.then(function(data) {
			console.log(data)
			uploadFile(file, data.signedRequest, data.url)
		})
		.catch(function(error) {
			M.toast({ html: 'Error occured! Check console for details.' })
			console.error(error)
		})
}
const onFileUpload = function() {
	let file = document.querySelector('#project-image').files[0]
	// console.log(file)
	if (file == null) return alert('No file selected.')
	getSignedRequest(file)
}
