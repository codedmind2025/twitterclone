function generate_f_unf_btn(follow_status, usr_id) {
    if (usrStat !== 403) {
        if (follow_status == null) {
            return "<div></div>"}
        else if (follow_status === true) {
            return `<div id="f-unf-btn-${usr_id}"><button class="btn btn-danger btn-danger-cstm" style="z-index: 1; position: absolute; left: 30vmin" onclick="profile_action('unfollow', ${usr_id})">Unfollow</button></div>`
        } else {
            return `<div id="f-unf-btn-${usr_id}"><button class="btn btn-primary" style="z-index: 1; position: absolute; left: 30vmin" onclick="profile_action('follow', ${usr_id})" >Follow</button></div>`
        }
    }
            return `<div ><button class="btn btn-primary" style="z-index: 1; position: absolute; left: 30vmin" onclick="$('#modalLRForm').modal('show')" >Follow</button></div>`

}

async function profile_action(action, usr_id){

    document.getElementById("f-unf-btn-"+usr_id).innerHTML = `<div><button class="btn"></button></div>`

    const url = '/accounts/profile/action'
    const csrf_token = getCookie('csrftoken')
    options = {
        method : 'POST',
        headers : {
            "Content-Type": "application/json",
            "X-CSRFToken": csrf_token
        },
        body: JSON.stringify({
            usr_id:usr_id,
            action: action,
        })
    }
    let resp1 = await fetch(url, options)
    let resp = await resp1.json()

    if ((resp1.status === 200) && (action === "follow")){
        document.getElementById("f-unf-btn-"+usr_id).innerHTML = generate_f_unf_btn(true, usr_id)
    } else if (resp1.status === 200 && resp.message === "you are no longer a follower"){
            document.getElementById("f-unf-btn-"+usr_id).innerHTML = generate_f_unf_btn(false, usr_id)
    } else {
        alert(resp.message)
    }
}


function load_profile(pk=null) {
    let url
    if (pk === null) {
        url = '/accounts/api/profile'
    } else {
        url = `/accounts/api/profile/${pk}`
    }
    fetch(url)
        .then((resp) => resp.json())
        .then(function get_data(data) {

                const all_tweets = data.all_tweets
                wrapper.innerHTML = ""
                for (let i = 0; i < all_tweets.length; i++) {
                    let retweetElm = getRetweetElm(all_tweets[i])
                    const btnElm = gen_btnElm(all_tweets[i])
                    const imgElm = get_imgElm(all_tweets[i])
                    const item = format_tweet(all_tweets[i], imgElm, retweetElm, btnElm)
                    wrapper.innerHTML += item
                }

                document.getElementById('usr-bio').innerText = data.bio
                const banner_img_url = data.banner_img
                const prof_img_url = data.prof_img

                if (banner_img_url) {
                    document.getElementById('output-banner-img').src = banner_img_url
                }
                if (prof_img_url) {
                    document.getElementById('output-prof-img').src = prof_img_url
                }
                document.getElementById('btn-here').innerHTML = generate_f_unf_btn(data.is_following ,pk)

                document.getElementById('first_name').innerText = data.prof_user.first_name
                document.getElementById('last_name').innerText = data.prof_user.last_name
                document.getElementById('followers-count').innerText = data.followers + " followers"
                document.getElementById('following-count').innerText = data.following + " following"
            }
        )
}