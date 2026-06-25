
var userDetails;

var wrapper;


function search(){
    const search_term = document.getElementById('search-field').value

    if (search_term === ""){
        document.getElementById('tweets-here').style.display = 'block'
        document.getElementById('search-results').style.display = 'none'
        return
        // document.getElementById('search-results')
    }

    const url = `/accounts/api/search/${search_term}`
    fetch(url)
        .then((resp) => resp.json())
        .then(function (data) {
            const results = data.results
            if (results){
                document.getElementById('tweets-here').style.display = 'none'
                document.getElementById('search-results').style.display = 'block'
                document.getElementById('search-results').innerHTML = ""
                for (var i = 0; i< results.length; i++) {
                    const url = `/accounts/profile/${results[i][1]}`
                    document.getElementById('search-results').innerHTML += `
                        <div><a href=${url}>
                            <div>${results[i][0]}</div>
                            <hr>
                            <br>
                        </div>        
                        `
                }

            } else {
                document.getElementById('search-results').innerHTML = 'No Search Results'

            }
        })
}

async function stack(all=true, pk=null, load_feed=true, load_profile_bool=false){
    wrapper = document.getElementById("tweets-here");
    await get_user()
    if (all) {
        await load_tweets();
    }
    else if (pk === null){
        await load_tweets(all=false, pk, load_feed, load_profile_bool)
    } else {
        await load_tweets(all=false, pk, load_feed, load_profile_bool)
    }
}

var loadFile = function (event) {
    var image = document.getElementById('output');
    image.src = URL.createObjectURL(event.target.files[0]);
    var reset_Btn = document.getElementById("image-reset");

    reset_Btn.innerHTML = `<button type="button" onclick="reset_img()" class="btn btn-danger">Remove Image</button>`
};

function reset_img() {
    const form_elements = document.getElementById('tweet-create-form').elements;
    form_elements[2].value="";

    document.getElementById("output").src = ""

    document.getElementById("output").innerHTML = `
        <img id="output" width="200" disabled="disabled" class="hidden" alt="Selected Image"/>`
    const reset_Btn = document.getElementById("image-reset");
    reset_Btn.innerHTML = ``
}

function getRetweetElm(obj) {

    if (get_is_retweet(obj)){

        const date_time_created = obj.parent_serialized.date_created.split('T')
        const date_created = date_time_created[0]
        const time_created = date_time_created[1].split('.')[0]

        var imgElmRe;
        if (obj.parent_serialized.img != null) {
            imgElmRe = (`
                    <div>
                        <img src="${obj.parent_serialized.img}" height="80%" width="80%" alt="Retweeted Image">
                    </div>
                `)
        } else {
            imgElmRe = '<div disabled="disabled"></div>'
        }

        return `
                <div class='container'>
                    <div class='col-md-8 col-sm-12 mx-auto border rounded py-3 mb-4'>
                        <div>
                               <small><a href="/accounts/profile/${obj.parent_serialized.owner_id}">${obj.parent_serialized.owner_name}</a></small>

                                <span style="margin-left: 60%">
                                    <small>${date_created}  ${time_created}</small>
                                </span>
                        </div>
                        <div class="container retwtcls">
                            ${obj.parent_serialized.content}
                        </div>
                        <div>
                                ${imgElmRe}
                        </div>
                    </div>
                </div>
            `
    }
    else {
        return `<div disabled="disabled"></div>`
    }
}

function retweetBtn(tweetID, retweet_count) {
    if (usrStat !== 403) {
        if (!retweet_count){
            retweet_count = 0
        }
        return (
            `
            <div>
                <a href="/tweets/${tweetID}/retweet"><button class="btn btn-success" style="padding-left: 3px;margin-left: 3px">Retweet</button></a>
                <div style="margin-left: 7%">
                    <small>${retweet_count} retweets</small>
                </div>
            </div>
            `
        )
    }else {
        return `<div disabled="disabled"></div>`
    }
}

function button_generator(tweet_id, likes_count, to_do) {
    var new_btn;
    if (!likes_count){
        likes_count = 0
    }
    if (usrStat === 403){
        return (`
                 <div>
                    <button class="btn btn-primary" onclick="$('#modalLRForm').modal('show')">Login</button>
                 </div>
                    `)
    }


    else if (to_do === "unlike") {
        new_btn = `
                   <div id="tweet-${tweet_id}">
                       <button class="btn btn-danger" id=${tweet_id} onclick="action(${tweet_id},${likes_count}, 'unlike')">Unlike</button>
                       <div>
                           <small>${likes_count} likes</small>
                       </div>
                   </div>
                   `
    }else if (to_do === "like"){
        new_btn = `
                   <div id="tweet-${tweet_id}">
                       <button class="btn" style="background-color: aquamarine" id=${tweet_id} onclick="action(${tweet_id}, ${likes_count}, 'like')">Like</button>
                       <div>
                           <small>${likes_count} Likes</small>
                       </div>
                   </div>
                  `
    }
    return new_btn;
}

