
// DATA LINKS
const domainRulesLink =
"https://muhammadtaqi512q-oss.github.io/.mt/domains";

const websitesDataLink =
"https://muhammadtaqi512q-oss.github.io/.mt/data";

// STORAGE
let websiteDB = [];

let rankingRules = {

    p1:[],
    p2:[],
    p3:[]

};

// ELEMENTS
const input =
document.getElementById("search-input");

const container =
document.getElementById("results-container");

const statusDiv =
document.getElementById("engine-status");

const profileIcon =
document.querySelector(".profile-icon");

// INIT ENGINE
async function initEngine(){

    try{

        // FETCH RULES
        const ruleRes =
        await fetch(domainRulesLink);

        const ruleHtml =
        await ruleRes.text();

        const ruleDoc =
        new DOMParser()
        .parseFromString(ruleHtml,"text/html");

        const ruleText =
        ruleDoc
        .getElementById("target-link")
        .innerText
        .toLowerCase();

        rankingRules.p1 =
        ruleText.match(
            /p1:\s*includes\s*(.*?)(?=\s*p2|$)/
        )?.[1]
        ?.split(",")
        .map(s=>s.trim().replace(".",""))
        || [];

        rankingRules.p2 =
        ruleText.match(
            /p2:\s*includes\s*(.*?)(?=\s*p3|$)/
        )?.[1]
        ?.split(",")
        .map(s=>s.trim().replace(".",""))
        || [];

        rankingRules.p3 =
        ruleText.match(
            /p3:\s*includes\s*(.*?)(?=\.|$)/
        )?.[1]
        ?.split(",")
        .map(s=>s.trim().replace(".",""))
        || [];

        // FETCH DATA
        const webRes =
        await fetch(websitesDataLink);

        const webHtml =
        await webRes.text();

        const webDoc =
        new DOMParser()
        .parseFromString(webHtml,"text/html");

        const webParas =
        webDoc.querySelectorAll("p");

        webParas.forEach(p=>{

            const txt =
            p.innerText;

            const n =
            txt.match(
                /NAME\s+(.*?)\s+LINK/
            )?.[1]?.trim();

            const l =
            txt.match(
                /LINK\s+(.*?)\s+SOURCE/
            )?.[1]?.trim();

            const s =
            txt.match(
                /SOURCE\s+(.*)/
            )?.[1]?.trim();

            if(n && l && s){

                websiteDB.push({

                    name:n,
                    display:l,
                    source:s

                });

            }

        });

        statusDiv.innerText =
        "Nexura Core Engine Linked";

        setTimeout(()=>{

            statusDiv.style.display =
            "none";

        },2000);

        input.disabled = false;

        input.focus();

        // HASH OPEN
        openFromHash();

        // SHOW ALL IF NO HASH
        if(!location.hash){

            render(websiteDB);

        }

    }

    catch(e){

        console.log(e);

        statusDiv.innerText =
        "Engine Failed";

        statusDiv.style.color =
        "red";

    }

}

// PRIORITY
function getPriorityScore(url){

    const link =
    url.toLowerCase();

    const parts =
    link.split(".");

    const ext =
    parts[parts.length - 1];

    const isSub =

    (
        parts[0] !== "www"
        &&
        parts[0] !== "mmm"
        &&
        parts.length > 2
    );

    if(
        rankingRules.p1.includes(ext)
    ){
        return isSub ? 1.5 : 1;
    }

    if(
        rankingRules.p2.includes(ext)
    ){
        return isSub ? 2.5 : 2;
    }

    if(
        rankingRules.p3.includes(ext)
    ){
        return isSub ? 3.5 : 3;
    }

    return 10;

}

// SEARCH
input.addEventListener("input",()=>{

    const query =
    input.value
    .toLowerCase()
    .trim();

    // EMPTY
    if(!query){

        if(location.hash){

            openFromHash();

        }

        else{

            render(websiteDB);

        }

        return;

    }

    // FILTER
    const filtered =
    websiteDB.filter(i=>

        i.name
        .toLowerCase()
        .includes(query)

        ||

        i.display
        .toLowerCase()
        .includes(query)

    );

    // SORT
    filtered.sort(
        (a,b)=>

        getPriorityScore(a.display)

        -

        getPriorityScore(b.display)
    );

    render(filtered);

});

// RENDER
function render(data){

    container.innerHTML = "";

    if(data.length === 0){

        container.style.display =
        "none";

        return;

    }

    container.style.display =
    "block";

    data.forEach(item=>{

        const score =
        getPriorityScore(item.display);

        const card =
        document.createElement("div");

        card.className =
        "result-card";

        card.innerHTML = `

            <span class="res-url">
                ${item.display}
            </span>

            <div class="res-title">
                ${item.name}
            </div>

            <span class="rank-badge">
                P${Math.floor(score)}
            </span>

            <button class="share-btn">
                Share
            </button>

        `;

        // CLICK PROFILE
        card.querySelector(
            ".res-title"
        ).addEventListener("click",()=>{

            location.hash =
            item.name
            .toLowerCase();

        });

        // SHARE BUTTON
        card.querySelector(
            ".share-btn"
        ).addEventListener("click",()=>{

            const shareURL =

            window.location.origin +

            window.location.pathname +

            "#" +

            item.name
            .toLowerCase();

            navigator.clipboard
            .writeText(shareURL);

            alert(
                "Copied Link:\n\n" +
                shareURL
            );

        });

        container.appendChild(card);

    });

}

// HASH FUNCTION
function openFromHash(){

    const hash =
    location.hash
    .replace("#","")
    .trim()
    .toLowerCase();

    // NO HASH
    if(!hash){

        render(websiteDB);

        return;

    }

    // ONLY MATCH
    const filtered =
    websiteDB.filter(item=>

        item.name
        .toLowerCase()
        === hash

    );

    render(filtered);

}

// SHOW ALL
profileIcon.addEventListener("click",()=>{

    location.hash = "";

    input.value = "";

    render(websiteDB);

});

// HASH CHANGE
window.addEventListener(
    "hashchange",
    openFromHash
);

// START
initEngine();
