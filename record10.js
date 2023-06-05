	
	let inputSize = 512
	let scoreThreshold = 0.5

  let labeledDescriptors = null
  let faceMatcher = null

  const candidates = {
    patrick: [],
    simon: [],
    emmanuel: []
  }

  const selectedCandidate = document.getElementById('candidates').value

  function handleLogin() {
    let username = document.getElementById("username_field").value;
    let password = document.getElementById("password_field").value;

    const allowedUsers = ["nwankeze.david@cu.edu.ng", "registrar@cu.edu.ng", "vc@cu.edu.ng", "chancellor@cu.edu.ng"]

    if (allowedUsers.includes(username)) {
      localStorage.setItem("user", JSON.stringify({
        username,
        password
      }));

      // close login form
      document.querySelector(".form-wrapper").remove();
  
      Swal.fire({
        icon: 'success',
        title: 'Authentication Success',
        text: `Logged in as ${username}`,
      }).then(result => {
        // update auth display status
        let authBarDiv = document.querySelector(".auth-bar");

        if (authBarDiv) {
          // update the inner HTML to reflect currently authenticated user
          authBar.innerHTML = `
            <p>Signed In as: ${username}</p>
            <button class="logout-btn" onclick="handleLogout()"><i class="fa fa-sign-out-alt fa-2x"></i></button>
          `;
        } else {
          // create auth bar and append it to header content div
          let headerContentDiv = document.querySelector(".header-content");
          let authBar = document.createElement("div");
          authBar.className = "auth-bar";
          authBar.innerHTML = `
            <p>Signed In as: ${username}</p>
            <button class="logout-btn" onclick="handleLogout()"><i class="fa fa-sign-out-alt fa-2x"></i></button>
          `;
          headerContentDiv.appendChild(authBar);
        }

        

        // move on to enroll toast
        Swal.fire({
          title: 'Enroll New Face',
          text: "Please be ready in front of camera. You would need to make some face expressions to enroll. Do not worry, we do not save your data anywhere other than your browser storage.",
          icon: 'info',
          showCancelButton: true,
          // confirmButtonColor: '#3085d6',
          // cancelButtonColor: '#d33',
          confirmButtonText: "I am Ready"
        }).then((result) => {
          if (result.value) {
            location.href = '/enroll'
          }
        });
      });
    } else { // when username is not valid
      Swal.fire({
        icon: 'error',
        title: 'Authentication Failed',
        text: 'Account not valid or incorrect password!',
      });
    }
  }

	function getCurrentFaceDetectionNet() {
	    return faceapi.nets.tinyFaceDetector
	}

	function isFaceDetectionModelLoaded() {
	  return !!getCurrentFaceDetectionNet().params
	}

	function getFaceDetectorOptions() {
	  return new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
	}
	
	function hasEnrollmentData() {
      return db.get('enrollment').value().length > 0
    } 

    function clearAttendance() {
    	db.set('attendance', []).write()
    }

    function clearUsers() {
      db.set('enrollment', []).write()
      location.href = '/'
    }

    function enrollUser() {
      if (localStorage.getItem("user")) {
        Swal.fire({
          title: 'Enroll New Face',
          text: "Please be ready in front of camera. You would need to make some face expressions to enroll. Do not worry, we do not save your data anywhere other than your browser storage.",
          icon: 'info',
          showCancelButton: true,
          // confirmButtonColor: '#3085d6',
          // cancelButtonColor: '#d33',
          confirmButtonText: "I am Ready"
        }).then((result) => {
          if (result.value) {
            location.href = '/enroll'
          }
        });
      } else {
        console.error("Not authenticated");
        let candidates_container = document.querySelector(".candidates");

        let loginPage = document.createElement("div");
        loginPage.className = "form-wrapper";
        loginPage.innerHTML = 
        `<form action="" onsubmit="event.preventDefault();" class="login-form">
          <div class="form-sect">
            <h1>Attendance System | Login</h1>
          </div>
          <div class="form-sect">
              <input type="text" id="username_field" class="form-input" placeholder="Username" />
          </div>
          <div class="form-sect">
              <input type="password" id="password_field" class="form-input" placeholder="Password" />
          </div>
          <button class="login-button" onclick="handleLogin()">Submit</button>
        </form>`;

        // video_container.insertBefore(loginPage, candidates_container);
        candidates_container.insertAdjacentElement("beforebegin", loginPage);
      }
    }

    if (hasEnrollmentData()) {

    	// somehow 'descriptors' property is converted to object after saved to lowdb
    	// e.g {0: 10, 1: 20, 2: 30} instead of [10, 20, 30]
		labeledDescriptors = db.get('enrollment').value().map(function(ld) { return {label: ld.label, descriptors: ld.descriptors.map(function(d) { return Object.values(d) } )} })

		faceMatcher = faceapi.FaceMatcher.fromJSON({
			distanceThreshold: 0.6, // not sure what is this for
			labeledDescriptors: labeledDescriptors
		})

    }

    document.addEventListener('attendance_detected', (e) => {
      if(selectedCandidate == 'Patrick'){
        if(!candidates.patrick.includes(e.detail) 
        && !candidates.simon.includes(e.detail) && !candidates.emmanuel.includes(e.detail)) {
          candidates.patrick.push(e.detail)
          console.log(candidates)
        } else {
          console.log(`${e.detail} has voted already`)
          new PNotify({
            type: 'error',
            text: `${e.detail} has voted already`
          })
        }
      }
      else if(selectedCandidate == 'Simon'){
        if(!candidates.simon.includes(e.detail) 
        && !candidates.patrick.includes(e.detail) && !candidates.emmanuel.includes(e.detail)) {
          candidates.simon.push(e.detail)
          console.log(candidates)
        } else {
          console.log(`${e.detail} has voted already`)
          new PNotify({
            type: 'error',
            text: `${e.detail} has voted already`
          })
        }
      } else {
        if(!candidates.simon.includes(e.detail)
        && !candidates.patrick.includes(e.detail) && !candidates.emmanuel.includes(e.detail)) {
          candidates.emmanuel.push(e.detail)
          console.log(candidates)
        } else {
          console.log(`${e.detail} has voted already`)
          new PNotify({
            type: 'error',
            text: `${e.detail} has voted already`
          })
        }
      }

      if (db.get('attendance').filter({name: e.detail}).value().length == 0) {

        const name = e.detail
        const time = Date.now()

        new PNotify({
        	type: 'success',
        	text: name + ' is here!'
        })

        db.get('attendance').push({name, time}).write()
      }
    })

    async function onPlay() {
      const videoEl = $('#inputVideo').get(0)

      if(videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded())
        return setTimeout(() => onPlay())

      const options = getFaceDetectorOptions()

      const results = await faceapi.detectAllFaces(videoEl, options).withFaceLandmarks()
        .withFaceDescriptors()

      const canvas = $('#overlay').get(0)

      if (results) {

        const dims = faceapi.matchDimensions(canvas, videoEl, true)

        const resizedResults = faceapi.resizeResults(results, dims)

        resizedResults.forEach(({ detection, descriptor }) => {

          let label = 'unknown'
          let boxColor = 'red'

          if (faceMatcher !== null) {
            label = faceMatcher.findBestMatch(descriptor).label
            if (label !== 'unknown') {
              boxColor = 'green'
              document.dispatchEvent(new CustomEvent('attendance_detected', {detail: label}))
            }
          }

          // draw detection box
          const options = { label, boxColor }
          const drawBox = new faceapi.draw.DrawBox(detection.box, options)
          drawBox.draw(canvas)
        })

      } else {
        // clear drawings when no detection
        const context = canvas.getContext('2d')

        context.clearRect(0, 0, canvas.width, canvas.height)
      }

      setTimeout(() => onPlay())
    }

    async function run() {
    	// load face detection and face expression recognition models
    	if (!isFaceDetectionModelLoaded()) {
			await getCurrentFaceDetectionNet().load('/')
		}
		await faceapi.loadFaceLandmarkModel('/')
		await faceapi.loadFaceRecognitionModel('/')

		// try to access users webcam and stream the images
		// to the video element
		const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
		const videoEl = $('#inputVideo').get(0)
		videoEl.srcObject = stream
    }

    $(document).ready(function() {
    	run()
    })