function if_liked(tweet_obj) {
    return tweet_obj.is_liked
}

async function action(tweet_id, likes_count, action){
    document.getElementById("tweet-" + tweet_id).innerHTML = `
                        <div id="tweet-${tweet_id}">
                            <button class="btn" id=${tweet_id}>.....</button>
                        </div>
                        `
    var tempBtn
    const csrftoken = getCookie('csrftoken')
    const options = {
        method : 'POST',
        headers:{
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken
        },
        body: JSON.stringify({
            id:tweet_id,
            action: action,
        })
    }
    let resp1 = await fetch(`/api/action`, options)
    let status = await resp1.json()
    const server_response = status.message

    if (server_response === "liked")
    {
        likes_count+=1
        tempBtn = button_generator(tweet_id, likes_count, 'unlike')
        var element = document.getElementById("tweet-" + tweet_id)
        element.innerHTML = tempBtn
    }else if (server_response === "like deleted")
    {
        likes_count-=1
        tempBtn = button_generator(tweet_id, likes_count, 'like')
        var element = document.getElementById("tweet-" + tweet_id)
        element.innerHTML = tempBtn
    }
}

async function get_user() {
    const url = "/accounts/usrinfo"
    let resp1 = await fetch(url);
    userDetails = resp1
    usrStat = resp1.status
}

function get_imgElm(obj) {
    if (obj.img != null) {
        return (`
                        <div>
                            <img src="${obj.img}" height="80%" width="80%" style="margin-bottom: 1%; margin-top: 0.3%" alt="tweeted image">
                        </div>
                    `)
    } else {
        return '<div disabled="disabled"></div>'
    }
}


function gen_btnElm(obj) {
    let btnElm;
    if (if_liked(obj)) {
        btnElm = button_generator(obj.id, obj.likes_count, 'unlike')
    } else {
        btnElm = button_generator(obj.id, obj.likes_count, 'like')
    }
    return btnElm
}

function get_is_retweet(obj){
    return obj.parent_serialized != null;
}

function load_tweets(all=false, pk=null, load_feed=true, load_profile_bool=false) {
    if (!all && load_feed && pk===null) {

        if (usrStat !== 403){
        document.getElementById('tweets-here').innerHTML = 'Loading......'
        document.getElementById('feed-global').innerHTML = '<div class="dropdown-item"  onclick="load_tweets(false, null, false)">Global</div>'
        }

        const url = "/tweets_api"
        fetch(url)
            .then((resp) => resp.json())
            .then(function get_data(data) {


                wrapper.innerHTML = ""
                for (let i = 0; i < data.length; i++) {
                    let retweetElm = getRetweetElm(data[i])
                    const btnElm = gen_btnElm(data[i])
                    const imgElm = get_imgElm(data[i])
                    const item = format_tweet(data[i], imgElm, retweetElm, btnElm)
                    wrapper.innerHTML += item
                }
            })

    }

    else if (!all && load_profile_bool){
        load_profile(pk);
    }
    else if (!load_feed && !all){

                const url = "/tweets_api/global"
        fetch(url)
            .then((resp) => resp.json())
            .then(function get_data(data) {

                wrapper.innerHTML = ""
                for (let i = 0; i < data.length; i++) {
                    let retweetElm = getRetweetElm(data[i])
                    const btnElm = gen_btnElm(data[i])
                    const imgElm = get_imgElm(data[i])
                    const item = format_tweet(data[i], imgElm, retweetElm, btnElm)
                    wrapper.innerHTML += item
                }
            }

            )

        document.getElementById('tweets-here').innerHTML = 'Loading......'
        document.getElementById('feed-global').innerHTML = '<div class="dropdown-item" id="feed-global" onclick="load_tweets(false, null, true,true)">Feed</div>'
    }
}

function format_tweet(obj, imgElm, retweetElm, btnElm){

    const date_time_created = obj.date_created.split('T')
    const date_created = date_time_created[0]
    const time_created = date_time_created[1].split('.')[0]



    return `                    
                    <div class='container'>
                        <div class='col-md-8 col-sm-12 mx-auto rounded py-3 mb-4'>
                            <div>
                               <small><a href="/accounts/profile/${obj.owner_id}">${obj.owner_name}</a></small>
                                <span style="margin-left: 70%">
                                    <small>${date_created}  ${time_created}</small>
                                </span>
                            </div>
                            <div class="container">
                                ${obj.content}
                            </div>
                                <br>
                                <div class="container">
                                    ${imgElm}
                                </div>
                            <div style="align-items: flex-start">
                                ${retweetElm}
                            </div>
                            <div style="padding-bottom: 1px">
                                <div class="btn-group">${btnElm}${retweetBtn(obj.id, obj.retweet_count)}</div>
                            </div>
                        </div>
                    <hr>
                    </div>    
                `
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