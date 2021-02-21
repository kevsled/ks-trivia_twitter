//BUG: nav bar with values 10+ wont work since it requires pressing two keys. only handles one key press at a time currently.

//tweets is defined in seperate script and added in the index.html header before this script
let g_index = 0; //global index of the current slide (or previous slide if in the middle of changing slides)
let showAnswer = false; //boolean to determine whether to show the name in text (true) or underscores (false)
let navArray = ['h', 'e']; //corresponds to key presses (home, example, question 1, question 2, ...)
let tweets = [{}];  //array is populated from a json file through a fetch command
let tweetFile = './Literary Tweets 2/Trivia - Literary Tweets 2.json'

//fetches the json file containing all the trivia tweets then adds event listener to load the tweet-box
fetch(tweetFile)
.then(response => {
    if(!response.ok) {
        throw new Error("Http error " + response.status);
    }
    return response.json();
})
.then(json => {
    tweets = json.tweets;
    for (let i = 1; i < tweets.length - 1; i++) {
        navArray.push(i.toString());
    }

    // There's got to be a better solution to this race condition
    // I fear it still may fail once in a blue moon
    // the page may send "load" signal before executing the 'load' addEventListener...then it won't get called (i think?)
    if(document.readyState === 'loading') {
        window.addEventListener("load", loadMe);
    }
    else {
        loadMe();
    }
})
.catch(function() {
    this.dataError = true;
})

// Tweet box is initially clear (css opacity:0). This adds the first tweet and fades in the tweet box
function loadMe() {
    let element = document.querySelector("#tweet-box");
    let timeDelay = 500;
    element.animate([{opacity:0},{opacity: 1}], {duration: timeDelay, delay: timeDelay/8, fill: "forwards"});
    changeTweet(g_index);
    initListeners();
    document.addEventListener("keydown", handleKeyPress);
};

// Redirects keyboard events to the appropriate functions
function handleKeyPress(event) {
    let index = g_index;
    let navIndex = navArray.findIndex((elem) => elem == event.key);

    if(!event.ctrlKey && !event.altKey) {

        // handles key presses that aren't in navArray
        switch (event.key) {
            case "ArrowLeft": if(g_index != 0) { index--; showTweet(index) }; break;
            case "ArrowRight": if(g_index != tweets.length - 1) { index++; showTweet(index) }; break;
            case "Home": if(g_index != 0) { index = 0; showTweet(index) }; break;
            case "End": if(g_index != tweets.length - 1) { index = tweets.length - 1; showTweet(index) }; break;
            case "A": 
            case "a": toggleAnswer(); break;
            default: break;
        }

        // handles key presses that are in navArray
        // only accounts for one key press at a time so numbers 10+ won't work
        if(navIndex != -1) {
            if(g_index != navIndex) {
                index = navIndex;
                showTweet(index);
            }
        }
    }
};

/* Redirects mouse clicks to the appropriate functions */
function handleClick(event) {
    event.preventDefault();

    // determine the index of the next slide
    let index = event.target.attributes.value.value;
    let navIndex = navArray.findIndex((elem) => elem == index);

    switch (index) {
        case "prev":  if(g_index > 0) {index = g_index - 1;}
                    else {index = 0};
                    break;
        case "next":  if(g_index < tweets.length - 1) {index = g_index + 1;}
                    else {index = tweets.length - 1};
                    break;
        default: index = navIndex; break;        
    }

    showTweet(index);
};

/* Handles the nav-bar listeners and display, animates the #tweet-box, and calls 'changeTweet()' */
function showTweet(index) {

    // adjust functionality and display of navigation bar
    addListener();
    removeListener(index);
    toggleNavLink(index);

    // animation and call to change the tweet contents
    let timeDelay = 1000;
    let element = document.querySelector("#tweet-box");
    let direction1 = ((index < g_index) ? 'translateX(2000px)' : 'translateX(-2000px)');
    let direction2 = ((index < g_index) ? 'translateX(-2000px)' : 'translateX(2000px)');
   
    element.animate([{transform: 'translateX(0px)'}, {transform: direction1}], {duration: timeDelay/2, fill: "forwards"});
    setTimeout(() => {
        changeTweet(index);
    }, timeDelay/2.1);
    element.animate([{transform: direction2}, {transform: 'translateX(0px)'}], {delay: timeDelay/2, duration: timeDelay/2, fill: "forwards"});

    // updates g_index to the new current slide
    g_index = index;
};

// Updates all the fields so a new tweet is visible, should be paired with some animation
function changeTweet(index) {
    let tweet = tweets[index];
    document.querySelector("#tweet-avatar").src = tweet["tweet-avatar"];
    if (index == 0) {
        document.querySelector("#tweet-name").innerText = tweet["tweet-name"];
        document.querySelector("#tweet-name").style.color = 'var(--quaternary-color)';
    } else { 
        dispTweetName(tweet["tweet-name"]);
    }
    document.querySelector("#tweet-handler").innerText = tweet["tweet-handler"];
    document.querySelector("#tweet-quote").innerText = tweet["tweet-quote"];
    document.querySelector("#tweet-hashtags").innerText = tweet["tweet-hashtags"];
    document.querySelector("#tweet-time").innerText = tweet["tweet-time"];
    document.querySelector("#tweet-date").innerText = tweet["tweet-date"];
    document.querySelector("#tweet-device").innerText = tweet["tweet-device"];
    document.querySelector("#tweet-retweets").innerText = tweet["tweet-retweets"];
    document.querySelector("#tweet-likes").innerText = tweet["tweet-likes"];
};

