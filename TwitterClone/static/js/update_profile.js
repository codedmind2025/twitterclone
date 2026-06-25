var remove_banner = 0, remove_avatar = 0, change_banner=0, change_avatar=0

function rem_av() {
    document.getElementById('remove-prof-img').style.display = 'none'
    document.getElementById('output-prof-img').src = "https://www.w3schools.com/w3images/avatar2.png"
    document.getElementById('prof-img').value = ""
    remove_avatar = 1
}

function rem_ban() {
    remove_banner = 1
    document.getElementById('remove-banner-img').style.display = 'none'
    document.getElementById('output-banner-img').src = "https://adhyatmik.in/wp-content/uploads/2019/02/Background-Header-1.jpg"
    document.getElementById('banner-img').value = ""
}

async function getProfDetails() {
    let resp1 = await fetch('/accounts/prof_update')
    resp1 = await resp1.json()

    document.getElementById('usr-bio').innerText = resp1.bio

    if (resp1.prof_img) {
        document.getElementById('remove-prof-img').style.display = 'inline'
        document.getElementById('output-prof-img').style.display = 'block'
        document.getElementById('output-prof-img').src = resp1.prof_img
    }
    if (resp1.banner_img) {
        document.getElementById('remove-banner-img').style.display = 'inline'
        document.getElementById('output-banner-img').style.display = 'block'
        document.getElementById('output-banner-img').src = resp1.banner_img
    }

}

function load_av() {
    var prof_img = document.getElementById('prof-img').files[0]
    document.getElementById('output-prof-img').src = URL.createObjectURL(prof_img)
    document.getElementById('output-prof-img').style.display = 'block'
    document.getElementById('remove-prof-img').style.display = 'inline'
    change_avatar = 1
}

function load_banner() {
    var banner_img = document.getElementById('banner-img').files[0]
    document.getElementById('output-banner-img').src = URL.createObjectURL(banner_img)
    document.getElementById('output-banner-img').style.display = 'block'
    document.getElementById('remove-banner-img').style.display = 'inline'
    change_banner = 1
}

getProfDetails()
getUsrDetails()

var formdata = new FormData()
var form = document.getElementById('my-frm')
form.addEventListener('submit', submit_from)

async function getUsrDetails() {
    let resp1 = await fetch('/accounts/usrinfo')
    resp1 = await resp1.json()
    document.getElementById('first_name').value = resp1.first_name
    document.getElementById('last_name').value = resp1.last_name

}

async function submit_from(event) {
    event.preventDefault()
    const btn = document.getElementById('prof-update-btn')
    var prof_img = document.getElementById('prof-img').files[0]
    var banner_img = document.getElementById('banner-img').files[0]

    btn.disabled = true
    if (remove_avatar === 1) {
        formdata.append('prof_img', '')
    } else if (prof_img && change_avatar === 1) {
        formdata.append('prof_img', prof_img)
    }

    if (remove_banner === 1) {
        formdata.append('banner_img', '')
    } else if (banner_img && change_banner === 1) {
        formdata.append('banner_img', banner_img)
    }

    formdata.append('first_name',    document.getElementById('first_name').value)
    formdata.append('last_name',     document.getElementById('last_name').value)


    const options = {
        method: 'POST',
        headers: {
            "X-CSRFToken": getCookie('csrftoken')
        },
        body: formdata
    }

    formdata.append('bio', document.getElementById('usr-bio').value)

    let resp = await fetch('/accounts/prof_update', options)
    if (resp.status === 200){
        alert('saved')
    }else {
        alert('error occured')
    }
    btn.disabled = false
}


function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}