// gets called when the twitter logo is clicked. Changes #tweet-name underscores to their actual names (i.e. reveals the answers)
function toggleAnswer() {
    let tweetName = tweets[g_index]["tweet-name"];
    showAnswer = !showAnswer;
    if(g_index !=0) { dispTweetName(tweetName); }
    if(showAnswer) {
        document.querySelector("#twitter-eye").style.opacity = 1;
        if (g_index != 0) { document.querySelector("#tweet-name").style.color = 'var(--quaternary-color)'; }
    }
    else {
        document.querySelector("#twitter-eye").style.opacity = 0;
        if (g_index != 0) { document.querySelector("#tweet-name").style.color = 'var(--tertiary-color)'; }
    }
}

// Adds event listers to the navigation bar and twitter logo for it's initial state, ('home' and '<' are grayed out)
function initListeners() {
    document.querySelector("a[value='next']").addEventListener('click', handleClick);
    for(let index = 1; index < tweets.length; index++) {
        document.querySelector("a[value='" + navArray[index] + "']").addEventListener('click', handleClick);
    }
    document.querySelector("#twitter-logo").addEventListener('click', toggleAnswer);
};

// Adds event listers for old slide when user navigates to a different slide
function addListener() {
    document.querySelector("a[value='" + navArray[g_index] + "']").addEventListener('click', handleClick);
    if(g_index == 0){
        document.querySelector("a[value='prev']").addEventListener('click', handleClick);
    } else if (g_index == tweets.length - 1) {
        document.querySelector("a[value='next']").addEventListener('click', handleClick);        
    }
}

// Removes event listeners for new slide when user navigates to a different slide
function removeListener(index) {
    document.querySelector("a[value='" + navArray[index] + "']").removeEventListener('click', handleClick);
    if(index == 0){
        document.querySelector("a[value='prev']").removeEventListener('click', handleClick);
    } else if (index == tweets.length - 1) {
        document.querySelector("a[value='next']").removeEventListener('click', handleClick);        
    }
}

// Grays out numbers on nav bar for the current slide (has to be a better way to do this)
function toggleNavLink(index) {
    document.querySelector("a[value='" + navArray[index] + "']").classList.remove("nav-link");
    document.querySelector("a[value='" + navArray[index] + "']").classList.add("nav-disabled");
    document.querySelector("a[value='" + navArray[g_index] + "']").classList.remove("nav-disabled");
    document.querySelector("a[value='" + navArray[g_index] + "']").classList.add("nav-link");

    if(index == 0) {
        document.querySelector("a[value='prev']").classList.remove("nav-link");
        document.querySelector("a[value='prev']").classList.add("nav-disabled");
    } else if (index == tweets.length - 1) {
        document.querySelector("a[value='next']").classList.remove("nav-link");
        document.querySelector("a[value='next']").classList.add("nav-disabled");
    }

    if(g_index == 0) {
        document.querySelector("a[value='prev']").classList.remove("nav-disabled");
        document.querySelector("a[value='prev']").classList.add("nav-link");
    } else if (g_index == tweets.length - 1) {
        document.querySelector("a[value='next']").classList.remove("nav-disabled");
        document.querySelector("a[value='next']").classList.add("nav-link");
    }
}

// displays the tweet name with underscores. When hidden, text color is changed to the #tweet-box
// background (--tertiary-color) color and replaced with '-'. The '-' preserves the height of each element.
function dispTweetName(tweetName) {
    let element = document.querySelector("#tweet-name");
    if (!showAnswer) {element.style.color = 'var(--tertiary-color)';}
    element.innerHTML = "";

    let words = tweetName.split(' ');

    for (let i = 0; i < words.length; i++) {
        let wordNode = document.createElement('div');
        wordNode.style.cssText = "display: flex;";

        let nodeSpaces = document.createElement('div');
        nodeSpaces.style.width = '1.2em';

        let letters = words[i].split('');

        for (let j = 0; j < letters.length; j++) {

            let node = document.createElement('div');
            if (showAnswer) { node.innerText = letters[j]; }
            else { node.innerText = '-'; }

            //style letter node
            if(letters[j] != ' ') {node.style.borderBottom = '2px solid var(--quaternary-color)'};
            node.style.width = '0.8em';
            node.style.textAlign = 'center';

            let nodeSpace = document.createElement('div');
            if(j != letters.length - 1) { nodeSpace.style.width = '0.3em'; }

            wordNode.appendChild(node);
            wordNode.appendChild(nodeSpace);
        };
        element.appendChild(wordNode);
        if(i != words.length - 1) { element.appendChild(nodeSpaces); }
    };
};
